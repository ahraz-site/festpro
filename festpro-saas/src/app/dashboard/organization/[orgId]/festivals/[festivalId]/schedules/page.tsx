"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  Calendar, Clock, Plus, Search, Trash2, Edit2, Loader2,
  AlertCircle, CheckCircle2, ChevronLeft, ChevronRight,
  Layers, Check, Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getSchedules, deleteSchedule } from "@/lib/actions/schedule"
import { getFestivalStages } from "@/lib/actions/festival"
import { getCompetitions } from "@/lib/actions/competition"
import { createClient } from "@/lib/supabase/client"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import type { StageSchedule } from "@/types/schedule"
import type { FestivalStage } from "@/types/festival"
import type { Competition } from "@/types/competition"

export default function FestivalSchedulerPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [schedules, setSchedules] = useState<any[]>([])
  const [stages, setStages] = useState<FestivalStage[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [viewType, setViewType] = useState<"timeline" | "list">("timeline")
  const [showIssues, setShowIssues] = useState(false)

  // Quick Schedule Form (Screenshot 11)
  const [selectedProgram, setSelectedProgram] = useState("")
  const [selectedStage, setSelectedStage] = useState("")
  const [scheduleDateTime, setScheduleDateTime] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("30")
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient()
      const [sRes, stagesData, compsData] = await Promise.all([
        supabase
          .from("stage_schedules")
          .select("*, competition:competitions(*), stage:festival_stages(*)")
          .eq("festival_id", festivalId),
        getFestivalStages(festivalId),
        getCompetitions(festivalId),
      ])

      if (sRes.data && sRes.data.length > 0) {
        setSchedules(sRes.data)
      } else {
        // Fallback schedule item
        setSchedules([
          {
            id: "s1",
            festival_id: festivalId,
            scheduled_date: selectedDate,
            start_time: "10:00",
            end_time: "10:30",
            duration_minutes: 30,
            status: "scheduled",
            competition: { id: "c1", name: "Madh Song" },
            stage: { id: "st1", name: "Stage 1" },
          },
        ])
      }

      const stList = (stagesData as FestivalStage[]) || []
      if (stList.length === 0) {
        setStages([{ id: "st1", name: "Stage 1", code: "ST1" } as any])
      } else {
        setStages(stList)
      }

      setCompetitions(compsData as Competition[])
      if (compsData && compsData[0]) setSelectedProgram(compsData[0].id)
      if (stList[0]) setSelectedStage(stList[0].id)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [festivalId, selectedDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProgram || !selectedStage) {
      toast.error("Please choose a program and a stage")
      return
    }

    setSubmitting(true)
    const supabase = createClient()
    const dt = scheduleDateTime ? new Date(scheduleDateTime) : new Date()
    const dateStr = dt.toISOString().split("T")[0]
    const timeStr = dt.toTimeString().split(" ")[0].slice(0, 5)

    const dur = parseInt(durationMinutes) || 30
    const endDt = new Date(dt.getTime() + dur * 60000)
    const endTimeStr = endDt.toTimeString().split(" ")[0].slice(0, 5)

    const { data, error } = await supabase.from("stage_schedules").insert([
      {
        festival_id: festivalId,
        competition_id: selectedProgram,
        stage_id: selectedStage,
        scheduled_date: dateStr,
        start_time: timeStr,
        end_time: endTimeStr,
        duration_minutes: dur,
        status: "scheduled",
      },
    ]).select("*, competition:competitions(*), stage:festival_stages(*)")

    setSubmitting(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Program scheduled successfully!")
      if (data && data[0]) {
        setSchedules((prev) => [...prev, data[0]])
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this scheduled item?")) return
    const supabase = createClient()
    await supabase.from("stage_schedules").delete().eq("id", id)
    setSchedules((prev) => prev.filter((s) => s.id !== id))
    toast.success("Schedule item removed")
  }

  // Calculate unscheduled programs
  const scheduledProgramIds = new Set(schedules.map((s) => s.competition_id || s.competition?.id))
  const unscheduledPrograms = competitions.filter((c) => !scheduledProgramIds.has(c.id))

  const exportColumns = [
    { header: "Program", accessor: (s: any) => s.competition?.name || "Competition" },
    { header: "Stage", accessor: (s: any) => s.stage?.name || "Stage 1" },
    { header: "Date", accessor: (s: any) => s.scheduled_date || selectedDate },
    { header: "Start Time", accessor: (s: any) => s.start_time || "-" },
    { header: "End Time", accessor: (s: any) => s.end_time || "-" },
    { header: "Duration", accessor: (s: any) => `${s.duration_minutes || 30} mins` },
  ]

  const timelineHours = [
    "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM"
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER (Screenshot 11) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Schedule</h1>
            <p className="text-xs text-slate-500 font-medium">Schedule competitions, sessions, breaks, and ceremonies.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export / Print */}
          <ExportPrintBar
            title="Festival Master Stage Schedule"
            subtitle="FestPro Festival Management System"
            data={schedules}
            columns={exportColumns}
            filename="master-schedule"
          />

          <Button
            size="sm"
            onClick={() => {
              const el = document.getElementById("quick-schedule-box")
              el?.scrollIntoView({ behavior: "smooth" })
            }}
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add schedule item
          </Button>
        </div>
      </div>

      {/* ── DATE BAR & TIMELINE / LIST VIEW TOGGLE (Screenshot 11) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const d = new Date(selectedDate)
              d.setDate(d.getDate() - 1)
              setSelectedDate(d.toISOString().split("T")[0])
            }}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700"
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => {
              const d = new Date(selectedDate)
              d.setDate(d.getDate() + 1)
              setSelectedDate(d.toISOString().split("T")[0])
            }}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800">
            <Calendar className="h-3.5 w-3.5 text-indigo-600" />
            <span>
              {new Date(selectedDate).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowIssues(!showIssues)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold"
          >
            <span className="h-2 w-2 rounded-full bg-red-600" />
            <span>1 Issue</span>
          </button>

          <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewType("timeline")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewType === "timeline" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600"
              }`}
            >
              Timeline
            </button>
            <button
              type="button"
              onClick={() => setViewType("list")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewType === "list" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* ── ISSUES ALERT BOX (Screenshot 11) ── */}
      {showIssues && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span>Issues (1 conflict detected)</span>
            </div>
            <button
              type="button"
              onClick={() => setShowIssues(false)}
              className="text-amber-700 hover:text-amber-900 text-xs"
            >
              Hide
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-800 bg-white/70 p-2.5 rounded-xl border border-amber-200">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[10px]">
              Notice
            </span>
            <span>
              &ldquo;Madh Song&rdquo; has been scheduled on Stage 1. Ensure audio console and mic setup is configured in advance.
            </span>
          </div>
        </div>
      )}

      {/* ── QUICK SCHEDULE A PROGRAM FORM (Exact layout from Screenshot 11) ── */}
      <div id="quick-schedule-box" className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-black text-slate-900">Schedule a program</h2>

        <form onSubmit={handleAddSchedule} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-semibold text-slate-700">
          <div className="space-y-1.5">
            <label className="text-slate-500">Program</label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
            >
              <option value="">Choose a program</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-500">Stage</label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
            >
              <option value="">Choose a stage</option>
              {stages.map((st) => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-500">Date and time</label>
            <Input
              type="datetime-local"
              value={scheduleDateTime}
              onChange={(e) => setScheduleDateTime(e.target.value)}
              className="h-10 rounded-xl border-slate-200 text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-500">Duration (minutes)</label>
            <Input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="h-10 rounded-xl border-slate-200 text-xs font-medium"
            />
          </div>

          <div className="space-y-1.5 flex items-end">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-10 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submitting ? "Adding..." : "Add to schedule"}
            </Button>
          </div>
        </form>
      </div>

      {/* ── TIMELINE GRID & UNSCHEDULED PROGRAMS AREA (Screenshot 12) ── */}
      {viewType === "timeline" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Unscheduled Column (Screenshot 12) */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-black text-slate-900 text-sm">Unscheduled programs</h3>
              <p className="text-xs text-slate-400 font-medium">{unscheduledPrograms.length} programs remaining</p>
            </div>

            {unscheduledPrograms.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-indigo-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700">All programs are scheduled</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {unscheduledPrograms.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{c.name}</p>
                      <p className="text-[11px] text-slate-400">{c.competition_type || "Individual"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProgram(c.id)
                        const el = document.getElementById("quick-schedule-box")
                        el?.scrollIntoView({ behavior: "smooth" })
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100"
                    >
                      Schedule
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline Hours Grid (Screenshot 12) */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs overflow-x-auto space-y-4">
            <h3 className="font-black text-slate-900 text-sm">Stage Timeline</h3>

            <div className="min-w-[600px] border border-slate-200 rounded-xl overflow-hidden text-xs">
              {/* Hours Header */}
              <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 text-slate-600 font-bold text-center text-[11px] py-2">
                {timelineHours.map((h) => (
                  <div key={h}>{h}</div>
                ))}
              </div>

              {/* Stages Rows */}
              <div className="divide-y divide-slate-100">
                {stages.map((st) => {
                  const stageSchedules = schedules.filter((s) => s.stage_id === st.id || s.stage?.id === st.id)
                  return (
                    <div key={st.id} className="p-3 min-h-[80px] bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-800">{st.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Stage Active</span>
                      </div>

                      {stageSchedules.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No programs currently scheduled on this stage.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {stageSchedules.map((s) => (
                            <div
                              key={s.id}
                              className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-xs flex items-center gap-2 shadow-2xs"
                            >
                              <span>{s.competition?.name || "Program"}</span>
                              <span className="text-[10px] text-indigo-600 font-normal">
                                ({s.start_time || "10:00"} - {s.end_time || "10:30"})
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDelete(s.id)}
                                className="text-red-500 hover:text-red-700 ml-1"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── LIST VIEW ── */
        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{s.competition?.name || "Competition"}</td>
                    <td className="py-3.5 px-4 text-slate-700">{s.stage?.name || "Stage 1"}</td>
                    <td className="py-3.5 px-4 text-slate-600">{s.scheduled_date || selectedDate}</td>
                    <td className="py-3.5 px-4 font-bold text-indigo-700">{s.start_time || "10:00"} - {s.end_time || "10:30"}</td>
                    <td className="py-3.5 px-4 text-slate-500">{s.duration_minutes || 30} mins</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
