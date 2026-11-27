import { cookies } from "next/headers"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ADMIN_EMAILS } from "@/config/admin"
import type { UserRole } from "@/types"

export interface VerifiedAccess {
  allowed: true
  mode: "supabase" | "staff" | "judge"
  userId?: string
  staffId?: string
  name?: string
  username?: string
  organizationId: string
  festivalId?: string
  role: string
}

export type AccessResult = VerifiedAccess | { allowed: false; error: string }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Verifies access to a festival for either authenticated Supabase organizers
 * or cookie-authenticated festival staff / judges, strictly preserving tenant isolation.
 */
export async function verifyFestivalAccess(
  festivalId: string,
  allowedRoles: string[] = []
): Promise<AccessResult> {
  if (!festivalId || !UUID_RE.test(festivalId)) {
    return { allowed: false, error: "Invalid festival ID" }
  }

  const admin = createAdminClient()

  // Run independent lookups in parallel to eliminate auth waterfall latency
  const [festRes, userRes, cookieStore] = await Promise.all([
    admin.from("festivals").select("id, organization_id, created_by").eq("id", festivalId).maybeSingle(),
    createServerClient()
      .then((supabase) => supabase.auth.getUser())
      .catch(() => ({ data: { user: null } })),
    cookies().catch(() => null),
  ])

  const festival = festRes.data
  if (!festival) {
    return { allowed: false, error: "Festival not found" }
  }

  // 1. Check Supabase Auth session
  const user = userRes?.data?.user
  if (user) {
    const email = (user.email || "").toLowerCase().trim()
    const isSuperAdmin = ADMIN_EMAILS.includes(email) || email.startsWith("admin@")

    if (isSuperAdmin || festival.created_by === user.id) {
      return {
        allowed: true,
        mode: "supabase",
        userId: user.id,
        organizationId: festival.organization_id,
        festivalId: festival.id,
        role: isSuperAdmin ? "platform_owner" : "organization_owner",
      }
    }

    const { data: member } = await admin
      .from("organization_members")
      .select("role")
      .eq("organization_id", festival.organization_id)
      .eq("user_id", user.id)
      .maybeSingle()

    if (member) {
      if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(member.role as UserRole) &&
        member.role !== "organization_owner" &&
        member.role !== "organization_admin"
      ) {
        return { allowed: false, error: "Permission denied" }
      }
      return {
        allowed: true,
        mode: "supabase",
        userId: user.id,
        organizationId: festival.organization_id,
        festivalId: festival.id,
        role: member.role,
      }
    }
  }

  // 2. Check Festival Staff / Judge cookie session
  if (cookieStore) {
    try {
      const rawStaff = cookieStore.get("festpro_staff_session")?.value
      if (rawStaff) {
        const sess = JSON.parse(rawStaff)
        const sameTenant =
          sess?.festivalId === festival.id ||
          (sess?.organizationId && sess.organizationId === festival.organization_id)

        if (sameTenant) {
          const role = String(sess.role || "staff")
          if (
            allowedRoles.length > 0 &&
            !allowedRoles.includes(role) &&
            role !== "organization_owner" &&
            role !== "fest_administrator" &&
            role !== "organization_admin"
          ) {
            return { allowed: false, error: "Permission denied" }
          }
          return {
            allowed: true,
            mode: "staff",
            staffId: sess.id,
            name: sess.name,
            username: sess.username,
            organizationId: festival.organization_id,
            festivalId: festival.id,
            role,
          }
        }
      }

      const rawJudge = cookieStore.get("festpro_judge_session")?.value
      if (rawJudge) {
        const judgeSess = JSON.parse(rawJudge)
        if (judgeSess?.festivalId === festival.id) {
          if (allowedRoles.length > 0 && !allowedRoles.includes("judge")) {
            return { allowed: false, error: "Permission denied" }
          }
          return {
            allowed: true,
            mode: "judge",
            staffId: judgeSess.judgeId,
            name: judgeSess.name,
            username: judgeSess.username,
            organizationId: festival.organization_id,
            festivalId: festival.id,
            role: "judge",
          }
        }
      }
    } catch {}
  }

  return { allowed: false, error: "Not authenticated" }
}
