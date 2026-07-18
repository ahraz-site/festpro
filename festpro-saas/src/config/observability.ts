export const HEALTH_STATUSES = [
  { value: "healthy", label: "Healthy", color: "bg-green-100 text-green-700" },
  { value: "degraded", label: "Degraded", color: "bg-amber-100 text-amber-700" },
  { value: "unhealthy", label: "Unhealthy", color: "bg-red-100 text-red-700" },
  { value: "down", label: "Down", color: "bg-rose-100 text-rose-700" },
  { value: "unknown", label: "Unknown", color: "bg-gray-100 text-gray-600" },
] as const

export const LOG_LEVELS = [
  { value: "debug", label: "DEBUG", color: "bg-gray-100 text-gray-600" },
  { value: "info", label: "INFO", color: "bg-blue-100 text-blue-700" },
  { value: "warn", label: "WARN", color: "bg-amber-100 text-amber-700" },
  { value: "error", label: "ERROR", color: "bg-red-100 text-red-700" },
  { value: "fatal", label: "FATAL", color: "bg-rose-100 text-rose-700" },
  { value: "trace", label: "TRACE", color: "bg-purple-100 text-purple-700" },
] as const

export const BACKUP_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-600" },
  { value: "running", label: "Running", color: "bg-blue-100 text-blue-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-amber-100 text-amber-700" },
] as const

export const ALERT_SEVERITIES = [
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "medium", label: "Medium", color: "bg-amber-100 text-amber-700" },
  { value: "low", label: "Low", color: "bg-yellow-100 text-yellow-700" },
  { value: "info", label: "Info", color: "bg-blue-100 text-blue-700" },
] as const

export const INCIDENT_SEVERITIES = [
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" },
  { value: "major", label: "Major", color: "bg-orange-100 text-orange-700" },
  { value: "minor", label: "Minor", color: "bg-amber-100 text-amber-700" },
  { value: "warning", label: "Warning", color: "bg-yellow-100 text-yellow-700" },
  { value: "info", label: "Info", color: "bg-blue-100 text-blue-700" },
] as const

export const INCIDENT_STATUSES = [
  { value: "detected", label: "Detected", color: "bg-red-100 text-red-700" },
  { value: "investigating", label: "Investigating", color: "bg-orange-100 text-orange-700" },
  { value: "identified", label: "Identified", color: "bg-amber-100 text-amber-700" },
  { value: "mitigated", label: "Mitigated", color: "bg-blue-100 text-blue-700" },
  { value: "resolved", label: "Resolved", color: "bg-green-100 text-green-700" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-600" },
] as const

export const SERVICES = [
  { value: "app", label: "Application" },
  { value: "database", label: "Database" },
  { value: "storage", label: "Storage" },
  { value: "realtime", label: "Realtime" },
  { value: "api", label: "API" },
  { value: "queue", label: "Queue" },
  { value: "auth", label: "Authentication" },
  { value: "webhook", label: "Webhook" },
  { value: "integration", label: "Integration" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "cdn", label: "CDN" },
] as const

export const ALERT_CHANNELS = [
  { value: "email", label: "Email" },
  { value: "push", label: "Push" },
  { value: "sms", label: "SMS" },
  { value: "slack", label: "Slack" },
  { value: "webhook", label: "Webhook" },
  { value: "pager", label: "PagerDuty" },
] as const

export const BACKUP_TYPES = [
  { value: "full", label: "Full" },
  { value: "incremental", label: "Incremental" },
  { value: "differential", label: "Differential" },
  { value: "point_in_time", label: "Point-in-Time" },
] as const

export const MAINTENANCE_STATUSES = [
  { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-700" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-100 text-amber-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-600" },
] as const
