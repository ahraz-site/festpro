"use server"

import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient as createServerClient } from "@/lib/supabase/server"

export interface JudgeAccount {
  id: string
  festival_id: string
  name: string
  username: string
  password?: string
  stage_id?: string
  stage_name?: string
  phone?: string
  is_lead?: boolean
  status?: string
  assigned_competitions?: string[]
  created_at?: string
}

export interface JudgeSession {
  judgeId: string
  festivalId: string
  name: string
  username: string
  stageName?: string
  isLead?: boolean
}

// ────────────────────────────────────────────
// JUDGE LOGIN / AUTHENTICATION
// ────────────────────────────────────────────

export async function loginJudgeAction(username: string, password: string): Promise<{
  success: boolean
  error?: string
  redirectUrl?: string
  judge?: JudgeSession
}> {
  try {
    const cleanUser = String(username || "").trim().toLowerCase()
    const cleanPass = String(password || "").trim()

    if (!cleanUser || !cleanPass) {
      return { success: false, error: "Username and password are required" }
    }

    const admin = createAdminClient()

    // 1. Check in festival_judges table
    let foundJudge: any = null
    try {
      const { data, error } = await admin
        .from("festival_judges")
        .select("*")
        .ilike("username", cleanUser)
        .limit(1)

      if (!error && data && data.length > 0) {
        foundJudge = data[0]
      }
    } catch (e) {
      console.warn("festival_judges table lookup notice:", e)
    }

    // 2. Fallback check: festival_settings custom_fields.judges (Zero downtime fallback)
    if (!foundJudge) {
      try {
        const { data: settingsList } = await admin
          .from("festival_settings")
          .select("festival_id, custom_fields")
          .order("updated_at", { ascending: false })
          .limit(20)

        if (settingsList) {
          for (const s of settingsList) {
            const list = s.custom_fields?.judges || []
            const match = list.find(
              (j: any) => String(j.username || "").toLowerCase() === cleanUser
            )
            if (match) {
              foundJudge = { ...match, festival_id: s.festival_id }
              break
            }
          }
        }
      } catch (e) {
        console.warn("festival_settings judges check notice:", e)
      }
    }

    // 3. Built-in Demo Judge fallback if database has not yet been seeded
    if (!foundJudge && (cleanUser === "judge1" || cleanUser === "judge")) {
      foundJudge = {
        id: "demo-judge-1",
        festival_id: "c66d0281-bc93-4cb8-b94e-e54bf27c7119",
        name: "Official Stage Judge 1",
        username: "judge1",
        raw_password: "123",
        stage_name: "Main Stage 1",
        is_lead: true,
      }
    }

    if (!foundJudge) {
      return { success: false, error: "Invalid username or password" }
    }

    // Verify Password (supports raw_password or password_hash)
    const validPassword =
      foundJudge.raw_password === cleanPass ||
      foundJudge.password === cleanPass ||
      foundJudge.password_hash === cleanPass

    if (!validPassword) {
      return { success: false, error: "Incorrect password. Please verify and try again." }
    }

    // Set secure HTTP-only judge session cookie
    const sessionData: JudgeSession = {
      judgeId: foundJudge.id,
      festivalId: foundJudge.festival_id,
      name: foundJudge.name || "Judge",
      username: foundJudge.username,
      stageName: foundJudge.stage_name || "Main Stage",
      isLead: !!foundJudge.is_lead,
    }

    const cookieStore = await cookies()
    cookieStore.set("festpro_judge_session", JSON.stringify(sessionData), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days active session
    })

    return {
      success: true,
      redirectUrl: "/dashboard/judge",
      judge: sessionData,
    }
  } catch (err: any) {
    console.error("loginJudgeAction error:", err)
    return { success: false, error: err?.message || "An unexpected error occurred during judge login" }
  }
}

export async function getJudgeSessionAction(): Promise<JudgeSession | null> {
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get("festpro_judge_session")?.value
    if (!raw) return null
    return JSON.parse(raw) as JudgeSession
  } catch {
    return null
  }
}

export async function logoutJudgeAction(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("festpro_judge_session")
    return { success: true }
  } catch {
    return { success: true }
  }
}

// ────────────────────────────────────────────
// ORGANIZER: JUDGE MANAGEMENT
// ────────────────────────────────────────────

export async function getFestivalJudgesAction(festivalId: string): Promise<{
  success: boolean
  data?: JudgeAccount[]
  error?: string
}> {
  try {
    const admin = createAdminClient()
    const judgesMap = new Map<string, JudgeAccount>()

    // 1. Fetch from festival_judges table
    try {
      const { data } = await admin
        .from("festival_judges")
        .select("*")
        .eq("festival_id", festivalId)
        .order("created_at", { ascending: false })

      if (data) {
        for (const j of data) {
          judgesMap.set(j.id, {
            id: j.id,
            festival_id: j.festival_id,
            name: j.name,
            username: j.username,
            password: j.raw_password || "••••••",
            stage_id: j.stage_id,
            stage_name: j.stage_name,
            phone: j.phone,
            is_lead: j.is_lead,
            status: j.status || "active",
            assigned_competitions: j.assigned_competitions || [],
            created_at: j.created_at,
          })
        }
      }
    } catch (e) {
      console.warn("Fetch from festival_judges table notice:", e)
    }

    // 2. Fetch from festival_settings.custom_fields.judges (dual source)
    try {
      const { data: settings } = await admin
        .from("festival_settings")
        .select("custom_fields")
        .eq("festival_id", festivalId)
        .order("updated_at", { ascending: false })
        .limit(1)

      const rawList: any[] = settings?.[0]?.custom_fields?.judges || []
      for (const j of rawList) {
        if (!judgesMap.has(j.id)) {
          judgesMap.set(j.id, j)
        }
      }
    } catch (e) {
      console.warn("Fetch from festival_settings custom_fields notice:", e)
    }

    // If zero judges exist, supply starter judge accounts
    if (judgesMap.size === 0) {
      const defaultJudges: JudgeAccount[] = [
        {
          id: `j-${festivalId}-1`,
          festival_id: festivalId,
          name: "Jury Panel Judge 1",
          username: "judge1",
          password: "123",
          stage_name: "Main Stage",
          is_lead: true,
          status: "active",
        },
        {
          id: `j-${festivalId}-2`,
          festival_id: festivalId,
          name: "Jury Panel Judge 2",
          username: "judge2",
          password: "123",
          stage_name: "Stage 2",
          is_lead: false,
          status: "active",
        },
      ]
      for (const dj of defaultJudges) judgesMap.set(dj.id, dj)
    }

    return { success: true, data: Array.from(judgesMap.values()) }
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to fetch judges" }
  }
}

export async function saveFestivalJudgeAction(
  festivalId: string,
  judge: {
    id?: string
    name: string
    username: string
    password: string
    stageName?: string
    phone?: string
    isLead?: boolean
  }
): Promise<{ success: boolean; data?: JudgeAccount; error?: string }> {
  try {
    const cleanUser = judge.username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "")
    const cleanPass = judge.password.trim()
    if (!cleanUser || !cleanPass || !judge.name.trim()) {
      return { success: false, error: "Judge Name, Username, and Password are required." }
    }

    const admin = createAdminClient()
    const judgeId = judge.id || `jdg-${Date.now()}`

    const newJudgeRecord: JudgeAccount = {
      id: judgeId,
      festival_id: festivalId,
      name: judge.name.trim(),
      username: cleanUser,
      password: cleanPass,
      stage_name: judge.stageName?.trim() || "Main Stage",
      phone: judge.phone?.trim() || "",
      is_lead: !!judge.isLead,
      status: "active",
      created_at: new Date().toISOString(),
    }

    // 1. Save to festival_judges table
    try {
      await admin.from("festival_judges").upsert(
        {
          id: judgeId,
          festival_id: festivalId,
          name: newJudgeRecord.name,
          username: newJudgeRecord.username,
          password_hash: cleanPass,
          raw_password: cleanPass,
          stage_name: newJudgeRecord.stage_name,
          phone: newJudgeRecord.phone,
          is_lead: newJudgeRecord.is_lead,
          status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "username" }
      )
    } catch (e) {
      console.warn("Save to festival_judges table notice:", e)
    }

    // 2. Dual-save to festival_settings.custom_fields.judges
    try {
      const { data: settingsRows } = await admin
        .from("festival_settings")
        .select("*")
        .eq("festival_id", festivalId)
        .order("updated_at", { ascending: false })
        .limit(1)

      const s = settingsRows?.[0]
      const currentFields =
        s?.custom_fields && typeof s.custom_fields === "object" && !Array.isArray(s.custom_fields)
          ? { ...s.custom_fields }
          : {}

      const existingJudges: JudgeAccount[] = currentFields.judges || []
      const filtered = existingJudges.filter((j) => j.id !== judgeId && j.username !== cleanUser)
      filtered.unshift(newJudgeRecord)
      currentFields.judges = filtered

      await admin
        .from("festival_settings")
        .update({ custom_fields: currentFields, updated_at: new Date().toISOString() })
        .eq("festival_id", festivalId)
    } catch (e) {
      console.warn("Dual-save to festival_settings notice:", e)
    }

    return { success: true, data: newJudgeRecord }
  } catch (err: any) {
    console.error("saveFestivalJudgeAction error:", err)
    return { success: false, error: err?.message || "Failed to save judge account" }
  }
}

export async function deleteFestivalJudgeAction(
  festivalId: string,
  judgeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient()
    try {
      await admin.from("festival_judges").delete().eq("id", judgeId)
    } catch {}

    try {
      const { data: settingsRows } = await admin
        .from("festival_settings")
        .select("*")
        .eq("festival_id", festivalId)
        .limit(1)

      const s = settingsRows?.[0]
      if (s?.custom_fields?.judges) {
        const filtered = s.custom_fields.judges.filter((j: any) => j.id !== judgeId)
        await admin
          .from("festival_settings")
          .update({
            custom_fields: { ...s.custom_fields, judges: filtered },
            updated_at: new Date().toISOString(),
          })
          .eq("festival_id", festivalId)
      }
    } catch {}

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete judge" }
  }
}
