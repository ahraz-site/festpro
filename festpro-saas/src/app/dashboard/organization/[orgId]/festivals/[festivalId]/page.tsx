"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getFestivalDashboardData } from "@/lib/actions/festival"
import { FESTIVAL_STATUSES } from "@/config/festival"
import type { FestivalDashboardData } from "@/types/festival"
import {
  Users, Trophy, MapPin, Settings, LayoutGrid, CalendarDays,
  Shield, Layers, Sparkles, ChevronDown, ChevronUp, Plus, ArrowRight,
  Radio, Tv, Award, FileText, QrCode, Printer, Star, Globe, Clock,
  CheckCircle2, CheckSquare, Bookmark, BarChart3, Image
} from "lucide-react"

export default function FestivalDashboardPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [data, setData] = useState<FestivalDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(true)

  useEffect(() => {
    async function load() {
      const result = await getFestivalDashboardData(festivalId)
      setData(result as unknown as FestivalDashboardData)
      setLoading(false)
    }
    load()
  }, [festivalId])

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (!data) return <div className="text-center py-12 text-gray-500">Festival not found.</div>

  const stats = data.statistics as any
  const totalTeams = stats?.total_teams || 0
  const totalParticipants = stats?.total_participants || 0
  const totalPrograms = stats?.total_competitions || 0
  const totalStages = stats?.total_stages || 0

  // Calculate setup steps progress
  const step1Done = totalTeams > 0 || totalParticipants > 0
  const step2Done = totalPrograms > 0
  const step3Done = totalStages > 0
  const completedStepsCount = [step1Done, step2Done, step3Done].filter(Boolean).length
  const progressPercent = Math.round((completedStepsCount / 3) * 100)

  // 23 Festize-style Tools Grid
  const tools = [
    { label: "People & access", href: `/dashboard/organization/${orgId}/members`, icon: Shield },
    { label: "Teams", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/teams`, icon: Users },
    { label: "Participants", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/participants`, icon: Bookmark },
    { label: "Categories", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/categories`, icon: Layers },
    { label: "Programs", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/competitions`, icon: Trophy },
    { label: "Live programs", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/results/publish`, icon: Radio },
    { label: "Stages", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/stages`, icon: LayoutGrid },
    { label: "Stage desk", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/venues`, icon: Tv },
    { label: "Scheduler", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/schedules`, icon: Clock },
    { label: "My judging", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/results/grades`, icon: Star },
    { label: "Enter Marks", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/results/publish`, icon: FileText },
    { label: "Team scores", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/results/team-points`, icon: BarChart3 },
    { label: "Grade points", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/results/grades`, icon: Award },
    { label: "ID card setup", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/participants/qr`, icon: QrCode },
    { label: "Reports & printouts", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/documents`, icon: Printer },
    { label: "Code letters", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/results/publish`, icon: CheckSquare },
    { label: "Results", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/results/rankings`, icon: Trophy },
    { label: "Published team scores", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/results/publications`, icon: BarChart3 },
    { label: "Poster templates", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/gallery`, icon: Image },
    { label: "Settings", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/settings`, icon: Settings },
    { label: "Top candidates", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/results/rankings`, icon: Star },
    { label: "Public page", href: `/festivals/${festivalId}`, icon: Globe },
  ]

  return (
    <div className="space-y-8 bg-[#FAFAF4] p-4 sm:p-6 rounded-2xl min-h-screen">
      {/* Header Title Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#E7E5D9] pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#7A8A85]">Fest dashboard</span>
          <h1 className="text-3xl font-bold text-[#132E29]">Let&apos;s get {data.festival.name} ready</h1>
          <p className="text-sm text-[#5C6B66]">Start with the next step below.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/festivals/${festivalId}`} target="_blank" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E7E5D9] text-[#132E29] hover:bg-[#F5F4EC] transition-all shadow-xs">
            <Globe className="h-4 w-4" /> View Public Page
          </Link>
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/settings`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#132E29] text-white hover:bg-[#1C453E] transition-all shadow-xs">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </div>
      </div>

      {/* Fest Setup Onboarding Wizard Card */}
      <div className="bg-white border border-[#E7E5D9] rounded-2xl shadow-xs overflow-hidden transition-all">
        <div className="p-5 sm:p-6 border-b border-[#F0EEE4] flex items-center justify-between bg-[#FCFCF8]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#132E29]">Fest setup</span>
            <h2 className="text-xl font-bold text-[#132E29] mt-0.5">Get ready for event day</h2>
            <p className="text-xs text-[#7A8A85]">Add the people, programs, and event-day details your fest needs.</p>
          </div>
          <button
            onClick={() => setShowWizard(!showWizard)}
            className="flex items-center gap-1 text-xs font-semibold text-[#5C6B66] hover:text-[#132E29] px-3 py-1.5 rounded-lg hover:bg-[#F5F4EC]"
          >
            <span>{showWizard ? "Show less" : "Show setup steps"}</span>
            {showWizard ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {showWizard && (
          <div className="p-5 sm:p-6 space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-[#132E29]">
                <span>{completedStepsCount} of 3 setup steps complete</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-[#EFECE1] rounded-full overflow-hidden">
                <div className="h-full bg-[#132E29] transition-all duration-500 rounded-full" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Steps List */}
            <div className="space-y-4 divide-y divide-[#F0EEE4]">
              {/* Step 1: Add People */}
              <div className="pt-4 first:pt-0 flex items-start gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${step1Done ? "bg-emerald-100 text-emerald-800" : "bg-[#F5F4EC] text-[#132E29]"}`}>
                  {step1Done ? <CheckCircle2 className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-[#132E29]">Add people</h3>
                    <span className="text-xs font-mono text-[#7A8A85]">Step 1</span>
                  </div>
                  <p className="text-xs text-[#5C6B66]">Add the teams and participants taking part.</p>
                  <div className="flex items-center gap-3 pt-2">
                    <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/teams`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#132E29] hover:underline">
                      Add teams <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <span className="text-[#7A8A85]">•</span>
                    <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/participants`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#132E29] hover:underline">
                      Add participants <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Step 2: Add Programs */}
              <div className="pt-4 flex items-start gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${step2Done ? "bg-emerald-100 text-emerald-800" : "bg-[#F5F4EC] text-[#132E29]"}`}>
                  {step2Done ? <CheckCircle2 className="h-5 w-5" /> : <Trophy className="h-5 w-5" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-[#132E29]">Add programs</h3>
                    <span className="text-xs font-mono text-[#7A8A85]">Step 2</span>
                  </div>
                  <p className="text-xs text-[#5C6B66]">Add the categories and programs being conducted.</p>
                  <div className="flex items-center gap-3 pt-2">
                    <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/categories`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#132E29] hover:underline">
                      Add categories <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <span className="text-[#7A8A85]">•</span>
                    <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#132E29] hover:underline">
                      Add programs <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Step 3: Prepare Event Day */}
              <div className="pt-4 flex items-start gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${step3Done ? "bg-emerald-100 text-emerald-800" : "bg-[#F5F4EC] text-[#132E29]"}`}>
                  {step3Done ? <CheckCircle2 className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-[#132E29]">Prepare event day</h3>
                    <span className="text-xs font-mono text-[#7A8A85]">Step 3</span>
                  </div>
                  <p className="text-xs text-[#5C6B66]">Add a stage and a judge for your programs.</p>
                  <div className="flex items-center gap-3 pt-2">
                    <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/stages`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#132E29] hover:underline">
                      Add stage <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <span className="text-[#7A8A85]">•</span>
                    <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/schedules`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#132E29] hover:underline">
                      Set schedules <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Your Tools Grid Section (Festize Style) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#132E29]">Your tools</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.label}
                href={tool.href}
                className="flex items-center gap-3.5 p-4 bg-white border border-[#E7E5D9] hover:border-[#132E29] rounded-2xl shadow-2xs hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="h-10 w-10 rounded-xl bg-[#F5F4EC] group-hover:bg-[#132E29] group-hover:text-white text-[#132E29] flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-[#132E29] group-hover:text-[#132E29] truncate">
                  {tool.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
