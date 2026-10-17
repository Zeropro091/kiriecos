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

export type LandingOrderStatus = 'pending' | 'in_review' | 'in_progress' | 'done' | 'rejected';

export interface MemberCardRow {
  id: string;
  profile_id: string;
  card_number: string;
  tier: string;
  issued_at: string;
  expires_at: string | null;
  status: string;
}

export interface LandingPageOrderRow {
  id: string;
  profile_id: string;
  template_id: string;
  custom_notes: string;
  status: LandingOrderStatus;
  admin_note: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRow {
  id: string;
  thread_profile_id: string;
  sender_role: 'member' | 'admin';
  sender_profile_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export interface ChatThreadSummaryRow {
  profile_id: string;
  profile_name: string;
  profile_email: string;
  unread_count: string | number;
}

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
