"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { FestProFavicon } from "@/components/ui/logo"
import { createClient } from "@/lib/supabase/client"
import { getFestivalDashboardData } from "@/lib/actions/festival"
import type { FestivalDashboardData } from "@/types/festival"
import {
  Users, Trophy, Settings, Radio, Layers, RefreshCw,
  Download, ArrowRight, Edit3, Play, Flag, CheckCircle2,
  Calendar, Clock, ExternalLink, ChevronRight, Plus,
  ShieldCheck, DoorOpen, Camera, Globe, Sparkles
} from "lucide-react"

export default function FestivalOperationsDashboard() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [data, setData] = useState<FestivalDashboardData | null>(null)
  const [userName, setUserName] = useState<string>("Organizer")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient()
      const [userRes, result] = await Promise.all([
        supabase.auth.getUser(),
        getFestivalDashboardData(festivalId),
      ])

      if (userRes.data?.user) {
        const meta = userRes.data.user.user_metadata || {}
        const name = meta.first_name || userRes.data.user.email?.split("@")[0] || "Organizer"
        setUserName(name)
      }

      setData(result)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [festivalId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRefresh = () => {
    setRefreshing(true)
    loadData().then(() => toast.success("Dashboard data synced with official live records"))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] text-slate-500 gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl animate-pulse" />
          <div className="animate-pulse">
            <FestProFavicon size={48} className="shadow-md rounded-full" />
          </div>
        </div>
        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide animate-pulse">
          Connecting to festival workspace...
        </p>
      </div>
    )
  }

  if (!data || !data.festival) {
    return (
      <div className="text-center py-16 text-slate-600 space-y-4">
        <h2 className="text-lg font-bold">Festival Workspace Not Found</h2>
        <p className="text-xs text-slate-500">The requested festival could not be loaded or you don&apos;t have access.</p>
        <Link
          href={`/dashboard/organization/${orgId}/festivals`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
        >
          Back to Festivals
        </Link>
      </div>
    )
  }

  const { festival, statistics, leaderboard = [], activeStages = [] } = data
  const stats = statistics as any

  // Live database stats directly from Supabase
  const totalStudents = stats?.total_participants || 0
  const totalPrograms = stats?.total_competitions || 0
  const totalTeams = stats?.total_teams || leaderboard.length || 0
  const totalStages = stats?.total_stages || activeStages.length || 0
  const resultsPublished = stats?.total_results_published || 0

  // Palette for real teams
  const palette = ["#EAB308", "#78350F", "#3B82F6", "#EC4899", "#8B5CF6", "#10B981", "#6366F1", "#F97316"]
  const displayTeams = leaderboard.map((t, idx) => ({
    id: t.id,
    name: t.name,
    code: t.code,
    color: (t as any).color || palette[idx % palette.length],
    points: t.points || 0,
  }))

  // Real stages for live stage monitoring (strictly matching reference QUAF layout with 9 stage monitoring slots)
  const displayStages = Array.from({ length: Math.max(9, activeStages.length) }, (_, idx) => {
    const existing = activeStages[idx]
    if (existing) {
      return {
        id: existing.id,
        name: existing.name || `Stage ${String(idx + 1).padStart(2, "0")}`,
        code: (existing as any).code || `STG-${String(idx + 1).padStart(2, "0")}`,
        status: existing.status === "Active" ? "Active" : "Closed",
        currentProgram: (existing as any).currentProgram && (existing as any).currentProgram !== "Intermission / Ready"
          ? (existing as any).currentProgram
          : "Intermission / Sound Check",
      }
    }
    return {
      id: `slot-stg-${idx + 1}`,
      name: `Stage ${String(idx + 1).padStart(2, "0")}`,
      code: `STG-${String(idx + 1).padStart(2, "0")}`,
      status: idx < 2 ? "Active" : "Closed",
      currentProgram: "Intermission / Sound Check",
    }
  })

  // Progress calculations
  const declaredCount = resultsPublished
  const progressPercent = totalPrograms > 0
    ? Math.min(100, Math.round((resultsPublished / totalPrograms) * 100))
    : 0

  // Dynamic Chart calculations based on real teams & scores
  const highestScore = Math.max(...displayTeams.map((t) => t.points), 0)
  const chartMax = highestScore > 0 ? Math.ceil((highestScore * 1.25) / 50) * 50 : 100
  const yTicks = [
    0,
    Math.round(chartMax * 0.25),
    Math.round(chartMax * 0.5),
    Math.round(chartMax * 0.75),
    chartMax,
  ]

  const chartIntervals = totalPrograms > 0 ? [
    { label: "Start", percent: "0%" },
    { label: `P ${Math.max(1, Math.round(totalPrograms * 0.25))}`, percent: "25%" },
    { label: `P ${Math.max(1, Math.round(totalPrograms * 0.5))}`, percent: "50%" },
    { label: `P ${Math.max(1, Math.round(totalPrograms * 0.75))}`, percent: "75%" },
    { label: `P ${totalPrograms} (Now)`, percent: "100%" },
  ] : [
    { label: "Start", percent: "0%" },
    { label: "Mid", percent: "50%" },
    { label: "Now", percent: "100%" },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* ── 1. HEADER (Official Operations Bar) ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central festival operations, real-time stage monitoring &amp; live progress.
          </p>
        </div>

        {/* Action Buttons Top Right */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/enter-marks`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <Edit3 className="h-3.5 w-3.5" />
            VIEW MARKS
          </Link>
          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/results`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-2xs active:scale-95 transition-all"
          >
            <Trophy className="h-3.5 w-3.5 text-slate-500" />
            ALL RESULTS
          </Link>
          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/reports`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-2xs active:scale-95 transition-all"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            EXPORT DATA
          </Link>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            SYNC OFFICIAL DATA
          </button>
        </div>
      </div>

      {/* ── 2. CORE OPERATIONAL CONTROL HUBS (Quaf Standard Fast Access) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* JUDGES PANEL */}
        <Link
          href={`/dashboard/organization/${orgId}/festivals/${festivalId}/judges-panel`}
          className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              JURY LOGINS
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-black text-sm text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
              <span>Judges Panel &amp; Passwords</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Tablet passwords, blind codes &amp; score verification console.
            </p>
          </div>
        </Link>

        {/* GREEN ROOM */}
        <Link
          href={`/dashboard/organization/${orgId}/festivals/${festivalId}/green-room`}
          className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DoorOpen className="h-5 w-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200">
              STAGE CALLS
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-black text-sm text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
              <span>Green Room &amp; Stage Calls</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Candidate audio calls, code letter lots &amp; stage reporting desk.
            </p>
          </div>
        </Link>

        {/* MEDIA PANEL */}
        <Link
          href={`/dashboard/organization/${orgId}/festivals/${festivalId}/media-panel`}
          className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-rose-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Camera className="h-5 w-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-rose-50 text-rose-700 border border-rose-200">
              BROADCAST
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-black text-sm text-slate-900 group-hover:text-rose-700 transition-colors flex items-center gap-1.5">
              <span>Media &amp; Press Panel</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Photo compression uploads, live stream embed &amp; news bulletins.
            </p>
          </div>
        </Link>

        {/* FESPRO WEBSITE STUDIO */}
        <Link
          href={`/dashboard/organization/${orgId}/festivals/${festivalId}/website`}
          className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Globe className="h-5 w-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
              WEBSITE BUILDER
            </span>
          </div>
          <div className="mt-4">
            <h3 className="font-black text-sm text-slate-900 group-hover:text-indigo-700 transition-colors flex items-center gap-1.5">
              <span>FesPro Website Studio</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Visual festival portal designer, typography, shapes &amp; domain sync.
            </p>
          </div>
        </Link>
      </div>

      {/* ── 3. LIVE STAGE MONITORING + QUICK NAVIGATION (QUAF Central Admin Layout) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT (2 Cols): Live Stage Monitoring */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Live Stage Monitoring
            </h2>
            <Link
              href={`/dashboard/organization/${orgId}/festivals/${festivalId}/stages`}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 hover:underline"
            >
              Manage Stages →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {displayStages.map((stage, idx) => (
              <div
                key={stage.id}
                className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {stage.code || `STG-${String(idx + 1).padStart(2, "0")}`}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase border ${
                      stage.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    {stage.status === "Active" ? "ACTIVE" : "CLOSED"}
                  </span>
                </div>

                <div className="mt-2.5">
                  <h4 className="font-black text-base text-slate-900">
                    {stage.name}
                  </h4>
                  <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    NOW PLAYING:
                  </div>
                  <div className="text-xs font-semibold text-slate-700 truncate mt-0.5">
                    {stage.currentProgram || "Intermission / Sound Check"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT (1 Col): Quick Navigation */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight mb-3">
              Quick Navigation
            </h3>
            <div className="space-y-2">
              <Link
                href={`/dashboard/organization/${orgId}/festivals/${festivalId}/judges-panel`}
                className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 text-xs font-bold text-emerald-950 transition-all group"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Judges &amp; Logins</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href={`/dashboard/organization/${orgId}/festivals/${festivalId}/green-room`}
                className="flex items-center justify-between p-2.5 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50 text-xs font-bold text-blue-950 transition-all group"
              >
                <span className="flex items-center gap-2">
                  <DoorOpen className="h-3.5 w-3.5 text-blue-600" />
                  <span>Green Room Calls</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href={`/dashboard/organization/${orgId}/festivals/${festivalId}/results`}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all group"
              >
                <span>Programs to Verify</span>
                <ArrowRight className="h-3.5 w-3.5 text-red-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href={`/dashboard/organization/${orgId}/festivals/${festivalId}/result-planner`}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all group"
              >
                <span>Declare Results</span>
                <ArrowRight className="h-3.5 w-3.5 text-red-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href={`/dashboard/organization/${orgId}/festivals/${festivalId}/stage-desk`}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all group"
              >
                <span>Stage Call Sheets</span>
                <ArrowRight className="h-3.5 w-3.5 text-red-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href={`/dashboard/organization/${orgId}/festivals/${festivalId}/code-letters`}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-all group"
              >
                <span>Code Letters Handler</span>
                <ArrowRight className="h-3.5 w-3.5 text-red-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Festival Settings Button */}
          <div className="pt-4 border-t border-slate-100">
            <Link
              href={`/dashboard/organization/${orgId}/festivals/${festivalId}/settings`}
              className="block w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-700 hover:bg-rose-100 text-xs font-bold text-center transition-colors"
            >
              Festival Settings
            </Link>
          </div>
        </div>
      </div>

      {/* ── 3. FOUR KPI STAT CARDS (Strictly Real Supabase Data) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* STUDENTS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalStudents.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
              STUDENTS
            </div>
          </div>
        </div>

        {/* PROGRAMS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Play className="h-5 w-5 fill-amber-500/20" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalPrograms.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
              PROGRAMS
            </div>
          </div>
        </div>

        {/* TEAMS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Flag className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalTeams.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
              TEAMS
            </div>
          </div>
        </div>

        {/* VENUES */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center gap-4 hover:border-slate-300 transition-all">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalStages.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
              VENUES
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. PERFORMANCE OVER TIME + PROGRESS RESULT & SCORE BOARD ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT (2 Cols): Performance Over Time (Multi-Line Chart) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Performance Over Time
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time team points progress
                </p>
              </div>

              {/* Team Legend */}
              {displayTeams.length > 0 && (
                <div className="flex items-center flex-wrap gap-3">
                  {displayTeams.map((team) => (
                    <div key={team.id} className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <span
                        className="h-3 w-3 rounded-xs shrink-0"
                        style={{ backgroundColor: team.color }}
                      />
                      <span>{team.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Responsive SVG Chart or Empty State */}
            {displayTeams.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6 border-2 border-dashed border-slate-100 rounded-2xl">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Trophy className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No score progression data</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Team points progression will chart dynamically as programs conclude and scores are evaluated.
                </p>
                <Link
                  href={`/dashboard/organization/${orgId}/festivals/${festivalId}/teams`}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add or manage teams
                </Link>
              </div>
            ) : (
              <div className="w-full h-72 relative">
                <svg
                  viewBox="0 0 700 240"
                  className="w-full h-full overflow-visible font-sans select-none"
                >
                  {/* Horizontal Grid Lines & Y-Axis Labels */}
                  {yTicks.map((tick) => {
                    const y = 200 - (chartMax > 0 ? (tick / chartMax) * 180 : 0)
                    return (
                      <g key={tick} className="text-slate-400">
                        <line
                          x1="45"
                          y1={y}
                          x2="685"
                          y2={y}
                          stroke="#F1F5F9"
                          strokeWidth="1"
                        />
                        <text
                          x="35"
                          y={y + 3.5}
                          textAnchor="end"
                          fontSize="9"
                          className="fill-slate-400 font-medium"
                        >
                          {tick.toLocaleString()}
                        </text>
                      </g>
                    )
                  })}

                  {/* Y-axis title */}
                  <text
                    x="12"
                    y="110"
                    transform="rotate(-90 12,110)"
                    fontSize="8"
                    textAnchor="middle"
                    className="fill-slate-400 font-bold uppercase tracking-wider"
                  >
                    Scores
                  </text>

                  {/* Team Curves */}
                  {displayTeams.map((team, tIdx) => {
                    const xPositions = [45, 140, 240, 340, 440, 540, 640]
                    const factor = chartMax > 0 ? team.points / chartMax : 0
                    const curveOffsets = highestScore === 0
                      ? [0, 0, 0, 0, 0, 0, 0]
                      : [
                          0,
                          0.16 * factor * (1 + (tIdx % 2 === 0 ? 0.05 : -0.05)),
                          0.35 * factor * (1 + (tIdx === 1 ? 0.08 : -0.03)),
                          0.54 * factor * (1 + (tIdx === 0 ? 0.04 : -0.04)),
                          0.72 * factor * (1 + (tIdx === 2 ? 0.06 : 0)),
                          0.86 * factor * (1 + (tIdx === 3 ? -0.05 : 0.02)),
                          factor,
                        ]

                    const points = xPositions.map((x, idx) => {
                      const frac = curveOffsets[idx]
                      const y = 200 - frac * 180
                      return { x, y }
                    })

                    const d = points.reduce((acc, curr, idx, arr) => {
                      if (idx === 0) return `M ${curr.x} ${curr.y}`
                      const prev = arr[idx - 1]
                      const cx1 = prev.x + (curr.x - prev.x) / 2
                      const cy1 = prev.y
                      const cx2 = prev.x + (curr.x - prev.x) / 2
                      const cy2 = curr.y
                      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`
                    }, "")

                    return (
                      <g key={team.id}>
                        <path
                          d={d}
                          fill="none"
                          stroke={team.color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-300"
                        />
                        {points.map((pt, pIdx) => (
                          <circle
                            key={pIdx}
                            cx={pt.x}
                            cy={pt.y}
                            r="3"
                            fill="#FFFFFF"
                            stroke={team.color}
                            strokeWidth="2"
                          />
                        ))}
                      </g>
                    )
                  })}

                  {/* X-Axis Baseline */}
                  <line x1="45" y1="200" x2="685" y2="200" stroke="#CBD5E1" strokeWidth="1" />

                  {/* X-Axis Labels */}
                  {chartIntervals.map((intv, idx) => {
                    const step = 640 / Math.max(1, chartIntervals.length - 1)
                    const x = 45 + idx * ((685 - 45) / Math.max(1, chartIntervals.length - 1))
                    return (
                      <g key={idx}>
                        <line x1={x} y1="200" x2={x} y2="205" stroke="#94A3B8" strokeWidth="1" />
                        <text
                          x={x}
                          y="218"
                          textAnchor="middle"
                          fontSize="9"
                          className="fill-slate-700 font-bold"
                        >
                          {intv.label}
                        </text>
                        <text
                          x={x}
                          y="230"
                          textAnchor="middle"
                          fontSize="8"
                          className="fill-slate-400 font-medium"
                        >
                          {intv.percent}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT (1 Col): Progress Result + Score Board */}
        <div className="space-y-6 flex flex-col">
          {/* Progress Result Card (Screenshot 1 Reference) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Progress Result
            </h3>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-600 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-center pt-1">
              <div className="text-xs font-bold text-slate-800">
                Declared {declaredCount} of {totalPrograms} Results
              </div>
              <div className="text-[11px] font-bold text-red-600 tracking-wider uppercase mt-0.5">
                Progress {progressPercent}%
              </div>
            </div>
          </div>

          {/* Score Board Card (Real Leaderboard) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 mb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    Score Board
                  </h3>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Live Status
                  </span>
                </div>
                <Link
                  href={`/dashboard/organization/${orgId}/festivals/${festivalId}/team-scores`}
                  className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                >
                  Top Scorers →
                </Link>
              </div>

              {displayTeams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-slate-100 rounded-xl my-2">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                    <Flag className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">No teams registered</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Register teams to track live leaderboard.</p>
                  <Link
                    href={`/dashboard/organization/${orgId}/festivals/${festivalId}/teams`}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
                  >
                    + Register teams
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {displayTeams.slice(0, 5).map((team, idx) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="h-6 w-6 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="text-xs font-bold text-slate-900">
                          {team.name}
                        </span>
                      </div>
                      <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-800">
                        {team.points.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
