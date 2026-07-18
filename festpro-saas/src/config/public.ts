export const SPONSOR_TIERS = [
  { value: "platinum", label: "Platinum", color: "bg-gradient-to-r from-gray-300 to-gray-100 text-gray-800 border border-gray-300" },
  { value: "gold", label: "Gold", color: "bg-gradient-to-r from-yellow-400 to-yellow-200 text-yellow-900" },
  { value: "silver", label: "Silver", color: "bg-gradient-to-r from-gray-200 to-gray-100 text-gray-700" },
  { value: "bronze", label: "Bronze", color: "bg-gradient-to-r from-amber-600 to-amber-400 text-white" },
  { value: "partner", label: "Partner", color: "bg-blue-100 text-blue-700" },
  { value: "media", label: "Media", color: "bg-purple-100 text-purple-700" },
] as const

export const NEWS_CATEGORIES = [
  { value: "news", label: "News" },
  { value: "blog", label: "Blog" },
  { value: "press_release", label: "Press Release" },
  { value: "update", label: "Update" },
  { value: "announcement", label: "Announcement" },
] as const

export const GALLERY_TYPES = [
  { value: "photo", label: "Photo" },
  { value: "video", label: "Video" },
  { value: "album", label: "Album" },
] as const

export const REGISTRATION_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "submitted", label: "Submitted", color: "bg-blue-100 text-blue-700" },
  { value: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-700" },
  { value: "waiting", label: "Waiting List", color: "bg-amber-100 text-amber-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
] as const

export const DOWNLOAD_CATEGORIES = [
  { value: "rules", label: "Rules" },
  { value: "schedule", label: "Schedule" },
  { value: "circulars", label: "Circulars" },
  { value: "forms", label: "Forms" },
  { value: "results", label: "Results" },
  { value: "certificates", label: "Certificates" },
  { value: "general", label: "General" },
] as const
