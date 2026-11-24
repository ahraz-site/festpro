"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Building2, CalendarDays, Users, Settings, Activity, ArrowRight,
  Trophy, Bookmark, LayoutGrid, Radio, Layers, Tv, Calendar,
  FileEdit, BarChart3, Award, Globe, ExternalLink, Sparkles,
  Printer, CreditCard
} from "lucide-react"
import type { OrganizationDashboardData } from "@/types/organization"
import type { Festival } from "@/types/festival"
import { getOrganizationDashboardData } from "@/lib/actions/organization"
import { getOrCreateOrganizationFestivalAction } from "@/lib/actions/festival"
import { FestProFavicon } from "@/components/ui/logo"

export default function OrganizationDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string

  const [data, setData] = useState<OrganizationDashboardData | null>(null)
  const [activeFest, setActiveFest] = useState<Festival | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [orgRes, festRes] = await Promise.all([
          getOrganizationDashboardData(orgId),
          getOrCreateOrganizationFestivalAction(orgId),
        ])

        setData(orgRes as unknown as OrganizationDashboardData)

        if (festRes.success && festRes.festival) {
          setActiveFest(festRes.festival)
          // Automatically redirect to the full festival workspace if arriving at organization root
          router.replace(`/dashboard/organization/${orgId}/festivals/${festRes.festival.id}`)
          return
        }
      } catch (err) {
        console.error("Dashboard load error:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orgId, router])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="animate-pulse">
          <FestProFavicon size={44} className="shadow-md rounded-full" />
        </div>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide animate-pulse">
          Loading organization & festival workspace...
        </p>
      </div>
    )
  }

  if (!data) return <div className="text-center py-12 text-slate-500">Organization not found.</div>

  const festId = activeFest?.id
  const festSlug = activeFest?.code || activeFest?.short_name || "fest"
  const publicWebUrl = `/festivals/${festSlug}`
  const subdomainWebUrl = `https://${festSlug}.festpro.ahraz.site`

  const festivalHref = (path: string) =>
    festId ? `/dashboard/organization/${orgId}/festivals/${festId}/${path}` : `/dashboard/organization/${orgId}/festivals`

  interface OrgToolItem {
    label: string
    href: string
    icon: any
    isExternal?: boolean
  }

  // Complete festival tools grid matching user specifications
  const allTools: OrgToolItem[] = [
    { label: "People & access", href: `/dashboard/organization/${orgId}/members`, icon: Users },
    { label: "Teams", href: festivalHref("teams"), icon: Users },
    { label: "Participants", href: festivalHref("participants"), icon: Bookmark },
    { label: "Categories", href: festivalHref("competitions/categories"), icon: LayoutGrid },
    { label: "Programs", href: festivalHref("competitions"), icon: Trophy },
    { label: "Live programs", href: festivalHref("live-programs"), icon: Radio },
    { label: "Stages", href: festivalHref("stages"), icon: Layers },
    { label: "Stage desk", href: festivalHref("stage-desk"), icon: LayoutGrid },
    { label: "TV displays", href: festivalHref("tv-displays"), icon: Tv },
    { label: "Scheduler", href: festivalHref("schedules"), icon: Calendar },
    { label: "Enter Marks", href: festivalHref("enter-marks"), icon: FileEdit },
    { label: "Team scores", href: festivalHref("team-scores"), icon: BarChart3 },
    { label: "ID card setup", href: festivalHref("id-cards"), icon: CreditCard },
    { label: "Certificates", href: festivalHref("certificates"), icon: Award },
    { label: "Reports & printouts", href: festivalHref("reports"), icon: Printer },
    { label: "Results", href: festivalHref("results"), icon: Trophy },
    { label: "Public Website", href: festivalHref("website"), icon: Globe },
    { label: "Settings", href: festivalHref("settings"), icon: Settings },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-white text-lg font-black shadow-xs"
            style={{ backgroundColor: data.organization.brand_color || "#4F46E5" }}
          >
            {data.organization.name[0]?.toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{data.organization.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                {data.organization.subscription_plan || "Active"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Organization Console & Festival Management</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFest && (
            <Link
              href={`/dashboard/organization/${orgId}/festivals/${activeFest.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Open Festival Workspace
            </Link>
          )}
          <Link
            href={`/dashboard/organization/${orgId}/settings`}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            Org Settings
          </Link>
        </div>
      </div>

      {/* ── ACTIVE FESTIVAL WORKSPACE BANNER ── */}
      {activeFest && (
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">
                Current Festival
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span className="text-xs font-semibold text-indigo-700 capitalize">{activeFest.status || "Active"}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{activeFest.name}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <a
                href={publicWebUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                <Globe className="h-3 w-3" />
                <span>{festSlug}.festpro.ahraz.site</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-70" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/organization/${orgId}/festivals/${activeFest.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Launch Mission Control <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── STATS METRICS ── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="rounded-2xl border border-slate-200 shadow-xs">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">1</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Organization</p>
            </div>
          </CardContent>
        </Card>

        <Link href={`/dashboard/organization/${orgId}/festivals`}>
          <Card className="rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{activeFest ? 1 : 0}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Festival</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/organization/${orgId}/members`}>
          <Card className="rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors cursor-pointer">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{data.memberCount}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Team Members ({data.activeMemberCount} active)
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── FESTIVAL TOOLS (Complete 16-Tool Grid) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Your Festival Tools
          </h2>
          {activeFest && (
            <Link
              href={`/dashboard/organization/${orgId}/festivals/${activeFest.id}`}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              View all 30 tools →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
          {allTools.map((tool) => {
            const Icon = tool.icon
            return tool.isExternal ? (
              <a
                key={tool.label}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all text-left"
              >
                <div className="p-2 rounded-lg bg-slate-50 text-indigo-600">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{tool.label}</p>
                  <p className="text-[10px] text-slate-400">External</p>
                </div>
              </a>
            ) : (
              <Link
                key={tool.label}
                href={tool.href}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all text-left"
              >
                <div className="p-2 rounded-lg bg-indigo-50/70 text-indigo-600">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{tool.label}</p>
                  <p className="text-[10px] text-slate-400">Manage</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <Card className="rounded-2xl border border-slate-200 shadow-xs">
        <CardHeader className="py-4 px-5 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-800">Organization Settings & Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-5 grid gap-3 sm:grid-cols-3">
          <Link
            href={`/dashboard/organization/${orgId}/members`}
            className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 hover:border-indigo-300 transition-all bg-white"
          >
            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-700">Invite Members</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>
          <Link
            href={`/dashboard/organization/${orgId}/settings`}
            className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 hover:border-indigo-300 transition-all bg-white"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-700">Org Settings</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>
          <Link
            href={`/dashboard/organization/${orgId}/activity`}
            className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 hover:border-indigo-300 transition-all bg-white"
          >
            <div className="flex items-center gap-2.5">
              <Activity className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-700">Activity Log</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
