-- FestPro SaaS Module 2: Organizations + Multi-Tenant + RBAC
-- Run after 00001_auth_schema.sql

-- ====================
-- EXTEND ENUMS
-- ====================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'festival_director';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'division_coordinator';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sector_coordinator';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'unit_coordinator';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'media';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'reception';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'finance';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'public_user';

CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');
CREATE TYPE activity_action AS ENUM (
  'organization.created', 'organization.updated', 'organization.deleted',
  'member.invited', 'member.joined', 'member.removed', 'member.suspended', 'member.reactivated',
  'member.role_changed', 'member.left',
  'profile.updated',
  'settings.updated',
  'login', 'logout'
);

-- ====================
-- EXTEND ORGANIZATIONS
-- ====================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS code VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS country VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state VARCHAR(100),
  ADD COLUMN IF NOT EXISTS district VARCHAR(100),
  ADD COLUMN IF NOT EXISTS website VARCHAR(255),
  ADD COLUMN IF NOT EXISTS org_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS org_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS brand_color VARCHAR(7) DEFAULT '#4F46E5',
  ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{"mode": "light", "font": "inter"}',
  ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS max_festivals INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ====================
-- ORGANIZATION SETTINGS
-- ====================

CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  allow_public_registration BOOLEAN DEFAULT false,
  require_email_verification BOOLEAN DEFAULT true,
  default_user_role user_role DEFAULT 'participant',
  logo_url TEXT,
  favicon_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#4F46E5',
  secondary_color VARCHAR(7) DEFAULT '#7C3AED',
  accent_color VARCHAR(7) DEFAULT '#F59E0B',
  font_family VARCHAR(100) DEFAULT 'Inter',
  custom_css TEXT,
  custom_domain VARCHAR(255),
  domain_verified BOOLEAN DEFAULT false,
  email_settings JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- ACTIVITY LOGS
-- ====================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action activity_action NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- INVITATIONS
-- ====================

CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'participant',
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status invitation_status DEFAULT 'pending',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================
-- PERMISSIONS (app-level)
-- ====================

-- Permissions are primarily managed in application code (src/config/permissions.ts)
-- This table serves as reference and for future dynamic permission assignment

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  module VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed core permissions
INSERT INTO permissions (code, name, description, module) VALUES
  ('organization.create', 'Create Organization', 'Can create new organizations', 'organization'),
  ('organization.view', 'View Organization', 'Can view organization details', 'organization'),
  ('organization.edit', 'Edit Organization', 'Can edit organization settings', 'organization'),
  ('organization.delete', 'Delete Organization', 'Can delete organization', 'organization'),
  ('member.invite', 'Invite Members', 'Can invite new members', 'members'),
  ('member.view', 'View Members', 'Can view member list', 'members'),
  ('member.edit', 'Edit Members', 'Can edit member roles', 'members'),
  ('member.remove', 'Remove Members', 'Can remove members', 'members'),
  ('festival.create', 'Create Festival', 'Can create festivals', 'festival'),
  ('festival.view', 'View Festivals', 'Can view festivals', 'festival'),
  ('festival.edit', 'Edit Festival', 'Can edit festivals', 'festival'),
  ('festival.delete', 'Delete Festival', 'Can delete festivals', 'festival'),
  ('competition.create', 'Create Competition', 'Can create competitions', 'competition'),
  ('competition.view', 'View Competitions', 'Can view competitions', 'competition'),
  ('competition.edit', 'Edit Competition', 'Can edit competitions', 'competition'),
  ('competition.delete', 'Delete Competition', 'Can delete competitions', 'competition'),
  ('participant.create', 'Create Participant', 'Can register participants', 'participant'),
  ('participant.view', 'View Participants', 'Can view participants', 'participant'),
  ('participant.edit', 'Edit Participant', 'Can edit participant details', 'participant'),
  ('participant.delete', 'Delete Participant', 'Can delete participants', 'participant'),
  ('participant.import', 'Import Participants', 'Can bulk import participants', 'participant'),
  ('judge.assign', 'Assign Judges', 'Can assign judges to competitions', 'judge'),
  ('score.enter', 'Enter Scores', 'Can enter scores for participants', 'scoring'),
  ('score.view', 'View Scores', 'Can view scores', 'scoring'),
  ('score.lock', 'Lock Scores', 'Can lock final scores', 'scoring'),
  ('result.view', 'View Results', 'Can view results', 'results'),
  ('result.publish', 'Publish Results', 'Can publish final results', 'results'),
  ('certificate.generate', 'Generate Certificates', 'Can generate certificates', 'certificate'),
  ('certificate.view', 'View Certificates', 'Can view certificates', 'certificate'),
  ('report.view', 'View Reports', 'Can view reports', 'reports'),
  ('report.export', 'Export Reports', 'Can export reports', 'reports'),
  ('finance.view', 'View Finance', 'Can view financial records', 'finance'),
  ('finance.manage', 'Manage Finance', 'Can add/edit financial records', 'finance'),
  ('settings.view', 'View Settings', 'Can view settings', 'settings'),
  ('settings.manage', 'Manage Settings', 'Can modify settings', 'settings'),
  ('activity.view', 'View Activity Logs', 'Can view activity logs', 'activity'),
  ('audit.view', 'View Audit Logs', 'Can view audit trail', 'audit')
ON CONFLICT (code) DO NOTHING;

-- ====================
-- ROLE-PERMISSION MAPPING
-- ====================

CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  permission_code VARCHAR(100) NOT NULL REFERENCES permissions(code) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, permission_code)
);

-- Seed role-permissions for organization_owner
INSERT INTO role_permissions (role, permission_code)
SELECT 'organization_owner', code FROM permissions
ON CONFLICT DO NOTHING;

-- Seed role-permissions for organization_admin (all except delete org + manage finance)
INSERT INTO role_permissions (role, permission_code)
SELECT 'organization_admin', code FROM permissions
WHERE code NOT IN ('organization.delete', 'finance.manage')
ON CONFLICT DO NOTHING;

-- Seed role-permissions for festival_director
INSERT INTO role_permissions (role, permission_code)
SELECT 'festival_director', code FROM permissions
WHERE code IN (
  'organization.view', 'festival.create', 'festival.view', 'festival.edit',
  'competition.create', 'competition.view', 'competition.edit',
  'participant.view', 'participant.edit', 'participant.import',
  'judge.assign', 'score.view',
  'result.view', 'result.publish',
  'certificate.generate', 'certificate.view',
  'report.view',
  'activity.view'
)
ON CONFLICT DO NOTHING;

-- Seed role-permissions for judge
INSERT INTO role_permissions (role, permission_code)
SELECT 'judge', code FROM permissions
WHERE code IN ('competition.view', 'participant.view', 'score.enter', 'score.view', 'result.view')
ON CONFLICT DO NOTHING;

-- Seed role-permissions for volunteer
INSERT INTO role_permissions (role, permission_code)
SELECT 'volunteer', code FROM permissions
WHERE code IN ('festival.view', 'competition.view', 'participant.view')
ON CONFLICT DO NOTHING;

-- Seed role-permissions for participant
INSERT INTO role_permissions (role, permission_code)
SELECT 'participant', code FROM permissions
WHERE code IN ('competition.view', 'result.view', 'certificate.view')
ON CONFLICT DO NOTHING;

-- Seed role-permissions for media
INSERT INTO role_permissions (role, permission_code)
SELECT 'media', code FROM permissions
WHERE code IN ('festival.view')
ON CONFLICT DO NOTHING;

-- Seed role-permissions for reception
INSERT INTO role_permissions (role, permission_code)
SELECT 'reception', code FROM permissions
WHERE code IN ('festival.view', 'participant.view', 'participant.create')
ON CONFLICT DO NOTHING;

-- Seed role-permissions for finance
INSERT INTO role_permissions (role, permission_code)
SELECT 'finance', code FROM permissions
WHERE code IN ('finance.view', 'festival.view', 'report.view', 'report.export')
ON CONFLICT DO NOTHING;

-- ====================
-- INDEXES
-- ====================

CREATE INDEX IF NOT EXISTS idx_activity_logs_org ON activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_org ON invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_org_settings_org ON organization_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_code ON organizations(code);

-- ====================
-- TRIGGERS
-- ====================

CREATE OR REPLACE TRIGGER update_org_settings_updated_at
  BEFORE UPDATE ON organization_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Log organization creation
CREATE OR REPLACE FUNCTION log_organization_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_logs (organization_id, user_id, action, resource_type, resource_id, metadata)
  VALUES (NEW.id, NEW.created_by, 'organization.created', 'organization', NEW.id,
    jsonb_build_object('name', NEW.name, 'slug', NEW.slug));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION log_organization_created();

-- Log member invited
CREATE OR REPLACE FUNCTION log_member_invited()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_logs (organization_id, user_id, action, resource_type, resource_id, metadata)
  VALUES (NEW.organization_id, NEW.invited_by, 'member.invited', 'invitation', NEW.id,
    jsonb_build_object('email', NEW.email, 'role', NEW.role));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_invitation_created
  AFTER INSERT ON invitations
  FOR EACH ROW EXECUTE FUNCTION log_member_invited();

-- Auto-create organization_settings when organization is created
CREATE OR REPLACE FUNCTION create_org_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO organization_settings (organization_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_organization_created_settings
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION create_org_settings();

-- ====================
-- RLS POLICIES
-- ====================

-- Organization Settings
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org settings"
  ON organization_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_settings.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage org settings"
  ON organization_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_settings.organization_id
      AND user_id = auth.uid()
      AND role IN ('organization_owner', 'organization_admin', 'platform_owner', 'platform_admin')
    )
  );

-- Activity Logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their org activity logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = activity_logs.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own activity"
  ON activity_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Platform admins can view all activity"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('platform_owner', 'platform_admin')
    )
  );

-- Invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org invitations"
  ON invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = invitations.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own invitations by email"
  ON invitations FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage invitations"
  ON invitations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = invitations.organization_id
      AND user_id = auth.uid()
      AND role IN ('organization_owner', 'organization_admin', 'platform_owner', 'platform_admin')
    )
  );

-- Permissions (everyone can read)
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read permissions"
  ON permissions FOR SELECT
  USING (true);

-- Role Permissions (everyone can read)
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read role permissions"
  ON role_permissions FOR SELECT
  USING (true);

-- ====================
-- VERIFICATION
-- ====================

-- SELECT * FROM permissions;
-- SELECT * FROM role_permissions LIMIT 10;
-- SELECT * FROM activity_logs;
