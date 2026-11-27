"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Competition } from "@/types/competition"
import type { FestivalStage } from "@/types/festival"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Gamepad2, Search, Loader2, Users, MoreVertical } from "lucide-react"

function mapDeskStatusToLabel(deskStatus?: string, dbStatus?: string): string {
  if (deskStatus === "STARTED") return "Started"
  if (deskStatus === "FINISHED") return "Finished"
  if (deskStatus === "REPORTING") return "Reporting"
  if (deskStatus === "NOT STARTED") return "Not started"
  const s = String(dbStatus || "").toLowerCase()
  if (s === "running" || s === "live" || s === "in_progress" || s === "started") return "Started"
  if (s === "completed" || s === "finished") return "Finished"
  if (s === "scheduled" || s === "registration_closed" || s === "reporting") return "Reporting"
  return "Not started"
}

function mapLabelToDeskStatus(label: string): string {
  if (label === "Started") return "STARTED"
  if (label === "Finished") return "FINISHED"
  if (label === "Reporting") return "REPORTING"
  return "NOT STARTED"
}

export default function LiveProgramsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [stages, setStages] = useState<FestivalStage[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [resultItems, setResultItems] = useState<any[]>([])
  const [programMarks, setProgramMarks] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stageFilter, setStageFilter] = useState("all")
  const [viewMode, setViewMode] = useState<ViewMode>("table")

  // Runtime state (stage and status tracking)
  const [programStates, setProgramStates] = useState<Record<string, { stageId: string; status: string }>>({})

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch(`/api/festival/${festivalId}/workspace?scope=live-programs`, {
          cache: "no-store",
        })
        const data = await res.json()
        if (!active) return

        const compList = (Array.isArray(data?.competitions) ? data.competitions : []) as Competition[]
        const stageList = (Array.isArray(data?.stages) ? data.stages : []) as FestivalStage[]
        const liveStatuses = (data?.customFields?.live_stage_statuses || {}) as Record<
          string,
          { stageId?: string; deskStatus?: string }
        >

        setCompetitions(compList)
        setStages(stageList)
        setCategories(Array.isArray(data?.categories) ? data.categories : [])
        setResultItems(Array.isArray(data?.resultItems) ? data.resultItems : [])
        setProgramMarks((data?.customFields?.program_marks || {}) as Record<string, any[]>)

        const initial: Record<string, { stageId: string; status: string }> = {}
        compList.forEach((c) => {
          const saved = liveStatuses[c.id]
          initial[c.id] = {
            stageId: saved?.stageId || (c as any).venue_id || stageList[0]?.id || "",
            status: mapDeskStatusToLabel(saved?.deskStatus, c.status),
          }
        })
        setProgramStates(initial)
      } catch (err) {
        console.error("Failed to load live programs:", err)
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

  const persistStageUpdate = async (compId: string, stageId: string, labelStatus: string) => {
    try {
      await fetch(`/api/festival/${festivalId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_stage_status",
          payload: {
            competitionId: compId,
            stageId,
            deskStatus: mapLabelToDeskStatus(labelStatus),
          },
        }),
      })
    } catch {}
  }

  const handleStageChange = (compId: string, stageId: string) => {
    const currentStatus = programStates[compId]?.status || "Not started"
    setProgramStates((prev) => ({
      ...prev,
      [compId]: {
        stageId,
        status: currentStatus,
      },
    }))
    persistStageUpdate(compId, stageId, currentStatus)
    const stageName = stages.find((s) => s.id === stageId)?.name || "Unassigned"
    toast.success(`Assigned to ${stageName}`)
  }

  const handleToggleStatus = (compId: string) => {
    const current = programStates[compId]?.status || "Not started"
    const stageId = programStates[compId]?.stageId || ""
    let nextStatus = "Started"
    if (current === "Not started" || current === "Reporting") nextStatus = "Started"
    else if (current === "Started") nextStatus = "Finished"
    else nextStatus = "Not started"

    setProgramStates((prev) => ({
      ...prev,
      [compId]: {
        stageId,
        status: nextStatus,
      },
    }))
    persistStageUpdate(compId, stageId, nextStatus)
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
        stages.find((s) => s.id === programStates[c.id]?.stageId)?.name || "Unassigned",
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
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
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
                  const state = programStates[comp.id] || { stageId: stages[0]?.id || "", status: "Not started" }
                  const catName = (comp as any).category?.name || "General"
                  const isPublished = publishedCompIds.has(comp.id)
                  const hasMarks = (programMarks[comp.id]?.length || 0) > 0

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
                          value={state.stageId || ""}
                          onChange={(e) => handleStageChange(comp.id, e.target.value)}
                          className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
                        >
                          {stages.length > 0 ? (
                            stages.map((stg) => (
                              <option key={stg.id} value={stg.id}>{stg.name}</option>
                            ))
                          ) : (
                            <option value="">No stages created</option>
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
                          <div className="text-[11px] text-slate-500 font-medium">
                            {hasMarks || isPublished ? "Marks evaluated" : "Awaiting valuation"}
                          </div>
                          {isPublished && (
                            <div className="text-[11px] text-indigo-600 font-semibold">Result Published</div>
                          )}
                        </div>
                      </td>

                      {/* 4. Action Buttons */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleToggleStatus(comp.id)}
                            className="rounded-xl text-xs font-bold shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            {state.status === "Started" ? "Finish program" : "Start program"}
                          </Button>

                          <Link
                            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/${comp.id}/judges`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                          >
                            <Users className="h-3.5 w-3.5 text-slate-500" />
                            <span>Assign judges</span>
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
            const state = programStates[comp.id] || { stageId: stages[0]?.id || "", status: "Not started" }
            const catName = (comp as any).category?.name || "General"

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
                      value={state.stageId || ""}
                      onChange={(e) => handleStageChange(comp.id, e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    >
                      {stages.length > 0 ? (
                        stages.map((stg) => (
                          <option key={stg.id} value={stg.id}>{stg.name}</option>
                        ))
                      ) : (
                        <option value="">No stages created</option>
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
