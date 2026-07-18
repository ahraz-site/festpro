export const SPONSOR_CATEGORIES = [
  { value: "platinum", label: "Platinum", color: "bg-gray-100 text-gray-700" },
  { value: "gold", label: "Gold", color: "bg-yellow-100 text-yellow-700" },
  { value: "silver", label: "Silver", color: "bg-gray-100 text-gray-600" },
  { value: "bronze", label: "Bronze", color: "bg-amber-100 text-amber-700" },
  { value: "media", label: "Media", color: "bg-pink-100 text-pink-700" },
  { value: "partner", label: "Partner", color: "bg-indigo-100 text-indigo-700" },
  { value: "associate", label: "Associate", color: "bg-teal-100 text-teal-700" },
  { value: "supporter", label: "Supporter", color: "bg-green-100 text-green-700" },
] as const

export const SPONSOR_STATUSES = [
  { value: "lead", label: "Lead", color: "bg-blue-100 text-blue-700" },
  { value: "negotiation", label: "Negotiation", color: "bg-amber-100 text-amber-700" },
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "completed", label: "Completed", color: "bg-gray-100 text-gray-600" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
] as const

export const DONOR_TYPES = [
  { value: "individual", label: "Individual", color: "bg-blue-100 text-blue-700" },
  { value: "family", label: "Family", color: "bg-green-100 text-green-700" },
  { value: "organization", label: "Organization", color: "bg-indigo-100 text-indigo-700" },
  { value: "trust", label: "Trust", color: "bg-purple-100 text-purple-700" },
  { value: "institution", label: "Institution", color: "bg-teal-100 text-teal-700" },
  { value: "anonymous", label: "Anonymous", color: "bg-gray-100 text-gray-600" },
] as const

export const CAMPAIGN_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "paused", label: "Paused", color: "bg-amber-100 text-amber-700" },
  { value: "completed", label: "Completed", color: "bg-blue-100 text-blue-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
] as const

export const DONATION_METHODS = [
  { value: "cash", label: "Cash", icon: "Wallet" },
  { value: "upi", label: "UPI", icon: "Smartphone" },
  { value: "bank_transfer", label: "Bank Transfer", icon: "Building2" },
  { value: "cheque", label: "Cheque", icon: "FileText" },
  { value: "card", label: "Card", icon: "CreditCard" },
  { value: "online", label: "Online", icon: "Globe" },
  { value: "other", label: "Other", icon: "MoreHorizontal" },
] as const

export const PLEDGE_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "partial", label: "Partial", color: "bg-blue-100 text-blue-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-600" },
  { value: "defaulted", label: "Defaulted", color: "bg-red-100 text-red-700" },
] as const

export const RECEIPT_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "issued", label: "Issued", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
] as const

export const CRM_ACTIVITY_TYPES = [
  { value: "call", label: "Call", icon: "Phone", color: "bg-blue-100 text-blue-700" },
  { value: "meeting", label: "Meeting", icon: "Users", color: "bg-indigo-100 text-indigo-700" },
  { value: "email", label: "Email", icon: "Mail", color: "bg-purple-100 text-purple-700" },
  { value: "note", label: "Note", icon: "FileText", color: "bg-gray-100 text-gray-600" },
  { value: "followup", label: "Follow-up", icon: "Bell", color: "bg-amber-100 text-amber-700" },
  { value: "task", label: "Task", icon: "CheckCircle", color: "bg-green-100 text-green-700" },
  { value: "whatsapp", label: "WhatsApp", icon: "MessageSquare", color: "bg-green-100 text-green-700" },
  { value: "sms", label: "SMS", icon: "MessageSquare", color: "bg-blue-100 text-blue-700" },
] as const
