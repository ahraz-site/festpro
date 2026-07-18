export type ComplianceFramework = "soc2" | "iso_27001" | "gdpr" | "hipaa" | "pci_dss" | "fedramp"
export type ComplianceStatus = "non_compliant" | "partially_compliant" | "compliant" | "audited"
export type RiskLevel = "critical" | "high" | "medium" | "low" | "informational"
export type RiskStatus = "identified" | "assessed" | "mitigated" | "accepted" | "monitoring"
export type SecurityScanCategory = "sast" | "dast" | "dependency" | "container" | "secret" | "license" | "sbom" | "infrastructure"
export type ScanResult = "pass" | "fail" | "warning" | "error"
export type ReleaseChannel = "stable" | "lts" | "beta" | "alpha" | "nightly"
export type ReleaseReadinessStatus = "draft" | "in_review" | "approved" | "rejected" | "deployed"
export type IncidentSeverity = "sev1_critical" | "sev2_high" | "sev3_medium" | "sev4_low"
export type IncidentStatus = "detected" | "triaging" | "investigating" | "mitigating" | "resolved" | "post_mortem"
export type MaintenanceType = "security_patch" | "bugfix" | "performance" | "feature" | "infrastructure" | "compliance"
export type MaintenanceStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "failed"
export type BenchmarkCategory = "api" | "database" | "cache" | "realtime" | "background" | "storage" | "network"

export interface SecurityScanResult {
  id: string
  scan_type: SecurityScanCategory
  scan_name: string
  scan_result: ScanResult
  severity: RiskLevel
  finding_title: string
  finding_description: string
  affected_resource: string
  remediation: string
  cve_id: string
  cvss_score: number
  module_name: string
  scan_duration_ms: number
  scanner_version: string
  raw_output: string
  scanned_by: string
  scanned_at: string
  created_at: string
}

export interface ComplianceEvidence {
  id: string
  framework: ComplianceFramework
  control_id: string
  control_title: string
  control_description: string
  status: ComplianceStatus
  evidence_type: string
  evidence_url: string
  evidence_content: string
  owner_id: string | null
  reviewed_by: string | null
  last_reviewed_at: string | null
  next_review_date: string | null
  notes: string
  created_at: string
  updated_at: string
}

export interface RiskRegister {
  id: string
  risk_title: string
  risk_description: string
  category: string
  risk_level: RiskLevel
  likelihood: number
  impact: number
  risk_score: number
  status: RiskStatus
  mitigation_strategy: string
  contingency_plan: string
  owner_id: string | null
  target_resolution_date: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export interface PolicyEntry {
  id: string
  policy_name: string
  policy_type: string
  version: string
  content: string
  summary: string
  is_active: boolean
  effective_date: string
  review_date: string | null
  owner_id: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
}

export interface IncidentRecord {
  id: string
  incident_title: string
  incident_description: string
  severity: IncidentSeverity
  status: IncidentStatus
  detected_at: string
  acknowledged_at: string | null
  resolved_at: string | null
  root_cause: string
  resolution: string
  post_mortem: string
  plan_id: string | null
  assigned_to: string | null
  duration_minutes: number
  created_at: string
  updated_at: string
}

export interface PerformanceBenchmark {
  id: string
  benchmark_name: string
  category: BenchmarkCategory
  metric_name: string
  metric_value: number
  metric_unit: string
  threshold_warning: number
  threshold_critical: number
  status: string
  environment: string
  runner_version: string
  raw_results: Record<string, any>
  ran_by: string | null
  ran_at: string
  created_at: string
}

export interface HealthCheck {
  id: string
  check_name: string
  check_type: string
  target_url: string
  expected_status: number
  actual_status: number
  response_time_ms: number
  is_healthy: boolean
  error_message: string
  check_interval_seconds: number
  last_success_at: string | null
  last_failure_at: string | null
  consecutive_failures: number
  created_at: string
  updated_at: string
}

export interface ReleaseReadiness {
  id: string
  release_version: string
  release_channel: ReleaseChannel
  status: ReleaseReadinessStatus
  release_notes: string
  changelog: string
  is_critical: boolean
  requires_downtime: boolean
  security_scan_pass: boolean
  performance_benchmark_pass: boolean
  compliance_check_pass: boolean
  integration_test_pass: boolean
  load_test_pass: boolean
  accessibility_check_pass: boolean
  localization_check_pass: boolean
  reviewed_by: string | null
  approved_by: string | null
  deployed_at: string | null
  created_at: string
  updated_at: string
}

export interface LtsVersion {
  id: string
  version: string
  lts_start_date: string
  lts_end_date: string
  support_level: string
  security_support_until: string | null
  critical_fixes_only: boolean
  migration_path: string
  known_issues: string
  deprecation_notes: string
  created_at: string
  updated_at: string
}

export interface MaintenanceCalendar {
  id: string
  title: string
  description: string
  maintenance_type: MaintenanceType
  status: MaintenanceStatus
  affected_services: string[]
  scheduled_start: string
  scheduled_end: string
  actual_start: string | null
  actual_end: string | null
  is_emergency: boolean
  notification_sent: boolean
  created_by: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
}

export interface ConsentRecord {
  id: string
  user_id: string
  consent_type: string
  consent_granted: boolean
  consent_version: string
  ip_address: string
  user_agent: string
  granted_at: string | null
  revoked_at: string | null
  created_at: string
}

export interface DataProcessingRecord {
  id: string
  record_name: string
  data_category: string
  processing_purpose: string
  legal_basis: string
  data_retention_days: number
  is_automated: boolean
  third_party_shares: string[]
  security_measures: string
  data_protection_impact: boolean
  created_at: string
  updated_at: string
}

export interface Module30DashboardData {
  total_scan_results: number
  critical_findings: number
  high_findings: number
  total_compliance_controls: number
  compliant_controls: number
  total_risks: number
  critical_risks: number
  open_incidents: number
  total_benchmarks: number
  failed_benchmarks: number
  healthy_checks: number
  unhealthy_checks: number
  total_releases: number
  active_lts_versions: number
  upcoming_maintenance: number
  security_score: number
  compliance_score: number
  performance_score: number
  availability_score: number
  by_severity: { severity: string; count: number }[]
  by_framework: { framework: string; count: number }[]
  recent_incidents: IncidentRecord[]
}
