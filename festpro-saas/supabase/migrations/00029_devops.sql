-- ============================================================
-- Module 29: Enterprise DevOps, CI/CD, Kubernetes & Release Engineering
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE devops_environment_type AS ENUM ('development', 'testing', 'qa', 'uat', 'staging', 'production', 'disaster_recovery', 'sandbox');
CREATE TYPE pipeline_status AS ENUM ('pending', 'running', 'succeeded', 'failed', 'cancelled', 'skipped');
CREATE TYPE deployment_status AS ENUM ('pending', 'provisioning', 'deploying', 'healthy', 'degraded', 'failed', 'rolled_back', 'cancelled');
CREATE TYPE deployment_strategy AS ENUM ('recreate', 'rolling', 'blue_green', 'canary', 'ramped');
CREATE TYPE release_status AS ENUM ('draft', 'prerelease', 'released', 'deprecated', 'rolled_back');
CREATE TYPE build_status AS ENUM ('pending', 'building', 'succeeded', 'failed', 'cancelled');
CREATE TYPE container_image_status AS ENUM ('building', 'available', 'deprecated', 'vulnerable');
CREATE TYPE cluster_node_status AS ENUM ('ready', 'not_ready', 'maintenance', 'unknown');
CREATE TYPE cluster_service_status AS ENUM ('running', 'pending', 'stopped', 'failed', 'unknown');
CREATE TYPE feature_rollout_status AS ENUM ('draft', 'active', 'paused', 'completed', 'rolled_back');
CREATE TYPE feature_rollout_strategy AS ENUM ('manual', 'gradual', 'canary', 'ab_test', 'blue_green');
CREATE TYPE scan_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');
CREATE TYPE scan_type AS ENUM ('sast', 'dast', 'dependency', 'container', 'secret', 'license', 'sbom');

-- ============================================================
-- TABLES
-- ============================================================

-- Deployment Environments
CREATE TABLE deployment_environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  env_name VARCHAR(255) NOT NULL,
  env_type devops_environment_type NOT NULL,
  description TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_protected BOOLEAN NOT NULL DEFAULT false,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  auto_deploy BOOLEAN NOT NULL DEFAULT false,
  env_url TEXT DEFAULT '',
  k8s_namespace VARCHAR(255) DEFAULT '',
  k8s_context VARCHAR(255) DEFAULT '',
  region VARCHAR(100) DEFAULT '',
  config JSONB DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deployment Pipelines
CREATE TABLE deployment_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  repository_url TEXT DEFAULT '',
  repository_branch VARCHAR(255) DEFAULT 'main',
  pipeline_yaml TEXT DEFAULT '',
  triggers TEXT[] DEFAULT '{}',
  environment_id UUID REFERENCES deployment_environments(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}',
  created_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deployment History
CREATE TABLE deployment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID REFERENCES deployment_pipelines(id) ON DELETE SET NULL,
  environment_id UUID REFERENCES deployment_environments(id) ON DELETE SET NULL,
  release_id UUID REFERENCES release_versions(id) ON DELETE SET NULL,
  deployment_name VARCHAR(500) NOT NULL,
  commit_sha VARCHAR(64) DEFAULT '',
  commit_message TEXT DEFAULT '',
  branch VARCHAR(255) DEFAULT '',
  status deployment_status NOT NULL DEFAULT 'pending',
  strategy deployment_strategy NOT NULL DEFAULT 'rolling',
  deployment_yaml TEXT DEFAULT '',
  duration_seconds INTEGER DEFAULT 0,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  error_message TEXT DEFAULT '',
  rolled_back_from UUID REFERENCES deployment_history(id) ON DELETE SET NULL,
  rollback_time TIMESTAMPTZ,
  triggered_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  approved_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deployment Artifacts
CREATE TABLE deployment_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID NOT NULL REFERENCES deployment_history(id) ON DELETE CASCADE,
  artifact_name VARCHAR(500) NOT NULL,
  artifact_type VARCHAR(100) NOT NULL DEFAULT 'docker',
  storage_path TEXT DEFAULT '',
  file_size_bytes BIGINT DEFAULT 0,
  checksum VARCHAR(64) DEFAULT '',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Build History
CREATE TABLE build_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID REFERENCES deployment_pipelines(id) ON DELETE SET NULL,
  commit_sha VARCHAR(64) DEFAULT '',
  branch VARCHAR(255) DEFAULT '',
  build_number VARCHAR(50) NOT NULL,
  status build_status NOT NULL DEFAULT 'pending',
  docker_image_tag VARCHAR(255) DEFAULT '',
  docker_image_sha VARCHAR(255) DEFAULT '',
  duration_seconds INTEGER DEFAULT 0,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  error_message TEXT DEFAULT '',
  triggered_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Build Logs
CREATE TABLE build_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES build_history(id) ON DELETE CASCADE,
  log_level VARCHAR(20) NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  source VARCHAR(100) DEFAULT '',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Release Versions
CREATE TABLE release_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name VARCHAR(255) NOT NULL DEFAULT 'festpro-saas',
  version VARCHAR(50) NOT NULL UNIQUE,
  release_name VARCHAR(500) DEFAULT '',
  status release_status NOT NULL DEFAULT 'draft',
  commit_sha VARCHAR(64) DEFAULT '',
  commit_message TEXT DEFAULT '',
  branch VARCHAR(255) DEFAULT '',
  docker_image_tag VARCHAR(255) DEFAULT '',
  changelog TEXT DEFAULT '',
  is_critical BOOLEAN NOT NULL DEFAULT false,
  is_security_release BOOLEAN NOT NULL DEFAULT false,
  requires_downtime BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  released_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Release Notes
CREATE TABLE release_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES release_versions(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL DEFAULT 'feature',
  title VARCHAR(500) NOT NULL,
  description TEXT DEFAULT '',
  ticket_url TEXT DEFAULT '',
  commit_sha VARCHAR(64) DEFAULT '',
  author_id UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rollback History
CREATE TABLE rollback_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID NOT NULL REFERENCES deployment_history(id) ON DELETE CASCADE,
  rolled_back_to_version VARCHAR(50) DEFAULT '',
  reason TEXT DEFAULT '',
  duration_seconds INTEGER DEFAULT 0,
  success BOOLEAN NOT NULL DEFAULT false,
  triggered_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Infrastructure Changes
CREATE TABLE infrastructure_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_name VARCHAR(500) NOT NULL,
  change_detail TEXT DEFAULT '',
  previous_state JSONB DEFAULT '{}',
  new_state JSONB DEFAULT '{}',
  applied_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cluster Nodes
CREATE TABLE cluster_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_name VARCHAR(255) NOT NULL UNIQUE,
  node_role VARCHAR(50) NOT NULL DEFAULT 'worker',
  status cluster_node_status NOT NULL DEFAULT 'unknown',
  k8s_version VARCHAR(50) DEFAULT '',
  instance_type VARCHAR(100) DEFAULT '',
  region VARCHAR(100) DEFAULT '',
  cpu_cores INTEGER DEFAULT 0,
  memory_gb NUMERIC(8,2) DEFAULT 0,
  pod_capacity INTEGER DEFAULT 0,
  pod_count INTEGER DEFAULT 0,
  cpu_usage_percent NUMERIC(5,2) DEFAULT 0,
  memory_usage_percent NUMERIC(5,2) DEFAULT 0,
  labels JSONB DEFAULT '{}',
  taints JSONB DEFAULT '{}',
  last_heartbeat TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cluster Services
CREATE TABLE cluster_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(255) NOT NULL,
  namespace VARCHAR(255) NOT NULL DEFAULT 'default',
  service_type VARCHAR(50) DEFAULT 'ClusterIP',
  status cluster_service_status NOT NULL DEFAULT 'unknown',
  replicas INTEGER DEFAULT 0,
  available_replicas INTEGER DEFAULT 0,
  image VARCHAR(500) DEFAULT '',
  cpu_request NUMERIC(8,2) DEFAULT 0,
  memory_request_mb INTEGER DEFAULT 0,
  cpu_limit NUMERIC(8,2) DEFAULT 0,
  memory_limit_mb INTEGER DEFAULT 0,
  labels JSONB DEFAULT '{}',
  annotations JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kubernetes Workloads
CREATE TABLE kubernetes_workloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workload_name VARCHAR(255) NOT NULL,
  namespace VARCHAR(255) NOT NULL DEFAULT 'default',
  workload_type VARCHAR(50) NOT NULL DEFAULT 'deployment',
  image VARCHAR(500) DEFAULT '',
  replicas INTEGER DEFAULT 1,
  strategy deployment_strategy NOT NULL DEFAULT 'rolling',
  config JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT '',
  created_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Container Images
CREATE TABLE container_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_id UUID REFERENCES container_registries(id) ON DELETE SET NULL,
  image_name VARCHAR(500) NOT NULL,
  image_tag VARCHAR(255) NOT NULL DEFAULT 'latest',
  image_sha VARCHAR(255) DEFAULT '',
  size_bytes BIGINT DEFAULT 0,
  status container_image_status NOT NULL DEFAULT 'available',
  vulnerability_count INTEGER DEFAULT 0,
  critical_vulnerabilities INTEGER DEFAULT 0,
  high_vulnerabilities INTEGER DEFAULT 0,
  labels JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(image_name, image_tag)
);

-- Container Registries
CREATE TABLE container_registries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_name VARCHAR(255) NOT NULL,
  registry_url VARCHAR(500) NOT NULL,
  registry_provider VARCHAR(100) DEFAULT 'dockerhub',
  username VARCHAR(255) DEFAULT '',
  password_encrypted TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Environment Variables
CREATE TABLE environment_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment_id UUID REFERENCES deployment_environments(id) ON DELETE CASCADE,
  var_key VARCHAR(255) NOT NULL,
  var_value TEXT NOT NULL,
  is_secret BOOLEAN NOT NULL DEFAULT false,
  is_encrypted BOOLEAN NOT NULL DEFAULT false,
  description TEXT DEFAULT '',
  created_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(environment_id, var_key)
);

-- Secret References
CREATE TABLE secret_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_name VARCHAR(255) NOT NULL,
  secret_provider VARCHAR(100) NOT NULL DEFAULT 'kubernetes',
  provider_path TEXT DEFAULT '',
  provider_key VARCHAR(255) DEFAULT '',
  environments UUID[] DEFAULT '{}',
  description TEXT DEFAULT '',
  rotation_days INTEGER DEFAULT 90,
  last_rotated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Feature Rollouts
CREATE TABLE feature_rollouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  strategy feature_rollout_strategy NOT NULL DEFAULT 'manual',
  status feature_rollout_status NOT NULL DEFAULT 'draft',
  rollout_percentage INTEGER DEFAULT 100,
  target_groups JSONB DEFAULT '{}',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  config JSONB DEFAULT '{}',
  created_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blue-Green Deployments
CREATE TABLE blue_green_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID NOT NULL REFERENCES deployment_history(id) ON DELETE CASCADE,
  active_service VARCHAR(500) DEFAULT '',
  standby_service VARCHAR(500) DEFAULT '',
  active_version VARCHAR(50) DEFAULT '',
  standby_version VARCHAR(50) DEFAULT '',
  current_active VARCHAR(10) NOT NULL DEFAULT 'blue',
  traffic_blue INTEGER NOT NULL DEFAULT 100,
  traffic_green INTEGER NOT NULL DEFAULT 0,
  switch_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Canary Deployments
CREATE TABLE canary_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID NOT NULL REFERENCES deployment_history(id) ON DELETE CASCADE,
  canary_percentage INTEGER NOT NULL DEFAULT 10,
  max_percentage INTEGER NOT NULL DEFAULT 100,
  step_percentage INTEGER NOT NULL DEFAULT 10,
  interval_minutes INTEGER NOT NULL DEFAULT 5,
  evaluation_metric VARCHAR(100) DEFAULT 'error_rate',
  threshold NUMERIC(5,2) DEFAULT 1.0,
  auto_promote BOOLEAN NOT NULL DEFAULT false,
  auto_rollback BOOLEAN NOT NULL DEFAULT true,
  current_percentage INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Maintenance Releases
CREATE TABLE maintenance_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  environment_id UUID REFERENCES deployment_environments(id) ON DELETE SET NULL,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  is_emergency BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
  affected_services TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  approved_by UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security Scans
CREATE TABLE security_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID REFERENCES build_history(id) ON DELETE SET NULL,
  scan_type scan_type NOT NULL,
  scan_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  scanner_name VARCHAR(255) DEFAULT '',
  total_findings INTEGER DEFAULT 0,
  critical_findings INTEGER DEFAULT 0,
  high_findings INTEGER DEFAULT 0,
  medium_findings INTEGER DEFAULT 0,
  low_findings INTEGER DEFAULT 0,
  report_url TEXT DEFAULT '',
  sbom_url TEXT DEFAULT '',
  duration_seconds INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_deploy_envs_active ON deployment_environments(is_active);
CREATE INDEX idx_pipelines_active ON deployment_pipelines(is_active);
CREATE INDEX idx_deploy_history_env ON deployment_history(environment_id);
CREATE INDEX idx_deploy_history_status ON deployment_history(status);
CREATE INDEX idx_deploy_history_created ON deployment_history(created_at);
CREATE INDEX idx_build_history_pipeline ON build_history(pipeline_id);
CREATE INDEX idx_build_history_status ON build_history(status);
CREATE INDEX idx_build_logs_build ON build_logs(build_id);
CREATE INDEX idx_releases_status ON release_versions(status);
CREATE INDEX idx_rollback_deployment ON rollback_history(deployment_id);
CREATE INDEX idx_cluster_nodes_status ON cluster_nodes(status);
CREATE INDEX idx_cluster_services_namespace ON cluster_services(namespace);
CREATE INDEX idx_container_images_name ON container_images(image_name);
CREATE INDEX idx_env_vars_env ON environment_variables(environment_id);
CREATE INDEX idx_feature_rollouts_status ON feature_rollouts(status);
CREATE INDEX idx_security_scans_build ON security_scans(build_id);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE deployment_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rollback_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cluster_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cluster_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE kubernetes_workloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_registries ENABLE ROW LEVEL SECURITY;
ALTER TABLE environment_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE secret_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_rollouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blue_green_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE canary_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_scans ENABLE ROW LEVEL SECURITY;

-- Platform admin / devops admin: full access
CREATE POLICY devops_admin_environments ON deployment_environments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'platform_admin'))
);
CREATE POLICY devops_admin_pipelines ON deployment_pipelines FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'platform_admin'))
);
CREATE POLICY devops_admin_deployments ON deployment_history FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'platform_admin'))
);
CREATE POLICY devops_admin_releases ON release_versions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'platform_admin'))
);
CREATE POLICY devops_admin_clusters ON cluster_nodes FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'platform_admin'))
);
CREATE POLICY devops_admin_containers ON container_images FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'platform_admin'))
);
CREATE POLICY devops_admin_builds ON build_history FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'platform_admin'))
);
CREATE POLICY devops_admin_env_vars ON environment_variables FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'platform_admin'))
);
CREATE POLICY devops_admin_secrets ON secret_references FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'platform_admin'))
);
CREATE POLICY devops_admin_feature_rollouts ON feature_rollouts FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'platform_admin'))
);
CREATE POLICY devops_admin_maintenance ON maintenance_releases FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('super_admin', 'platform_admin'))
);

-- Read access for authenticated users
CREATE POLICY read_deployments ON deployment_history FOR SELECT TO authenticated USING (true);
CREATE POLICY read_builds ON build_history FOR SELECT TO authenticated USING (true);
CREATE POLICY read_releases ON release_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY read_environments ON deployment_environments FOR SELECT TO authenticated USING (true);
CREATE POLICY read_pipelines ON deployment_pipelines FOR SELECT TO authenticated USING (true);
CREATE POLICY read_cluster_nodes ON cluster_nodes FOR SELECT TO authenticated USING (true);
CREATE POLICY read_cluster_services ON cluster_services FOR SELECT TO authenticated USING (true);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_devops_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_deploy_envs_updated_at BEFORE UPDATE ON deployment_environments FOR EACH ROW EXECUTE FUNCTION update_devops_updated_at();
CREATE TRIGGER update_pipelines_updated_at BEFORE UPDATE ON deployment_pipelines FOR EACH ROW EXECUTE FUNCTION update_devops_updated_at();
CREATE TRIGGER update_releases_updated_at BEFORE UPDATE ON release_versions FOR EACH ROW EXECUTE FUNCTION update_devops_updated_at();
CREATE TRIGGER update_cluster_nodes_updated_at BEFORE UPDATE ON cluster_nodes FOR EACH ROW EXECUTE FUNCTION update_devops_updated_at();
CREATE TRIGGER update_cluster_services_updated_at BEFORE UPDATE ON cluster_services FOR EACH ROW EXECUTE FUNCTION update_devops_updated_at();
CREATE TRIGGER update_workloads_updated_at BEFORE UPDATE ON kubernetes_workloads FOR EACH ROW EXECUTE FUNCTION update_devops_updated_at();
CREATE TRIGGER update_container_images_updated_at BEFORE UPDATE ON container_images FOR EACH ROW EXECUTE FUNCTION update_devops_updated_at();
CREATE TRIGGER update_registries_updated_at BEFORE UPDATE ON container_registries FOR EACH ROW EXECUTE FUNCTION update_devops_updated_at();
CREATE TRIGGER update_env_vars_updated_at BEFORE UPDATE ON environment_variables FOR EACH ROW EXECUTE FUNCTION update_devops_updated_at();
CREATE TRIGGER update_secrets_updated_at BEFORE UPDATE ON secret_references FOR EACH ROW EXECUTE FUNCTION update_devops_updated_at();
CREATE TRIGGER update_feature_rollouts_updated_at BEFORE UPDATE ON feature_rollouts FOR EACH ROW EXECUTE FUNCTION update_devops_updated_at();
CREATE TRIGGER update_blue_green_updated_at BEFORE UPDATE ON blue_green_deployments FOR EACH ROW EXECUTE FUNCTION update_devops_updated_at();
CREATE TRIGGER update_canary_updated_at BEFORE UPDATE ON canary_deployments FOR EACH ROW EXECUTE FUNCTION update_devops_updated_at();
CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON maintenance_releases FOR EACH ROW EXECUTE FUNCTION update_devops_updated_at();

-- Auto-generate build_number
CREATE OR REPLACE FUNCTION generate_build_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SPLIT_PART(build_number, '-', 2) AS INTEGER)), 0) + 1
  INTO next_num FROM build_history WHERE pipeline_id = NEW.pipeline_id;
  NEW.build_number := 'b-' || LPAD(next_num::text, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_build_insert BEFORE INSERT ON build_history FOR EACH ROW EXECUTE FUNCTION generate_build_number();
