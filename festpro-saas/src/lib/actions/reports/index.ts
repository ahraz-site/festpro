"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { UserRole } from "@/types"
import type { ReportTemplate, SavedReport, FinancialReport } from "@/types/finance"

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

// ── REPORT TEMPLATES ──

export async function getReportTemplates() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data } = await admin.from("report_templates").select("*").eq("organization_id", check.organization_id).order("template_name")
  return { data: data as ReportTemplate[] }
}

export async function upsertReportTemplate(data: {
  id?: string; template_name: string; description?: string; report_type: string
  fields: any; filters?: any; sorting?: any; grouping?: string; chart_type?: string
}) {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const payload = { organization_id: check.organization_id, ...data }
  if (data.id) {
    await admin.from("report_templates").update(payload).eq("id", data.id)
  } else {
    await admin.from("report_templates").insert(payload)
  }
  revalidatePath(`/dashboard/organization/*/festivals/*/reports/templates`)
  return { success: true }
}

export async function deleteReportTemplate(id: string) {
  const admin = createAdminClient()
  await admin.from("report_templates").delete().eq("id", id)
  revalidatePath(`/dashboard/organization/*/festivals/*/reports/templates`)
  return { success: true }
}

// ── REPORT GENERATION ──

export async function generateReport(reportType: string, festivalId?: string, filters?: any) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const baseFilter: any = { organization_id: check.organization_id }
  if (festivalId) baseFilter.festival_id = festivalId

  let data: any[] = []
  let headers: string[] = []

  switch (reportType) {
    case "participants": {
      const { data: d } = await admin.from("participants").select("*, festival:festivals(name)").match(baseFilter).order("created_at", { ascending: false })
      data = d || []
      headers = ["ID", "Name", "Participant Code", "Chest Number", "Unit", "Division", "Sector", "Festival", "Status", "Created"]
      break
    }
    case "competitions": {
      const { data: d } = await admin.from("competitions").select("*, category:competition_categories(name), festival:festivals(name)").match(baseFilter).order("created_at", { ascending: false })
      data = d || []
      headers = ["ID", "Name", "Code", "Category", "Type", "Status", "Participants", "Festival", "Created"]
      break
    }
    case "judges": {
      const { data: d } = await admin.from("competition_judge_assignments").select("*, profile:profiles(first_name, last_name, email), competition:competitions(name), festival:festivals(name)").match(baseFilter).order("created_at", { ascending: false })
      data = d || []
      headers = ["ID", "Name", "Email", "Competition", "Role", "Lead Judge", "Festival", "Assigned"]
      break
    }
    case "attendance": {
      const { data: d } = await admin.from("attendance").select("*, participant:participants(first_name, last_name, participant_id), competition:competitions(name)").match(baseFilter).order("created_at", { ascending: false }).limit(200)
      data = d || []
      headers = ["ID", "Participant", "Participant Code", "Competition", "Status", "Date", "Checked In", "Checked Out"]
      break
    }
    case "results": {
      const { data: d } = await admin.from("result_items").select("*, participant:participants(first_name, last_name, participant_id), competition:competitions(name)").match(baseFilter).order("created_at", { ascending: false }).limit(200)
      data = d || []
      headers = ["ID", "Participant", "Competition", "Rank", "Score", "Grade", "Status", "Medal", "Published"]
      break
    }
    case "certificates": {
      const { data: d } = await admin.from("certificates").select("*, festival:festivals(name), template:certificate_templates(template_name)").match(baseFilter).order("created_at", { ascending: false }).limit(200)
      data = d || []
      headers = ["ID", "Recipient", "Certificate No", "Type", "Template", "Status", "Generated", "Published"]
      break
    }
    case "finance": {
      const { data: d } = await admin.from("transactions").select("*, account:finance_accounts(account_name), category:transaction_categories(name)").match(baseFilter).order("transaction_date", { ascending: false }).limit(200)
      data = d || []
      headers = ["ID", "Type", "Amount", "Account", "Category", "Description", "Date", "Status"]
      break
    }
    case "sponsors": {
      const { data: d } = await admin.from("sponsors").select("*, festival:festivals(name)").match(baseFilter).order("created_at", { ascending: false })
      data = d || []
      headers = ["ID", "Name", "Contact", "Email", "Phone", "Tier", "Amount", "Festival"]
      break
    }
    case "donations": {
      const { data: d } = await admin.from("donations").select("*, festival:festivals(name)").match(baseFilter).order("created_at", { ascending: false })
      data = d || []
      headers = ["ID", "Donor", "Email", "Amount", "Status", "Anonymous", "Festival", "Date"]
      break
    }
    case "units":
    case "divisions":
    case "sectors": {
      const entityField = reportType === "units" ? "unit" : reportType === "divisions" ? "division" : "sector"
      const { data: d } = await admin.from("participants").select("id, first_name, last_name, participant_id, unit, division, sector, festival:festivals(name)").match(baseFilter).order(entityField)
      data = d || []
      headers = ["ID", "Name", "Code", "Unit", "Division", "Sector", "Festival"]
      break
    }
    case "festival": {
      const { data: d } = await admin.from("festivals").select("*, organization:organizations(name)").eq("organization_id", check.organization_id).order("created_at", { ascending: false })
      data = d || []
      headers = ["ID", "Name", "Code", "Organization", "Start", "End", "Status", "Created"]
      break
    }
    default: return { error: "Unknown report type" }
  }

  return { data, headers, count: data.length }
}

// ── SAVED REPORTS ──

export async function getSavedReports() {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { data } = await admin.from("saved_reports").select("*, template:report_templates(template_name)").eq("user_id", user.id).or(`shared_with.cs.{${user.id}}`).order("is_favorite", { ascending: false }).order("updated_at", { ascending: false })
  return { data: data as any[] }
}

export async function saveReport(data: {
  template_id?: string; report_name: string; description?: string; filters?: any; schedule?: string
}) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from("saved_reports").insert({
    organization_id: check.organization_id, user_id: user.id, template_id: data.template_id || null,
    report_name: data.report_name, description: data.description || null,
    filters: data.filters || {}, schedule: data.schedule || "none",
  })
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/*/reports/saved`)
  return { success: true }
}

export async function toggleFavoriteReport(id: string, isFavorite: boolean) {
  const admin = createAdminClient()
  await admin.from("saved_reports").update({ is_favorite: isFavorite }).eq("id", id)
  revalidatePath(`/dashboard/organization/*/festivals/*/reports/saved`)
  return { success: true }
}

export async function deleteSavedReport(id: string) {
  const admin = createAdminClient()
  await admin.from("saved_reports").delete().eq("id", id)
  revalidatePath(`/dashboard/organization/*/festivals/*/reports/saved`)
  return { success: true }
}

// ── FINANCIAL REPORTS ──

export async function getFinancialReports(festivalId?: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  let q = admin.from("financial_reports").select("*").eq("organization_id", check.organization_id).order("generated_at", { ascending: false }).limit(50)
  if (festivalId) q = q.eq("festival_id", festivalId)
  const { data } = await q
  return { data: data as FinancialReport[] }
}

export async function generateFinancialReport(festivalId: string | null, dateFrom?: string, dateTo?: string) {
  const check = await checkOrgAccess(festivalId || undefined)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const baseFilter: any = { organization_id: check.organization_id }
  if (festivalId) baseFilter.festival_id = festivalId
  if (dateFrom) baseFilter.transaction_date_gte = dateFrom
  if (dateTo) baseFilter.transaction_date_lte = dateTo

  const { data: incomeTx } = await admin.from("transactions").select("amount").match(baseFilter).eq("transaction_type", "credit")
  const { data: expenseTx } = await admin.from("transactions").select("amount").match(baseFilter).eq("transaction_type", "debit")
  const { data: allTx } = await admin.from("transactions").select("*, account:finance_accounts(account_name), category:transaction_categories(name)").match(baseFilter).order("transaction_date", { ascending: false }).limit(500)

  const totalIncome = (incomeTx || []).reduce((s: number, t: any) => s + Number(t.amount), 0)
  const totalExpense = (expenseTx || []).reduce((s: number, t: any) => s + Number(t.amount), 0)
  const netBalance = totalIncome - totalExpense

  const { error } = await admin.from("financial_reports").insert({
    organization_id: check.organization_id, festival_id: festivalId || null,
    report_name: `Financial Report ${new Date().toISOString().slice(0, 10)}`,
    report_type: "finance", date_from: dateFrom || null, date_to: dateTo || null,
    total_income: totalIncome, total_expense: totalExpense, net_balance: netBalance,
    data: { transactions: allTx || [] }, generated_by: check.user.id,
  })
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/organization/*/festivals/*/finance/reports`)
  return { success: true }
}

// ── DASHBOARD WIDGETS ──

export async function getDashboardWidgets() {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const admin = createAdminClient()
  const { data } = await admin.from("dashboard_widgets").select("*").eq("user_id", user.id).order("position")
  return { data: data as any[] }
}

export async function upsertDashboardWidget(data: {
  id?: string; widget_type: string; title: string; config?: any; position?: number; size?: string
}) {
  const user = await getAuth()
  if (!user) return { error: "Not authenticated" }
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const payload = {
    organization_id: check.organization_id, user_id: user.id, widget_type: data.widget_type,
    title: data.title, config: data.config || {}, position: data.position || 0,
    size: data.size || "full", is_visible: true,
  }
  if (data.id) {
    await admin.from("dashboard_widgets").update(payload).eq("id", data.id)
  } else {
    await admin.from("dashboard_widgets").insert(payload)
  }
  revalidatePath(`/dashboard/organization/*/festivals/*/finance`)
  return { success: true }
}

export async function deleteDashboardWidget(id: string) {
  const admin = createAdminClient()
  await admin.from("dashboard_widgets").delete().eq("id", id)
  revalidatePath(`/dashboard/organization/*/festivals/*/finance`)
  return { success: true }
}

// ── ANALYTICS ──

export async function getAnalytics(festivalId?: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const baseFilter: any = { organization_id: check.organization_id }
  if (festivalId) baseFilter.festival_id = festivalId

  const [{ count: totalParticipants }, { count: totalCompetitions }, { count: totalJudges },
    { count: totalResults }, { count: totalCertificates }, { count: totalResultsPublished },
    { data: txByMonth }, { data: regByMonth }, { data: compCounts }] = await Promise.all([
    admin.from("participants").select("*", { count: "exact", head: true }).match(baseFilter),
    admin.from("competitions").select("*", { count: "exact", head: true }).match(baseFilter),
    admin.from("competition_judge_assignments").select("*", { count: "exact", head: true }).match(baseFilter),
    admin.from("result_items").select("*", { count: "exact", head: true }).match(baseFilter),
    admin.from("certificates").select("*", { count: "exact", head: true }).match(baseFilter),
    admin.from("result_items").select("*", { count: "exact", head: true }).match({ ...baseFilter, status: "live" }),
    admin.rpc("get_transactions_by_month", { org_id: check.organization_id, f_id: festivalId || null }),
    admin.rpc("get_registrations_by_month", { org_id: check.organization_id, f_id: festivalId || null }),
    admin.from("competitions").select("category_id, category:competition_categories(name)").match(baseFilter),
  ])

  const categoryPopularity: Record<string, number> = {}
  for (const c of (compCounts || []) as any[]) {
    const name = c.category?.name || "Uncategorized"
    categoryPopularity[name] = (categoryPopularity[name] || 0) + 1
  }

  return {
    data: {
      total_participants: totalParticipants || 0,
      total_competitions: totalCompetitions || 0,
      total_judges: totalJudges || 0,
      total_results: totalResults || 0,
      total_certificates: totalCertificates || 0,
      results_published: totalResultsPublished || 0,
      transactions_by_month: txByMonth || [],
      registrations_by_month: regByMonth || [],
      competition_popularity: categoryPopularity,
    },
  }
}

// ── EXPORTS ──

export async function exportReport(reportType: string, format: string, festivalId?: string, filters?: any) {
  const result = await generateReport(reportType, festivalId, filters)
  if (result.error) return { error: result.error }

  const rows = result.data || []
  const headers = result.headers || []

  if (format === "csv") {
    const csv = [headers.join(","), ...rows.map((r: any) => headers.map(h => {
      const val = getNestedValue(r, h.toLowerCase().replace(/\s+/g, "_"))
      return typeof val === "string" ? `"${val.replace(/"/g, '""')}"` : val
    }).join(","))].join("\n")
    return { csv, filename: `${reportType}_${new Date().toISOString().slice(0, 10)}.csv` }
  }

  return { data: rows, headers, format, filename: `${reportType}_${new Date().toISOString().slice(0, 10)}.${format}` }
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((o, k) => (o || {})[k] || "", obj)
}
