-- FestPro SaaS Module 2: Organizations + Multi-Tenant + RBAC
-- Run after 00001_auth_schema.sql

-- ====================
-- EXTEND ENUMS
-- ====================
DO $$ BEGIN CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE activity_action AS ENUM (
  'organization.created',
  'organization.updated',
  'organization.deleted',
  'member.invited',
  'member.joined',
  'member.removed',
  'member.suspended',
  'member.reactivated',
  'member.role_changed',
  'member.left',
  'profile.updated',
  'settings.updated',
  'login',
  'logout',
  'festival.created',
  'festival.updated',
  'festival.deleted',
  'festival.archived',
  'festival.restored',
  'festival.duplicated',
  'festival.status_changed',
  'competition.created',
  'competition.updated',
  'competition.deleted',
  'competition.category_created',
  'competition.category_updated',
  'competition.category_deleted',
  'competition.judge_assigned',
  'competition.judge_unassigned',
  'competition.stage_assigned',
  'competition.scheduled',
  'participant.created',
  'participant.updated',
  'participant.deleted',
  'participant.restored',
  'participant.registered',
  'participant.registration_approved',
  'participant.registration_rejected',
  'participant.checked_in',
  'participant.qr_generated',
  'team.created',
  'team.member_added',
  'team.member_removed',
  'schedule.created',
  'schedule.updated',
  'schedule.published',
  'schedule.conflict_detected',
  'schedule.queue_changed',
  'schedule.performance_started',
  'schedule.performance_completed',
  'schedule.participant_called',
  'schedule.announcement_created',
  'judge.assigned',
  'judge.unassigned',
  'judge.score_submitted',
  'judge.score_locked',
  'judge.score_approved',
  'judge.chief_approval',
  'result.calculated',
  'result.published',
  'result.unpublished',
  'result.override',
  'result.appeal_submitted',
  'result.resolved',
  'result.certificate_generated',
  'payment.created',
  'payment.completed',
  'payment.failed',
  'payment.refunded',
  'budget.allocated',
  'budget.exceeded',
  'invoice.generated',
  'expense.recorded',
  'notification.sent',
  'broadcast.sent',
  'template.created',
  'workflow.triggered',
  'webhook.sent',
  'admin.setting_changed',
  'admin.security_alert',
  'admin.export_data',
  'admin.import_data',
  'admin.backup_created',
  'admin.restore_performed',
  'admin.audit_log_viewed',
  'admin.maintenance_toggled',
  'portal.viewed',
  'portal.setting_changed',
  'portal.theme_changed',
  'portal.banner_updated',
  'portal.announcement_posted',
  'portal.faq_updated',
  'portal.sponsor_added',
  'portal.contact_form_submitted',
  'portal.cache_cleared',
  'portal.api_token_created',
  'portal.api_token_revoked'
); EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'festival.created';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'festival.updated';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'festival.deleted';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'festival.archived';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'festival.restored';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'festival.duplicated';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'festival.status_changed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.created';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.updated';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.deleted';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.category_created';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.category_updated';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.category_deleted';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.judge_assigned';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.judge_unassigned';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.stage_assigned';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'competition.scheduled';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'participant.created';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'participant.updated';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'participant.deleted';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'participant.restored';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'participant.registered';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'participant.registration_approved';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'participant.registration_rejected';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'participant.checked_in';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'participant.qr_generated';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'team.created';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'team.member_added';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'team.member_removed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'schedule.created';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'schedule.updated';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'schedule.published';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'schedule.conflict_detected';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'schedule.queue_changed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'schedule.performance_started';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'schedule.performance_completed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'schedule.participant_called';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'schedule.announcement_created';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'judge.assigned';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'judge.unassigned';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'judge.score_submitted';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'judge.score_locked';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'judge.score_approved';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'judge.chief_approval';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'result.calculated';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'result.published';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'result.unpublished';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'result.override';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'result.appeal_submitted';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'result.resolved';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'result.certificate_generated';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'payment.created';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'payment.completed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'payment.failed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'payment.refunded';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'budget.allocated';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'budget.exceeded';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'invoice.generated';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'expense.recorded';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'notification.sent';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'broadcast.sent';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'template.created';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'workflow.triggered';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'webhook.sent';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'admin.setting_changed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'admin.security_alert';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'admin.export_data';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'admin.import_data';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'admin.backup_created';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'admin.restore_performed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'admin.audit_log_viewed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'admin.maintenance_toggled';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'portal.viewed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'portal.setting_changed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'portal.theme_changed';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'portal.banner_updated';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'portal.announcement_posted';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'portal.faq_updated';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'portal.sponsor_added';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'portal.contact_form_submitted';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'portal.cache_cleared';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'portal.api_token_created';
ALTER TYPE activity_action ADD VALUE IF NOT EXISTS 'portal.api_token_revoked';

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
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

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
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

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
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

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
      AND role::text IN ('organization_owner', 'organization_admin', 'platform_owner', 'platform_admin')
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
      WHERE id = auth.uid() AND role::text IN ('platform_owner', 'platform_admin')
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
      AND role::text IN ('organization_owner', 'organization_admin', 'platform_owner', 'platform_admin')
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
