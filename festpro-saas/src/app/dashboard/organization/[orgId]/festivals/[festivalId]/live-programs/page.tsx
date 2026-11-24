"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getCompetitions } from "@/lib/actions/competition"
import { getFestivalStages } from "@/lib/actions/festival"
import type { Competition } from "@/types/competition"
import type { FestivalStage } from "@/types/festival"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Gamepad2, Search, Loader2, Play, CheckCircle2,
  Users, MoreVertical, Trophy, ArrowRight
} from "lucide-react"

export default function LiveProgramsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [stages, setStages] = useState<FestivalStage[]>([])
  const [loading, setLoading] = useState(true)

  // Filters (Screenshot 1)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stageFilter, setStageFilter] = useState("all")
  const [viewMode, setViewMode] = useState<ViewMode>("table")

  // Local program runtime state (stage and status tracking)
  const [programStates, setProgramStates] = useState<Record<string, { stageId: string; status: string }>>({})

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

        // Initialize program states from real competition records
        const initial: Record<string, { stageId: string; status: string }> = {}
        compList.forEach((c) => {
          const statusStr = String(c.status || "")
          let initStatus = "Not started"
          if (statusStr === "running" || statusStr === "live" || statusStr === "in_progress" || statusStr === "started") initStatus = "Started"
          else if (statusStr === "completed" || statusStr === "finished") initStatus = "Finished"
          else if (statusStr === "scheduled" || statusStr === "registration_closed") initStatus = "Reporting"

          initial[c.id] = {
            stageId: (c as any).venue_id || stageList[0]?.id || "",
            status: initStatus,
          }
        })
        setProgramStates(initial)
      } catch (err) {
        console.error("Failed to load live programs:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [festivalId])

  const handleStageChange = (compId: string, stageId: string) => {
    setProgramStates((prev) => ({
      ...prev,
      [compId]: {
        ...prev[compId],
        stageId,
      },
    }))
    const stageName = stages.find((s) => s.id === stageId)?.name || "Stage"
    toast.success(`Assigned to ${stageName}`)
  }

  const handleToggleStatus = (compId: string) => {
    const current = programStates[compId]?.status || "Not started"
    let nextStatus = "Started"
    if (current === "Not started") nextStatus = "Started"
    else if (current === "Started") nextStatus = "Finished"
    else nextStatus = "Not started"

    setProgramStates((prev) => ({
      ...prev,
      [compId]: {
        ...prev[compId],
        status: nextStatus,
      },
    }))
    toast.success(`Status updated to ${nextStatus}`)
  }

  // Filtered programs
  const filtered = competitions.filter((c) => {
    const s = search.toLowerCase()
    const matchesSearch = c.name.toLowerCase().includes(s) || (c.code && c.code.toLowerCase().includes(s))
    if (!matchesSearch) return false

    const state = programStates[c.id] || { stageId: "", status: "Not started" }

    if (statusFilter !== "all" && state.status.toLowerCase() !== statusFilter.toLowerCase()) return false
    if (stageFilter !== "all" && state.stageId !== stageFilter) return false
    if (categoryFilter !== "all") {
      const catName = (c as any).category?.name || "General"
      if (catName.toLowerCase() !== categoryFilter.toLowerCase()) return false
    }

    return true
  })

  // Export Columns definition
  const exportColumns = [
    { header: "Program", accessor: (c: Competition) => c.name },
    { header: "Category", accessor: (c: Competition) => (c as any).category?.name || "General" },
    {
      header: "Stage",
      accessor: (c: Competition) =>
        stages.find((s) => s.id === programStates[c.id]?.stageId)?.name || "Stage 1",
    },
    { header: "Status", accessor: (c: Competition) => programStates[c.id]?.status || "Not started" },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER (Screenshot 1) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Live programs</h1>
            <p className="text-xs text-slate-500 font-medium">Control ongoing performances, call next candidates, and assign judges</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportPrintBar
            title="Live Festival Programs"
            subtitle="FestPro Festival Management System"
            data={filtered}
            columns={exportColumns}
            filename="live-programs"
          />
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* ── SEARCH & 3-DROPDOWN FILTERS (Screenshot 1) ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search programs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-xs"
          />
        </div>

        {/* Filter 1: All categories */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
        >
          <option value="all">All categories</option>
          <option value="Senior">Senior</option>
          <option value="Junior">Junior</option>
          <option value="Sub Junior">Sub Junior</option>
          <option value="General">General</option>
        </select>

        {/* Filter 2: All statuses */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
        >
          <option value="all">All statuses</option>
          <option value="Not started">Not started</option>
          <option value="Reporting">Reporting</option>
          <option value="Started">Started</option>
          <option value="Finished">Finished</option>
        </select>

        {/* Filter 3: All stages */}
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
        >
          <option value="all">All stages</option>
          {stages.map((stg) => (
            <option key={stg.id} value={stg.id}>{stg.name}</option>
          ))}
          {stages.length === 0 && <option value="stage1">Stage 1</option>}
        </select>
      </div>

      {/* ── TABLE VIEW (Exact layout from Screenshot 1) ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading live programs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <Gamepad2 className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No live programs matching filters</h3>
          <p className="text-xs text-slate-400">Clear your filters or schedule new programs to begin live control.</p>
        </div>
      ) : viewMode === "table" ? (
        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5">Program</th>
                  <th className="py-3 px-5">Stage</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Next</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((comp) => {
                  const state = programStates[comp.id] || { stageId: stages[0]?.id || "", status: "Started" }
                  const catName = (comp as any).category?.name || "Senior"

                  return (
                    <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Program & Category */}
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-sm">{comp.name}</div>
                        <div className="text-slate-400 text-xs font-medium mt-0.5">{catName}</div>
                      </td>

                      {/* 2. Stage selector */}
                      <td className="py-4 px-5">
                        <select
                          value={state.stageId || (stages[0]?.id || "")}
                          onChange={(e) => handleStageChange(comp.id, e.target.value)}
                          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
                        >
                          {stages.length > 0 ? (
                            stages.map((stg) => (
                              <option key={stg.id} value={stg.id}>{stg.name}</option>
                            ))
                          ) : (
                            <option value="stage1">Stage 1</option>
                          )}
                        </select>
                      </td>

                      {/* 3. Status Badges */}
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {state.status === "Started" && <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />}
                            <span>{state.status}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">Valuation closed</div>
                          <div className="text-[11px] text-indigo-600 font-semibold">Result Published</div>
                        </div>
                      </td>

                      {/* 4. Action Buttons (Screenshot 1: Finish program, Assign judges 1, ...) */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleToggleStatus(comp.id)}
                            className={`rounded-xl text-xs font-bold shadow-xs ${
                              state.status === "Started"
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                            }`}
                          >
                            {state.status === "Started" ? "Finish program" : "Start program"}
                          </Button>

                          <Link
                            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/${comp.id}/judges`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                          >
                            <Users className="h-3.5 w-3.5 text-slate-500" />
                            <span>Assign judges 1</span>
                          </Link>

                          <Link
                            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/${comp.id}`}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                            title="Program details"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((comp) => {
            const state = programStates[comp.id] || { stageId: stages[0]?.id || "", status: "Started" }
            const catName = (comp as any).category?.name || "Senior"

            return (
              <div
                key={comp.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-black text-slate-900">{comp.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{catName}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200">
                      {state.status}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Assigned Stage
                    </label>
                    <select
                      value={state.stageId || (stages[0]?.id || "")}
                      onChange={(e) => handleStageChange(comp.id, e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    >
                      {stages.length > 0 ? (
                        stages.map((stg) => (
                          <option key={stg.id} value={stg.id}>{stg.name}</option>
                        ))
                      ) : (
                        <option value="stage1">Stage 1</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleToggleStatus(comp.id)}
                    className="flex-1 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {state.status === "Started" ? "Finish program" : "Start program"}
                  </Button>
                  <Link
                    href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/${comp.id}/judges`}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                  >
                    Judges
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
