"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"
import type {
  Warehouse, WarehouseLocation, InventoryCategory, InventoryItem, InventoryVariant,
  InventoryUnitMeta, InventoryStock, StockTransaction, StockAdjustment, StockTransfer,
  StockReservation, PurchaseRequest, PurchaseRequestItem, PurchaseOrder, PurchaseOrderItem,
  GoodsReceipt, GoodsReceiptItem, Vendor, VendorContact, VendorDocument, VendorRating,
  VendorPayment, AssetCategory, Asset, AssetAssignment, AssetMovement, AssetMaintenance,
  MaintenanceLog, AssetDisposal, InventoryAudit, InventoryAuditItem, Module17DashboardData,
} from "@/types/inventory"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkOrgAccess(festivalId?: string) {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  if (festivalId) {
    const { data: fest } = await admin.from("festivals").select("organization_id").eq("id", festivalId).single()
    if (!fest) return { allowed: false, error: "Festival not found" } as const
    const { data: member } = await admin.from("organization_members").select("role").eq("organization_id", fest.organization_id).eq("user_id", user.id).single()
    if (!member) return { allowed: false, error: "Not a member" } as const
    return { allowed: true, user, organization_id: fest.organization_id, festival_id: festivalId } as const
  }
  const { data: members } = await admin.from("organization_members").select("organization_id, role").eq("user_id", user.id).limit(1)
  if (!members || members.length === 0) return { allowed: false, error: "No organization" } as const
  return { allowed: true, user, organization_id: members[0].organization_id } as const
}

function generateNumber(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getInventoryDashboard(festivalId: string) {
  const admin = createAdminClient()
  const [{ count: tw }, { count: tl }, { count: ti }, sv, { count: ls }, { count: os },
    { count: tpr }, { count: ppr }, { count: tpo }, { count: ppo },
    { count: tv }, { count: av }, { count: ta }, { count: aa }, { count: um },
    { count: taud }, { count: ipa }, { count: padj },
  ] = await Promise.all([
    admin.from("warehouses").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("warehouse_locations").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("inventory_items").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("inventory_stock").select("quantity, unit_cost").eq("festival_id", festivalId),
    admin.from("inventory_items").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).gt("min_stock", 0),
    admin.from("inventory_stock").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("quantity", 0),
    admin.from("purchase_requests").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("purchase_requests").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).in("status", ["pending_approval", "approved"]),
    admin.from("purchase_orders").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("purchase_orders").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).in("status", ["sent", "confirmed", "partially_received"]),
    admin.from("vendors").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("vendors").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("is_active", true),
    admin.from("assets").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("assets").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).in("status", ["assigned", "in_use"]),
    admin.from("assets").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "under_maintenance"),
    admin.from("inventory_audits").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("inventory_audits").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).in("status", ["planned", "in_progress"]),
    admin.from("stock_adjustments").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "pending"),
  ])
  const stockValue = sv.data?.reduce((s: number, r: any) => s + (Number(r.quantity) * Number(r.unit_cost)), 0) || 0
  return {
    data: {
      total_warehouses: tw || 0, total_locations: tl || 0, total_items: ti || 0,
      total_stock_value: stockValue, low_stock_items: ls || 0, out_of_stock_items: os || 0,
      total_purchase_requests: tpr || 0, pending_prs: ppr || 0,
      total_purchase_orders: tpo || 0, pending_pos: ppo || 0,
      total_vendors: tv || 0, active_vendors: av || 0,
      total_assets: ta || 0, assigned_assets: aa || 0, under_maintenance: um || 0,
      total_audits: taud || 0, in_progress_audits: ipa || 0, pending_adjustments: padj || 0,
    } as Module17DashboardData,
  }
}

// ============================================================
// WAREHOUSES
// ============================================================

export async function getWarehouses(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("warehouses").select("*").eq("festival_id", festivalId).order("warehouse_name")
  if (error) return { error: error.message }
  return { data: data as Warehouse[] }
}

export async function getWarehouse(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("warehouses").select("*").eq("id", id).single()
  if (error) return { error: error.message }
  return { data: data as Warehouse }
}

export async function createWarehouse(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("warehouses").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    warehouse_code: form.warehouse_code, warehouse_name: form.warehouse_name,
    location: form.location || null, capacity_sqft: form.capacity_sqft || null,
    temperature_controlled: form.temperature_controlled || false,
    contact_person: form.contact_person || null, contact_phone: form.contact_phone || null,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/inventory`)
  return { data: data as Warehouse }
}

export async function updateWarehouse(id: string, form: any) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("warehouses").update(form).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as Warehouse }
}

export async function deleteWarehouse(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("warehouses").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// WAREHOUSE LOCATIONS
// ============================================================

export async function getWarehouseLocations(warehouseId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("warehouse_locations").select("*").eq("warehouse_id", warehouseId).order("location_code")
  if (error) return { error: error.message }
  return { data: data as WarehouseLocation[] }
}

export async function createWarehouseLocation(form: any) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("warehouse_locations").insert({
    organization_id: auth.organization_id, warehouse_id: form.warehouse_id,
    location_code: form.location_code, location_type: form.location_type || "rack",
    zone: form.zone || null, max_capacity: form.max_capacity || null,
    notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as WarehouseLocation }
}

export async function deleteWarehouseLocation(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("warehouse_locations").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// INVENTORY CATEGORIES
// ============================================================

export async function getInventoryCategories(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("inventory_categories").select("*").eq("festival_id", festivalId).order("sort_order")
  if (error) return { error: error.message }
  return { data: data as InventoryCategory[] }
}

export async function createInventoryCategory(form: any) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("inventory_categories").insert({
    organization_id: auth.organization_id, name: form.name, description: form.description || null,
    parent_id: form.parent_id || null, icon: form.icon || null, sort_order: form.sort_order || 0,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as InventoryCategory }
}

export async function deleteInventoryCategory(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("inventory_categories").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// INVENTORY ITEMS
// ============================================================

export async function getInventoryItems(festivalId: string, categoryId?: string, search?: string) {
  const admin = createAdminClient()
  let query = admin.from("inventory_items").select("*, inventory_categories(name)").eq("festival_id", festivalId).order("name")
  if (categoryId) query = query.eq("category_id", categoryId)
  if (search) query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%`)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function getInventoryItem(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("inventory_items").select("*, inventory_categories(name)").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function createInventoryItem(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("inventory_items").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    category_id: form.category_id || null, sku: form.sku, barcode: form.barcode || null,
    name: form.name, description: form.description || null, brand: form.brand || null,
    model: form.model || null, unit: form.unit || "piece", unit_price: form.unit_price || 0,
    cost_price: form.cost_price || 0, min_stock: form.min_stock || 0, max_stock: form.max_stock || 0,
    reorder_level: form.reorder_level || 0, tax_rate: form.tax_rate || 0, hsn_code: form.hsn_code || null,
    notes: form.notes || null, created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/inventory`)
  return { data: data as InventoryItem }
}

export async function updateInventoryItem(id: string, form: any) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("inventory_items").update(form).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as InventoryItem }
}

export async function deleteInventoryItem(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("inventory_items").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// INVENTORY STOCK
// ============================================================

export async function getInventoryStock(festivalId: string, warehouseId?: string, itemId?: string) {
  const admin = createAdminClient()
  let query = admin.from("inventory_stock").select("*, inventory_items(name, sku, unit), warehouses(warehouse_name), warehouse_locations(location_code)").eq("festival_id", festivalId)
  if (warehouseId) query = query.eq("warehouse_id", warehouseId)
  if (itemId) query = query.eq("item_id", itemId)
  const { data, error } = await query.order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

// ============================================================
// STOCK TRANSACTIONS
// ============================================================

export async function getStockTransactions(festivalId: string, itemId?: string, limit = 50) {
  const admin = createAdminClient()
  let query = admin.from("stock_transactions").select("*, inventory_items(name, sku), warehouses(warehouse_name)").eq("festival_id", festivalId).order("created_at", { ascending: false }).limit(limit)
  if (itemId) query = query.eq("item_id", itemId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data: data as StockTransaction[] }
}

export async function createStockTransaction(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data: stock } = await admin.from("inventory_stock").select("id, quantity").eq("item_id", form.item_id).eq("warehouse_id", form.warehouse_id).maybeSingle()
  const qtyChange = form.movement_type === "in" || form.movement_type === "transfer_in" || form.movement_type === "adjustment_up" || form.movement_type === "returned" || form.movement_type === "unreserved" ? form.quantity : -form.quantity
  if (stock) {
    await admin.from("inventory_stock").update({ quantity: stock.quantity + qtyChange }).eq("id", stock.id)
  } else {
    await admin.from("inventory_stock").insert({
      organization_id: auth.organization_id, festival_id: form.festival_id,
      item_id: form.item_id, variant_id: form.variant_id || null,
      warehouse_id: form.warehouse_id, location_id: form.location_id || null,
      quantity: qtyChange > 0 ? qtyChange : 0, unit_cost: form.unit_cost || 0,
    })
  }
  const { data, error } = await admin.from("stock_transactions").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    item_id: form.item_id, variant_id: form.variant_id || null,
    warehouse_id: form.warehouse_id, location_id: form.location_id || null,
    movement_type: form.movement_type, quantity: form.quantity,
    unit_cost: form.unit_cost || null, reference_type: form.reference_type || null,
    reference_id: form.reference_id || null, notes: form.notes || null,
    performed_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/inventory`)
  return { data: data as StockTransaction }
}

// ============================================================
// STOCK ADJUSTMENTS
// ============================================================

export async function getStockAdjustments(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("stock_adjustments").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data: data as StockAdjustment[] }
}

export async function createStockAdjustment(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const adjNumber = generateNumber("ADJ")
  const { data, error } = await admin.from("stock_adjustments").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    adjustment_number: adjNumber, reason: form.reason, notes: form.notes || null,
    created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/inventory`)
  return { data: data as StockAdjustment }
}

export async function approveStockAdjustment(id: string, approved: boolean) {
  const auth = await getAuth()
  const admin = createAdminClient()
  const { data: adj } = await admin.from("stock_adjustments").select("organization_id, festival_id, reason").eq("id", id).single()
  if (!adj) return { error: "Adjustment not found" }
  if (approved) {
    await admin.from("stock_adjustments").update({ status: "approved", approved_by: auth?.id, approved_at: new Date().toISOString() }).eq("id", id)
  } else {
    await admin.from("stock_adjustments").update({ status: "rejected", approved_by: auth?.id, approved_at: new Date().toISOString() }).eq("id", id)
  }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// STOCK TRANSFERS
// ============================================================

export async function getStockTransfers(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("stock_transfers").select("*, from_warehouse:from_warehouse_id(warehouse_name), to_warehouse:to_warehouse_id(warehouse_name)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

export async function createStockTransfer(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const transferNumber = generateNumber("TRF")
  const { data, error } = await admin.from("stock_transfers").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    transfer_number: transferNumber, from_warehouse_id: form.from_warehouse_id,
    to_warehouse_id: form.to_warehouse_id, notes: form.notes || null,
    transferred_by: auth.user.id, transferred_at: new Date().toISOString(),
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/inventory`)
  return { data: data as StockTransfer }
}

export async function completeStockTransfer(id: string) {
  const admin = createAdminClient()
  const auth = await getAuth()
  const { data, error } = await admin.from("stock_transfers").update({
    status: "completed", received_by: auth?.id, received_at: new Date().toISOString(),
  }).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as StockTransfer }
}

// ============================================================
// PURCHASE REQUESTS
// ============================================================

export async function getPurchaseRequests(festivalId: string, status?: string) {
  const admin = createAdminClient()
  let query = admin.from("purchase_requests").select("*, purchase_request_items(*)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data: data as PurchaseRequest[] }
}

export async function getPurchaseRequest(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("purchase_requests").select("*, purchase_request_items(*)").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function createPurchaseRequest(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const prNumber = generateNumber("PR")
  const { data, error } = await admin.from("purchase_requests").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    pr_number: prNumber, title: form.title, description: form.description || null,
    requested_by: auth.user.id, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/inventory`)
  return { data: data as PurchaseRequest }
}

export async function updatePurchaseRequestStatus(id: string, status: string, rejectedReason?: string) {
  const auth = await getAuth()
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "approved") { updates.approved_by = auth?.id; updates.approved_at = new Date().toISOString() }
  if (status === "rejected") { updates.approved_by = auth?.id; updates.approved_at = new Date().toISOString(); updates.rejected_reason = rejectedReason || null }
  const { data, error } = await admin.from("purchase_requests").update(updates).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as PurchaseRequest }
}

export async function deletePurchaseRequest(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("purchase_requests").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// PURCHASE ORDERS
// ============================================================

export async function getPurchaseOrders(festivalId: string, status?: string) {
  const admin = createAdminClient()
  let query = admin.from("purchase_orders").select("*, vendors(company_name), purchase_requests(title)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (status) query = query.eq("status", status)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function getPurchaseOrder(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("purchase_orders").select("*, purchase_order_items(*), vendors(company_name, vendor_code)").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function createPurchaseOrder(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const poNumber = generateNumber("PO")
  const { data, error } = await admin.from("purchase_orders").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    pr_id: form.pr_id || null, vendor_id: form.vendor_id || null,
    po_number: poNumber, title: form.title, description: form.description || null,
    expected_delivery: form.expected_delivery || null,
    delivery_address: form.delivery_address || null, billing_address: form.billing_address || null,
    terms_conditions: form.terms_conditions || null, notes: form.notes || null,
    created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/inventory`)
  return { data: data as PurchaseOrder }
}

export async function updatePurchaseOrder(id: string, form: any) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("purchase_orders").update(form).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as PurchaseOrder }
}

export async function deletePurchaseOrder(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("purchase_orders").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// VENDORS
// ============================================================

export async function getVendors(festivalId: string, search?: string) {
  const admin = createAdminClient()
  let query = admin.from("vendors").select("*").eq("festival_id", festivalId).order("company_name")
  if (search) query = query.or(`company_name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data: data as Vendor[] }
}

export async function getVendor(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("vendors").select("*, vendor_contacts(*), vendor_documents(*)").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function createVendor(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const vendorCode = generateNumber("VEN")
  const { data, error } = await admin.from("vendors").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    vendor_code: vendorCode, company_name: form.company_name,
    contact_person: form.contact_person || null, email: form.email || null, phone: form.phone || null,
    alternate_phone: form.alternate_phone || null, website: form.website || null,
    address: form.address || null, city: form.city || null, state: form.state || null,
    pincode: form.pincode || null, country: form.country || "India",
    gst_number: form.gst_number || null, pan_number: form.pan_number || null,
    bank_name: form.bank_name || null, bank_account_number: form.bank_account_number || null,
    bank_ifsc: form.bank_ifsc || null, payment_terms: form.payment_terms || null,
    credit_limit: form.credit_limit || null, lead_time_days: form.lead_time_days || null,
    notes: form.notes || null, created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/inventory`)
  return { data: data as Vendor }
}

export async function updateVendor(id: string, form: any) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("vendors").update(form).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as Vendor }
}

export async function deleteVendor(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("vendors").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// ASSETS
// ============================================================

export async function getAssets(festivalId: string, status?: string, categoryId?: string) {
  const admin = createAdminClient()
  let query = admin.from("assets").select("*, asset_categories(name)").eq("festival_id", festivalId).order("name")
  if (status) query = query.eq("status", status)
  if (categoryId) query = query.eq("category_id", categoryId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function getAsset(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("assets").select("*, asset_categories(name), vendors(company_name)").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function createAsset(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const assetCode = generateNumber("AST")
  const { data, error } = await admin.from("assets").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    category_id: form.category_id || null, warehouse_id: form.warehouse_id || null,
    asset_code: assetCode, name: form.name, description: form.description || null,
    serial_number: form.serial_number || null, model_number: form.model_number || null,
    brand: form.brand || null, purchase_date: form.purchase_date || null,
    purchase_cost: form.purchase_cost || null, current_value: form.current_value || null,
    warranty_expiry: form.warranty_expiry || null, supplier_id: form.supplier_id || null,
    location: form.location || null, notes: form.notes || null, created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/inventory`)
  return { data: data as Asset }
}

export async function updateAsset(id: string, form: any) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("assets").update(form).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as Asset }
}

export async function deleteAsset(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("assets").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// ASSET ASSIGNMENTS
// ============================================================

export async function getAssetAssignments(assetId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("asset_assignments").select("*").eq("asset_id", assetId).order("assigned_at", { ascending: false })
  if (error) return { error: error.message }
  return { data: data as AssetAssignment[] }
}

export async function assignAsset(form: any) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("asset_assignments").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id || null,
    asset_id: form.asset_id, assigned_to: form.assigned_to || null,
    assigned_to_name: form.assigned_to_name, assigned_to_department: form.assigned_to_department || null,
    expected_return_at: form.expected_return_at || null,
    condition_on_assign: form.condition_on_assign || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  await admin.from("assets").update({ status: "assigned" }).eq("id", form.asset_id)
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as AssetAssignment }
}

export async function returnAsset(id: string, condition?: string) {
  const admin = createAdminClient()
  const auth = await getAuth()
  const { data: assignment } = await admin.from("asset_assignments").select("asset_id, organization_id").eq("id", id).single()
  if (!assignment) return { error: "Assignment not found" }
  await admin.from("asset_assignments").update({
    returned_at: new Date().toISOString(), condition_on_return: condition || null,
  }).eq("id", id)
  await admin.from("assets").update({ status: "available" }).eq("id", assignment.asset_id)
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// ASSET MAINTENANCE
// ============================================================

export async function getAssetMaintenanceRecords(assetId?: string, festivalId?: string) {
  const admin = createAdminClient()
  let query = admin.from("asset_maintenance").select("*, assets(name, asset_code)").order("scheduled_date", { ascending: false })
  if (assetId) query = query.eq("asset_id", assetId)
  if (festivalId) query = query.eq("festival_id", festivalId)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data }
}

export async function createAssetMaintenance(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("asset_maintenance").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    asset_id: form.asset_id, maintenance_type: form.maintenance_type || "preventive",
    title: form.title, description: form.description || null,
    scheduled_date: form.scheduled_date || null, cost: form.cost || 0,
    vendor_id: form.vendor_id || null, performed_by: form.performed_by || null,
    notes: form.notes || null, created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  await admin.from("assets").update({ status: "under_maintenance" }).eq("id", form.asset_id)
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/inventory`)
  return { data: data as AssetMaintenance }
}

export async function completeAssetMaintenance(id: string, cost?: number) {
  const admin = createAdminClient()
  const auth = await getAuth()
  const { data: rec } = await admin.from("asset_maintenance").select("asset_id, organization_id").eq("id", id).single()
  if (!rec) return { error: "Record not found" }
  await admin.from("asset_maintenance").update({
    status: "completed", completed_date: new Date().toISOString().split("T")[0],
    cost: cost || 0,
  }).eq("id", id)
  await admin.from("assets").update({ status: "available" }).eq("id", rec.asset_id)
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// INVENTORY AUDITS
// ============================================================

export async function getInventoryAudits(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("inventory_audits").select("*, warehouses(warehouse_name)").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

export async function getInventoryAudit(id: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("inventory_audits").select("*, warehouses(warehouse_name), inventory_audit_items(*, inventory_items(name, sku))").eq("id", id).single()
  if (error) return { error: error.message }
  return { data }
}

export async function createInventoryAudit(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const auditNumber = generateNumber("AUD")
  const { data, error } = await admin.from("inventory_audits").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    warehouse_id: form.warehouse_id, audit_number: auditNumber,
    conducted_by: auth.user.id, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/inventory`)
  return { data: data as InventoryAudit }
}

export async function updateAuditStatus(id: string, status: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("inventory_audits").update({ status }).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as InventoryAudit }
}

// ============================================================
// GOODS RECEIPTS
// ============================================================

export async function getGoodsReceipts(festivalId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("goods_receipts").select("*, purchase_orders(po_number, vendors(company_name))").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data }
}

export async function createGoodsReceipt(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const grNumber = generateNumber("GR")
  const { data, error } = await admin.from("goods_receipts").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    po_id: form.po_id, gr_number: grNumber,
    received_by: auth.user.id, delivery_note_number: form.delivery_note_number || null,
    invoice_number: form.invoice_number || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/inventory`)
  return { data: data as GoodsReceipt }
}

// ============================================================
// VENDOR CONTACTS
// ============================================================

export async function createVendorContact(form: any) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("vendor_contacts").insert({
    organization_id: auth.organization_id, vendor_id: form.vendor_id,
    name: form.name, designation: form.designation || null, email: form.email || null,
    phone: form.phone || null, is_primary: form.is_primary || false, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as VendorContact }
}

export async function deleteVendorContact(id: string) {
  const admin = createAdminClient()
  const { error } = await admin.from("vendor_contacts").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { success: true }
}

// ============================================================
// VENDOR PAYMENTS
// ============================================================

export async function getVendorPayments(vendorId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("vendor_payments").select("*").eq("vendor_id", vendorId).order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data: data as VendorPayment[] }
}

export async function createVendorPayment(form: any) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const paymentNumber = generateNumber("PAY")
  const { data, error } = await admin.from("vendor_payments").insert({
    organization_id: auth.organization_id, vendor_id: form.vendor_id,
    po_id: form.po_id || null, payment_number: paymentNumber, amount: form.amount,
    payment_method: form.payment_method || null, transaction_id: form.transaction_id || null,
    reference_number: form.reference_number || null, notes: form.notes || null,
    created_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as VendorPayment }
}

// ============================================================
// VENDOR RATINGS
// ============================================================

export async function createVendorRating(form: any) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("vendor_ratings").insert({
    organization_id: auth.organization_id, vendor_id: form.vendor_id,
    po_id: form.po_id || null, quality_rating: form.quality_rating || null,
    delivery_rating: form.delivery_rating || null, price_rating: form.price_rating || null,
    comment: form.comment || null, rated_by: auth.user.id,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as VendorRating }
}

// ============================================================
// ASSET MOVEMENTS
// ============================================================

export async function createAssetMovement(form: any) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("asset_movements").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id || null,
    asset_id: form.asset_id, from_location: form.from_location || null,
    to_location: form.to_location, from_warehouse_id: form.from_warehouse_id || null,
    to_warehouse_id: form.to_warehouse_id || null, moved_by: auth.user.id,
    reason: form.reason || null, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  await admin.from("assets").update({ location: form.to_location }).eq("id", form.asset_id)
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as AssetMovement }
}

// ============================================================
// ASSET DISPOSALS
// ============================================================

export async function createAssetDisposal(form: any) {
  const auth = await checkOrgAccess(form.festival_id)
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("asset_disposals").insert({
    organization_id: auth.organization_id, festival_id: form.festival_id,
    asset_id: form.asset_id, disposal_type: form.disposal_type,
    disposal_reason: form.disposal_reason, sale_amount: form.sale_amount || null,
    buyer_name: form.buyer_name || null, buyer_contact: form.buyer_contact || null,
    authorized_by: auth.user.id, notes: form.notes || null,
  }).select().single()
  if (error) return { error: error.message }
  await admin.from("assets").update({ status: "disposed" }).eq("id", form.asset_id)
  revalidatePath(`/dashboard/organization/${auth.organization_id}/festivals/${form.festival_id}/inventory`)
  return { data: data as AssetDisposal }
}

// ============================================================
// INVENTORY VARIANTS
// ============================================================

export async function getInventoryVariants(itemId: string) {
  const admin = createAdminClient()
  const { data, error } = await admin.from("inventory_variants").select("*").eq("item_id", itemId).order("variant_name")
  if (error) return { error: error.message }
  return { data: data as InventoryVariant[] }
}

export async function createInventoryVariant(form: any) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("inventory_variants").insert({
    organization_id: auth.organization_id, item_id: form.item_id,
    variant_sku: form.variant_sku, variant_name: form.variant_name,
    attributes: form.attributes || {}, unit_price: form.unit_price || 0,
    cost_price: form.cost_price || 0,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as InventoryVariant }
}

// ============================================================
// ASSET CATEGORIES
// ============================================================

export async function getAssetCategories() {
  const admin = createAdminClient()
  const { data, error } = await admin.from("asset_categories").select("*").order("sort_order")
  if (error) return { error: error.message }
  return { data: data as AssetCategory[] }
}

export async function createAssetCategory(form: any) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("asset_categories").insert({
    organization_id: auth.organization_id, name: form.name, description: form.description || null,
    parent_id: form.parent_id || null, useful_life_years: form.useful_life_years || null,
    depreciation_rate: form.depreciation_rate || null, icon: form.icon || null,
    sort_order: form.sort_order || 0,
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization`, false as any)
  return { data: data as AssetCategory }
}
