-- ============================================================
-- MODULE 21: Enterprise Mobile Platform (PWA, Offline Sync, QR Scanner & Push Notifications)
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE mobile_device_platform AS ENUM ('ios', 'android', 'web', 'desktop');
CREATE TYPE mobile_device_status AS ENUM ('active', 'inactive', 'suspended', 'revoked');
CREATE TYPE mobile_session_status AS ENUM ('active', 'expired', 'terminated', 'revoked');
CREATE TYPE sync_operation AS ENUM ('create', 'update', 'delete', 'upsert');
CREATE TYPE sync_status AS ENUM ('pending', 'syncing', 'completed', 'failed', 'conflict');
CREATE TYPE sync_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE push_provider AS ENUM ('web_push', 'firebase', 'apns', 'custom');
CREATE TYPE push_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'clicked');
CREATE TYPE mobile_activity_type AS ENUM ('login', 'logout', 'sync', 'scan', 'form_submit', 'media_upload', 'view', 'search', 'settings_change', 'error');
CREATE TYPE mobile_role AS ENUM ('platform_owner', 'organization_admin', 'festival_admin', 'judge', 'volunteer', 'reception', 'medical', 'finance', 'inventory', 'participant');
CREATE TYPE offline_form_status AS ENUM ('draft', 'queued', 'submitted', 'synced', 'failed');

-- ============================================================
-- 1. MOBILE DEVICES
-- ============================================================

CREATE TABLE mobile_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL UNIQUE,
  device_name TEXT NOT NULL,
  device_platform mobile_device_platform NOT NULL DEFAULT 'web',
  device_model TEXT,
  os_version TEXT,
  app_version TEXT,
  fcm_token TEXT,
  is_biometric_enabled BOOLEAN DEFAULT false,
  is_pin_enabled BOOLEAN DEFAULT false,
  pin_hash TEXT,
  last_sync_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  status mobile_device_status NOT NULL DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE mobile_devices ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. DEVICE REGISTRATIONS
-- ============================================================

CREATE TABLE device_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES mobile_devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_remembered BOOLEAN DEFAULT false,
  is_trusted BOOLEAN DEFAULT false,
  registered_at TIMESTAMPTZ DEFAULT now(),
  last_verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE device_registrations ENABLE ROW LEVEL security;
CREATE UNIQUE INDEX idx_device_reg_unique ON device_registrations(device_id, user_id) WHERE is_active = true;

-- ============================================================
-- 3. DEVICE SESSIONS
-- ============================================================

CREATE TABLE device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  device_registration_id UUID NOT NULL REFERENCES device_registrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT,
  status mobile_session_status NOT NULL DEFAULT 'active',
  ip_address TEXT,
  user_agent TEXT,
  location JSONB,
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  terminated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE device_sessions ENABLE ROW LEVEL security;

-- ============================================================
-- 4. OFFLINE SYNC QUEUE
-- ============================================================

CREATE TABLE offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES mobile_devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_operation sync_operation NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  payload JSONB NOT NULL,
  previous_state JSONB,
  status sync_status NOT NULL DEFAULT 'pending',
  priority sync_priority NOT NULL DEFAULT 'medium',
  conflict_resolution TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  locked_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE offline_sync_queue ENABLE ROW LEVEL security;
CREATE INDEX idx_sync_queue_status ON offline_sync_queue(status, priority, created_at);
CREATE INDEX idx_sync_queue_device ON offline_sync_queue(device_id, status);

-- ============================================================
-- 5. SYNC LOGS
-- ============================================================

CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  device_id UUID REFERENCES mobile_devices(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sync_type TEXT NOT NULL,
  table_name TEXT,
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  conflicts_resolved INTEGER DEFAULT 0,
  duration_ms INTEGER,
  status sync_status NOT NULL DEFAULT 'completed',
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE sync_logs ENABLE ROW LEVEL security;
CREATE INDEX idx_sync_logs_device ON sync_logs(device_id, created_at DESC);

-- ============================================================
-- 6. MOBILE SETTINGS
-- ============================================================

CREATE TABLE mobile_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES mobile_devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system',
  language TEXT DEFAULT 'en',
  offline_storage_mb INTEGER DEFAULT 500,
  auto_sync BOOLEAN DEFAULT true,
  sync_interval_minutes INTEGER DEFAULT 5,
  push_enabled BOOLEAN DEFAULT true,
  push_sound BOOLEAN DEFAULT true,
  push_vibrate BOOLEAN DEFAULT true,
  biometric_login BOOLEAN DEFAULT false,
  pin_login BOOLEAN DEFAULT false,
  reduce_data BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  font_size TEXT DEFAULT 'medium',
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(device_id, user_id)
);
ALTER TABLE mobile_settings ENABLE ROW LEVEL security;

-- ============================================================
-- 7. PUSH SUBSCRIPTIONS
-- ============================================================

CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES mobile_devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  provider push_provider NOT NULL DEFAULT 'web_push',
  endpoint TEXT NOT NULL,
  p256dh_key TEXT,
  auth_key TEXT,
  is_active BOOLEAN DEFAULT true,
  failed_attempts INTEGER DEFAULT 0,
  last_sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(device_id, user_id, provider)
);
ALTER TABLE push_subscriptions ENABLE ROW LEVEL security;
CREATE INDEX idx_push_sub_user ON push_subscriptions(user_id, is_active);

-- ============================================================
-- 8. PUSH DELIVERY LOGS
-- ============================================================

CREATE TABLE push_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES push_subscriptions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  notification_type TEXT,
  priority sync_priority DEFAULT 'medium',
  status push_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE push_delivery_logs ENABLE ROW LEVEL security;
CREATE INDEX idx_push_delivery_user ON push_delivery_logs(user_id, created_at DESC);
CREATE INDEX idx_push_delivery_status ON push_delivery_logs(status, created_at);

-- ============================================================
-- 9. MOBILE ACTIVITY LOGS
-- ============================================================

CREATE TABLE mobile_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  device_id UUID REFERENCES mobile_devices(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type mobile_activity_type NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  duration_ms INTEGER,
  is_offline BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE mobile_activity_logs ENABLE ROW LEVEL security;
CREATE INDEX idx_mobile_activity_user ON mobile_activity_logs(user_id, created_at DESC);
CREATE INDEX idx_mobile_activity_type ON mobile_activity_logs(activity_type, created_at DESC);

-- ============================================================
-- 10. OFFLINE FORMS
-- ============================================================

CREATE TABLE offline_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES mobile_devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL,
  form_data JSONB NOT NULL,
  form_schema_version TEXT,
  status offline_form_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ,
  remote_record_id UUID,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE offline_forms ENABLE ROW LEVEL security;
CREATE INDEX idx_offline_forms_status ON offline_forms(device_id, status);

-- ============================================================
-- 11. OFFLINE MEDIA UPLOADS
-- ============================================================

CREATE TABLE offline_media_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
  device_id UUID NOT NULL REFERENCES mobile_devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  file_path TEXT,
  thumbnail_path TEXT,
  storage_bucket TEXT DEFAULT 'mobile-uploads',
  media_type TEXT,
  compression_level TEXT DEFAULT 'auto',
  status sync_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  uploaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE offline_media_uploads ENABLE ROW LEVEL security;
CREATE INDEX idx_offline_media_status ON offline_media_uploads(device_id, status);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Mobile Devices
CREATE POLICY "org_access_all" ON mobile_devices FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
-- Device Registrations
CREATE POLICY "org_access_all" ON device_registrations FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
-- Device Sessions
CREATE POLICY "org_access_all" ON device_sessions FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
-- Offline Sync Queue
CREATE POLICY "org_access_all" ON offline_sync_queue FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
-- Sync Logs
CREATE POLICY "org_access_all" ON sync_logs FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
-- Mobile Settings
CREATE POLICY "org_access_all" ON mobile_settings FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
-- Push Subscriptions
CREATE POLICY "org_access_all" ON push_subscriptions FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
-- Push Delivery Logs
CREATE POLICY "org_access_all" ON push_delivery_logs FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
-- Mobile Activity Logs
CREATE POLICY "org_access_all" ON mobile_activity_logs FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
-- Offline Forms
CREATE POLICY "org_access_all" ON offline_forms FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');
-- Offline Media Uploads
CREATE POLICY "org_access_all" ON offline_media_uploads FOR ALL USING (organization_id = auth.jwt() ->> 'org_id');

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER update_mobile_devices_updated_at BEFORE UPDATE ON mobile_devices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_offline_sync_queue_updated_at BEFORE UPDATE ON offline_sync_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_mobile_settings_updated_at BEFORE UPDATE ON mobile_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON push_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_offline_forms_updated_at BEFORE UPDATE ON offline_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_offline_media_uploads_updated_at BEFORE UPDATE ON offline_media_uploads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
