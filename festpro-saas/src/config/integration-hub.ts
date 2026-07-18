export const API_KEY_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "expired", label: "Expired", color: "bg-gray-100 text-gray-600" },
  { value: "revoked", label: "Revoked", color: "bg-red-100 text-red-700" },
  { value: "rotated", label: "Rotated", color: "bg-amber-100 text-amber-700" },
] as const

export const API_KEY_PERMISSIONS = [
  { value: "read", label: "Read", description: "Read-only access" },
  { value: "write", label: "Write", description: "Create and update" },
  { value: "admin", label: "Admin", description: "Full administrative access" },
  { value: "delete", label: "Delete", description: "Can delete resources" },
  { value: "manage", label: "Manage", description: "Manage API keys and settings" },
] as const

export const WEBHOOK_EVENT_NAMES = [
  { value: "festival.created", label: "Festival Created", category: "festival" },
  { value: "festival.updated", label: "Festival Updated", category: "festival" },
  { value: "festival.deleted", label: "Festival Deleted", category: "festival" },
  { value: "participant.registered", label: "Participant Registered", category: "participant" },
  { value: "participant.approved", label: "Participant Approved", category: "participant" },
  { value: "participant.rejected", label: "Participant Rejected", category: "participant" },
  { value: "competition.scheduled", label: "Competition Scheduled", category: "competition" },
  { value: "competition.completed", label: "Competition Completed", category: "competition" },
  { value: "result.published", label: "Result Published", category: "result" },
  { value: "certificate.generated", label: "Certificate Generated", category: "certificate" },
  { value: "payment.received", label: "Payment Received", category: "payment" },
  { value: "invoice.generated", label: "Invoice Generated", category: "billing" },
  { value: "invoice.paid", label: "Invoice Paid", category: "billing" },
  { value: "invoice.overdue", label: "Invoice Overdue", category: "billing" },
  { value: "volunteer.assigned", label: "Volunteer Assigned", category: "volunteer" },
  { value: "announcement.published", label: "Announcement Published", category: "communication" },
  { value: "judge.assigned", label: "Judge Assigned", category: "judging" },
  { value: "import.completed", label: "Import Completed", category: "import" },
  { value: "export.completed", label: "Export Completed", category: "export" },
  { value: "sync.completed", label: "Sync Completed", category: "sync" },
  { value: "sync.failed", label: "Sync Failed", category: "sync" },
] as const

export const INTEGRATION_PROVIDERS = [
  { code: "google_workspace", name: "Google Workspace", category: "calendar", auth: "oauth2" },
  { code: "google_calendar", name: "Google Calendar", category: "calendar", auth: "oauth2" },
  { code: "google_drive", name: "Google Drive", category: "storage", auth: "oauth2" },
  { code: "microsoft_365", name: "Microsoft 365", category: "calendar", auth: "oauth2" },
  { code: "microsoft_outlook", name: "Microsoft Outlook", category: "email", auth: "oauth2" },
  { code: "zoom", name: "Zoom", category: "meeting", auth: "oauth2" },
  { code: "google_meet", name: "Google Meet", category: "meeting", auth: "oauth2" },
  { code: "slack", name: "Slack", category: "messaging", auth: "oauth2" },
  { code: "discord", name: "Discord", category: "messaging", auth: "oauth2" },
  { code: "telegram", name: "Telegram", category: "messaging", auth: "apikey" },
  { code: "twilio", name: "Twilio SMS", category: "sms", auth: "apikey" },
  { code: "whatsapp", name: "Meta WhatsApp Cloud", category: "messaging", auth: "apikey" },
  { code: "firebase", name: "Firebase Cloud Messaging", category: "messaging", auth: "apikey" },
  { code: "aws_s3", name: "AWS S3", category: "storage", auth: "apikey" },
  { code: "cloudflare_r2", name: "Cloudflare R2", category: "storage", auth: "apikey" },
  { code: "dropbox", name: "Dropbox", category: "storage", auth: "oauth2" },
  { code: "onedrive", name: "OneDrive", category: "storage", auth: "oauth2" },
  { code: "stripe", name: "Stripe", category: "payment", auth: "apikey" },
  { code: "razorpay", name: "Razorpay", category: "payment", auth: "apikey" },
  { code: "paypal", name: "PayPal", category: "payment", auth: "oauth2" },
  { code: "cashfree", name: "Cashfree", category: "payment", auth: "apikey" },
  { code: "phonepe", name: "PhonePe", category: "payment", auth: "apikey" },
  { code: "resend", name: "Resend", category: "email", auth: "apikey" },
  { code: "sendgrid", name: "SendGrid", category: "email", auth: "apikey" },
  { code: "ses", name: "Amazon SES", category: "email", auth: "apikey" },
  { code: "mailgun", name: "Mailgun", category: "email", auth: "apikey" },
  { code: "smtp", name: "SMTP", category: "email", auth: "custom" },
  { code: "msg91", name: "MSG91", category: "sms", auth: "apikey" },
  { code: "custom_sms", name: "Custom SMS Gateway", category: "sms", auth: "custom" },
] as const

export const EVENT_CATEGORIES = [
  { value: "festival", label: "Festivals" },
  { value: "participant", label: "Participants" },
  { value: "competition", label: "Competitions" },
  { value: "result", label: "Results" },
  { value: "certificate", label: "Certificates" },
  { value: "payment", label: "Payments" },
  { value: "billing", label: "Billing" },
  { value: "volunteer", label: "Volunteers" },
  { value: "communication", label: "Communications" },
  { value: "judging", label: "Judging" },
  { value: "import", label: "Imports" },
  { value: "export", label: "Exports" },
  { value: "sync", label: "Sync" },
] as const

export const JOB_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-600" },
  { value: "running", label: "Running", color: "bg-blue-100 text-blue-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-amber-100 text-amber-700" },
  { value: "retrying", label: "Retrying", color: "bg-purple-100 text-purple-700" },
] as const

export const IMPORT_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-600" },
  { value: "validating", label: "Validating", color: "bg-blue-100 text-blue-700" },
  { value: "previewing", label: "Previewing", color: "bg-indigo-100 text-indigo-700" },
  { value: "importing", label: "Importing", color: "bg-amber-100 text-amber-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "rolled_back", label: "Rolled Back", color: "bg-rose-100 text-rose-700" },
] as const

export const EXPORT_FORMATS = [
  { value: "csv", label: "CSV", icon: "FileText" },
  { value: "xlsx", label: "Excel", icon: "FileSpreadsheet" },
  { value: "json", label: "JSON", icon: "Code" },
  { value: "pdf", label: "PDF", icon: "File" },
  { value: "zip", label: "ZIP Archive", icon: "Archive" },
] as const

export const IMPORT_FORMATS = [
  { value: "csv", label: "CSV" },
  { value: "xlsx", label: "Excel" },
  { value: "json", label: "JSON" },
  { value: "zip", label: "ZIP" },
] as const

export const EXPORT_ENTITY_TYPES = [
  { value: "participants", label: "Participants" },
  { value: "judges", label: "Judges" },
  { value: "volunteers", label: "Volunteers" },
  { value: "sponsors", label: "Sponsors" },
  { value: "competitions", label: "Competitions" },
  { value: "results", label: "Results" },
  { value: "inventory", label: "Inventory" },
  { value: "transactions", label: "Transactions" },
  { value: "attendees", label: "Attendees" },
  { value: "certificates", label: "Certificates" },
  { value: "schedules", label: "Schedules" },
  { value: "payments", label: "Payments" },
] as const

export const API_SCOPES = [
  { value: "festivals:read", label: "Read Festivals" },
  { value: "festivals:write", label: "Write Festivals" },
  { value: "participants:read", label: "Read Participants" },
  { value: "participants:write", label: "Write Participants" },
  { value: "competitions:read", label: "Read Competitions" },
  { value: "competitions:write", label: "Write Competitions" },
  { value: "judging:read", label: "Read Judging" },
  { value: "judging:write", label: "Write Judging" },
  { value: "results:read", label: "Read Results" },
  { value: "results:write", label: "Write Results" },
  { value: "finance:read", label: "Read Finance" },
  { value: "finance:write", label: "Write Finance" },
  { value: "inventory:read", label: "Read Inventory" },
  { value: "inventory:write", label: "Write Inventory" },
  { value: "schedules:read", label: "Read Schedules" },
  { value: "schedules:write", label: "Write Schedules" },
  { value: "crm:read", label: "Read CRM" },
  { value: "crm:write", label: "Write CRM" },
  { value: "admin:full", label: "Full Admin Access" },
] as const
