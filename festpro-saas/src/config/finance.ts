export const ACCOUNT_TYPES = [
  { value: "asset", label: "Asset" },
  { value: "liability", label: "Liability" },
  { value: "equity", label: "Equity" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
] as const

export const TRANSACTION_TYPES = [
  { value: "credit", label: "Credit", color: "text-green-600 bg-green-50" },
  { value: "debit", label: "Debit", color: "text-red-600 bg-red-50" },
] as const

export const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "refunded", label: "Refunded", color: "bg-purple-100 text-purple-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-600" },
] as const

export const PAYMENT_GATEWAYS = [
  { value: "razorpay", label: "Razorpay" },
  { value: "stripe", label: "Stripe" },
  { value: "paypal", label: "PayPal" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
  { value: "other", label: "Other" },
] as const

export const EXPENSE_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "approved", label: "Approved", color: "bg-blue-100 text-blue-700" },
  { value: "paid", label: "Paid", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
] as const

export const BUDGET_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "closed", label: "Closed", color: "bg-blue-100 text-blue-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
] as const

export const REPORT_FORMATS = [
  { value: "pdf", label: "PDF", icon: "FileText" },
  { value: "excel", label: "Excel", icon: "Table" },
  { value: "csv", label: "CSV", icon: "FileSpreadsheet" },
] as const

export const REPORT_SCHEDULES = [
  { value: "none", label: "No Schedule" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
] as const

export const CHART_TYPES = [
  { value: "bar", label: "Bar Chart" },
  { value: "pie", label: "Pie Chart" },
  { value: "line", label: "Line Chart" },
  { value: "area", label: "Area Chart" },
  { value: "heatmap", label: "Heat Map" },
] as const

export const WIDGET_TYPES = [
  { value: "stat", label: "Stat Card" },
  { value: "chart", label: "Chart" },
  { value: "table", label: "Table" },
  { value: "list", label: "List" },
  { value: "metric", label: "Metric" },
] as const

export const SPONSORSHIP_TIERS = [
  { value: "platinum", label: "Platinum", color: "text-gray-800 bg-gray-100" },
  { value: "gold", label: "Gold", color: "text-yellow-700 bg-yellow-50" },
  { value: "silver", label: "Silver", color: "text-gray-600 bg-gray-100" },
  { value: "bronze", label: "Bronze", color: "text-orange-700 bg-orange-50" },
  { value: "partner", label: "Partner", color: "text-blue-700 bg-blue-50" },
] as const

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Travel", color: "#3b82f6", icon: "Plane" },
  { name: "Food", color: "#f59e0b", icon: "UtensilsCrossed" },
  { name: "Accommodation", color: "#8b5cf6", icon: "Hotel" },
  { name: "Printing", color: "#06b6d4", icon: "Printer" },
  { name: "Decoration", color: "#ec4899", icon: "Palette" },
  { name: "Stage", color: "#f97316", icon: "Stage" },
  { name: "Sound", color: "#10b981", icon: "Speaker" },
  { name: "Lighting", color: "#6366f1", icon: "Lightbulb" },
  { name: "Prize", color: "#ef4444", icon: "Trophy" },
  { name: "Miscellaneous", color: "#6b7280", icon: "MoreHorizontal" },
] as const

export const REPORT_TYPES = [
  { value: "participants", label: "Participants Report" },
  { value: "competitions", label: "Competition Report" },
  { value: "judges", label: "Judge Report" },
  { value: "attendance", label: "Attendance Report" },
  { value: "results", label: "Result Report" },
  { value: "certificates", label: "Certificate Report" },
  { value: "finance", label: "Finance Report" },
  { value: "sponsors", label: "Sponsor Report" },
  { value: "donations", label: "Donation Report" },
  { value: "units", label: "Unit Report" },
  { value: "divisions", label: "Division Report" },
  { value: "sectors", label: "Sector Report" },
  { value: "festival", label: "Festival Report" },
] as const

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "د.إ",
}

export const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  asset: "text-blue-600 bg-blue-50", liability: "text-red-600 bg-red-50",
  equity: "text-purple-600 bg-purple-50", income: "text-green-600 bg-green-50",
  expense: "text-orange-600 bg-orange-50",
}
