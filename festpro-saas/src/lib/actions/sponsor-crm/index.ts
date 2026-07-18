"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"
import type {
  Sponsor, SponsorCategoryMeta, SponsorPackage, SponsorContract, SponsorBenefit,
  SponsorPayment, SponsorBrandAsset, DonorGroup, Donor, DonorContact,
  FundCampaign, FundTarget, FundCollector, CollectorAssignment,
  Pledge, PledgeInstallment, Donation, DonationReceipt, ReceiptTemplate,
  PaymentMethodMeta, Transaction, CrmTag, CrmNote, CrmTask, CrmFollowup,
  CrmActivity, ThankYouMessage, Module15DashboardData,
} from "@/types/sponsor-crm"

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

// ── DASHBOARD ──

export async function getSponsorDashboard(festivalId: string) {
  const admin = createAdminClient()
  const today = new Date().toISOString().split("T")[0]
  const [{ count: ts }, { count: as_ }, { count: td }, { count: tc }, { count: ac }, { count: tco }, { count: dtd }, da, { count: tpl }, { count: ppl }, { count: tr }, tcol, cg] = await Promise.all([
    admin.from("sponsors").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("sponsors").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("agreement_status", "active"),
    admin.from("donors").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("fund_campaigns").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("fund_campaigns").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("status", "active"),
    admin.from("fund_collectors").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("donations").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).eq("payment_date", today),
    admin.from("donations").select("amount").eq("festival_id", festivalId).eq("payment_date", today),
    admin.from("pledges").select("*", { count: "exact", head: true }).eq("festival_id", festivalId),
    admin.from("pledges").select("*", { count: "exact", head: true }).eq("festival_id", festivalId).in("status", ["pending", "partial"]),
    admin.from("donation_receipts").select("*", { count: "exact", head: true }),
    admin.from("donations").select("amount").eq("festival_id", festivalId),
    admin.from("fund_campaigns").select("goal_amount").eq("festival_id", festivalId),
  ])
  const donationAmt = da.data?.reduce((s: number, r: any) => s + Number(r.amount), 0) || 0
  const totalCollected = tcol.data?.reduce((s: number, r: any) => s + Number(r.amount), 0) || 0
  const totalGoal = cg.data?.reduce((s: number, r: any) => s + Number(r.goal_amount), 0) || 0
  return {
    data: {
      total_sponsors: ts || 0, active_sponsors: as_ || 0, total_donors: td || 0,
      total_campaigns: tc || 0, active_campaigns: ac || 0, total_collectors: tco || 0,
      total_donations_today: dtd || 0, donation_amount_today: donationAmt,
      total_pledges: tpl || 0, pending_pledges: ppl || 0, total_receipts: tr || 0,
      total_collected: totalCollected, total_campaign_goal: totalGoal,
    } as Module15DashboardData,
  }
}

// ── SPONSOR CATEGORIES ──

export async function getSponsorCategories() {
  const supabase = createAdminClient()
  const { data } = await supabase.from("sponsor_categories").select("*").order("sort_order")
  return { data: data as SponsorCategoryMeta[] }
}

export async function upsertSponsorCategory(data: { id?: string; name: string; category: string; description?: string; min_amount?: number; color?: string }) {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("sponsor_categories").update(data).eq("id", data.id)
  else await admin.from("sponsor_categories").insert({ ...data, organization_id: check.organization_id })
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor/sponsor-categories")
  return { success: true }
}

// ── SPONSORS ──

export async function getSponsors(festivalId: string, filters?: { status?: string }) {
  const supabase = createAdminClient()
  let q = supabase.from("sponsors").select("*, category:sponsor_categories(*)").eq("festival_id", festivalId).order("company_name")
  if (filters?.status) q = q.eq("agreement_status", filters.status)
  const { data } = await q
  return { data: data as any[] }
}

export async function upsertSponsor(data: {
  id?: string; festival_id: string; company_name: string; contact_person: string
  category_id?: string; email?: string; phone?: string; website?: string; address?: string
  tax_id?: string; gst_number?: string; sponsorship_amount?: number; notes?: string; tags?: string[]
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("sponsors").update(data).eq("id", data.id)
  else await admin.from("sponsors").insert({ ...data, organization_id: check.organization_id, created_by: check.user.id })
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor/sponsors")
  return { success: true }
}

export async function deleteSponsor(id: string) {
  const admin = createAdminClient()
  await admin.from("sponsors").delete().eq("id", id)
  return { success: true }
}

export async function updateSponsorStatus(id: string, status: string) {
  const admin = createAdminClient()
  await admin.from("sponsors").update({ agreement_status: status }).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor/sponsors")
  return { success: true }
}

// ── SPONSOR CONTRACTS ──

export async function getSponsorContracts(sponsorId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("sponsor_contracts").select("*").eq("sponsor_id", sponsorId).order("created_at", { ascending: false })
  return { data: data as SponsorContract[] }
}

export async function createSponsorContract(data: {
  sponsor_id: string; title: string; amount: number; start_date: string; end_date: string; content?: string
}) {
  const admin = createAdminClient()
  const { data: sp } = await admin.from("sponsors").select("organization_id").eq("id", data.sponsor_id).single()
  if (!sp) return { error: "Sponsor not found" }
  await admin.from("sponsor_contracts").insert({
    ...data, contract_number: generateNumber("SC"), organization_id: sp.organization_id, created_by: (await getAuth())?.id,
  })
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor/sponsors")
  return { success: true }
}

// ── SPONSOR BENEFITS ──

export async function getSponsorBenefits(sponsorId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("sponsor_benefits").select("*").eq("sponsor_id", sponsorId).order("created_at")
  return { data: data as SponsorBenefit[] }
}

export async function createSponsorBenefit(data: { sponsor_id: string; benefit_type: string; description: string }) {
  const admin = createAdminClient()
  const { data: sp } = await admin.from("sponsors").select("organization_id").eq("id", data.sponsor_id).single()
  if (!sp) return { error: "Sponsor not found" }
  await admin.from("sponsor_benefits").insert({ ...data, organization_id: sp.organization_id })
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor/sponsors")
  return { success: true }
}

// ── SPONSOR PAYMENTS ──

export async function getSponsorPayments(sponsorId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("sponsor_payments").select("*").eq("sponsor_id", sponsorId).order("payment_date", { ascending: false })
  return { data: data as SponsorPayment[] }
}

export async function createSponsorPayment(data: { sponsor_id: string; amount: number; payment_method: string; payment_date: string; transaction_id?: string; notes?: string }) {
  const admin = createAdminClient()
  const { data: sp } = await admin.from("sponsors").select("organization_id").eq("id", data.sponsor_id).single()
  if (!sp) return { error: "Sponsor not found" }
  await admin.from("sponsor_payments").insert({ ...data, organization_id: sp.organization_id, created_by: (await getAuth())?.id })
  await admin.rpc("update_sponsor_amount_received", { p_sponsor_id: data.sponsor_id })
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor/sponsors")
  return { success: true }
}

// ── DONOR GROUPS ──

export async function getDonorGroups(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("donor_groups").select("*").eq("festival_id", festivalId).order("name")
  return { data: data as DonorGroup[] }
}

export async function upsertDonorGroup(data: { id?: string; festival_id: string; name: string; description?: string; color?: string }) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("donor_groups").update(data).eq("id", data.id)
  else await admin.from("donor_groups").insert({ ...data, organization_id: check.organization_id })
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor/donor-groups")
  return { success: true }
}

// ── DONORS ──

export async function getDonors(festivalId: string, filters?: { type?: string; group_id?: string; search?: string }) {
  const supabase = createAdminClient()
  let q = supabase.from("donors").select("*, group:donor_groups(*)").eq("festival_id", festivalId).order("name")
  if (filters?.type) q = q.eq("donor_type", filters.type)
  if (filters?.group_id) q = q.eq("group_id", filters.group_id)
  if (filters?.search) q = q.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
  const { data } = await q
  return { data: data as any[] }
}

export async function upsertDonor(data: {
  id?: string; festival_id: string; name: string; donor_type?: string; group_id?: string
  email?: string; phone?: string; address?: string; city?: string; state?: string
  occupation?: string; company_name?: string; notes?: string; tags?: string[]
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("donors").update(data).eq("id", data.id)
  else await admin.from("donors").insert({ ...data, organization_id: check.organization_id, created_by: check.user.id })
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor/donors")
  return { success: true }
}

export async function deleteDonor(id: string) {
  const admin = createAdminClient()
  await admin.from("donors").delete().eq("id", id)
  return { success: true }
}

// ── FUND CAMPAIGNS ──

export async function getCampaigns(festivalId: string, filters?: { status?: string }) {
  const supabase = createAdminClient()
  let q = supabase.from("fund_campaigns").select("*").eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (filters?.status) q = q.eq("status", filters.status)
  const { data } = await q
  return { data: data as FundCampaign[] }
}

export async function upsertCampaign(data: {
  id?: string; festival_id: string; name: string; description?: string; goal_amount: number
  start_date: string; end_date: string; banner_url?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("fund_campaigns").update(data).eq("id", data.id)
  else await admin.from("fund_campaigns").insert({ ...data, organization_id: check.organization_id, created_by: check.user.id, status: "draft" })
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor/campaigns")
  return { success: true }
}

export async function updateCampaignStatus(id: string, status: string) {
  const admin = createAdminClient()
  await admin.from("fund_campaigns").update({ status }).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor/campaigns")
  return { success: true }
}

// ── FUND COLLECTORS ──

export async function getCollectors(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("fund_collectors").select("*").eq("festival_id", festivalId).order("name")
  return { data: data as FundCollector[] }
}

export async function upsertCollector(data: {
  id?: string; festival_id: string; name: string; phone?: string; email?: string; area?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (data.id) await admin.from("fund_collectors").update(data).eq("id", data.id)
  else await admin.from("fund_collectors").insert({ ...data, organization_id: check.organization_id, created_by: check.user.id })
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor/collectors")
  return { success: true }
}

// ── PLEDGES ──

export async function getPledges(festivalId: string, filters?: { status?: string }) {
  const supabase = createAdminClient()
  let q = supabase.from("pledges").select("*, donor:donors(name, phone), collector:fund_collectors(name), campaign:fund_campaigns(name)")
    .eq("festival_id", festivalId).order("created_at", { ascending: false })
  if (filters?.status) q = q.eq("status", filters.status)
  const { data } = await q
  return { data: data as any[] }
}

export async function createPledge(data: {
  festival_id: string; amount: number; donor_id?: string; collector_id?: string; campaign_id?: string
  due_date?: string; installments?: number; purpose?: string; notes?: string
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  await admin.from("pledges").insert({
    ...data, pledge_number: generateNumber("PL"), organization_id: check.organization_id,
    created_by: check.user.id, balance: data.amount, amount_paid: 0, status: "pending",
  })
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor/pledges")
  return { success: true }
}

export async function updatePledgeStatus(id: string, status: string) {
  const admin = createAdminClient()
  await admin.from("pledges").update({ status }).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor/pledges")
  return { success: true }
}

// ── DONATIONS ──

export async function getDonations(festivalId: string, filters?: { payment_method?: string; date?: string }) {
  const supabase = createAdminClient()
  let q = supabase.from("donations").select("*, donor:donors(name, phone), collector:fund_collectors(name), campaign:fund_campaigns(name)")
    .eq("festival_id", festivalId).order("created_at", { ascending: false }).limit(100)
  if (filters?.payment_method) q = q.eq("payment_method", filters.payment_method)
  if (filters?.date) q = q.eq("payment_date", filters.date)
  const { data } = await q
  return { data: data as any[] }
}

export async function createDonation(data: {
  festival_id: string; donor_name: string; amount: number; payment_method: string; payment_date: string
  donor_id?: string; collector_id?: string; campaign_id?: string; pledge_id?: string
  donor_phone?: string; donor_email?: string; purpose?: string; notes?: string; is_anonymous?: boolean
}) {
  const check = await checkOrgAccess(data.festival_id)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const donationNumber = generateNumber("DON")
  const { data: donation, error } = await admin.from("donations").insert({
    ...data, donation_number: donationNumber, organization_id: check.organization_id,
    created_by: check.user.id, receipt_status: "draft",
  }).select("id").single()
  if (error) return { error: error.message }
  const receiptNumber = generateNumber("RCP")
  const { error: rErr } = await admin.from("donation_receipts").insert({
    donation_id: donation.id, receipt_number: receiptNumber, receipt_date: data.payment_date,
    donor_name: data.donor_name, amount: data.amount, payment_method: data.payment_method as any,
    purpose: data.purpose, organization_id: check.organization_id, created_by: check.user.id, status: "draft",
  })
  if (rErr) return { error: rErr.message }
  if (data.pledge_id) {
    const { data: pledge } = await admin.from("pledges").select("amount_paid, balance, amount").eq("id", data.pledge_id).single()
    if (pledge) {
      const newPaid = (pledge.amount_paid || 0) + data.amount
      const newBalance = pledge.amount - newPaid
      const pStatus = newBalance <= 0 ? "completed" : "partial"
      await admin.from("pledges").update({ amount_paid: newPaid, balance: newBalance, status: pStatus }).eq("id", data.pledge_id)
    }
  }
  if (data.campaign_id) {
    const { data: camp } = await admin.from("fund_campaigns").select("collected_amount").eq("id", data.campaign_id).single()
    if (camp) {
      await admin.from("fund_campaigns").update({ collected_amount: (camp.collected_amount || 0) + data.amount }).eq("id", data.campaign_id)
    }
  }
  if (data.collector_id) {
    const { data: col } = await admin.from("fund_collectors").select("total_collected").eq("id", data.collector_id).single()
    if (col) {
      await admin.from("fund_collectors").update({ total_collected: (col.total_collected || 0) + data.amount }).eq("id", data.collector_id)
    }
  }
  if (data.donor_id) {
    const { data: donor } = await admin.from("donors").select("total_donated").eq("id", data.donor_id).single()
    if (donor) {
      await admin.from("donors").update({
        total_donated: (donor.total_donated || 0) + data.amount, last_donation_date: data.payment_date,
      }).eq("id", data.donor_id)
    }
  }
  await admin.from("transactions").insert({
    organization_id: check.organization_id, festival_id: data.festival_id,
    transaction_number: donationNumber, type: "donation", category: data.payment_method,
    amount: data.amount, payment_method: data.payment_method as any, transaction_date: data.payment_date,
    donor_name: data.donor_name, description: data.purpose || "Donation", reference_id: donation.id, reference_type: "donation",
  })
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor/donations")
  return { success: true, donation_number: donationNumber }
}

// ── RECEIPTS ──

export async function getReceipts(festivalId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("donation_receipts").select("*, donation:donations(*)").order("created_at", { ascending: false }).limit(100)
  return { data: data as any[] }
}

export async function updateReceiptStatus(id: string, status: string) {
  const admin = createAdminClient()
  await admin.from("donation_receipts").update({ status }).eq("id", id)
  if (status === "issued") {
    const { data: r } = await admin.from("donation_receipts").select("donation_id").eq("id", id).single()
    if (r) await admin.from("donations").update({ receipt_status: "issued" }).eq("id", r.donation_id)
  }
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor/receipts")
  return { success: true }
}

// ── RECEIPT TEMPLATES ──

export async function getReceiptTemplates() {
  const supabase = createAdminClient()
  const { data } = await supabase.from("receipt_templates").select("*").order("name")
  return { data: data as ReceiptTemplate[] }
}

// ── CRM ──

export async function getCrmActivities(entityType: string, entityId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("crm_activities").select("*")
    .eq("entity_type", entityType).eq("entity_id", entityId).order("performed_at", { ascending: false }).limit(50)
  return { data: data as CrmActivity[] }
}

export async function createCrmActivity(data: {
  entity_type: string; entity_id: string; activity_type: string; subject: string
  description?: string; outcome?: string; duration_minutes?: number
}) {
  const admin = createAdminClient()
  const { data: org } = await admin.from("organization_members").select("organization_id").eq("user_id", (await getAuth())?.id).limit(1).single()
  if (!org) return { error: "No organization" }
  await admin.from("crm_activities").insert({
    ...data, organization_id: org.organization_id, performed_by: (await getAuth())?.id,
  })
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor")
  return { success: true }
}

export async function getCrmNotes(entityType: string, entityId: string) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("crm_notes").select("*")
    .eq("entity_type", entityType).eq("entity_id", entityId).order("created_at", { ascending: false })
  return { data: data as CrmNote[] }
}

export async function createCrmNote(data: { entity_type: string; entity_id: string; content: string }) {
  const admin = createAdminClient()
  const { data: org } = await admin.from("organization_members").select("organization_id").eq("user_id", (await getAuth())?.id).limit(1).single()
  if (!org) return { error: "No organization" }
  await admin.from("crm_notes").insert({ ...data, organization_id: org.organization_id, created_by: (await getAuth())?.id })
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor")
  return { success: true }
}

export async function getCrmTasks(entityType?: string, entityId?: string) {
  const supabase = createAdminClient()
  let q = supabase.from("crm_tasks").select("*").order("created_at", { ascending: false }).limit(50)
  if (entityType && entityId) q = q.eq("entity_type", entityType).eq("entity_id", entityId)
  const { data } = await q
  return { data: data as CrmTask[] }
}

export async function upsertCrmTask(data: {
  id?: string; title: string; description?: string; priority?: string; assigned_to?: string; due_date?: string
  entity_type?: string; entity_id?: string
}) {
  const admin = createAdminClient()
  const { data: org } = await admin.from("organization_members").select("organization_id").eq("user_id", (await getAuth())?.id).limit(1).single()
  if (!org) return { error: "No organization" }
  if (data.id) await admin.from("crm_tasks").update(data).eq("id", data.id)
  else await admin.from("crm_tasks").insert({ ...data, organization_id: org.organization_id, created_by: (await getAuth())?.id })
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor")
  return { success: true }
}

export async function updateCrmTaskStatus(id: string, status: string) {
  const admin = createAdminClient()
  const updates: any = { status }
  if (status === "completed") updates.completed_at = new Date().toISOString()
  await admin.from("crm_tasks").update(updates).eq("id", id)
  revalidatePath("/dashboard/organization/*/festivals/*/sponsor")
  return { success: true }
}

// ── VERIFY RECEIPT ──

export async function verifyReceipt(receiptNumber: string) {
  const admin = createAdminClient()
  const { data } = await admin.from("donation_receipts").select("*, donation:donations(*)").eq("receipt_number", receiptNumber).single()
  if (!data) return { error: "Receipt not found" }
  await admin.from("donation_receipts").update({ is_verified: true }).eq("id", data.id)
  return { data, valid: data.status === "issued" }
}
