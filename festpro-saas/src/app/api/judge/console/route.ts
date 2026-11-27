import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function resolveJudgeContext() {
  const admin = createAdminClient()
  const cookieStore = await cookies()

  let festivalId: string | null = null
  let judgeInfo: { id: string; name: string; username: string; stageName?: string } | null = null

  // 1. Check Judge cookie or Staff cookie
  const rawJudge = cookieStore.get("festpro_judge_session")?.value
  if (rawJudge) {
    try {
      const j = JSON.parse(rawJudge)
      if (j?.festivalId) {
        festivalId = j.festivalId
        judgeInfo = {
          id: j.judgeId || j.username,
          name: j.name || "Official Judge",
          username: j.username || "judge",
          stageName: j.stageName,
        }
      }
    } catch {}
  }

  if (!festivalId) {
    const rawStaff = cookieStore.get("festpro_staff_session")?.value
    if (rawStaff) {
      try {
        const s = JSON.parse(rawStaff)
        if (s?.festivalId) {
          festivalId = s.festivalId
          judgeInfo = {
            id: s.id || s.username,
            name: s.name || "Judge",
            username: s.username || "judge",
          }
        }
      } catch {}
    }
  }

  // 2. Fallback: Authenticated Organizer / Supabase User viewing Judge Console
  if (!festivalId) {
    try {
      const supabase = await createServerClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: mem } = await admin
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle()

        if (mem?.organization_id) {
          const { data: fest } = await admin
            .from("festivals")
            .select("id")
            .eq("organization_id", mem.organization_id)
            .is("deleted_at", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()

          if (fest?.id) {
            festivalId = fest.id
            judgeInfo = {
              id: user.id,
              name: user.email?.split("@")[0] || "Chief Adjudicator",
              username: user.email || "organizer",
            }
          }
        }
      }
    } catch {}
  }

  return { admin, festivalId, judgeInfo }
}

export async function GET(request: NextRequest) {
  try {
    const { admin, festivalId: resolvedFestId, judgeInfo } = await resolveJudgeContext()
    const paramFestId = request.nextUrl.searchParams.get("festivalId")
    const festivalId = paramFestId || resolvedFestId

    if (!festivalId || !judgeInfo) {
      return NextResponse.json({ error: "Not authenticated as a festival judge" }, { status: 401 })
    }

    const [festRes, settingsRes, compsRes, partsRes, regsRes, stagesRes] = await Promise.all([
      admin.from("festivals").select("id, organization_id, name, short_name, logo_url").eq("id", festivalId).maybeSingle(),
      admin.from("festival_settings").select("id, custom_fields").eq("festival_id", festivalId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      admin.from("competitions").select("id, name, code, category_id, max_score, status, competition_type, category:competition_categories(name)").eq("festival_id", festivalId).is("deleted_at", null).order("created_at", { ascending: false }),
      admin.from("participants").select("id, chest_number, first_name, last_name, unit, division").eq("festival_id", festivalId).is("deleted_at", null).limit(500),
      admin.from("registrations").select("id, participant_id, competition_id, chest_number, status, is_attended, notes").eq("festival_id", festivalId).limit(2000),
      admin.from("festival_stages").select("id, name").eq("festival_id", festivalId),
    ])

    let cf = settingsRes.data?.custom_fields || {}
    if (typeof cf === "string") {
      try { cf = JSON.parse(cf) } catch { cf = {} }
    }

    const codeLettersMap = cf.code_letters || {}
    const judgeScoresMap = cf.judge_scores || {}
    const programMarksMap = cf.program_marks || {}
    const stageStatuses = cf.live_stage_statuses || {}
    const stageNameById = new Map((stagesRes.data || []).map((s: any) => [s.id, s.name]))
    const partsById = new Map((partsRes.data || []).map((p: any) => [p.id, p]))

    const competitions = (compsRes.data || []).map((c: any) => {
      const compRegs = (regsRes.data || []).filter((r: any) => r.competition_id === c.id)
      const compCodes: Array<{ id: string; codeLetter: string; isReported: boolean }> = codeLettersMap[c.id] || []
      const codeByPid = new Map(compCodes.map((e) => [e.id, e.codeLetter]))
      const savedProgramMarks: any[] = programMarksMap[c.id] || []
      const judgeSavedForComp = judgeScoresMap[c.id]?.[judgeInfo.id] || {}

      // Build candidate list from real enrolled registrations OR category participants (zero fake users)
      let candidateRows: any[] = []
      if (compRegs.length > 0) {
        candidateRows = compRegs
          .map((r: any) => partsById.get(r.participant_id))
          .filter(Boolean)
      } else {
        const catName = (c.category?.name || "").toLowerCase()
        const matchingParts = (partsRes.data || []).filter(
          (p: any) => !catName || (p.division || "").toLowerCase() === catName
        )
        candidateRows = matchingParts.length > 0 ? matchingParts : (partsRes.data || [])
      }

      const defaultCriteria = [
        { id: "c1", name: "Performance & Rhythm", maxMarks: 35 },
        { id: "c2", name: "Technique & Accuracy", maxMarks: 35 },
        { id: "c3", name: "Presentation & Expression", maxMarks: 30 },
      ]

      const candidates = candidateRows.map((p: any, idx: number) => {
        const jSaved = judgeSavedForComp[p.id]
        const pmSaved = savedProgramMarks.find((m) => m.id === p.id)
        const blindCode = codeByPid.get(p.id) || `CODE ${String.fromCharCode(65 + (idx % 26))}`
        const criteriaScores = jSaved?.criteriaScores || (
          pmSaved
            ? { c1: pmSaved.crit1 || 0, c2: pmSaved.crit2 || 0, c3: pmSaved.crit3 || 0 }
            : { c1: 0, c2: 0, c3: 0 }
        )
        const totalScore = Object.values(criteriaScores).reduce((sum: number, v: any) => sum + (Number(v) || 0), 0)

        return {
          id: p.id,
          chestNumber: p.chest_number || String(idx + 1),
          blindCode,
          team: p.unit || "",
          status: jSaved?.status || (totalScore > 0 ? "submitted" : "pending"),
          criteriaScores,
          totalScore,
          remarks: jSaved?.remarks || "",
        }
      })

      const stInfo = stageStatuses[c.id]
      const stageName = (stInfo?.stageId && stageNameById.get(stInfo.stageId)) || judgeInfo.stageName || stagesRes.data?.[0]?.name || "Stage 1"

      let scoringStatus: "LOCKED" | "VALUATION" | "NOT_OPEN" = "VALUATION"
      if (c.status === "completed") scoringStatus = "LOCKED"
      else if (c.status === "draft") scoringStatus = "NOT_OPEN"

      return {
        id: c.id,
        name: c.name,
        code: c.code || "PRG",
        category: c.category?.name || "General",
        stageName,
        scoringStatus,
        maxMarks: Number(c.max_score) || 100,
        criteria: defaultCriteria,
        candidates,
      }
    })

    return NextResponse.json({
      success: true,
      festival: festRes.data || { id: festivalId, name: "Festival" },
      judge: judgeInfo,
      competitions,
    })
  } catch (err: any) {
    console.error("GET /api/judge/console error:", err)
    return NextResponse.json({ error: err?.message || "Failed to load judge console" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin, festivalId: resolvedFestId, judgeInfo } = await resolveJudgeContext()
    const body = await request.json()
    const { competitionId, candidateId, criteriaScores, totalScore, remarks, lockScore, candidateMeta } = body
    const festivalId = body.festivalId || resolvedFestId

    if (!festivalId || !judgeInfo) {
      return NextResponse.json({ error: "Not authenticated as a festival judge" }, { status: 401 })
    }

    const { data: sRow } = await admin
      .from("festival_settings")
      .select("id, custom_fields")
      .eq("festival_id", festivalId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    let cf = sRow?.custom_fields || {}
    if (typeof cf === "string") {
      try { cf = JSON.parse(cf) } catch { cf = {} }
    }

    const judgeScores = { ...(cf.judge_scores || {}) }
    const compJudges = { ...(judgeScores[competitionId] || {}) }
    const myScores = { ...(compJudges[judgeInfo.id] || {}) }

    myScores[candidateId] = {
      criteriaScores,
      totalScore,
      remarks: remarks || "",
      status: lockScore ? "submitted" : "pending",
      updatedAt: new Date().toISOString(),
    }

    compJudges[judgeInfo.id] = myScores
    judgeScores[competitionId] = compJudges

    // Also mirror to program_marks so Enter Marks / Admin valuation sees judge's marks immediately
    const programMarks = { ...(cf.program_marks || {}) }
    const existingList: any[] = Array.isArray(programMarks[competitionId]) ? [...programMarks[competitionId]] : []
    const grade = totalScore >= 80 ? "A" : totalScore >= 70 ? "B" : totalScore >= 60 ? "C" : "D"
    const markEntry = {
      id: candidateId,
      chestNumber: candidateMeta?.chestNumber || "",
      name: candidateMeta?.blindCode || candidateMeta?.chestNumber || "Candidate",
      team: candidateMeta?.team || "",
      crit1: Number(criteriaScores?.c1 || 0),
      crit2: Number(criteriaScores?.c2 || 0),
      crit3: Number(criteriaScores?.c3 || 0),
      total: Number(totalScore || 0),
      grade,
    }
    const idx = existingList.findIndex((e) => e.id === candidateId)
    if (idx >= 0) existingList[idx] = { ...existingList[idx], ...markEntry }
    else existingList.push(markEntry)
    programMarks[competitionId] = existingList

    const updatedFields = { ...cf, judge_scores: judgeScores, program_marks: programMarks }
    if (sRow?.id) {
      await admin
        .from("festival_settings")
        .update({ custom_fields: updatedFields, updated_at: new Date().toISOString() })
        .eq("id", sRow.id)
    } else {
      await admin.from("festival_settings").insert({
        festival_id: festivalId,
        custom_fields: updatedFields,
        updated_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("POST /api/judge/console error:", err)
    return NextResponse.json({ error: err?.message || "Failed to save score" }, { status: 500 })
  }
}
