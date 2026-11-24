"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getCompetitions } from "@/lib/actions/competition"
import { getFestivalStages } from "@/lib/actions/festival"
import type { Competition } from "@/types/competition"
import type { FestivalStage } from "@/types/festival"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Monitor, Search, Loader2, Play, CheckCircle2,
  Users, Clock, AlertCircle, ArrowRight
} from "lucide-react"

type StageDeskTab = "NOT STARTED" | "REPORTING" | "STARTED" | "FINISHED"

export default function StageDeskPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [stages, setStages] = useState<FestivalStage[]>([])
  const [loading, setLoading] = useState(true)

  // Filters (Screenshot 3)
  const [selectedStage, setSelectedStage] = useState<string>("")
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<StageDeskTab>("NOT STARTED")

  // Local runtime status map for stage desk
  const [compStatuses, setCompStatuses] = useState<Record<string, StageDeskTab>>({})

  useEffect(() => {
    async function load() {
      try {
        const [comps, stgs] = await Promise.all([
          getCompetitions(festivalId),
          getFestivalStages(festivalId),
        ])
        const compList = (comps || []) as Competition[]
        const stageList = (stgs || []) as FestivalStage[]
        setCompetitions(compList)
        setStages(stageList)
        if (stageList[0]) setSelectedStage(stageList[0].id)

        // Initialize status
        const initialStatus: Record<string, StageDeskTab> = {}
        compList.forEach((c, idx) => {
          initialStatus[c.id] = idx === 0 ? "STARTED" : idx === 1 ? "REPORTING" : "NOT STARTED"
        })
        setCompStatuses(initialStatus)
      } catch (err) {
        console.error("Failed to load stage desk:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [festivalId])

  const handleClearFilters = () => {
    setSearch("")
    setActiveTab("NOT STARTED")
    if (stages[0]) setSelectedStage(stages[0].id)
  }

  const handleUpdateStatus = (compId: string, newStatus: StageDeskTab) => {
    setCompStatuses((prev) => ({
      ...prev,
      [compId]: newStatus,
    }))
    toast.success(`Program moved to ${newStatus}`)
  }

  const filtered = competitions.filter((c) => {
    const s = search.toLowerCase()
    const matchesSearch = c.name.toLowerCase().includes(s) || (c.code && c.code.toLowerCase().includes(s))
    if (!matchesSearch) return false

    const status = compStatuses[c.id] || "NOT STARTED"
    if (status !== activeTab) return false

    return true
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER (Screenshot 3) ── */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
          <Monitor className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Stage desk</h1>
          <p className="text-xs text-slate-500 font-medium">Stage coordinator console: track reporting, call participants, and trigger timings</p>
        </div>
      </div>

      {/* ── FILTER CONTROLS (Screenshot 3) ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Stage Dropdown (e.g. Stage 1) */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 w-full sm:w-56 focus:outline-hidden focus:border-indigo-500 shadow-xs"
          >
            {stages.map((stg) => (
              <option key={stg.id} value={stg.id}>{stg.name}</option>
            ))}
            {stages.length === 0 && <option value="stage1">Stage 1</option>}
          </select>

          {/* Search programs input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-xs shadow-xs"
            />
          </div>
        </div>

        {/* ── 4 STATUS TABS (Screenshot 3: NOT STARTED, REPORTING, STARTED, FINISHED) ── */}
        <div className="flex flex-wrap items-center gap-2">
          {(["NOT STARTED", "REPORTING", "STARTED", "FINISHED"] as StageDeskTab[]).map((tab) => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-slate-100/90 hover:bg-slate-200 text-slate-600 border border-slate-200"
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── CONTENT AREA (Screenshot 3: Empty state vs Program Cards) ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading stage desk...</p>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State Matching Screenshot 3 */
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center space-y-4 shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">No programs match these filters</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Clear the filters to see all programs for this stage.</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearFilters}
            className="rounded-xl text-xs font-semibold px-4 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        /* Active Programs List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((comp) => {
            const status = compStatuses[comp.id] || "NOT STARTED"
            const catName = (comp as any).category?.name || "Senior"

            return (
              <div
                key={comp.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{comp.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{catName} · Duration: {comp.duration_minutes || 30} mins</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      {status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Participants</span>
                      <strong className="text-sm font-black text-slate-800">8</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Reported</span>
                      <strong className="text-sm font-black text-emerald-600">6</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">On Stage</span>
                      <strong className="text-sm font-black text-indigo-600">Chest #104</strong>
                    </div>
                  </div>
                </div>

                {/* State Transition Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {status === "NOT STARTED" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(comp.id, "REPORTING")}
                        className="rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        Call for reporting
                      </Button>
                    )}
                    {status === "REPORTING" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(comp.id, "STARTED")}
                        className="rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
                      >
                        Start program
                      </Button>
                    )}
                    {status === "STARTED" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(comp.id, "FINISHED")}
                        className="rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white"
                      >
                        Finish program
                      </Button>
                    )}
                    {status === "FINISHED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(comp.id, "STARTED")}
                        className="rounded-xl text-xs font-semibold border-slate-200 text-slate-700"
                      >
                        Re-open
                      </Button>
                    )}
                  </div>

                  <Link
                    href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/${comp.id}`}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
