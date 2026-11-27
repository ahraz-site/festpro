"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { BarChart2, FileImage, Loader2 } from "lucide-react"

interface PublishedScoreItem {
  rank: number
  team: string
  score: number
}

export default function PublishedTeamScoresPage() {
  const params = useParams()
  const festivalId = params.festivalId as string

  const [activeTab, setActiveTab] = useState<string>("Overall")
  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState<any[]>([])
  const [teamPoints, setTeamPoints] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [resultItems, setResultItems] = useState<any[]>([])
  const [publishedAt, setPublishedAt] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch(`/api/festival/${festivalId}/workspace?scope=published-scores`, {
          cache: "no-store",
        })
        const data = await res.json()
        if (!active) return
        setTeams(Array.isArray(data?.teams) ? data.teams : [])
        setTeamPoints(Array.isArray(data?.teamPoints) ? data.teamPoints : [])
        setCategories(Array.isArray(data?.categories) ? data.categories : [])
        setCompetitions(Array.isArray(data?.competitions) ? data.competitions : [])
        setParticipants(Array.isArray(data?.participants) ? data.participants : [])
        setResultItems(Array.isArray(data?.resultItems) ? data.resultItems : [])
        const metaTime = data?.customFields?.published_scores_meta?.publishedAt
        setPublishedAt(typeof metaTime === "string" ? metaTime : null)
      } catch (err) {
        console.error("Failed to load published scores:", err)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [festivalId])

  const tabs = useMemo(() => {
    const names = categories.map((c: any) => String(c.name || "").trim()).filter(Boolean)
    return ["Overall", ...Array.from(new Set(names))]
  }, [categories])

  const publishedCompCount = useMemo(() => {
    const ids = new Set(resultItems.map((r: any) => r.competition_id).filter(Boolean))
    return ids.size
  }, [resultItems])

  const scores = useMemo<PublishedScoreItem[]>(() => {
    if (teams.length === 0 && teamPoints.length === 0) return []

    if (activeTab === "Overall") {
      const tpByTeamId = new Map<string, any>()
      const tpByTeamName = new Map<string, any>()
      teamPoints.forEach((tp: any) => {
        if (tp.team_id) tpByTeamId.set(tp.team_id, tp)
        if (tp.team_name) tpByTeamName.set(String(tp.team_name).toLowerCase(), tp)
      })

      const merged = teams.length > 0
        ? teams.map((t: any) => {
            const tp = tpByTeamId.get(t.id) || tpByTeamName.get(String(t.name || "").toLowerCase())
            const pts = tp ? Number(tp.total_points || 0) : Number(t.total_points || 0)
            return { team: t.name as string, score: pts }
          })
        : teamPoints.map((tp: any) => ({
            team: String(tp.team_name || tp.team_id || "Team"),
            score: Number(tp.total_points || 0),
          }))

      return merged
        .sort((a, b) => b.score - a.score)
        .map((row, idx) => ({ rank: idx + 1, team: row.team, score: row.score }))
    }

    // Category-filtered scores computed from real resultItems
    const catById = new Map(categories.map((c: any) => [c.id, c.name]))
    const compCatById = new Map<string, string>()
    competitions.forEach((c: any) => {
      const catName = c.category?.name || catById.get(c.category_id) || ""
      compCatById.set(c.id, String(catName))
    })
    const partById = new Map(participants.map((p: any) => [p.id, p]))
    const teamTotals = new Map<string, number>()
    teams.forEach((t: any) => teamTotals.set(t.name, 0))

    resultItems.forEach((item: any) => {
      const compCat = compCatById.get(item.competition_id) || ""
      const part = partById.get(item.participant_id)
      const partCat = String(part?.division || "")
      if (
        compCat.toLowerCase() !== activeTab.toLowerCase() &&
        partCat.toLowerCase() !== activeTab.toLowerCase()
      ) {
        return
      }
      const teamName = item.team_name || part?.unit
      if (!teamName) return
      const pts = Number(
        item.total_points ??
          item.points ??
          (item.rank === 1 ? 5 : item.rank === 2 ? 3 : item.rank === 3 ? 1 : 0)
      )
      teamTotals.set(teamName, (teamTotals.get(teamName) || 0) + pts)
    })

    return Array.from(teamTotals.entries())
      .map(([team, score]) => ({ team, score }))
      .sort((a, b) => b.score - a.score)
      .map((row, idx) => ({ rank: idx + 1, team: row.team, score: row.score }))
  }, [activeTab, teams, teamPoints, categories, competitions, participants, resultItems])

  const publishedTimeLabel = useMemo(() => {
    if (publishedAt) {
      const d = new Date(publishedAt)
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
      }
    }
    return publishedCompCount > 0 ? "Synced from published results" : "Not yet published"
  }, [publishedAt, publishedCompCount])

  const handleDownloadPoster = () => {
    window.print()
  }

  const exportColumns = [
    { header: "#", accessor: (s: PublishedScoreItem) => String(s.rank) },
    { header: "Team", accessor: (s: PublishedScoreItem) => s.team },
    { header: "Score", accessor: (s: PublishedScoreItem) => String(s.score) },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER (Screenshot 4) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <BarChart2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Published team scores</h1>
          </div>
        </div>

        {/* Top Right Action Button (Screenshot 4: Poster button) */}
        <div className="flex items-center gap-2">
          <ExportPrintBar
            title="Official Published Team Scores"
            subtitle="FestPro Festival Standings"
            data={scores}
            columns={exportColumns}
            filename="published-team-scores"
          />

          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadPoster}
            className="rounded-xl text-xs font-semibold px-4 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <FileImage className="h-4 w-4 mr-1.5 text-slate-500" />
            Poster
          </Button>
        </div>
      </div>

      {/* ── PILL FILTER TABS ── */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── TWO-COLUMN SECTION ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {/* Left Status Card */}
        <div className="md:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-1">
          <h3 className="text-sm font-black text-slate-900">
            {publishedCompCount > 0
              ? `After ${publishedCompCount} result${publishedCompCount === 1 ? "" : "s"}`
              : "No published results yet"}
          </h3>
          <p className="text-xs text-slate-400 font-medium">{publishedTimeLabel}</p>
        </div>

        {/* Right Standings Table */}
        <div className="md:col-span-3 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-500 text-xs font-semibold">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              <span>Loading published scores...</span>
            </div>
          ) : scores.length === 0 ? (
            <div className="py-12 px-6 text-center text-xs text-slate-500">
              No teams or published scores yet. Create teams and publish program results to view standings.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                  <th className="py-3 px-6 w-20">#</th>
                  <th className="py-3 px-6">Team</th>
                  <th className="py-3 px-6 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {scores.map((row) => (
                  <tr key={row.team} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 text-slate-900 font-black text-sm">{row.rank}</td>
                    <td className="py-4 px-6 font-bold text-slate-900 text-sm">{row.team}</td>
                    <td className="py-4 px-6 text-right font-black text-slate-900 text-sm">
                      {row.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
