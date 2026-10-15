export type UserRole =
  | 'creator'
  | 'community_lead'
  | 'umkm_owner'
  | 'media_partner'
  | 'strategic_partner'
  | 'admin'
  | 'guest';

export type EntityType = 'creator' | 'community' | 'business' | 'media' | 'strategic';

export type VerificationStatus = 'pending_review' | 'approved' | 'rejected' | 'suspended';

export type CollaborationStatus =
  | 'submitted'
  | 'in_review'
  | 'matched'
  | 'connected'
  | 'in_progress'
  | 'completed';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export type PaymentStatus = 'pending_verification' | 'verified' | 'rejected';

export type BroadcastScope = 'indonesia' | 'regional';

export interface ProfileRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  entity_type: EntityType | null;
  entity_id: string | null;
  avatar: string;
  membership_tier: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  entityType?: EntityType;
  entityId?: string;
  avatar: string;
  membershipTier: string;
  isVerified: boolean;
}

export interface AuthClaims {
  sub: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
    }
  }
}
