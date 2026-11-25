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
import { getParticipants } from "@/lib/actions/participant"
import { getCompetitions } from "@/lib/actions/competition"

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

  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [participants, setParticipants] = useState<ParticipantCard[]>([])
  const [competitions, setCompetitions] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | GreenRoomStatus>("all")
  const [selectedCompetition, setSelectedCompetition] = useState<string>("all")
  const [callingCandidate, setCallingCandidate] = useState<string | null>(null)

  const loadData = () => {
    setLoading(true)
    Promise.all([
      getParticipants(festivalId, { limit: 100 }),
      getCompetitions(festivalId),
    ])
      .then(([pRes, cRes]) => {
        if (pRes?.data) {
          const mapped: ParticipantCard[] = pRes.data.map((p: any, idx: number) => ({
            id: p.id,
            name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || `Contestant ${idx + 1}`,
            chestNumber: p.chest_number || `P${String(idx + 1).padStart(3, "0")}`,
            team: p.unit || "Team Alpha",
            category: p.division || "General",
            codeLetter: idx < 8 ? CODE_LETTERS[idx % CODE_LETTERS.length] : undefined,
            greenRoomStatus: idx === 0 ? "on_stage" : idx < 3 ? "ready_for_stage" : idx < 6 ? "reported" : "waiting",
            reportedTime: idx < 6 ? "09:30 AM" : undefined,
          }))
          setParticipants(mapped)
        }
        if (Array.isArray(cRes)) setCompetitions(cRes)
      })
      .catch((err) => toast.error(err.message || "Failed to load green room candidates"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (festivalId) loadData()
  }, [festivalId])

  const updateStatus = (id: string, newStatus: GreenRoomStatus) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        return {
          ...p,
          greenRoomStatus: newStatus,
          reportedTime: p.reportedTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          codeLetter: p.codeLetter || CODE_LETTERS[Math.floor(Math.random() * CODE_LETTERS.length)],
        }
      })
    )
    toast.success(`Candidate status updated: ${newStatus.replace(/_/g, " ").toUpperCase()}`)
  }

  const callCandidateAudio = (p: ParticipantCard) => {
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <DoorOpen className="h-4 w-4" />
            <span>Green Room &amp; Candidate Call Desk</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Green Room Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verify contestant reporting, draw blind code-letters, call next performers &amp; dispatch to active stages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Desk</span>
          </button>
          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/stage-desk`}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>Stage Desk</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Active Caller Banner */}
      {callingCandidate && (
        <div className="p-4 rounded-2xl bg-indigo-600 text-white flex items-center justify-between gap-3 shadow-lg animate-pulse">
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

      {/* Status Queue Pipeline Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setStatusFilter("waiting")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "waiting"
              ? "border-amber-500 bg-amber-500/10 shadow-xs"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Waiting to Report
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {counts.waiting}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("reported")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "reported"
              ? "border-blue-500 bg-blue-500/10 shadow-xs"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Reported / Checked In
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {counts.reported}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("ready_for_stage")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "ready_for_stage"
              ? "border-indigo-500 bg-indigo-500/10 shadow-xs"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Ready for Stage
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {counts.ready}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("on_stage")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "on_stage"
              ? "border-emerald-500 bg-emerald-500/10 shadow-xs"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>On Stage Now</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {counts.onStage}
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("completed")}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === "completed"
              ? "border-slate-500 bg-slate-500/10 shadow-xs"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Completed
          </div>
          <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
            {counts.completed}
          </div>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search chest #, name, or team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Clear filter ({counts.total} total)
            </button>
          )}
        </div>
      </div>

      {/* Participants Queue List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400">
            <Users className="h-10 w-10 mx-auto text-slate-400/50 mb-2" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">No candidates match this filter</div>
            <div className="text-xs mt-0.5">Check spelling or select a different queue status.</div>
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
                    ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20"
                    : isReady
                    ? "border-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                } shadow-xs space-y-3.5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono font-black text-xs">
                      #{p.chestNumber}
                    </span>
                    {p.codeLetter && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-xs border border-indigo-200 dark:border-indigo-800">
                        Code: {p.codeLetter}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isOnStage
                        ? "bg-emerald-500 text-white"
                        : isReady
                        ? "bg-indigo-500 text-white"
                        : isReported
                        ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {p.greenRoomStatus.replace(/_/g, " ")}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                    {p.name}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 truncate">
                    <span>{p.team}</span>
                    <span>•</span>
                    <span>{p.category}</span>
                  </div>
                </div>

                {p.reportedTime && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>Reported at {p.reportedTime}</span>
                  </div>
                )}

                {/* Queue Transitions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    onClick={() => callCandidateAudio(p)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs cursor-pointer"
                    title="Audio Chime / Call"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5 ml-auto">
                    {p.greenRoomStatus === "waiting" && (
                      <button
                        onClick={() => updateStatus(p.id, "reported")}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Check In
                      </button>
                    )}
                    {p.greenRoomStatus === "reported" && (
                      <button
                        onClick={() => updateStatus(p.id, "ready_for_stage")}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Ready for Stage
                      </button>
                    )}
                    {p.greenRoomStatus === "ready_for_stage" && (
                      <button
                        onClick={() => updateStatus(p.id, "on_stage")}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Send to Stage
                      </button>
                    )}
                    {p.greenRoomStatus === "on_stage" && (
                      <button
                        onClick={() => updateStatus(p.id, "completed")}
                        className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold cursor-pointer"
                      >
                        Mark Completed
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
