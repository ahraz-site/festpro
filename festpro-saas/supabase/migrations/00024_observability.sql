-- ============================================================
-- MODULE 24: Enterprise Monitoring, Logging, Backup, DR & Observability
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN CREATE TYPE obs_health_status AS ENUM ('healthy', 'degraded', 'unhealthy', 'down', 'unknown'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE service_name AS ENUM ('app', 'database', 'storage', 'realtime', 'api', 'queue', 'auth', 'webhook', 'integration', 'email', 'sms', 'cdn'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE log_level AS ENUM ('debug', 'info', 'warn', 'error', 'fatal', 'trace'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE log_source AS ENUM ('app', 'api', 'auth', 'database', 'queue', 'notification', 'security', 'cron', 'webhook', 'integration', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE obs_backup_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled', 'expired'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE backup_type AS ENUM ('full', 'incremental', 'differential', 'point_in_time'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE backup_storage AS ENUM ('supabase', 'aws_s3', 'cloudflare_r2', 'gcs', 'local'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE restore_status AS ENUM ('pending', 'running', 'validating', 'completed', 'failed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE restore_type AS ENUM ('full', 'point_in_time', 'selective'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE alert_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved', 'silenced', 'expired'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE alert_channel AS ENUM ('email', 'push', 'sms', 'slack', 'webhook', 'pager'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE obs_incident_severity AS ENUM ('critical', 'major', 'minor', 'warning', 'info'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE obs_incident_status AS ENUM ('detected', 'investigating', 'identified', 'mitigated', 'resolved', 'closed', 'postmortem'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE obs_maintenance_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'extended'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- SYSTEM HEALTH & MONITORING
-- ============================================================



CREATE TABLE health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_name TEXT NOT NULL,
  check_type TEXT NOT NULL,
  service service_name NOT NULL,
  status obs_health_status NOT NULL DEFAULT 'healthy',
  response_time_ms INTEGER,
  error_message TEXT,
  check_interval_seconds INTEGER NOT NULL DEFAULT 60,
  is_scheduled BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE health_checks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE health_checks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE health_checks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE health_checks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE health_checks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE health_checks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE health_checks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE health_checks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE health_checks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE health_checks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE health_checks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE health_checks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE health_checks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE TABLE service_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service service_name NOT NULL,
  status obs_health_status NOT NULL DEFAULT 'healthy',
  previous_status obs_health_status,
  uptime_percent DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  version TEXT,
  environment TEXT NOT NULL DEFAULT 'production',
  region TEXT,
  host TEXT,
  port INTEGER,
  is_maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  last_downtime_at TIMESTAMPTZ,
  last_downtime_duration INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(service, environment)
);
ALTER TABLE service_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE service_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE service_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE service_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE service_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE service_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE service_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE service_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE service_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE service_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE service_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE service_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE service_status ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE TABLE uptime_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service service_name NOT NULL,
  environment TEXT NOT NULL DEFAULT 'production',
  status obs_health_status NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  response_time_ms INTEGER,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE uptime_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE uptime_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE uptime_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE uptime_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE uptime_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE uptime_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE uptime_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE uptime_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE uptime_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE uptime_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE uptime_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE uptime_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE uptime_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- ============================================================
-- LOGGING
-- ============================================================

CREATE TABLE application_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  log_level log_level NOT NULL DEFAULT 'info',
  log_source log_source NOT NULL DEFAULT 'app',
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  stack_trace TEXT,
  ip_address TEXT,
  user_agent TEXT,
  request_id TEXT,
  correlation_id TEXT,
  session_id TEXT,
  trace_id TEXT,
  span_id TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);



CREATE TABLE exception_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  exception_type TEXT NOT NULL,
  exception_class TEXT NOT NULL,
  message TEXT NOT NULL,
  stack_trace TEXT NOT NULL,
  file TEXT,
  line INTEGER,
  context JSONB DEFAULT '{}',
  environment TEXT NOT NULL DEFAULT 'production',
  is_handled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE crash_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  crash_type TEXT NOT NULL,
  crash_message TEXT NOT NULL,
  stack_trace TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'production',
  version TEXT,
  os_info TEXT,
  browser_info TEXT,
  device_info TEXT,
  app_state JSONB,
  severity alert_severity NOT NULL DEFAULT 'high',
  is_acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- METRICS
-- ============================================================

CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL NOT NULL,
  metric_unit TEXT NOT NULL,
  metric_labels JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE database_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_size_bytes BIGINT NOT NULL DEFAULT 0,
  table_count INTEGER NOT NULL DEFAULT 0,
  index_count INTEGER NOT NULL DEFAULT 0,
  active_connections INTEGER NOT NULL DEFAULT 0,
  max_connections INTEGER NOT NULL DEFAULT 100,
  transactions_per_second DECIMAL(10,2) NOT NULL DEFAULT 0,
  cache_hit_ratio DECIMAL(5,2) NOT NULL DEFAULT 0,
  avg_query_time_ms DECIMAL(10,2) NOT NULL DEFAULT 0,
  slow_queries INTEGER NOT NULL DEFAULT 0,
  deadlocks INTEGER NOT NULL DEFAULT 0,
  replication_lag_seconds INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE database_metrics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE database_metrics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE database_metrics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE database_metrics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE database_metrics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE database_metrics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE database_metrics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE database_metrics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE database_metrics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE database_metrics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE database_metrics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE database_metrics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE database_metrics ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE TABLE api_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER NOT NULL,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  user_id UUID REFERENCES auth.users(id),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE queue_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  queue_name TEXT NOT NULL,
  queue_length INTEGER NOT NULL DEFAULT 0,
  processed_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  retry_count INTEGER NOT NULL DEFAULT 0,
  avg_processing_time_ms DECIMAL(10,2) NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notification_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  sent_count INTEGER NOT NULL DEFAULT 0,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  avg_delivery_time_ms DECIMAL(10,2) NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- BACKUP & RESTORE
-- ============================================================

CREATE TABLE backup_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  backup_name TEXT NOT NULL,
  backup_type backup_type NOT NULL DEFAULT 'full',
  status obs_backup_status NOT NULL DEFAULT 'pending',
  storage_location backup_storage NOT NULL DEFAULT 'supabase',
  storage_path TEXT,
  file_size_bytes BIGINT,
  checksum TEXT,
  is_encrypted BOOLEAN NOT NULL DEFAULT true,
  encryption_algorithm TEXT DEFAULT 'aes-256-gcm',
  includes_data BOOLEAN NOT NULL DEFAULT true,
  includes_schema BOOLEAN NOT NULL DEFAULT true,
  includes_config BOOLEAN NOT NULL DEFAULT false,
  includes_files BOOLEAN NOT NULL DEFAULT false,
  retention_days INTEGER NOT NULL DEFAULT 30,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE backup_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_job_id UUID REFERENCES backup_jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE backup_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE TABLE restore_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  backup_job_id UUID REFERENCES backup_jobs(id) ON DELETE SET NULL,
  restore_name TEXT NOT NULL,
  restore_type restore_type NOT NULL DEFAULT 'full',
  status restore_status NOT NULL DEFAULT 'pending',
  target_environment TEXT NOT NULL DEFAULT 'production',
  point_in_time TIMESTAMPTZ,
  includes_data BOOLEAN NOT NULL DEFAULT true,
  includes_schema BOOLEAN NOT NULL DEFAULT true,
  includes_config BOOLEAN NOT NULL DEFAULT false,
  restore_location TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  error_message TEXT,
  validation_status TEXT,
  metadata JSONB DEFAULT '{}',
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE restore_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restore_job_id UUID REFERENCES restore_jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE restore_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE restore_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE restore_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE restore_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE restore_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE restore_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE restore_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE restore_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE restore_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE restore_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE restore_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE restore_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE restore_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE TABLE retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  target_table TEXT NOT NULL,
  retention_days INTEGER NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_cleanup_at TIMESTAMPTZ,
  cleanup_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ALERTS & INCIDENTS
-- ============================================================

CREATE TABLE system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  alert_name TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'info',
  status alert_status NOT NULL DEFAULT 'active',
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  source service_name NOT NULL,
  channel alert_channel NOT NULL DEFAULT 'email',
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolved_note TEXT,
  escalation_level INTEGER NOT NULL DEFAULT 0,
  notified_users TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE incident_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  incident_name TEXT NOT NULL,
  incident_id TEXT UNIQUE NOT NULL DEFAULT 'INC-' || upper(encode(gen_random_bytes(4), 'hex')),
  severity obs_incident_severity NOT NULL DEFAULT 'warning',
  status obs_incident_status NOT NULL DEFAULT 'detected',
  description TEXT NOT NULL,
  impact TEXT,
  root_cause TEXT,
  resolution TEXT,
  affected_services service_name[] DEFAULT '{}',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  mitigated_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  response_time_minutes INTEGER,
  time_to_resolve_minutes INTEGER,
  assigned_to UUID REFERENCES auth.users(id),
  postmortem TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MAINTENANCE & DEPLOYMENT
-- ============================================================

CREATE TABLE maintenance_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  affected_services service_name[] DEFAULT '{}',
  status obs_maintenance_status NOT NULL DEFAULT 'scheduled',
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  is_public BOOLEAN NOT NULL DEFAULT false,
  public_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE deployment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  deployment_version TEXT NOT NULL,
  deployment_type TEXT NOT NULL DEFAULT 'release' CHECK (deployment_type IN ('release', 'hotfix', 'rollback', 'patch')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'deploying', 'completed', 'failed', 'rolled_back')),
  commit_hash TEXT,
  branch TEXT,
  environment TEXT NOT NULL DEFAULT 'production',
  changelog TEXT,
  artifacts JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  error_message TEXT,
  deployed_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  rollback_version TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_app_logs_org ON application_logs(organization_id, created_at DESC);
CREATE INDEX idx_app_logs_level ON application_logs(log_level, created_at DESC);
CREATE INDEX idx_app_logs_source ON application_logs(log_source, created_at DESC);
CREATE INDEX idx_app_logs_correlation ON application_logs(correlation_id);



CREATE INDEX idx_exception_logs_org ON exception_logs(organization_id, created_at DESC);
CREATE INDEX idx_exception_type ON exception_logs(exception_type, created_at DESC);
CREATE INDEX idx_crash_reports_org ON crash_reports(organization_id, created_at DESC);
CREATE INDEX idx_perf_metrics_org ON performance_metrics(organization_id, metric_name, recorded_at DESC);
CREATE INDEX idx_api_metrics_org ON api_metrics(organization_id, recorded_at DESC);
CREATE INDEX idx_api_metrics_endpoint ON api_metrics(endpoint, recorded_at DESC);
CREATE INDEX idx_queue_metrics_name ON queue_metrics(queue_name, recorded_at DESC);
CREATE INDEX idx_backup_jobs_org ON backup_jobs(organization_id, created_at DESC);
CREATE INDEX idx_backup_jobs_status ON backup_jobs(status, scheduled_at);
CREATE INDEX idx_restore_jobs_org ON restore_jobs(organization_id, created_at DESC);
CREATE INDEX idx_system_alerts_org ON system_alerts(organization_id, status, created_at DESC);
CREATE INDEX idx_system_alerts_severity ON system_alerts(severity, status, created_at DESC);
CREATE INDEX idx_incident_logs_org ON incident_logs(organization_id, created_at DESC);
CREATE INDEX idx_incident_logs_status ON incident_logs(status, severity, created_at DESC);
CREATE INDEX idx_uptime_logs_service ON uptime_logs(service, environment, checked_at DESC);
CREATE INDEX idx_maintenance_windows_org ON maintenance_windows(organization_id, scheduled_start);
CREATE INDEX idx_deployment_history_org ON deployment_history(organization_id, created_at DESC);
CREATE INDEX idx_deployment_env ON deployment_history(environment, created_at DESC);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_service_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_service_status_timestamp BEFORE UPDATE ON service_status FOR EACH ROW EXECUTE FUNCTION update_service_status_timestamp();
CREATE TRIGGER update_retention_policies_timestamp BEFORE UPDATE ON retention_policies FOR EACH ROW EXECUTE FUNCTION update_service_status_timestamp();
CREATE TRIGGER update_incident_logs_timestamp BEFORE UPDATE ON incident_logs FOR EACH ROW EXECUTE FUNCTION update_service_status_timestamp();
CREATE TRIGGER update_maintenance_windows_timestamp BEFORE UPDATE ON maintenance_windows FOR EACH ROW EXECUTE FUNCTION update_service_status_timestamp();

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE application_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE exception_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crash_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE restore_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE restore_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Tenant isolation for org-scoped tables
DO $$
DECLARE
  tables TEXT[] := ARRAY['application_logs','exception_logs','crash_reports',
    'performance_metrics','api_metrics','queue_metrics','notification_metrics',
    'backup_jobs','backup_history','restore_jobs','restore_history','retention_policies',
    'system_alerts','incident_logs','maintenance_windows','deployment_history'];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('CREATE POLICY org_isolation_select ON %I FOR SELECT USING (
      organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN (''super_admin'', ''platform_admin'', ''devops'', ''support_admin''))
    )', t);
    EXECUTE format('CREATE POLICY org_isolation_insert ON %I FOR INSERT WITH CHECK (
      organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN (''super_admin'', ''platform_admin'', ''devops'', ''support_admin''))
    )', t);
    EXECUTE format('CREATE POLICY org_isolation_update ON %I FOR UPDATE USING (
      organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN (''super_admin'', ''platform_admin'', ''devops'', ''support_admin''))
    )', t);
    EXECUTE format('CREATE POLICY org_isolation_delete ON %I FOR DELETE USING (
      organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN (''super_admin'', ''platform_admin'', ''devops'', ''support_admin''))
    )', t);
  END LOOP;
END;
$$;

-- Global tables: super_admin / platform_admin / devops only



CREATE POLICY global_select ON health_checks FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN ('super_admin', 'platform_admin', 'devops'))
);

CREATE POLICY global_select ON service_status FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN ('super_admin', 'platform_admin', 'devops'))
);

CREATE POLICY global_select ON uptime_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN ('super_admin', 'platform_admin', 'devops'))
);

CREATE POLICY global_select ON database_metrics FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN ('super_admin', 'platform_admin', 'devops'))
);
