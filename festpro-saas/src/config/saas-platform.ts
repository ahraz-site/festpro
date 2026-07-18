export const TENANT_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "trial", label: "Trial", color: "bg-blue-100 text-blue-700" },
  { value: "suspended", label: "Suspended", color: "bg-amber-100 text-amber-700" },
  { value: "archived", label: "Archived", color: "bg-gray-100 text-gray-600" },
  { value: "deleted", label: "Deleted", color: "bg-red-100 text-red-700" },
] as const

export const SUBSCRIPTION_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "trialing", label: "Trialing", color: "bg-blue-100 text-blue-700" },
  { value: "past_due", label: "Past Due", color: "bg-amber-100 text-amber-700" },
  { value: "canceled", label: "Canceled", color: "bg-red-100 text-red-700" },
  { value: "incomplete", label: "Incomplete", color: "bg-gray-100 text-gray-600" },
  { value: "expired", label: "Expired", color: "bg-gray-100 text-gray-600" },
  { value: "paused", label: "Paused", color: "bg-purple-100 text-purple-700" },
] as const

export const INVOICE_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "pending", label: "Pending", color: "bg-blue-100 text-blue-700" },
  { value: "sent", label: "Sent", color: "bg-indigo-100 text-indigo-700" },
  { value: "paid", label: "Paid", color: "bg-green-100 text-green-700" },
  { value: "overdue", label: "Overdue", color: "bg-red-100 text-red-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-600" },
  { value: "refunded", label: "Refunded", color: "bg-purple-100 text-purple-700" },
  { value: "partially_paid", label: "Partial", color: "bg-amber-100 text-amber-700" },
] as const

export const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "processing", label: "Processing", color: "bg-blue-100 text-blue-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "refunded", label: "Refunded", color: "bg-purple-100 text-purple-700" },
] as const

export const BILLING_CYCLES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semi_annual", label: "Semi-Annual" },
  { value: "annual", label: "Annual" },
  { value: "custom", label: "Custom" },
] as const

export const PAYMENT_GATEWAY_PROVIDERS = [
  { value: "stripe", label: "Stripe" },
  { value: "razorpay", label: "Razorpay" },
  { value: "paypal", label: "PayPal" },
  { value: "manual", label: "Manual" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
] as const

export const DOMAIN_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "verified", label: "Verified", color: "bg-green-100 text-green-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "expired", label: "Expired", color: "bg-gray-100 text-gray-600" },
  { value: "ssl_active", label: "SSL Active", color: "bg-blue-100 text-blue-700" },
  { value: "ssl_failed", label: "SSL Failed", color: "bg-red-100 text-red-700" },
] as const

export const LICENSE_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-600" },
  { value: "expired", label: "Expired", color: "bg-red-100 text-red-700" },
  { value: "revoked", label: "Revoked", color: "bg-rose-100 text-rose-700" },
  { value: "suspended", label: "Suspended", color: "bg-amber-100 text-amber-700" },
] as const

export const DEFAULT_PLANS = [
  { plan_code: "free", plan_name: "Free", price_monthly: 0, price_yearly: 0, max_organizations: 1, max_festivals: 1, max_participants: 100, max_users: 5, max_storage_gb: 1 },
  { plan_code: "starter", plan_name: "Starter", price_monthly: 29, price_yearly: 290, max_organizations: 1, max_festivals: 3, max_participants: 500, max_users: 10, max_storage_gb: 5 },
  { plan_code: "professional", plan_name: "Professional", price_monthly: 79, price_yearly: 790, max_organizations: 1, max_festivals: 10, max_participants: 2000, max_users: 25, max_storage_gb: 20, api_access: true, advanced_reports: true },
  { plan_code: "business", plan_name: "Business", price_monthly: 199, price_yearly: 1990, max_organizations: 3, max_festivals: 50, max_participants: 10000, max_users: 100, max_storage_gb: 100, white_label_allowed: true, api_access: true, advanced_reports: true, priority_support: true },
  { plan_code: "enterprise", plan_name: "Enterprise", price_monthly: 499, price_yearly: 4990, max_organizations: 10, max_festivals: 999, max_participants: 999999, max_users: 999, max_storage_gb: 1000, white_label_allowed: true, custom_domain_allowed: true, api_access: true, advanced_reports: true, priority_support: true },
] as const

export const FEATURE_CODES = [
  { code: "white_label", label: "White Label", type: "boolean" },
  { code: "custom_domain", label: "Custom Domain", type: "boolean" },
  { code: "api_access", label: "API Access", type: "boolean" },
  { code: "advanced_reports", label: "Advanced Reports", type: "boolean" },
  { code: "priority_support", label: "Priority Support", type: "boolean" },
  { code: "sms", label: "SMS Credits", type: "numeric" },
  { code: "email", label: "Email Credits", type: "numeric" },
  { code: "ai_credits", label: "AI Credits", type: "numeric" },
  { code: "storage_gb", label: "Storage (GB)", type: "numeric" },
] as const

export const RESOURCE_TYPES = [
  { value: "storage", label: "Storage" },
  { value: "api_calls", label: "API Calls" },
  { value: "sms", label: "SMS" },
  { value: "emails", label: "Emails" },
  { value: "ai_credits", label: "AI Credits" },
  { value: "bandwidth", label: "Bandwidth" },
  { value: "participants", label: "Participants" },
  { value: "users", label: "Users" },
  { value: "festivals", label: "Festivals" },
] as const
