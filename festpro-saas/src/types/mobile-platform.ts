export type MobileDevicePlatform = "ios" | "android" | "web" | "desktop"
export type MobileDeviceStatus = "active" | "inactive" | "suspended" | "revoked"
export type MobileSessionStatus = "active" | "expired" | "terminated" | "revoked"
export type SyncOperation = "create" | "update" | "delete" | "upsert"
export type SyncStatus = "pending" | "syncing" | "completed" | "failed" | "conflict"
export type SyncPriority = "high" | "medium" | "low"
export type PushProvider = "web_push" | "firebase" | "apns" | "custom"
export type PushStatus = "pending" | "sent" | "delivered" | "failed" | "clicked"
export type MobileActivityType = "login" | "logout" | "sync" | "scan" | "form_submit" | "media_upload" | "view" | "search" | "settings_change" | "error"
export type MobileRole = "platform_owner" | "organization_admin" | "festival_admin" | "judge" | "volunteer" | "reception" | "medical" | "finance" | "inventory" | "participant"
export type OfflineFormStatus = "draft" | "queued" | "submitted" | "synced" | "failed"

export interface MobileDevice {
  id: string; organization_id: string; device_id: string; device_name: string
  device_platform: MobileDevicePlatform; device_model: string | null; os_version: string | null
  app_version: string | null; fcm_token: string | null; is_biometric_enabled: boolean
  is_pin_enabled: boolean; pin_hash: string | null; last_sync_at: string | null
  last_active_at: string; status: MobileDeviceStatus; metadata: any
  created_at: string; updated_at: string
}

export interface DeviceRegistration {
  id: string; organization_id: string; device_id: string; user_id: string
  is_remembered: boolean; is_trusted: boolean; registered_at: string
  last_verified_at: string | null; expires_at: string | null; is_active: boolean
  created_at: string
}

export interface DeviceSession {
  id: string; organization_id: string; device_registration_id: string; user_id: string
  session_token: string; refresh_token: string | null; status: MobileSessionStatus
  ip_address: string | null; user_agent: string | null; location: any
  started_at: string; expires_at: string | null; terminated_at: string | null; created_at: string
}

export interface OfflineSyncQueue {
  id: string; organization_id: string; festival_id: string | null; device_id: string; user_id: string
  sync_operation: SyncOperation; table_name: string; record_id: string | null; payload: any
  previous_state: any | null; status: SyncStatus; priority: SyncPriority
  conflict_resolution: string | null; error_message: string | null; retry_count: number
  max_retries: number; locked_at: string | null; synced_at: string | null
  created_at: string; updated_at: string
}

export interface SyncLog {
  id: string; organization_id: string; device_id: string | null; user_id: string | null
  sync_type: string; table_name: string | null; records_synced: number; records_failed: number
  conflicts_resolved: number; duration_ms: number | null; status: SyncStatus
  error_message: string | null; started_at: string; completed_at: string | null; created_at: string
}

export interface MobileSetting {
  id: string; organization_id: string; device_id: string; user_id: string
  theme: string; language: string; offline_storage_mb: number; auto_sync: boolean
  sync_interval_minutes: number; push_enabled: boolean; push_sound: boolean; push_vibrate: boolean
  biometric_login: boolean; pin_login: boolean; reduce_data: boolean; high_contrast: boolean
  font_size: string; notification_preferences: any
  created_at: string; updated_at: string
}

export interface PushSubscription {
  id: string; organization_id: string; device_id: string; user_id: string
  subscription: any; provider: PushProvider; endpoint: string; p256dh_key: string | null
  auth_key: string | null; is_active: boolean; failed_attempts: number; last_sent_at: string | null
  expires_at: string | null; created_at: string; updated_at: string
}

export interface PushDeliveryLog {
  id: string; organization_id: string; festival_id: string | null; subscription_id: string | null
  user_id: string | null; title: string; body: string | null; data: any
  notification_type: string | null; priority: SyncPriority; status: PushStatus
  error_message: string | null; sent_at: string | null; delivered_at: string | null
  clicked_at: string | null; created_at: string
}

export interface MobileActivityLog {
  id: string; organization_id: string; festival_id: string | null; device_id: string | null
  user_id: string; activity_type: MobileActivityType; description: string | null; metadata: any
  ip_address: string | null; user_agent: string | null; duration_ms: number | null
  is_offline: boolean; created_at: string
}

export interface OfflineForm {
  id: string; organization_id: string; festival_id: string | null; device_id: string; user_id: string
  form_type: string; form_data: any; form_schema_version: string | null; status: OfflineFormStatus
  submitted_at: string | null; synced_at: string | null; remote_record_id: string | null
  error_message: string | null; created_at: string; updated_at: string
}

export interface OfflineMediaUpload {
  id: string; organization_id: string; festival_id: string | null; device_id: string; user_id: string
  file_name: string; file_size: number | null; mime_type: string | null; file_path: string | null
  thumbnail_path: string | null; storage_bucket: string; media_type: string | null
  compression_level: string; status: SyncStatus; error_message: string | null
  retry_count: number; uploaded_at: string | null; created_at: string; updated_at: string
}

export interface SyncQueueItem {
  id: string; table_name: string; sync_operation: SyncOperation; payload: any
  record_id?: string; previous_state?: any; priority: SyncPriority; festival_id?: string
}

export interface PushNotificationPayload {
  title: string; body?: string; data?: any; notification_type?: string
  priority?: SyncPriority; user_id?: string; role?: MobileRole; festival_id?: string
}

export interface QrVerificationResult {
  valid: boolean; type: string; data: any; message: string
}

export interface MobileDashboardData {
  active_devices: number; registered_devices: number; pending_syncs: number
  failed_syncs: number; push_sent: number; push_delivered: number; push_failed: number
  offline_forms: number; pending_uploads: number; today_activity: number
  sync_success_rate: number; active_sessions: number
}
