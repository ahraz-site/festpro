"use server"

import { revalidatePath } from "next/cache"
import crypto from "crypto"
import fs from "fs"
import path from "path"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SaasLicense, GenerateLicenseInput, LicenseStatus } from "@/types/licensing"

// Fallback local file store to ensure 100% operation even if Supabase table migration hasn't been executed yet
const LOCAL_STORE_PATH = path.join(process.cwd(), "src", "config", "local-licenses.json")

function readLocalLicenses(): SaasLicense[] {
  try {
    if (fs.existsSync(LOCAL_STORE_PATH)) {
      const content = fs.readFileSync(LOCAL_STORE_PATH, "utf-8")
      return JSON.parse(content)
    }
  } catch (err) {
    console.error("Failed to read local licenses store:", err)
  }
  return []
}

function writeLocalLicenses(licenses: SaasLicense[]) {
  try {
    const dir = path.dirname(LOCAL_STORE_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(licenses, null, 2), "utf-8")
  } catch (err) {
    console.error("Failed to write local licenses store:", err)
  }
}

function generateReadableKey(): string {
  const segment1 = crypto.randomBytes(2).toString("hex").toUpperCase()
  const segment2 = crypto.randomBytes(2).toString("hex").toUpperCase()
  const year = new Date().getFullYear()
  return `FP-${year}-${segment1}-${segment2}`
}

/**
 * Generate a new license key with client and financial details
 */
export async function generateLicense(input: GenerateLicenseInput) {
  try {
    const admin = createAdminClient()
    const license_key = generateReadableKey()
    const total_amount = Number(input.total_amount) || 0
    const paid_amount = Number(input.paid_amount) || 0
    const pending_amount = Math.max(0, total_amount - paid_amount)
    const max_festivals = input.max_festivals ? Number(input.max_festivals) : 1

    const newRecord: SaasLicense = {
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
      notes: input.notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Try Supabase first
    try {
      const { data, error } = await admin
        .from("saas_licenses")
        .insert(newRecord)
        .select()
        .single()

      if (!error && data) {
        revalidatePath("/dashboard/licensing")
        revalidatePath("/dashboard/admin/licenses")
        return { success: true, license: data as SaasLicense }
      }
    } catch (dbErr) {
      console.warn("Supabase saas_licenses insert failed, falling back to local store:", dbErr)
    }

    // Fallback: Local JSON store
    const local = readLocalLicenses()
    local.unshift(newRecord)
    writeLocalLicenses(local)

    revalidatePath("/dashboard/licensing")
    return { success: true, license: newRecord }
  } catch (err: any) {
    console.error("generateLicense error:", err)
    return { error: err?.message || "Failed to generate license" }
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
        list = data as SaasLicense[]
      }
    } catch (dbErr) {
      console.warn("Supabase saas_licenses fetch failed, using local store:", dbErr)
    }

    if (list.length === 0) {
      list = readLocalLicenses()
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
    return { data: readLocalLicenses() }
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
        return { success: true, license: data as SaasLicense }
      }
    } catch {}

    // Fallback: Local store
    const list = readLocalLicenses()
    const idx = list.findIndex((l) => l.id === licenseId)
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates }
      writeLocalLicenses(list)
      revalidatePath("/dashboard/licensing")
      return { success: true, license: list[idx] }
    }

    return { error: "License not found" }
  } catch (err: any) {
    return { error: err?.message || "Failed to update license status" }
  }
}

/**
 * Update payment figures (e.g. logging newly received payment)
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

    // Auto-unhold if pending is 0 and it was on hold for pending payment
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
        return { success: true, license: data as SaasLicense }
      }
    } catch {}

    const localList = readLocalLicenses()
    const idx = localList.findIndex((l) => l.id === licenseId)
    if (idx !== -1) {
      localList[idx] = { ...localList[idx], ...updates }
      writeLocalLicenses(localList)
      revalidatePath("/dashboard/licensing")
      return { success: true, license: localList[idx] }
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
        license = data as SaasLicense
      }
    } catch {}

    if (!license) {
      const local = readLocalLicenses()
      license = local.find((l) => l.license_key.toUpperCase() === cleanKey) || null
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

    // Consume and link
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
 * Retrieve license details for an organization (to check hold/block status and quota)
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

      if (!error && data) return data as SaasLicense
    } catch {}

    const local = readLocalLicenses()
    return local.find((l) => l.organization_id === organizationId) || null
  } catch {
    return null
  }
}
