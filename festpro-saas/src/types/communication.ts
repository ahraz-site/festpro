export type NotificationChannel = "email" | "sms" | "push" | "in_app" | "browser" | "whatsapp"
export type NotificationPriority = "low" | "normal" | "high" | "urgent"
export type NotificationStatus = "pending" | "sent" | "delivered" | "read" | "failed" | "cancelled"
export type AnnouncementTarget = "festival" | "stage" | "judge" | "volunteer" | "participant" | "organization" | "all"
export type AnnouncementStatus = "draft" | "scheduled" | "published" | "archived"
export type WorkflowTriggerType = "event" | "schedule" | "manual"
export type WorkflowActionType = "send_email" | "send_sms" | "send_push" | "send_in_app" | "create_announcement" | "update_status" | "webhook" | "delay"
export type WorkflowStatus = "active" | "inactive" | "paused" | "completed" | "failed"

export interface NotificationTemplate {
  id: string; organization_id: string; template_name: string; channel: NotificationChannel
  subject: string | null; body: string; variables: any; is_system: boolean
  created_by: string | null; created_at: string; updated_at: string
}

export interface Notification {
  id: string; organization_id: string; festival_id: string | null; user_id: string | null
  template_id: string | null; channel: NotificationChannel; title: string; body: string | null
  priority: NotificationPriority; status: NotificationStatus; is_read: boolean; read_at: string | null
  is_archived: boolean; action_url: string | null; action_text: string | null
  source_entity_type: string | null; source_entity_id: string | null
  scheduled_at: string | null; sent_at: string | null; error_message: string | null
  created_by: string | null; created_at: string
}

export interface NotificationLog {
  id: string; notification_id: string; organization_id: string; channel: NotificationChannel
  recipient: string; status: NotificationStatus; attempt_count: number; max_attempts: number
  last_attempt_at: string | null; delivered_at: string | null; error_message: string | null
  response_data: any; created_at: string
}

export interface EmailTemplate {
  id: string; organization_id: string; template_name: string; subject: string
  body_html: string; body_text: string | null; variables: any; from_name: string | null
  from_email: string | null; reply_to: string | null; is_system: boolean
  created_by: string | null; created_at: string; updated_at: string
}

export interface EmailLog {
  id: string; organization_id: string; template_id: string | null; notification_id: string | null
  to_address: string; cc_addresses: any; bcc_addresses: any; subject: string
  body_html: string | null; body_text: string | null; status: NotificationStatus
  attempt_count: number; max_attempts: number; last_attempt_at: string | null
  sent_at: string | null; opened_at: string | null; clicked_at: string | null
  error_message: string | null; provider_response: any; created_at: string
}

export interface SmsTemplate {
  id: string; organization_id: string; template_name: string; body: string
  variables: any; is_system: boolean; created_by: string | null; created_at: string; updated_at: string
}

export interface SmsLog {
  id: string; organization_id: string; template_id: string | null; notification_id: string | null
  to_number: string; body: string; status: NotificationStatus; attempt_count: number; max_attempts: number
  sent_at: string | null; delivered_at: string | null; error_message: string | null
  provider_response: any; created_at: string
}

export interface PushSubscription {
  id: string; user_id: string; organization_id: string; endpoint: string
  p256dh_key: string; auth_key: string; device_type: string | null; user_agent: string | null
  is_active: boolean; created_at: string
}

export interface PushLog {
  id: string; organization_id: string; notification_id: string | null; user_id: string
  title: string; body: string | null; status: NotificationStatus; sent_at: string | null
  error_message: string | null; created_at: string
}

export interface AnnouncementTemplate {
  id: string; organization_id: string; template_name: string; title: string; body: string
  target: AnnouncementTarget; priority: NotificationPriority; variables: any; is_system: boolean
  created_by: string | null; created_at: string; updated_at: string
}

export interface Announcement {
  id: string; organization_id: string; festival_id: string | null; template_id: string | null
  title: string; body: string; target: AnnouncementTarget; priority: NotificationPriority
  status: AnnouncementStatus; is_pinned: boolean; is_emergency: boolean
  scheduled_at: string | null; published_at: string | null; archived_at: string | null
  created_by: string | null; created_at: string; updated_at: string
  template?: AnnouncementTemplate
}

export interface AnnouncementReceiver {
  id: string; announcement_id: string; user_id: string; is_read: boolean; read_at: string | null; created_at: string
}

export interface WorkflowRule {
  id: string; organization_id: string; festival_id: string | null; rule_name: string
  description: string | null; trigger_type: WorkflowTriggerType; trigger_event: string | null
  trigger_config: any; conditions: any; actions: any; status: WorkflowStatus
  priority: number; max_executions: number | null; execution_count: number
  last_executed_at: string | null; created_by: string | null; created_at: string; updated_at: string
}

export interface WorkflowHistory {
  id: string; workflow_rule_id: string; organization_id: string; trigger_event: string | null
  trigger_data: any; conditions_result: boolean | null; actions_results: any
  status: WorkflowStatus; started_at: string; completed_at: string | null
  error_message: string | null; created_at: string
}

export interface ScheduledNotification {
  id: string; organization_id: string; festival_id: string | null; notification_id: string | null
  announcement_id: string | null; template_id: string | null; channel: NotificationChannel
  recipients: any; scheduled_at: string; status: NotificationStatus; processed_at: string | null
  created_by: string | null; created_at: string
}

export interface Module10DashboardData {
  total_notifications: number; unread_notifications: number; total_announcements: number
  active_announcements: number; emergency_announcements: number; active_workflows: number
  pending_emails: number; failed_emails: number; total_email_sent: number
  pending_sms: number; pending_push: number; scheduled_notifications: number
}
