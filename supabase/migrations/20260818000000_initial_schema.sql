-- Supabase Migration: 20260818000000_initial_schema.sql
-- SKY ROMs Secure Relational Schema for Supabase PostgreSQL

-------------------------------------------------------
-- 1. PROFILES TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-------------------------------------------------------
-- 2. ADMINS TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  display_name TEXT,
  username TEXT,
  role TEXT NOT NULL DEFAULT 'maintainer',
  active BOOLEAN NOT NULL DEFAULT true,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  is_super_admin BOOLEAN NOT NULL DEFAULT false,
  bio TEXT,
  avatar_url TEXT,
  github_url TEXT,
  telegram_url TEXT,
  telegram_username TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON public.admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_approval_status ON public.admins(approval_status);

-------------------------------------------------------
-- 3. DEVICES TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  codename TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL DEFAULT 'Xiaomi',
  image_url TEXT,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  maintainers JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_codename ON public.devices(codename);

-------------------------------------------------------
-- 4. ROMS TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT,
  version TEXT,
  android_version TEXT NOT NULL DEFAULT '14',
  status TEXT NOT NULL DEFAULT 'pending',
  maintainer TEXT NOT NULL,
  maintainer_url TEXT,
  maintainer_handle TEXT,
  maintainer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  url TEXT NOT NULL DEFAULT '',
  description TEXT,
  changelog JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  logo_url TEXT,
  extra_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  download_count INTEGER NOT NULL DEFAULT 0,
  stability_trends JSONB NOT NULL DEFAULT '[]'::jsonb,
  battery_efficiency INTEGER NOT NULL DEFAULT 3,
  screenshots JSONB NOT NULL DEFAULT '[]'::jsonb,
  device TEXT NOT NULL DEFAULT 'sky',
  variant TEXT,
  source_url TEXT,
  community_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roms_device ON public.roms(device);
CREATE INDEX IF NOT EXISTS idx_roms_status ON public.roms(status);

-------------------------------------------------------
-- 5. ADMIN LOGS TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_uid UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT,
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_uid ON public.admin_logs(admin_uid);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at DESC);

-------------------------------------------------------
-- 5b. FEEDBACK TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'general',
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  contact TEXT,
  device_info JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-------------------------------------------------------
-- 5c. FEEDBACK VOTES TABLE
-------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback_votes (
  feedback_id UUID NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
  voter_key TEXT NOT NULL,
  vote_type TEXT NOT NULL DEFAULT 'upvote',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (feedback_id, voter_key)
);

CREATE INDEX IF NOT EXISTS idx_feedback_votes_feedback_id ON public.feedback_votes(feedback_id);

-------------------------------------------------------
-- 6. PUBLIC TEAM MEMBERS VIEW (Safe Public Projection)
-------------------------------------------------------
CREATE OR REPLACE VIEW public.public_team_members AS
SELECT
  id,
  COALESCE(display_name, name, username) AS name,
  role,
  bio,
  avatar_url,
  github_url,
  telegram_url,
  website_url
FROM public.admins
WHERE active = true AND approval_status = 'approved';

-------------------------------------------------------
-- 7. SECURITY DEFINER HELPER FUNCTIONS
-------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_approved_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid()
      AND active = true
      AND approval_status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid()
      AND active = true
      AND approval_status = 'approved'
      AND (role = 'superadmin' OR is_super_admin = true)
  );
$$;

-------------------------------------------------------
-- 8. AUTOMATIC TRIGGER FOR updated_at TIMESTAMPS
-------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_admins_updated_at ON public.admins;
CREATE TRIGGER set_admins_updated_at BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_devices_updated_at ON public.devices;
CREATE TRIGGER set_devices_updated_at BEFORE UPDATE ON public.devices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_roms_updated_at ON public.roms;
CREATE TRIGGER set_roms_updated_at BEFORE UPDATE ON public.roms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_feedback_updated_at ON public.feedback;
CREATE TRIGGER set_feedback_updated_at BEFORE UPDATE ON public.feedback FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles select" ON public.profiles;
CREATE POLICY "Public profiles select" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users profile insert" ON public.profiles;
CREATE POLICY "Users profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users profile update" ON public.profiles;
CREATE POLICY "Users profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Admins Policies (Private by default, non-recursive)
DROP POLICY IF EXISTS "Admins read self or if approved admin" ON public.admins;
CREATE POLICY "Admins read self or if approved admin" ON public.admins FOR SELECT
  USING (auth.uid() = id OR public.is_approved_admin());

DROP POLICY IF EXISTS "Admins insert self on registration" ON public.admins;
CREATE POLICY "Admins insert self on registration" ON public.admins FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins update self or superadmin" ON public.admins;
CREATE POLICY "Admins update self or superadmin" ON public.admins FOR UPDATE
  USING (auth.uid() = id OR public.is_superadmin());

DROP POLICY IF EXISTS "Superadmin delete admins" ON public.admins;
CREATE POLICY "Superadmin delete admins" ON public.admins FOR DELETE
  USING (public.is_superadmin());

-- Devices Policies
DROP POLICY IF EXISTS "Devices public read" ON public.devices;
CREATE POLICY "Devices public read" ON public.devices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Devices admin insert" ON public.devices;
CREATE POLICY "Devices admin insert" ON public.devices FOR INSERT WITH CHECK (public.is_approved_admin());

DROP POLICY IF EXISTS "Devices admin update" ON public.devices;
CREATE POLICY "Devices admin update" ON public.devices FOR UPDATE USING (public.is_approved_admin());

DROP POLICY IF EXISTS "Devices admin delete" ON public.devices;
CREATE POLICY "Devices admin delete" ON public.devices FOR DELETE USING (public.is_approved_admin());

-- ROMs Policies
DROP POLICY IF EXISTS "Roms public read" ON public.roms;
CREATE POLICY "Roms public read" ON public.roms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Roms admin insert" ON public.roms;
CREATE POLICY "Roms admin insert" ON public.roms FOR INSERT WITH CHECK (public.is_approved_admin());

DROP POLICY IF EXISTS "Roms admin update" ON public.roms;
CREATE POLICY "Roms admin update" ON public.roms FOR UPDATE USING (public.is_approved_admin());

DROP POLICY IF EXISTS "Roms admin delete" ON public.roms;
CREATE POLICY "Roms admin delete" ON public.roms FOR DELETE USING (public.is_approved_admin());

-- Admin Logs Policies
DROP POLICY IF EXISTS "Admin logs read by approved admins" ON public.admin_logs;
CREATE POLICY "Admin logs read by approved admins" ON public.admin_logs FOR SELECT USING (public.is_approved_admin());

DROP POLICY IF EXISTS "Admin logs insert by approved admins" ON public.admin_logs;
CREATE POLICY "Admin logs insert by approved admins" ON public.admin_logs FOR INSERT WITH CHECK (public.is_approved_admin());

-- Feedback Policies
DROP POLICY IF EXISTS "Feedback public read" ON public.feedback;
CREATE POLICY "Feedback public read" ON public.feedback FOR SELECT USING (true);

DROP POLICY IF EXISTS "Feedback public insert" ON public.feedback;
CREATE POLICY "Feedback public insert" ON public.feedback FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Feedback admin select" ON public.feedback;
CREATE POLICY "Feedback admin select" ON public.feedback FOR SELECT
  USING (public.is_approved_admin());

DROP POLICY IF EXISTS "Feedback admin update" ON public.feedback;
CREATE POLICY "Feedback admin update" ON public.feedback FOR UPDATE
  USING (public.is_approved_admin());

DROP POLICY IF EXISTS "Feedback superadmin delete" ON public.feedback;
CREATE POLICY "Feedback superadmin delete" ON public.feedback FOR DELETE
  USING (public.is_superadmin());

-- Feedback Votes Policies
ALTER TABLE public.feedback_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Feedback votes public select" ON public.feedback_votes;
CREATE POLICY "Feedback votes public select" ON public.feedback_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Feedback votes public insert" ON public.feedback_votes;
CREATE POLICY "Feedback votes public insert" ON public.feedback_votes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Feedback votes public delete" ON public.feedback_votes;
CREATE POLICY "Feedback votes public delete" ON public.feedback_votes FOR DELETE USING (true);

