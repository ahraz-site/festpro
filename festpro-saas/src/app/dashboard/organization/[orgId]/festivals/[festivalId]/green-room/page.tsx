"use client"

import React, { useState, useEffect, useTransition } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  DoorOpen,
  Search,
  CheckCircle2,
  Clock,
  Mic2,
  Users,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Tag,
  Volume2,
} from "lucide-react"
import { getCachedWorkspace, fetchWorkspaceWithSWR, invalidateFestivalWorkspace } from "@/lib/cache/workspace-cache"

type GreenRoomStatus = "waiting" | "reported" | "ready_for_stage" | "on_stage" | "completed"

interface ParticipantCard {
  id: string
  name: string
  chestNumber: string
  team: string
  category: string
  codeLetter?: string
  greenRoomStatus: GreenRoomStatus
  reportedTime?: string
}

const CODE_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"]

export default function GreenRoomPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const mapGreenRoomData = (data: any) => {
    const pList = Array.isArray(data?.participants) ? data.participants : []
    const cList = Array.isArray(data?.competitions) ? data.competitions : []
    const greenRoomMap = (data?.customFields?.green_room || {}) as Record<
      string,
      { status?: GreenRoomStatus; codeLetter?: string; reportedTime?: string }
    >
    const codeLettersObj = (data?.customFields?.code_letters || {}) as Record<
      string,
      Array<{ id: string; codeLetter?: string; isReported?: boolean }>
    >
    const fallbackCodeByParticipant = new Map<string, string>()
    Object.values(codeLettersObj).forEach((entries) => {
      if (Array.isArray(entries)) {
        entries.forEach((entry) => {
          if (entry?.id && entry?.codeLetter && !fallbackCodeByParticipant.has(entry.id)) {
            fallbackCodeByParticipant.set(entry.id, entry.codeLetter)
          }
        })
      }
    })

    const mapped: ParticipantCard[] = pList.map((p: any, idx: number) => {
      const saved = greenRoomMap[p.id]
      return {
        id: p.id,
        name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || `Participant ${idx + 1}`,
        chestNumber: p.chest_number || "—",
        team: p.unit || "Unassigned",
        category: p.division || "General",
        codeLetter: saved?.codeLetter || fallbackCodeByParticipant.get(p.id) || undefined,
        greenRoomStatus: saved?.status || "waiting",
        reportedTime: saved?.reportedTime || undefined,
      }
    })
    return { mapped, cList }
  }

  const initialCache = getCachedWorkspace(festivalId, "green-room")
  const initialMapped = initialCache ? mapGreenRoomData(initialCache) : null

  const [loading, setLoading] = useState(!initialCache)
  const [isPending, startTransition] = useTransition()
  const [participants, setParticipants] = useState<ParticipantCard[]>(() => initialMapped?.mapped || [])
  const [competitions, setCompetitions] = useState<any[]>(() => initialMapped?.cList || [])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | GreenRoomStatus>("all")
  const [selectedCompetition, setSelectedCompetition] = useState<string>("all")
  const [callingCandidate, setCallingCandidate] = useState<string | null>(null)

  const loadData = () => {
    fetchWorkspaceWithSWR(festivalId, "green-room", (data) => {
      const { mapped, cList } = mapGreenRoomData(data)
      setParticipants(mapped)
      setCompetitions(cList)
    })
      .catch((err) => toast.error(err.message || "Failed to load green room candidates"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (festivalId) loadData()
  }, [festivalId])

  const updateStatus = async (id: string, newStatus: GreenRoomStatus) => {
    const existing = participants.find((p) => p.id === id)
    const nowTime =
      newStatus === "waiting"
        ? undefined
        : existing?.reportedTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const nextCodeLetter =
      existing?.codeLetter ||
      (newStatus === "waiting" ? undefined : CODE_LETTERS[Math.max(0, participants.findIndex((p) => p.id === id)) % CODE_LETTERS.length])

    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        return {
          ...p,
          greenRoomStatus: newStatus,
          reportedTime: nowTime,
          codeLetter: nextCodeLetter,
        }
      })
    )

    try {
      const res = await fetch(`/api/festival/${festivalId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_green_room",
          payload: {
            participantId: id,
            status: newStatus,
            codeLetter: nextCodeLetter,
            reportedTime: nowTime,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status")
      }
      toast.success(`Candidate status updated: ${newStatus.replace(/_/g, " ").toUpperCase()}`)
    } catch (err: any) {
      toast.error(err?.message || "Failed to save green room status")
      loadData()
    }
  }

  const callCandidateAudio = (p: ParticipantCard) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const now = audioCtx.currentTime
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(659.25, now) // E5 tone
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start(now)
      osc.stop(now + 1.2)
    } catch {}
    setCallingCandidate(p.chestNumber)
    toast.info(`Calling Chest #${p.chestNumber} (${p.name}) to stage!`, {
      icon: <Volume2 className="h-4 w-4 text-indigo-400" />,
    })
    setTimeout(() => setCallingCandidate(null), 4000)
  }

  const filtered = participants.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.chestNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.team.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || p.greenRoomStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const counts = {
    total: participants.length,
    waiting: participants.filter((p) => p.greenRoomStatus === "waiting").length,
    reported: participants.filter((p) => p.greenRoomStatus === "reported").length,
    ready: participants.filter((p) => p.greenRoomStatus === "ready_for_stage").length,
    onStage: participants.filter((p) => p.greenRoomStatus === "on_stage").length,
    completed: participants.filter((p) => p.greenRoomStatus === "completed").length,
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <DoorOpen className="h-4 w-4" />
            <span>Green Room &amp; Candidate Call Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Green Room Console
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Verify contestant reporting, draw blind code-letters, call next performers &amp; dispatch to active stages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-all cursor-pointer bg-white shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Desk</span>
          </button>
          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/stage-desk`}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>Stage Desk</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ── ACTIVE CALLER BANNER ── */}
      {callingCandidate && (
        <div className="p-4 rounded-2xl bg-indigo-600 text-white flex items-center justify-between gap-3 shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <Volume2 className="h-6 w-6 shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-200">
                Live Green Room Call
              </div>
              <div className="text-base font-black">
                Chest #{callingCandidate} is being summoned to the Main Stage!
              </div>
            </div>
          </div>
          <button
            onClick={() => setCallingCandidate(null)}
            className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── STATUS QUEUE PIPELINE COUNTERS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setStatusFilter("waiting")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "waiting"
              ? "border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-400"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Waiting to Report
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {counts.waiting}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("reported")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "reported"
              ? "border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-400"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Reported / Checked In
          </div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {counts.reported}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("ready_for_stage")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "ready_for_stage"
              ? "border-indigo-500 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-400"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Ready for Stage
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {counts.ready}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("on_stage")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "on_stage"
              ? "border-emerald-500 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-400"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>On Stage Now</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {counts.onStage}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("completed")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "completed"
              ? "border-slate-400 bg-slate-100 shadow-xs ring-1 ring-slate-400"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Completed
          </div>
          <div className="text-2xl font-black text-slate-700 mt-1">
            {counts.completed}
          </div>
        </button>
      </div>

      {/* ── SEARCH & FILTERS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search chest #, name, or team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              Clear filter ({counts.total} total)
            </button>
          )}
        </div>
      </div>

      {/* ── PARTICIPANTS QUEUE CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl border border-slate-200 bg-white text-slate-400">
            <Users className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <div className="text-sm font-bold text-slate-700">No candidates match this filter</div>
            <div className="text-xs mt-0.5 text-slate-400">Check spelling or select a different queue status.</div>
          </div>
        ) : (
          filtered.map((p) => {
            const isOnStage = p.greenRoomStatus === "on_stage"
            const isReady = p.greenRoomStatus === "ready_for_stage"
            const isReported = p.greenRoomStatus === "reported"

            return (
              <div
                key={p.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isOnStage
                    ? "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/30"
                    : isReady
                    ? "border-indigo-300 bg-indigo-50/30"
                    : "border-slate-200 bg-white"
                } shadow-xs space-y-3.5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono font-black text-xs">
                      #{p.chestNumber}
                    </span>
                    {p.codeLetter && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-black text-xs border border-indigo-200">
                        Code: {p.codeLetter}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isOnStage
                        ? "bg-emerald-600 text-white"
                        : isReady
                        ? "bg-indigo-600 text-white"
                        : isReported
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {p.greenRoomStatus.replace(/_/g, " ")}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                    <span>{p.team}</span>
                    <span>•</span>
                    <span>{p.category}</span>
                  </div>
                </div>

                {p.reportedTime && (
                  <div className="text-[11px] text-slate-400 font-medium">
                    Reported at: <span className="font-bold text-slate-600">{p.reportedTime}</span>
                  </div>
                )}

                {/* Status action buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => callCandidateAudio(p)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Call candidate to stage"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Audio Call</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {!isReported && p.greenRoomStatus === "waiting" && (
                      <button
                        onClick={() => updateStatus(p.id, "reported")}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        Check In
                      </button>
                    )}
                    {isReported && (
                      <button
                        onClick={() => updateStatus(p.id, "ready_for_stage")}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        Ready
                      </button>
                    )}
                    {isReady && (
                      <button
                        onClick={() => updateStatus(p.id, "on_stage")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        To Stage
                      </button>
                    )}
                    {isOnStage && (
                      <button
                        onClick={() => updateStatus(p.id, "completed")}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer transition-colors"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
