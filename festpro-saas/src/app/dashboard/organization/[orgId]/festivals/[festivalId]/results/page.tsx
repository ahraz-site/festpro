"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getCompetitions } from "@/lib/actions/competition"
import type { Competition } from "@/types/competition"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Trophy, Search, Loader2, Eye, X, Check,
  Medal, Award, ExternalLink
} from "lucide-react"

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
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)

  // Filters (Screenshot 2)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [includeInactive, setIncludeInactive] = useState(false)

  // Result Modal State
  const [viewingComp, setViewingComp] = useState<Competition | null>(null)
  const [modalWinners, setModalWinners] = useState<WinnerItem[]>([])

  useEffect(() => {
    async function load() {
      try {
        const comps = await getCompetitions(festivalId)
        setCompetitions((comps || []) as Competition[])
      } catch (err) {
        console.error("Failed to load results:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [festivalId])

  const handleOpenResults = (comp: Competition, idx: number) => {
    setViewingComp(comp)
    const mockWinners: WinnerItem[] = [
      { place: "1st", name: "Shamil", chestNumber: "BJ003", team: "BJP", score: 92, grade: "A+" },
      { place: "2nd", name: "Rashid", chestNumber: "CJ001", team: "CJP", score: 87, grade: "A" },
      { place: "3rd", name: "Ruhaib", chestNumber: "CJ003", team: "CJP", score: 81, grade: "A" },
    ]
    setModalWinners(mockWinners)
  }

  const filtered = competitions.filter((c) => {
    const q = search.toLowerCase()
    const matchesSearch = c.name.toLowerCase().includes(q) || (c.code && c.code.toLowerCase().includes(q))
    if (!matchesSearch) return false

    if (categoryFilter !== "all") {
      const catName = (c as any).category?.name || "Senior"
      if (catName.toLowerCase() !== categoryFilter.toLowerCase()) return false
    }

    return true
  })

  const exportColumns = [
    { header: "Result number", accessor: (c: Competition, idx?: number) => String((idx || 0) + 1) },
    { header: "Program", accessor: (c: Competition) => c.name },
    { header: "Category", accessor: (c: Competition) => (c as any).category?.name || "Senior" },
    { header: "Status", accessor: () => "Published" },
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
              <option value="Senior">Senior</option>
              <option value="Junior">Junior</option>
              <option value="Sub Junior">Sub Junior</option>
            </select>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="rounded-md border-slate-300 text-indigo-600 h-4 w-4"
              />
              <span>Include inactive</span>
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
                  const catName = (comp as any).category?.name || "Senior"

                  return (
                    <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-3 text-slate-900 font-bold">{idx + 1}</td>
                      <td className="py-4 px-3 font-bold text-slate-900 text-sm">{comp.name}</td>
                      <td className="py-4 px-3 text-slate-600">{catName}</td>
                      <td className="py-4 px-3">
                        <span className="text-slate-700 font-semibold">Published</span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <Button
                          size="sm"
                          onClick={() => handleOpenResults(comp, idx)}
                          className="rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs px-4"
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
                <p className="text-xs text-slate-500 font-medium">Official Winner List · {(viewingComp as any).category?.name || "Senior"}</p>
              </div>
              <button onClick={() => setViewingComp(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {modalWinners.map((w) => (
                <div
                  key={w.place}
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
                    <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      Grade {w.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
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
