-- FestPro SaaS Module 1: Authentication Schema
-- Run this in Supabase SQL Editor

-- ====================
-- ENUMS
-- ====================

DO $$ BEGIN CREATE TYPE user_role AS ENUM (
  'platform_owner',
  'platform_admin',
  'organization_owner',
  'organization_admin',
  'festival_director',
  'division_coordinator',
  'sector_coordinator',
  'unit_coordinator',
  'media',
  'reception',
  'finance',
  'public_user',
  'judge',
  'volunteer',
  'participant'
); EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'festival_director';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'division_coordinator';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sector_coordinator';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'unit_coordinator';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'media';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'reception';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'finance';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'public_user';

-- ====================
-- TABLES
-- ====================

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(50),
  role user_role NOT NULL DEFAULT 'participant',
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VIEW for backward compatibility with user_profiles(user_id)
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  id AS user_id,
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
FROM public.profiles;


-- Organization members (many-to-many)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- VIEW for backward compatibility with user_organizations
CREATE OR REPLACE VIEW user_organizations AS
SELECT 
  organization_id,
  user_id,
  role,
  joined_at
FROM public.organization_members;

ALTER TABLE organization_members ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ====================
-- INDEXES
-- ====================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- ====================
-- TRIGGERS
-- ====================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile when auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'organization_owner'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ====================
-- ROW LEVEL SECURITY
-- ====================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role::text IN ('platform_owner', 'platform_admin')
    )
  );

-- Organizations policies
CREATE POLICY "Members can read their organizations"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their organization"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
      AND role::text IN ('organization_owner', 'platform_owner', 'platform_admin')
    )
  );

CREATE POLICY "Platform admins can CRUD organizations"
  ON organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role::text IN ('platform_owner', 'platform_admin')
    )
  );

-- Organization members policies
CREATE POLICY "Members can read their org memberships"
  ON organization_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Org admins can manage members"
  ON organization_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_members.organization_id
      AND user_id = auth.uid()
      AND role::text IN ('organization_owner', 'organization_admin', 'platform_owner', 'platform_admin')
    )
  );

-- ====================
-- SEED ROLES
-- ====================

-- Note: Roles are defined in the user_role enum above.
-- Additional role metadata and permissions are managed in the application code
-- under src/config/roles.ts

-- ====================
-- VERIFICATION
-- ====================

-- Run these queries to verify:
-- SELECT * FROM auth.users;
-- SELECT * FROM public.profiles;
-- SELECT * FROM public.organizations;
-- SELECT * FROM public.organization_members;
