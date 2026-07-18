export const STOCK_MOVEMENT_TYPES = [
  { value: "in", label: "Stock In", color: "bg-green-100 text-green-700" },
  { value: "out", label: "Stock Out", color: "bg-red-100 text-red-700" },
  { value: "transfer_in", label: "Transfer In", color: "bg-blue-100 text-blue-700" },
  { value: "transfer_out", label: "Transfer Out", color: "bg-orange-100 text-orange-700" },
  { value: "adjustment_up", label: "Adjustment Up", color: "bg-teal-100 text-teal-700" },
  { value: "adjustment_down", label: "Adjustment Down", color: "bg-rose-100 text-rose-700" },
  { value: "damaged", label: "Damaged", color: "bg-red-100 text-red-700" },
  { value: "expired", label: "Expired", color: "bg-amber-100 text-amber-700" },
  { value: "reserved", label: "Reserved", color: "bg-purple-100 text-purple-700" },
  { value: "unreserved", label: "Unreserved", color: "bg-indigo-100 text-indigo-700" },
  { value: "returned", label: "Returned", color: "bg-cyan-100 text-cyan-700" },
] as const

export const STOCK_TRANSFER_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "in_transit", label: "In Transit", color: "bg-blue-100 text-blue-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
] as const

export const PURCHASE_REQUEST_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "pending_approval", label: "Pending Approval", color: "bg-amber-100 text-amber-700" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  { value: "ordered", label: "Ordered", color: "bg-blue-100 text-blue-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-600" },
] as const

export const PURCHASE_ORDER_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "sent", label: "Sent", color: "bg-blue-100 text-blue-700" },
  { value: "confirmed", label: "Confirmed", color: "bg-teal-100 text-teal-700" },
  { value: "partially_received", label: "Partially Received", color: "bg-amber-100 text-amber-700" },
  { value: "received", label: "Received", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-600" },
] as const

export const GOODS_RECEIPT_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
] as const

export const ASSET_STATUSES = [
  { value: "available", label: "Available", color: "bg-green-100 text-green-700" },
  { value: "assigned", label: "Assigned", color: "bg-blue-100 text-blue-700" },
  { value: "in_use", label: "In Use", color: "bg-amber-100 text-amber-700" },
  { value: "under_maintenance", label: "Under Maintenance", color: "bg-orange-100 text-orange-700" },
  { value: "lost", label: "Lost", color: "bg-red-100 text-red-700" },
  { value: "damaged", label: "Damaged", color: "bg-rose-100 text-rose-700" },
  { value: "retired", label: "Retired", color: "bg-gray-100 text-gray-600" },
  { value: "disposed", label: "Disposed", color: "bg-gray-100 text-gray-600" },
] as const

export const MAINTENANCE_TYPES = [
  { value: "preventive", label: "Preventive", color: "bg-blue-100 text-blue-700" },
  { value: "corrective", label: "Corrective", color: "bg-amber-100 text-amber-700" },
  { value: "emergency", label: "Emergency", color: "bg-red-100 text-red-700" },
  { value: "inspection", label: "Inspection", color: "bg-teal-100 text-teal-700" },
] as const

export const MAINTENANCE_STATUSES = [
  { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-700" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-100 text-amber-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
  { value: "overdue", label: "Overdue", color: "bg-rose-100 text-rose-700" },
] as const

export const AUDIT_STATUSES = [
  { value: "planned", label: "Planned", color: "bg-blue-100 text-blue-700" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-100 text-amber-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
] as const

export const INVENTORY_UNITS = [
  { value: "piece", label: "Piece" },
  { value: "box", label: "Box" },
  { value: "carton", label: "Carton" },
  { value: "kg", label: "Kilogram" },
  { value: "g", label: "Gram" },
  { value: "liter", label: "Liter" },
  { value: "ml", label: "Milliliter" },
  { value: "meter", label: "Meter" },
  { value: "set", label: "Set" },
  { value: "pair", label: "Pair" },
  { value: "dozen", label: "Dozen" },
  { value: "roll", label: "Roll" },
  { value: "pack", label: "Pack" },
  { value: "bundle", label: "Bundle" },
  { value: "other", label: "Other" },
] as const

export const STOCK_ADJUSTMENT_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
] as const

export const RESERVATION_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "fulfilled", label: "Fulfilled", color: "bg-blue-100 text-blue-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
  { value: "expired", label: "Expired", color: "bg-gray-100 text-gray-600" },
] as const

export const VENDOR_PAYMENT_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "paid", label: "Paid", color: "bg-green-100 text-green-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "refunded", label: "Refunded", color: "bg-blue-100 text-blue-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-600" },
] as const

export const DISPOSAL_TYPES = [
  { value: "sold", label: "Sold" },
  { value: "scrapped", label: "Scrapped" },
  { value: "donated", label: "Donated" },
  { value: "returned", label: "Returned to Supplier" },
  { value: "written_off", label: "Written Off" },
] as const
