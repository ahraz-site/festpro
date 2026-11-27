"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Users, Loader2, X } from "lucide-react"
import { getCachedWorkspace, fetchWorkspaceWithSWR, invalidateFestivalWorkspace } from "@/lib/cache/workspace-cache"

interface TeamScoreRow {
  id: string
  rank: number
  name: string
  code: string
  totalScore: number
}

export default function TeamScoresPage() {
  const params = useParams()
  const festivalId = params.festivalId as string

  const initialCache = getCachedWorkspace(festivalId, "team-scores")
  const [teams, setTeams] = useState<any[]>(() => initialCache?.teams || [])
  const [teamPoints, setTeamPoints] = useState<any[]>(() => initialCache?.teamPoints || [])
  const [categories, setCategories] = useState<any[]>(() => initialCache?.categories || [])
  const [competitions, setCompetitions] = useState<any[]>(() => initialCache?.competitions || [])
  const [participants, setParticipants] = useState<any[]>(() => initialCache?.participants || [])
  const [resultItems, setResultItems] = useState<any[]>(() => initialCache?.resultItems || [])
  const [loading, setLoading] = useState(!initialCache)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState("")

  // Controls
  const [viewType, setViewType] = useState<"overall" | "by_category">("overall")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isPublished, setIsPublished] = useState(() => Boolean(initialCache?.customFields?.published_scores_meta?.publishedAt))

  // Adjust Points Modal State
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustTeamId, setAdjustTeamId] = useState(() => initialCache?.teams?.[0]?.id || "")
  const [adjustPoints, setAdjustPoints] = useState("0")
  const [adjustReason, setAdjustReason] = useState("")

  const load = useCallback(async () => {
    try {
      await fetchWorkspaceWithSWR(festivalId, "team-scores", (data) => {
        const dbTeams = Array.isArray(data?.teams) ? data.teams : []
        setTeams(dbTeams)
        setTeamPoints(Array.isArray(data?.teamPoints) ? data.teamPoints : [])
        setCategories(Array.isArray(data?.categories) ? data.categories : [])
        setCompetitions(Array.isArray(data?.competitions) ? data.competitions : [])
        setParticipants(Array.isArray(data?.participants) ? data.participants : [])
        setResultItems(Array.isArray(data?.resultItems) ? data.resultItems : [])
        setIsPublished(Boolean(data?.customFields?.published_scores_meta?.publishedAt))
        if (dbTeams[0]) {
          setAdjustTeamId((prev: string) => (prev && dbTeams.some((t: any) => t.id === prev) ? prev : dbTeams[0].id))
        }
      })
    } catch (err) {
      console.error("Failed to load team scores:", err)
    } finally {
      setLoading(false)
    }
  }, [festivalId])

  useEffect(() => {
    load()
  }, [load])

  const resultsDeclared = useMemo(() => {
    const liveIds = new Set(
      resultItems
        .filter((r: any) => !r.status || r.status === "live" || r.status === "published")
        .map((r: any) => r.competition_id)
        .filter(Boolean)
    )
    return liveIds.size
  }, [resultItems])

  const teamScores = useMemo<TeamScoreRow[]>(() => {
    if (viewType === "by_category" && selectedCategory !== "all") {
      const catById = new Map(categories.map((c: any) => [c.id, String(c.name || "")]))
      const compCatById = new Map<string, string>()
      competitions.forEach((c: any) => {
        compCatById.set(c.id, String(c.category?.name || catById.get(c.category_id) || ""))
      })
      const partById = new Map(participants.map((p: any) => [p.id, p]))
      const teamTotals = new Map<string, number>()
      teams.forEach((t: any) => teamTotals.set(t.id, 0))

      resultItems.forEach((item: any) => {
        const compCat = compCatById.get(item.competition_id) || ""
        const part = partById.get(item.participant_id)
        const partCat = String(part?.division || "")
        if (
          compCat.toLowerCase() !== selectedCategory.toLowerCase() &&
          partCat.toLowerCase() !== selectedCategory.toLowerCase()
        ) {
          return
        }
        const matchedTeam = teams.find(
          (t: any) =>
            t.id === part?.team_id ||
            (part?.unit &&
              (t.code?.toLowerCase() === part.unit.toLowerCase() ||
                t.name?.toLowerCase() === part.unit.toLowerCase()))
        )
        if (!matchedTeam) return
        const pts = Number(
          item.total_points ??
            item.points ??
            (item.rank === 1 ? 5 : item.rank === 2 ? 3 : item.rank === 3 ? 1 : 0)
        )
        teamTotals.set(matchedTeam.id, (teamTotals.get(matchedTeam.id) || 0) + pts)
      })

      return teams
        .map((t: any, idx: number) => ({
          id: t.id,
          rank: idx + 1,
          name: t.name,
          code: t.code || t.name.slice(0, 3).toUpperCase() || `T${idx + 1}`,
          totalScore: teamTotals.get(t.id) || 0,
        }))
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((row, idx) => ({ ...row, rank: idx + 1 }))
    }

    const pointsMap = new Map(teamPoints.map((p: any) => [p.entity_id, p]))
    return teams
      .map((t: any, idx: number) => {
        const tp = pointsMap.get(t.id) as any
        return {
          id: t.id,
          rank: tp?.rank || idx + 1,
          name: t.name,
          code: t.code || t.name.slice(0, 3).toUpperCase() || `T${idx + 1}`,
          totalScore: Number(tp?.total_points ?? t.total_points ?? 0),
        }
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((row, idx) => ({ ...row, rank: idx + 1 }))
  }, [viewType, selectedCategory, teams, teamPoints, categories, competitions, participants, resultItems])

  const handleAdjustPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pts = parseFloat(adjustPoints) || 0
    if (pts === 0) {
      toast.error("Please enter non-zero adjustment points")
      return
    }
    const teamObj = teamScores.find((t) => t.id === adjustTeamId)
    if (!teamObj) {
      toast.error("Please select a team")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/festival/${festivalId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust_team_points",
          payload: {
            teamId: teamObj.id,
            teamName: teamObj.name,
            delta: pts,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to adjust team points")
      }
      invalidateFestivalWorkspace(festivalId)
      toast.success(`Adjusted ${pts > 0 ? `+${pts}` : pts} points for ${teamObj.name}`)
      setShowAdjustModal(false)
      setAdjustPoints("0")
      setAdjustReason("")
      await load()
    } catch (err: any) {
      toast.error(err?.message || "Failed to adjust points")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePublishTeamScores = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/festival/${festivalId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish_team_scores",
          payload: {},
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to publish team scores")
      }
      setIsPublished(true)
      toast.success("Team scores published to live portal & leaderboard!")
    } catch (err: any) {
      toast.error(err?.message || "Failed to publish scores")
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = teamScores.filter((t) => {
    const q = search.toLowerCase()
    return t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q)
  })

  const exportColumns = [
    { header: "Rank", accessor: (t: TeamScoreRow) => String(t.rank) },
    { header: "Team", accessor: (t: TeamScoreRow) => t.name },
    { header: "Total score", accessor: (t: TeamScoreRow) => t.totalScore.toFixed(2) },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER (Screenshot 1) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Team scores</h1>
          </div>
        </div>

        {/* Right Action buttons (Screenshot 1: After 1 results, Adjust points, Publish team scores) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs text-slate-500 font-medium">After {resultsDeclared} results</span>

          <ExportPrintBar
            title="Festival Team Scores"
            subtitle="FestPro Real-Time Scores"
            data={filtered}
            columns={exportColumns}
            filename="team-scores"
          />

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAdjustModal(true)}
            className="rounded-xl text-xs font-semibold px-3.5 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            ± Adjust points
          </Button>

          <Button
            size="sm"
            onClick={handlePublishTeamScores}
            className={`rounded-xl text-xs font-bold shadow-xs ${
              isPublished
                ? "bg-indigo-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {isPublished ? "Team scores published ✓" : "Publish team scores"}
          </Button>
        </div>
      </div>

      {/* ── PILL FILTER BAR (Screenshot 1: Overall, By Category, Select category) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setViewType("overall")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewType === "overall" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Overall
          </button>
          <button
            onClick={() => setViewType("by_category")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewType === "by_category" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            By Category
          </button>
        </div>

        {viewType === "by_category" && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500 shadow-xs animate-in fade-in"
          >
            <option value="all">Select category</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* ── SEARCH TEAMS (Screenshot 1) ── */}
      <div className="relative max-w-md">
        <Input
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 rounded-xl bg-white border-slate-200 text-xs shadow-xs"
        />
      </div>

      {/* ── TABLE VIEW (Exact layout from Screenshot 1: Rank, Team, Total score) ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading team scores...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-2">
          <Users className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No teams found</h3>
          <p className="text-xs text-slate-400">Add teams to track team scores.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6 w-24">Rank</th>
                  <th className="py-3.5 px-6">Team</th>
                  <th className="py-3.5 px-6 text-right font-black">Total score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 text-slate-900 font-black text-sm">{t.rank}</td>
                    <td className="py-4 px-6 font-bold text-slate-900 text-sm">{t.name}</td>
                    <td className="py-4 px-6 text-right font-black text-slate-900 text-sm">
                      {t.totalScore.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADJUST POINTS MODAL ── */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-900">Adjust Team Points</h2>
              <button onClick={() => setShowAdjustModal(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustPointsSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-600">Select Team</label>
                <select
                  value={adjustTeamId}
                  onChange={(e) => setAdjustTeamId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                >
                  {teamScores.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} (Current: {t.totalScore.toFixed(2)} pts)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Points to Adjust (e.g. +5 or -2)</label>
                <Input
                  type="number"
                  step="0.5"
                  required
                  value={adjustPoints}
                  onChange={(e) => setAdjustPoints(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Reason</label>
                <Input
                  placeholder="e.g. Discipline bonus, Penalty, Late reporting"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAdjustModal(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                  Apply Adjustment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
