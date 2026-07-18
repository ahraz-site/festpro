export const ID_CARD_TYPES = [
  { value: "participant", label: "Participant", color: "bg-blue-100 text-blue-700" },
  { value: "judge", label: "Judge", color: "bg-purple-100 text-purple-700" },
  { value: "volunteer", label: "Volunteer", color: "bg-green-100 text-green-700" },
  { value: "staff", label: "Staff", color: "bg-indigo-100 text-indigo-700" },
  { value: "team_manager", label: "Team Manager", color: "bg-amber-100 text-amber-700" },
  { value: "organization_admin", label: "Org Admin", color: "bg-red-100 text-red-700" },
  { value: "festival_director", label: "Festival Director", color: "bg-rose-100 text-rose-700" },
  { value: "reception", label: "Reception", color: "bg-teal-100 text-teal-700" },
  { value: "media", label: "Media", color: "bg-pink-100 text-pink-700" },
  { value: "guest", label: "Guest", color: "bg-orange-100 text-orange-700" },
  { value: "vip", label: "VIP", color: "bg-yellow-100 text-yellow-700" },
  { value: "security", label: "Security", color: "bg-gray-100 text-gray-700" },
  { value: "medical", label: "Medical", color: "bg-red-100 text-red-700" },
  { value: "technical", label: "Technical", color: "bg-cyan-100 text-cyan-700" },
] as const

export const BADGE_TYPES = [
  { value: "stage_access", label: "Stage Access", color: "bg-purple-100 text-purple-700" },
  { value: "judge", label: "Judge", color: "bg-blue-100 text-blue-700" },
  { value: "volunteer", label: "Volunteer", color: "bg-green-100 text-green-700" },
  { value: "staff", label: "Staff", color: "bg-indigo-100 text-indigo-700" },
  { value: "guest", label: "Guest", color: "bg-amber-100 text-amber-700" },
  { value: "vip", label: "VIP", color: "bg-yellow-100 text-yellow-700" },
  { value: "media", label: "Media", color: "bg-pink-100 text-pink-700" },
  { value: "security", label: "Security", color: "bg-gray-100 text-gray-700" },
] as const

export const PASS_TYPES = [
  { value: "general", label: "General Pass", color: "bg-gray-100 text-gray-700" },
  { value: "vip", label: "VIP Pass", color: "bg-yellow-100 text-yellow-700" },
  { value: "guest", label: "Guest Pass", color: "bg-amber-100 text-amber-700" },
  { value: "media", label: "Media Pass", color: "bg-pink-100 text-pink-700" },
  { value: "vehicle", label: "Vehicle Pass", color: "bg-blue-100 text-blue-700" },
  { value: "parking", label: "Parking Pass", color: "bg-teal-100 text-teal-700" },
  { value: "backstage", label: "Backstage Pass", color: "bg-purple-100 text-purple-700" },
  { value: "stage_access", label: "Stage Access", color: "bg-red-100 text-red-700" },
] as const

export const CARD_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "expired", label: "Expired", color: "bg-amber-100 text-amber-700" },
  { value: "revoked", label: "Revoked", color: "bg-red-100 text-red-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-500" },
] as const

export const PASS_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "used", label: "Used", color: "bg-blue-100 text-blue-700" },
  { value: "expired", label: "Expired", color: "bg-amber-100 text-amber-700" },
  { value: "revoked", label: "Revoked", color: "bg-red-100 text-red-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-500" },
] as const

export const PRINT_STATUSES = [
  { value: "queued", label: "Queued", color: "bg-blue-100 text-blue-700" },
  { value: "processing", label: "Processing", color: "bg-amber-100 text-amber-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-500" },
] as const

export const VERIFICATION_METHODS = [
  { value: "qr_scan", label: "QR Scan", icon: "QrCode" },
  { value: "barcode_scan", label: "Barcode Scan", icon: "Barcode" },
  { value: "manual_search", label: "Manual Search", icon: "Search" },
  { value: "api", label: "API", icon: "Server" },
] as const

export const VEHICLE_TYPES = [
  { value: "car", label: "Car" },
  { value: "bike", label: "Motorcycle" },
  { value: "van", label: "Van" },
  { value: "bus", label: "Bus" },
  { value: "truck", label: "Truck" },
  { value: "ambulance", label: "Ambulance" },
  { value: "other", label: "Other" },
] as const

export const MEDIA_TYPES = [
  { value: "press", label: "Press" },
  { value: "tv", label: "Television" },
  { value: "radio", label: "Radio" },
  { value: "online", label: "Online" },
  { value: "photographer", label: "Photographer" },
  { value: "videographer", label: "Videographer" },
  { value: "social_media", label: "Social Media" },
] as const
