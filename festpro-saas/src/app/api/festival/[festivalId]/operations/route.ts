import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { verifyFestivalAccess } from "@/lib/auth/session-guard"

async function getSettingsRow(admin: any, festivalId: string) {
  const { data } = await admin
    .from("festival_settings")
    .select("id, custom_fields")
    .eq("festival_id", festivalId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  let cf = data?.custom_fields || {}
  if (typeof cf === "string") {
    try { cf = JSON.parse(cf) } catch { cf = {} }
  }
  return { rowId: data?.id || null, cf: typeof cf === "object" && cf ? cf : {} }
}

async function saveSettingsFields(admin: any, festivalId: string, rowId: string | null, cf: Record<string, any>) {
  if (rowId) {
    await admin
      .from("festival_settings")
      .update({ custom_fields: cf, updated_at: new Date().toISOString() })
      .eq("id", rowId)
  } else {
    await admin.from("festival_settings").insert({
      festival_id: festivalId,
      custom_fields: cf,
      updated_at: new Date().toISOString(),
    })
  }
}

function purgePublicCache(festivalId: string) {
  try {
    revalidatePath(`/festivals/${festivalId}`)
    revalidatePath(`/festivals/${festivalId}`, "page")
    revalidatePath(`/`, "layout")
  } catch {}
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ festivalId: string }> }
) {
  try {
    const { festivalId } = await context.params
    const access = await verifyFestivalAccess(festivalId)
    if (!access.allowed) {
      return NextResponse.json({ error: access.error }, { status: 401 })
    }

    const body = await request.json()
    const { action, payload } = body as { action: string; payload: any }
    const admin = createAdminClient()

    switch (action) {
      // ── 1. TEAMS CRUD ──
      case "save_team": {
        const { id, name, code, color } = payload
        if (!name?.trim()) return NextResponse.json({ error: "Team name is required" }, { status: 400 })
        const cleanCode = (code || name.slice(0, 3)).trim().toUpperCase()
        if (id) {
          const { data, error } = await admin
            .from("teams")
            .update({ name: name.trim(), code: cleanCode, color: color || "#4F46E5", updated_at: new Date().toISOString() })
            .eq("id", id)
            .eq("festival_id", festivalId)
            .select()
            .single()
          if (error) return NextResponse.json({ error: error.message }, { status: 400 })
          return NextResponse.json({ success: true, team: data })
        } else {
          const { data, error } = await admin
            .from("teams")
            .insert({
              festival_id: festivalId,
              organization_id: access.organizationId,
              name: name.trim(),
              code: cleanCode,
              color: color || "#4F46E5",
            })
            .select()
            .single()
          if (error) return NextResponse.json({ error: error.message }, { status: 400 })
          return NextResponse.json({ success: true, team: data })
        }
      }

      case "delete_team": {
        const { id } = payload
        const { error } = await admin.from("teams").delete().eq("id", id).eq("festival_id", festivalId)
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ success: true })
      }

      // ── 2. STAGES CRUD ──
      case "save_stage": {
        const { id, name, code, venue_id, capacity, stage_type } = payload
        if (!name?.trim()) return NextResponse.json({ error: "Stage name is required" }, { status: 400 })
        const fields = {
          name: name.trim(),
          code: code || null,
          venue_id: venue_id || null,
          capacity: Number(capacity) || 500,
          stage_type: stage_type || "Main",
        }
        if (id) {
          const { error } = await admin.from("festival_stages").update(fields).eq("id", id).eq("festival_id", festivalId)
          if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        } else {
          const { error } = await admin.from("festival_stages").insert({ festival_id: festivalId, is_active: true, ...fields })
          if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ success: true })
      }

      case "delete_stage": {
        const { id } = payload
        const { error } = await admin.from("festival_stages").delete().eq("id", id).eq("festival_id", festivalId)
        if (error) return NextResponse.json({ error: error.message }, { status: 400 })
        return NextResponse.json({ success: true })
      }

      // ── 3. PARTICIPANT PROGRAM ENROLLMENT ──
      case "sync_participant_programs": {
        const { participantId, competitionIds } = payload as { participantId: string; competitionIds: string[] }
        const { data: existing } = await admin
          .from("registrations")
          .select("id, competition_id")
          .eq("festival_id", festivalId)
          .eq("participant_id", participantId)

        const existingMap = new Map((existing || []).map((r: any) => [r.competition_id, r.id]))
        const targetSet = new Set(competitionIds || [])

        // Delete unchecked
        const toRemove = (existing || []).filter((r: any) => !targetSet.has(r.competition_id)).map((r: any) => r.id)
        if (toRemove.length > 0) {
          await admin.from("registrations").delete().in("id", toRemove)
        }

        // Insert new enrollments
        const { data: partRow } = await admin
          .from("participants")
          .select("chest_number, unit")
          .eq("id", participantId)
          .maybeSingle()

        const toAdd = (competitionIds || []).filter((cid) => !existingMap.has(cid))
        if (toAdd.length > 0) {
          await admin.from("registrations").insert(
            toAdd.map((cid) => ({
              festival_id: festivalId,
              organization_id: access.organizationId,
              participant_id: participantId,
              competition_id: cid,
              chest_number: partRow?.chest_number || null,
              status: "approved",
              approved_at: new Date().toISOString(),
            }))
          )
        }

        return NextResponse.json({ success: true })
      }

      // ── 4. BLIND CODE LETTERS & REPORTING ──
      case "save_code_letters": {
        const { competitionId, entries } = payload as {
          competitionId: string
          entries: Array<{ id: string; codeLetter: string; isReported: boolean }>
        }
        const { rowId, cf } = await getSettingsRow(admin, festivalId)
        const codeLetters = { ...(cf.code_letters || {}), [competitionId]: entries }
        await saveSettingsFields(admin, festivalId, rowId, { ...cf, code_letters: codeLetters })

        // Sync is_attended on registrations if matching rows exist
        for (const e of entries) {
          await admin
            .from("registrations")
            .update({ is_attended: !!e.isReported, notes: e.codeLetter ? `CODE:${e.codeLetter}` : null })
            .eq("festival_id", festivalId)
            .eq("competition_id", competitionId)
            .eq("participant_id", e.id)
        }
        return NextResponse.json({ success: true })
      }

      // ── 5. GREEN ROOM STATUS ──
      case "update_green_room": {
        const { participantId, status, codeLetter, reportedTime } = payload
        const { rowId, cf } = await getSettingsRow(admin, festivalId)
        const grMap = {
          ...(cf.green_room || {}),
          [participantId]: { status, codeLetter, reportedTime },
        }
        await saveSettingsFields(admin, festivalId, rowId, { ...cf, green_room: grMap })
        return NextResponse.json({ success: true })
      }

      // ── 6. SAVE MARKS & PUBLISH RESULTS ──
      case "save_marks":
      case "publish_results": {
        const { competitionId, candidates, publish } = payload as {
          competitionId: string
          candidates: Array<{
            id: string
            chestNumber: string
            name: string
            team: string
            crit1: number
            crit2: number
            crit3: number
            total: number
            grade: string
          }>
          publish?: boolean
        }
        const isPub = action === "publish_results" || !!publish
        const { rowId, cf } = await getSettingsRow(admin, festivalId)
        const programMarks = { ...(cf.program_marks || {}), [competitionId]: candidates }
        await saveSettingsFields(admin, festivalId, rowId, { ...cf, program_marks: programMarks })

        // Rank and upsert into result_items so Results, Prizes, Top Candidates, Team Scores & Public Site all update!
        const sorted = [...candidates].sort((a, b) => b.total - a.total)
        let currentRank = 1
        for (let i = 0; i < sorted.length; i++) {
          if (i > 0 && sorted[i].total < sorted[i - 1].total) currentRank = i + 1
          const c = sorted[i]
          if (c.total <= 0 && !isPub) continue

          const medalType = currentRank === 1 ? "gold" : currentRank === 2 ? "silver" : currentRank === 3 ? "bronze" : null
          const { data: existing } = await admin
            .from("result_items")
            .select("id")
            .eq("competition_id", competitionId)
            .eq("participant_id", c.id)
            .maybeSingle()

          const itemPayload = {
            competition_id: competitionId,
            participant_id: c.id,
            festival_id: festivalId,
            organization_id: access.organizationId,
            total_score: c.total,
            average_score: c.total,
            weighted_score: c.total,
            final_score: c.total,
            rank: currentRank,
            grade: c.grade,
            position: currentRank === 1 ? "1st" : currentRank === 2 ? "2nd" : currentRank === 3 ? "3rd" : `${currentRank}th`,
            is_winner: currentRank === 1,
            is_medalist: currentRank <= 3,
            medal_type: medalType,
            status: isPub ? "live" : "draft",
            processed_at: new Date().toISOString(),
            published_at: isPub ? new Date().toISOString() : null,
          }

          if (existing?.id) {
            await admin.from("result_items").update(itemPayload).eq("id", existing.id)
          } else {
            await admin.from("result_items").insert(itemPayload)
          }
        }

        if (isPub) {
          // Recalculate team_points from live results
          const { data: liveItems } = await admin
            .from("result_items")
            .select("rank, participant:participants(unit, team_id)")
            .eq("festival_id", festivalId)
            .in("status", ["live", "published"])

          const { data: allTeams } = await admin
            .from("teams")
            .select("id, name, code")
            .eq("festival_id", festivalId)

          if (allTeams && allTeams.length > 0) {
            const teamStats = new Map<string, { pts: number; g: number; s: number; b: number; name: string }>()
            for (const t of allTeams) {
              teamStats.set(t.id, { pts: 0, g: 0, s: 0, b: 0, name: t.name })
            }

            for (const item of liveItems || []) {
              const p: any = item.participant || {}
              const rank = item.rank || 99
              const rankPts = rank === 1 ? 5 : rank === 2 ? 3 : rank === 3 ? 1 : 0
              if (rankPts === 0) continue

              const matchedTeam = allTeams.find(
                (t: any) =>
                  t.id === p.team_id ||
                  (p.unit && (t.code?.toLowerCase() === p.unit.toLowerCase() || t.name?.toLowerCase() === p.unit.toLowerCase()))
              )
              if (matchedTeam) {
                const st = teamStats.get(matchedTeam.id)!
                st.pts += rankPts
                if (rank === 1) st.g += 1
                else if (rank === 2) st.s += 1
                else if (rank === 3) st.b += 1
              }
            }

            const ranked = Array.from(teamStats.entries()).sort((a, b) => b[1].pts - a[1].pts)
            for (let i = 0; i < ranked.length; i++) {
              const [teamId, st] = ranked[i]
              await admin.from("team_points").upsert(
                {
                  festival_id: festivalId,
                  organization_id: access.organizationId,
                  entity_type: "unit",
                  entity_id: teamId,
                  entity_name: st.name,
                  total_points: st.pts,
                  rank: i + 1,
                  medals_gold: st.g,
                  medals_silver: st.s,
                  medals_bronze: st.b,
                  status: "live",
                  calculated_at: new Date().toISOString(),
                },
                { onConflict: "festival_id,entity_type,entity_id" }
              )
            }
          }

          await admin.from("competitions").update({ status: "completed" }).eq("id", competitionId)
          purgePublicCache(festivalId)
        }

        return NextResponse.json({ success: true })
      }

      // ── 7. PRIZES CONFIG & GIVEN STATUS ──
      case "save_prize_config": {
        const { first, second, third } = payload
        const { rowId, cf } = await getSettingsRow(admin, festivalId)
        await saveSettingsFields(admin, festivalId, rowId, {
          ...cf,
          prize_config: { first, second, third },
        })
        return NextResponse.json({ success: true })
      }

      case "toggle_prize_given": {
        const { resultId, isGiven } = payload
        const { rowId, cf } = await getSettingsRow(admin, festivalId)
        const prizeGiven = { ...(cf.prize_given || {}), [resultId]: !!isGiven }
        await saveSettingsFields(admin, festivalId, rowId, { ...cf, prize_given: prizeGiven })
        return NextResponse.json({ success: true })
      }

      // ── 8. TEAM SCORES ADJUST & PUBLISH ──
      case "adjust_team_points": {
        const { teamId, teamName, delta } = payload
        const { data: existing } = await admin
          .from("team_points")
          .select("id, total_points")
          .eq("festival_id", festivalId)
          .eq("entity_id", teamId)
          .maybeSingle()

        const currentPts = Number(existing?.total_points || 0)
        const nextPts = Math.max(0, currentPts + Number(delta || 0))
        await admin.from("team_points").upsert(
          {
            festival_id: festivalId,
            organization_id: access.organizationId,
            entity_type: "unit",
            entity_id: teamId,
            entity_name: teamName,
            total_points: nextPts,
            calculated_at: new Date().toISOString(),
          },
          { onConflict: "festival_id,entity_type,entity_id" }
        )
        return NextResponse.json({ success: true, totalPoints: nextPts })
      }

      case "publish_team_scores": {
        await admin
          .from("team_points")
          .update({ status: "live", calculated_at: new Date().toISOString() })
          .eq("festival_id", festivalId)

        const { rowId, cf } = await getSettingsRow(admin, festivalId)
        await saveSettingsFields(admin, festivalId, rowId, {
          ...cf,
          published_scores_meta: { publishedAt: new Date().toISOString() },
        })
        purgePublicCache(festivalId)
        return NextResponse.json({ success: true })
      }

      // ── 9. ANNOUNCER DESK BROADCASTS ──
      case "broadcast_announcement": {
        const { text, stage, type, isEmergency } = payload
        const { rowId, cf } = await getSettingsRow(admin, festivalId)
        const newEntry = {
          id: `b_${Date.now()}`,
          text,
          stage: stage || "Main Stage",
          type: type || "cue",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        const existingList = Array.isArray(cf.announcer_broadcasts) ? cf.announcer_broadcasts : []
        await saveSettingsFields(admin, festivalId, rowId, {
          ...cf,
          announcer_broadcasts: [newEntry, ...existingList].slice(0, 30),
        })

        try {
          await admin.from("festival_announcements").insert({
            festival_id: festivalId,
            organization_id: access.organizationId,
            title: isEmergency ? `URGENT: ${stage || "Festival Notice"}` : `${stage || "Stage"} Call`,
            content: text,
            status: "published",
            priority: isEmergency ? "urgent" : "normal",
            published_at: new Date().toISOString(),
          })
        } catch {}

        return NextResponse.json({ success: true, entry: newEntry })
      }

      case "toggle_result_announced": {
        const { competitionId, isAnnounced } = payload
        const { rowId, cf } = await getSettingsRow(admin, festivalId)
        const map = { ...(cf.announced_results || {}), [competitionId]: !!isAnnounced }
        await saveSettingsFields(admin, festivalId, rowId, { ...cf, announced_results: map })
        return NextResponse.json({ success: true })
      }

      // ── 10. STAGE DESK / LIVE PROGRAMS STATUS ──
      case "update_stage_status": {
        const { competitionId, stageId, deskStatus } = payload
        const { rowId, cf } = await getSettingsRow(admin, festivalId)
        const statusMap = {
          ...(cf.live_stage_statuses || {}),
          [competitionId]: { stageId, deskStatus },
        }
        await saveSettingsFields(admin, festivalId, rowId, { ...cf, live_stage_statuses: statusMap })

        let dbStatus = "upcoming"
        if (deskStatus === "STARTED") dbStatus = "running"
        else if (deskStatus === "FINISHED") dbStatus = "completed"
        else if (deskStatus === "REPORTING") dbStatus = "registration_closed"

        await admin.from("competitions").update({ status: dbStatus }).eq("id", competitionId).eq("festival_id", festivalId)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: "Unknown operation action" }, { status: 400 })
    }
  } catch (err: any) {
    console.error("POST /api/festival/[festivalId]/operations error:", err)
    return NextResponse.json({ error: err?.message || "Operation failed" }, { status: 500 })
  }
}
