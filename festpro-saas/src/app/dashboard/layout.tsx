"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/actions/auth"
import {
  Bell, LogOut, User, Menu, X, LayoutDashboard, Building2, Settings,
  Users, Activity, ChevronDown, Plus, Check,   CalendarDays, MapPin,
  LayoutGrid, CreditCard, Image, FileText, MessageSquare, Shield,
  Trophy, BookOpen, Calendar, QrCode, IdCard, ClipboardList, Upload,
  Clock, Radio, WandSparkles, AlertTriangle, Phone, MessageSquare as MessageSqIcon,
  Star, CheckCircle, ListOrdered, Award, Medal, Crown, Globe,
  DollarSign, BarChart3, Receipt, Wallet, PieChart, Gift,
  Megaphone, Workflow, Mail, Server, Key, Flag,   Bug, Database, Lock, History,
  UserCheck, Briefcase, Printer, Car, Camera, Scan, Handshake, PiggyBank, Target,
  Ticket, Search, Package, Phone as PhoneIcon, ClipboardList as ClipboardListIcon, LogIn,
  HelpCircle, ShieldCheck, Layers,
  Warehouse, ShoppingCart, Truck, Wrench, TrendingUp,   ClipboardCheck, Route,
  Utensils, ChefHat, Trash2,
  Smartphone, CloudSync, TrendingUp as TrendingUpIcon, Upload as UploadIcon,
  Stethoscope, Pill, ArrowRight, Palette, Bot, Brain, Cpu, Eye, Mic, Languages, FileKey,
  FileSignature, Share2, HardDrive, Archive as ArchiveIcon, Folder, GitBranch, Rocket, Container, Gauge, Book, LifeBuoy, Download,
} from "lucide-react"
import type { Profile } from "@/types"
import type { ExtendedOrganization } from "@/types/organization"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [organizations, setOrganizations] = useState<ExtendedOrganization[]>([])
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const isOrgRoute = pathname.startsWith("/dashboard/organization")
  const currentOrgId = isOrgRoute ? pathname.split("/")[3] : profile?.organization_id
  const isFestivalRoute = pathname.includes("/festivals/")
  const parts = pathname.split("/")
  const festivalSectionIdx = parts.findIndex((p) => p === "festivals")
  const currentFestivalId = isFestivalRoute && festivalSectionIdx >= 0 ? parts[festivalSectionIdx + 1] : null
  const currentFestivalSection = isFestivalRoute && festivalSectionIdx >= 0 ? parts[festivalSectionIdx + 2] || "dashboard" : null
  const isCompetitionRoute = isFestivalRoute && currentFestivalSection === "competitions"
  const competitionSectionIdx = parts.findIndex((p) => p === "competitions")
  const currentCompetitionId = isCompetitionRoute && competitionSectionIdx >= 0 ? parts[competitionSectionIdx + 1] : null
  const currentCompetitionSection = isCompetitionRoute && competitionSectionIdx >= 0 ? parts[competitionSectionIdx + 2] || "list" : null
  const isParticipantRoute = isFestivalRoute && currentFestivalSection === "participants"
  const participantSectionIdx = parts.findIndex((p) => p === "participants")
  const currentParticipantId = isParticipantRoute && participantSectionIdx >= 0 ? parts[participantSectionIdx + 1] : null
  const currentParticipantSection = isParticipantRoute && participantSectionIdx >= 0 ? parts[participantSectionIdx + 2] || "list" : null

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(prof)

      // Load organizations the user belongs to
      const { data: memberships } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)

      if (memberships?.length) {
        const ids = memberships.map((m: { organization_id: string }) => m.organization_id)
        const { data: orgs } = await supabase
          .from("organizations")
          .select("*")
          .in("id", ids)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
        setOrganizations(orgs as ExtendedOrganization[])
      }

      setLoading(false)
    }
    load()
  }, [router])

  const handleSignOut = useCallback(async () => { await signOut() }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-lg font-bold animate-pulse">F</div>
          </div>
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const currentOrg = organizations.find((o) => o.id === currentOrgId)

  const orgNavItems = currentOrgId ? [
    { label: "Overview", href: `/dashboard/organization/${currentOrgId}`, icon: Building2 },
    { label: "Members", href: `/dashboard/organization/${currentOrgId}/members`, icon: Users },
    { label: "Settings", href: `/dashboard/organization/${currentOrgId}/settings`, icon: Settings },
    { label: "Activity", href: `/dashboard/organization/${currentOrgId}/activity`, icon: Activity },
  ] : []

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Profile", href: "/profile", icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-bold">F</div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">FestPro</span>
            </Link>

            {/* Organization Switcher */}
            {organizations.length > 0 && (
              <div className="relative ml-4">
                <button
                  onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Building2 className="h-4 w-4" />
                  <span className="hidden md:inline max-w-[120px] truncate">
                    {currentOrg?.name || "Select Organization"}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {orgDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOrgDropdownOpen(false)} />
                    <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Organizations</div>
                      {organizations.map((org) => (
                        <Link
                          key={org.id}
                          href={`/dashboard/organization/${org.id}`}
                          onClick={() => setOrgDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: org.brand_color || "#4F46E5" }}>
                            {org.name[0]}
                          </div>
                          <span className="flex-1 truncate">{org.name}</span>
                          {org.id === currentOrgId && <Check className="h-4 w-4 text-indigo-600" />}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <Link
                          href="/dashboard/organization/create"
                          onClick={() => setOrgDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50"
                        >
                          <Plus className="h-4 w-4" />
                          Create Organization
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Bell className="h-5 w-5" />
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 rounded-lg hover:bg-gray-100 p-1.5 transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </div>
                <div className="hidden md:block text-sm text-left">
                  <p className="font-medium text-gray-900 leading-tight">{profile.first_name} {profile.last_name}</p>
                  <p className="text-xs text-gray-500 capitalize leading-tight">{profile.role.replace(/_/g, " ")}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-gray-400 hidden md:block" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                    <Link
                      href="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => { setProfileDropdownOpen(false); handleSignOut() }}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white transform transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 overflow-y-auto`}>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          {/* Platform Administration Section */}
          <div className="pt-4 pb-2">
            <Link
              href="/dashboard/platform"
              className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
            >
              Platform Administration
            </Link>
          </div>
          {[
            { label: "Dashboard", href: "/dashboard/platform", icon: LayoutDashboard },
            { label: "Tenants", href: "/dashboard/platform/tenants", icon: Building2 },
            { label: "Plans", href: "/dashboard/platform/plans", icon: CreditCard },
            { label: "Billing", href: "/dashboard/platform/billing", icon: DollarSign },
            { label: "Domains", href: "/dashboard/platform/domains", icon: Globe },
            { label: "Licenses", href: "/dashboard/platform/licenses", icon: Key },
            { label: "Reports", href: "/dashboard/platform/reports", icon: BarChart3 },
            { label: "Analytics", href: "/dashboard/platform/analytics", icon: TrendingUpIcon },
            { label: "Settings", href: "/dashboard/platform/settings", icon: Settings },
          ].map((item) => {
            const fullHref = item.href
            const isActive = pathname === fullHref || pathname.startsWith(fullHref + "/")
            return (
              <Link
                key={item.label}
                href={fullHref}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          {/* Observability Section */}
          <div className="pt-4 pb-2">
            <Link
              href="/dashboard/platform/observability"
              className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
            >
              Observability
            </Link>
          </div>
          {[
            { label: "Dashboard", href: "/dashboard/platform/observability", icon: LayoutDashboard },
            { label: "System Health", href: "/dashboard/platform/observability/health", icon: Activity },
            { label: "Logs", href: "/dashboard/platform/observability/logs", icon: BarChart3 },
            { label: "Alerts", href: "/dashboard/platform/observability/alerts", icon: Bell },
            { label: "Incidents", href: "/dashboard/platform/observability/incidents", icon: AlertTriangle },
            { label: "Backups", href: "/dashboard/platform/observability/backups", icon: Database },
            { label: "Deployments", href: "/dashboard/platform/observability/deployments", icon: Layers },
            { label: "Maintenance", href: "/dashboard/platform/observability/maintenance", icon: Clock },
          ].map((item) => {
            const fullHref = item.href
            const isActive = pathname === fullHref || pathname.startsWith(fullHref + "/")
            return (
              <Link
                key={item.label}
                href={fullHref}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          {/* AI Platform Section */}
          <div className="pt-4 pb-2">
            <Link
              href="/dashboard/platform/ai"
              className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
            >
              AI Platform
            </Link>
          </div>
          {[
            { label: "Dashboard", href: "/dashboard/platform/ai", icon: LayoutDashboard },
            { label: "Copilot", href: "/dashboard/platform/ai/copilot", icon: Bot },
            { label: "Conversations", href: "/dashboard/platform/ai/conversations", icon: MessageSquare },
            { label: "Knowledge Base", href: "/dashboard/platform/ai/knowledge", icon: Database },
            { label: "Prompts", href: "/dashboard/platform/ai/prompts", icon: Layers },
            { label: "Providers", href: "/dashboard/platform/ai/providers", icon: Cpu },
            { label: "Agents", href: "/dashboard/platform/ai/agents", icon: Brain },
            { label: "Predictions", href: "/dashboard/platform/ai/predictions", icon: TrendingUp },
            { label: "Jobs", href: "/dashboard/platform/ai/jobs", icon: Activity },
            { label: "Cost", href: "/dashboard/platform/ai/cost", icon: DollarSign },
          ].map((item) => {
            const fullHref = item.href
            const isActive = pathname === fullHref || pathname.startsWith(fullHref + "/")
            return (
              <Link
                key={item.label}
                href={fullHref}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          {/* Localization Section */}
          <div className="pt-4 pb-2">
            <Link
              href="/dashboard/platform/localization"
              className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
            >
              Localization
            </Link>
          </div>
          {[
            { label: "Dashboard", href: "/dashboard/platform/localization", icon: LayoutDashboard },
            { label: "Languages", href: "/dashboard/platform/localization/languages", icon: Languages },
            { label: "Packs", href: "/dashboard/platform/localization/packs", icon: FileKey },
            { label: "Translations", href: "/dashboard/platform/localization/translations", icon: Globe },
            { label: "Regional", href: "/dashboard/platform/localization/regional", icon: Settings },
            { label: "Import/Export", href: "/dashboard/platform/localization/imports", icon: Upload },
            { label: "Accessibility", href: "/dashboard/platform/localization/accessibility", icon: Eye },
            { label: "Text to Speech", href: "/dashboard/platform/localization/tts", icon: Mic },
          ].map((item) => {
            const fullHref = item.href
            const isActive = pathname === fullHref || pathname.startsWith(fullHref + "/")
            return (
              <Link
                key={item.label}
                href={fullHref}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          {/* EDMS Section */}
          <div className="pt-4 pb-2">
            <Link
              href="/dashboard/platform/edms"
              className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
            >
              Document Management
            </Link>
          </div>
          {[
            { label: "Dashboard", href: "/dashboard/platform/edms", icon: LayoutDashboard },
            { label: "Explorer", href: "/dashboard/platform/edms/explorer", icon: FileText },
            { label: "Categories", href: "/dashboard/platform/edms/categories", icon: Folder },
            { label: "Approvals", href: "/dashboard/platform/edms/approvals", icon: FileSignature },
            { label: "Templates", href: "/dashboard/platform/edms/templates", icon: FileText },
            { label: "Knowledge", href: "/dashboard/platform/edms/knowledge", icon: BookOpen },
            { label: "Sharing", href: "/dashboard/platform/edms/shares", icon: Share2 },
            { label: "Retention", href: "/dashboard/platform/edms/retention", icon: Shield },
            { label: "Archive", href: "/dashboard/platform/edms/archive", icon: ArchiveIcon },
          ].map((item) => {
            const fullHref = item.href
            const isActive = pathname === fullHref || pathname.startsWith(fullHref + "/")
            return (
              <Link
                key={item.label}
                href={fullHref}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          {/* DevOps Section */}
          <div className="pt-4 pb-2">
            <Link
              href="/dashboard/platform/devops"
              className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
            >
              DevOps Platform
            </Link>
          </div>
          {[
            { label: "Dashboard", href: "/dashboard/platform/devops", icon: LayoutDashboard },
            { label: "Environments", href: "/dashboard/platform/devops/environments", icon: Globe },
            { label: "Pipelines", href: "/dashboard/platform/devops/pipelines", icon: GitBranch },
            { label: "Deployments", href: "/dashboard/platform/devops/deployments", icon: Rocket },
            { label: "Builds", href: "/dashboard/platform/devops/builds", icon: Activity },
            { label: "Releases", href: "/dashboard/platform/devops/releases", icon: Package },
            { label: "Clusters", href: "/dashboard/platform/devops/clusters", icon: Server },
            { label: "Containers", href: "/dashboard/platform/devops/containers", icon: Container },
            { label: "Feature Rollouts", href: "/dashboard/platform/devops/feature-rollouts", icon: Flag },
            { label: "Security Scans", href: "/dashboard/platform/devops/security-scans", icon: Shield },
            { label: "Secrets", href: "/dashboard/platform/devops/secrets", icon: Lock },
            { label: "Settings", href: "/dashboard/platform/devops/settings", icon: Settings },
          ].map((item) => {
            const fullHref = item.href
            const isActive = pathname === fullHref || pathname.startsWith(fullHref + "/")
            return (
              <Link
                key={item.label}
                href={fullHref}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          {/* Enterprise Security Section */}
          <div className="pt-4 pb-2">
            <Link
              href="/dashboard/platform/security"
              className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
            >
              Enterprise Security
            </Link>
          </div>
          {[
            { label: "Dashboard", href: "/dashboard/platform/security", icon: Shield },
            { label: "Compliance", href: "/dashboard/platform/security/compliance", icon: FileText },
            { label: "Scans", href: "/dashboard/platform/security/scans", icon: Bug },
            { label: "Operations", href: "/dashboard/platform/operations", icon: AlertTriangle },
            { label: "Performance", href: "/dashboard/platform/performance", icon: Activity },
            { label: "Reports", href: "/dashboard/platform/reports", icon: BarChart3 },
          ].map((item) => {
            const fullHref = item.href
            const isActive = pathname === fullHref || pathname.startsWith(fullHref + "/")
            return (
              <Link
                key={item.label}
                href={fullHref}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          {/* Enterprise Operations Section */}
          <div className="pt-4 pb-2">
            <Link
              href="/dashboard/platform/releases"
              className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
            >
              Release & LTS
            </Link>
          </div>
          {[
            { label: "Releases", href: "/dashboard/platform/releases", icon: Package },
            { label: "Docs", href: "/dashboard/platform/docs", icon: BookOpen },
            { label: "Maintenance", href: "/dashboard/platform/releases", icon: Calendar },
          ].map((item) => {
            const fullHref = item.href
            const isActive = pathname === fullHref || pathname.startsWith(fullHref + "/")
            return (
              <Link
                key={item.label}
                href={fullHref}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}

          {/* Organization Section */}
          {currentOrgId && (
            <>
              <div className="pt-4 pb-2">
                <a href={`/dashboard/organization/${currentOrgId}`} className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600">
                  {currentOrg?.name || "Organization"}
                </a>
              </div>
              {orgNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}

              {/* Festivals sub-nav */}
              <div className="pt-4 pb-2">
                <Link
                  href={`/dashboard/organization/${currentOrgId}/festivals`}
                  className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
                >
                  Festivals
                </Link>
              </div>
              <Link
                href={`/dashboard/organization/${currentOrgId}/festivals`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === `/dashboard/organization/${currentOrgId}/festivals` ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <CalendarDays className="h-4 w-4" />
                All Festivals
              </Link>

              {/* Festival detail sub-nav */}
              {currentFestivalId && (
                <>
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      Festival Menu
                    </Link>
                  </div>
                  {[
                    { label: "Dashboard", href: "", icon: LayoutDashboard },
                    { label: "Days", href: "/days", icon: CalendarDays },
                    { label: "Venues", href: "/venues", icon: MapPin },
                    { label: "Stages", href: "/stages", icon: LayoutGrid },
                    { label: "Committees", href: "/committees", icon: Users },
                    { label: "Sponsors", href: "/sponsors", icon: CreditCard },
                    { label: "Announcements", href: "/announcements", icon: MessageSquare },
                    { label: "Gallery", href: "/gallery", icon: Image },
                    { label: "Documents", href: "/documents", icon: FileText },
                    { label: "Settings", href: "/settings", icon: Settings },
                  ].map((item) => {
                    const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${item.href}`
                    const isActive = item.href === "" ? pathname === fullHref : pathname === fullHref || (item.href !== "" && pathname.startsWith(fullHref))
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Competition sub-nav */}
                  {currentCompetitionId ? (
                    <>
                      <div className="pt-4 pb-2">
                        <Link
                          href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/competitions`}
                          className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                        >
                          Competition
                        </Link>
                      </div>
                      {[
                        { label: "Details", href: "", icon: Trophy },
                        { label: "Rounds", href: "/rounds", icon: LayoutGrid },
                        { label: "Rules", href: "/rules", icon: BookOpen },
                        { label: "Stage", href: "/stages", icon: MapPin },
                        { label: "Judges", href: "/judges", icon: Shield },
                        { label: "Schedule", href: "/schedule", icon: Calendar },
                        { label: "Eligibility", href: "/eligibility", icon: Users },
                      ].map((item) => {
                        const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/competitions/${currentCompetitionId}${item.href}`
                        const isActive = item.href === "" ? pathname === fullHref : pathname.startsWith(fullHref)
                        return (
                          <Link
                            key={item.label}
                            href={fullHref}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        )
                      })}
                    </>
                  ) : (
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/competitions`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        pathname.startsWith(`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/competitions`)
                          ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Trophy className="h-4 w-4" />
                      Competitions
                    </Link>
                  )}

                  {/* Scheduling & Live Stage sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/sessions`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      Scheduling
                    </Link>
                  </div>
                  {[
                    { label: "Sessions", href: "/sessions", icon: Clock },
                    { label: "Schedules", href: "/schedules", icon: Calendar },
                    { label: "Live Stage", href: "/live", icon: Radio },
                    { label: "Display Screen", href: "/live/display", icon: LayoutDashboard },
                    { label: "Announcements", href: "/announcements", icon: MessageSqIcon },
                    { label: "Conflicts", href: "/conflicts", icon: AlertTriangle },
                    { label: "Call History", href: "/call-history", icon: Phone },
                    { label: "Judge Availability", href: "/judge-availability", icon: Users },
                  ].map((item) => {
                    const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${item.href}`
                    const isActive = pathname.startsWith(fullHref)
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Judging sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/judging`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      Judging
                    </Link>
                  </div>
                  {[
                    { label: "Dashboard", href: "/judging", icon: Star },
                    { label: "Criteria", href: "/judging/criteria", icon: ListOrdered },
                    { label: "Approvals", href: "/judging/approvals", icon: CheckCircle },
                    { label: "Results", href: "/judging/results", icon: Trophy },
                  ].map((item) => {
                    const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${item.href}`
                    const isActive = pathname.startsWith(fullHref)
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Results sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/results`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      Results
                    </Link>
                  </div>
                  {[
                    { label: "Dashboard", href: "/results", icon: Trophy },
                    { label: "Grades", href: "/results/grades", icon: Award },
                    { label: "Team Points", href: "/results/team-points", icon: Medal },
                    { label: "Championship", href: "/results/championship", icon: Crown },
                    { label: "Appeals", href: "/results/appeals", icon: AlertTriangle },
                    { label: "Certificates", href: "/results/certificates", icon: FileText },
                    { label: "Publications", href: "/results/publications", icon: Globe },
                    { label: "Rankings", href: "/results/rankings", icon: ListOrdered },
                    { label: "Publish Queue", href: "/results/publish", icon: Calendar },
                  ].map((item) => {
                    const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${item.href}`
                    const isActive = pathname.startsWith(fullHref)
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Finance & Reports sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/finance`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      Finance
                    </Link>
                  </div>
                  {[
                    { label: "Dashboard", href: "/finance", icon: DollarSign },
                    { label: "Accounts", href: "/finance/accounts", icon: Wallet },
                    { label: "Transactions", href: "/finance/transactions", icon: Receipt },
                    { label: "Payments", href: "/finance/payments", icon: CreditCard },
                    { label: "Expenses", href: "/finance/expenses", icon: DollarSign },
                    { label: "Income", href: "/finance/income", icon: BarChart3 },
                    { label: "Budgets", href: "/finance/budgets", icon: PieChart },
                    { label: "Sponsors", href: "/finance/sponsors", icon: Building2 },
                    { label: "Donations", href: "/finance/donations", icon: Gift },
                    { label: "Reports", href: "/finance/reports", icon: FileText },
                    { label: "Analytics", href: "/finance/analytics", icon: Activity },
                    { label: "Settings", href: "/finance/settings", icon: Settings },
                  ].map((item) => {
                    const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${item.href}`
                    const isActive = pathname.startsWith(fullHref)
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Communication sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/communication`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      Communication
                    </Link>
                  </div>
                  {[
                    { label: "Dashboard", href: "/communication", icon: Bell },
                    { label: "Notifications", href: "/communication/notifications", icon: Bell },
                    { label: "Announcements", href: "/communication/announcements", icon: Megaphone },
                    { label: "Email", href: "/communication/email", icon: Mail },
                    { label: "SMS", href: "/communication/sms", icon: MessageSquare },
                    { label: "Workflows", href: "/communication/workflows", icon: Workflow },
                    { label: "Settings", href: "/communication/settings", icon: Settings },
                  ].map((item) => {
                    const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${item.href}`
                    const isActive = pathname.startsWith(fullHref)
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Admin sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/admin`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      Administration
                    </Link>
                  </div>
                  {[
                    { label: "Dashboard", href: "/admin", icon: Shield },
                    { label: "Audit Logs", href: "/admin/audit", icon: FileText },
                    { label: "Security", href: "/admin/security", icon: Lock },
                    { label: "Sessions", href: "/admin/sessions", icon: Users },
                    { label: "Login History", href: "/admin/login-history", icon: History },
                    { label: "System Settings", href: "/admin/settings", icon: Settings },
                    { label: "Feature Flags", href: "/admin/features", icon: Flag },
                    { label: "API Tokens", href: "/admin/api-tokens", icon: Key },
                    { label: "Backups", href: "/admin/backups", icon: Database },
                    { label: "Error Logs", href: "/admin/errors", icon: Bug },
                  ].map((item) => {
                    const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${item.href}`
                    const isActive = pathname.startsWith(fullHref)
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Volunteer & Staff sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/volunteer`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      Volunteer & Staff
                    </Link>
                  </div>
                  {[
                    { label: "Dashboard", href: "/volunteer", icon: Users },
                    { label: "Volunteers", href: "/volunteer/volunteers", icon: UserCheck },
                    { label: "Staff", href: "/volunteer/staff", icon: Briefcase },
                    { label: "Departments", href: "/volunteer/departments", icon: Building2 },
                    { label: "Duties", href: "/volunteer/duties", icon: ClipboardList },
                    { label: "Shifts", href: "/volunteer/shifts", icon: Clock },
                    { label: "Attendance", href: "/volunteer/attendance", icon: CalendarDays },
                    { label: "Tasks", href: "/volunteer/tasks", icon: CheckCircle },
                    { label: "Checkpoints", href: "/volunteer/checkpoints", icon: MapPin },
                    { label: "Certificates", href: "/volunteer/certificates", icon: Award },
                  ].map((item) => {
                    const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${item.href}`
                    const isActive = pathname.startsWith(fullHref)
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* ID Card & Pass Management sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/id-cards`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      ID Cards & Passes
                    </Link>
                  </div>
                  {[
                    { label: "Dashboard", href: "/id-cards", icon: IdCard },
                    { label: "ID Cards", href: "/id-cards/cards", icon: IdCard },
                    { label: "Templates", href: "/id-cards/templates", icon: FileText },
                    { label: "Badges", href: "/id-cards/badges", icon: Award },
                    { label: "Passes", href: "/id-cards/passes", icon: CreditCard },
                    { label: "Vehicle Passes", href: "/id-cards/vehicle-passes", icon: Car },
                    { label: "Guest Passes", href: "/id-cards/guest-passes", icon: Users },
                    { label: "VIP Passes", href: "/id-cards/vip-passes", icon: Crown },
                    { label: "Media Passes", href: "/id-cards/media-passes", icon: Camera },
                    { label: "QR Codes", href: "/id-cards/qr-codes", icon: QrCode },
                    { label: "Print Queue", href: "/id-cards/print", icon: Printer },
                    { label: "Verification", href: "/id-cards/verification", icon: Scan },
                    { label: "Logs", href: "/id-cards/logs", icon: History },
                  ].map((item) => {
                    const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${item.href}`
                    const isActive = pathname.startsWith(fullHref)
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Sponsor, Donor & CRM sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/sponsor`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      Sponsor & Fund CRM
                    </Link>
                  </div>
                  {[
                    { label: "Dashboard", href: "/sponsor", icon: Handshake },
                    { label: "Sponsors", href: "/sponsor/sponsors", icon: Building2 },
                    { label: "Donors", href: "/sponsor/donors", icon: Users },
                    { label: "Campaigns", href: "/sponsor/campaigns", icon: Target },
                    { label: "Collectors", href: "/sponsor/collectors", icon: UserCheck },
                    { label: "Donations", href: "/sponsor/donations", icon: DollarSign },
                    { label: "Pledges", href: "/sponsor/pledges", icon: PiggyBank },
                    { label: "Receipts", href: "/sponsor/receipts", icon: Receipt },
                    { label: "CRM", href: "/sponsor/crm", icon: Phone },
                  ].map((item) => {
                    const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${item.href}`
                    const isActive = pathname.startsWith(fullHref)
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Help Desk & Reception sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/help-desk`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      Help Desk & Reception
                    </Link>
                  </div>
                  {[
                    { label: "Dashboard", href: "/help-desk", icon: Ticket },
                    { label: "Tickets", href: "/help-desk/tickets", icon: ClipboardListIcon },
                    { label: "Desks", href: "/help-desk/desks", icon: MapPin },
                    { label: "Knowledge", href: "/help-desk/knowledge", icon: BookOpen },
                    { label: "FAQ", href: "/help-desk/faq", icon: HelpCircle },
                    { label: "Visitors", href: "/help-desk/visitors", icon: Users },
                    { label: "Passes", href: "/help-desk/passes", icon: QrCode },
                    { label: "Check-ins", href: "/help-desk/checkins", icon: LogIn },
                    { label: "Groups", href: "/help-desk/groups", icon: Users },
                    { label: "Hosts", href: "/help-desk/hosts", icon: PhoneIcon },
                    { label: "Meetings", href: "/help-desk/meetings", icon: CalendarDays },
                    { label: "Lost Items", href: "/help-desk/lost", icon: Search },
                    { label: "Found Items", href: "/help-desk/found", icon: Package },
                    { label: "Claims", href: "/help-desk/claims", icon: ShieldCheck },
                    { label: "Feedback", href: "/help-desk/feedback", icon: Star },
                    { label: "Ratings", href: "/help-desk/ratings", icon: Star },
                    { label: "Reports", href: "/help-desk/reports", icon: BarChart3 },
                    { label: "Search", href: "/help-desk/search", icon: Search },
                  ].map((item) => {
                    const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${item.href}`
                    const isActive = pathname.startsWith(fullHref)
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Inventory & Assets sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/inventory`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      Inventory & Assets
                    </Link>
                  </div>
                  {[
                    { label: "Dashboard", href: "/inventory", icon: LayoutDashboard },
                    { label: "Warehouses", href: "/inventory/warehouses", icon: Warehouse },
                    { label: "Items", href: "/inventory/items", icon: Package },
                    { label: "Purchase", href: "/inventory/purchase", icon: ShoppingCart },
                    { label: "Vendors", href: "/inventory/vendors", icon: Truck },
                    { label: "Assets", href: "/inventory/assets", icon: Building2 },
                    { label: "Maintenance", href: "/inventory/maintenance", icon: Wrench },
                    { label: "Transactions", href: "/inventory/transactions", icon: TrendingUp },
                    { label: "Audits", href: "/inventory/audit", icon: ClipboardCheck },
                  ].map((item) => {
                    const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${item.href}`
                    const isActive = pathname.startsWith(fullHref)
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Food & Catering sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/food`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      Food & Catering
                    </Link>
                  </div>
                  {[
                    { label: "Dashboard", href: "/food", icon: Utensils },
                    { label: "Kitchens", href: "/food/kitchens", icon: ChefHat },
                    { label: "Sessions", href: "/food/sessions", icon: Clock },
                    { label: "Menus", href: "/food/menus", icon: ClipboardList },
                    { label: "Coupons", href: "/food/coupons", icon: QrCode },
                    { label: "Distribution", href: "/food/distribution", icon: ShoppingCart },
                    { label: "Dining Halls", href: "/food/dining", icon: Building2 },
                    { label: "Suppliers", href: "/food/suppliers", icon: Truck },
                    { label: "Inventory", href: "/food/inventory", icon: Package },
                    { label: "Waste", href: "/food/waste", icon: Trash2 },
                  ].map((item) => {
                    const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${item.href}`
                    const isActive = pathname.startsWith(fullHref)
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Accommodation & Transport sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/accommodation`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      Accommodation & Transport
                    </Link>
                  </div>
                  {[
                    { label: "Accommodation", href: "/accommodation", icon: Building2 },
                    { label: "Rooms", href: "/accommodation/rooms", icon: LayoutGrid },
                    { label: "Allocations", href: "/accommodation/allocations", icon: Users },
                    { label: "Check-in/out", href: "/accommodation/checkins", icon: LogIn },
                    { label: "Room Maint.", href: "/accommodation/maintenance", icon: Wrench },
                    { label: "Transport", href: "/transport", icon: Truck },
                    { label: "Vehicles", href: "/transport/vehicles", icon: Car },
                    { label: "Drivers", href: "/transport/drivers", icon: Users },
                    { label: "Trips", href: "/transport/trips", icon: Route },
                    { label: "Requests", href: "/transport/requests", icon: ClipboardListIcon },
                  ].map((item) => {
                    const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${item.href}`
                    const isActive = pathname.startsWith(fullHref)
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Medical Desk & Emergency sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/medical`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      Medical & Emergency
                    </Link>
                  </div>
                  {[
                    { label: "Dashboard", href: "/medical", icon: Activity },
                    { label: "Centers", href: "/medical/centers", icon: Building2 },
                    { label: "Staff", href: "/medical/staff", icon: Users },
                    { label: "Patients", href: "/medical/patients", icon: User },
                    { label: "Cases", href: "/medical/cases", icon: Stethoscope },
                    { label: "Medications", href: "/medical/medications", icon: Pill },
                    { label: "Inventory", href: "/medical/inventory", icon: Package },
                    { label: "Incidents", href: "/medical/incidents", icon: AlertTriangle },
                    { label: "Ambulances", href: "/medical/ambulances", icon: Truck },
                    { label: "Referrals", href: "/medical/referrals", icon: ArrowRight },
                    { label: "Certificates", href: "/medical/certificates", icon: FileText },
                  ].map((item) => {
                    const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}${item.href}`
                    const isActive = pathname.startsWith(fullHref)
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Mobile Platform sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/mobile`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      Mobile Platform
                    </Link>
                  </div>
                  {[
                    { label: "Dashboard", href: `/dashboard/organization/${currentOrgId}/mobile`, icon: Smartphone },
                    { label: "Devices", href: `/dashboard/organization/${currentOrgId}/mobile/devices`, icon: Smartphone },
                    { label: "Sessions", href: `/dashboard/organization/${currentOrgId}/mobile/sessions`, icon: LogIn },
                    { label: "Sync Queue", href: `/dashboard/organization/${currentOrgId}/mobile/sync`, icon: CloudSync },
                    { label: "Push", href: `/dashboard/organization/${currentOrgId}/mobile/push`, icon: Bell },
                    { label: "Activity", href: `/dashboard/organization/${currentOrgId}/mobile/activity`, icon: Activity },
                    { label: "Forms", href: `/dashboard/organization/${currentOrgId}/mobile/forms`, icon: FileText },
                    { label: "Uploads", href: `/dashboard/organization/${currentOrgId}/mobile/uploads`, icon: UploadIcon },
                    { label: "Reports", href: `/dashboard/organization/${currentOrgId}/mobile/reports`, icon: BarChart3 },
                    { label: "Analytics", href: `/dashboard/organization/${currentOrgId}/mobile/analytics`, icon: TrendingUpIcon },
                  ].map((item) => {
                    const fullHref = item.href
                    const isActive = pathname === fullHref || pathname.startsWith(fullHref + "/")
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* SaaS & Subscription sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/saas`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      SaaS & Subscription
                    </Link>
                  </div>
                  {[
                    { label: "Dashboard", href: `/dashboard/organization/${currentOrgId}/saas`, icon: LayoutDashboard },
                    { label: "Subscription", href: `/dashboard/organization/${currentOrgId}/saas/subscription`, icon: CreditCard },
                    { label: "Billing", href: `/dashboard/organization/${currentOrgId}/saas/billing`, icon: DollarSign },
                    { label: "Usage", href: `/dashboard/organization/${currentOrgId}/saas/usage`, icon: BarChart3 },
                    { label: "White Label", href: `/dashboard/organization/${currentOrgId}/saas/white-label`, icon: Palette },
                    { label: "Settings", href: `/dashboard/organization/${currentOrgId}/saas/settings`, icon: Settings },
                  ].map((item) => {
                    const fullHref = item.href
                    const isActive = pathname === fullHref || pathname.startsWith(fullHref + "/")
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Integrations Hub sub-nav */}
                  <div className="pt-4 pb-2">
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/integrations`}
                      className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                    >
                      Integrations
                    </Link>
                  </div>
                  {[
                    { label: "Dashboard", href: `/dashboard/organization/${currentOrgId}/integrations`, icon: Activity },
                    { label: "API Keys", href: `/dashboard/organization/${currentOrgId}/integrations/api-keys`, icon: Key },
                    { label: "OAuth Apps", href: `/dashboard/organization/${currentOrgId}/integrations/oauth`, icon: Shield },
                    { label: "Webhooks", href: `/dashboard/organization/${currentOrgId}/integrations/webhooks`, icon: Activity },
                    { label: "Connections", href: `/dashboard/organization/${currentOrgId}/integrations/connections`, icon: Globe },
                    { label: "Imports", href: `/dashboard/organization/${currentOrgId}/integrations/imports`, icon: UploadIcon },
                    { label: "Exports", href: `/dashboard/organization/${currentOrgId}/integrations/exports`, icon: FileText },
                    { label: "Jobs", href: `/dashboard/organization/${currentOrgId}/integrations/jobs`, icon: Clock },
                    { label: "Analytics", href: `/dashboard/organization/${currentOrgId}/integrations/analytics`, icon: BarChart3 },
                    { label: "Settings", href: `/dashboard/organization/${currentOrgId}/integrations/settings`, icon: Settings },
                  ].map((item) => {
                    const fullHref = item.href
                    const isActive = pathname === fullHref || pathname.startsWith(fullHref + "/")
                    return (
                      <Link
                        key={item.label}
                        href={fullHref}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}

                  {/* Participant sub-nav */}
                  {currentParticipantId ? (
                    <>
                      <div className="pt-4 pb-2">
                        <Link
                          href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/participants`}
                          className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 truncate block max-w-full"
                        >
                          Participant
                        </Link>
                      </div>
                      {[
                        { label: "Details", href: "", icon: User },
                        { label: "Registrations", href: "/registrations", icon: ClipboardList },
                        { label: "Attendance", href: "/attendance", icon: CalendarDays },
                        { label: "QR Cards", href: "/qr", icon: QrCode },
                        { label: "Teams", href: "/teams", icon: Users },
                        { label: "Import/Export", href: "/import", icon: Upload },
                      ].map((item) => {
                        const fullHref = `/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/participants${item.href}`
                        const isActive = item.href === "" ? pathname === fullHref : pathname.startsWith(fullHref)
                        return (
                          <Link
                            key={item.label}
                            href={fullHref}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              isActive ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        )
                      })}
                    </>
                  ) : (
                    <Link
                      href={`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/participants`}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        pathname.startsWith(`/dashboard/organization/${currentOrgId}/festivals/${currentFestivalId}/participants`)
                          ? "text-indigo-700 bg-indigo-50" : "text-gray-600 hover:text-indigo-700 hover:bg-indigo-50"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Users className="h-4 w-4" />
                      Participants
                    </Link>
                  )}
                </>
              )}
            </>
          )}
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
