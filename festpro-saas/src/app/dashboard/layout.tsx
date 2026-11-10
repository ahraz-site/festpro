"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { signOut, ensureUserProfile } from "@/lib/actions/auth"
import { getFestivalSettings } from "@/lib/actions/festival"
import { COMPETITION_UNITS, FESTIVAL_MODULES, type CompetitionUnitType } from "@/config/festival-modules"
import type { FestivalSettings } from "@/types/festival"
import { AhrazFestProLogo } from "@/components/ui/logo"
import {
  Bell, LogOut, User, Menu, X, LayoutDashboard, Building2, Settings,
  Users, Activity, ChevronDown, Plus, Check, CalendarDays,
  LayoutGrid, CreditCard, Image as ImageIcon, FileText, MessageSquare, Shield,
  Trophy, Calendar, QrCode, Clock, Radio, AlertTriangle, Phone,
  Award, Medal, Globe, DollarSign, BarChart3, Wallet,
  Megaphone, Key, UserCheck, Printer, Search,
  ArrowRight, ArrowLeft, Bookmark, ClipboardCheck, Utensils, Truck
} from "lucide-react"
import type { Profile } from "@/types"
import type { ExtendedOrganization } from "@/types/organization"
import { AccountStatusBanner } from "@/components/license/account-status-banner"

const MODULE_ICONS: Record<string, any> = {
  live_stage: Radio,
  green_room: Clock,
  attendance: UserCheck,
  qr_code: QrCode,
  appeals: AlertTriangle,
  certificates: Award,
  reports: FileText,
  finance: DollarSign,
  fund_collection: Wallet,
  food: Utensils,
  accommodation: Building2,
  transport: Truck,
  gallery: ImageIcon,
  news: Megaphone,
  notifications: MessageSquare,
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [organizations, setOrganizations] = useState<ExtendedOrganization[]>([])
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Festival workspace states
  const [currentFestival, setCurrentFestival] = useState<{ id: string; name: string; short_name?: string; status?: string } | null>(null)
  const [festivalSettings, setFestivalSettings] = useState<FestivalSettings | null>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchModalOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

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

  // Reactively fetch festival info and settings when inside a festival workspace
  useEffect(() => {
    if (!currentFestivalId) {
      setCurrentFestival(null)
      setFestivalSettings(null)
      return
    }

    const supabase = createClient()
    supabase
      .from("festivals")
      .select("id, name, short_name, status")
      .eq("id", currentFestivalId)
      .single()
      .then(({ data }) => {
        if (data) setCurrentFestival(data)
      })

    getFestivalSettings(currentFestivalId)
      .then((settings) => {
        if (settings) setFestivalSettings(settings)
      })
      .catch(() => {})
  }, [currentFestivalId])

  const handleSignOut = useCallback(async () => { await signOut() }, [])

  const currentOrg = organizations.find((o) => o.id === currentOrgId)
  const ADMIN_EMAILS = [
    "ahrazfestpro@gmail.com",
    "ahraza272@gmail.com",
    "admin@festpro.com",
  ]
  const isPlatformAdmin =
    profile?.role === "platform_owner" ||
    profile?.role === "platform_admin" ||
    ADMIN_EMAILS.includes(profile?.email?.toLowerCase() || "") ||
    profile?.email?.toLowerCase().startsWith("admin@")

  // Dynamic terminology
  const unitKey = (festivalSettings?.terminology?.unit || "groups") as CompetitionUnitType
  const unitConfig = COMPETITION_UNITS[unitKey] || COMPETITION_UNITS.groups
  const unitPlural = unitConfig.plural

  // Core festival links (QUAF style)
  const festivalCoreItems = currentFestivalId ? [
    { label: "Dashboard", href: "", icon: LayoutDashboard },
    ...(unitKey !== "individual" ? [{ label: unitPlural, href: "/teams", icon: Users }] : []),
    { label: "Participants", href: "/participants", icon: Bookmark },
    { label: "Programmes", href: "/competitions", icon: Trophy },
    { label: "Registrations", href: "/competitions/registrations", icon: ClipboardCheck },
    { label: "Schedule", href: "/schedules", icon: Calendar },
    { label: "Stages / Venues", href: "/stages", icon: LayoutGrid },
    { label: "Judges", href: "/judging", icon: Shield },
    { label: "Mark Entry", href: "/results/publish", icon: FileText },
    { label: "Results", href: "/results", icon: Award },
    { label: "Points Table", href: "/results/team-points", icon: Medal },
    { label: "Reports & Print", href: "/documents", icon: Printer },
    { label: "Settings", href: "/settings", icon: Settings },
  ] : []

  // Active optional modules
  const enabledOptionalModules = FESTIVAL_MODULES.filter(
    (m) => !m.isCore && festivalSettings?.modules?.[m.id] === true
  )

  const orgNavItems = currentOrgId ? [
    { label: "Overview", href: `/dashboard/organization/${currentOrgId}`, icon: Building2 },
    { label: "Members", href: `/dashboard/organization/${currentOrgId}/members`, icon: Users },
    { label: "Subscription", href: `/dashboard/subscription`, icon: CreditCard },
    { label: "Contact Sales", href: "/contact", icon: Phone },
    { label: "Settings", href: `/dashboard/organization/${currentOrgId}/settings`, icon: Settings },
    { label: "Activity", href: `/dashboard/organization/${currentOrgId}/activity`, icon: Activity },
  ] : []

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ...(isPlatformAdmin
      ? [{ label: "👑 License Management", href: "/dashboard/licensing", icon: Key }]
      : []),
    { label: "Profile", href: "/profile", icon: User },
  ]

  const ALL_SEARCHABLE_SECTIONS = [
    { title: "Main Dashboard", href: "/dashboard", section: "General", icon: LayoutDashboard },
    { title: "User Profile Settings", href: "/profile", section: "General", icon: User },
    { title: "Create Organization", href: "/dashboard/organization/create", section: "Organizations", icon: Plus },
    { title: "License Management", href: "/dashboard/licensing", section: "Platform Administration", icon: Key },
    { title: "Tenants / Clients", href: "/dashboard/platform/tenants", section: "Platform Administration", icon: Building2 },
    { title: "Subscription Plans", href: "/dashboard/platform/plans", section: "Platform Administration", icon: CreditCard },
    { title: "Billing & Invoices", href: "/dashboard/platform/billing", section: "Platform Administration", icon: DollarSign },
  ]

  const filteredSearchSections = ALL_SEARCHABLE_SECTIONS.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.section.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-500 hover:text-slate-700 rounded-lg lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <AhrazFestProLogo />

            {/* Organization Selector */}
            {organizations.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="hidden md:inline max-w-[120px] truncate">
                    {currentOrg?.name || "Select Organization"}
                  </span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {orgDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOrgDropdownOpen(false)} />
                    <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                      <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Organizations</div>
                      {organizations.map((org) => (
                        <Link prefetch={true}
                          key={org.id}
                          href={`/dashboard/organization/${org.id}`}
                          onClick={() => setOrgDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold text-white shrink-0" style={{ backgroundColor: org.brand_color || "#4F46E5" }}>
                            {org.name[0]}
                          </div>
                          <span className="flex-1 truncate">{org.name}</span>
                          {org.id === currentOrgId && <Check className="h-4 w-4 text-indigo-600" />}
                        </Link>
                      ))}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <Link prefetch={true}
                          href="/dashboard/organization/create"
                          onClick={() => setOrgDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                        >
                          <Plus className="h-4 w-4" /> Create Organization
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Active Festival Indicator */}
            {currentFestival && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-900 max-w-[220px] truncate">
                <Trophy className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">{currentFestival.name}</span>
              </div>
            )}
          </div>

          {/* Quick Search Input */}
          <div className="relative flex-1 max-w-md mx-4 hidden md:block">
            <div
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-400 bg-slate-100 hover:bg-slate-200/80 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-300"
            >
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="flex-1 truncate">Search any section or page...</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">Ctrl+K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              title="Search Sections"
            >
              <Search className="h-5 w-5" />
            </button>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
              <Bell className="h-5 w-5" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 rounded-lg hover:bg-slate-100 p-1.5 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 text-xs font-bold">
                  {profile?.first_name?.[0] || "U"}{profile?.last_name?.[0] || ""}
                </div>
                <div className="hidden md:block text-xs text-left">
                  <p className="font-bold text-slate-900 leading-tight">{profile ? `${profile.first_name} ${profile.last_name || ""}` : "Account"}</p>
                  <p className="text-[11px] text-slate-400 capitalize leading-tight">{profile?.role ? profile.role.replace(/_/g, " ") : "Member"}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400 hidden md:block" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1">
                    <Link prefetch={true}
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="h-4 w-4" /> Profile Settings
                    </Link>
                    {isPlatformAdmin && (
                      <Link prefetch={true}
                        href="/dashboard/licensing"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                      >
                        <Key className="h-4 w-4 text-indigo-600" /> 👑 Super Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { setProfileDropdownOpen(false); handleSignOut() }}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 w-full"
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

      {/* Sidebar Navigation */}
      <aside className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-slate-200 bg-white transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 overflow-y-auto`}>
        <nav className="p-3.5 space-y-1">
          {/* CASE A: INSIDE A FESTIVAL WORKSPACE (QUAF STYLE) */}
          {currentFestivalId ? (
            <>
              {/* Festival Header Card */}
              <div className="p-3 mb-3 bg-gradient-to-br from-indigo-50/80 to-purple-50/50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {currentFestival?.short_name?.slice(0, 3).toUpperCase() || currentFestival?.name?.slice(0, 2).toUpperCase() || "FP"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-slate-900 truncate leading-tight">
                      {currentFestival?.name || "Festival Workspace"}
                    </h3>
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded capitalize mt-0.5 border border-emerald-200">
                      {currentFestival?.status || "Active"}
                    </span>
                  </div>
                </div>
                <Link
                  prefetch={true}
                  href={`/dashboard/organization/${currentOrgId}/festivals`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" /> All Festivals
                </Link>
              </div>

              {/* Core Operations Menu */}
              <div className="pt-1 pb-1">
                <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Core Menu
                </span>
              </div>
              {festivalCoreItems.map((item) => {
                const fullHref = item.href === ""
                  ? `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}`
                  : `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${item.href}`
                const isActive = item.href === ""
                  ? pathname === fullHref
                  : pathname === fullHref || pathname.startsWith(fullHref + "/")
                const Icon = item.icon
                return (
                  <Link
                    prefetch={true}
                    key={item.label}
                    href={fullHref}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                      isActive
                        ? "text-indigo-700 bg-indigo-50 font-bold"
                        : "text-slate-600 hover:text-indigo-700 hover:bg-slate-50"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}

              {/* Optional Enabled Modules */}
              {enabledOptionalModules.length > 0 && (
                <>
                  <div className="pt-4 pb-1">
                    <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Active Modules
                    </span>
                  </div>
                  {enabledOptionalModules.map((mod) => {
                    const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${mod.href}`
                    const isActive = pathname === fullHref || pathname.startsWith(fullHref + "/")
                    const ModIcon = MODULE_ICONS[mod.id] || LayoutGrid
                    return (
                      <Link
                        prefetch={true}
                        key={mod.id}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                          isActive
                            ? "text-indigo-700 bg-indigo-50 font-bold"
                            : "text-slate-600 hover:text-indigo-700 hover:bg-slate-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <ModIcon className={`h-4 w-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                        <span className="truncate">{mod.name}</span>
                      </Link>
                    )
                  })}
                </>
              )}
            </>
          ) : (
            /* CASE B: PLATFORM & ORGANIZATION GENERAL SIDEBAR */
            <>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link prefetch={true}
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                      isActive ? "text-indigo-700 bg-indigo-50" : "text-slate-600 hover:text-indigo-700 hover:bg-slate-50"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}

              {/* Platform Administration */}
              {isPlatformAdmin && (
                <>
                  <div className="pt-4 pb-1">
                    <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Platform Administration
                    </span>
                  </div>
                  {[
                    { label: "Platform Overview", href: "/dashboard/platform", icon: LayoutDashboard },
                    { label: "👑 License Management", href: "/dashboard/licensing", icon: Key },
                    { label: "Tenants / Clients", href: "/dashboard/platform/tenants", icon: Building2 },
                    { label: "Subscription Plans", href: "/dashboard/platform/plans", icon: CreditCard },
                    { label: "Billing & Invoices", href: "/dashboard/platform/billing", icon: DollarSign },
                    { label: "Platform Settings", href: "/dashboard/platform/settings", icon: Settings },
                  ].map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard/platform" && pathname.startsWith(item.href + "/"))
                    const Icon = item.icon
                    return (
                      <Link prefetch={true}
                        key={item.label}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50 font-bold" : "text-slate-600 hover:text-indigo-700 hover:bg-slate-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}
                </>
              )}

              {/* Organization Section */}
              {currentOrgId && (
                <>
                  <div className="pt-4 pb-1">
                    <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {currentOrg?.name || "Organization"}
                    </span>
                  </div>
                  {orgNavItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link prefetch={true}
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-slate-600 hover:text-indigo-700 hover:bg-slate-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  <div className="pt-4 pb-1">
                    <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Festivals
                    </span>
                  </div>
                  <Link prefetch={true}
                    href={`/dashboard/organization/${currentOrgId}/festivals`}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                      pathname === `/dashboard/organization/${currentOrgId}/festivals` ? "text-indigo-700 bg-indigo-50" : "text-slate-600 hover:text-indigo-700 hover:bg-slate-50"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <CalendarDays className="h-4 w-4" />
                    All Festivals
                  </Link>
                  <Link prefetch={true}
                    href={`/dashboard/organization/${currentOrgId}/festivals/create`}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Plus className="h-4 w-4" />
                    + New Festival
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-2xs lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content Area */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {pathname !== "/dashboard" && (
            <div className="mb-4 flex items-center justify-between border-b border-slate-200/80 pb-3">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all hover:text-indigo-600 active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-indigo-600" /> Back
              </button>

              {/* Breadcrumb Path */}
              <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 font-medium overflow-x-auto max-w-md">
                {pathname.split("/").filter(Boolean).map((part, idx, arr) => (
                  <span key={idx} className="flex items-center gap-1">
                    {idx > 0 && <span className="text-slate-300">/</span>}
                    <span className={idx === arr.length - 1 ? "text-indigo-700 font-bold capitalize" : "capitalize"}>
                      {part.replace(/-/g, " ")}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Account Status Banner (Hold / Block / Payment Due Alerts) */}
          <AccountStatusBanner organizationId={currentOrgId} />
          {children}
        </div>
      </main>

      {/* Search Modal (Ctrl+K) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setSearchModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 px-4 border-b border-slate-100 py-3">
              <Search className="h-4 w-4 text-indigo-600 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Type to search any section or page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-xs text-slate-400 hover:text-slate-600">Clear</button>
              )}
              <button onClick={() => setSearchModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredSearchSections.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No sections found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredSearchSections.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link prefetch={true}
                        key={item.href + item.title}
                        href={item.href}
                        onClick={() => {
                          setSearchModalOpen(false)
                          setSearchQuery("")
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-indigo-50/80 transition-colors group"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 transition-colors shrink-0">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 group-hover:text-indigo-900 truncate">{item.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{item.section}</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors shrink-0" />
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Quick Search</span>
              <span>Press <kbd className="font-mono bg-white px-1.5 py-0.5 border border-slate-200 rounded">ESC</kbd> to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
