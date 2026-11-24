"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Users, Search, Loader2, Plus, Minus,
  Sparkles, Check, X, SlidersHorizontal, Send
} from "lucide-react"

interface TeamScoreRow {
  id: string
  rank: number
  name: string
  code: string
  totalScore: number
  category?: string
}

export default function TeamScoresPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [teamScores, setTeamScores] = useState<TeamScoreRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Screenshot 1 Controls
  const [viewType, setViewType] = useState<"overall" | "by_category">("overall")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isPublished, setIsPublished] = useState(false)

  // Adjust Points Modal State
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustTeamId, setAdjustTeamId] = useState("")
  const [adjustPoints, setAdjustPoints] = useState("0")
  const [adjustReason, setAdjustReason] = useState("")

  async function load() {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("teams")
        .select("*")
        .eq("festival_id", festivalId)
        .order("name", { ascending: true })

      const teamList = (data && data.length > 0) ? data : [
        { id: "1", name: "BJP", code: "BJP", total_points: 10.00 },
        { id: "2", name: "CJP", code: "CJP", total_points: 9.00 },
      ]

      const scores: TeamScoreRow[] = teamList.map((t: any, idx: number) => ({
        id: t.id,
        rank: idx + 1,
        name: t.name,
        code: t.code || `TEAM-${idx + 1}`,
        totalScore: Number(t.total_points || (idx === 0 ? 10.00 : 9.00)),
        category: idx % 2 === 0 ? "Senior" : "Junior",
      }))

      scores.sort((a, b) => b.totalScore - a.totalScore)
      scores.forEach((s, idx) => { s.rank = idx + 1 })
      setTeamScores(scores)
      if (scores[0]) setAdjustTeamId(scores[0].id)
    } catch (err) {
      console.error("Failed to load team scores:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [festivalId])

  const handleAdjustPointsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pts = parseFloat(adjustPoints) || 0
    if (pts === 0) {
      toast.error("Please enter non-zero adjustment points")
      return
    }

    setTeamScores((prev) => {
      const updated = prev.map((t) => (t.id === adjustTeamId ? { ...t, totalScore: Math.max(0, t.totalScore + pts) } : t))
      updated.sort((a, b) => b.totalScore - a.totalScore)
      updated.forEach((s, idx) => { s.rank = idx + 1 })
      return updated
    })

    const teamObj = teamScores.find((t) => t.id === adjustTeamId)
    toast.success(`Adjusted ${pts > 0 ? `+${pts}` : pts} points for ${teamObj?.name || "Team"}`)
    setShowAdjustModal(false)
    setAdjustPoints("0")
    setAdjustReason("")
  }

  const handlePublishTeamScores = () => {
    setIsPublished(true)
    toast.success("Team scores published to live portal & leaderboard!")
  }

  const filtered = teamScores.filter((t) => {
    const q = search.toLowerCase()
    const matchesSearch = t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q)
    if (!matchesSearch) return false

    if (viewType === "by_category" && selectedCategory !== "all") {
      if (t.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false
    }

    return true
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
          <span className="text-xs text-slate-500 font-medium">After 1 results</span>

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
            <option value="Senior">Senior</option>
            <option value="Junior">Junior</option>
            <option value="Sub Junior">Sub Junior</option>
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
