"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/types"
import type { ParticipantFormData } from "@/types/participant"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkOrgAccess(festivalId: string) {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  const { data: fest } = await admin.from("festivals").select("organization_id").eq("id", festivalId).single()
  if (!fest) return { allowed: false, error: "Festival not found" } as const
  const { data: member } = await admin.from("organization_members").select("role").eq("organization_id", fest.organization_id).eq("user_id", user.id).single()
  if (!member) return { allowed: false, error: "Not a member" } as const
  return { allowed: true, user, festival: fest, member: member as { role: UserRole } } as const
}

export async function importParticipantsFromCsv(festivalId: string, csvText: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()

  // Parse CSV
  const lines = csvText.trim().split("\n")
  if (lines.length < 2) return { error: "CSV must have a header row and at least one data row" }

  const headers = lines[0].split(",").map(h => h.trim().toLowerCase())
  const requiredFields = ["first_name", "last_name"]
  for (const field of requiredFields) {
    if (!headers.includes(field)) return { error: `CSV must include '${field}' column` }
  }

  const results: { row: number; status: string; error?: string }[] = []
  const insertData: any[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = values[idx] || "" })

    if (!row.first_name || !row.last_name) {
      results.push({ row: i + 1, status: "skipped", error: "Missing first_name or last_name" })
      continue
    }

    insertData.push({
      festival_id: festivalId,
      organization_id: check.festival.organization_id,
      first_name: row.first_name,
      last_name: row.last_name,
      date_of_birth: row.date_of_birth || null,
      gender: (row.gender || "male") as any,
      email: row.email || null,
      phone: row.phone || null,
      address: row.address || null,
      city: row.city || null,
      district: row.district || null,
      state: row.state || null,
      unit: row.unit || null,
      division: row.division || null,
      sector: row.sector || null,
      institution_name: row.institution || row.institution_name || null,
      created_by: check.user.id,
    })
    results.push({ row: i + 1, status: "parsed" })
  }

  if (insertData.length === 0) return { error: "No valid rows to import", results }

  // Batch insert
  const { error } = await admin.from("participants").insert(insertData)
  if (error) return { error: error.message, results }

  revalidatePath(`/dashboard/organization/${check.festival.organization_id}/festivals/${festivalId}/participants`)
  return { success: true, imported: insertData.length, results }
}

export async function exportParticipantsCsv(festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { data } = await admin.from("participants")
    .select("participant_id, registration_number, chest_number, first_name, last_name, date_of_birth, age, gender, email, phone, unit, division, sector, institution_name, city, district, state")
    .eq("festival_id", festivalId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  if (!data || data.length === 0) return { error: "No participants to export" }

  const headers = ["Participant ID", "Registration Number", "Chest Number", "First Name", "Last Name", "Date of Birth", "Age", "Gender", "Email", "Phone", "Unit", "Division", "Sector", "Institution", "City", "District", "State"]
  const csvRows = [headers.join(",")]

  for (const p of data) {
    csvRows.push([
      p.participant_id, p.registration_number, p.chest_number || "",
      p.first_name, p.last_name, p.date_of_birth || "", p.age || "",
      p.gender, p.email || "", p.phone || "",
      p.unit || "", p.division || "", p.sector || "",
      p.institution_name || "", p.city || "", p.district || "", p.state || "",
    ].join(","))
  }

  return { csv: csvRows.join("\n"), filename: `participants-${festivalId}-${Date.now()}.csv` }
}

export async function exportRegistrationReport(festivalId: string) {
  const check = await checkOrgAccess(festivalId)
  if (!check.allowed) return { error: check.error }

  const admin = createAdminClient()
  const { data } = await admin.from("registrations")
    .select("status, participant:participants(participant_id, first_name, last_name, chest_number, unit, division), competition:competitions(name, code)")
    .eq("festival_id", festivalId)

  if (!data || data.length === 0) return { error: "No registrations to export" }

  const headers = ["Participant ID", "Name", "Chest Number", "Unit", "Division", "Competition", "Status"]
  const csvRows = [headers.join(",")]

  for (const r of data) {
    const p = r.participant as any
    const c = r.competition as any
    csvRows.push([
      p?.participant_id || "", `${p?.first_name || ""} ${p?.last_name || ""}`,
      p?.chest_number || "", p?.unit || "", p?.division || "",
      c?.name || "", r.status,
    ].join(","))
  }

  return { csv: csvRows.join("\n"), filename: `registration-report-${festivalId}-${Date.now()}.csv` }
}
