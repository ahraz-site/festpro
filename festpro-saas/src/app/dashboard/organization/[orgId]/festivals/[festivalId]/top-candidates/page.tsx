"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { Trophy, X, Loader2 } from "lucide-react"

interface CandidateRank {
  rank: number
  chestNumber: string
  name: string
  team: string
  points: number
  programsCount: number
}

export default function TopCandidatesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string

  const [includeCommon, setIncludeCommon] = useState(true)
  const [includeStage, setIncludeStage] = useState(true)
  const [includeOffStage, setIncludeOffStage] = useState(true)
  const [searchCategory, setSearchCategory] = useState("")
  const [loading, setLoading] = useState(true)

  const [dbCategories, setDbCategories] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [resultItems, setResultItems] = useState<any[]>([])

  // Ranking Modal
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [rankedList, setRankedList] = useState<CandidateRank[]>([])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch(`/api/festival/${festivalId}/workspace?scope=top-candidates`, {
          cache: "no-store",
        })
        const data = await res.json()
        if (!active) return
        setDbCategories(Array.isArray(data?.categories) ? data.categories : [])
        setCompetitions(Array.isArray(data?.competitions) ? data.competitions : [])
        setParticipants(Array.isArray(data?.participants) ? data.participants : [])
        setResultItems(Array.isArray(data?.resultItems) ? data.resultItems : [])
      } catch (err) {
        console.error("Failed to load top candidates data:", err)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [festivalId])

  const categories = useMemo(() => {
    const set = new Set<string>()
    dbCategories.forEach((c: any) => {
      if (c?.name) set.add(String(c.name).trim())
    })
    competitions.forEach((c: any) => {
      if (c?.category?.name) set.add(String(c.category.name).trim())
    })
    participants.forEach((p: any) => {
      if (p?.division) set.add(String(p.division).trim())
    })
    return Array.from(set).filter(Boolean)
  }, [dbCategories, competitions, participants])

  const computeRankings = (catName: string): CandidateRank[] => {
    const isOverall = catName === "Overall (All Categories)"
    const catById = new Map(dbCategories.map((c: any) => [c.id, String(c.name || "")]))
    const compById = new Map(competitions.map((c: any) => [c.id, c]))
    const partById = new Map(participants.map((p: any) => [p.id, p]))

    const agg = new Map<
      string,
      { chestNumber: string; name: string; team: string; points: number; compIds: Set<string> }
    >()

    resultItems.forEach((item: any) => {
      const comp = compById.get(item.competition_id)
      const part = partById.get(item.participant_id)
      if (!part && !item.participant_name) return

      const compCatName = String(
        comp?.category?.name || catById.get(comp?.category_id) || part?.division || ""
      ).trim()
      const isCommon =
        compCatName.toLowerCase() === "general" ||
        compCatName.toLowerCase() === "common" ||
        Boolean(comp?.is_common)
      if (!includeCommon && isCommon) return

      const stageFlag = String(comp?.stage_type || comp?.type || "").toLowerCase()
      const isOffStage = comp?.is_stage === false || stageFlag.includes("off")
      if (isOffStage && !includeOffStage) return
      if (!isOffStage && !includeStage) return

      if (!isOverall) {
        const partCat = String(part?.division || "").trim()
        if (
          compCatName.toLowerCase() !== catName.toLowerCase() &&
          partCat.toLowerCase() !== catName.toLowerCase()
        ) {
          return
        }
      }

      const key = item.participant_id || `${item.participant_name || ""}:${item.chest_number || ""}`
      const fullName = part
        ? `${part.first_name || ""} ${part.last_name || ""}`.trim()
        : String(item.participant_name || "Participant")
      const existing = agg.get(key) || {
        chestNumber: String(part?.chest_number || item.chest_number || "—"),
        name: fullName,
        team: String(part?.unit || item.team_name || "Unassigned"),
        points: 0,
        compIds: new Set<string>(),
      }
      const pts = Number(
        item.total_points ??
          item.points ??
          (item.rank === 1 ? 5 : item.rank === 2 ? 3 : item.rank === 3 ? 1 : 0)
      )
      existing.points += pts
      if (item.competition_id) existing.compIds.add(item.competition_id)
      agg.set(key, existing)
    })

    return Array.from(agg.values())
      .filter((entry) => entry.points > 0)
      .sort((a, b) => b.points - a.points)
      .map((entry, idx) => ({
        rank: idx + 1,
        chestNumber: entry.chestNumber,
        name: entry.name,
        team: entry.team,
        points: entry.points,
        programsCount: entry.compIds.size || 1,
      }))
  }

  const handleOpenRanking = (catName: string) => {
    setSelectedCategory(catName)
    setRankedList(computeRankings(catName))
  }

  const handleOpenOverall = () => {
    handleOpenRanking("Overall (All Categories)")
  }

  const filteredCategories = categories.filter((c) =>
    c.toLowerCase().includes(searchCategory.toLowerCase())
  )

  const exportColumns = [
    { header: "Rank", accessor: (c: CandidateRank) => `#${c.rank}` },
    { header: "Chest No", accessor: (c: CandidateRank) => c.chestNumber },
    { header: "Name", accessor: (c: CandidateRank) => c.name },
    { header: "Team", accessor: (c: CandidateRank) => c.team },
    { header: "Total Points", accessor: (c: CandidateRank) => String(c.points) },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER (Screenshot 5) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Top candidates</h1>
          </div>
        </div>

        {/* Top Right Button (FestPro Brand Styling) */}
        <Button
          size="sm"
          onClick={handleOpenOverall}
          className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-4"
        >
          Overall top candidates
        </Button>
      </div>

      {/* ── FILTERS CARD (FestPro Brand Toggles) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-black text-slate-900">Filters</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Refine the score calculations for top candidate rankings.</p>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2">
          {/* Toggle 1: Include common categories */}
          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeCommon}
              onChange={(e) => setIncludeCommon(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 relative" />
            <span>Include common categories</span>
          </label>

          {/* Toggle 2: Include stage programs */}
          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeStage}
              onChange={(e) => setIncludeStage(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 relative" />
            <span>Include stage programs</span>
          </label>

          {/* Toggle 3: Include off-stage programs */}
          <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeOffStage}
              onChange={(e) => setIncludeOffStage(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 relative" />
            <span>Include off-stage programs</span>
          </label>
        </div>
      </div>

      {/* ── SEARCH CATEGORIES ── */}
      <div className="relative max-w-md">
        <Input
          placeholder="Search categories..."
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
          className="h-10 rounded-xl bg-white border-slate-200 text-xs shadow-xs"
        />
      </div>

      {/* ── CATEGORIES LIST CARD ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-black text-slate-900">Categories</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Select a category to view top candidates.</p>
        </div>

        <div className="border-t border-slate-100 pt-2 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={2} className="py-10 text-center text-xs text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2 text-indigo-600" />
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-10 text-center text-xs text-slate-500">
                    No categories found. Add categories and publish results to view top candidates.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-3 font-bold text-slate-900 text-sm">{cat}</td>
                    <td className="py-4 px-3 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleOpenRanking(cat)}
                        className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-4"
                      >
                        View ranking
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RANKING MODAL ── */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">Top Candidates ({selectedCategory})</h2>
                <p className="text-xs text-slate-500 font-medium">Kalaprathibha & Individual High Scorers</p>
              </div>
              <button onClick={() => setSelectedCategory(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <ExportPrintBar
                title={`Top Candidates - ${selectedCategory}`}
                subtitle="FestPro Individual Standings"
                data={rankedList}
                columns={exportColumns}
                filename={`top-candidates-${selectedCategory}`}
              />
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
              {rankedList.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  No published points yet for {selectedCategory}.
                </div>
              ) : (
                rankedList.map((c) => (
                <div
                  key={c.chestNumber}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs ${
                        c.rank === 1
                          ? "bg-amber-400 text-amber-950 shadow-xs"
                          : c.rank === 2
                          ? "bg-slate-300 text-slate-900"
                          : c.rank === 3
                          ? "bg-amber-700/20 text-amber-900"
                          : "bg-white text-slate-700"
                      }`}
                    >
                      #{c.rank}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{c.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">Chest #{c.chestNumber} · {c.team}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-indigo-700 text-sm block">{c.points} pts</span>
                    <span className="text-[10px] text-slate-400">{c.programsCount} programs</span>
                  </div>
                </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedCategory(null)}
                className="rounded-xl text-xs font-semibold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
