import { Entity, CollaborationRequest, RegistrationApplication, PaymentReceipt, EntityType } from '../types';
import { INITIAL_ENTITIES, INITIAL_COLLAB_REQUESTS, INITIAL_REGISTRATIONS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

class DataService {
  private localEntities: Entity[] = [...INITIAL_ENTITIES];
  private localCollabs: CollaborationRequest[] = [...INITIAL_COLLAB_REQUESTS];
  private localApplications: RegistrationApplication[] = [...INITIAL_REGISTRATIONS];
  private localPayments: PaymentReceipt[] = [];

  // ==========================================
  // 1. ENTITY & DIRECTORY OPERATIONS
  // ==========================================

  async getApprovedEntities(typeFilter?: EntityType | 'all', searchKeyword?: string): Promise<Entity[]> {
    if (isSupabaseConfigured) {
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
    if (isSupabaseConfigured) {
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

    if (isSupabaseConfigured) {
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
          verified: true,
          verificationStatus: 'approved',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
          bio: app.details || 'Baru bergabung dalam Ekosistem KIRI Bali.',
          location: app.city || 'Bali, Indonesia',
          stats: [{ label: 'Members', value: '1' }],
          tags: [app.category, 'Verified']
        };
        this.localEntities.unshift(newEntity);
      }
    }

    return true;
  }

  // ==========================================
  // 3. COLLABORATION ENGINE PIPELINE
  // ==========================================

  async submitCollaborationRequest(req: Omit<CollaborationRequest, 'id' | 'trackingCode' | 'createdAt' | 'status'>): Promise<CollaborationRequest> {
    const newReq: CollaborationRequest = {
      ...req,
      id: `collab-${Date.now()}`,
      trackingCode: `KR-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'submitted',
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('collaboration_requests').insert([{
          project_title: req.title,
          project_description: req.scope,
          budget_range: req.budget,
          timeline: req.timeline,
          deliverables: req.deliverables,
          status: 'pending'
        }]);
      } catch (err) {
        console.warn('Supabase collab insert failed:', err);
      }
    }

    this.localCollabs.unshift(newReq);
    return newReq;
  }

  async getMyCollaborations(entityId: string): Promise<CollaborationRequest[]> {
    return this.localCollabs.filter(c => c.requesterId === entityId || c.targetId === entityId);
  }

  // ==========================================
  // 4. MANUAL PAYMENT & MEMBERSHIP PIPELINE
  // ==========================================

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
      stats: raw.stats || [],
      tags: raw.tags || [],
      lookingFor: raw.looking_for || [],
      membersCount: raw.members_count || 0,
      featured: raw.featured || false
    };
  }
}

export const dataService = new DataService();
