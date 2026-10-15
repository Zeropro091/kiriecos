/**
 * KIRI PROJECT — data access layer (backend-backed).
 *
 * Previously this read/wrote localStorage directly, which meant every
 * authorization decision ran in the browser and could be bypassed. It now
 * proxies to the KIRI API; the server owns persistence and enforces access
 * rules. Method names are unchanged so pages did not need rewrites.
 */

import {
  Entity,
  CollaborationRequest,
  RegistrationApplication,
  PaymentReceipt,
  CommunityMember,
  BroadcastMessage,
} from '../types';
import { api, ApiError } from '../lib/api';

function isForbidden(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 401 || err.status === 403);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Gagal membaca berkas.'));
    reader.readAsDataURL(file);
  });
}

class DataService {
  // ==========================================
  // 1. ENTITY DIRECTORY
  // ==========================================

  async getApprovedEntities(typeFilter?: string, searchKeyword?: string): Promise<Entity[]> {
    const params = new URLSearchParams();
    if (typeFilter && typeFilter !== 'all') params.set('type', typeFilter);
    if (searchKeyword?.trim()) params.set('search', searchKeyword.trim());
    const qs = params.toString();
    const res = await api.get<{ entities: Entity[] }>(`/entities${qs ? `?${qs}` : ''}`);
    return res.entities;
  }

  async getEntityById(id: string): Promise<Entity | undefined> {
    try {
      const res = await api.get<{ entity: Entity }>(`/entities/${id}`);
      return res.entity;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return undefined;
      throw err;
    }
  }

  async updateEntity(id: string, updates: Partial<Entity>): Promise<Entity> {
    const res = await api.patch<{ entity: Entity }>(`/entities/${id}`, {
      name: updates.name,
      handle: updates.handle,
      category: updates.category,
      bio: updates.bio,
      location: updates.location,
      website: updates.website,
    });
    return res.entity;
  }

  /** Admin-only on the server; returns [] for unauthenticated/unauthorised callers. */
  async getPendingEntities(): Promise<Entity[]> {
    try {
      const res = await api.get<{ entities: Entity[] }>('/entities?status=pending_review');
      return res.entities;
    } catch (err) {
      if (isForbidden(err)) return [];
      throw err;
    }
  }

  // ==========================================
  // 2. REGISTRATION & ADMIN REVIEW
  // ==========================================

  async submitRegistration(
    app: Omit<RegistrationApplication, 'id' | 'status' | 'submittedAt'>
  ): Promise<RegistrationApplication> {
    const res = await api.post<{ registration: RegistrationApplication }>('/registrations', app);
    return res.registration;
  }

  async reviewEntity(
    entityId: string,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<boolean> {
    try {
      await api.post(`/entities/${entityId}/verify`, {
        status: action === 'approve' ? 'approved' : 'rejected',
        rejectionReason: reason,
      });
      return true;
    } catch {
      return false;
    }
  }

  // ==========================================
  // 3. COLLABORATION REQUESTS
  // ==========================================

  async submitCollaboration(collab: Partial<CollaborationRequest>): Promise<CollaborationRequest> {
    const res = await api.post<{ collaboration: CollaborationRequest }>('/collaborations', collab);
    return res.collaboration;
  }

  async getCollaborationRequests(): Promise<CollaborationRequest[]> {
    const res = await api.get<{ collaborations: CollaborationRequest[] }>('/collaborations');
    return res.collaborations;
  }

  async updateCollaboration(
    id: string,
    updates: { status?: CollaborationRequest['status']; adminNotes?: string; matchedTalentName?: string }
  ): Promise<CollaborationRequest> {
    const res = await api.patch<{ collaboration: CollaborationRequest }>(`/collaborations/${id}`, updates);
    return res.collaboration;
  }

  // ==========================================
  // 4. MEDIA UPLOADS (encoded client-side, stored server-side)
  // ==========================================

  async uploadMedia(file: File): Promise<string> {
    return fileToDataUrl(file);
  }

  async uploadReceiptImage(file: File): Promise<string> {
    return fileToDataUrl(file);
  }

  // ==========================================
  // 5. PAYMENT RECEIPTS
  // ==========================================

  async submitPaymentReceipt(
    receipt: Omit<PaymentReceipt, 'id' | 'status' | 'submittedAt'>
  ): Promise<PaymentReceipt> {
    const res = await api.post<{ payment: PaymentReceipt }>('/payments', {
      tier: receipt.tier,
      amount: receipt.amount,
      bankName: receipt.bankName,
      senderAccountName: receipt.senderAccountName,
      entityId: receipt.entityId,
      receiptImageDataUrl: receipt.receiptImageUrl,
    });
    return res.payment;
  }

  async getPendingPayments(): Promise<PaymentReceipt[]> {
    try {
      const res = await api.get<{ payments: PaymentReceipt[] }>('/payments?status=pending_verification');
      return res.payments;
    } catch (err) {
      if (isForbidden(err)) return [];
      throw err;
    }
  }

  async getAllPayments(): Promise<PaymentReceipt[]> {
    const res = await api.get<{ payments: PaymentReceipt[] }>('/payments');
    return res.payments;
  }

  async signReceipt(path: string): Promise<string> {
    return path;
  }

  async verifyPayment(id: string, action: 'verify' | 'reject', adminNotes?: string): Promise<boolean> {
    try {
      await api.patch(`/payments/${id}`, { action, adminNotes });
      return true;
    } catch {
      return false;
    }
  }

  // ==========================================
  // 6. COMMUNITY MEMBERS
  // ==========================================

  async getMembers(entityId?: string): Promise<CommunityMember[]> {
    const res = await api.get<{ members: CommunityMember[] }>(
      `/members${entityId ? `?entityId=${encodeURIComponent(entityId)}` : ''}`
    );
    return res.members;
  }

  async addMember(member: Partial<CommunityMember>): Promise<CommunityMember> {
    const res = await api.post<{ member: CommunityMember }>('/members', member);
    return res.member;
  }

  async updateMemberStatus(id: string, status: CommunityMember['status']): Promise<boolean> {
    try {
      await api.patch(`/members/${id}`, { status });
      return true;
    } catch {
      return false;
    }
  }

  async deleteMember(id: string): Promise<boolean> {
    try {
      await api.delete(`/members/${id}`);
      return true;
    } catch {
      return false;
    }
  }

  // ==========================================
  // 7. BROADCAST MESSAGES
  // ==========================================

  async getBroadcasts(): Promise<BroadcastMessage[]> {
    const res = await api.get<{ broadcasts: BroadcastMessage[] }>('/broadcasts');
    return res.broadcasts;
  }

  async sendBroadcast(input: {
    scope: 'indonesia' | 'regional';
    region?: string;
    content: string;
  }): Promise<BroadcastMessage> {
    const res = await api.post<{ broadcast: BroadcastMessage }>('/broadcasts', input);
    return res.broadcast;
  }

  async likeBroadcast(id: string): Promise<BroadcastMessage | undefined> {
    try {
      const res = await api.post<{ broadcast: BroadcastMessage }>(`/broadcasts/${id}/like`);
      return res.broadcast;
    } catch {
      return undefined;
    }
  }
}

export const dataService = new DataService();
