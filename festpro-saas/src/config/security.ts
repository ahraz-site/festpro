export const AUDIT_ACTIONS = [
  { value: "login", label: "Login", icon: "LogIn" },
  { value: "logout", label: "Logout", icon: "LogOut" },
  { value: "registration", label: "Registration", icon: "UserPlus" },
  { value: "role_change", label: "Role Change", icon: "Shield" },
  { value: "permission_change", label: "Permission Change", icon: "ShieldAlert" },
  { value: "festival_created", label: "Festival Created", icon: "Calendar" },
  { value: "competition_updated", label: "Competition Updated", icon: "Trophy" },
  { value: "participant_registered", label: "Participant Registered", icon: "Users" },
  { value: "result_published", label: "Result Published", icon: "Award" },
  { value: "certificate_generated", label: "Certificate Generated", icon: "FileText" },
  { value: "payment_added", label: "Payment Added", icon: "DollarSign" },
  { value: "notification_sent", label: "Notification Sent", icon: "Bell" },
  { value: "settings_changed", label: "Settings Changed", icon: "Settings" },
  { value: "delete_operation", label: "Delete Operation", icon: "Trash2" },
  { value: "api_token_created", label: "API Token Created", icon: "Key" },
  { value: "api_token_revoked", label: "API Token Revoked", icon: "KeyRound" },
  { value: "backup_created", label: "Backup Created", icon: "Database" },
  { value: "feature_flag_changed", label: "Feature Flag Changed", icon: "Flag" },
  { value: "security_event", label: "Security Event", icon: "AlertTriangle" },
  { value: "system_update", label: "System Update", icon: "RefreshCw" },
] as const

export const AUDIT_STATUSES = [
  { value: "success", label: "Success", color: "bg-green-100 text-green-700" },
  { value: "failure", label: "Failure", color: "bg-red-100 text-red-700" },
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "blocked", label: "Blocked", color: "bg-gray-100 text-gray-700" },
] as const

export const SECURITY_EVENT_TYPES = [
  { value: "suspicious_login", label: "Suspicious Login", severity: "high" },
  { value: "brute_force", label: "Brute Force", severity: "critical" },
  { value: "account_lockout", label: "Account Lockout", severity: "high" },
  { value: "password_reset", label: "Password Reset", severity: "medium" },
  { value: "2fa_attempt", label: "2FA Attempt", severity: "medium" },
  { value: "rate_limit_exceeded", label: "Rate Limit Exceeded", severity: "low" },
  { value: "ip_blocked", label: "IP Blocked", severity: "high" },
  { value: "session_hijack", label: "Session Hijack", severity: "critical" },
  { value: "unusual_location", label: "Unusual Location", severity: "medium" },
  { value: "mass_operation", label: "Mass Operation", severity: "high" },
  { value: "data_export", label: "Data Export", severity: "low" },
] as const

export const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600", medium: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700", critical: "bg-red-100 text-red-700",
}

export const BACKUP_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-600" },
  { value: "running", label: "Running", color: "bg-blue-100 text-blue-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "verified", label: "Verified", color: "bg-indigo-100 text-indigo-700" },
] as const

export const HEALTH_STATUSES = [
  { value: "healthy", label: "Healthy", color: "bg-green-100 text-green-700" },
  { value: "degraded", label: "Degraded", color: "bg-amber-100 text-amber-700" },
  { value: "down", label: "Down", color: "bg-red-100 text-red-700" },
  { value: "unknown", label: "Unknown", color: "bg-gray-100 text-gray-600" },
] as const

export const TOKEN_PERMISSIONS = [
  { value: "read", label: "Read Only" },
  { value: "write", label: "Read & Write" },
  { value: "admin", label: "Admin" },
  { value: "custom", label: "Custom" },
] as const

export const SYSTEM_SETTING_GROUPS = [
  { value: "general", label: "General" },
  { value: "branding", label: "Branding" },
  { value: "regional", label: "Regional" },
  { value: "security", label: "Security" },
  { value: "email", label: "Email" },
  { value: "storage", label: "Storage" },
  { value: "system", label: "System" },
] as const
