"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type {
  FinanceAccount, Transaction, RegistrationPayment, Expense,
  Income, Budget, Sponsor, Donation, PaymentMethod, TransactionCategory,
  ExpenseCategory, Module9DashboardData,
} from "@/types/finance"

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
    const { data: fest } = await admin.from("festivals").select("organization_id, id").eq("id", festivalId).single()
    if (!fest) return { allowed: false, error: "Festival not found" } as const
    const { data: member } = await admin.from("organization_members").select("role").eq("organization_id", fest.organization_id).eq("user_id", user.id).single()
    if (!member) return { allowed: false, error: "Not a member" } as const
    return { allowed: true, user, organization_id: fest.organization_id, festival: fest as { organization_id: string; id: string }, member: member as { role: UserRole } } as const
  }
  const { data: members } = await admin.from("organization_members").select("organization_id, role").eq("user_id", user.id).limit(1)
  if (!members || members.length === 0) return { allowed: false, error: "No organization" } as const
  return { allowed: true, user, organization_id: members[0].organization_id, member: members[0] as { role: UserRole } } as const
}

async function logAudit(organization_id: string, festival_id: string | null, action: string, entity_type: string, entity_id: string | null, metadata?: any) {
  const user = await getAuth()
  const admin = createAdminClient()
  await admin.from("finance_audit_log").insert({
    organization_id, festival_id, action, entity_type, entity_id, performed_by: user?.id || null, metadata,
  })
}

// ── DASHBOARD ──

export async function getFinanceDashboard(festivalId?: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const orgFilter = { organization_id: check.organization_id }
  const festFilter = festivalId ? { festival_id: festivalId } : {}
  const base = { ...orgFilter, ...festFilter }

  const [{ count: tc }, { data: ti }, { data: te }, { count: pp }, { count: pe },
    { count: ab }, { count: ts }, { count: td }, { count: tr }] = await Promise.all([
    admin.from("transactions").select("*", { count: "exact", head: true }).match(base),
    admin.from("transactions").select("amount, transaction_type").match(base),
    admin.from("transactions").select("amount, transaction_type").match(base),
    admin.from("registration_payments").select("*", { count: "exact", head: true }).match({ ...base, status: "pending" }),
    admin.from("expenses").select("*", { count: "exact", head: true }).match({ ...base, status: "pending" }),
    admin.from("budgets").select("*", { count: "exact", head: true }).match({ ...base, status: "active" }),
    admin.from("sponsors").select("*", { count: "exact", head: true }).match(base),
    admin.from("donations").select("*", { count: "exact", head: true }).match(base),
    admin.from("saved_reports").select("*", { count: "exact", head: true }).match(base),
  ])

  const totalIncome = (ti || []).filter((t: any) => t.transaction_type === "credit").reduce((s: number, t: any) => s + Number(t.amount), 0)
  const totalExpense = (te || []).filter((t: any) => t.transaction_type === "debit").reduce((s: number, t: any) => s + Number(t.amount), 0)

  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { data: monthTx } = await admin.from("transactions").select("amount, transaction_type").match(base).gte("created_at", firstDay)
  const incomeMonth = (monthTx || []).filter((t: any) => t.transaction_type === "credit").reduce((s: number, t: any) => s + Number(t.amount), 0)
  const expenseMonth = (monthTx || []).filter((t: any) => t.transaction_type === "debit").reduce((s: number, t: any) => s + Number(t.amount), 0)

  return {
    data: {
      total_transactions: tc || 0, total_income: totalIncome, total_expense: totalExpense,
      net_balance: totalIncome - totalExpense, pending_payments: pp || 0, pending_expenses: pe || 0,
      active_budgets: ab || 0, total_sponsors: ts || 0, total_donations: td || 0, total_reports: tr || 0,
      income_this_month: incomeMonth, expense_this_month: expenseMonth,
    } as Module9DashboardData,
  }
}

// ── ACCOUNTS ──

export async function getAccounts() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data } = await admin.from("finance_accounts").select("*").eq("organization_id", check.organization_id).order("account_code")
  return { data: data as FinanceAccount[] }
}

export async function upsertAccount(data: Partial<FinanceAccount>) {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const payload = { ...data, organization_id: check.organization_id }
  if (data.id) {
    await admin.from("finance_accounts").update(payload).eq("id", data.id)
  } else {
    await admin.from("finance_accounts").insert(payload)
  }
  await logAudit(check.organization_id, null, data.id ? "account.updated" : "account.created", "finance_accounts", data.id || null)
  revalidatePath(`/dashboard/organization/*/festivals/*/finance/accounts`)
  return { success: true }
}

export async function deleteAccount(id: string) {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  await admin.from("finance_accounts").delete().eq("id", id)
  await logAudit(check.organization_id, null, "account.deleted", "finance_accounts", id)
  revalidatePath(`/dashboard/organization/*/festivals/*/finance/accounts`)
  return { success: true }
}

// ── TRANSACTIONS ──

export async function getTransactions(festivalId?: string, filters?: { status?: string; type?: string; from?: string; to?: string }) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  let q = admin.from("transactions").select("*, account:finance_accounts(*), category:transaction_categories(*), payment_method:payment_methods(*)").eq("organization_id", check.organization_id).order("transaction_date", { ascending: false }).limit(100)
  if (festivalId) q = q.eq("festival_id", festivalId)
  if (filters?.status) q = q.eq("status", filters.status)
  if (filters?.type) q = q.eq("transaction_type", filters.type)
  if (filters?.from) q = q.gte("transaction_date", filters.from)
  if (filters?.to) q = q.lte("transaction_date", filters.to)
  const { data } = await q
  return { data: data as Transaction[] }
}

export async function createTransaction(data: {
  festival_id?: string; account_id?: string; category_id?: string; payment_method_id?: string
  transaction_type: string; amount: number; description?: string; reference_number?: string; transaction_date?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from("transactions").insert({
    organization_id: check.organization_id, festival_id: data.festival_id || null,
    account_id: data.account_id || null, category_id: data.category_id || null,
    payment_method_id: data.payment_method_id || null, transaction_type: data.transaction_type,
    amount: data.amount, description: data.description || null,
    reference_number: data.reference_number || null, transaction_date: data.transaction_date || new Date().toISOString().slice(0, 10),
    created_by: check.user.id,
  })
  if (error) return { error: error.message }
  await logAudit(check.organization_id, data.festival_id || null, "transaction.created", "transactions", null)
  revalidatePath(`/dashboard/organization/*/festivals/*/finance`)
  return { success: true }
}

export async function updateTransactionStatus(id: string, status: string) {
  const admin = createAdminClient()
  await admin.from("transactions").update({ status }).eq("id", id)
  revalidatePath(`/dashboard/organization/*/festivals/*/finance`)
  return { success: true }
}

// ── REGISTRATION PAYMENTS ──

export async function getRegistrationPayments(festivalId: string, filters?: { status?: string }) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  let q = admin.from("registration_payments").select("*, participant:participants(id, first_name, last_name, participant_id), payment_method:payment_methods(*)").eq("organization_id", check.organization_id).eq("festival_id", festivalId).order("created_at", { ascending: false }).limit(100)
  if (filters?.status) q = q.eq("status", filters.status)
  const { data } = await q
  return { data: data as any[] }
}

export async function createRegistrationPayment(data: {
  festival_id: string; participant_id: string; amount: number; discount_amount?: number
  scholarship_amount?: number; payment_method_id?: string; due_date?: string; notes?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const net = data.amount - (data.discount_amount || 0) - (data.scholarship_amount || 0)
  const { error } = await admin.from("registration_payments").insert({
    organization_id: check.organization_id, festival_id: data.festival_id, participant_id: data.participant_id,
    amount: data.amount, discount_amount: data.discount_amount || 0, scholarship_amount: data.scholarship_amount || 0,
    net_amount: net, payment_method_id: data.payment_method_id || null, due_date: data.due_date || null,
    notes: data.notes || null, created_by: check.user.id, status: "pending",
  })
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/${data.festival_id}/finance/payments`)
  return { success: true }
}

export async function updatePaymentStatus(id: string, status: string) {
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "completed") updates.paid_at = new Date().toISOString()
  await admin.from("registration_payments").update(updates).eq("id", id)
  revalidatePath(`/dashboard/organization/*/festivals/*/finance/payments`)
  return { success: true }
}

// ── EXPENSES ──

export async function getExpenses(festivalId?: string, filters?: { category_id?: string; status?: string; from?: string; to?: string }) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  let q = admin.from("expenses").select("*, category:expense_categories(*)").eq("organization_id", check.organization_id).order("expense_date", { ascending: false }).limit(100)
  if (festivalId) q = q.eq("festival_id", festivalId)
  if (filters?.category_id) q = q.eq("category_id", filters.category_id)
  if (filters?.status) q = q.eq("status", filters.status)
  if (filters?.from) q = q.gte("expense_date", filters.from)
  if (filters?.to) q = q.lte("expense_date", filters.to)
  const { data } = await q
  return { data: data as Expense[] }
}

export async function createExpense(data: {
  festival_id?: string; category_id?: string; title: string; description?: string; amount: number
  expense_date?: string; vendor_name?: string; vendor_contact?: string; invoice_number?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from("expenses").insert({
    organization_id: check.organization_id, festival_id: data.festival_id || null,
    category_id: data.category_id || null, title: data.title, description: data.description || null,
    amount: data.amount, expense_date: data.expense_date || new Date().toISOString().slice(0, 10),
    vendor_name: data.vendor_name || null, vendor_contact: data.vendor_contact || null,
    invoice_number: data.invoice_number || null, created_by: check.user.id,
  })
  if (error) return { error: error.message }
  await logAudit(check.organization_id, data.festival_id || null, "expense.created", "expenses", null)
  revalidatePath(`/dashboard/organization/*/festivals/*/finance/expenses`)
  return { success: true }
}

export async function updateExpenseStatus(id: string, status: string) {
  const user = await getAuth()
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "approved") { updates.approved_by = user?.id; updates.approved_at = new Date().toISOString() }
  if (status === "paid") { updates.paid_by = user?.id; updates.paid_at = new Date().toISOString() }
  await admin.from("expenses").update(updates).eq("id", id)
  revalidatePath(`/dashboard/organization/*/festivals/*/finance/expenses`)
  return { success: true }
}

export async function deleteExpense(id: string) {
  const admin = createAdminClient()
  await admin.from("expenses").delete().eq("id", id)
  revalidatePath(`/dashboard/organization/*/festivals/*/finance/expenses`)
  return { success: true }
}

// ── INCOME ──

export async function getIncome(festivalId?: string, filters?: { from?: string; to?: string }) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  let q = admin.from("income").select("*").eq("organization_id", check.organization_id).order("income_date", { ascending: false }).limit(100)
  if (festivalId) q = q.eq("festival_id", festivalId)
  if (filters?.from) q = q.gte("income_date", filters.from)
  if (filters?.to) q = q.lte("income_date", filters.to)
  const { data } = await q
  return { data: data as Income[] }
}

export async function createIncome(data: {
  festival_id?: string; title: string; description?: string; amount: number
  income_date?: string; source?: string; is_recurring?: boolean
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from("income").insert({
    organization_id: check.organization_id, festival_id: data.festival_id || null,
    title: data.title, description: data.description || null, amount: data.amount,
    income_date: data.income_date || new Date().toISOString().slice(0, 10),
    source: data.source || null, is_recurring: data.is_recurring || false, created_by: check.user.id,
  })
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/*/finance/income`)
  return { success: true }
}

// ── BUDGETS ──

export async function getBudgets(festivalId?: string, filters?: { status?: string }) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  let q = admin.from("budgets").select("*, category:expense_categories(*)").eq("organization_id", check.organization_id).order("created_at", { ascending: false }).limit(100)
  if (festivalId) q = q.eq("festival_id", festivalId)
  if (filters?.status) q = q.eq("status", filters.status)
  const { data } = await q
  return { data: data as Budget[] }
}

export async function upsertBudget(data: {
  id?: string; festival_id?: string; name: string; description?: string; category_id?: string
  allocated_amount: number; start_date?: string; end_date?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const payload = {
    organization_id: check.organization_id, festival_id: data.festival_id || null, name: data.name,
    description: data.description || null, category_id: data.category_id || null,
    allocated_amount: data.allocated_amount, start_date: data.start_date || null, end_date: data.end_date || null,
    created_by: check.user.id,
  }
  if (data.id) {
    await admin.from("budgets").update(payload).eq("id", data.id)
  } else {
    await admin.from("budgets").insert(payload)
  }
  revalidatePath(`/dashboard/organization/*/festivals/*/finance/budgets`)
  return { success: true }
}

export async function updateBudgetStatus(id: string, status: string) {
  const admin = createAdminClient()
  await admin.from("budgets").update({ status }).eq("id", id)
  revalidatePath(`/dashboard/organization/*/festivals/*/finance/budgets`)
  return { success: true }
}

// ── SPONSORS ──

export async function getSponsors(festivalId?: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  let q = admin.from("sponsors").select("*").eq("organization_id", check.organization_id).order("created_at", { ascending: false })
  if (festivalId) q = q.eq("festival_id", festivalId)
  const { data } = await q
  return { data: data as Sponsor[] }
}

export async function upsertSponsor(data: {
  id?: string; festival_id?: string; sponsor_name: string; contact_person?: string; email?: string
  phone?: string; address?: string; logo_url?: string; website?: string; sponsorship_tier?: string; amount?: number
  agreement_url?: string; notes?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const payload = {
    organization_id: check.organization_id, festival_id: data.festival_id || null, sponsor_name: data.sponsor_name,
    contact_person: data.contact_person || null, email: data.email || null, phone: data.phone || null,
    address: data.address || null, logo_url: data.logo_url || null, website: data.website || null,
    sponsorship_tier: data.sponsorship_tier || null, amount: data.amount || 0,
    agreement_url: data.agreement_url || null, notes: data.notes || null, created_by: check.user.id,
  }
  if (data.id) {
    await admin.from("sponsors").update(payload).eq("id", data.id)
  } else {
    await admin.from("sponsors").insert(payload)
  }
  revalidatePath(`/dashboard/organization/*/festivals/*/finance/sponsors`)
  return { success: true }
}

export async function deleteSponsor(id: string) {
  const admin = createAdminClient()
  await admin.from("sponsors").delete().eq("id", id)
  revalidatePath(`/dashboard/organization/*/festivals/*/finance/sponsors`)
  return { success: true }
}

// ── DONATIONS ──

export async function getDonations(festivalId?: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  let q = admin.from("donations").select("*").eq("organization_id", check.organization_id).order("created_at", { ascending: false }).limit(100)
  if (festivalId) q = q.eq("festival_id", festivalId)
  const { data } = await q
  return { data: data as Donation[] }
}

export async function createDonation(data: {
  festival_id?: string; donor_name: string; donor_email?: string; donor_phone?: string
  amount: number; message?: string; is_anonymous?: boolean; payment_method_id?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from("donations").insert({
    organization_id: check.organization_id, festival_id: data.festival_id || null, donor_name: data.donor_name,
    donor_email: data.donor_email || null, donor_phone: data.donor_phone || null, amount: data.amount,
    message: data.message || null, is_anonymous: data.is_anonymous || false,
    payment_method_id: data.payment_method_id || null,
  })
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/*/finance/donations`)
  return { success: true }
}

// ── EXPENSE CATEGORIES ──

export async function getExpenseCategories() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data } = await admin.from("expense_categories").select("*").eq("organization_id", check.organization_id).order("name")
  return { data: data as ExpenseCategory[] }
}

// ── PAYMENT METHODS ──

export async function getPaymentMethods() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data } = await admin.from("payment_methods").select("*").eq("organization_id", check.organization_id).order("method_name")
  return { data: data as PaymentMethod[] }
}

export async function upsertPaymentMethod(data: {
  id?: string; method_name: string; gateway: string; is_online?: boolean; account_details?: any
}) {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const payload = { organization_id: check.organization_id, ...data }
  if (data.id) {
    await admin.from("payment_methods").update(payload).eq("id", data.id)
  } else {
    await admin.from("payment_methods").insert(payload)
  }
  revalidatePath(`/dashboard/organization/*/festivals/*/finance/settings`)
  return { success: true }
}

// ── TRANSACTION CATEGORIES ──

export async function getTransactionCategories() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data } = await admin.from("transaction_categories").select("*").eq("organization_id", check.organization_id).order("name")
  return { data: data as TransactionCategory[] }
}
