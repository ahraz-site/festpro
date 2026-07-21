-- ============================================================
-- Module 30: Enterprise Production Hardening, Security Compliance,
--            Performance Optimization & Enterprise Release
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN CREATE TYPE compliance_framework AS ENUM ('soc2', 'iso_27001', 'gdpr', 'hipaa', 'pci_dss', 'fedramp'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE compliance_status AS ENUM ('non_compliant', 'partially_compliant', 'compliant', 'audited'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE risk_level AS ENUM ('critical', 'high', 'medium', 'low', 'informational'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE risk_status AS ENUM ('identified', 'assessed', 'mitigated', 'accepted', 'monitoring'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE security_scan_category AS ENUM ('sast', 'dast', 'dependency', 'container', 'secret', 'license', 'sbom', 'infrastructure'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE scan_result AS ENUM ('pass', 'fail', 'warning', 'error'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE release_channel AS ENUM ('stable', 'lts', 'beta', 'alpha', 'nightly'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE release_readiness_status AS ENUM ('draft', 'in_review', 'approved', 'rejected', 'deployed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE hardening_incident_severity AS ENUM ('sev1_critical', 'sev2_high', 'sev3_medium', 'sev4_low'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE hardening_incident_status AS ENUM ('detected', 'triaging', 'investigating', 'mitigating', 'resolved', 'post_mortem'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE hardening_maintenance_type AS ENUM ('security_patch', 'bugfix', 'performance', 'feature', 'infrastructure', 'compliance'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE hardening_maintenance_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'failed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE benchmark_category AS ENUM ('api', 'database', 'cache', 'realtime', 'background', 'storage', 'network'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================
-- TABLES
-- ============================================================

-- Security Scans (tracking all automated security scan results)
CREATE TABLE security_scan_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_type security_scan_category NOT NULL,
  scan_name VARCHAR(500) NOT NULL,
  scan_result scan_result NOT NULL DEFAULT 'pass',
  severity risk_level NOT NULL DEFAULT 'informational',
  finding_title VARCHAR(500) NOT NULL,
  finding_description TEXT DEFAULT '',
  affected_resource VARCHAR(500) DEFAULT '',
  remediation TEXT DEFAULT '',
  cve_id VARCHAR(50) DEFAULT '',
  cvss_score NUMERIC(3,1) DEFAULT 0,
  module_name VARCHAR(255) DEFAULT '',
  scan_duration_ms INTEGER DEFAULT 0,
  scanner_version VARCHAR(100) DEFAULT '',
  raw_output TEXT DEFAULT '',
  scanned_by VARCHAR(255) DEFAULT 'system',
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE security_scan_results ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE security_scan_results ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE security_scan_results ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE security_scan_results ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE security_scan_results ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE security_scan_results ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE security_scan_results ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE security_scan_results ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE security_scan_results ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE security_scan_results ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE security_scan_results ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE security_scan_results ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE security_scan_results ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Compliance Evidence
CREATE TABLE compliance_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework compliance_framework NOT NULL,
  control_id VARCHAR(100) NOT NULL,
  control_title VARCHAR(500) NOT NULL,
  control_description TEXT DEFAULT '',
  status compliance_status NOT NULL DEFAULT 'non_compliant',
  evidence_type VARCHAR(100) DEFAULT 'documentation',
  evidence_url TEXT DEFAULT '',
  evidence_content TEXT DEFAULT '',
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  last_reviewed_at TIMESTAMPTZ,
  next_review_date DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(framework, control_id)
);
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE compliance_evidence ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Risk Register
CREATE TABLE risk_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_title VARCHAR(500) NOT NULL,
  risk_description TEXT DEFAULT '',
  category VARCHAR(255) DEFAULT 'security',
  risk_level risk_level NOT NULL DEFAULT 'medium',
  likelihood INTEGER NOT NULL DEFAULT 1,
  impact INTEGER NOT NULL DEFAULT 1,
  risk_score NUMERIC(5,2) DEFAULT 0,
  status risk_status NOT NULL DEFAULT 'identified',
  mitigation_strategy TEXT DEFAULT '',
  contingency_plan TEXT DEFAULT '',
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  target_resolution_date DATE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE risk_register ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE risk_register ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE risk_register ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE risk_register ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE risk_register ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE risk_register ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE risk_register ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE risk_register ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE risk_register ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE risk_register ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE risk_register ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE risk_register ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE risk_register ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Policy Library
CREATE TABLE policy_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name VARCHAR(500) NOT NULL,
  policy_type VARCHAR(100) NOT NULL DEFAULT 'security',
  version VARCHAR(20) NOT NULL DEFAULT '1.0',
  content TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  review_date DATE,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE policy_library ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE policy_library ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE policy_library ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE policy_library ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE policy_library ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE policy_library ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE policy_library ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE policy_library ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE policy_library ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE policy_library ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE policy_library ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE policy_library ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE policy_library ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Incident Response Plans
CREATE TABLE incident_response_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name VARCHAR(500) NOT NULL,
  plan_type VARCHAR(100) NOT NULL DEFAULT 'security',
  severity hardening_incident_severity NOT NULL DEFAULT 'sev3_medium',
  steps JSONB DEFAULT '[]',
  roles JSONB DEFAULT '{}',
  communication_template TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_tested_at TIMESTAMPTZ,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE incident_response_plans ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_response_plans ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_response_plans ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_response_plans ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_response_plans ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_response_plans ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_response_plans ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_response_plans ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_response_plans ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_response_plans ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_response_plans ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_response_plans ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_response_plans ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Incident Records
CREATE TABLE incident_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_title VARCHAR(500) NOT NULL,
  incident_description TEXT DEFAULT '',
  severity hardening_incident_severity NOT NULL DEFAULT 'sev3_medium',
  status hardening_incident_status NOT NULL DEFAULT 'detected',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  root_cause TEXT DEFAULT '',
  resolution TEXT DEFAULT '',
  post_mortem TEXT DEFAULT '',
  plan_id UUID REFERENCES incident_response_plans(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE incident_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE incident_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Performance Benchmarks
CREATE TABLE performance_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_name VARCHAR(500) NOT NULL,
  category benchmark_category NOT NULL,
  metric_name VARCHAR(255) NOT NULL,
  metric_value NUMERIC(15,4) NOT NULL,
  metric_unit VARCHAR(50) DEFAULT 'ms',
  threshold_warning NUMERIC(15,4) DEFAULT 0,
  threshold_critical NUMERIC(15,4) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pass',
  environment VARCHAR(100) DEFAULT 'production',
  runner_version VARCHAR(100) DEFAULT '',
  raw_results JSONB DEFAULT '{}',
  ran_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ran_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE performance_benchmarks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE performance_benchmarks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE performance_benchmarks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE performance_benchmarks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE performance_benchmarks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE performance_benchmarks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE performance_benchmarks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE performance_benchmarks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE performance_benchmarks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE performance_benchmarks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE performance_benchmarks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE performance_benchmarks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE performance_benchmarks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Health Checks


-- Release Readiness
CREATE TABLE release_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_version VARCHAR(50) NOT NULL,
  release_channel release_channel NOT NULL DEFAULT 'stable',
  status release_readiness_status NOT NULL DEFAULT 'draft',
  release_notes TEXT DEFAULT '',
  changelog TEXT DEFAULT '',
  is_critical BOOLEAN NOT NULL DEFAULT false,
  requires_downtime BOOLEAN NOT NULL DEFAULT false,
  security_scan_pass BOOLEAN DEFAULT false,
  performance_benchmark_pass BOOLEAN DEFAULT false,
  compliance_check_pass BOOLEAN DEFAULT false,
  integration_test_pass BOOLEAN DEFAULT false,
  load_test_pass BOOLEAN DEFAULT false,
  accessibility_check_pass BOOLEAN DEFAULT false,
  localization_check_pass BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE release_readiness ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE release_readiness ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE release_readiness ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE release_readiness ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE release_readiness ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE release_readiness ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE release_readiness ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE release_readiness ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE release_readiness ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE release_readiness ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE release_readiness ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE release_readiness ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE release_readiness ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- LTS Versions
CREATE TABLE lts_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version VARCHAR(50) NOT NULL UNIQUE,
  lts_start_date DATE NOT NULL,
  lts_end_date DATE NOT NULL,
  support_level VARCHAR(50) NOT NULL DEFAULT 'active',
  security_support_until DATE,
  critical_fixes_only BOOLEAN DEFAULT false,
  migration_path TEXT DEFAULT '',
  known_issues TEXT DEFAULT '',
  deprecation_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE lts_versions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE lts_versions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE lts_versions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE lts_versions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE lts_versions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE lts_versions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE lts_versions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE lts_versions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE lts_versions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE lts_versions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE lts_versions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE lts_versions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE lts_versions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Maintenance Calendar
CREATE TABLE maintenance_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT DEFAULT '',
  hardening_maintenance_type hardening_maintenance_type NOT NULL DEFAULT 'security_patch',
  status hardening_maintenance_status NOT NULL DEFAULT 'scheduled',
  affected_services TEXT[] DEFAULT '{}',
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  is_emergency BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE maintenance_calendar ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE maintenance_calendar ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE maintenance_calendar ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE maintenance_calendar ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE maintenance_calendar ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE maintenance_calendar ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE maintenance_calendar ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE maintenance_calendar ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE maintenance_calendar ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE maintenance_calendar ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE maintenance_calendar ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE maintenance_calendar ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE maintenance_calendar ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Consent Records (GDPR)
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type VARCHAR(100) NOT NULL,
  consent_granted BOOLEAN NOT NULL DEFAULT false,
  consent_version VARCHAR(20) DEFAULT '1.0',
  ip_address VARCHAR(45) DEFAULT '',
  user_agent TEXT DEFAULT '',
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE consent_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Data Processing Records (GDPR)
CREATE TABLE data_processing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_name VARCHAR(500) NOT NULL,
  data_category VARCHAR(100) NOT NULL,
  processing_purpose TEXT DEFAULT '',
  legal_basis VARCHAR(100) DEFAULT 'consent',
  data_retention_days INTEGER DEFAULT 365,
  is_automated BOOLEAN DEFAULT false,
  third_party_shares TEXT[] DEFAULT '{}',
  security_measures TEXT DEFAULT '',
  data_protection_impact BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE data_processing_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE data_processing_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE data_processing_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE data_processing_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE data_processing_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE data_processing_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE data_processing_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE data_processing_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE data_processing_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE data_processing_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE data_processing_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE data_processing_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE data_processing_records ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_sec_scan_results_type ON security_scan_results(scan_type);
CREATE INDEX idx_sec_scan_results_severity ON security_scan_results(severity);
CREATE INDEX idx_sec_scan_results_module ON security_scan_results(module_name);
CREATE INDEX idx_compliance_framework ON compliance_evidence(framework);
CREATE INDEX idx_compliance_status ON compliance_evidence(status);
CREATE INDEX idx_risk_level ON risk_register(risk_level);
CREATE INDEX idx_risk_status ON risk_register(status);
CREATE INDEX idx_incident_status ON incident_records(status);
CREATE INDEX idx_incident_severity ON incident_records(severity);
CREATE INDEX idx_benchmarks_category ON performance_benchmarks(category);

CREATE INDEX idx_release_status ON release_readiness(status);
CREATE INDEX idx_release_channel ON release_readiness(release_channel);
CREATE INDEX idx_lts_versions ON lts_versions(version);
CREATE INDEX idx_maintenance_status ON maintenance_calendar(status);
CREATE INDEX idx_maintenance_scheduled ON maintenance_calendar(scheduled_start);
CREATE INDEX idx_consent_user ON consent_records(user_id);
CREATE INDEX idx_consent_type ON consent_records(consent_type);

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE security_scan_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_response_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_benchmarks ENABLE ROW LEVEL SECURITY;

ALTER TABLE release_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE lts_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_records ENABLE ROW LEVEL SECURITY;

-- Platform admins / security team: full access
CREATE POLICY enterprise_admin_all ON security_scan_results FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN ('super_admin', 'platform_admin'))
);
CREATE POLICY enterprise_admin_compliance ON compliance_evidence FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN ('super_admin', 'platform_admin'))
);
CREATE POLICY enterprise_admin_risks ON risk_register FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN ('super_admin', 'platform_admin'))
);
CREATE POLICY enterprise_admin_policies ON policy_library FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN ('super_admin', 'platform_admin'))
);
CREATE POLICY enterprise_admin_incidents ON incident_records FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN ('super_admin', 'platform_admin'))
);
CREATE POLICY enterprise_admin_benchmarks ON performance_benchmarks FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN ('super_admin', 'platform_admin'))
);

CREATE POLICY enterprise_admin_releases ON release_readiness FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN ('super_admin', 'platform_admin'))
);
CREATE POLICY enterprise_admin_maintenance ON maintenance_calendar FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN ('super_admin', 'platform_admin'))
);

-- Read access for authenticated users
CREATE POLICY read_scan_results ON security_scan_results FOR SELECT TO authenticated USING (true);
CREATE POLICY read_compliance ON compliance_evidence FOR SELECT TO authenticated USING (true);
CREATE POLICY read_risks ON risk_register FOR SELECT TO authenticated USING (true);
CREATE POLICY read_policies ON policy_library FOR SELECT TO authenticated USING (true);
CREATE POLICY read_incidents ON incident_records FOR SELECT TO authenticated USING (true);
CREATE POLICY read_benchmarks ON performance_benchmarks FOR SELECT TO authenticated USING (true);

CREATE POLICY read_releases ON release_readiness FOR SELECT TO authenticated USING (true);
CREATE POLICY read_lts ON lts_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY read_maintenance ON maintenance_calendar FOR SELECT TO authenticated USING (true);

-- Consent records: users can read own, admins can read all
CREATE POLICY consent_self ON consent_records FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY consent_admin ON consent_records FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role::text IN ('super_admin', 'platform_admin'))
);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_enterprise_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_compliance_updated_at BEFORE UPDATE ON compliance_evidence FOR EACH ROW EXECUTE FUNCTION update_enterprise_updated_at();
CREATE TRIGGER update_risk_updated_at BEFORE UPDATE ON risk_register FOR EACH ROW EXECUTE FUNCTION update_enterprise_updated_at();
CREATE TRIGGER update_policy_updated_at BEFORE UPDATE ON policy_library FOR EACH ROW EXECUTE FUNCTION update_enterprise_updated_at();
CREATE TRIGGER update_incident_updated_at BEFORE UPDATE ON incident_records FOR EACH ROW EXECUTE FUNCTION update_enterprise_updated_at();
CREATE TRIGGER update_incident_plan_updated_at BEFORE UPDATE ON incident_response_plans FOR EACH ROW EXECUTE FUNCTION update_enterprise_updated_at();
CREATE TRIGGER update_release_updated_at BEFORE UPDATE ON release_readiness FOR EACH ROW EXECUTE FUNCTION update_enterprise_updated_at();
CREATE TRIGGER update_lts_updated_at BEFORE UPDATE ON lts_versions FOR EACH ROW EXECUTE FUNCTION update_enterprise_updated_at();
CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON maintenance_calendar FOR EACH ROW EXECUTE FUNCTION update_enterprise_updated_at();

CREATE TRIGGER update_dpr_updated_at BEFORE UPDATE ON data_processing_records FOR EACH ROW EXECUTE FUNCTION update_enterprise_updated_at();

-- Auto-calculate risk score
CREATE OR REPLACE FUNCTION calculate_risk_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.risk_score := NEW.likelihood * NEW.impact;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_risk_insert_update BEFORE INSERT OR UPDATE ON risk_register FOR EACH ROW EXECUTE FUNCTION calculate_risk_score();
