export type AuditAction =
  | "login" | "logout" | "registration" | "role_change" | "permission_change"
  | "festival_created" | "competition_updated" | "participant_registered"
  | "result_published" | "certificate_generated" | "payment_added"
  | "notification_sent" | "settings_changed" | "delete_operation"
  | "api_token_created" | "api_token_revoked" | "backup_created" | "backup_restored"
  | "feature_flag_changed" | "security_event" | "system_update" | "user_impersonated"

export type AuditStatus = "success" | "failure" | "pending" | "blocked"
export type SecurityEventType =
  | "suspicious_login" | "brute_force" | "account_lockout" | "password_reset"
  | "2fa_attempt" | "rate_limit_exceeded" | "ip_blocked" | "session_hijack"
  | "token_reused" | "unusual_location" | "mass_operation" | "data_export"
export type SecurityEventSeverity = "low" | "medium" | "high" | "critical"
export type DeviceType = "desktop" | "mobile" | "tablet" | "unknown"
export type BackupStatus = "pending" | "running" | "completed" | "failed" | "verified"
export type HealthStatus = "healthy" | "degraded" | "down" | "unknown"
export type MaintenanceScope = "full" | "read_only" | "specific_module"
export type TokenPermission = "read" | "write" | "admin" | "custom"

export interface AuditLog {
  id: string; organization_id: string | null; festival_id: string | null; user_id: string | null
  action: AuditAction; entity_type: string | null; entity_id: string | null
  description: string | null; changes: any; metadata: any; ip_address: string | null
  user_agent: string | null; status: AuditStatus; created_at: string
  profiles?: { first_name: string; last_name: string } | null
}

export interface LoginHistory {
  id: string; user_id: string; organization_id: string | null
  ip_address: string; browser: string | null; device: string | null; os: string | null
  country: string | null; city: string | null; latitude: number | null; longitude: number | null
  isp: string | null; login_at: string; logout_at: string | null
  session_duration: number | null; status: AuditStatus; failure_reason: string | null
  auth_method: string; created_at: string
}

export interface SecurityEvent {
  id: string; organization_id: string | null; user_id: string | null
  event_type: SecurityEventType; severity: SecurityEventSeverity
  title: string; description: string | null; ip_address: string | null
  user_agent: string | null; location: any; metadata: any
  is_resolved: boolean; resolved_at: string | null; resolved_by: string | null
  created_at: string
}

export interface FailedLogin {
  id: string; user_id: string | null; email: string | null
  ip_address: string; browser: string | null; device: string | null; os: string | null
  country: string | null; attempt_count: number; last_attempt_at: string
  blocked_until: string | null; created_at: string
}

export interface ActiveSession {
  id: string; user_id: string; organization_id: string | null
  session_token: string; ip_address: string | null; browser: string | null
  device: string | null; os: string | null; country: string | null; city: string | null
  is_current: boolean; is_mobile: boolean; last_active_at: string
  expires_at: string; created_at: string
  profiles?: { first_name: string; last_name: string; email: string } | null
}

export interface Device {
  id: string; user_id: string; organization_id: string | null
  device_name: string | null; device_type: DeviceType; browser: string | null
  os: string | null; ip_address: string | null; fingerprint: string | null
  is_trusted: boolean; last_used_at: string; created_at: string
}

export interface IpWhitelist {
  id: string; organization_id: string; ip_address: string; label: string | null
  created_by: string | null; created_at: string
}

export interface IpBlacklist {
  id: string; organization_id: string; ip_address: string; reason: string | null
  blocked_by: string | null; blocked_at: string; expires_at: string | null
  is_active: boolean
}

export interface SystemSetting {
  id: string; organization_id: string | null; setting_key: string
  setting_value: any; setting_group: string; description: string | null
  is_encrypted: boolean; created_by: string | null; updated_by: string | null
  created_at: string; updated_at: string
}

export interface MaintenanceMode {
  id: string; organization_id: string | null; is_active: boolean
  scope: MaintenanceScope; message: string | null
  allowed_roles: string[]; allowed_user_ids: string[]
  scheduled_start: string | null; scheduled_end: string | null
  started_by: string | null; started_at: string | null; ended_at: string | null
  created_at: string
}

export interface SystemHealth {
  id: string; organization_id: string | null; component: string
  status: HealthStatus; latency_ms: number | null; error_rate: number | null
  message: string | null; last_checked_at: string; created_at: string
}

export interface FeatureFlag {
  id: string; organization_id: string | null; flag_key: string
  flag_name: string; description: string | null; is_enabled: boolean
  is_beta: boolean; allowed_roles: string[]; percentage: number | null
  metadata: any; created_by: string | null; updated_by: string | null
  created_at: string; updated_at: string
}

export interface ApiToken {
  id: string; organization_id: string; user_id: string; token_name: string
  token_hash: string; token_prefix: string | null; permissions: TokenPermission
  allowed_ips: string[]; allowed_modules: string[]; rate_limit: number
  expires_at: string | null; last_used_at: string | null
  is_revoked: boolean; revoked_at: string | null; created_at: string
}

export interface SystemBackup {
  id: string; organization_id: string | null; backup_name: string
  backup_type: string; file_size: number | null; file_path: string | null
  checksum: string | null; includes_data: string[]; includes_files: string[]
  status: BackupStatus; error_message: string | null; verified_at: string | null
  created_by: string | null; created_at: string; completed_at: string | null
}

export interface ErrorLog {
  id: string; organization_id: string | null; festival_id: string | null; user_id: string | null
  error_type: string; error_message: string | null; stack_trace: string | null
  route: string | null; method: string | null; status_code: number | null
  ip_address: string | null; user_agent: string | null
  request_body: any; response_body: any; headers: any; metadata: any
  is_resolved: boolean; resolved_at: string | null; created_at: string
}

export interface ActivityStream {
  id: string; organization_id: string | null; festival_id: string | null; user_id: string | null
  activity_type: string; title: string; description: string | null
  entity_type: string | null; entity_id: string | null; metadata: any
  is_system: boolean; created_at: string
  profiles?: { first_name: string; last_name: string } | null
}

export interface Module11DashboardData {
  total_audit_logs: number; security_events: number; critical_events: number
  active_sessions: number; failed_logins_24h: number; api_tokens: number
  system_health_healthy: number; system_health_total: number
  error_logs_24h: number; feature_flags_enabled: number
  backups_completed: number; ip_blacklist_count: number
}
