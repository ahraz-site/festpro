"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bookmark,
  Trophy,
  Sliders,
  Monitor,
  Printer,
  Dices,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Gavel,
  Users,
  Megaphone,
  Gift,
  DoorOpen,
  Camera,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getStaffSessionAction, type StaffSession } from "@/lib/actions/staff-auth"
import { getParticipants } from "@/lib/actions/participant"
import { getCompetitions } from "@/lib/actions/competition"

export default function FestDashboardRoot() {
  const router = useRouter()
  const [userName, setUserName] = useState("Sinan")
  const [userRole, setUserRole] = useState("judge")
  const [orgId, setOrgId] = useState("a3b0972c-a447-4934-8d26-3bad6c9a9cc9")
  const [festivalId, setFestivalId] = useState("c66d0281-bc93-4cb8-b94e-e54bf27c7119")
  const [festName, setFestName] = useState("optimuz")
  const [stageProgramsCount, setStageProgramsCount] = useState<number>(1)
  const [participantsCount, setParticipantsCount] = useState<number>(8)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initDashboard() {
      try {
        // 1. Check staff session first
        const staff = await getStaffSessionAction()
        if (staff) {
          setUserName(staff.name || "Staff Member")
          setUserRole(staff.role || "judge")
          if (staff.organizationId) setOrgId(staff.organizationId)
          if (staff.festivalId) setFestivalId(staff.festivalId)
        } else {
          // 2. Check Supabase auth
          const supabase = createClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            const { data: prof } = await supabase
              .from("profiles")
              .select("first_name, last_name, role, organization_id")
              .eq("id", user.id)
              .maybeSingle()

            if (prof?.first_name) {
              setUserName(prof.first_name)
              setUserRole(prof.role || "organization_owner")
            } else {
              setUserName(user.email?.split("@")[0] || "Organizer")
            }
            if (prof?.organization_id) setOrgId(prof.organization_id)
          }
        }

        // 3. Fetch live count of stage programs and participants
        try {
          const effectiveFestId = festivalId || "c66d0281-bc93-4cb8-b94e-e54bf27c7119"
          const [pRes, cRes] = await Promise.all([
            getParticipants(effectiveFestId, { limit: 100 }),
            getCompetitions(effectiveFestId),
          ])

          if (pRes?.data && pRes.data.length > 0) {
            setParticipantsCount(pRes.data.length)
          }
          if (Array.isArray(cRes) && cRes.length > 0) {
            setStageProgramsCount(cRes.length)
          }
        } catch {}
      } catch (err) {
        console.warn("initDashboard notice:", err)
      } finally {
        setLoading(false)
      }
    }
    initDashboard()
  }, [festivalId])

  const festBase = `/dashboard/organization/${orgId}/festivals/${festivalId}`

  // Tools matching Screenshot 1: Festize "Your tools"
  const tools = [
    {
      title: "Participants",
      desc: "Student list, chest numbers & divisions",
      icon: Bookmark,
      href: `${festBase}/participants`,
    },
    {
      title: "Programs",
      desc: "All stage competitions, schedules & rules",
      icon: Trophy,
      href: `${festBase}/competitions`,
    },
    {
      title: "Live programs",
      desc: "Stage status, current calls & queues",
      icon: Sliders,
      href: `${festBase}/live-programs`,
    },
    {
      title: "Stage desk",
      desc: "Live stage caller, timer & audio buzzer",
      icon: Monitor,
      href: `${festBase}/stage-desk`,
    },
    {
      title: "Reports & printouts",
      desc: "Score sheets, tabulation charts & PDF slips",
      icon: Printer,
      href: `${festBase}/reports`,
    },
    {
      title: "Subject picker",
      desc: "Random topic & blind letter draws",
      icon: Dices,
      href: `${festBase}/subject-picker`,
    },
    {
      title: "Help",
      desc: "Jury guidelines, handbook & quick FAQ",
      icon: HelpCircle,
      href: `${festBase}/help`,
    },
  ]

  // Role-specific quick actions
  const roleTools = [
    {
      title: "My judging",
      desc: "Valuation console & jury scoring sheets",
      icon: Gavel,
      href: "/dashboard/judge",
      show: true,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Team Manager Portal",
      desc: "House points, team roster & stage calls",
      icon: Users,
      href: `${festBase}/teams/portal`,
      show: true,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Green Room Desk",
      desc: "Contestant reporting, code letters & audio bell",
      icon: DoorOpen,
      href: `${festBase}/green-room`,
      show: true,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Announcer Desk",
      desc: "Live stage calls, mic prompts & result flashes",
      icon: Megaphone,
      href: `${festBase}/announcements`,
      show: true,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Prizes & Honors",
      desc: "Winner list, stage award checklist & slips",
      icon: Gift,
      href: `${festBase}/prizes`,
      show: true,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
  ]

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2 font-sans">
      {/* ── HEADER (Screenshot 1: Fest dashboard / Welcome, Sinan) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Fest dashboard
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
            Welcome, {userName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Active workspace: <span className="font-bold text-indigo-600 dark:text-[#00c9a7]">{festName}</span> · Connected as <span className="capitalize font-bold">{userRole.replace(/_/g, " ")}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={festBase}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white flex items-center gap-2 transition-all shadow-sm"
          >
            <span>Open All Workspace Tools</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── STAT CARDS (Screenshot 1: Stage programs: 1 | Participants: 8) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Stage programs */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c131d] shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Stage programs</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {stageProgramsCount}
          </div>
        </div>

        {/* Participants */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c131d] shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Participants</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {participantsCount}
          </div>
        </div>
      </div>

      {/* ── ROLE SPECIALIST PANELS ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase text-slate-400">
          Role Specialist Panels
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roleTools.map((t) => {
            const Icon = t.icon
            return (
              <Link
                key={t.title}
                href={t.href}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c131d] hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-xs flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${t.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#00c9a7] transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.desc}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── YOUR TOOLS (Screenshot 1: Exact Festize grid) ── */}
      <div className="space-y-3">
        <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
          Your tools
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0c131d] hover:border-indigo-500/40 dark:hover:border-[#00a389]/40 hover:bg-slate-50 dark:hover:bg-[#0e1622] transition-all shadow-xs flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-[#00c9a7] group-hover:bg-indigo-50 dark:group-hover:bg-[#00a389]/15 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors block">
                      {tool.title}
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:block">
                      {tool.desc}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-[#00c9a7] group-hover:translate-x-0.5 transition-all" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
