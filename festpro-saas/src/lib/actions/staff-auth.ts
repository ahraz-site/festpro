"use server"

import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

export interface StaffMember {
  id: string
  organization_id: string
  festival_id?: string
  name: string
  username: string
  password?: string
  raw_password?: string
  role:
    | "organization_owner"
    | "fest_administrator"
    | "team_manager"
    | "judge"
    | "stage_manager"
    | "announcer"
    | "media_manager"
    | "prizes"
    | "green_room"
    | string
  phone?: string
  status?: string
  created_at?: string
}

export interface StaffSession {
  id: string
  name: string
  username: string
  role: string
  organizationId: string
  festivalId?: string
}

async function resolveOrgFestivalIds(orgId: string): Promise<string[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from("festivals")
    .select("id")
    .eq("organization_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
  return (data || []).map((f: any) => f.id)
}

// ────────────────────────────────────────────
// 1. GET ALL PEOPLE & ACCESS MEMBERS (Tenant-Isolated)
// ────────────────────────────────────────────

export async function getOrganizationStaff(orgId: string): Promise<StaffMember[]> {
  const admin = createAdminClient()
  const membersMap = new Map<string, StaffMember>()

  try {
    const festIds = await resolveOrgFestivalIds(orgId)

    // 1. Check organization_members joined with profiles
    const { data: orgMems } = await admin
      .from("organization_members")
      .select("id, role, created_at, user:profiles(id, email, first_name, last_name, phone, role)")
      .eq("organization_id", orgId)

    if (orgMems) {
      for (const m of orgMems) {
        const u: any = m.user || {}
        const fullName =
          `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
          u.email?.split("@")[0] ||
          "Member"
        const username = u.email ? u.email.split("@")[0].toLowerCase() : `user_${m.id.slice(0, 5)}`
        membersMap.set(username, {
          id: m.id,
          organization_id: orgId,
          festival_id: festIds[0],
          name: fullName,
          username,
          role: m.role || u.role || "organization_owner",
          phone: u.phone || "",
          status: "active",
          created_at: m.created_at,
        })
      }
    }

    // 2. Check festival_settings custom_fields.staff_members for this org's festivals only
    if (festIds.length > 0) {
      const { data: settingsList } = await admin
        .from("festival_settings")
        .select("festival_id, custom_fields")
        .in("festival_id", festIds)
        .order("updated_at", { ascending: false })

      if (settingsList) {
        for (const s of settingsList) {
          let cf = s.custom_fields
          if (typeof cf === "string") {
            try { cf = JSON.parse(cf) } catch {}
          }
          const staffList: StaffMember[] = cf?.staff_members || []
          for (const st of staffList) {
            if (st.username) {
              membersMap.set(st.username.toLowerCase(), {
                ...st,
                organization_id: st.organization_id || orgId,
                festival_id: st.festival_id || s.festival_id,
              })
            }
          }
        }
      }

      // 3. Check festival_judges table scoped to this organization's festivals
      const { data: judges } = await admin
        .from("festival_judges")
        .select("*")
        .in("festival_id", festIds)
        .order("created_at", { ascending: false })

      if (judges) {
        for (const j of judges) {
          const uname = String(j.username || "").toLowerCase()
          if (uname && !membersMap.has(uname)) {
            membersMap.set(uname, {
              id: j.id,
              organization_id: j.organization_id || orgId,
              festival_id: j.festival_id,
              name: j.name,
              username: uname,
              password: j.raw_password,
              raw_password: j.raw_password,
              role: "judge",
              phone: j.phone || "",
              status: j.status || "active",
              created_at: j.created_at,
            })
          }
        }
      }
    }
  } catch (err) {
    console.warn("getOrganizationStaff warning:", err)
  }

  return Array.from(membersMap.values())
}

// ────────────────────────────────────────────
// 2. UPSERT PERSON / STAFF MEMBER WITH PASSWORD
// ────────────────────────────────────────────

export async function upsertOrganizationStaff(
  orgId: string,
  festivalId: string | null | undefined,
  staff: Partial<StaffMember>
): Promise<{ success: boolean; error?: string; member?: StaffMember }> {
  const admin = createAdminClient()
  try {
    const cleanUser = String(staff.username || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "")
    const cleanName = String(staff.name || "").trim()
    const cleanPass = String(staff.password || staff.raw_password || "").trim()
    const cleanRole = String(staff.role || "judge").trim()
    const cleanPhone = String(staff.phone || "").trim()

    if (!cleanUser || !cleanName) {
      return { success: false, error: "Name and valid username are required." }
    }
    if (!cleanPass) {
      return { success: false, error: "Password is required." }
    }

    let targetFestivalId = festivalId || null
    if (!targetFestivalId) {
      const festIds = await resolveOrgFestivalIds(orgId)
      targetFestivalId = festIds[0] || null
    }

    const memberId = staff.id || `staff_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    const newMember: StaffMember = {
      id: memberId,
      organization_id: orgId,
      festival_id: targetFestivalId || undefined,
      name: cleanName,
      username: cleanUser,
      password: cleanPass,
      raw_password: cleanPass,
      role: cleanRole,
      phone: cleanPhone,
      status: "active",
      created_at: staff.created_at || new Date().toISOString(),
    }

    // 1. If role is judge and festival exists, persist in festival_judges
    if (cleanRole === "judge" && targetFestivalId) {
      try {
        await admin.from("festival_judges").upsert(
          {
            id: memberId,
            festival_id: targetFestivalId,
            organization_id: orgId,
            name: cleanName,
            username: cleanUser,
            password_hash: cleanPass,
            raw_password: cleanPass,
            phone: cleanPhone,
            status: "active",
            assigned_competitions: [],
            updated_at: new Date().toISOString(),
          },
          { onConflict: "username" }
        )
      } catch (err) {
        console.warn("festival_judges upsert notice:", err)
      }
    }

    // 2. Save into festival_settings custom_fields.staff_members (insert if no settings row exists yet)
    if (targetFestivalId) {
      const { data: sRow } = await admin
        .from("festival_settings")
        .select("id, custom_fields")
        .eq("festival_id", targetFestivalId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      let cf = sRow?.custom_fields || {}
      if (typeof cf === "string") {
        try { cf = JSON.parse(cf) } catch {}
      }
      let list: StaffMember[] = Array.isArray(cf?.staff_members) ? cf.staff_members : []
      list = list.filter((m) => m.username.toLowerCase() !== cleanUser && m.id !== memberId)
      list.push(newMember)

      const updatedFields = { ...(typeof cf === "object" && cf ? cf : {}), staff_members: list }

      if (sRow?.id) {
        await admin
          .from("festival_settings")
          .update({
            custom_fields: updatedFields,
            updated_at: new Date().toISOString(),
          })
          .eq("id", sRow.id)
      } else {
        await admin.from("festival_settings").insert({
          festival_id: targetFestivalId,
          custom_fields: updatedFields,
          updated_at: new Date().toISOString(),
        })
      }
    } else {
      return {
        success: false,
        error: "Please create a festival workspace first before assigning staff credentials.",
      }
    }

    return { success: true, member: newMember }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save person" }
  }
}

// ────────────────────────────────────────────
// 3. REMOVE STAFF MEMBER
// ────────────────────────────────────────────

export async function removeOrganizationStaff(
  orgId: string,
  festivalId: string | null | undefined,
  memberId: string,
  username?: string
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient()
  try {
    const festIds = festivalId ? [festivalId] : await resolveOrgFestivalIds(orgId)

    // 1. Remove from festival_judges scoped to org festivals
    if (festIds.length > 0) {
      if (username) {
        await admin
          .from("festival_judges")
          .delete()
          .in("festival_id", festIds)
          .ilike("username", username)
      }
      await admin
        .from("festival_judges")
        .delete()
        .in("festival_id", festIds)
        .eq("id", memberId)

      // 2. Remove from festival_settings custom_fields.staff_members across org festivals
      const { data: settingsRows } = await admin
        .from("festival_settings")
        .select("id, festival_id, custom_fields")
        .in("festival_id", festIds)

      for (const sRow of settingsRows || []) {
        let cf = sRow.custom_fields || {}
        if (typeof cf === "string") {
          try { cf = JSON.parse(cf) } catch {}
        }
        const list: StaffMember[] = Array.isArray(cf?.staff_members) ? cf.staff_members : []
        const filtered = list.filter(
          (m) =>
            m.id !== memberId &&
            (!username || m.username.toLowerCase() !== username.toLowerCase())
        )
        if (filtered.length !== list.length) {
          await admin
            .from("festival_settings")
            .update({
              custom_fields: { ...cf, staff_members: filtered },
              updated_at: new Date().toISOString(),
            })
            .eq("id", sRow.id)
        }
      }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to remove person" }
  }
}

// ────────────────────────────────────────────
// 4. UNIFIED STAFF LOGIN (Username + Password)
// ────────────────────────────────────────────

export async function loginStaffAction(
  username: string,
  password: string
): Promise<{
  success: boolean
  error?: string
  redirectUrl?: string
  member?: StaffMember
}> {
  try {
    const cleanUser = String(username || "").trim().toLowerCase()
    const cleanPass = String(password || "").trim()

    if (!cleanUser || !cleanPass) {
      return { success: false, error: "Please enter your username and password." }
    }

    const admin = createAdminClient()
    let found: StaffMember | null = null

    // 1. Check festival_judges
    try {
      const { data: judgeRows } = await admin
        .from("festival_judges")
        .select("*")
        .ilike("username", cleanUser)
        .limit(5)

      if (judgeRows && judgeRows.length > 0) {
        const matched = judgeRows.find(
          (j: any) => j.raw_password === cleanPass || j.password_hash === cleanPass
        )
        if (matched) {
          let resolvedOrgId = matched.organization_id
          if (!resolvedOrgId && matched.festival_id) {
            const { data: fest } = await admin
              .from("festivals")
              .select("organization_id")
              .eq("id", matched.festival_id)
              .maybeSingle()
            resolvedOrgId = fest?.organization_id
          }
          found = {
            id: matched.id,
            organization_id: resolvedOrgId || "",
            festival_id: matched.festival_id,
            name: matched.name,
            username: cleanUser,
            role: "judge",
            phone: matched.phone || "",
            status: matched.status || "active",
          }
        }
      }
    } catch {}

    // 2. Check festival_settings custom_fields.staff_members
    if (!found) {
      try {
        const { data: settingsList } = await admin
          .from("festival_settings")
          .select("festival_id, custom_fields")
          .order("updated_at", { ascending: false })
          .limit(50)

        if (settingsList) {
          for (const s of settingsList) {
            let cf = s.custom_fields
            if (typeof cf === "string") {
              try { cf = JSON.parse(cf) } catch {}
            }
            const list: StaffMember[] = Array.isArray(cf?.staff_members) ? cf.staff_members : []
            const match = list.find(
              (m) =>
                String(m.username || "").toLowerCase() === cleanUser &&
                (m.password === cleanPass || m.raw_password === cleanPass)
            )
            if (match) {
              let resolvedOrgId = match.organization_id
              const resolvedFestId = match.festival_id || s.festival_id
              if (!resolvedOrgId && resolvedFestId) {
                const { data: fest } = await admin
                  .from("festivals")
                  .select("organization_id")
                  .eq("id", resolvedFestId)
                  .maybeSingle()
                resolvedOrgId = fest?.organization_id
              }
              found = {
                ...match,
                organization_id: resolvedOrgId || "",
                festival_id: resolvedFestId,
              }
              break
            }
          }
        }
      } catch {}
    }

    if (!found) {
      return {
        success: false,
        error: "Invalid username or password. Please verify with your festival administrator.",
      }
    }

    const cookieStore = await cookies()
    const sessionPayload = {
      id: found.id,
      name: found.name,
      username: found.username,
      role: found.role,
      organizationId: found.organization_id,
      festivalId: found.festival_id,
    }

    cookieStore.set("festpro_staff_session", JSON.stringify(sessionPayload), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    if (found.role === "judge") {
      cookieStore.set(
        "festpro_judge_session",
        JSON.stringify({
          judgeId: found.id,
          festivalId: found.festival_id,
          name: found.name,
          username: found.username,
        }),
        {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        }
      )
    }

    const orgId = found.organization_id
    const festId = found.festival_id
    let redirectUrl = "/dashboard"

    const r = found.role.toLowerCase()
    if (r === "judge") {
      redirectUrl = "/dashboard/judge"
    } else if (orgId && festId) {
      if (r === "media_manager" || r === "media") {
        redirectUrl = `/dashboard/organization/${orgId}/festivals/${festId}/media-panel`
      } else if (r === "stage_manager" || r === "stage") {
        redirectUrl = `/dashboard/organization/${orgId}/festivals/${festId}/stage-desk`
      } else if (r === "team_manager" || r === "team") {
        redirectUrl = `/dashboard/organization/${orgId}/festivals/${festId}/teams/portal`
      } else if (r === "green_room" || r === "greenroom") {
        redirectUrl = `/dashboard/organization/${orgId}/festivals/${festId}/green-room`
      } else if (r === "announcer" || r === "reception") {
        redirectUrl = `/dashboard/organization/${orgId}/festivals/${festId}/announcements`
      } else if (r === "prizes" || r === "award") {
        redirectUrl = `/dashboard/organization/${orgId}/festivals/${festId}/prizes`
      } else {
        redirectUrl = `/dashboard/organization/${orgId}/festivals/${festId}`
      }
    }

    return {
      success: true,
      redirectUrl,
      member: found,
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Authentication failed. Please try again.",
    }
  }
}

// ────────────────────────────────────────────
// 5. GET ACTIVE STAFF SESSION & LOGOUT
// ────────────────────────────────────────────

export async function getStaffSessionAction(): Promise<StaffSession | null> {
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get("festpro_staff_session")?.value
    if (!raw) return null
    return JSON.parse(raw) as StaffSession
  } catch {
    return null
  }
}

export async function logoutStaffAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("festpro_staff_session")
    cookieStore.delete("festpro_judge_session")
    return { success: true }
  } catch {
    return { success: true }
  }
}
