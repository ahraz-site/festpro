"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { signOut, ensureUserProfile } from "@/lib/actions/auth"
import {
  Bell, LogOut, User, Menu, X, LayoutDashboard, Building2, Settings,
  Users, Activity, ChevronDown, Plus, Check, CalendarDays,
  CreditCard, FileText, Shield, Trophy, Calendar, Radio, Layers,
  Tv, HelpCircle, Moon, Sun, ArrowLeft, Bookmark, LayoutGrid, Search,
  RefreshCw, ExternalLink, Sparkles, Gamepad2, Monitor, ClipboardCheck,
  Keyboard, Dices, Medal, BarChart2, Star, Gift, Award, ListFilter,
  Printer, LayoutTemplate, Megaphone, Type, Globe, KeyRound
} from "lucide-react"
import type { Profile } from "@/types"
import type { ExtendedOrganization } from "@/types/organization"
import { FestProLogo, AhrazFestProLogo, FestProFavicon } from "@/components/ui/logo"
import { AccountStatusBanner } from "@/components/license/account-status-banner"
import { getOrCreateOrganizationFestivalAction } from "@/lib/actions/festival"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [organizations, setOrganizations] = useState<ExtendedOrganization[]>([])
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Festival workspace states
  const [currentFestival, setCurrentFestival] = useState<{
    id: string
    name: string
    short_name?: string | null
    code?: string | null
    status?: string | null
  } | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const parts = window.location.pathname.split("/")
        const orgIdx = parts.findIndex((p) => p === "organization")
        const orgId = orgIdx >= 0 ? parts[orgIdx + 1] : null
        if (orgId) {
          const cached = sessionStorage.getItem(`festpro_active_fest_${orgId}`)
          if (cached) return JSON.parse(cached)
        }
      } catch {}
    }
    return null
  })

  const isOrgRoute = pathname.startsWith("/dashboard/organization")
  const currentOrgId = isOrgRoute ? pathname.split("/")[3] : profile?.organization_id
  const isFestivalRoute = pathname.includes("/festivals/")
  const parts = pathname.split("/")
  const festivalSectionIdx = parts.findIndex((p) => p === "festivals")
  const currentFestivalId = isFestivalRoute && festivalSectionIdx >= 0 ? parts[festivalSectionIdx + 1] : null

  // Restore cached profile/orgs for instant render
  useEffect(() => {
    try {
      const cachedProf = sessionStorage.getItem("festpro_cached_profile")
      const cachedOrgs = sessionStorage.getItem("festpro_cached_orgs")
      if (cachedProf) setProfile(JSON.parse(cachedProf))
      if (cachedOrgs) setOrganizations(JSON.parse(cachedOrgs))
    } catch {}

    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const [profRes, memRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("organization_members").select("organization_id").eq("user_id", user.id)
      ])

      let prof = profRes.data
      if (!prof) prof = await ensureUserProfile()
      if (!prof) {
        prof = {
          id: user.id,
          email: user.email || "user@festpro.com",
          first_name: user.email?.split("@")[0] || "User",
          last_name: "",
          role: "organization_owner",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any
      }

      setProfile(prof)
      try { sessionStorage.setItem("festpro_cached_profile", JSON.stringify(prof)) } catch {}

      if (memRes.data?.length) {
        const ids = memRes.data.map((m: { organization_id: string }) => m.organization_id)
        const { data: orgs } = await supabase
          .from("organizations")
          .select("*")
          .in("id", ids)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
        if (orgs?.length) {
          setOrganizations(orgs as ExtendedOrganization[])
          try { sessionStorage.setItem("festpro_cached_orgs", JSON.stringify(orgs)) } catch {}
        }
      }

      setLoading(false)
    }
    load()
  }, [router])

  // Fetch festival info
  useEffect(() => {
    if (!currentFestivalId) {
      if (currentOrgId) {
        // Try session cache first
        try {
          const cached = sessionStorage.getItem(`festpro_active_fest_${currentOrgId}`)
          if (cached) {
            const parsed = JSON.parse(cached)
            if (parsed?.id) setCurrentFestival(parsed)
          }
        } catch {}

        const supabase = createClient()
        supabase
          .from("festivals")
          .select("id, name, short_name, code, status")
          .eq("organization_id", currentOrgId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(async ({ data }: any) => {
            if (data) {
              setCurrentFestival(data)
              try { sessionStorage.setItem(`festpro_active_fest_${currentOrgId}`, JSON.stringify(data)) } catch {}
            } else {
              const res = await getOrCreateOrganizationFestivalAction(currentOrgId)
              if (res.success && res.festival) {
                setCurrentFestival(res.festival)
                try { sessionStorage.setItem(`festpro_active_fest_${currentOrgId}`, JSON.stringify(res.festival)) } catch {}
              }
            }
          })
          .catch(() => {})
      }
      return
    }

    const supabase = createClient()
    supabase
      .from("festivals")
      .select("id, name, short_name, code, status")
      .eq("id", currentFestivalId)
      .single()
      .then(({ data }: any) => {
        if (data) {
          setCurrentFestival(data)
          if (currentOrgId) {
            try { sessionStorage.setItem(`festpro_active_fest_${currentOrgId}`, JSON.stringify(data)) } catch {}
          }
        }
      })
      .catch(() => {})
  }, [currentFestivalId, currentOrgId])

  const handleSignOut = useCallback(async () => { await signOut() }, [])

  const effectiveFestivalId = currentFestivalId || currentFestival?.id
  const dashboardHref = effectiveFestivalId && currentOrgId
    ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}`
    : currentOrgId ? `/dashboard/organization/${currentOrgId}` : "/dashboard"
  const isDashboardActive = pathname === dashboardHref

  const festSlug = currentFestival?.code || currentFestival?.short_name || effectiveFestivalId || "fest"
  const publicWebUrl = `/festivals/${effectiveFestivalId || festSlug}`

  // 1. OVERVIEW
  // 2. PEOPLE & PROGRAM (With individual distinct active checks)
  const peopleProgramItems = currentOrgId ? [
    {
      label: "People & access",
      href: `/dashboard/organization/${currentOrgId}/members`,
      icon: Shield,
      isActive: pathname.includes("/members"),
    },
    {
      label: "Teams",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/teams`
        : `/dashboard/organization/${currentOrgId}/festivals?target=teams`,
      icon: Users,
      isActive: pathname.includes("/teams"),
    },
    {
      label: "Participants",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/participants`
        : `/dashboard/organization/${currentOrgId}/festivals?target=participants`,
      icon: Bookmark,
      isActive: pathname.includes("/participants"),
    },
    {
      label: "Categories",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/competitions/categories`
        : `/dashboard/organization/${currentOrgId}/festivals?target=categories`,
      icon: LayoutGrid,
      isActive: pathname.includes("/competitions/categories"),
    },
    {
      label: "Programs",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/competitions`
        : `/dashboard/organization/${currentOrgId}/festivals?target=competitions`,
      icon: Trophy,
      isActive: pathname.includes("/competitions") && !pathname.includes("/competitions/categories"),
    },
    {
      label: "Scheduler",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/schedules`
        : `/dashboard/organization/${currentOrgId}/festivals?target=schedules`,
      icon: Calendar,
      isActive: pathname.includes("/schedules"),
    },
  ] : []

  // 3. LIVE OPERATIONS (Matching Screenshots 1 to 7)
  const liveOpsItems = currentOrgId ? [
    {
      label: "Live programs",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/live-programs`
        : `/dashboard/organization/${currentOrgId}/festivals?target=live-programs`,
      icon: Gamepad2,
      isActive: pathname.includes("/live-programs"),
    },
    {
      label: "Stages",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/stages`
        : `/dashboard/organization/${currentOrgId}/festivals?target=stages`,
      icon: Layers,
      isActive: pathname.includes("/stages"),
    },
    {
      label: "Stage desk",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/stage-desk`
        : `/dashboard/organization/${currentOrgId}/festivals?target=stage-desk`,
      icon: Monitor,
      isActive: pathname.includes("/stage-desk"),
    },
    {
      label: "TV displays",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/tv-displays`
        : `/dashboard/organization/${currentOrgId}/festivals?target=tv-displays`,
      icon: Tv,
      isActive: pathname.includes("/tv-displays"),
    },
    {
      label: "Enter Marks",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/enter-marks`
        : `/dashboard/organization/${currentOrgId}/festivals?target=enter-marks`,
      icon: ClipboardCheck,
      isActive: pathname.includes("/enter-marks"),
    },
    {
      label: "Code letters",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/code-letters`
        : `/dashboard/organization/${currentOrgId}/festivals?target=code-letters`,
      icon: Keyboard,
      isActive: pathname.includes("/code-letters"),
    },
    {
      label: "Subject picker",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/subject-picker`
        : `/dashboard/organization/${currentOrgId}/festivals?target=subject-picker`,
      icon: Dices,
      isActive: pathname.includes("/subject-picker") || pathname.includes("/random-picker"),
    },
  ] : []

  // 4. RESULTS
  const resultsItems = currentOrgId ? [
    {
      label: "Team scores",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/team-scores`
        : `/dashboard/organization/${currentOrgId}/festivals?target=team-scores`,
      icon: Trophy,
      isActive: pathname.includes("/team-scores"),
    },
    {
      label: "Results",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/results`
        : `/dashboard/organization/${currentOrgId}/festivals?target=results`,
      icon: Award,
      isActive: pathname.endsWith("/results"),
    },
    {
      label: "Result planner",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/result-planner`
        : `/dashboard/organization/${currentOrgId}/festivals?target=result-planner`,
      icon: ListFilter,
      isActive: pathname.includes("/result-planner"),
    },
    {
      label: "Published team scores",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/published-team-scores`
        : `/dashboard/organization/${currentOrgId}/festivals?target=published-team-scores`,
      icon: BarChart2,
      isActive: pathname.includes("/published-team-scores"),
    },
    {
      label: "Top candidates",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/top-candidates`
        : `/dashboard/organization/${currentOrgId}/festivals?target=top-candidates`,
      icon: Star,
      isActive: pathname.includes("/top-candidates"),
    },
    {
      label: "Prizes",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/prizes`
        : `/dashboard/organization/${currentOrgId}/festivals?target=prizes`,
      icon: Gift,
      isActive: pathname.includes("/prizes"),
    },
    {
      label: "Grade points",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/grade-points`
        : `/dashboard/organization/${currentOrgId}/festivals?target=grade-points`,
      icon: Medal,
      isActive: pathname.includes("/grade-points"),
    },
  ] : []

  // 5. DESIGN & OUTPUT (Screenshots 1-11)
  const designOutputItems = currentOrgId ? [
    {
      label: "ID card setup",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/id-cards`
        : `/dashboard/organization/${currentOrgId}/festivals?target=id-cards`,
      icon: CreditCard,
      isActive: pathname.includes("/id-cards"),
    },
    {
      label: "Certificates",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/certificates`
        : `/dashboard/organization/${currentOrgId}/festivals?target=certificates`,
      icon: Award,
      isActive: pathname.includes("/certificates"),
    },
    {
      label: "Reports & printouts",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/reports`
        : `/dashboard/organization/${currentOrgId}/festivals?target=reports`,
      icon: Printer,
      isActive: pathname.includes("/reports") || pathname.includes("/printouts"),
    },
    {
      label: "Poster templates",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/poster-templates`
        : `/dashboard/organization/${currentOrgId}/festivals?target=poster-templates`,
      icon: LayoutTemplate,
      isActive: pathname.includes("/poster-templates"),
    },
    {
      label: "Poster ads",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/poster-ads`
        : `/dashboard/organization/${currentOrgId}/festivals?target=poster-ads`,
      icon: Megaphone,
      isActive: pathname.includes("/poster-ads"),
    },
    {
      label: "Fonts",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/fonts`
        : `/dashboard/organization/${currentOrgId}/festivals?target=fonts`,
      icon: Type,
      isActive: pathname.includes("/fonts"),
    },
    {
      label: "Website",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/website`
        : `/dashboard/organization/${currentOrgId}/festivals?target=website`,
      icon: Globe,
      isActive: pathname.includes("/website") || pathname.includes("/page-builder"),
    },
  ] : []

  // 6. FEST SETUP (Screenshots 1-5)
  const festSetupItems = currentOrgId ? [
    {
      label: "API keys",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/api-keys`
        : `/dashboard/organization/${currentOrgId}/festivals?target=api-keys`,
      icon: KeyRound,
      isActive: pathname.includes("/api-keys"),
    },
    {
      label: "Settings",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/settings`
        : `/dashboard/organization/${currentOrgId}/festivals?target=settings`,
      icon: Settings,
      isActive: pathname.endsWith("/settings"),
    },
  ] : []

  // 7. SUPPORT (Screenshot 6)
  const supportItems = currentOrgId ? [
    {
      label: "Help",
      href: effectiveFestivalId
        ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/help`
        : `/dashboard/organization/${currentOrgId}/festivals?target=help`,
      icon: HelpCircle,
      isActive: pathname.includes("/help"),
    },
  ] : []

  const triggerRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* ── TOP HEADER (FestPro Palette with Mobile Optimization) ── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-600 hover:text-indigo-600 rounded-xl lg:hidden hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <FestProLogo height={28} />
            </Link>

            {/* Current Fest Badge (Clean FestPro style) */}
            {currentFestival && (
              <div className="hidden sm:flex items-center gap-2.5 pl-4 border-l border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider block leading-none">
                    FESTIVAL
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate max-w-[180px] lg:max-w-xs">
                      {currentFestival.name}
                    </span>
                    <a
                      href={publicWebUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-indigo-600 transition-colors p-0.5"
                      title="Open public festival domain"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refreshing Live Data Indicator (Screenshot Reference) */}
            <button
              onClick={triggerRefresh}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-semibold text-slate-600 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer"
              title="Click to refresh festival live data"
            >
              <RefreshCw className={`h-3 w-3 text-indigo-600 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden md:inline">
                {isRefreshing ? "Refreshing..." : "Refreshing live data..."}
              </span>
            </button>

            {/* Help & Support */}
            <Link
              href="/contact"
              className="p-2 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-slate-100 transition-colors"
              title="Help & Support"
            >
              <HelpCircle className="h-4 sm:h-5 w-4 sm:w-5" />
            </Link>

            {/* User Profile Avatar / Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {profile?.first_name ? profile.first_name[0].toUpperCase() : "U"}
                </div>
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                      <p className="text-slate-500 truncate text-[11px]">{profile?.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 text-slate-400" /> Profile Settings
                    </Link>

                    {currentOrgId && (
                      <Link
                        href={`/dashboard/organization/${currentOrgId}/settings`}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4 text-slate-400" /> Organization Settings
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 font-medium"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── DESKTOP & MOBILE SLIDE-OVER SIDEBAR (Clean 3-Section FestPro Navigation) ── */}
      <aside className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-slate-200/80 bg-white transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 overflow-y-auto flex flex-col justify-between shadow-xs`}>
        <nav className="p-3.5 space-y-1">
          {/* 1. OVERVIEW */}
          <div className="pt-2 pb-1.5 px-3">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              OVERVIEW
            </span>
          </div>

          <Link
            prefetch={true}
            href={dashboardHref}
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
              isDashboardActive
                ? "bg-indigo-50 text-indigo-700 font-bold"
                : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className={`h-4 w-4 ${isDashboardActive ? "text-indigo-600" : "text-slate-400"}`} />
              <span>Dashboard</span>
            </div>
            {isDashboardActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
          </Link>

          {/* 2. PEOPLE & PROGRAM */}
          <div className="pt-5 pb-1.5 px-3">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              PEOPLE & PROGRAM
            </span>
          </div>

          {peopleProgramItems.map((item) => {
            const isActive = item.isActive
            const Icon = item.icon
            return (
              <Link
                prefetch={true}
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all min-h-[38px] ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
              </Link>
            )
          })}

          {/* 3. LIVE OPERATIONS */}
          <div className="pt-5 pb-1.5 px-3">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              LIVE OPERATIONS
            </span>
          </div>

          {liveOpsItems.map((item) => {
            const isActive = item.isActive
            const Icon = item.icon
            return (
              <Link
                prefetch={true}
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all min-h-[38px] ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
              </Link>
            )
          })}

          {/* 4. RESULTS (Screenshot Reference) */}
          <div className="pt-5 pb-1.5 px-3">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              RESULTS
            </span>
          </div>

          {resultsItems.map((item) => {
            const isActive = item.isActive
            const Icon = item.icon
            return (
              <Link
                prefetch={true}
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all min-h-[38px] ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
              </Link>
            )
          })}

          {/* 5. DESIGN & OUTPUT */}
          <div className="pt-5 pb-1.5 px-3">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              DESIGN & OUTPUT
            </span>
          </div>

          {designOutputItems.map((item) => {
            const isActive = item.isActive
            const Icon = item.icon
            return (
              <Link
                prefetch={true}
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all min-h-[38px] ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
              </Link>
            )
          })}

          {/* 6. FEST SETUP (Screenshot 1-5) */}
          <div className="pt-5 pb-1.5 px-3">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              FEST SETUP
            </span>
          </div>

          {festSetupItems.map((item) => {
            const isActive = item.isActive
            const Icon = item.icon
            return (
              <Link
                prefetch={true}
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all min-h-[38px] ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
              </Link>
            )
          })}

          {/* 7. SUPPORT (Screenshot 6) */}
          <div className="pt-5 pb-1.5 px-3">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              SUPPORT
            </span>
          </div>

          {supportItems.map((item) => {
            const isActive = item.isActive
            const Icon = item.icon
            return (
              <Link
                prefetch={true}
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all min-h-[38px] ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-bold"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>© 2026 FesPro</span>
          {currentFestival && (
            <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              {festSlug}
            </span>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-2xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <div className="lg:pl-64 pt-16 pb-20 lg:pb-10 min-h-screen">
        <AccountStatusBanner organizationId={currentOrgId} />
        <main className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      {/* ── MOBILE QUICK BOTTOM NAVIGATION BAR ("mobililum easy handle cheyyan pattanam") ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 lg:hidden shadow-lg safe-area-bottom">
        <div className="grid grid-cols-5 items-center py-1.5 px-1 text-center">
          {/* 1. Dashboard */}
          <Link
            href={dashboardHref}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              isDashboardActive ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutDashboard className="h-4 w-4 mb-0.5" />
            <span className="text-[10px] truncate max-w-[56px]">Dash</span>
          </Link>

          {/* 2. Programs */}
          <Link
            href={effectiveFestivalId && currentOrgId ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/competitions` : dashboardHref}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              pathname.includes("/competitions") && !pathname.includes("/competitions/categories") ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Trophy className="h-4 w-4 mb-0.5" />
            <span className="text-[10px] truncate max-w-[56px]">Programs</span>
          </Link>

          {/* 3. Live Stages */}
          <Link
            href={effectiveFestivalId && currentOrgId ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/stages` : dashboardHref}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              pathname.includes("/stages") ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div className="relative">
              <Radio className="h-4 w-4 mb-0.5" />
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] truncate max-w-[56px]">Stages</span>
          </Link>

          {/* 4. Live TV Displays */}
          <Link
            href={effectiveFestivalId && currentOrgId ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/live/display` : dashboardHref}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-colors ${
              pathname.includes("/live/display") ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Tv className="h-4 w-4 mb-0.5" />
            <span className="text-[10px] truncate max-w-[56px]">TV View</span>
          </Link>

          {/* 5. Full Menu */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex flex-col items-center justify-center py-1 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <Menu className="h-4 w-4 mb-0.5" />
            <span className="text-[10px] truncate max-w-[56px]">All Tools</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
