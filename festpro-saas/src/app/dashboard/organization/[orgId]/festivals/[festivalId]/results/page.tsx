"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import type { Competition } from "@/types/competition"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, Search, Loader2, X, Check } from "lucide-react"

interface WinnerItem {
  place: string
  name: string
  chestNumber: string
  team: string
  score: number
  grade: string
}

export default function FestivalResultsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string

  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [resultItems, setResultItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [includeInactive, setIncludeInactive] = useState(false)

  // Result Modal State
  const [viewingComp, setViewingComp] = useState<Competition | null>(null)
  const [modalWinners, setModalWinners] = useState<WinnerItem[]>([])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch(`/api/festival/${festivalId}/workspace?scope=results`, {
          cache: "no-store",
        })
        const data = await res.json()
        if (!active) return
        setCompetitions((Array.isArray(data?.competitions) ? data.competitions : []) as Competition[])
        setCategories(Array.isArray(data?.categories) ? data.categories : [])
        setParticipants(Array.isArray(data?.participants) ? data.participants : [])
        setResultItems(Array.isArray(data?.resultItems) ? data.resultItems : [])
      } catch (err) {
        console.error("Failed to load results:", err)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [festivalId])

  const publishedCompIds = useMemo(() => {
    return new Set(
      resultItems
        .filter((r: any) => !r.status || r.status === "live" || r.status === "published")
        .map((r: any) => r.competition_id)
    )
  }, [resultItems])

  const handleOpenResults = (comp: Competition) => {
    setViewingComp(comp)
    const partById = new Map(participants.map((p: any) => [p.id, p]))
    const items = resultItems
      .filter((item: any) => item.competition_id === comp.id)
      .sort((a: any, b: any) => {
        const ra = Number(a.rank || 999)
        const rb = Number(b.rank || 999)
        if (ra !== rb) return ra - rb
        return Number(b.total_score || 0) - Number(a.total_score || 0)
      })

    const winners: WinnerItem[] = items.map((item: any, idx: number) => {
      const p = partById.get(item.participant_id) || item.participant
      const r = Number(item.rank || idx + 1)
      const placeStr = item.position || (r === 1 ? "1st" : r === 2 ? "2nd" : r === 3 ? "3rd" : `${r}th`)
      const pName = p ? `${p.first_name || ""} ${p.last_name || ""}`.trim() : (item.participant_name || "Participant")
      const total = Number(item.total_score ?? item.final_score ?? item.score ?? 0)
      return {
        place: placeStr,
        name: pName,
        chestNumber: p?.chest_number || item.chest_number || "-",
        team: p?.unit || p?.division || "Unassigned",
        score: total,
        grade: item.grade || (total >= 90 ? "A+" : total >= 80 ? "A" : "B"),
      }
    })
    setModalWinners(winners)
  }

  const filtered = competitions.filter((c) => {
    if (!includeInactive && !publishedCompIds.has(c.id)) return false

    const q = search.toLowerCase()
    const matchesSearch = c.name.toLowerCase().includes(q) || (c.code && c.code.toLowerCase().includes(q))
    if (!matchesSearch) return false

    if (categoryFilter !== "all") {
      const catName = (c as any).category?.name || "General"
      if (catName.toLowerCase() !== categoryFilter.toLowerCase()) return false
    }

    return true
  })

  const exportColumns = [
    { header: "Result number", accessor: (c: Competition, idx?: number) => String((idx || 0) + 1) },
    { header: "Program", accessor: (c: Competition) => c.name },
    { header: "Category", accessor: (c: Competition) => (c as any).category?.name || "General" },
    { header: "Status", accessor: (c: Competition) => (publishedCompIds.has(c.id) ? "Published" : "Pending") },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER (Screenshot 2) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Results</h1>
            <p className="text-xs text-slate-500 font-medium">Approved festival scores and published winner announcements</p>
          </div>
        </div>

        <ExportPrintBar
          title="Festival Competition Results"
          subtitle="FestPro Results Board"
          data={filtered}
          columns={exportColumns}
          filename="festival-results"
        />
      </div>

      {/* ── CARD (Screenshot 2: Programs Box) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-black text-slate-900">Programs</h2>
        </div>

        {/* Filter Bar (Search programs..., Dropdown All, Checkbox Include inactive) */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-xs shadow-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 w-36 shadow-xs"
            >
              <option value="all">All</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="rounded-md border-slate-300 text-indigo-600 h-4 w-4"
              />
              <span>Include unpublished programs</span>
            </label>
          </div>
        </div>

        {/* ── TABLE VIEW (Screenshot 2: Result number, Program, Category, Status, Action) ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading results...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center space-y-2">
            <Trophy className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No published results found.</p>
          </div>
        ) : (
          <div className="border-t border-slate-100 pt-2 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                  <th className="py-3 px-3 w-32">Result number</th>
                  <th className="py-3 px-3">Program</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((comp, idx) => {
                  const catName = (comp as any).category?.name || "General"
                  const isPublished = publishedCompIds.has(comp.id)

                  return (
                    <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-3 text-slate-900 font-bold">{idx + 1}</td>
                      <td className="py-4 px-3 font-bold text-slate-900 text-sm">{comp.name}</td>
                      <td className="py-4 px-3 text-slate-600">{catName}</td>
                      <td className="py-4 px-3">
                        <span className={`font-semibold ${isPublished ? "text-emerald-700" : "text-slate-400"}`}>
                          {isPublished ? "Published" : "Pending"}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <Button
                          size="sm"
                          onClick={() => handleOpenResults(comp)}
                          className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-4"
                        >
                          View results
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── RESULT MODAL ── */}
      {viewingComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">{viewingComp.name}</h2>
                <p className="text-xs text-slate-500 font-medium">Official Winner List · {(viewingComp as any).category?.name || "General"}</p>
              </div>
              <button onClick={() => setViewingComp(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {modalWinners.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-medium">
                  No evaluated results or published scores yet for this program.
                </div>
              ) : (
                modalWinners.map((w) => (
                  <div
                    key={w.place + w.chestNumber}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs ${
                          w.place === "1st"
                            ? "bg-amber-400 text-amber-950 shadow-xs"
                            : w.place === "2nd"
                            ? "bg-slate-300 text-slate-900"
                            : "bg-amber-700/20 text-amber-900"
                        }`}
                      >
                        {w.place}
                      </span>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{w.name}</h4>
                        <p className="text-xs text-slate-400 font-mono">Chest #{w.chestNumber} · {w.team}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-indigo-700 text-sm block">{w.score} pts</span>
                      <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                        Grade {w.grade}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Published on public portal
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewingComp(null)}
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
