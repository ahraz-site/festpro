"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Competition } from "@/types/competition"
import type { FestivalStage } from "@/types/festival"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Monitor, Search, Loader2 } from "lucide-react"
import { getCachedWorkspace, fetchWorkspaceWithSWR, invalidateFestivalWorkspace } from "@/lib/cache/workspace-cache"

type StageDeskTab = "NOT STARTED" | "REPORTING" | "STARTED" | "FINISHED"

export default function StageDeskPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const initialCache = getCachedWorkspace(festivalId, "stage-desk")
  const [competitions, setCompetitions] = useState<Competition[]>(() => (initialCache?.competitions || []) as Competition[])
  const [stages, setStages] = useState<FestivalStage[]>(() => (initialCache?.stages || []) as FestivalStage[])
  const [registrations, setRegistrations] = useState<any[]>(() => initialCache?.registrations || [])
  const [participants, setParticipants] = useState<any[]>(() => initialCache?.participants || [])
  const [codeLettersMap, setCodeLettersMap] = useState<Record<string, any[]>>(() => (initialCache?.customFields?.code_letters || {}) as Record<string, any[]>)
  const [greenRoomMap, setGreenRoomMap] = useState<Record<string, any>>(() => (initialCache?.customFields?.green_room || {}) as Record<string, any>)
  const [stageAssignments, setStageAssignments] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(!initialCache)

  // Filters
  const [selectedStage, setSelectedStage] = useState<string>(() => initialCache?.stages?.[0]?.id || "")
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<StageDeskTab>("NOT STARTED")

  // Runtime status map for stage desk
  const [compStatuses, setCompStatuses] = useState<Record<string, StageDeskTab>>({})

  useEffect(() => {
    let active = true
    const applyData = (data: any) => {
      if (!active) return
      const compList = (Array.isArray(data?.competitions) ? data.competitions : []) as Competition[]
      const stageList = (Array.isArray(data?.stages) ? data.stages : []) as FestivalStage[]
      const liveStatuses = (data?.customFields?.live_stage_statuses || {}) as Record<
        string,
        { stageId?: string; deskStatus?: StageDeskTab }
      >

      setCompetitions(compList)
      setStages(stageList)
      setRegistrations(Array.isArray(data?.registrations) ? data.registrations : [])
      setParticipants(Array.isArray(data?.participants) ? data.participants : [])
      setCodeLettersMap((data?.customFields?.code_letters || {}) as Record<string, any[]>)
      setGreenRoomMap((data?.customFields?.green_room || {}) as Record<string, any>)
      if (stageList[0]) setSelectedStage((prev) => prev || stageList[0].id)

      const initialStatus: Record<string, StageDeskTab> = {}
      const initialStages: Record<string, string> = {}
      compList.forEach((c) => {
        const saved = liveStatuses[c.id]
        if (saved?.deskStatus) {
          initialStatus[c.id] = saved.deskStatus
        } else {
          const dbStatus = String(c.status || "").toLowerCase()
          if (dbStatus === "running" || dbStatus === "live" || dbStatus === "in_progress") {
            initialStatus[c.id] = "STARTED"
          } else if (dbStatus === "completed" || dbStatus === "finished") {
            initialStatus[c.id] = "FINISHED"
          } else if (dbStatus === "registration_closed" || dbStatus === "reporting") {
            initialStatus[c.id] = "REPORTING"
          } else {
            initialStatus[c.id] = "NOT STARTED"
          }
        }
        if (saved?.stageId || (c as any).venue_id) {
          initialStages[c.id] = saved?.stageId || (c as any).venue_id
        }
      })
      setCompStatuses(initialStatus)
      setStageAssignments(initialStages)
    }

    if (initialCache) applyData(initialCache)
    fetchWorkspaceWithSWR(festivalId, "stage-desk", applyData)
      .catch((err) => console.error("Failed to load stage desk:", err))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [festivalId])

  const handleClearFilters = () => {
    setSearch("")
    setActiveTab("NOT STARTED")
    if (stages[0]) setSelectedStage(stages[0].id)
  }

  const handleUpdateStatus = async (compId: string, newStatus: StageDeskTab) => {
    setCompStatuses((prev) => ({
      ...prev,
      [compId]: newStatus,
    }))
    try {
      const res = await fetch(`/api/festival/${festivalId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_stage_status",
          payload: {
            competitionId: compId,
            stageId: stageAssignments[compId] || selectedStage || "",
            deskStatus: newStatus,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save stage status")
      }
      invalidateFestivalWorkspace(festivalId)
      toast.success(`Program moved to ${newStatus}`)
    } catch (err: any) {
      toast.error(err?.message || "Failed to persist status")
    }
  }

  const filtered = competitions.filter((c) => {
    const s = search.toLowerCase()
    const matchesSearch = c.name.toLowerCase().includes(s) || (c.code && c.code.toLowerCase().includes(s))
    if (!matchesSearch) return false

    const assigned = stageAssignments[c.id]
    if (selectedStage && assigned && assigned !== selectedStage) return false

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
            {stages.length > 0 ? (
              stages.map((stg) => (
                <option key={stg.id} value={stg.id}>{stg.name}</option>
              ))
            ) : (
              <option value="">No stages created</option>
            )}
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
                    ? "bg-indigo-600 text-white shadow-xs"
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
            const catName = (comp as any).category?.name || "General"
            const enrolledRegs = registrations.filter((r: any) => r.competition_id === comp.id)
            const enrolledIds = new Set(enrolledRegs.map((r: any) => r.participant_id))
            const codeEntries = codeLettersMap[comp.id] || []
            const reportedCount = codeEntries.length > 0
              ? codeEntries.filter((e: any) => e.isReported).length
              : enrolledRegs.filter((r: any) => {
                  const gr = greenRoomMap[r.participant_id]?.status
                  return r.is_attended || gr === "reported" || gr === "ready_for_stage" || gr === "on_stage"
                }).length
            const onStageParticipant = participants.find(
              (p: any) => enrolledIds.has(p.id) && greenRoomMap[p.id]?.status === "on_stage"
            )
            const onStageLabel = onStageParticipant
              ? `Chest #${onStageParticipant.chest_number || "—"}`
              : "—"

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
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                      {status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Participants</span>
                      <strong className="text-sm font-black text-slate-800">{enrolledRegs.length}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Reported</span>
                      <strong className="text-sm font-black text-indigo-600">{reportedCount}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">On Stage</span>
                      <strong className="text-sm font-black text-indigo-600">{onStageLabel}</strong>
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
                        className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
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
