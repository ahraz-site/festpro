export type StockMovementType = "in" | "out" | "transfer_in" | "transfer_out" | "adjustment_up" | "adjustment_down" | "damaged" | "expired" | "reserved" | "unreserved" | "returned"
export type StockTransferStatus = "draft" | "in_transit" | "completed" | "cancelled"
export type PurchaseRequestStatus = "draft" | "pending_approval" | "approved" | "rejected" | "ordered" | "cancelled"
export type PurchaseOrderStatus = "draft" | "sent" | "confirmed" | "partially_received" | "received" | "cancelled" | "closed"
export type GoodsReceiptStatus = "draft" | "completed" | "cancelled"
export type AssetStatus = "available" | "assigned" | "in_use" | "under_maintenance" | "lost" | "damaged" | "retired" | "disposed"
export type MaintenanceType = "preventive" | "corrective" | "emergency" | "inspection"
export type MaintenanceStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "overdue"
export type AuditStatus = "planned" | "in_progress" | "completed" | "cancelled"
export type InventoryUnit = "piece" | "box" | "carton" | "kg" | "g" | "liter" | "ml" | "meter" | "set" | "pair" | "dozen" | "roll" | "pack" | "bundle" | "other"

export interface Warehouse {
  id: string; organization_id: string; festival_id: string | null
  warehouse_code: string; warehouse_name: string; location: string | null
  capacity_sqft: number | null; temperature_controlled: boolean; is_active: boolean
  contact_person: string | null; contact_phone: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface WarehouseLocation {
  id: string; organization_id: string; warehouse_id: string
  location_code: string; location_type: string | null; zone: string | null
  max_capacity: number | null; current_usage: number; is_active: boolean; notes: string | null
  created_at: string; updated_at: string
}

export interface InventoryCategory {
  id: string; organization_id: string; name: string; description: string | null
  parent_id: string | null; icon: string | null; sort_order: number; is_active: boolean
  created_at: string
}

export interface InventoryItem {
  id: string; organization_id: string; festival_id: string | null; category_id: string | null
  sku: string; barcode: string | null; qr_code: string | null; name: string; description: string | null
  brand: string | null; model: string | null; unit: InventoryUnit; unit_price: number
  cost_price: number; min_stock: number; max_stock: number; reorder_level: number
  tax_rate: number; hsn_code: string | null; is_active: boolean; image_url: string | null
  notes: string | null; created_by: string | null; created_at: string; updated_at: string
}

export interface InventoryVariant {
  id: string; organization_id: string; item_id: string
  variant_sku: string; variant_name: string; attributes: any
  unit_price: number; cost_price: number; is_active: boolean
  created_at: string; updated_at: string
}

export interface InventoryUnitMeta {
  id: string; organization_id: string; name: string; abbreviation: string
  unit_type: string | null; conversion_factor: number; base_unit_id: string | null
  is_active: boolean; created_at: string
}

export interface InventoryStock {
  id: string; organization_id: string; festival_id: string | null
  item_id: string; variant_id: string | null; warehouse_id: string; location_id: string | null
  quantity: number; reserved_quantity: number; available_quantity: number
  batch_number: string | null; expiry_date: string | null; unit_cost: number
  created_at: string; updated_at: string
}

export interface StockTransaction {
  id: string; organization_id: string; festival_id: string | null
  item_id: string; variant_id: string | null; warehouse_id: string; location_id: string | null
  movement_type: StockMovementType; quantity: number; unit_cost: number | null
  reference_type: string | null; reference_id: string | null; batch_number: string | null
  notes: string | null; performed_by: string | null; created_at: string
}

export interface StockAdjustment {
  id: string; organization_id: string; festival_id: string | null
  adjustment_number: string; reason: string; status: string
  approved_by: string | null; approved_at: string | null; notes: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface StockTransfer {
  id: string; organization_id: string; festival_id: string | null
  transfer_number: string; from_warehouse_id: string; to_warehouse_id: string
  status: StockTransferStatus; transferred_by: string | null; received_by: string | null
  transferred_at: string | null; received_at: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface StockReservation {
  id: string; organization_id: string; festival_id: string | null
  item_id: string; variant_id: string | null; warehouse_id: string
  quantity: number; reference_type: string | null; reference_id: string | null
  reserved_until: string | null; status: string; created_by: string | null
  created_at: string; updated_at: string
}

export interface PurchaseRequest {
  id: string; organization_id: string; festival_id: string | null
  pr_number: string; title: string; description: string | null
  status: PurchaseRequestStatus; requested_by: string | null; requested_date: string
  approved_by: string | null; approved_at: string | null; rejected_reason: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface PurchaseRequestItem {
  id: string; organization_id: string; pr_id: string
  item_id: string | null; item_name: string; description: string | null
  quantity: number; unit: InventoryUnit; estimated_unit_cost: number; estimated_total: number
  notes: string | null; created_at: string
}

export interface PurchaseOrder {
  id: string; organization_id: string; festival_id: string | null; pr_id: string | null; vendor_id: string | null
  po_number: string; title: string; description: string | null; status: PurchaseOrderStatus
  order_date: string; expected_delivery: string | null; delivery_address: string | null; billing_address: string | null
  subtotal: number; tax_amount: number; discount_amount: number; total_amount: number
  terms_conditions: string | null; notes: string | null
  created_by: string | null; approved_by: string | null; approved_at: string | null
  created_at: string; updated_at: string
}

export interface PurchaseOrderItem {
  id: string; organization_id: string; po_id: string; pr_item_id: string | null; item_id: string | null
  item_name: string; description: string | null; quantity: number; received_quantity: number
  unit: InventoryUnit; unit_cost: number; total_cost: number; tax_rate: number; tax_amount: number
  notes: string | null; created_at: string
}

export interface GoodsReceipt {
  id: string; organization_id: string; festival_id: string | null; po_id: string
  gr_number: string; status: GoodsReceiptStatus; received_date: string
  received_by: string | null; delivery_note_number: string | null; invoice_number: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface GoodsReceiptItem {
  id: string; organization_id: string; gr_id: string; po_item_id: string
  item_id: string | null; item_name: string; quantity_received: number; quantity_accepted: number
  quantity_rejected: number; rejection_reason: string | null; unit_cost: number
  batch_number: string | null; expiry_date: string | null
  warehouse_id: string | null; location_id: string | null; notes: string | null
  created_at: string
}

export interface Vendor {
  id: string; organization_id: string; festival_id: string | null
  vendor_code: string; company_name: string; contact_person: string | null; email: string | null; phone: string | null
  alternate_phone: string | null; website: string | null; address: string | null; city: string | null; state: string | null
  pincode: string | null; country: string; gst_number: string | null; pan_number: string | null; tax_id: string | null
  bank_name: string | null; bank_account_number: string | null; bank_ifsc: string | null
  payment_terms: string | null; credit_limit: number | null; lead_time_days: number | null
  rating: number; is_active: boolean; notes: string | null; created_by: string | null
  created_at: string; updated_at: string
}

export interface VendorContact {
  id: string; organization_id: string; vendor_id: string
  name: string; designation: string | null; email: string | null; phone: string | null
  is_primary: boolean; notes: string | null; created_at: string; updated_at: string
}

export interface VendorDocument {
  id: string; organization_id: string; vendor_id: string
  document_type: string; document_name: string; file_url: string
  expiry_date: string | null; is_verified: boolean; notes: string | null
  uploaded_by: string | null; created_at: string
}

export interface VendorRating {
  id: string; organization_id: string; vendor_id: string; po_id: string | null
  quality_rating: number | null; delivery_rating: number | null; price_rating: number | null
  overall_rating: number; comment: string | null; rated_by: string | null; created_at: string
}

export interface VendorPayment {
  id: string; organization_id: string; vendor_id: string; po_id: string | null
  payment_number: string; amount: number; payment_date: string
  payment_method: string | null; transaction_id: string | null; reference_number: string | null
  status: string; notes: string | null; created_by: string | null
  created_at: string; updated_at: string
}

export interface AssetCategory {
  id: string; organization_id: string; name: string; description: string | null
  parent_id: string | null; useful_life_years: number | null; depreciation_rate: number | null
  icon: string | null; sort_order: number; is_active: boolean; created_at: string
}

export interface Asset {
  id: string; organization_id: string; festival_id: string | null; category_id: string | null; warehouse_id: string | null
  asset_code: string; qr_code: string | null; barcode: string | null; name: string; description: string | null
  serial_number: string | null; model_number: string | null; brand: string | null
  purchase_date: string | null; purchase_cost: number | null; current_value: number | null
  warranty_expiry: string | null; warranty_terms: string | null; supplier_id: string | null
  status: AssetStatus; location: string | null; notes: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface AssetAssignment {
  id: string; organization_id: string; festival_id: string | null; asset_id: string
  assigned_to: string | null; assigned_to_name: string; assigned_to_department: string | null
  assigned_at: string; expected_return_at: string | null; returned_at: string | null
  condition_on_assign: string | null; condition_on_return: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface AssetMovement {
  id: string; organization_id: string; festival_id: string | null; asset_id: string
  from_location: string | null; to_location: string
  from_warehouse_id: string | null; to_warehouse_id: string | null
  movement_date: string; moved_by: string | null; reason: string | null; notes: string | null
  created_at: string
}

export interface AssetMaintenance {
  id: string; organization_id: string; festival_id: string | null; asset_id: string
  maintenance_type: MaintenanceType; status: MaintenanceStatus
  title: string; description: string | null
  scheduled_date: string | null; completed_date: string | null; cost: number
  vendor_id: string | null; performed_by: string | null; notes: string | null
  created_by: string | null; created_at: string; updated_at: string
}

export interface MaintenanceLog {
  id: string; organization_id: string; festival_id: string | null; maintenance_id: string
  log_date: string; action: string; description: string | null; parts_used: any
  cost: number; performed_by: string | null; next_maintenance_date: string | null; notes: string | null
  created_at: string
}

export interface AssetDisposal {
  id: string; organization_id: string; festival_id: string | null; asset_id: string
  disposal_date: string; disposal_type: string; disposal_reason: string
  sale_amount: number | null; buyer_name: string | null; buyer_contact: string | null
  authorized_by: string | null; notes: string | null; created_at: string
}

export interface InventoryAudit {
  id: string; organization_id: string; festival_id: string | null; warehouse_id: string
  audit_number: string; audit_date: string; status: AuditStatus
  conducted_by: string | null; verified_by: string | null; notes: string | null
  created_at: string; updated_at: string
}

export interface InventoryAuditItem {
  id: string; organization_id: string; audit_id: string; item_id: string
  expected_quantity: number; actual_quantity: number; variance: number
  unit_cost: number; variance_value: number; notes: string | null; created_at: string
}

export interface Module17DashboardData {
  total_warehouses: number; total_locations: number; total_items: number
  total_stock_value: number; low_stock_items: number; out_of_stock_items: number
  total_purchase_requests: number; pending_prs: number; total_purchase_orders: number
  pending_pos: number; total_vendors: number; active_vendors: number
  total_assets: number; assigned_assets: number; under_maintenance: number
  total_audits: number; in_progress_audits: number; pending_adjustments: number
}
