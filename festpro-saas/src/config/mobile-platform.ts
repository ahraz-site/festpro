export const MOBILE_DEVICE_PLATFORMS = [
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
  { value: "web", label: "Web" },
  { value: "desktop", label: "Desktop" },
] as const

export const MOBILE_DEVICE_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-600" },
  { value: "suspended", label: "Suspended", color: "bg-red-100 text-red-700" },
  { value: "revoked", label: "Revoked", color: "bg-rose-100 text-rose-700" },
] as const

export const MOBILE_SESSION_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "expired", label: "Expired", color: "bg-gray-100 text-gray-600" },
  { value: "terminated", label: "Terminated", color: "bg-amber-100 text-amber-700" },
  { value: "revoked", label: "Revoked", color: "bg-red-100 text-red-700" },
] as const

export const SYNC_OPERATIONS = [
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "upsert", label: "Upsert" },
] as const

export const SYNC_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-600" },
  { value: "syncing", label: "Syncing", color: "bg-blue-100 text-blue-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "conflict", label: "Conflict", color: "bg-amber-100 text-amber-700" },
] as const

export const SYNC_PRIORITIES = [
  { value: "high", label: "High", color: "text-red-600" },
  { value: "medium", label: "Medium", color: "text-amber-600" },
  { value: "low", label: "Low", color: "text-gray-600" },
] as const

export const PUSH_PROVIDERS = [
  { value: "web_push", label: "Web Push" },
  { value: "firebase", label: "Firebase" },
  { value: "apns", label: "APNs" },
  { value: "custom", label: "Custom" },
] as const

export const PUSH_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-600" },
  { value: "sent", label: "Sent", color: "bg-blue-100 text-blue-700" },
  { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "clicked", label: "Clicked", color: "bg-purple-100 text-purple-700" },
] as const

export const MOBILE_ACTIVITY_TYPES = [
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "sync", label: "Sync" },
  { value: "scan", label: "QR Scan" },
  { value: "form_submit", label: "Form Submit" },
  { value: "media_upload", label: "Media Upload" },
  { value: "view", label: "View" },
  { value: "search", label: "Search" },
  { value: "settings_change", label: "Settings Change" },
  { value: "error", label: "Error" },
] as const

export const MOBILE_ROLES = [
  { value: "platform_owner", label: "Platform Owner" },
  { value: "organization_admin", label: "Organization Admin" },
  { value: "festival_admin", label: "Festival Admin" },
  { value: "judge", label: "Judge" },
  { value: "volunteer", label: "Volunteer" },
  { value: "reception", label: "Reception" },
  { value: "medical", label: "Medical" },
  { value: "finance", label: "Finance" },
  { value: "inventory", label: "Inventory" },
  { value: "participant", label: "Participant" },
] as const

export const OFFLINE_FORM_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "queued", label: "Queued", color: "bg-blue-100 text-blue-700" },
  { value: "submitted", label: "Submitted", color: "bg-amber-100 text-amber-700" },
  { value: "synced", label: "Synced", color: "bg-green-100 text-green-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
] as const

export const QR_TYPES = [
  { type: "participant", label: "Participant", route: "/mobile/qr/participant" },
  { type: "id_card", label: "ID Card", route: "/mobile/qr/id-card" },
  { type: "meal_coupon", label: "Meal Coupon", route: "/mobile/qr/meal-coupon" },
  { type: "certificate", label: "Certificate", route: "/mobile/qr/certificate" },
  { type: "visitor_pass", label: "Visitor Pass", route: "/mobile/qr/visitor-pass" },
  { type: "asset", label: "Asset", route: "/mobile/qr/asset" },
  { type: "room", label: "Room", route: "/mobile/qr/room" },
  { type: "vehicle", label: "Vehicle", route: "/mobile/qr/vehicle" },
] as const

export const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const

export const FONT_SIZES = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "Extra Large" },
] as const

export const SYNC_INTERVALS = [
  { value: 1, label: "Every minute" },
  { value: 5, label: "Every 5 minutes" },
  { value: 15, label: "Every 15 minutes" },
  { value: 30, label: "Every 30 minutes" },
  { value: 60, label: "Every hour" },
] as const

export const SYNC_TABLES = [
  "participants", "competitions", "schedules", "judging_scores", "results",
  "attendance", "visitors", "medical_cases", "medical_inventory",
  "inventory_items", "meal_coupons", "tickets",
  "accommodation_rooms", "transport_vehicles", "notifications",
] as const

export const NOTIFICATION_TYPES = [
  { value: "emergency", label: "Emergency Alert" },
  { value: "reminder", label: "Reminder" },
  { value: "announcement", label: "Announcement" },
  { value: "schedule_change", label: "Schedule Change" },
  { value: "result", label: "Result" },
  { value: "message", label: "Message" },
  { value: "alert", label: "Alert" },
] as const

export const MOBILE_NAV_ITEMS = [
  { label: "Dashboard", icon: "LayoutDashboard", path: "/mobile" },
  { label: "Attendance", icon: "ClipboardCheck", path: "/mobile/attendance" },
  { label: "Schedule", icon: "Calendar", path: "/mobile/schedule" },
  { label: "QR Scan", icon: "QrCode", path: "/mobile/qr" },
  { label: "Judging", icon: "Star", path: "/mobile/judging" },
  { label: "Results", icon: "Trophy", path: "/mobile/results" },
  { label: "Tasks", icon: "CheckSquare", path: "/mobile/tasks" },
  { label: "Settings", icon: "Settings", path: "/mobile/settings" },
] as const
