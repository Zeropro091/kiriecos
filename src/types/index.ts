export type PageId =
  | 'page-01-home'
  | 'page-02-directory'
  | 'page-03-community-profile'
  | 'page-04-creator-profile'
  | 'page-05-business-profile'
  | 'page-06-media-profile'
  | 'page-07-partner-profile'
  | 'page-08-join-select'
  | 'page-09-register-creator'
  | 'page-10-register-community'
  | 'page-11-register-business'
  | 'page-12-register-media'
  | 'page-13-register-partner'
  | 'page-14-membership-payment'
  | 'page-15-login'
  | 'page-16-dashboard-user'
  | 'page-17-profile-editor'
  | 'page-18-dashboard-community'
  | 'page-19-community-members'
  | 'page-20-collab-request-modal'
  | 'page-21-collab-brief-form'
  | 'page-22-collab-success'
  | 'page-23-my-collaborations'
  | 'page-24-login-admin'
  | 'page-25-dashboard-admin'
  | 'page-26-admin-reviews'
  | 'page-27-request-flowchart';

export type EntityType = 'creator' | 'community' | 'business' | 'media' | 'strategic';

export type UserRole = 'creator' | 'community_lead' | 'umkm_owner' | 'media_partner' | 'admin' | 'guest';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  entityType?: EntityType;
  entityId?: string;
  avatar: string;
  membershipTier: string;
  isVerified: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  type: 'video' | 'photo' | 'campaign' | 'article';
  imageUrl: string;
  caption?: string;
  views?: string;
  likes?: string;
  link?: string;
}

export interface ServiceRate {
  id: string;
  name: string;
  price: string;
  description: string;
  deliverables: string[];
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  handle: string;
  category: string;
  badge?: string;
  verified: boolean;
  avatar: string;
  coverImage: string;
  bio: string;
  location: string;
  website?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  stats: {
    label: string;
    value: string;
  }[];
  tags: string[];
  portfolio?: PortfolioItem[];
  services?: ServiceRate[];
  lookingFor?: string[];
  membersCount?: number;
  featured?: boolean;
}

export interface CommunityMember {
  id: string;
  name: string;
  role: 'Leader' | 'Core Team' | 'Active Creator' | 'Contributor' | 'New Member';
  category: string;
  avatar: string;
  joinedDate: string;
  email: string;
  instagram: string;
  status: 'active' | 'pending' | 'inactive';
}

export interface CollaborationRequest {
  id: string;
  trackingCode: string;
  title: string;
  category: string;
  requesterId: string;
  requesterName: string;
  requesterType: EntityType;
  targetId: string;
  targetName: string;
  targetType: EntityType;
  budget: string;
  timeline: string;
  scope: string;
  deliverables: string[];
  status: 'submitted' | 'in_review' | 'matched' | 'connected' | 'in_progress' | 'completed';
  createdAt: string;
  adminNotes?: string;
  matchedTalentName?: string;
}

export interface RegistrationApplication {
  id: string;
  type: EntityType;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  category: string;
  socialLink: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}
