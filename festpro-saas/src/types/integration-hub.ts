export type ApiKeyStatus = "active" | "expired" | "revoked" | "rotated"
export type ApiKeyPermission = "read" | "write" | "admin" | "delete" | "manage"
export type OAuthGrantType = "authorization_code" | "client_credentials" | "refresh_token"
export type OAuthTokenStatus = "active" | "expired" | "revoked" | "used"
export type IntegrationProviderCategory = "email" | "sms" | "payment" | "storage" | "calendar" | "meeting" | "messaging" | "crm" | "document" | "ai" | "other"
export type IntegrationConnectionStatus = "active" | "disconnected" | "expired" | "error" | "pending"
export type SyncJobStatus = "pending" | "running" | "completed" | "failed" | "cancelled" | "paused"
export type WebhookEventStatus = "pending" | "delivering" | "delivered" | "failed" | "retrying" | "cancelled"
export type WebhookEventName =
  | "festival.created" | "festival.updated" | "festival.deleted"
  | "participant.registered" | "participant.approved" | "participant.rejected"
  | "competition.scheduled" | "competition.updated" | "competition.completed"
  | "result.published" | "result.updated"
  | "certificate.generated" | "certificate.revoked"
  | "payment.received" | "payment.refunded"
  | "invoice.generated" | "invoice.paid" | "invoice.overdue"
  | "volunteer.assigned" | "volunteer.unassigned"
  | "announcement.published" | "announcement.scheduled"
  | "judge.assigned" | "judge.unassigned"
  | "schedule.changed" | "schedule.conflict"
  | "sponsor.added" | "donation.received"
  | "ticket.sold" | "ticket.verified"
  | "case.created" | "case.updated"
  | "import.completed" | "import.failed"
  | "export.completed" | "export.failed"
  | "user.invited" | "user.joined"
  | "integration.connected" | "integration.disconnected"
  | "sync.completed" | "sync.failed"
  | "backup.completed" | "backup.failed"
export type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled" | "retrying"
export type JobPriority = "low" | "normal" | "high" | "critical"
export type ImportStatus = "pending" | "validating" | "previewing" | "importing" | "completed" | "failed" | "rolled_back"
export type ExportStatus = "pending" | "generating" | "completed" | "failed" | "expired"
export type ExportFormat = "csv" | "xlsx" | "json" | "pdf" | "zip"
export type ImportFormat = "csv" | "xlsx" | "json" | "zip"
export type EventBusStatus = "pending" | "processing" | "delivered" | "failed" | "dead_letter"

export interface ApiClient {
  id: string; organization_id: string; client_name: string; client_description: string | null
  client_id: string; client_secret: string; client_type: "public" | "confidential"
  allowed_grants: string[]; redirect_uris: string[]; allowed_origins: string[]
  is_active: boolean; requires_consent: boolean; token_expiry_seconds: number
  refresh_token_expiry_seconds: number; created_by: string | null; created_at: string; updated_at: string
}

export interface ApiKey {
  id: string; organization_id: string; festival_id: string | null; key_name: string
  key_prefix: string; key_hash: string; key_last_five: string
  permissions: ApiKeyPermission[]; scopes: string[]; allowed_ips: string[]; allowed_referrers: string[]
  rate_limit_per_hour: number; status: ApiKeyStatus; expires_at: string | null; last_used_at: string | null
  created_by: string | null; created_at: string; revoked_at: string | null; revoked_reason: string | null
  rotated_from: string | null; metadata: any
}

export interface IntegrationProvider {
  id: string; provider_code: string; provider_name: string; description: string | null
  category: IntegrationProviderCategory; icon_url: string | null; docs_url: string | null
  is_builtin: boolean; is_active: boolean; config_schema: any; auth_type: string
  default_scopes: string[]; sort_order: number; created_at: string
}

export interface IntegrationConnection {
  id: string; organization_id: string; provider_id: string; connection_name: string
  status: IntegrationConnectionStatus; credentials: any; config: any; expires_at: string | null
  last_test_at: string | null; last_test_result: boolean | null; error_message: string | null
  connected_by: string | null; connected_at: string | null; last_used_at: string | null
  metadata: any; created_at: string; updated_at: string
}

export interface WebhookEndpoint {
  id: string; organization_id: string; festival_id: string | null; name: string
  description: string | null; url: string; secret: string; events: WebhookEventName[]
  is_active: boolean; max_retries: number; retry_interval_seconds: number
  rate_limit_per_minute: number; timeout_seconds: number; signature_header: string
  filter_expression: string | null; headers: any; last_success_at: string | null
  last_failure_at: string | null; consecutive_failures: number; created_by: string | null
  created_at: string; updated_at: string
}

export interface WebhookEvent {
  id: string; organization_id: string; endpoint_id: string | null; event_name: WebhookEventName
  payload: any; headers: any; idempotency_key: string; status: WebhookEventStatus
  attempt_count: number; max_attempts: number; next_retry_at: string | null; created_at: string
}

export interface WebhookDelivery {
  id: string; webhook_event_id: string; endpoint_id: string; attempt_number: number
  request_url: string; request_headers: any; request_body: string | null
  response_status_code: number | null; response_headers: any; response_body: string | null
  duration_ms: number | null; status: WebhookEventStatus; error_message: string | null
  delivered_at: string | null; created_at: string
}

export interface EventBusEntry {
  id: string; organization_id: string; event_name: WebhookEventName; source: string
  source_id: string | null; actor_id: string | null; payload: any; priority: JobPriority
  status: EventBusStatus; idempotency_key: string; processed_at: string | null
  error_message: string | null; retry_count: number; max_retries: number; created_at: string
}

export interface ScheduledJob {
  id: string; organization_id: string; job_name: string; job_type: string; job_config: any
  cron_expression: string | null; is_recurring: boolean; status: JobStatus; priority: JobPriority
  max_retries: number; retry_delay_seconds: number; timeout_minutes: number
  start_at: string | null; end_at: string | null; last_run_at: string | null
  last_run_status: JobStatus | null; next_run_at: string | null
  total_runs: number; failed_runs: number; created_by: string | null; created_at: string; updated_at: string
}

export interface JobExecution {
  id: string; scheduled_job_id: string; organization_id: string; execution_number: number
  status: JobStatus; started_at: string | null; completed_at: string | null; duration_ms: number | null
  error_message: string | null; result: any; retry_attempt: number; trigger_type: string; created_at: string
}

export interface FileImport {
  id: string; organization_id: string; festival_id: string | null; template_id: string | null
  filename: string; file_path: string; file_size: number; file_type: string; format: ImportFormat
  status: ImportStatus; total_rows: number; processed_rows: number; failed_rows: number
  skipped_rows: number; error_rows: any[]; validation_errors: any[]; preview_data: any
  mapping_config: any; options: any; rollback_available: boolean; rollback_at: string | null
  completed_at: string | null; created_by: string | null; created_at: string; updated_at: string
}

export interface FileExport {
  id: string; organization_id: string; festival_id: string | null; export_name: string
  format: ExportFormat; status: ExportStatus; entity_type: string; filters: any; sort: any
  columns: string[]; include_headers: boolean; file_path: string | null; file_size: number | null
  total_records: number; processed_records: number; expires_at: string | null
  downloaded_at: string | null; download_count: number; options: any; error_message: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface ImportTemplate {
  id: string; organization_id: string; template_name: string; template_type: string
  format: ImportFormat; mapping_config: any; validation_rules: any; default_values: any
  column_mappings: any; is_active: boolean; created_by: string | null; created_at: string; updated_at: string
}

export interface IntegrationDashboardData {
  total_api_keys: number; active_api_keys: number; total_webhooks: number; active_webhooks: number
  total_integrations: number; active_integrations: number; pending_events: number; failed_events: number
  total_jobs: number; pending_jobs: number; running_jobs: number; failed_jobs: number
  total_imports: number; completed_imports: number; failed_imports: number
  total_exports: number; completed_exports: number; failed_exports: number
  api_requests_today: number; webhook_deliveries_today: number
}

export interface ApiUsageStats {
  total_requests: number; successful_requests: number; failed_requests: number
  avg_response_time_ms: number; requests_by_endpoint: Record<string, number>
  requests_by_method: Record<string, number>; requests_by_hour: Record<string, number>
  top_consumers: { key_name: string; count: number }[]
}

export interface OAuthClient {
  id: string; organization_id: string; client_id: string; client_secret: string
  client_name: string; client_description: string | null; client_uri: string | null
  logo_uri: string | null; redirect_uris: string[]; allowed_grant_types: OAuthGrantType[]
  allowed_scopes: string[]; is_confidential: boolean; is_active: boolean
  token_endpoint_auth_method: string; require_auth_consent: boolean
  access_token_lifetime: number; refresh_token_lifetime: number
  authorization_code_lifetime: number; created_by: string | null; created_at: string; updated_at: string
}

export interface DeadLetterJob {
  id: string; organization_id: string; job_type: string; source: string; source_id: string | null
  payload: any; error_message: string; error_stack: string | null; failed_attempts: number
  last_attempt_at: string; status: string; created_at: string
}
