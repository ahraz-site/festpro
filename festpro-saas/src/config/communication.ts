export const NOTIFICATION_CHANNELS = [
  { value: "in_app", label: "In-App", icon: "Bell" },
  { value: "email", label: "Email", icon: "Mail" },
  { value: "sms", label: "SMS", icon: "MessageSquare" },
  { value: "push", label: "Push", icon: "Smartphone" },
  { value: "browser", label: "Browser", icon: "Globe" },
  { value: "whatsapp", label: "WhatsApp", icon: "MessageCircle" },
] as const

export const NOTIFICATION_PRIORITIES = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-600" },
  { value: "normal", label: "Normal", color: "bg-blue-100 text-blue-700" },
  { value: "high", label: "High", color: "bg-amber-100 text-amber-700" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
] as const

export const NOTIFICATION_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-600" },
  { value: "sent", label: "Sent", color: "bg-blue-100 text-blue-700" },
  { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-700" },
  { value: "read", label: "Read", color: "bg-indigo-100 text-indigo-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-500" },
] as const

export const ANNOUNCEMENT_TARGETS = [
  { value: "festival", label: "Festival" },
  { value: "stage", label: "Stage" },
  { value: "judge", label: "Judge" },
  { value: "volunteer", label: "Volunteer" },
  { value: "participant", label: "Participant" },
  { value: "organization", label: "Organization" },
  { value: "all", label: "All Users" },
] as const

export const ANNOUNCEMENT_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-700" },
  { value: "published", label: "Published", color: "bg-green-100 text-green-700" },
  { value: "archived", label: "Archived", color: "bg-gray-100 text-gray-500" },
] as const

export const WORKFLOW_TRIGGER_TYPES = [
  { value: "event", label: "Event", description: "Triggers on database events" },
  { value: "schedule", label: "Schedule", description: "Triggers on a schedule (cron)" },
  { value: "manual", label: "Manual", description: "Triggered manually" },
] as const

export const WORKFLOW_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-600" },
  { value: "paused", label: "Paused", color: "bg-amber-100 text-amber-700" },
  { value: "completed", label: "Completed", color: "bg-blue-100 text-blue-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
] as const

export const WORKFLOW_ACTIONS = [
  { value: "send_email", label: "Send Email", icon: "Mail" },
  { value: "send_sms", label: "Send SMS", icon: "MessageSquare" },
  { value: "send_push", label: "Send Push", icon: "Smartphone" },
  { value: "send_in_app", label: "In-App Notification", icon: "Bell" },
  { value: "create_announcement", label: "Create Announcement", icon: "Megaphone" },
  { value: "update_status", label: "Update Status", icon: "RefreshCw" },
  { value: "webhook", label: "Webhook", icon: "Webhook" },
  { value: "delay", label: "Delay", icon: "Clock" },
] as const

export const AUTOMATIC_EVENTS = [
  { value: "participant.registered", label: "Participant Registered", module: "Participants" },
  { value: "registration.approved", label: "Registration Approved", module: "Participants" },
  { value: "registration.rejected", label: "Registration Rejected", module: "Participants" },
  { value: "competition.scheduled", label: "Competition Scheduled", module: "Competition" },
  { value: "competition.updated", label: "Competition Updated", module: "Competition" },
  { value: "competition.cancelled", label: "Competition Cancelled", module: "Competition" },
  { value: "judge.assigned", label: "Judge Assigned", module: "Judging" },
  { value: "stage.changed", label: "Stage Changed", module: "Scheduling" },
  { value: "result.published", label: "Result Published", module: "Results" },
  { value: "certificate.generated", label: "Certificate Generated", module: "Results" },
  { value: "payment.received", label: "Payment Received", module: "Finance" },
  { value: "payment.failed", label: "Payment Failed", module: "Finance" },
  { value: "announcement.published", label: "Announcement Published", module: "Communication" },
] as const

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600", normal: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700", urgent: "bg-red-100 text-red-700",
}
