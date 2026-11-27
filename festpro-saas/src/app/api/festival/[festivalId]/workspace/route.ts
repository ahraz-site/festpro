import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { verifyFestivalAccess } from "@/lib/auth/session-guard"
import { getOrganizationLicense } from "@/lib/actions/licensing"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ festivalId: string }> }
) {
  try {
    const { festivalId } = await context.params
    const access = await verifyFestivalAccess(festivalId)
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: 401 })
    }

    const admin = createAdminClient()
    const scope = request.nextUrl.searchParams.get("scope") || "all"

    // Lean parallel queries scoped cleanly by festivalId
    const [
      festRes,
      settingsRes,
      teamsRes,
      catsRes,
      stagesRes,
      compsRes,
      partsRes,
      regsRes,
      schedRes,
      resItemsRes,
      teamPtsRes,
      license,
    ] = await Promise.all([
      admin.from("festivals").select("id, organization_id, name, short_name, code, status, start_date, end_date, logo_url").eq("id", festivalId).maybeSingle(),
      admin.from("festival_settings").select("id, custom_fields").eq("festival_id", festivalId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      scope === "all" || ["teams", "participants", "results", "prizes", "announcer", "reports", "portal"].includes(scope)
        ? admin.from("teams").select("*").eq("festival_id", festivalId).order("name", { ascending: true })
        : Promise.resolve({ data: [] }),
      scope === "all" || ["participants", "competitions", "categories", "results", "prizes", "top-candidates", "reports", "certificates"].includes(scope)
        ? admin.from("competition_categories").select("id, festival_id, name, name_ml, short_name, code, description, color, display_order").eq("festival_id", festivalId).eq("is_active", true).order("display_order", { ascending: true }).order("name", { ascending: true })
        : Promise.resolve({ data: [] }),
      scope === "all" || ["stages", "schedules", "stage-desk", "live-programs", "tv-displays", "announcer"].includes(scope)
        ? admin.from("festival_stages").select("id, festival_id, name, code, venue_id, venue_name, capacity, stage_type, is_active, display_order").eq("festival_id", festivalId).order("display_order", { ascending: true })
        : Promise.resolve({ data: [] }),
      scope === "all" || ["competitions", "participants", "results", "enter-marks", "code-letters", "schedules", "stage-desk", "live-programs", "announcer", "green-room", "portal", "reports", "certificates", "top-candidates"].includes(scope)
        ? admin.from("competitions").select("id, festival_id, category_id, name, name_ml, code, competition_type, stage_required, duration_minutes, max_score, status, created_at, category:competition_categories(id, name, color)").eq("festival_id", festivalId).is("deleted_at", null).order("created_at", { ascending: false })
        : Promise.resolve({ data: [] }),
      scope === "all" || ["participants", "enter-marks", "code-letters", "green-room", "announcer", "portal", "reports"].includes(scope)
        ? admin.from("participants").select("id, festival_id, organization_id, participant_id, registration_number, chest_number, first_name, last_name, date_of_birth, gender, phone, unit, division, sector, notes, created_at").eq("festival_id", festivalId).is("deleted_at", null).order("created_at", { ascending: false }).limit(500)
        : Promise.resolve({ data: [] }),
      scope === "all" || ["participants", "enter-marks", "code-letters", "green-room", "portal"].includes(scope)
        ? admin.from("registrations").select("id, participant_id, competition_id, team_id, chest_number, status, is_attended, notes").eq("festival_id", festivalId).limit(2000)
        : Promise.resolve({ data: [] }),
      scope === "all" || ["schedules"].includes(scope)
        ? admin.from("stage_schedules").select("id, festival_id, competition_id, stage_id, scheduled_date, start_time, end_time, duration_minutes, status, competition:competitions(id, name, code), stage:festival_stages(id, name, code)").eq("festival_id", festivalId).order("scheduled_date", { ascending: true })
        : Promise.resolve({ data: [] }),
      scope === "all" || ["results", "prizes", "announcer", "top-candidates", "certificates", "published-scores", "team-scores", "reports", "portal"].includes(scope)
        ? admin.from("result_items").select("*, participant:participants(id, first_name, last_name, participant_id, chest_number, unit, division), competition:competitions(id, name, code, category_id)").eq("festival_id", festivalId).order("rank", { ascending: true, nullsFirst: false })
        : Promise.resolve({ data: [] }),
      scope === "all" || ["results", "team-scores", "published-scores", "portal", "reports"].includes(scope)
        ? admin.from("team_points").select("*").eq("festival_id", festivalId).order("total_points", { ascending: false })
        : Promise.resolve({ data: [] }),
      getOrganizationLicense(access.organizationId).catch(() => null),
    ])

    let cf = settingsRes.data?.custom_fields || {}
    if (typeof cf === "string") {
      try { cf = JSON.parse(cf) } catch { cf = {} }
    }

    return NextResponse.json({
      success: true,
      festival: festRes.data || null,
      teams: teamsRes.data || [],
      categories: catsRes.data || [],
      stages: stagesRes.data || [],
      competitions: compsRes.data || [],
      participants: partsRes.data || [],
      registrations: regsRes.data || [],
      schedules: schedRes.data || [],
      resultItems: resItemsRes.data || [],
      teamPoints: teamPtsRes.data || [],
      customFields: {
        code_letters: cf.code_letters || {},
        green_room: cf.green_room || {},
        program_marks: cf.program_marks || {},
        judge_scores: cf.judge_scores || {},
        prize_config: cf.prize_config || null,
        prize_given: cf.prize_given || {},
        announcer_broadcasts: cf.announcer_broadcasts || [],
        announced_results: cf.announced_results || {},
        live_stage_statuses: cf.live_stage_statuses || {},
        published_scores_meta: cf.published_scores_meta || null,
      },
      license: license
        ? {
            plan_tier: license.plan_tier,
            max_participants: license.max_participants ?? null,
            max_competitions: license.max_competitions ?? null,
            max_stages: license.max_stages ?? null,
          }
        : null,
    })
  } catch (err: any) {
    console.error("GET /api/festival/[festivalId]/workspace error:", err)
    return NextResponse.json({ error: err?.message || "Failed to load workspace data" }, { status: 500 })
  }
}
