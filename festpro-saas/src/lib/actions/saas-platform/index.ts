"use server"

import { revalidatePath } from "next/cache"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"
import type {
  Tenant, SubscriptionPlan, TenantSubscription, BillingAccount,
  PaymentGateway, Invoice, InvoicePayment, CustomDomain, TenantBranding,
  LicenseKey, TenantResourceUsage, SaasDashboardData, InvoiceStatus
} from "@/types/saas-platform"

async function getAuth() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkOrgAccess(organizationId?: string, festivalId?: string) {
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

async function checkSuperAdmin() {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single()
  const allowedRoles = ["platform_owner", "platform_admin", "organization_owner", "organization_admin", "super_admin"]
  if (!profile || !allowedRoles.includes(profile.role)) {
    return { allowed: false, error: "Not authorized" } as const
  }
  return { allowed: true, user } as const
}

function generateNumber(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getSaasPlatformDashboard() {
  const auth = await checkSuperAdmin()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  try {
    const [
      { count: total_tenants }, { count: active_tenants }, { count: trial_tenants },
      { count: suspended_tenants }, { count: total_plans }, { count: total_subscriptions },
      { count: total_invoices }, { count: paid_invoices }, { count: overdue_invoices },
      { count: total_domains }, { count: verified_domains },
    ] = await Promise.all([
      admin.from("saas_tenants").select("*", { count: "exact", head: true }),
      admin.from("saas_tenants").select("*", { count: "exact", head: true }).eq("status", "active"),
      admin.from("saas_tenants").select("*", { count: "exact", head: true }).eq("is_trial", true),
      admin.from("saas_tenants").select("*", { count: "exact", head: true }).eq("status", "suspended"),
      admin.from("saas_subscription_plans").select("*", { count: "exact", head: true }),
      admin.from("tenant_subscriptions").select("*", { count: "exact", head: true }),
      admin.from("saas_invoices").select("*", { count: "exact", head: true }),
      admin.from("saas_invoices").select("*", { count: "exact", head: true }).eq("status", "paid"),
      admin.from("saas_invoices").select("*", { count: "exact", head: true }).in("status", ["overdue", "pending"]),
      admin.from("custom_domains").select("*", { count: "exact", head: true }),
      admin.from("custom_domains").select("*", { count: "exact", head: true }).eq("is_verified", true),
    ])
    const { data: revenue } = await admin.from("saas_invoices").select("total").eq("status", "paid")
    const total_revenue = revenue?.reduce((s, r) => s + Number(r.total || 0), 0) || 0
    const dash: SaasDashboardData = {
      total_tenants: total_tenants || 0, active_tenants: active_tenants || 0,
      trial_tenants: trial_tenants || 0, suspended_tenants: suspended_tenants || 0,
      total_plans: total_plans || 0, total_subscriptions: total_subscriptions || 0,
      mrr: 0, arr: 0, total_invoices: total_invoices || 0, paid_invoices: paid_invoices || 0,
      overdue_invoices: overdue_invoices || 0, total_revenue, monthly_revenue: 0,
      total_domains: total_domains || 0, verified_domains: verified_domains || 0,
      total_backups: 0, total_storage_gb: 0,
    }
    return { data: dash }
  } catch (err) {
    return {
      data: {
        total_tenants: 0, active_tenants: 0, trial_tenants: 0, suspended_tenants: 0,
        total_plans: 0, total_subscriptions: 0, mrr: 0, arr: 0, total_invoices: 0,
        paid_invoices: 0, overdue_invoices: 0, total_revenue: 0, monthly_revenue: 0,
        total_domains: 0, verified_domains: 0, total_backups: 0, total_storage_gb: 0,
      }
    }
  }
}

// ============================================================
// TENANTS
// ============================================================

export async function getTenants(options?: { status?: string; search?: string; page?: number; limit?: number }) {
  const auth = await checkSuperAdmin()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  try {
    let q = admin.from("saas_tenants").select("*", { count: "exact" })
    if (options?.status) q = q.eq("status", options.status)
    if (options?.search) q = q.or(`tenant_name.ilike.%${options.search}%,contact_email.ilike.%${options.search}%,tenant_code.ilike.%${options.search}%`)
    q = q.order("created_at", { ascending: false })
    if (options?.page && options?.limit) q = q.range((options.page - 1) * options.limit, options.page * options.limit - 1)
    const { data, count, error } = await q
    if (error) return { data: [], total: 0 }
    return { data: (data || []) as Tenant[], total: count || 0 }
  } catch {
    return { data: [], total: 0 }
  }
}

export async function getTenantById(id: string) {
  const admin = createAdminClient()
  try {
    const { data, error } = await admin.from("saas_tenants").select("*").eq("id", id).single()
    if (error) return { error: error.message }
    return { data: data as Tenant }
  } catch (err: any) {
    return { error: String(err?.message || "Tenant not found") }
  }
}

export async function createTenant(values: Partial<Tenant>) {
  const auth = await checkSuperAdmin()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const tenant_code = `TNT-${crypto.randomBytes(4).toString("hex").toUpperCase()}`
  const slug = values.tenant_name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  const { data, error } = await admin.from("saas_tenants").insert({
    ...values, tenant_code, slug, status: "trial", is_trial: true, trial_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(),
  }).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/platform/tenants")
  return { data: data as Tenant }
}

export async function updateTenant(id: string, values: Partial<Tenant>) {
  const auth = await checkSuperAdmin()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("saas_tenants").update(values).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/platform/tenants")
  return { data: data as Tenant }
}

export async function suspendTenant(id: string) {
  return updateTenant(id, { status: "suspended", suspended_at: new Date().toISOString() } as Partial<Tenant>)
}

export async function activateTenant(id: string) {
  return updateTenant(id, { status: "active", activated_at: new Date().toISOString(), suspended_at: null } as Partial<Tenant>)
}

export async function deleteTenant(id: string) {
  const auth = await checkSuperAdmin()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { error } = await admin.from("saas_tenants").update({ status: "deleted" }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/platform/tenants")
  return { success: true }
}

// ============================================================
// SUBSCRIPTION PLANS
// ============================================================

export async function getSubscriptionPlans(options?: { is_active?: boolean; is_public?: boolean }) {
  const admin = createAdminClient()
  try {
    let q = admin.from("saas_subscription_plans").select("*", { count: "exact" })
    if (options?.is_active !== undefined) q = q.eq("is_active", options.is_active)
    if (options?.is_public !== undefined) q = q.eq("is_public", options.is_public)
    q = q.order("sort_order", { ascending: true })
    const { data, count, error } = await q
    if (error) return { data: [], total: 0, error: error.message }
    return { data: (data || []) as SubscriptionPlan[], total: count || 0 }
  } catch (err: any) {
    return { data: [], total: 0, error: String(err?.message || "Failed to load plans") }
  }
}

export async function getSubscriptionPlanById(id: string) {
  const admin = createAdminClient()
  try {
    const { data, error } = await admin.from("saas_subscription_plans").select("*").eq("id", id).single()
    if (error) return { error: error.message }
    return { data: data as SubscriptionPlan }
  } catch (err: any) {
    return { error: String(err?.message || "Plan not found") }
  }
}

export async function createSubscriptionPlan(values: Partial<SubscriptionPlan>) {
  const auth = await checkSuperAdmin()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const plan_code = values.plan_code || `PLAN-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
  const { data, error } = await admin.from("saas_subscription_plans").insert({ ...values, plan_code }).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/platform/plans")
  return { data: data as SubscriptionPlan }
}

export async function updateSubscriptionPlan(id: string, values: Partial<SubscriptionPlan>) {
  const auth = await checkSuperAdmin()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("saas_subscription_plans").update(values).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/platform/plans")
  return { data: data as SubscriptionPlan }
}

export async function deleteSubscriptionPlan(id: string) {
  const auth = await checkSuperAdmin()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { error } = await admin.from("saas_subscription_plans").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/platform/plans")
  return { success: true }
}

// ============================================================
// TENANT SUBSCRIPTIONS
// ============================================================

export async function getTenantSubscriptions(options?: { tenant_id?: string; status?: string } | string) {
  const admin = createAdminClient()
  try {
    const tenantId = typeof options === "string" ? options : options?.tenant_id
    const status = typeof options === "string" ? undefined : options?.status
    let q = admin.from("tenant_subscriptions").select("*, saas_subscription_plans(*)")
    if (tenantId) q = q.eq("tenant_id", tenantId)
    if (status) q = q.eq("status", status)
    q = q.order("created_at", { ascending: false })
    const { data, error } = await q
    if (error) return { data: [] }
    return { data: (data || []) as TenantSubscription[] }
  } catch {
    return { data: [] }
  }
}

export async function createTenantSubscription(values: Partial<TenantSubscription>) {
  const auth = await checkSuperAdmin()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("tenant_subscriptions").insert(values).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/platform/tenants")
  return { data: data as TenantSubscription }
}

export async function updateTenantSubscription(id: string, values: Partial<TenantSubscription>) {
  const auth = await checkSuperAdmin()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("tenant_subscriptions").update(values).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/platform/tenants")
  return { data }
}

export async function cancelTenantSubscription(id: string) {
  return updateTenantSubscription(id, {
    status: "canceled", canceled_at: new Date().toISOString(), auto_renew: false,
  } as Partial<TenantSubscription>)
}

// ============================================================
// BILLING ACCOUNTS & GATEWAYS
// ============================================================

export async function getBillingAccounts(tenantId: string) {
  const admin = createAdminClient()
  try {
    const { data, error } = await admin.from("billing_accounts").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false })
    if (error) return { data: [] }
    return { data: (data || []) as BillingAccount[] }
  } catch {
    return { data: [] }
  }
}

export async function getPaymentGateways(tenantId?: string | null) {
  const admin = createAdminClient()
  try {
    let q = admin.from("payment_gateways").select("*")
    if (tenantId !== undefined) q = q.eq("tenant_id", tenantId)
    q = q.order("is_default", { ascending: false })
    const { data, error } = await q
    if (error) return { data: [] }
    return { data: (data || []) as PaymentGateway[] }
  } catch {
    return { data: [] }
  }
}

// ============================================================
// INVOICES
// ============================================================

export async function getInvoices(options?: { tenant_id?: string; status?: InvoiceStatus; page?: number; limit?: number }) {
  const admin = createAdminClient()
  try {
    let q = admin.from("saas_invoices").select("*, saas_tenants!inner(tenant_name,tenant_code)", { count: "exact" })
    if (options?.tenant_id) q = q.eq("tenant_id", options.tenant_id)
    if (options?.status) q = q.eq("status", options.status)
    q = q.order("created_at", { ascending: false })
    if (options?.page && options?.limit) q = q.range((options.page - 1) * options.limit, options.page * options.limit - 1)
    const { data, count, error } = await q
    if (error) return { data: [], total: 0, error: error.message }
    return { data: data || [], total: count || 0 }
  } catch (err: any) {
    return { data: [], total: 0, error: String(err?.message || "Failed to load invoices") }
  }
}

export async function getInvoiceById(id: string) {
  const admin = createAdminClient()
  try {
    const { data, error } = await admin.from("saas_invoices").select("*, saas_tenants(*)").eq("id", id).single()
    if (error) return { error: error.message }
    return { data }
  } catch (err: any) {
    return { error: String(err?.message || "Invoice not found") }
  }
}

export async function createInvoice(values: Partial<Invoice>) {
  const auth = await checkSuperAdmin()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const invoice_number = values.invoice_number || generateNumber("INV")
  const { data, error } = await admin.from("saas_invoices").insert({ ...values, invoice_number }).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/platform/billing")
  return { data }
}

export async function updateInvoice(id: string, values: Partial<Invoice>) {
  const auth = await checkSuperAdmin()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("saas_invoices").update(values).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/platform/billing")
  return { data }
}

// ============================================================
// CUSTOM DOMAINS
// ============================================================

export async function getCustomDomains(options?: { tenant_id?: string; is_verified?: boolean } | string) {
  const admin = createAdminClient()
  try {
    const tenantId = typeof options === "string" ? options : options?.tenant_id
    const isVerified = typeof options === "string" ? undefined : options?.is_verified
    let q = admin.from("custom_domains").select("*, saas_tenants(tenant_name)")
    if (tenantId) q = q.eq("tenant_id", tenantId)
    if (isVerified !== undefined) q = q.eq("is_verified", isVerified)
    q = q.order("created_at", { ascending: false })
    const { data, error } = await q
    if (error) return { data: [], error: error.message }
    return { data: data || [] }
  } catch (err: any) {
    return { data: [], error: String(err?.message || "Failed to load domains") }
  }
}

export async function addCustomDomain(values: Partial<CustomDomain>) {
  const auth = await checkSuperAdmin()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("custom_domains").insert(values).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/platform/domains")
  return { data }
}

export async function deleteCustomDomain(id: string) {
  const auth = await checkSuperAdmin()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { error } = await admin.from("custom_domains").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/platform/domains")
  return { success: true }
}

// ============================================================
// LICENSE KEYS & BRANDING
// ============================================================

export async function getTenantBranding(tenantId: string) {
  const admin = createAdminClient()
  try {
    const { data, error } = await admin.from("tenant_branding").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false }).limit(1)
    if (error) return { data: null }
    return { data: (data?.[0] || null) as TenantBranding | null }
  } catch {
    return { data: null }
  }
}

export async function getLicenseKeys(tenantId?: string) {
  const admin = createAdminClient()
  try {
    let q = admin.from("saas_license_keys").select("*, saas_tenants(tenant_name)")
    if (tenantId) q = q.eq("tenant_id", tenantId)
    q = q.order("created_at", { ascending: false })
    const { data, error } = await q
    if (error) return { data: [], error: error.message }
    return { data: data || [] }
  } catch (err: any) {
    return { data: [], error: String(err?.message || "Failed to load license keys") }
  }
}

export async function createLicenseKey(values: Partial<LicenseKey>) {
  const auth = await checkSuperAdmin()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const license_key = `FESTPRO-${crypto.randomBytes(8).toString("hex").toUpperCase().match(/.{1,4}/g)?.join("-")}`
  const { data, error } = await admin.from("saas_license_keys").insert({ ...values, license_key, status: "active" }).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/platform/licenses")
  return { data }
}

export async function updateLicenseKey(id: string, values: Partial<LicenseKey>) {
  const auth = await checkSuperAdmin()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("saas_license_keys").update(values).eq("id", id).select().single()
  if (error) return { error: error.message }
  revalidatePath("/dashboard/platform/licenses")
  return { data }
}

export async function getTenantResourceUsage(tenantId: string, period?: string) {
  const admin = createAdminClient()
  try {
    let q = admin.from("tenant_resource_usage").select("*").eq("tenant_id", tenantId)
    if (period) {
      const since = new Date()
      if (period === "daily") since.setDate(since.getDate() - 1)
      else if (period === "weekly") since.setDate(since.getDate() - 7)
      else if (period === "monthly") since.setMonth(since.getMonth() - 1)
      else if (period === "yearly") since.setFullYear(since.getFullYear() - 1)
      q = q.gte("recorded_at", since.toISOString())
    }
    q = q.order("recorded_at", { ascending: false }).limit(100)
    const { data, error } = await q
    if (error) return { data: [] }
    return { data: data || [] }
  } catch {
    return { data: [] }
  }
}

export async function getMyTenant(organizationId: string) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  try {
    const { data, error } = await admin.from("saas_tenants").select("*").eq("organization_id", organizationId).single()
    if (error) return { error: error.message }
    return { data: data as Tenant }
  } catch (err: any) {
    return { error: String(err?.message || "Tenant not found") }
  }
}

export async function getMySubscription(tenantId: string) {
  const auth = await checkOrgAccess()
  if (!auth.allowed) return { error: auth.error }
  const admin = createAdminClient()
  try {
    const { data, error } = await admin
      .from("tenant_subscriptions")
      .select("*, saas_subscription_plans(*)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(1)
    if (error) return { error: error.message }
    return { data: data?.[0] as TenantSubscription | null }
  } catch (err: any) {
    return { error: String(err?.message || "Subscription not found") }
  }
}

export async function getMyBranding(tenantId: string) {
  return getTenantBranding(tenantId)
}

export async function getMyInvoices(tenantId: string) {
  return getInvoices({ tenant_id: tenantId })
}

export async function getMyResourceUsage(tenantId: string) {
  return getTenantResourceUsage(tenantId)
}

export async function getPlanFeatures(planId: string) {
  const admin = createAdminClient()
  try {
    const { data, error } = await admin.from("saas_plan_features").select("*").eq("plan_id", planId).order("sort_order", { ascending: true })
    if (error) return { data: [] }
    return { data: data || [] }
  } catch {
    return { data: [] }
  }
}
