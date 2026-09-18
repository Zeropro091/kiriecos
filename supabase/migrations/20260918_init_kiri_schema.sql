-- ==============================================================================
-- KIRI PROJECT - SUPABASE PRODUCTION DATABASE SCHEMA MIGRATION
-- Scale Target: 2,000 - 5,000 Active Members in Bali Ecosystem
-- ==============================================================================

-- 0. SUPABASE STORAGE BUCKETS SETUP & SECURITY
-- Bucket for payment receipts, avatars, and portfolio proof
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('receipts', 'receipts', false),
  ('avatars', 'avatars', true),
  ('portfolios', 'portfolios', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public avatars are viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Public portfolios are viewable by everyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolios');

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Full text & fuzzy matching for Bali Directory

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('creator', 'community_lead', 'umkm_owner', 'media_partner', 'strategic_partner', 'admin', 'guest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE entity_type AS ENUM ('creator', 'community', 'business', 'media', 'strategic');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending_review', 'approved', 'rejected', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE membership_tier AS ENUM ('free', 'pro', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE collaboration_status AS ENUM ('pending', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending_verification', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'creator'::user_role NOT NULL,
    membership_tier membership_tier DEFAULT 'free'::membership_tier NOT NULL,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. ENTITIES TABLE (Creator, Community, UMKM, Media, Strategic Partner)
CREATE TABLE IF NOT EXISTS public.entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type entity_type NOT NULL,
    name TEXT NOT NULL,
    handle TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    badge TEXT,
    verification_status verification_status DEFAULT 'pending_review'::verification_status NOT NULL,
    avatar TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    bio TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT 'Bali, Indonesia',
    website TEXT,
    instagram TEXT,
    tiktok TEXT,
    youtube TEXT,
    featured BOOLEAN DEFAULT false NOT NULL,
    members_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    stats JSONB DEFAULT '[]'::JSONB,
    looking_for TEXT[] DEFAULT ARRAY[]::TEXT[],
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. PORTFOLIO ITEMS
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('video', 'photo', 'campaign', 'article')),
    image_url TEXT NOT NULL,
    caption TEXT,
    views TEXT,
    likes TEXT,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. SERVICE RATES & OFFERINGS
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    description TEXT NOT NULL,
    deliverables TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. COMMUNITY MEMBERS (For Community-type Entities)
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'New Member',
    category TEXT NOT NULL,
    avatar TEXT NOT NULL,
    email TEXT,
    joined_date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. COLLABORATION REQUESTS & BRIEFS
CREATE TABLE IF NOT EXISTS public.collaboration_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES public.entities(id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES public.entities(id) ON DELETE SET NULL,
    project_title TEXT NOT NULL,
    project_description TEXT NOT NULL,
    budget_range TEXT,
    timeline TEXT,
    deliverables TEXT[] DEFAULT ARRAY[]::TEXT[],
    status collaboration_status DEFAULT 'pending'::collaboration_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. PAYMENT RECEIPTS (Manual Bank Transfer Verification)
CREATE TABLE IF NOT EXISTS public.payment_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    entity_id UUID REFERENCES public.entities(id) ON DELETE SET NULL,
    tier membership_tier NOT NULL DEFAULT 'pro',
    amount NUMERIC(12, 2) NOT NULL,
    bank_name TEXT NOT NULL,
    sender_account_name TEXT NOT NULL,
    receipt_image_url TEXT NOT NULL,
    status payment_status DEFAULT 'pending_verification'::payment_status NOT NULL,
    admin_notes TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- 10. INDEXING STRATEGY (High-Speed Directory Filtering for 2000+ Members)
-- ==============================================================================

-- Index for public directory fast query (status + type + category)
CREATE INDEX IF NOT EXISTS idx_entities_directory_lookup 
ON public.entities (verification_status, type, category);

-- GIN index for tag filtering
CREATE INDEX IF NOT EXISTS idx_entities_tags_gin 
ON public.entities USING GIN (tags);

-- Trigram index for fuzzy text search on entity name & bio
CREATE INDEX IF NOT EXISTS idx_entities_name_trgm 
ON public.entities USING GIN (name gin_trgm_ops);

-- Collaboration query indices
CREATE INDEX IF NOT EXISTS idx_collab_sender ON public.collaboration_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_collab_receiver ON public.collaboration_requests(receiver_id);

-- Payment status index
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payment_receipts(status);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- ENTITIES POLICIES ---
-- 1. Public can view approved entities
CREATE POLICY "Public can view approved entities" 
ON public.entities FOR SELECT 
USING (verification_status = 'approved' OR user_id = auth.uid() OR public.is_admin());

-- 2. Authenticated user can create an entity registration
CREATE POLICY "Users can insert own entity" 
ON public.entities FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Owner or Admin can update entity
CREATE POLICY "Owners or Admin can update entity" 
ON public.entities FOR UPDATE 
USING (auth.uid() = user_id OR public.is_admin());

-- --- COLLABORATION POLICIES ---
-- Participants and Admin can view collaboration requests
CREATE POLICY "Collaboration participants can view requests" 
ON public.collaboration_requests FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.entities WHERE id = sender_id AND user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.entities WHERE id = receiver_id AND user_id = auth.uid()) OR
  public.is_admin()
);

-- Sender can insert collaboration request
CREATE POLICY "Authenticated users can create collaboration request" 
ON public.collaboration_requests FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.entities WHERE id = sender_id AND user_id = auth.uid())
);

-- --- PAYMENT POLICIES ---
-- User can view their own payments, Admin can view all
CREATE POLICY "Users and Admin can view payments" 
ON public.payment_receipts FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin());

-- User can upload payment receipt
CREATE POLICY "Users can upload receipt" 
ON public.payment_receipts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admin can update payment receipt status
CREATE POLICY "Admin can update payment receipt" 
ON public.payment_receipts FOR UPDATE 
USING (public.is_admin());

-- --- OPEN REGISTRATION POLICIES (LAUNCH) ---
-- The frontend submits with the anon key (no Supabase Auth session yet).
-- Moderation happens AFTER insert (status stays 'pending_review'), so open
-- inserts are gated to pending states only. Tighten these once Supabase Auth
-- is wired into Login/Register flows.

CREATE POLICY "Anyone can submit pending entity registration" 
ON public.entities FOR INSERT 
WITH CHECK (verification_status = 'pending_review');

CREATE POLICY "Anyone can submit pending collaboration request" 
ON public.collaboration_requests FOR INSERT 
WITH CHECK (status = 'pending');

CREATE POLICY "Anyone can submit pending payment receipt" 
ON public.payment_receipts FOR INSERT 
WITH CHECK (status = 'pending_verification');

-- --- STORAGE UPLOAD POLICIES (LAUNCH) ---
-- Without INSERT grants on storage.objects every upload 403s, even on public buckets.

CREATE POLICY "Anyone can upload receipts" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Anyone can upload avatars" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload portfolios" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'portfolios');

-- ==============================================================================
-- 12. AUTOMATED TIMESTAMPS TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_entities_updated
  BEFORE UPDATE ON public.entities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_collab_updated
  BEFORE UPDATE ON public.collaboration_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
