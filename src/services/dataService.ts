import { Entity, CollaborationRequest, RegistrationApplication, PaymentReceipt, EntityType } from '../types';
import { INITIAL_ENTITIES, INITIAL_COLLAB_REQUESTS, INITIAL_REGISTRATIONS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

class DataService {
  private localEntities: Entity[] = [...INITIAL_ENTITIES];
  private localCollabs: CollaborationRequest[] = [...INITIAL_COLLAB_REQUESTS];
  private localApplications: RegistrationApplication[] = [...INITIAL_REGISTRATIONS];
  private localPayments: PaymentReceipt[] = [];

  // ==========================================
  // 1. ENTITY DIRECTORY (Public & Filtered)
  // ==========================================

  async getApprovedEntities(typeFilter?: string, searchKeyword?: string): Promise<Entity[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('entities')
          .select('*')
          .eq('verification_status', 'approved');

        if (typeFilter && typeFilter !== 'all') {
          query = query.eq('type', typeFilter);
        }

        if (searchKeyword && searchKeyword.trim()) {
          query = query.or(`name.ilike.%${searchKeyword}%,bio.ilike.%${searchKeyword}%,category.ilike.%${searchKeyword}%`);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map(item => this.mapSupabaseEntity(item));
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
    if (isSupabaseConfigured && supabase) {
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

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('entities').insert([{
          name: app.name,
          type: app.type,
          category: app.category,
          handle: `@${app.name.toLowerCase().replace(/\s+/g, '_')}`,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          cover_image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
          bio: app.details,
          location: app.city || 'Bali, Indonesia',
          verification_status: 'pending_review'
        }]);
      } catch (err) {
        console.warn('Supabase registration insert failed:', err);
      }
    }

    this.localApplications.unshift(newApp);
    return newApp;
  }

  async getPendingApplications(): Promise<RegistrationApplication[]> {
    return this.localApplications.filter(a => a.status === 'pending');
  }

  async reviewApplication(id: string, action: 'approve' | 'reject', reason?: string): Promise<boolean> {
    const app = this.localApplications.find(a => a.id === id);
    if (!app) return false;

    app.status = action === 'approve' ? 'approved' : 'rejected';
    if (reason) app.rejectionReason = reason;

    if (action === 'approve') {
      // Create or update approved entity
      const existingEntity = this.localEntities.find(e => e.name === app.name);
      if (existingEntity) {
        existingEntity.verified = true;
        existingEntity.verificationStatus = 'approved';
      } else {
        const newEntity: Entity = {
          id: `ent-${Date.now()}`,
          type: app.type,
          name: app.name,
          handle: `@${app.name.toLowerCase().replace(/\s+/g, '_')}`,
          category: app.category,
          badge: 'Verified Member',
          verified: true,
          verificationStatus: 'approved',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
          bio: app.details,
          location: app.city || 'Bali, Indonesia',
          stats: [
            { label: 'Kolaborasi Aktif', value: '1' },
            { label: 'Rating Komunitas', value: '5.0' }
          ],
          tags: [app.category, 'Verified']
        };
        this.localEntities.unshift(newEntity);
      }
    }

    return true;
  }

  // ==========================================
  // 3. COLLABORATION REQUESTS
  // ==========================================

  async submitCollaboration(collab: Omit<CollaborationRequest, 'id' | 'status' | 'createdAt' | 'trackingCode'>): Promise<CollaborationRequest> {
    const newCollab: CollaborationRequest = {
      ...collab,
      id: `collab-${Date.now()}`,
      trackingCode: `KP-COL-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'submitted',
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('collaboration_requests').insert([{
          tracking_code: newCollab.trackingCode,
          title: newCollab.title,
          category: newCollab.category,
          requester_id: newCollab.requesterId,
          target_id: newCollab.targetId,
          budget: newCollab.budget,
          timeline: newCollab.timeline,
          scope: newCollab.scope,
          deliverables: newCollab.deliverables,
          status: 'pending'
        }]);
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
  // 4. MANUAL PAYMENT & RECEIPT VERIFICATION
  // ==========================================

  async uploadReceiptImage(file: File): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      try {
        const ext = file.name.split('.').pop() || 'jpg';
        const filePath = `receipts/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, file, { upsert: false });

        if (!uploadError) {
          const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);
          return data.publicUrl;
        } else {
          console.warn('Supabase storage upload error:', uploadError);
        }
      } catch (err) {
        console.warn('Storage upload exception:', err);
      }
    }
    // Fallback: create an object URL for preview/local testing
    return URL.createObjectURL(file);
  }

  async submitPaymentReceipt(receipt: Omit<PaymentReceipt, 'id' | 'status' | 'submittedAt'>): Promise<PaymentReceipt> {
    const newReceipt: PaymentReceipt = {
      ...receipt,
      id: `pay-${Date.now()}`,
      status: 'pending_verification',
      submittedAt: new Date().toISOString().split('T')[0]
    };

    this.localPayments.unshift(newReceipt);
    return newReceipt;
  }

  async getPendingPayments(): Promise<PaymentReceipt[]> {
    return this.localPayments.filter(p => p.status === 'pending_verification');
  }

  async verifyPayment(id: string, action: 'verify' | 'reject', adminNotes?: string): Promise<boolean> {
    const payment = this.localPayments.find(p => p.id === id);
    if (!payment) return false;

    payment.status = action === 'verify' ? 'verified' : 'rejected';
    if (adminNotes) payment.adminNotes = adminNotes;

    return true;
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
