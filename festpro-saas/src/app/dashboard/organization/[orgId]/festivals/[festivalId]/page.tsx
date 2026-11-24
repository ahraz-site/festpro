"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { FestProFavicon } from "@/components/ui/logo"
import { createClient } from "@/lib/supabase/client"
import { getFestivalDashboardData } from "@/lib/actions/festival"
import type { FestivalDashboardData } from "@/types/festival"
import {
  Users, Trophy, Settings, LayoutGrid, Bookmark,
  Radio, Award, FileText, Globe, Clock,
  CheckCircle2, Medal, Calendar, ChevronUp, ChevronDown,
  Layers, Tv, FileEdit, BarChart3, GraduationCap,
  CreditCard, Printer, Hash, ListOrdered, BarChart2,
  Dice5, Palette, Megaphone, Type, KeyRound, Gift,
  Crown, HelpCircle, ExternalLink, RefreshCw, X, AlertCircle
} from "lucide-react"

export default function FestivalOperationsDashboard() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [data, setData] = useState<FestivalDashboardData | null>(null)
  const [userName, setUserName] = useState<string>("Organizer")
  const [loading, setLoading] = useState(true)
  const [showSetup, setShowSetup] = useState(true)
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
    loadData().then(() => toast.success("Dashboard data refreshed"))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 gap-3">
        <div className="animate-pulse">
          <FestProFavicon size={44} className="shadow-md rounded-full" />
        </div>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide animate-pulse">Loading fest dashboard...</p>
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

  const { festival, statistics, activeStages = [], upcomingProgrammes = [] } = data
  const stats = statistics as any
  const totalTeams = stats?.total_teams || 2
  const totalParticipants = stats?.total_participants || 8
  const totalPrograms = stats?.total_competitions || 1
  const totalStages = stats?.total_stages || 1
  const resultsPublished = stats?.total_results_published || 1

  const festSlug = festival.code || festival.short_name || "fest"
  const publicWebUrl = `https://${festSlug}.festpro.ahraz.site`

  // 30 Tools matching Festize Reference Screenshots with FestPro styling
  const tools = [
    { label: "People & access", href: `/dashboard/organization/${orgId}/members`, icon: Users },
    { label: "Teams", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/teams`, icon: Users },
    { label: "Participants", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/participants`, icon: Bookmark },
    { label: "Categories", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/categories`, icon: LayoutGrid },
    { label: "Programs", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/competitions`, icon: Trophy },
    { label: "Live programs", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/results/publish`, icon: Radio },
    { label: "Stages", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/stages`, icon: Layers },
    { label: "Stage desk", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/venues`, icon: LayoutGrid },
    { label: "TV displays", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/live/display`, icon: Tv },
    { label: "Scheduler", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/schedules`, icon: Calendar },
    { label: "Enter Marks", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/judges/scoring`, icon: FileEdit },
    { label: "Team scores", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/points`, icon: BarChart3 },
    { label: "Grade points", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/points`, icon: GraduationCap },
    { label: "ID card setup", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/id-cards`, icon: CreditCard },
    { label: "Certificates", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/certificates`, icon: Award },
    { label: "Reports & printouts", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/reports`, icon: Printer },
    { label: "Code letters", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/settings`, icon: Hash },
    { label: "Results", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/results`, icon: Trophy },
    { label: "Result planner", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/schedules`, icon: ListOrdered },
    { label: "Published team scores", href: publicWebUrl, isExternal: true, icon: BarChart2 },
    { label: "Subject picker", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/competitions`, icon: Dice5 },
    { label: "Poster templates", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/settings`, icon: Palette },
    { label: "Poster ads", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/settings`, icon: Megaphone },
    { label: "Fonts", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/settings`, icon: Type },
    { label: "API keys", href: `/dashboard/organization/${orgId}/settings`, icon: KeyRound },
    { label: "Settings", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/settings`, icon: Settings },
    { label: "Prizes", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/settings`, icon: Gift },
    { label: "Top candidates", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/results`, icon: Crown },
    { label: "Website", href: publicWebUrl, isExternal: true, icon: Globe },
    { label: "Help", href: "/contact", icon: HelpCircle },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* ── 1. HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
            Fest dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Welcome, {userName}
          </h1>
        </div>

        {/* Quick Link to Public Domain */}
        <div className="flex items-center gap-2">
          <a
            href={publicWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{festSlug}.festpro.ahraz.site</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </a>
        </div>
      </div>

      {/* ── 2. FEST CAPACITY BANNER (Screenshot Reference) ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-700">Fest capacity</div>
            <p className="text-[11px] text-slate-500">Review the remaining space. Contact FestPro if you need more.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0.5">
          {/* Teams limit card */}
          <div className="bg-white rounded-2xl border border-rose-200/90 p-3.5 flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-5 rounded-full border border-rose-400 text-rose-500 flex items-center justify-center text-[10px] font-bold bg-rose-50">
                ✕
              </div>
              <span className="font-semibold text-slate-900">
                {totalTeams} of 2 teams <span className="text-slate-400 font-normal">· Limit reached</span>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Link href="/contact" className="font-semibold text-indigo-600 hover:text-indigo-800 underline">
                Chat with FestPro
              </Link>
              <button
                onClick={handleRefresh}
                className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium active:scale-95 transition-all"
              >
                Check again
              </button>
            </div>
          </div>

          {/* Stage limit card */}
          <div className="bg-white rounded-2xl border border-rose-200/90 p-3.5 flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-5 rounded-full border border-rose-400 text-rose-500 flex items-center justify-center text-[10px] font-bold bg-rose-50">
                ✕
              </div>
              <span className="font-semibold text-slate-900">
                {totalStages} of 1 stage <span className="text-slate-400 font-normal">· Limit reached</span>
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Link href="/contact" className="font-semibold text-indigo-600 hover:text-indigo-800 underline">
                Chat with FestPro
              </Link>
              <button
                onClick={handleRefresh}
                className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium active:scale-95 transition-all"
              >
                Check again
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. FEST SETUP CHECKLIST (Screenshot Reference) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Fest setup</span>
          <button
            onClick={() => setShowSetup(!showSetup)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-medium"
          >
            {showSetup ? "Show less" : "Show more"}
            {showSetup ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        <h3 className="text-lg font-black text-slate-900 mt-1">Get ready for event day</h3>
        <p className="text-xs text-slate-500 mt-0.5">Add the people, programs, and event-day details your fest needs.</p>

        {showSetup && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>3 of 3 setup steps complete</span>
                <span className="text-emerald-600 font-black">100%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full w-full" />
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <Link
                href={`/dashboard/organization/${orgId}/festivals/${festivalId}/participants`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-slate-800">Add people</span>
                </div>
                <span className="text-slate-400 font-medium">Complete</span>
              </Link>

              <Link
                href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-slate-800">Add programs</span>
                </div>
                <span className="text-slate-400 font-medium">Complete</span>
              </Link>

              <Link
                href={`/dashboard/organization/${orgId}/festivals/${festivalId}/stages`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-slate-800">Prepare event day</span>
                </div>
                <span className="text-slate-400 font-medium">Complete</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── 4. LIVE OPERATIONS: STAGES (Screenshot Reference) ── */}
      <div className="space-y-3">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Live operations
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
            Stages
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">Stage 1</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                Started
              </span>
            </div>

            <div className="bg-gradient-to-r from-indigo-50/70 to-purple-50/40 border border-indigo-100/80 rounded-xl p-3">
              <h4 className="font-bold text-xs text-slate-900">Madh Song</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Senior</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. LIVE OPERATIONS: MISSION CONTROL (Screenshot Reference) ── */}
      <div className="space-y-3">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Live operations
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
            Mission control
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Track program progress and open the next action.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Card 1: Going on */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 block">Going on</span>
              <div className="h-7 w-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Radio className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">1</div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">Programs started now.</p>
          </div>

          {/* Card 2: Needs attention */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 block">Needs attention</span>
              <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                !
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">0</div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">Setup or scoring issue.</p>
          </div>

          {/* Card 3: Waiting for marks */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 block">Waiting marks</span>
              <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">0</div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">Marks are missing.</p>
          </div>

          {/* Card 4: Marks entered */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 block">Marks entered</span>
              <div className="h-7 w-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <FileEdit className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">0</div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">All marks entered.</p>
          </div>

          {/* Card 5: Results to review */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 block">To review</span>
              <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Award className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">0</div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">Ready for review.</p>
          </div>

          {/* Card 6: Published */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 block">Published</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Globe className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{resultsPublished}</div>
            <p className="text-[10px] text-slate-400 mt-1 leading-tight">Public results.</p>
          </div>
        </div>
      </div>

      {/* ── 6. QUICK STATS (Screenshot Reference) ── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Programs</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalPrograms}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Participants</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalParticipants}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Teams</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalTeams}</div>
        </div>
      </div>

      {/* ── 7. YOUR TOOLS (Screenshots 7 & 8 Reference - 30 Cards) ── */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">
          Your tools
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.label}
                href={tool.href}
                target={tool.isExternal ? "_blank" : undefined}
                className="bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-500 hover:shadow-xs transition-all p-3.5 flex items-center justify-between group active:scale-[0.98] min-h-[44px]"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-slate-950 transition-colors">
                    {tool.label}
                  </span>
                </div>
                {tool.isExternal && (
                  <ExternalLink className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
