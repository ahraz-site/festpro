"use server"

import { revalidatePath } from "next/cache"
import crypto from "crypto"
import fs from "fs"
import path from "path"
import os from "os"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SaasLicense, GenerateLicenseInput, LicenseStatus } from "@/types/licensing"

const REPO_STORE_PATH = path.join(process.cwd(), "src", "config", "local-licenses.json")
const TMP_STORE_PATH = path.join(os.tmpdir(), "festpro-local-licenses.json")

function readLocalLicenses(): SaasLicense[] {
  for (const p of [TMP_STORE_PATH, REPO_STORE_PATH]) {
    try {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf-8")
        const parsed = JSON.parse(content)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {}
  }
  return []
}

function writeLocalLicenses(licenses: SaasLicense[]) {
  const payload = JSON.stringify(licenses, null, 2)
  // Always write to writable tmpdir on serverless (Vercel) and repo path locally
  try {
    fs.writeFileSync(TMP_STORE_PATH, payload, "utf-8")
  } catch {}
  try {
    const dir = path.dirname(REPO_STORE_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(REPO_STORE_PATH, payload, "utf-8")
  } catch {}
}

function packQuotaNotes(
  rawNotes: string | null | undefined,
  quota: {
    max_participants?: number | null
    max_competitions?: number | null
    max_stages?: number | null
    plan_tier?: string
    valid_until?: string | null
  }
): string | null {
  const cleanNote = (rawNotes || "").replace(/\s*<!--QUOTA:[\s\S]*?-->/g, "").trim()
  const json = JSON.stringify(quota)
  return cleanNote ? `${cleanNote} <!--QUOTA:${json}-->` : `<!--QUOTA:${json}-->`
}

function unpackLicenseRecord(row: any): SaasLicense {
  if (!row) return row
  let notes = row.notes || ""
  let extracted: any = {}
  const match = typeof notes === "string" ? notes.match(/<!--QUOTA:([\s\S]*?)-->/) : null
  if (match && match[1]) {
    try {
      extracted = JSON.parse(match[1])
    } catch {}
    notes = notes.replace(/\s*<!--QUOTA:[\s\S]*?-->/g, "").trim() || null
  }
  return {
    ...row,
    notes: notes || null,
    max_participants: row.max_participants ?? extracted.max_participants ?? null,
    max_competitions: row.max_competitions ?? extracted.max_competitions ?? null,
    max_stages: row.max_stages ?? extracted.max_stages ?? null,
    plan_tier: row.plan_tier ?? extracted.plan_tier ?? "pro",
    valid_until: row.valid_until ?? extracted.valid_until ?? null,
  }
}

function generateReadableKey(): string {
  const segment1 = crypto.randomBytes(2).toString("hex").toUpperCase()
  const segment2 = crypto.randomBytes(2).toString("hex").toUpperCase()
  const year = new Date().getFullYear()
  return `FP-${year}-${segment1}-${segment2}`
}

/**
 * Generate a new license key with client, financial, and quota limits
 */
export async function generateLicense(input: GenerateLicenseInput) {
  try {
    const admin = createAdminClient()
    const license_key = generateReadableKey()
    const total_amount = Number(input.total_amount) || 0
    const paid_amount = Number(input.paid_amount) || 0
    const pending_amount = Math.max(0, total_amount - paid_amount)
    const max_festivals = input.max_festivals !== undefined ? Number(input.max_festivals) : 1
    const max_participants = input.max_participants !== undefined && input.max_participants !== null ? Number(input.max_participants) : null
    const max_competitions = input.max_competitions !== undefined && input.max_competitions !== null ? Number(input.max_competitions) : null
    const max_stages = input.max_stages !== undefined && input.max_stages !== null ? Number(input.max_stages) : null
    const plan_tier = input.plan_tier || "pro"
    const valid_until = input.valid_until || null

    const packedNotes = packQuotaNotes(input.notes, {
      max_participants,
      max_competitions,
      max_stages,
      plan_tier,
      valid_until,
    })

    const baseRecord = {
      id: crypto.randomUUID(),
      license_key,
      client_name: input.client_name.trim(),
      client_phone: input.client_phone?.trim() || null,
      client_email: input.client_email?.trim() || null,
      status: "active",
      hold_reason: null,
      total_amount,
      paid_amount,
      pending_amount,
      max_festivals,
      is_activated: false,
      activated_at: null,
      organization_id: null,
      notes: packedNotes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const fullRecord: SaasLicense = {
      ...baseRecord,
      max_participants,
      max_competitions,
      max_stages,
      plan_tier,
      valid_until,
      status: "active",
    }

    // Try full insert first; if schema doesn't have extended columns yet, fall back to baseRecord (quota stored cleanly in notes)
    try {
      const { data, error } = await admin.from("saas_licenses").insert(fullRecord).select().single()
      if (!error && data) {
        revalidatePath("/dashboard/licensing")
        return { success: true, license: unpackLicenseRecord(data) }
      }
      if (error) {
        const { data: data2, error: err2 } = await admin.from("saas_licenses").insert(baseRecord).select().single()
        if (!err2 && data2) {
          revalidatePath("/dashboard/licensing")
          return { success: true, license: unpackLicenseRecord(data2) }
        }
      }
    } catch (dbErr) {
      console.warn("Supabase saas_licenses insert fallback:", dbErr)
    }

    const local = readLocalLicenses()
    local.unshift(fullRecord)
    writeLocalLicenses(local)

    revalidatePath("/dashboard/licensing")
    return { success: true, license: unpackLicenseRecord(fullRecord) }
  } catch (err: any) {
    console.error("generateLicense error:", err)
    return { error: err?.message || "Failed to generate license" }
  }
}

/**
 * Edit existing license details and limit quotas
 */
export async function updateLicenseDetails(licenseId: string, updates: Partial<SaasLicense>) {
  try {
    const admin = createAdminClient()
    const currentList = (await getLicenses()).data || []
    const existing = currentList.find((l) => l.id === licenseId)
    if (!existing) return { error: "License not found" }

    const total_amount = updates.total_amount !== undefined ? Number(updates.total_amount) : existing.total_amount
    const paid_amount = updates.paid_amount !== undefined ? Number(updates.paid_amount) : existing.paid_amount
    const pending_amount = Math.max(0, total_amount - paid_amount)

    const quotaObj = {
      max_participants: updates.max_participants !== undefined ? updates.max_participants : existing.max_participants,
      max_competitions: updates.max_competitions !== undefined ? updates.max_competitions : existing.max_competitions,
      max_stages: updates.max_stages !== undefined ? updates.max_stages : existing.max_stages,
      plan_tier: updates.plan_tier !== undefined ? updates.plan_tier : existing.plan_tier,
      valid_until: updates.valid_until !== undefined ? updates.valid_until : existing.valid_until,
    }

    const packedNotes = packQuotaNotes(
      updates.notes !== undefined ? updates.notes : existing.notes,
      quotaObj
    )

    const basePayload = {
      client_name: updates.client_name ?? existing.client_name,
      client_phone: updates.client_phone !== undefined ? updates.client_phone : existing.client_phone,
      client_email: updates.client_email !== undefined ? updates.client_email : existing.client_email,
      max_festivals: updates.max_festivals !== undefined ? updates.max_festivals : existing.max_festivals,
      total_amount,
      paid_amount,
      pending_amount,
      notes: packedNotes,
      updated_at: new Date().toISOString(),
    }

    const fullPayload = { ...basePayload, ...quotaObj }

    try {
      const { data, error } = await admin.from("saas_licenses").update(fullPayload).eq("id", licenseId).select().single()
      if (!error && data) {
        revalidatePath("/dashboard/licensing")
        return { success: true, license: unpackLicenseRecord(data) }
      }
      if (error) {
        const { data: d2, error: e2 } = await admin.from("saas_licenses").update(basePayload).eq("id", licenseId).select().single()
        if (!e2 && d2) {
          revalidatePath("/dashboard/licensing")
          return { success: true, license: unpackLicenseRecord(d2) }
        }
      }
    } catch {}

    const local = readLocalLicenses()
    const idx = local.findIndex((l) => l.id === licenseId)
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...fullPayload }
      writeLocalLicenses(local)
      revalidatePath("/dashboard/licensing")
      return { success: true, license: unpackLicenseRecord(local[idx]) }
    }

    return { error: "License not found" }
  } catch (err: any) {
    return { error: err?.message || "Failed to update license" }
  }
}

/**
 * Delete a license completely
 */
export async function deleteLicenseAction(licenseId: string) {
  try {
    const admin = createAdminClient()
    try {
      await admin.from("saas_licenses").delete().eq("id", licenseId)
    } catch {}

    const local = readLocalLicenses()
    const updated = local.filter((l) => l.id !== licenseId)
    writeLocalLicenses(updated)

    revalidatePath("/dashboard/licensing")
    revalidatePath("/dashboard/admin")
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || "Failed to delete license" }
  }
}

/**
 * Clear all licenses (valid UUID safe query)
 */
export async function clearAllDemoLicensesAction() {
  try {
    const admin = createAdminClient()
    try {
      await admin
        .from("saas_licenses")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")
    } catch {}

    writeLocalLicenses([])

    revalidatePath("/dashboard/licensing")
    revalidatePath("/dashboard/admin")
    return { success: true }
  } catch (err: any) {
    return { error: err?.message || "Failed to clear demo licenses" }
  }
}

/**
 * Fetch all licenses with optional filtering
 */
export async function getLicenses(filter?: { status?: string; search?: string }) {
  try {
    const admin = createAdminClient()
    let list: SaasLicense[] = []

    try {
      let query = admin.from("saas_licenses").select("*").order("created_at", { ascending: false })
      if (filter?.status && filter.status !== "all") {
        query = query.eq("status", filter.status)
      }
      const { data, error } = await query
      if (!error && data) {
        list = data.map(unpackLicenseRecord)
      }
    } catch (dbErr) {
      console.warn("Supabase saas_licenses fetch fallback:", dbErr)
    }

    if (list.length === 0) {
      list = readLocalLicenses().map(unpackLicenseRecord)
      if (filter?.status && filter.status !== "all") {
        list = list.filter((l) => l.status === filter.status)
      }
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase()
      list = list.filter(
        (l) =>
          l.client_name?.toLowerCase().includes(q) ||
          l.license_key?.toLowerCase().includes(q) ||
          l.client_phone?.toLowerCase().includes(q) ||
          l.client_email?.toLowerCase().includes(q)
      )
    }

    return { data: list }
  } catch (err: any) {
    console.error("getLicenses error:", err)
    return { data: readLocalLicenses().map(unpackLicenseRecord) }
  }
}

/**
 * Put on Hold, Block, or Activate a license
 */
export async function updateLicenseStatus(
  licenseId: string,
  status: LicenseStatus,
  holdReason?: string
) {
  try {
    const admin = createAdminClient()
    const updates = {
      status,
      hold_reason: status === "on_hold" ? (holdReason || "Pending balance payment") : null,
      updated_at: new Date().toISOString(),
    }

    try {
      const { data, error } = await admin
        .from("saas_licenses")
        .update(updates)
        .eq("id", licenseId)
        .select()
        .single()

      if (!error && data) {
        revalidatePath("/dashboard/licensing")
        revalidatePath("/dashboard", "layout")
        return { success: true, license: unpackLicenseRecord(data) }
      }
    } catch {}

    const list = readLocalLicenses()
    const idx = list.findIndex((l) => l.id === licenseId)
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates }
      writeLocalLicenses(list)
      revalidatePath("/dashboard/licensing")
      return { success: true, license: unpackLicenseRecord(list[idx]) }
    }

    return { error: "License not found" }
  } catch (err: any) {
    return { error: err?.message || "Failed to update license status" }
  }
}

/**
 * Update payment figures
 */
export async function updateLicensePayment(
  licenseId: string,
  paidAmount: number,
  totalAmount?: number
) {
  try {
    const admin = createAdminClient()
    const list = (await getLicenses()).data || []
    const existing = list.find((l) => l.id === licenseId)
    if (!existing) return { error: "License not found" }

    const newTotal = totalAmount !== undefined ? totalAmount : existing.total_amount
    const newPaid = paidAmount
    const newPending = Math.max(0, newTotal - newPaid)
    const autoStatus = newPending === 0 && existing.status === "on_hold" ? "active" : existing.status

    const updates = {
      total_amount: newTotal,
      paid_amount: newPaid,
      pending_amount: newPending,
      status: autoStatus,
      hold_reason: autoStatus === "active" ? null : existing.hold_reason,
      updated_at: new Date().toISOString(),
    }

    try {
      const { data, error } = await admin
        .from("saas_licenses")
        .update(updates)
        .eq("id", licenseId)
        .select()
        .single()

      if (!error && data) {
        revalidatePath("/dashboard/licensing")
        return { success: true, license: unpackLicenseRecord(data) }
      }
    } catch {}

    const localList = readLocalLicenses()
    const idx = localList.findIndex((l) => l.id === licenseId)
    if (idx !== -1) {
      localList[idx] = { ...localList[idx], ...updates }
      writeLocalLicenses(localList)
      revalidatePath("/dashboard/licensing")
      return { success: true, license: unpackLicenseRecord(localList[idx]) }
    }

    return { error: "License not found" }
  } catch (err: any) {
    return { error: err?.message || "Failed to update payment" }
  }
}

/**
 * Verify license key during signup and associate with organization
 */
export async function verifyAndConsumeLicense(licenseKey: string, organizationId: string) {
  try {
    const cleanKey = licenseKey.trim().toUpperCase()
    const admin = createAdminClient()

    let license: SaasLicense | null = null

    try {
      const { data, error } = await admin
        .from("saas_licenses")
        .select("*")
        .eq("license_key", cleanKey)
        .single()

      if (!error && data) {
        license = unpackLicenseRecord(data)
      }
    } catch {}

    if (!license) {
      const local = readLocalLicenses()
      const found = local.find((l) => l.license_key.toUpperCase() === cleanKey)
      license = found ? unpackLicenseRecord(found) : null
    }

    if (!license) {
      return { valid: false, error: "Invalid License Key / Access Code. Please contact administration." }
    }

    if (license.is_activated) {
      return { valid: false, error: "This License Key has already been used and activated." }
    }

    if (license.status === "blocked") {
      return { valid: false, error: "This License Key has been blocked. Please contact administration." }
    }

    const updates = {
      is_activated: true,
      activated_at: new Date().toISOString(),
      organization_id: organizationId,
      updated_at: new Date().toISOString(),
    }

    try {
      await admin.from("saas_licenses").update(updates).eq("id", license.id)
    } catch {}

    const local = readLocalLicenses()
    const idx = local.findIndex((l) => l.id === license!.id)
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updates }
      writeLocalLicenses(local)
    }

    return { valid: true, license: { ...license, ...updates } }
  } catch (err: any) {
    return { valid: false, error: err?.message || "Failed to verify license" }
  }
}

/**
 * Retrieve license details for an organization
 */
export async function getOrganizationLicense(organizationId: string): Promise<SaasLicense | null> {
  try {
    const admin = createAdminClient()
    try {
      const { data, error } = await admin
        .from("saas_licenses")
        .select("*")
        .eq("organization_id", organizationId)
        .single()

      if (!error && data) return unpackLicenseRecord(data)
    } catch {}

    const local = readLocalLicenses()
    const found = local.find((l) => l.organization_id === organizationId)
    return found ? unpackLicenseRecord(found) : null
  } catch {
    return null
  }
}
