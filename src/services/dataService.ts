import { Entity, CollaborationRequest, RegistrationApplication, PaymentReceipt, EntityType } from '../types';
import { INITIAL_ENTITIES, INITIAL_COLLAB_REQUESTS, INITIAL_REGISTRATIONS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { compressImage } from '../utils/imageCompressor';

/**
 * Generate a URL-safe unique handle from an entity name.
 * Appends a short random suffix so duplicate names never collide
 * (schema: entities.handle is UNIQUE — a bare name-based handle
 * makes the second registration fail silently).
 */
function makeHandle(name: string): string {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'entity';
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}_${suffix}`.substring(0, 40);
}

/** Escape user input for PostgREST `or()` filters (commas/parens/wildcards break the parser). */
function escapeOrFilter(input: string): string {
  return input.trim().replace(/[%_(),*]/g, (m) => `\\${m}`);
}

class DataService {
  private localEntities: Entity[] = [...INITIAL_ENTITIES];
  private localCollabs: CollaborationRequest[] = [...INITIAL_COLLAB_REQUESTS];
  private localApplications: RegistrationApplication[] = [...INITIAL_REGISTRATIONS];
  private localPayments: PaymentReceipt[] = [];

  /** True when Supabase is wired up — callers use this to warn users on sync failure. */
  get remoteEnabled(): boolean {
    return isSupabaseConfigured && !!supabase;
  }

  // ==========================================
  // 1. ENTITY DIRECTORY (Public & Filtered)
  // ==========================================

  async getApprovedEntities(typeFilter?: string, searchKeyword?: string): Promise<Entity[]> {
    if (this.remoteEnabled && supabase) {
      try {
        let query = supabase
          .from('entities')
          .select('*')
          .eq('verification_status', 'approved');

        if (typeFilter && typeFilter !== 'all') {
          query = query.eq('type', typeFilter);
        }

        if (searchKeyword && searchKeyword.trim()) {
          const kw = escapeOrFilter(searchKeyword);
          query = query.or(`name.ilike.%${kw}%,bio.ilike.%${kw}%,category.ilike.%${kw}%`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map(item => this.mapSupabaseEntity(item));
        }
        if (error) {
          console.error('Supabase directory query error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase query failed, falling back to local store:', err);
      }
    }

    // Fallback Local Filtering
    return this.localEntities.filter(e => {
      const isApproved = e.verificationStatus ? e.verificationStatus === 'approved' : true;
      const matchesType = !typeFilter || typeFilter === 'all' || e.type === typeFilter;
      const matchesSearch = !searchKeyword || 
        e.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        e.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        e.bio.toLowerCase().includes(searchKeyword.toLowerCase());
      return isApproved && matchesType && matchesSearch;
    });
  }

  async getEntityById(id: string): Promise<Entity | undefined> {
    if (this.remoteEnabled && supabase) {
      try {
        const { data, error } = await supabase.from('entities').select('*').eq('id', id).single();
        if (!error && data) return this.mapSupabaseEntity(data);
      } catch (err) {
        console.warn('Supabase fetch entity failed:', err);
      }
    }
    return this.localEntities.find(e => e.id === id);
  }

  // ==========================================
  // 2. REGISTRATION & ADMIN REVIEW PIPELINE
  // ==========================================

  async submitRegistration(app: Omit<RegistrationApplication, 'id' | 'status' | 'submittedAt'>): Promise<RegistrationApplication> {
    const newApp: RegistrationApplication = {
      ...app,
      id: `app-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0]
    };

    if (this.remoteEnabled && supabase) {
      try {
        const { error: insertError } = await supabase.from('entities').insert([{
          type: app.type,
          name: app.name,
          handle: makeHandle(app.name),
          category: app.category,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          cover_image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
          bio: app.details,
          location: app.city || 'Bali, Indonesia',
          instagram: app.socialLink || null,
          verification_status: 'pending_review'
        }]);
        if (insertError) {
          console.error('Supabase registration insert error:', insertError.message);
          newApp.syncError = true;
        }
      } catch (err) {
        console.warn('Supabase registration insert failed:', err);
        newApp.syncError = true;
      }
    }

    this.localApplications.unshift(newApp);
    return newApp;
  }

  /** Fetch pending registrations straight from Supabase (admin review queue). */
  async getPendingEntities(): Promise<Entity[]> {
    if (this.remoteEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('entities')
          .select('*')
          .in('verification_status', ['pending_review', 'rejected'])
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map(item => this.mapSupabaseEntity(item));
        }
        if (error) console.error('Supabase pending entities error:', error.message);
      } catch (err) {
        console.warn('Supabase pending entities failed:', err);
      }
    }
    return this.localApplications
      .filter(a => a.status === 'pending')
      .map(a => this.applicationToEntity(a));
  }

  /**
   * Admin moderation — persists to Supabase. `approve` flips
   * verification_status to 'approved', which the directory RLS
   * policy requires before the entity becomes publicly visible.
   */
  async reviewEntity(entityId: string, action: 'approve' | 'reject', reason?: string): Promise<boolean> {
    if (this.remoteEnabled && supabase) {
      try {
        const { error } = await supabase
          .from('entities')
          .update({
            verification_status: action === 'approve' ? 'approved' : 'rejected',
            rejection_reason: action === 'reject' ? (reason || 'Tidak memenuhi kriteria kurasi KIRI.') : null
          })
          .eq('id', entityId);
        if (error) {
          console.error('Supabase review entity error:', error.message);
          return false;
        }
        return true;
      } catch (err) {
        console.error('Supabase review entity failed:', err);
        return false;
      }
    }
    // Local fallback: flip mock application status
    const app = this.localApplications.find(a => a.id === entityId || a.name === entityId);
    if (app) {
      app.status = action === 'approve' ? 'approved' : 'rejected';
      if (reason) app.rejectionReason = reason;
      if (action === 'approve') {
        const existing = this.localEntities.find(e => e.name === app.name);
        if (existing) {
          existing.verified = true;
          existing.verificationStatus = 'approved';
        } else {
          this.localEntities.unshift(this.applicationToEntity(app));
        }
      }
    }
    return true;
  }

  private applicationToEntity(app: RegistrationApplication): Entity {
    return {
      id: app.id,
      type: app.type,
      name: app.name,
      handle: makeHandle(app.name),
      category: app.category,
      verified: false,
      verificationStatus: 'pending_review',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
      bio: app.details,
      location: app.city || 'Bali, Indonesia',
      stats: [{ label: 'Kolaborasi Aktif', value: '0' }],
      tags: [app.category]
    };
  }

  // ==========================================
  // 3. COLLABORATION REQUESTS
  // ==========================================

  async submitCollaboration(collab: Partial<CollaborationRequest>): Promise<CollaborationRequest> {
    const newCollab: CollaborationRequest = {
      ...(collab as CollaborationRequest),
      id: `collab-${Date.now()}`,
      trackingCode: `KP-COL-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'submitted',
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (this.remoteEnabled && supabase) {
      try {
        const { error: insertError } = await supabase.from('collaboration_requests').insert([{
          project_title: newCollab.title,
          project_description: newCollab.scope || 'Brief kolaborasi KIRI Project',
          budget_range: newCollab.budget,
          timeline: newCollab.timeline,
          deliverables: Array.isArray(newCollab.deliverables) ? newCollab.deliverables : [],
          status: 'pending'
        }]);
        if (insertError) {
          console.error('Supabase collab insert error:', insertError.message);
        }
      } catch (err) {
        console.warn('Supabase collab insert failed:', err);
      }
    }

    this.localCollabs.unshift(newCollab);
    return newCollab;
  }

  async getCollaborationRequests(): Promise<CollaborationRequest[]> {
    return this.localCollabs;
  }

  // ==========================================
  // 4. MANUAL PAYMENT & RECEIPT VERIFICATION (WITH AUTO-COMPRESSION)
  // ==========================================

  async uploadReceiptImage(file: File): Promise<string> {
    // 1. Auto compress receipt before uploading to optimize bandwidth
    const compressedBlob = await compressImage(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      outputFormat: 'image/webp'
    });

    if (this.remoteEnabled && supabase) {
      try {
        const filePath = `receipts/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.webp`;
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, compressedBlob, { 
            contentType: 'image/webp',
            upsert: false 
          });

        if (!uploadError) {
          // receipts bucket is PRIVATE — getPublicUrl returns a dead link.
          // Signed URLs are also what the admin review page uses to view the proof.
          const { data, error: signError } = await supabase.storage
            .from('receipts')
            .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7-day link
          if (!signError && data) return data.signedUrl;
          console.error('Signed URL error:', signError?.message);
          return filePath; // fallback: return path so admin can re-sign later
        } else {
          console.error('Supabase storage upload error:', uploadError.message);
          throw uploadError; // surface to caller — payment proof must not be silently lost
        }
      } catch (err) {
        console.error('Storage upload exception:', err);
        throw err;
      }
    }
    // Fallback: create an object URL for preview/local testing
    return URL.createObjectURL(compressedBlob);
  }

  async uploadMedia(file: File, folder: 'avatars' | 'portfolios' | 'covers' = 'portfolios'): Promise<string> {
    const isAvatar = folder === 'avatars';
    const compressedBlob = await compressImage(file, {
      maxWidth: isAvatar ? 600 : 1600,
      maxHeight: isAvatar ? 600 : 1600,
      quality: isAvatar ? 0.85 : 0.8,
      outputFormat: 'image/webp'
    });

    if (this.remoteEnabled && supabase) {
      try {
        // Bucket names must match supabase/migrations schema: avatars | portfolios
        const bucket = folder === 'avatars' ? 'avatars' : 'portfolios';
        const filePath = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.webp`;
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, compressedBlob, {
            contentType: 'image/webp',
            upsert: false
          });

        if (!uploadError) {
          const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
          return data.publicUrl;
        } else {
          console.error('Supabase storage upload error:', uploadError.message);
        }
      } catch (err) {
        console.warn('Media upload error:', err);
      }
    }
    return URL.createObjectURL(compressedBlob);
  }

  async submitPaymentReceipt(receipt: Omit<PaymentReceipt, 'id' | 'status' | 'submittedAt'>): Promise<PaymentReceipt> {
    const newReceipt: PaymentReceipt = {
      ...receipt,
      id: `pay-${Date.now()}`,
      status: 'pending_verification',
      submittedAt: new Date().toISOString().split('T')[0]
    };

    this.localPayments.unshift(newReceipt);

    // Persist to Supabase (schema: payment_receipts — user_id nullable for anon soft launch)
    if (this.remoteEnabled && supabase) {
      try {
        const { error } = await supabase.from('payment_receipts').insert([{
          tier: receipt.tier === 'enterprise' ? 'enterprise' : (receipt.tier === 'pro' ? 'pro' : 'free'),
          amount: receipt.amount,
          bank_name: receipt.bankName,
          sender_account_name: receipt.senderAccountName,
          receipt_image_url: receipt.receiptImageUrl,
          status: 'pending_verification'
        }]);
        if (error) {
          console.error('Supabase payment insert error:', error.message);
          newReceipt.syncError = true;
        }
      } catch (err) {
        console.warn('Supabase payment insert failed:', err);
        newReceipt.syncError = true;
      }
    }

    return newReceipt;
  }

  /** Admin queue — pulls pending receipts from Supabase, falls back to in-memory. */
  async getPendingPayments(): Promise<PaymentReceipt[]> {
    if (this.remoteEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('payment_receipts')
          .select('*')
          .eq('status', 'pending_verification')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map(item => this.mapSupabasePayment(item));
        }
        if (error) console.error('Supabase pending payments error:', error.message);
      } catch (err) {
        console.warn('Supabase pending payments failed:', err);
      }
    }
    return this.localPayments.filter(p => p.status === 'pending_verification');
  }

  /** All receipts regardless of status (admin history view). */
  async getAllPayments(): Promise<PaymentReceipt[]> {
    if (this.remoteEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('payment_receipts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        if (!error && data) {
          return data.map(item => this.mapSupabasePayment(item));
        }
        if (error) console.error('Supabase all payments error:', error.message);
      } catch (err) {
        console.warn('Supabase all payments failed:', err);
      }
    }
    return [...this.localPayments];
  }

  /** Re-sign a stored receipt path into a fresh viewable URL. */
  async signReceipt(path: string): Promise<string> {
    if (this.remoteEnabled && supabase && !path.startsWith('blob:') && !path.startsWith('http')) {
      try {
        const { data, error } = await supabase.storage.from('receipts').createSignedUrl(path, 3600);
        if (!error && data) return data.signedUrl;
      } catch (err) {
        console.warn('Receipt re-sign failed:', err);
      }
    }
    return path;
  }

  async verifyPayment(id: string, action: 'verify' | 'reject', adminNotes?: string): Promise<boolean> {
    const status = action === 'verify' ? 'verified' : 'rejected';
    if (this.remoteEnabled && supabase) {
      try {
        // Payment receipt ids come as either Supabase UUIDs or local `pay-*` ids
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          const { error } = await supabase
            .from('payment_receipts')
            .update({ status, admin_notes: adminNotes || null, verified_at: action === 'verify' ? new Date().toISOString() : null })
            .eq('id', id);
          if (error) {
            console.error('Supabase verify payment error:', error.message);
            return false;
          }
          return true;
        }
      } catch (err) {
        console.error('Supabase verify payment failed:', err);
        return false;
      }
    }
    const payment = this.localPayments.find(p => p.id === id);
    if (!payment) return false;
    payment.status = action === 'verify' ? 'verified' : 'rejected';
    if (adminNotes) payment.adminNotes = adminNotes;
    return true;
  }

  private mapSupabasePayment(raw: any): PaymentReceipt {
    return {
      id: raw.id,
      userId: raw.user_id || 'anon',
      userName: raw.sender_account_name,
      entityId: raw.entity_id || undefined,
      tier: raw.tier,
      amount: Number(raw.amount),
      bankName: raw.bank_name,
      senderAccountName: raw.sender_account_name,
      receiptImageUrl: raw.receipt_image_url,
      status: raw.status,
      adminNotes: raw.admin_notes || undefined,
      submittedAt: raw.created_at ? raw.created_at.split('T')[0] : '-'
    };
  }

  // Helper mapper for Supabase raw entity
  private mapSupabaseEntity(raw: any): Entity {
    return {
      id: raw.id,
      type: raw.type,
      name: raw.name,
      handle: raw.handle,
      category: raw.category,
      badge: raw.badge,
      verified: raw.verification_status === 'approved',
      verificationStatus: raw.verification_status,
      rejectionReason: raw.rejection_reason,
      avatar: raw.avatar,
      coverImage: raw.cover_image,
      bio: raw.bio,
      location: raw.location,
      website: raw.website,
      instagram: raw.instagram,
      tiktok: raw.tiktok,
      youtube: raw.youtube,
      stats: raw.stats || [{ label: 'Impact', value: 'Active' }],
      tags: raw.tags || [raw.category],
      membersCount: raw.members_count,
      featured: raw.featured
    };
  }
}

export const dataService = new DataService();
