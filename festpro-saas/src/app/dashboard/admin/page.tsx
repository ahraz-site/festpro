"use client"

import React, { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Building2,
  CalendarDays,
  Users,
  Key,
  ShieldCheck,
  Search,
  ExternalLink,
  Trash2,
  Lock,
  Mail,
  RefreshCw,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  Layers,
  ArrowRight,
  UserX,
  Copy,
  Check,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react"
import { FestProLogo, FestProFavicon } from "@/components/ui/logo"
import {
  getAdminDashboardOverview,
  adminSetUserPasswordAction,
  adminSendResetEmailAction,
  adminDeleteUserAccountAction,
  adminDeleteFestivalAction,
  adminPurgeNonAdminAccountsAction,
} from "@/lib/actions/admin"

export default function SuperAdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<"festivals" | "accounts" | "licenses">("festivals")
  
  // Search filters
  const [festSearch, setFestSearch] = useState("")
  const [accountSearch, setAccountSearch] = useState("")

  // Password Modal
  const [passwordModalUser, setPasswordModalUser] = useState<any | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [showPasswordText, setShowPasswordText] = useState(false)

  // Delete Festival Modal
  const [deleteFestivalTarget, setDeleteFestivalTarget] = useState<any | null>(null)

  // Delete User Modal
  const [deleteUserTarget, setDeleteUserTarget] = useState<any | null>(null)

  // Purge Modal
  const [showPurgeModal, setShowPurgeModal] = useState(false)

  // Copied Key feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await getAdminDashboardOverview()
      if (res.error) {
        toast.error(res.error)
      } else if (res.data) {
        setData(res.data)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load super admin data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Handle setting a user's password
  const handleSavePassword = () => {
    if (!passwordModalUser || !newPassword) return
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    startTransition(async () => {
      const res = await adminSetUserPasswordAction(passwordModalUser.id, newPassword)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(res.message || "Password updated successfully!")
        setPasswordModalUser(null)
        setNewPassword("")
      }
    })
  }

  // Handle sending reset password email
  const handleSendResetEmail = (email: string) => {
    startTransition(async () => {
      const res = await adminSendResetEmailAction(email)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(res.message || "Password reset link sent!")
      }
    })
  }

  // Handle single user deletion
  const handleDeleteUser = () => {
    if (!deleteUserTarget) return
    startTransition(async () => {
      const res = await adminDeleteUserAccountAction(deleteUserTarget.id)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Account deleted successfully")
        setDeleteUserTarget(null)
        loadData()
      }
    })
  }

  // Handle festival deletion
  const handleDeleteFestival = () => {
    if (!deleteFestivalTarget) return
    startTransition(async () => {
      const res = await adminDeleteFestivalAction(deleteFestivalTarget.id)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Festival removed successfully")
        setDeleteFestivalTarget(null)
        loadData()
      }
    })
  }

  // Handle purging all non-admin accounts
  const handlePurgeNonAdminAccounts = () => {
    startTransition(async () => {
      const res = await adminPurgeNonAdminAccountsAction()
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(res.message || "Non-admin accounts purged successfully!")
        setShowPurgeModal(false)
        loadData()
      }
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(text)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopiedKey(null), 2000)
  }

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-pulse">
          <FestProFavicon size={52} className="shadow-lg rounded-full" />
        </div>
        <p className="text-xs font-bold text-slate-700 tracking-wider uppercase animate-pulse">
          Loading Super Admin Control Center...
        </p>
      </div>
    )
  }

  const stats = data?.stats || {
    totalFestivals: 0,
    totalAccounts: 0,
    totalOrganizations: 0,
    totalLicenses: 0,
  }

  const festivals = (data?.festivals || []).filter((f: any) => {
    if (!festSearch) return true
    const q = festSearch.toLowerCase()
    return (
      f.name?.toLowerCase().includes(q) ||
      f.code?.toLowerCase().includes(q) ||
      f.organizationName?.toLowerCase().includes(q)
    )
  })

  const accounts = (data?.accounts || []).filter((a: any) => {
    if (!accountSearch) return true
    const q = accountSearch.toLowerCase()
    return (
      a.email?.toLowerCase().includes(q) ||
      a.name?.toLowerCase().includes(q) ||
      a.organizationName?.toLowerCase().includes(q)
    )
  })

  const licenses = data?.licenses || []

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── TOP BANNER ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold tracking-wide uppercase border border-emerald-500/30">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Platform Super Admin Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Super Admin Control Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Master control for all festivals, user accounts, security credentials, and client licenses across FesPro.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => setShowPurgeModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <UserX className="h-4 w-4" />
              Remove All Non-Admin Accounts
            </button>
            <button
              onClick={loadData}
              disabled={isLoading || isPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL FESTIVALS */}
        <div
          onClick={() => setActiveTab("festivals")}
          className={`cursor-pointer bg-white rounded-2xl border p-5 shadow-xs transition-all ${
            activeTab === "festivals" ? "border-indigo-600 ring-2 ring-indigo-600/20" : "border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Created Festivals
            </span>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalFestivals}
          </div>
          <div className="text-[11px] font-semibold text-indigo-600 mt-1 flex items-center gap-1">
            View all festivals <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* TOTAL USER ACCOUNTS */}
        <div
          onClick={() => setActiveTab("accounts")}
          className={`cursor-pointer bg-white rounded-2xl border p-5 shadow-xs transition-all ${
            activeTab === "accounts" ? "border-indigo-600 ring-2 ring-indigo-600/20" : "border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              User Accounts
            </span>
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalAccounts}
          </div>
          <div className="text-[11px] font-semibold text-purple-600 mt-1 flex items-center gap-1">
            Manage passwords &amp; accounts <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* ORGANIZATIONS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Organizations
            </span>
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalOrganizations}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            Registered organizations
          </div>
        </div>

        {/* LICENSES */}
        <div
          onClick={() => setActiveTab("licenses")}
          className={`cursor-pointer bg-white rounded-2xl border p-5 shadow-xs transition-all ${
            activeTab === "licenses" ? "border-indigo-600 ring-2 ring-indigo-600/20" : "border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Licenses &amp; Keys
            </span>
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Key className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {stats.totalLicenses}
          </div>
          <div className="text-[11px] font-semibold text-amber-600 mt-1 flex items-center gap-1">
            View access keys <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("festivals")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === "festivals"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          All Created Festivals ({festivals.length})
        </button>
        <button
          onClick={() => setActiveTab("accounts")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === "accounts"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Users className="h-4 w-4" />
          Accounts &amp; Credentials ({accounts.length})
        </button>
        <button
          onClick={() => setActiveTab("licenses")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === "licenses"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Key className="h-4 w-4" />
          Access Keys &amp; Licensing ({licenses.length})
        </button>
      </div>

      {/* ── TAB 1: ALL CREATED FESTIVALS ── */}
      {activeTab === "festivals" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search festival name, code, or organization..."
                value={festSearch}
                onChange={(e) => setFestSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-600"
              />
            </div>
          </div>

          {festivals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <CalendarDays className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No festivals found</h3>
              <p className="text-xs text-slate-500">
                {festSearch ? "No results matched your search." : "No festivals have been created yet."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3.5 px-4">Festival</th>
                      <th className="py-3.5 px-4">Organization</th>
                      <th className="py-3.5 px-4">Subdomain / Live URL</th>
                      <th className="py-3.5 px-4">Stats</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {festivals.map((fest: any) => {
                      const festSlug =
                        fest.short_name?.toLowerCase() ||
                        fest.code?.toLowerCase() ||
                        (fest.name ? fest.name.toLowerCase().replace(/[^a-z0-9]/g, "") : "") ||
                        "optimuz"
                      const publicUrl = `https://${festSlug}.ahraz.site`
                      const internalPublicUrl = `https://${festSlug}.ahraz.site`
                      const fallbackPathUrl = `/festivals/${festSlug}`
                      const adminDashboardUrl = `/dashboard/organization/${fest.organization_id}/festivals/${fest.id}`

                      return (
                        <tr key={fest.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0">
                                {fest.name?.slice(0, 2).toUpperCase() || "FP"}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{fest.name}</div>
                                <div className="text-[11px] font-mono text-slate-400">
                                  ID: {fest.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-slate-700 font-medium">
                            {fest.organizationName}
                          </td>

                          <td className="py-4 px-4">
                            <a
                              href={internalPublicUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
                            >
                              <span>{festSlug}.ahraz.site</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3 text-slate-600 font-medium">
                              <span><strong>{fest.participantsCount}</strong> Students</span>
                              <span>•</span>
                              <span><strong>{fest.competitionsCount}</strong> Programs</span>
                              <span>•</span>
                              <span><strong>{fest.teamsCount}</strong> Teams</span>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {fest.status || "Active"}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <Link
                                href={adminDashboardUrl}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-2xs"
                              >
                                <span>Open Workspace</span>
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                              <button
                                onClick={() => setDeleteFestivalTarget(fest)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Festival"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: USER ACCOUNTS & CREDENTIALS ── */}
      {activeTab === "accounts" && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-bold">Master Super Admin Accounts Protected:</p>
              <p className="text-amber-800">
                <strong>ahraz.site@gmail.com</strong> and <strong>ahraza272@gmail.com</strong> have permanent full master admin permissions and can never be deleted. You can directly view credentials, change passwords, send reset links, or delete individual organizer accounts below.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search user by email or name..."
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-600"
              />
            </div>
            <button
              onClick={() => setShowPurgeModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 text-xs font-bold transition-all"
            >
              <UserX className="h-4 w-4" />
              Purge All Except Admins
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Organization</th>
                    <th className="py-3.5 px-4">Created</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Password / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.map((user: any) => {
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              user.isMasterAdmin ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-slate-100 text-slate-700"
                            }`}>
                              {user.name?.slice(0, 2).toUpperCase() || "U"}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                {user.name}
                                {user.isMasterAdmin && (
                                  <span className="px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 text-[9px] font-black uppercase">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            user.isMasterAdmin
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            {user.role}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-slate-600 font-medium">
                          {user.organizationName}
                        </td>

                        <td className="py-4 px-4 text-slate-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Active
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setPasswordModalUser(user)
                                setNewPassword("")
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors"
                              title="Set or reset password"
                            >
                              <Lock className="h-3 w-3" />
                              Set Password
                            </button>
                            <button
                              onClick={() => handleSendResetEmail(user.email)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="Send Password Reset Email"
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </button>
                            {!user.isMasterAdmin && (
                              <button
                                onClick={() => setDeleteUserTarget(user)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Account"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: LICENSING & ACCESS KEYS ── */}
      {activeTab === "licenses" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Generated Access Keys &amp; Client Licenses
            </h2>
            <Link
              href="/dashboard/licensing"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Full Licensing Dashboard
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3.5 px-4">Client Name</th>
                    <th className="py-3.5 px-4">License Key</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {licenses.map((lic: any) => (
                    <tr key={lic.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-900">
                        {lic.client_name}
                        <div className="text-[11px] font-normal text-slate-400">{lic.client_email || lic.client_phone}</div>
                      </td>
                      <td className="py-4 px-4">
                        <code className="px-2 py-1 bg-slate-100 rounded-md font-mono text-indigo-700 font-bold text-xs">
                          {lic.license_key}
                        </code>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-700">
                        ₹{(lic.paid_amount || 0).toLocaleString()} / ₹{(lic.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {lic.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => copyToClipboard(lic.license_key)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                        >
                          {copiedKey === lic.license_key ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          Copy Key
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: SET PASSWORD DIRECTLY ── */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Lock className="h-4 w-4 text-indigo-600" />
                Set Password for Account
              </h3>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <p>User: <strong>{passwordModalUser.name}</strong></p>
              <p className="font-mono text-slate-500">{passwordModalUser.email}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">New Password</label>
              <div className="relative">
                <input
                  type={showPasswordText ? "text" : "password"}
                  placeholder="Enter at least 6 characters..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-indigo-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswordText ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePassword}
                disabled={isPending || !newPassword}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                {isPending ? "Updating..." : "Save Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE FESTIVAL CONFIRMATION ── */}
      {deleteFestivalTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-bold text-sm">Delete Festival Completely?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong>{deleteFestivalTarget.name}</strong>? All associated participants, competitions, teams, stages, and results will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteFestivalTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFestival}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs"
              >
                {isPending ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DELETE SINGLE USER CONFIRMATION ── */}
      {deleteUserTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <UserX className="h-6 w-6" />
              <h3 className="font-bold text-sm">Delete User Account?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong>{deleteUserTarget.name}</strong> ({deleteUserTarget.email})? They will lose access to the system.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteUserTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs"
              >
                {isPending ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: PURGE ALL NON-ADMIN ACCOUNTS ── */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-red-200 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-7 w-7 shrink-0" />
              <div>
                <h3 className="font-black text-sm">Purge All Non-Admin Accounts</h3>
                <p className="text-[11px] text-slate-500">As requested: Keep only master super admins</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-700 space-y-2 border border-slate-200">
              <p className="font-bold text-slate-900">This action will:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Delete all test/demo organizer and user accounts in Supabase Auth &amp; database</li>
                <li>
                  Permanently protect and keep master admins:
                  <br />
                  <strong className="text-emerald-700">• ahraz.site@gmail.com</strong>
                  <br />
                  <strong className="text-emerald-700">• ahraza272@gmail.com</strong>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPurgeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handlePurgeNonAdminAccounts}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95"
              >
                {isPending ? "Purging accounts..." : "Yes, Purge Non-Admin Accounts"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
