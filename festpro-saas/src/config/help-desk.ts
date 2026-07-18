export const TICKET_PRIORITIES = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-600" },
  { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-700" },
  { value: "high", label: "High", color: "bg-amber-100 text-amber-700" },
  { value: "urgent", label: "Urgent", color: "bg-orange-100 text-orange-700" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" },
] as const

export const TICKET_STATUSES = [
  { value: "new", label: "New", color: "bg-purple-100 text-purple-700" },
  { value: "open", label: "Open", color: "bg-green-100 text-green-700" },
  { value: "assigned", label: "Assigned", color: "bg-blue-100 text-blue-700" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-100 text-amber-700" },
  { value: "resolved", label: "Resolved", color: "bg-indigo-100 text-indigo-700" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-600" },
  { value: "reopened", label: "Reopened", color: "bg-pink-100 text-pink-700" },
  { value: "on_hold", label: "On Hold", color: "bg-slate-100 text-slate-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
] as const

export const TICKET_SOURCES = [
  { value: "desk", label: "Help Desk" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "web", label: "Web" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "walk_in", label: "Walk-in" },
  { value: "social", label: "Social Media" },
  { value: "other", label: "Other" },
] as const

export const SUPPORT_CATEGORIES = [
  { value: "general_enquiry", label: "General Enquiry" },
  { value: "registration", label: "Registration" },
  { value: "competition", label: "Competition" },
  { value: "accommodation", label: "Accommodation" },
  { value: "food", label: "Food" },
  { value: "transport", label: "Transport" },
  { value: "medical", label: "Medical" },
  { value: "technical", label: "Technical" },
  { value: "volunteer", label: "Volunteer" },
  { value: "certificate", label: "Certificate" },
  { value: "finance", label: "Finance" },
  { value: "lost_found", label: "Lost & Found" },
  { value: "emergency", label: "Emergency" },
  { value: "other", label: "Other" },
] as const

export const VISITOR_CATEGORIES = [
  { value: "general", label: "General", color: "bg-gray-100 text-gray-600", passColor: "#6b7280" },
  { value: "guest", label: "Guest", color: "bg-blue-100 text-blue-700", passColor: "#3b82f6" },
  { value: "vip", label: "VIP", color: "bg-amber-100 text-amber-700", passColor: "#f59e0b" },
  { value: "media", label: "Media", color: "bg-purple-100 text-purple-700", passColor: "#8b5cf6" },
  { value: "sponsor", label: "Sponsor", color: "bg-green-100 text-green-700", passColor: "#10b981" },
  { value: "government", label: "Government", color: "bg-indigo-100 text-indigo-700", passColor: "#6366f1" },
  { value: "organization", label: "Organization", color: "bg-teal-100 text-teal-700", passColor: "#14b8a6" },
  { value: "volunteer", label: "Volunteer", color: "bg-cyan-100 text-cyan-700", passColor: "#06b6d4" },
  { value: "staff", label: "Staff", color: "bg-rose-100 text-rose-700", passColor: "#f43f5e" },
  { value: "participant", label: "Participant", color: "bg-orange-100 text-orange-700", passColor: "#f97316" },
] as const

export const LOST_ITEM_CATEGORIES = [
  { value: "mobile_phone", label: "Mobile Phone", icon: "Smartphone" },
  { value: "wallet", label: "Wallet", icon: "Wallet" },
  { value: "bag", label: "Bag", icon: "Backpack" },
  { value: "id_card", label: "ID Card", icon: "IdCard" },
  { value: "certificate", label: "Certificate", icon: "FileText" },
  { value: "documents", label: "Documents", icon: "File" },
  { value: "jewellery", label: "Jewellery", icon: "Gem" },
  { value: "watch", label: "Watch", icon: "Clock" },
  { value: "electronics", label: "Electronics", icon: "Monitor" },
  { value: "keys", label: "Keys", icon: "Key" },
  { value: "clothing", label: "Clothing", icon: "Shirt" },
  { value: "umbrella", label: "Umbrella", icon: "Umbrella" },
  { value: "water_bottle", label: "Water Bottle", icon: "Droplets" },
  { value: "laptop", label: "Laptop", icon: "Laptop" },
  { value: "tablet", label: "Tablet", icon: "Tablet" },
  { value: "headphones", label: "Headphones", icon: "Headphones" },
  { value: "books", label: "Books", icon: "BookOpen" },
  { value: "other", label: "Other", icon: "MoreHorizontal" },
] as const

export const LOST_ITEM_STATUSES = [
  { value: "reported", label: "Reported", color: "bg-amber-100 text-amber-700" },
  { value: "matched", label: "Matched", color: "bg-blue-100 text-blue-700" },
  { value: "claimed", label: "Claimed", color: "bg-green-100 text-green-700" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-600" },
  { value: "disposed", label: "Disposed", color: "bg-red-100 text-red-700" },
] as const

export const CLAIM_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "under_review", label: "Under Review", color: "bg-blue-100 text-blue-700" },
  { value: "verified", label: "Verified", color: "bg-teal-100 text-teal-700" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  { value: "collected", label: "Collected", color: "bg-indigo-100 text-indigo-700" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-600" },
] as const

export const ESCALATION_LEVELS = [
  { value: "level1", label: "Level 1", color: "bg-green-100 text-green-700" },
  { value: "level2", label: "Level 2", color: "bg-amber-100 text-amber-700" },
  { value: "level3", label: "Level 3", color: "bg-orange-100 text-orange-700" },
  { value: "level4", label: "Level 4", color: "bg-red-100 text-red-700" },
] as const

export const FEEDBACK_FORM_TYPES = [
  { value: "general", label: "General" },
  { value: "help_desk", label: "Help Desk" },
  { value: "reception", label: "Reception" },
  { value: "visitor_experience", label: "Visitor Experience" },
  { value: "lost_found", label: "Lost & Found" },
  { value: "ticket_resolution", label: "Ticket Resolution" },
] as const

export const MEETING_STATUSES = [
  { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-700" },
  { value: "in_progress", label: "In Progress", color: "bg-green-100 text-green-700" },
  { value: "completed", label: "Completed", color: "bg-gray-100 text-gray-600" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
  { value: "no_show", label: "No Show", color: "bg-amber-100 text-amber-700" },
] as const
