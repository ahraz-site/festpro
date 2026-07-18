export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "down" | "unknown"
export type ServiceName = "app" | "database" | "storage" | "realtime" | "api" | "queue" | "auth" | "webhook" | "integration" | "email" | "sms" | "cdn"
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal" | "trace"
export type LogSource = "app" | "api" | "auth" | "database" | "queue" | "notification" | "security" | "cron" | "webhook" | "integration" | "admin"
export type BackupStatus = "pending" | "running" | "completed" | "failed" | "cancelled" | "expired"
export type BackupType = "full" | "incremental" | "differential" | "point_in_time"
export type RestoreStatus = "pending" | "running" | "validating" | "completed" | "failed" | "cancelled"
export type RestoreType = "full" | "point_in_time" | "selective"
export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info"
export type AlertStatus = "active" | "acknowledged" | "resolved" | "silenced" | "expired"
export type IncidentSeverity = "critical" | "major" | "minor" | "warning" | "info"
export type IncidentStatus = "detected" | "investigating" | "identified" | "mitigated" | "resolved" | "closed" | "postmortem"
export type MaintenanceStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "extended"

export interface SystemHealth {
  id: string; service: ServiceName; status: HealthStatus; message: string | null
  response_time_ms: number | null; last_checked_at: string; next_check_at: string | null
  consecutive_failures: number; metadata: any; created_at: string
}

export interface HealthCheck {
  id: string; check_name: string; check_type: string; service: ServiceName
  status: HealthStatus; response_time_ms: number | null; error_message: string | null
  check_interval_seconds: number; is_scheduled: boolean; last_run_at: string | null
  next_run_at: string | null; metadata: any; created_at: string
}

export interface ServiceStatus {
  id: string; service: ServiceName; status: HealthStatus; previous_status: HealthStatus | null
  uptime_percent: number; version: string | null; environment: string; region: string | null
  host: string | null; port: number | null; is_maintenance_mode: boolean
  last_downtime_at: string | null; last_downtime_duration: number | null; created_at: string; updated_at: string
}

export interface ApplicationLog {
  id: string; organization_id: string | null; log_level: LogLevel; log_source: LogSource
  message: string; metadata: any; stack_trace: string | null; ip_address: string | null
  user_agent: string | null; request_id: string | null; correlation_id: string | null
  session_id: string | null; trace_id: string | null; span_id: string | null
  created_by: string | null; created_at: string
}

export interface ErrorLog {
  id: string; organization_id: string | null; log_level: LogLevel; error_code: string | null
  error_type: string; message: string; stack_trace: string | null; metadata: any
  ip_address: string | null; user_agent: string | null; request_path: string | null
  request_method: string | null; status_code: number | null; request_id: string | null
  correlation_id: string | null; is_resolved: boolean; resolved_at: string | null
  resolved_by: string | null; created_at: string
}

export interface BackupJob {
  id: string; organization_id: string; backup_name: string; backup_type: BackupType
  status: BackupStatus; storage_location: string; storage_path: string | null
  file_size_bytes: number | null; checksum: string | null; is_encrypted: boolean
  includes_data: boolean; includes_schema: boolean; includes_config: boolean; includes_files: boolean
  retention_days: number; scheduled_at: string | null; started_at: string | null
  completed_at: string | null; duration_seconds: number | null; error_message: string | null
  metadata: any; created_by: string | null; created_at: string
}

export interface RestoreJob {
  id: string; organization_id: string; backup_job_id: string | null; restore_name: string
  restore_type: RestoreType; status: RestoreStatus; target_environment: string
  point_in_time: string | null; includes_data: boolean; includes_schema: boolean
  includes_config: boolean; restore_location: string | null; started_at: string | null
  completed_at: string | null; duration_seconds: number | null; error_message: string | null
  validation_status: string | null; metadata: any; requested_by: string | null
  approved_by: string | null; approved_at: string | null; created_at: string
}

export interface SystemAlert {
  id: string; organization_id: string; alert_name: string; alert_type: string
  severity: AlertSeverity; status: AlertStatus; message: string; details: any
  source: ServiceName; channel: string; acknowledged_by: string | null
  acknowledged_at: string | null; resolved_by: string | null; resolved_at: string | null
  resolved_note: string | null; escalation_level: number; notified_users: string[]; created_at: string
}

export interface IncidentLog {
  id: string; organization_id: string; incident_name: string; incident_id: string
  severity: IncidentSeverity; status: IncidentStatus; description: string; impact: string | null
  root_cause: string | null; resolution: string | null; affected_services: ServiceName[]
  detected_at: string; acknowledged_at: string | null; mitigated_at: string | null
  resolved_at: string | null; closed_at: string | null; response_time_minutes: number | null
  time_to_resolve_minutes: number | null; assigned_to: string | null; postmortem: string | null
  tags: string[]; metadata: any; created_by: string | null; created_at: string; updated_at: string
}

export interface MaintenanceWindow {
  id: string; organization_id: string; title: string; description: string | null
  affected_services: ServiceName[]; status: MaintenanceStatus
  scheduled_start: string; scheduled_end: string; actual_start: string | null
  actual_end: string | null; is_public: boolean; public_message: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface DeploymentHistory {
  id: string; organization_id: string; deployment_version: string; deployment_type: string
  status: string; commit_hash: string | null; branch: string | null; environment: string
  changelog: string | null; artifacts: any; started_at: string | null; completed_at: string | null
  duration_seconds: number | null; error_message: string | null; deployed_by: string | null
  approved_by: string | null; rollback_version: string | null; metadata: any; created_at: string
}

export interface ObservabilityDashboardData {
  services: { name: string; status: HealthStatus; uptime: number }[]
  active_alerts: number; critical_alerts: number; open_incidents: number
  total_logs_today: number; error_logs_today: number; total_backups: number
  failed_backups: number; pending_restores: number; total_deployments: number
  avg_response_time: number; db_size_gb: number; queue_depth: number
}
