"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
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
  Crown, HelpCircle, ExternalLink, RefreshCw, X
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
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        <p className="text-xs font-semibold text-slate-600">Loading your fest dashboard...</p>
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D382E] text-white rounded-xl text-xs font-semibold"
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

  const festSlug = festival.code || festival.short_name || "quaf"
  const publicWebUrl = `https://${festSlug}.festpro.ahraz.site`

  // 30 Tools matching Festize Reference Screenshots
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
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* -- 1. HEADER -- */}
      <div>
        <span className="text-xs font-semibold text-slate-500 block">Fest dashboard</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Welcome, {userName}
        </h1>
      </div>

      {/* -- 2. FEST CAPACITY BANNER (Screenshot 5) -- */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-700">Fest capacity</div>
        <p className="text-xs text-slate-500">Review the remaining space. Contact FestPro if you need more.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Teams limit card */}
          <div className="bg-white rounded-2xl border border-red-200/80 p-3.5 flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="h-4 w-4 rounded-full border border-red-500 text-red-500 flex items-center justify-center text-[10px] font-bold">
                ?
              </div>
              <span className="font-semibold text-slate-900">
                {totalTeams} of 2 teams <span className="text-slate-400 font-normal">� Limit reached</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/contact" className="font-semibold text-slate-700 hover:text-emerald-700 underline">
                Chat with FestPro
              </Link>
              <button
                onClick={handleRefresh}
                className="px-2 py-1 rounded-lg border border-stone-200 text-slate-700 hover:bg-stone-50 font-medium"
              >
                Check again
              </button>
            </div>
          </div>

          {/* Stage limit card */}
          <div className="bg-white rounded-2xl border border-red-200/80 p-3.5 flex items-center justify-between text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="h-4 w-4 rounded-full border border-red-500 text-red-500 flex items-center justify-center text-[10px] font-bold">
                ?
              </div>
              <span className="font-semibold text-slate-900">
                {totalStages} of 1 stage <span className="text-slate-400 font-normal">� Limit reached</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/contact" className="font-semibold text-slate-700 hover:text-emerald-700 underline">
                Chat with FestPro
              </Link>
              <button
                onClick={handleRefresh}
                className="px-2 py-1 rounded-lg border border-stone-200 text-slate-700 hover:bg-stone-50 font-medium"
              >
                Check again
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* -- 3. FEST SETUP CHECKLIST (Screenshot 5) -- */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-800">Fest setup</span>
          <button
            onClick={() => setShowSetup(!showSetup)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-medium"
          >
            {showSetup ? "Show less" : "Show more"}
            {showSetup ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        <h3 className="text-lg font-extrabold text-slate-900 mt-1">Get ready for event day</h3>
        <p className="text-xs text-slate-500 mt-0.5">Add the people, programs, and event-day details your fest needs.</p>

        {showSetup && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>3 of 3 setup steps complete</span>
                <span className="text-emerald-700">100%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full w-full" />
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <Link
                href={`/dashboard/organization/${orgId}/festivals/${festivalId}/participants`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-slate-800">Add people</span>
                </div>
                <span className="text-slate-400 font-medium">Complete</span>
              </Link>

              <Link
                href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-slate-800">Add programs</span>
                </div>
                <span className="text-slate-400 font-medium">Complete</span>
              </Link>

              <Link
                href={`/dashboard/organization/${orgId}/festivals/${festivalId}/stages`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-200"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
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

      {/* -- 4. LIVE OPERATIONS: STAGES (Screenshot 6) -- */}
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
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">Stage 1</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                Started
              </span>
            </div>

            <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3">
              <h4 className="font-bold text-xs text-slate-900">Madh Song</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Senior</p>
            </div>
          </div>
        </div>
      </div>

      {/* -- 5. LIVE OPERATIONS: MISSION CONTROL (Screenshot 6) -- */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Card 1: Going on */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-600 block">Going on</span>
              <div className="text-3xl font-black text-slate-900 mt-1">1</div>
              <p className="text-[11px] text-slate-400 mt-2">Programs that are started now.</p>
            </div>
            <div className="h-8 w-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Radio className="h-4 w-4" />
            </div>
          </div>

          {/* Card 2: Needs attention */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-600 block">Needs attention</span>
              <div className="text-3xl font-black text-slate-900 mt-1">0</div>
              <p className="text-[11px] text-slate-400 mt-2">Programs with a setup or scoring issue.</p>
            </div>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="font-bold text-xs">!</span>
            </div>
          </div>

          {/* Card 3: Waiting for marks */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-600 block">Waiting for marks</span>
              <div className="text-3xl font-black text-slate-900 mt-1">0</div>
              <p className="text-[11px] text-slate-400 mt-2">Valuation is open and marks are missing.</p>
            </div>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>

          {/* Card 4: Marks entered */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-600 block">Marks entered</span>
              <div className="text-3xl font-black text-slate-900 mt-1">0</div>
              <p className="text-[11px] text-slate-400 mt-2">All expected marks are entered.</p>
            </div>
            <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <FileEdit className="h-4 w-4" />
            </div>
          </div>

          {/* Card 5: Results to review */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-600 block">Results to review</span>
              <div className="text-3xl font-black text-slate-900 mt-1">0</div>
              <p className="text-[11px] text-slate-400 mt-2">Draft results are ready for review.</p>
            </div>
            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>

          {/* Card 6: Published */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-600 block">Published</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{resultsPublished}</div>
              <p className="text-[11px] text-slate-400 mt-2">Results that are public.</p>
            </div>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Globe className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* -- 6. QUICK STATS (Screenshot 7) -- */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-600 block">Programs</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalPrograms}</div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-600 block">Participants</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalParticipants}</div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-600 block">Teams</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{totalTeams}</div>
        </div>
      </div>

      {/* -- 7. YOUR TOOLS (Screenshots 7 & 8) -- */}
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
                className="bg-white rounded-2xl border border-stone-200/80 hover:border-emerald-500 hover:shadow-xs transition-all p-3.5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-slate-950 transition-colors">
                    {tool.label}
                  </span>
                </div>
                {tool.isExternal && (
                  <ExternalLink className="h-3.5 w-3.5 text-slate-300 group-hover:text-emerald-600" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
