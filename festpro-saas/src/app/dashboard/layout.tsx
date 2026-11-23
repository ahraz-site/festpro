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
  Tv, HelpCircle, Moon, Sun, ArrowLeft, Bookmark, LayoutGrid, Search
} from "lucide-react"
import type { Profile } from "@/types"
import type { ExtendedOrganization } from "@/types/organization"
import { AccountStatusBanner } from "@/components/license/account-status-banner"

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
  const [currentFestival, setCurrentFestival] = useState<{ id: string; name: string; short_name?: string; code?: string; status?: string } | null>(null)

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

  // Fetch festival info
  useEffect(() => {
    if (!currentFestivalId) {
      if (currentOrgId) {
        const supabase = createClient()
        supabase
          .from("festivals")
          .select("id, name, short_name, code, status")
          .eq("organization_id", currentOrgId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(({ data }: any) => {
            if (data) setCurrentFestival(data)
          })
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
        if (data) setCurrentFestival(data)
      })
  }, [currentFestivalId, currentOrgId])

  const handleSignOut = useCallback(async () => { await signOut() }, [])

  const currentOrg = organizations.find((o) => o.id === currentOrgId)
  const effectiveFestivalId = currentFestivalId || currentFestival?.id
  const dashboardHref = effectiveFestivalId && currentOrgId
    ? `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}`
    : currentOrgId ? `/dashboard/organization/${currentOrgId}` : "/dashboard"
  const isDashboardActive = pathname === dashboardHref

  // Navigation Items matching Festize Reference Screenshots
  const peopleProgramItems = effectiveFestivalId && currentOrgId ? [
    { label: "People & access", href: `/dashboard/organization/${currentOrgId}/members`, icon: Shield },
    { label: "Teams", href: `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/teams`, icon: Users },
    { label: "Participants", href: `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/participants`, icon: Bookmark },
    { label: "Categories", href: `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/competitions/categories`, icon: LayoutGrid },
    { label: "Programs", href: `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/competitions`, icon: Trophy },
    { label: "Scheduler", href: `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/schedules`, icon: Calendar },
  ] : []

  const liveOpsItems = effectiveFestivalId && currentOrgId ? [
    { label: "Live programs", href: `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/results/publish`, icon: Radio },
    { label: "Stages", href: `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/stages`, icon: Layers },
    { label: "Stage desk", href: `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/venues`, icon: LayoutGrid },
    { label: "TV displays", href: `/dashboard/organization/${currentOrgId}/festivals/${effectiveFestivalId}/live/display`, icon: Tv },
  ] : []

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* -- TOP HEADER (Festize Look) -- */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-stone-200/80 bg-white/95 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-500 hover:text-slate-700 rounded-lg lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#0D382E] text-white flex items-center justify-center font-black text-sm shadow-sm">
                F
              </div>
              <span className="font-heading font-extrabold text-xl text-[#0D382E]">
                FestPro
              </span>
            </Link>

            {/* Fest Name Header */}
            {currentFestival && (
              <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-stone-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block leading-none">
                    FEST
                  </span>
                  <span className="text-sm font-bold text-slate-900 leading-tight">
                    {currentFestival.name}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Header Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Help Icon */}
            <Link
              href="/contact"
              className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
              title="Help & Support"
            >
              <HelpCircle className="h-5 w-5" />
            </Link>

            {/* Dark Mode Icon */}
            <button
              onClick={() => {}}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
              title="Toggle theme"
            >
              <Moon className="h-5 w-5" />
            </button>

            {/* Profile Avatar / Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-xs border border-stone-300">
                  {profile?.first_name ? profile.first_name[0].toUpperCase() : "U"}
                </div>
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-stone-200 shadow-xl py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-stone-100">
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

                    <div className="border-t border-stone-100 my-1" />

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

      {/* -- SIDEBAR NAVIGATION (Exact 3 Sections from Festize Screenshots) -- */}
      <aside className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-60 border-r border-stone-200/80 bg-white transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 overflow-y-auto flex flex-col justify-between`}>
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
                ? "bg-emerald-50 text-emerald-800 font-bold"
                : "text-slate-600 hover:text-emerald-800 hover:bg-stone-50"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className={`h-4 w-4 ${isDashboardActive ? "text-emerald-700" : "text-slate-400"}`} />
              <span>Dashboard</span>
            </div>
            {isDashboardActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
          </Link>

          {/* 2. PEOPLE & PROGRAM */}
          <div className="pt-5 pb-1.5 px-3">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              PEOPLE & PROGRAM
            </span>
          </div>

          {peopleProgramItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link
                prefetch={true}
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 font-bold"
                    : "text-slate-600 hover:text-emerald-800 hover:bg-stone-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
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
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link
                prefetch={true}
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 font-bold"
                    : "text-slate-600 hover:text-emerald-800 hover:bg-stone-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200/60 text-[11px] text-slate-400">
          � 2026 FestPro
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-2xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* -- MAIN CONTENT AREA -- */}
      <div className="lg:pl-60 pt-16">
        <AccountStatusBanner organizationId={currentOrgId} />
        <main className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}
