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

export default function FestDashboardRoot() {
  const cachedInit = (() => {
    if (typeof window === "undefined") return null
    try {
      const raw = sessionStorage.getItem("festpro_dash_root_cache")
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  const [userName, setUserName] = useState(cachedInit?.userName || "Organizer")
  const [userRole, setUserRole] = useState(cachedInit?.userRole || "organization_owner")
  const [orgId, setOrgId] = useState(cachedInit?.orgId || "")
  const [festivalId, setFestivalId] = useState(cachedInit?.festivalId || "")
  const [festName, setFestName] = useState(cachedInit?.festName || "Festival Workspace")
  const [stageProgramsCount, setStageProgramsCount] = useState<number>(cachedInit?.stageProgramsCount || 0)
  const [participantsCount, setParticipantsCount] = useState<number>(cachedInit?.participantsCount || 0)
  const [loading, setLoading] = useState(!cachedInit)

  useEffect(() => {
    let active = true
    async function initDashboard() {
      try {
        let nextName = "Organizer"
        let nextRole = "organization_owner"
        let resolvedOrgId = ""
        let resolvedFestId = ""
        let nextFestName = "Festival Workspace"

        const staff = await getStaffSessionAction()
        if (staff) {
          nextName = staff.name || "Staff Member"
          nextRole = staff.role || "staff"
          resolvedOrgId = staff.organizationId || ""
          resolvedFestId = staff.festivalId || ""
        } else {
          const supabase = createClient()
          const { data: sessionData } = await supabase.auth.getSession()
          let user = sessionData?.session?.user || null
          if (!user) {
            const { data: userRes } = await supabase.auth.getUser()
            user = userRes?.user || null
          }

          if (user) {
            const [profRes, memRes] = await Promise.all([
              supabase.from("profiles").select("first_name, last_name, role, organization_id").eq("id", user.id).maybeSingle(),
              supabase.from("organization_members").select("organization_id").eq("user_id", user.id).limit(1).maybeSingle(),
            ])

            const prof = profRes.data
            if (prof?.first_name) {
              nextName = prof.first_name
              nextRole = prof.role || "organization_owner"
            } else {
              nextName = user.email?.split("@")[0] || "Organizer"
            }

            resolvedOrgId = prof?.organization_id || memRes.data?.organization_id || ""
            if (!resolvedOrgId) {
              const { data: orgRow } = await supabase
                .from("organizations")
                .select("id")
                .is("deleted_at", null)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle()
              if (orgRow?.id) resolvedOrgId = orgRow.id
            }

            if (resolvedOrgId) {
              const { data: fests } = await supabase
                .from("festivals")
                .select("id, name")
                .eq("organization_id", resolvedOrgId)
                .is("deleted_at", null)
                .order("created_at", { ascending: false })
                .limit(1)
              if (fests?.[0]) {
                resolvedFestId = fests[0].id
                nextFestName = fests[0].name || "Festival Workspace"
              }
            }
          }
        }

        if (!active) return
        setUserName(nextName)
        setUserRole(nextRole)
        if (resolvedOrgId) setOrgId(resolvedOrgId)

        let nextComps = stageProgramsCount
        let nextParts = participantsCount
        if (resolvedFestId) {
          setFestivalId(resolvedFestId)
          setFestName(nextFestName)
          try {
            const res = await fetch(`/api/festival/${resolvedFestId}/workspace?scope=summary`, { cache: "no-store" })
            if (res.ok && active) {
              const json = await res.json()
              if (json.festival?.name) nextFestName = json.festival.name
              nextParts = Number(json.counts?.participants ?? 0)
              nextComps = Number(json.counts?.competitions ?? 0)
              setFestName(nextFestName)
              setParticipantsCount(nextParts)
              setStageProgramsCount(nextComps)
            }
          } catch {}
        }

        if (active && (resolvedOrgId || resolvedFestId)) {
          try {
            sessionStorage.setItem(
              "festpro_dash_root_cache",
              JSON.stringify({
                userName: nextName,
                userRole: nextRole,
                orgId: resolvedOrgId,
                festivalId: resolvedFestId,
                festName: nextFestName,
                stageProgramsCount: nextComps,
                participantsCount: nextParts,
              })
            )
          } catch {}
        }
      } catch (err) {
        console.warn("initDashboard notice:", err)
      } finally {
        if (active) setLoading(false)
      }
    }
    initDashboard()
    return () => {
      active = false
    }
  }, [])

  const makeToolHref = (subpath: string, targetKey: string) => {
    if (orgId && festivalId) {
      return `/dashboard/organization/${orgId}/festivals/${festivalId}/${subpath}`
    }
    if (orgId) {
      return `/dashboard/organization/${orgId}/festivals?target=${targetKey}`
    }
    return "/dashboard/organization"
  }

  const festBase = orgId && festivalId ? `/dashboard/organization/${orgId}/festivals/${festivalId}` : orgId ? `/dashboard/organization/${orgId}/festivals` : "/dashboard/organization"

  // Tools grid
  const tools = [
    {
      title: "Participants",
      desc: "Student list, chest numbers & divisions",
      icon: Bookmark,
      href: makeToolHref("participants", "participants"),
    },
    {
      title: "Programs",
      desc: "All stage competitions, schedules & rules",
      icon: Trophy,
      href: makeToolHref("competitions", "competitions"),
    },
    {
      title: "Live programs",
      desc: "Stage status, current calls & queues",
      icon: Sliders,
      href: makeToolHref("live-programs", "live-programs"),
    },
    {
      title: "Stage desk",
      desc: "Live stage caller, timer & audio buzzer",
      icon: Monitor,
      href: makeToolHref("stage-desk", "stage-desk"),
    },
    {
      title: "Reports & printouts",
      desc: "Score sheets, tabulation charts & PDF slips",
      icon: Printer,
      href: makeToolHref("reports", "reports"),
    },
    {
      title: "Subject picker",
      desc: "Random topic & blind letter draws",
      icon: Dices,
      href: makeToolHref("subject-picker", "subject-picker"),
    },
    {
      title: "Help",
      desc: "Jury guidelines, handbook & quick FAQ",
      icon: HelpCircle,
      href: makeToolHref("help", "help"),
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
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Team Manager Portal",
      desc: "House points, team roster & stage calls",
      icon: Users,
      href: makeToolHref("teams/portal", "teams"),
      show: true,
      color: "text-blue-700 bg-blue-50 border-blue-200",
    },
    {
      title: "Green Room Desk",
      desc: "Contestant reporting, code letters & audio bell",
      icon: DoorOpen,
      href: makeToolHref("green-room", "green-room"),
      show: true,
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      title: "Announcer Desk",
      desc: "Live stage calls, mic prompts & result flashes",
      icon: Megaphone,
      href: makeToolHref("announcements", "announcements"),
      show: true,
      color: "text-purple-700 bg-purple-50 border-purple-200",
    },
    {
      title: "Prizes & Honors",
      desc: "Winner list, stage award checklist & slips",
      icon: Gift,
      href: makeToolHref("prizes", "prizes"),
      show: true,
      color: "text-rose-700 bg-rose-50 border-rose-200",
    },
  ]

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2 font-sans">
      {/* ── HEADER (Screenshot 1: Fest dashboard / Welcome, Sinan) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Fest dashboard
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
            Welcome, {userName}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Active workspace: <span className="font-bold text-indigo-600">{festName}</span> · Connected as <span className="capitalize font-bold text-slate-700">{userRole.replace(/_/g, " ")}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={festBase}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 transition-all shadow-xs"
          >
            <span>Open All Workspace Tools</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ── STAT CARDS (Screenshot 1: Stage programs: 1 | Participants: 8) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Stage programs */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">Stage programs</span>
          <div className="text-3xl font-black text-slate-900">
            {stageProgramsCount}
          </div>
        </div>

        {/* Participants */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500">Participants</span>
          <div className="text-3xl font-black text-slate-900">
            {participantsCount}
          </div>
        </div>
      </div>

      {/* ── ROLE SPECIALIST PANELS ── */}
      <div className="space-y-3">
        <h2 className="text-xs font-black tracking-wider uppercase text-slate-400">
          Role Specialist Panels
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roleTools.map((t) => {
            const Icon = t.icon
            return (
              <Link
                key={t.title}
                href={t.href}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all shadow-xs flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${t.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">{t.desc}</p>
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
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          Your tools
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-slate-50/60 transition-all shadow-xs flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors block">
                      {tool.title}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
                      {tool.desc}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
