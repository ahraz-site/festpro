-- FestPro Module 11: Enterprise Security, Audit & System Administration
-- =================================================================

-- 1. ENUMS
-- =================================================================
CREATE TYPE audit_action AS ENUM (
  'login','logout','registration','role_change','permission_change',
  'festival_created','competition_updated','participant_registered',
  'result_published','certificate_generated','payment_added',
  'notification_sent','settings_changed','delete_operation',
  'api_token_created','api_token_revoked','backup_created','backup_restored',
  'feature_flag_changed','security_event','system_update','user_impersonated'
);

CREATE TYPE audit_status AS ENUM ('success','failure','pending','blocked');
CREATE TYPE security_event_type AS ENUM (
  'suspicious_login','brute_force','account_lockout','password_reset',
  '2fa_attempt','rate_limit_exceeded','ip_blocked','session_hijack',
  'token_reused','unusual_location','mass_operation','data_export'
);
CREATE TYPE security_event_severity AS ENUM ('low','medium','high','critical');
CREATE TYPE device_type AS ENUM ('desktop','mobile','tablet','unknown');
CREATE TYPE backup_status AS ENUM ('pending','running','completed','failed','verified');
CREATE TYPE health_status AS ENUM ('healthy','degraded','down','unknown');
CREATE TYPE maintenance_scope AS ENUM ('full','read_only','specific_module');
CREATE TYPE token_permission AS ENUM ('read','write','admin','custom');

-- 2. TABLES
-- =================================================================

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  description TEXT,
  changes JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  status audit_status NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_search ON audit_logs USING gin(to_tsvector('english', coalesce(description,'') || ' ' || coalesce(entity_type,'')));

-- Login History
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,
  browser VARCHAR(300),
  device VARCHAR(200),
  os VARCHAR(200),
  country VARCHAR(100),
  city VARCHAR(200),
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  isp VARCHAR(300),
  login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  logout_at TIMESTAMPTZ,
  session_duration INTEGER,
  status audit_status NOT NULL DEFAULT 'success',
  failure_reason VARCHAR(500),
  auth_method VARCHAR(50) DEFAULT 'password',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_login_history_user ON login_history(user_id);
CREATE INDEX idx_login_history_login ON login_history(login_at DESC);

-- Security Events
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type security_event_type NOT NULL,
  severity security_event_severity NOT NULL DEFAULT 'medium',
  title VARCHAR(300) NOT NULL,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  location JSONB,
  metadata JSONB DEFAULT '{}',
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_security_events_org ON security_events(organization_id);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_unresolved ON security_events(is_resolved) WHERE is_resolved = false;

-- Failed Logins
CREATE TABLE failed_logins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(300),
  ip_address VARCHAR(45) NOT NULL,
  browser VARCHAR(300),
  device VARCHAR(200),
  os VARCHAR(200),
  country VARCHAR(100),
  attempt_count INTEGER NOT NULL DEFAULT 1,
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_failed_logins_ip ON failed_logins(ip_address);
CREATE INDEX idx_failed_logins_email ON failed_logins(email);

-- Active Sessions
CREATE TABLE active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  session_token VARCHAR(500) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  browser VARCHAR(300),
  device VARCHAR(200),
  os VARCHAR(200),
  country VARCHAR(100),
  city VARCHAR(200),
  is_current BOOLEAN NOT NULL DEFAULT false,
  is_mobile BOOLEAN NOT NULL DEFAULT false,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_active_sessions_user ON active_sessions(user_id);
CREATE INDEX idx_active_sessions_token ON active_sessions(session_token);
CREATE INDEX idx_active_sessions_expires ON active_sessions(expires_at) WHERE expires_at > now();

-- Devices
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  device_name VARCHAR(300),
  device_type device_type NOT NULL DEFAULT 'unknown',
  browser VARCHAR(300),
  os VARCHAR(200),
  ip_address VARCHAR(45),
  fingerprint VARCHAR(500),
  is_trusted BOOLEAN NOT NULL DEFAULT false,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_devices_user ON devices(user_id);
CREATE INDEX idx_devices_fingerprint ON devices(fingerprint);

-- IP Whitelist / Blacklist
CREATE TABLE ip_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,
  label VARCHAR(200),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, ip_address)
);

CREATE TABLE ip_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,
  reason TEXT,
  blocked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(organization_id, ip_address)
);
CREATE INDEX idx_ip_blacklist_active ON ip_blacklist(organization_id, is_active) WHERE is_active = true;

-- System Settings
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  setting_key VARCHAR(200) NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  setting_group VARCHAR(100) NOT NULL DEFAULT 'general',
  description TEXT,
  is_encrypted BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, setting_key)
);
CREATE INDEX idx_system_settings_group ON system_settings(setting_group);

-- Maintenance Mode
CREATE TABLE maintenance_mode (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT false,
  scope maintenance_scope NOT NULL DEFAULT 'full',
  message TEXT,
  allowed_roles TEXT[] DEFAULT '{}',
  allowed_user_ids UUID[] DEFAULT '{}',
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  started_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System Health
CREATE TABLE system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  component VARCHAR(200) NOT NULL,
  status health_status NOT NULL DEFAULT 'unknown',
  latency_ms INTEGER,
  error_rate DECIMAL(5,2),
  message TEXT,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_system_health_component ON system_health(component);

-- Feature Flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  flag_key VARCHAR(200) NOT NULL,
  flag_name VARCHAR(300) NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  is_beta BOOLEAN NOT NULL DEFAULT false,
  allowed_roles TEXT[] DEFAULT '{}',
  percentage DECIMAL(5,2),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, flag_key)
);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(organization_id, is_enabled) WHERE is_enabled = true;

-- API Tokens
CREATE TABLE api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_name VARCHAR(200) NOT NULL,
  token_hash VARCHAR(500) NOT NULL,
  token_prefix VARCHAR(20),
  permissions token_permission NOT NULL DEFAULT 'read',
  allowed_ips TEXT[] DEFAULT '{}',
  allowed_modules TEXT[] DEFAULT '{}',
  rate_limit INTEGER DEFAULT 1000,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_api_tokens_org ON api_tokens(organization_id);
CREATE INDEX idx_api_tokens_user ON api_tokens(user_id);
CREATE INDEX idx_api_tokens_active ON api_tokens(is_revoked) WHERE is_revoked = false;

-- System Backups
CREATE TABLE system_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  backup_name VARCHAR(300) NOT NULL,
  backup_type VARCHAR(50) NOT NULL DEFAULT 'full',
  file_size BIGINT,
  file_path TEXT,
  checksum VARCHAR(128),
  includes_data TEXT[] DEFAULT '{}',
  includes_files TEXT[] DEFAULT '{}',
  status backup_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  verified_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX idx_system_backups_org ON system_backups(organization_id);
CREATE INDEX idx_system_backups_status ON system_backups(status);

-- Error Logs
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type VARCHAR(100) NOT NULL,
  error_message TEXT,
  stack_trace TEXT,
  route VARCHAR(500),
  method VARCHAR(10),
  status_code INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_body JSONB,
  response_body JSONB,
  headers JSONB,
  metadata JSONB DEFAULT '{}',
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_error_logs_org ON error_logs(organization_id);
CREATE INDEX idx_error_logs_type ON error_logs(error_type);
CREATE INDEX idx_error_logs_unresolved ON error_logs(is_resolved) WHERE is_resolved = false;
CREATE INDEX idx_error_logs_created ON error_logs(created_at DESC);

-- Activity Stream
CREATE TABLE activity_stream (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  entity_type VARCHAR(100),
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_stream_org ON activity_stream(organization_id);
CREATE INDEX idx_activity_stream_festival ON activity_stream(festival_id);
CREATE INDEX idx_activity_stream_created ON activity_stream(created_at DESC);

-- 3. AUTO-UPDATE TRIGGERS
-- =================================================================
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. RLS
-- =================================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_logins ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_mode ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_stream ENABLE ROW LEVEL SECURITY;

-- Organization-level access
CREATE POLICY audit_logs_org_access ON audit_logs FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY login_history_org_access ON login_history FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY security_events_org_access ON security_events FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY failed_logins_org_access ON failed_logins FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY active_sessions_org_access ON active_sessions FOR ALL USING (
  user_id = auth.uid() OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner','admin','security_admin')
  )
);

CREATE POLICY devices_org_access ON devices FOR ALL USING (
  user_id = auth.uid() OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('owner','admin','security_admin')
  )
);

CREATE POLICY ip_whitelist_org_access ON ip_whitelist FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

CREATE POLICY ip_blacklist_org_access ON ip_blacklist FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

CREATE POLICY system_settings_org_access ON system_settings FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY feature_flags_org_access ON feature_flags FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY api_tokens_org_access ON api_tokens FOR ALL USING (
  organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);

CREATE POLICY system_backups_org_access ON system_backups FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY error_logs_org_access ON error_logs FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY activity_stream_org_access ON activity_stream FOR ALL USING (
  organization_id IS NULL OR organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- 5. AUDIT LOG HELPER FUNCTION
-- =================================================================
CREATE OR REPLACE FUNCTION create_audit_log(
  p_organization_id UUID,
  p_festival_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_action audit_action,
  p_entity_type VARCHAR DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_changes JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_status audit_status DEFAULT 'success'
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO audit_logs (organization_id, festival_id, user_id, action, entity_type, entity_id, description, changes, metadata, status, ip_address, user_agent)
  VALUES (p_organization_id, p_festival_id, COALESCE(p_user_id, auth.uid()), p_action, p_entity_type, p_entity_id, p_description, p_changes, p_metadata, p_status,
    current_setting('request.headers')::json->>'x-forwarded-for',
    current_setting('request.headers')::json->>'user-agent'
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FEATURE FLAGS SEED
-- =================================================================
INSERT INTO system_settings (organization_id, setting_key, setting_value, setting_group, description) VALUES
  (NULL, 'app_name', '"FestPro"', 'general', 'Application name'),
  (NULL, 'app_logo', '""', 'branding', 'Application logo URL'),
  (NULL, 'default_timezone', '"UTC"', 'regional', 'Default timezone'),
  (NULL, 'default_language', '"en"', 'regional', 'Default language'),
  (NULL, 'default_currency', '"USD"', 'regional', 'Default currency'),
  (NULL, 'session_timeout_minutes', '480', 'security', 'Session timeout in minutes'),
  (NULL, 'max_login_attempts', '5', 'security', 'Maximum failed login attempts before lockout'),
  (NULL, 'lockout_duration_minutes', '30', 'security', 'Account lockout duration'),
  (NULL, 'password_min_length', '8', 'security', 'Minimum password length'),
  (NULL, 'require_2fa', 'false', 'security', 'Require two-factor authentication'),
  (NULL, 'maintenance_mode', 'false', 'system', 'Global maintenance mode')
ON CONFLICT (organization_id, setting_key) DO NOTHING;

INSERT INTO feature_flags (organization_id, flag_key, flag_name, description, is_enabled) VALUES
  (NULL, 'module_results', 'Results Engine', 'Results, grades, rankings module', true),
  (NULL, 'module_finance', 'Finance Module', 'Finance, reports, analytics module', true),
  (NULL, 'module_communication', 'Communication Module', 'Notifications, announcements, workflow module', true),
  (NULL, 'module_public_website', 'Public Website', 'Public festival website and live portal', false),
  (NULL, 'module_mobile_app', 'Mobile App', 'PWA mobile application', false),
  (NULL, 'module_billing', 'Billing & Subscriptions', 'SaaS billing and subscription management', false),
  (NULL, 'module_ai', 'AI Features', 'AI-powered judging and insights', false),
  (NULL, 'beta_live_streaming', 'Live Streaming (Beta)', 'Live streaming integration', false),
  (NULL, 'beta_multi_language', 'Multi Language (Beta)', 'Multi-language support', false)
ON CONFLICT (organization_id, flag_key) DO NOTHING;
