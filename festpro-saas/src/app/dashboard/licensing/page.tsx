"use client"

import React, { useState, useEffect, useTransition } from "react"
import {
  Key,
  ShieldCheck,
  Activity,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Play,
  IndianRupee,
  Plus,
  Search,
  RefreshCw,
  X,
  Phone,
  Mail,
  Building2,
  Calendar,
  MessageSquare,
  Clock,
  Sparkles,
  Lock,
  Edit3,
  Trash2,
  Sliders,
  Users2,
  Trophy,
  Layers,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import {
  generateLicense,
  getLicenses,
  updateLicenseStatus,
  updateLicensePayment,
  updateLicenseDetails,
  deleteLicenseAction,
  clearAllDemoLicensesAction,
} from "@/lib/actions/licensing"
import type { SaasLicense, LicenseStatus } from "@/types/licensing"

export default function LicensingDashboard() {
  const [licenses, setLicenses] = useState<SaasLicense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Modals state
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generatedLicense, setGeneratedLicense] = useState<SaasLicense | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState<SaasLicense | null>(null)
  const [showHoldModal, setShowHoldModal] = useState<SaasLicense | null>(null)
  const [showEditModal, setShowEditModal] = useState<SaasLicense | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<SaasLicense | null>(null)
  const [showClearDemoConfirm, setShowClearDemoConfirm] = useState(false)

  // Generate form state with Limit Setting Options
  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    total_amount: "",
    paid_amount: "",
    max_festivals: "1",
    max_participants: "1000",
    max_competitions: "50",
    max_stages: "4",
    plan_tier: "pro" as "starter" | "pro" | "enterprise",
    valid_until_duration: "1_year", // 1_month, 3_months, 1_year, lifetime, custom
    custom_valid_until: "",
    notes: "",
  })

  // Edit form state
  const [editForm, setEditForm] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    total_amount: "",
    paid_amount: "",
    max_festivals: "1",
    max_participants: "1000",
    max_competitions: "50",
    max_stages: "4",
    plan_tier: "pro" as "starter" | "pro" | "enterprise",
    valid_until: "",
    notes: "",
  })

  // Payment update state
  const [paymentForm, setPaymentForm] = useState({
    paid_amount: "",
    total_amount: "",
  })

  // Hold reason state
  const [holdReason, setHoldReason] = useState("Pending balance payment")

  // Fetch licenses
  const loadLicenses = async () => {
    setIsLoading(true)
    try {
      const res = await getLicenses({
        status: statusFilter,
        search: searchQuery,
      })
      setLicenses(res.data || [])
    } catch (err) {
      toast.error("Failed to load licenses")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLicenses()
  }, [statusFilter])

  // Handle Search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadLicenses()
  }

  // Copy helper
  const copyToClipboard = (text: string, label = "Copied to clipboard!") => {
    navigator.clipboard.writeText(text)
    setCopiedKey(text)
    toast.success(label)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  // Helper to compute expiry date from duration
  const computeExpiryDate = (duration: string, customDate?: string): string | null => {
    if (duration === "lifetime") return null
    if (duration === "custom") return customDate || null
    const d = new Date()
    if (duration === "1_month") d.setMonth(d.getMonth() + 1)
    else if (duration === "3_months") d.setMonth(d.getMonth() + 3)
    else if (duration === "6_months") d.setMonth(d.getMonth() + 6)
    else if (duration === "1_year") d.setFullYear(d.getFullYear() + 1)
    else if (duration === "2_years") d.setFullYear(d.getFullYear() + 2)
    return d.toISOString().split("T")[0]
  }

  // Handle Generate License
  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client_name.trim()) {
      toast.error("Client or Organization name is required")
      return
    }

    startTransition(async () => {
      const total = Number(form.total_amount) || 0
      const paid = Number(form.paid_amount) || 0
      const expiry = computeExpiryDate(form.valid_until_duration, form.custom_valid_until)

      const res = await generateLicense({
        client_name: form.client_name,
        client_phone: form.client_phone,
        client_email: form.client_email,
        total_amount: total,
        paid_amount: paid,
        max_festivals: Number(form.max_festivals) || 1,
        max_participants: Number(form.max_participants) || null,
        max_competitions: Number(form.max_competitions) || null,
        max_stages: Number(form.max_stages) || null,
        plan_tier: form.plan_tier,
        valid_until: expiry || undefined,
        notes: form.notes,
      })

      if (res.error) {
        toast.error(res.error)
        return
      }

      if (res.license) {
        setGeneratedLicense(res.license)
        toast.success("License Key Generated Successfully!")
        setForm({
          client_name: "",
          client_phone: "",
          client_email: "",
          total_amount: "",
          paid_amount: "",
          max_festivals: "1",
          max_participants: "1000",
          max_competitions: "50",
          max_stages: "4",
          plan_tier: "pro",
          valid_until_duration: "1_year",
          custom_valid_until: "",
          notes: "",
        })
        loadLicenses()
      }
    })
  }

  // Handle Edit License Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showEditModal) return

    startTransition(async () => {
      const res = await updateLicenseDetails(showEditModal.id, {
        client_name: editForm.client_name,
        client_phone: editForm.client_phone || null,
        client_email: editForm.client_email || null,
        total_amount: Number(editForm.total_amount) || 0,
        paid_amount: Number(editForm.paid_amount) || 0,
        max_festivals: Number(editForm.max_festivals) || 1,
        max_participants: Number(editForm.max_participants) || null,
        max_competitions: Number(editForm.max_competitions) || null,
        max_stages: Number(editForm.max_stages) || null,
        plan_tier: editForm.plan_tier,
        valid_until: editForm.valid_until || null,
        notes: editForm.notes || null,
      })

      if (res.error) {
        toast.error(res.error)
        return
      }

      toast.success("License limits and client details updated!")
      setShowEditModal(null)
      loadLicenses()
    })
  }

  // Handle Delete License
  const handleDeleteLicense = async () => {
    if (!showDeleteConfirm) return
    startTransition(async () => {
      const res = await deleteLicenseAction(showDeleteConfirm.id)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(`License for ${showDeleteConfirm.client_name} deleted!`)
      setShowDeleteConfirm(null)
      loadLicenses()
    })
  }

  // Handle Clear All Demo Data
  const handleClearDemoData = async () => {
    startTransition(async () => {
      const res = await clearAllDemoLicensesAction()
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success("All demo data removed successfully!")
      setShowClearDemoConfirm(false)
      loadLicenses()
    })
  }

  // Handle Status change (Hold / Block / Activate)
  const handleStatusUpdate = async (
    licenseId: string,
    newStatus: LicenseStatus,
    reason?: string
  ) => {
    startTransition(async () => {
      const res = await updateLicenseStatus(licenseId, newStatus, reason)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(`License status changed to ${newStatus.toUpperCase()}`)
      setShowHoldModal(null)
      loadLicenses()
    })
  }

  // Handle Payment Update
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showPaymentModal) return

    startTransition(async () => {
      const paid = Number(paymentForm.paid_amount) || 0
      const total = paymentForm.total_amount ? Number(paymentForm.total_amount) : undefined

      const res = await updateLicensePayment(showPaymentModal.id, paid, total)
      if (res.error) {
        toast.error(res.error)
        return
      }

      toast.success("Payment recorded successfully!")
      setShowPaymentModal(null)
      loadLicenses()
    })
  }

  // Calculate high-level stats
  const totalDeals = licenses.length
  const totalRevenue = licenses.reduce((sum, l) => sum + (Number(l.total_amount) || 0), 0)
  const totalCollected = licenses.reduce((sum, l) => sum + (Number(l.paid_amount) || 0), 0)
  const totalPending = licenses.reduce((sum, l) => sum + (Number(l.pending_amount) || 0), 0)
  const activeCount = licenses.filter((l) => l.status === "active").length
  const holdCount = licenses.filter((l) => l.status === "on_hold").length
  const blockedCount = licenses.filter((l) => l.status === "blocked").length

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 text-gray-900">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-400/25 text-indigo-200 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-400/40">
              Super Admin Console
            </span>
            <span className="bg-emerald-400/25 text-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/40">
              Commercial SaaS
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            License & Access Key Management
          </h1>
          <p className="text-indigo-100/90 text-sm mt-1 max-w-2xl">
            Issue access codes for clients, customize participant and competition limits, track payments, and hold or block accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {licenses.length > 0 && (
            <button
              onClick={() => setShowClearDemoConfirm(true)}
              className="flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white border border-rose-400/30 px-3.5 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer"
              title="Remove demo mock records"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Demo Data</span>
            </button>
          )}

          <button
            onClick={() => {
              setGeneratedLicense(null)
              setShowGenerateModal(true)
            }}
            className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition duration-150 whitespace-nowrap cursor-pointer text-sm"
          >
            <Key className="h-4 w-4" />
            <span>Generate License Key</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Clients */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Total Clients
          </div>
          <div className="text-2xl font-black text-gray-900 mt-1">
            {totalDeals}
          </div>
          <div className="text-xs text-gray-600 mt-2 flex items-center gap-1.5 flex-wrap">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
              {activeCount} Active
            </span>
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold border border-amber-200">
              {holdCount} Hold
            </span>
            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold border border-rose-200">
              {blockedCount} Blocked
            </span>
          </div>
        </div>

        {/* Total Deal Value */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Total Deal Value
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-1">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Across all issued festival licenses
          </div>
        </div>

        {/* Collected Amount */}
        <div className="bg-emerald-50/80 p-5 rounded-xl border border-emerald-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Collected Amount
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            ₹{totalCollected.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Verified Paid Funds</span>
          </div>
        </div>

        {/* Pending Balance */}
        <div className="bg-amber-50/80 p-5 rounded-xl border border-amber-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
            Pending Balance
          </div>
          <div className="text-2xl font-black text-amber-800 mt-1">
            ₹{totalPending.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-amber-800 font-semibold mt-2 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Outstanding Client Dues</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client name, license key, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-medium">
            {[
              { id: "all", label: "All" },
              { id: "active", label: "Active" },
              { id: "on_hold", label: "On Hold" },
              { id: "blocked", label: "Blocked" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer font-semibold ${
                  statusFilter === tab.id
                    ? "bg-white text-indigo-700 font-bold shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={loadLicenses}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Licenses Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 text-xs uppercase font-extrabold tracking-wider">
                <th className="p-4">Client / Organization</th>
                <th className="p-4">Access Code / Key</th>
                <th className="p-4">Payment Breakdown</th>
                <th className="p-4">Status &amp; Dues</th>
                <th className="p-4">Quota &amp; Limit Settings</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {licenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <Key className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                    <p className="font-bold text-base text-gray-800">No License Keys Found</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                      All demo data has been cleared. Click "Generate License Key" above to issue a custom commercial license with limit settings for your clients.
                    </p>
                  </td>
                </tr>
              ) : (
                licenses.map((license) => (
                  <tr key={license.id} className="hover:bg-gray-50/80 transition">
                    {/* Client info */}
                    <td className="p-4">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                        <Building2 className="h-4 w-4 text-indigo-600" />
                        <span>{license.client_name}</span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-0.5 mt-1">
                        {license.client_phone && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{license.client_phone}</span>
                          </div>
                        )}
                        {license.client_email && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span>{license.client_email}</span>
                          </div>
                        )}
                        {license.notes && (
                          <div className="text-gray-400 italic">"{license.notes}"</div>
                        )}
                      </div>
                    </td>

                    {/* License Key */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <code className="bg-indigo-50 text-indigo-700 font-mono text-xs font-bold px-2.5 py-1.5 rounded-lg border border-indigo-200">
                          {license.license_key}
                        </code>
                        <button
                          onClick={() => copyToClipboard(license.license_key, "License Key Copied!")}
                          className="p-1 text-gray-400 hover:text-indigo-600 transition cursor-pointer"
                          title="Copy Key"
                        >
                          {copiedKey === license.license_key ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created {new Date(license.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Financials */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-gray-700 flex justify-between gap-4">
                          <span className="text-gray-500">Total:</span>
                          <span className="text-gray-900 font-bold">₹{license.total_amount?.toLocaleString("en-IN") || 0}</span>
                        </div>
                        <div className="text-xs text-emerald-700 flex justify-between gap-4">
                          <span className="text-gray-500">Paid:</span>
                          <span className="font-bold text-emerald-700">₹{license.paid_amount?.toLocaleString("en-IN") || 0}</span>
                        </div>
                        <div className="text-xs flex justify-between gap-4 pt-1 border-t border-gray-100">
                          <span className="font-semibold text-gray-500">Balance:</span>
                          <span
                            className={`font-black ${
                              (license.pending_amount || 0) > 0
                                ? "text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
                                : "text-emerald-700 font-bold"
                            }`}
                          >
                            ₹{license.pending_amount?.toLocaleString("en-IN") || 0}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status & Dues */}
                    <td className="p-4">
                      <div className="space-y-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            license.status === "active"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : license.status === "on_hold"
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "bg-rose-100 text-rose-800 border border-rose-300"
                          }`}
                        >
                          {license.status === "active" && <CheckCircle2 className="h-3 w-3" />}
                          {license.status === "on_hold" && <AlertTriangle className="h-3 w-3" />}
                          {license.status === "blocked" && <Ban className="h-3 w-3" />}
                          {license.status === "on_hold" ? "ON HOLD" : license.status.toUpperCase()}
                        </span>

                        {license.status === "on_hold" && license.hold_reason && (
                          <div className="text-[11px] text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-200 font-medium">
                            Reason: {license.hold_reason}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Quota & Limit Settings */}
                    <td className="p-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-black text-[10px] uppercase">
                            {license.plan_tier || "Pro"}
                          </span>
                          <span className="text-xs font-bold text-gray-800">
                            {license.max_festivals ? `${license.max_festivals} Fest` : "Unlimited Fests"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-gray-600 flex-wrap">
                          <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                            <Users2 className="h-3 w-3 text-slate-500" />
                            {license.max_participants ? `${license.max_participants.toLocaleString()} Regs` : "Unlimited Regs"}
                          </span>
                          <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                            <Trophy className="h-3 w-3 text-slate-500" />
                            {license.max_competitions ? `${license.max_competitions} Events` : "Unlimited Events"}
                          </span>
                          <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                            <Layers className="h-3 w-3 text-slate-500" />
                            {license.max_stages ? `${license.max_stages} Stages` : "Unlimited Stages"}
                          </span>
                        </div>

                        <div className="text-[11px] text-gray-500">
                          {license.valid_until ? (
                            <span className="text-amber-800 font-medium">
                              Expires: {new Date(license.valid_until).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium">Lifetime Validity</span>
                          )}
                        </div>

                        <div>
                          {license.is_activated ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" />
                              Activated {license.activated_at ? new Date(license.activated_at).toLocaleDateString() : ""}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                              <Clock className="h-3 w-3 text-gray-400" />
                              Not Claimed Yet
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Update Payment Button */}
                        <button
                          onClick={() => {
                            setShowPaymentModal(license)
                            setPaymentForm({
                              paid_amount: String(license.paid_amount || 0),
                              total_amount: String(license.total_amount || 0),
                            })
                          }}
                          className="px-2.5 py-1 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-300 transition cursor-pointer"
                        >
                          Update Payment
                        </button>

                        {/* Edit Limits & Info */}
                        <button
                          onClick={() => {
                            setShowEditModal(license)
                            setEditForm({
                              client_name: license.client_name || "",
                              client_phone: license.client_phone || "",
                              client_email: license.client_email || "",
                              total_amount: String(license.total_amount || 0),
                              paid_amount: String(license.paid_amount || 0),
                              max_festivals: String(license.max_festivals || 1),
                              max_participants: String(license.max_participants || 1000),
                              max_competitions: String(license.max_competitions || 50),
                              max_stages: String(license.max_stages || 4),
                              plan_tier: (license.plan_tier as any) || "pro",
                              valid_until: license.valid_until || "",
                              notes: license.notes || "",
                            })
                          }}
                          className="p-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition cursor-pointer"
                          title="Edit Client & Limits"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        {/* Hold / Unhold Button */}
                        {license.status === "active" ? (
                          <button
                            onClick={() => {
                              setShowHoldModal(license)
                              setHoldReason(
                                (license.pending_amount || 0) > 0
                                    ? `Pending balance payment of ₹${license.pending_amount}`
                                    : "Account placed on hold by administration"
                              )
                            }}
                            className="px-2.5 py-1 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-300 transition cursor-pointer"
                          >
                            Hold
                          </button>
                        ) : license.status === "on_hold" ? (
                          <button
                            onClick={() => handleStatusUpdate(license.id, "active")}
                            className="px-2.5 py-1 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-300 transition cursor-pointer"
                          >
                            Unhold
                          </button>
                        ) : null}

                        {/* Block / Unblock Button */}
                        {license.status !== "blocked" ? (
                          <button
                            onClick={() => {
                              if (confirm(`Block ${license.client_name}? They will lose access to manage festivals.`)) {
                                handleStatusUpdate(license.id, "blocked", "Account blocked by administration")
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition cursor-pointer"
                          >
                            Block
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusUpdate(license.id, "active")}
                            className="px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 transition cursor-pointer"
                          >
                            Unblock
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => setShowDeleteConfirm(license)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition cursor-pointer"
                          title="Delete License"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 1: GENERATE LICENSE KEY MODAL WITH LIMIT SETTING OPTIONS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {generatedLicense ? (
              /* Success View after Generating */
              <div className="space-y-5 text-center py-4">
                <div className="h-14 w-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    License Key Created!
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Send this access code to <span className="font-bold text-gray-800">{generatedLicense.client_name}</span> to activate their festival portal.
                  </p>
                </div>

                {/* Display Key */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <code className="text-lg md:text-xl font-mono font-black text-indigo-700 tracking-wider">
                    {generatedLicense.license_key}
                  </code>
                  <button
                    onClick={() => copyToClipboard(generatedLicense.license_key, "License Key Copied!")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Code</span>
                  </button>
                </div>

                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-left text-xs space-y-1">
                  <div className="font-bold text-indigo-950">Assigned Quotas &amp; Limits:</div>
                  <div className="text-indigo-800">
                    • Plan: <strong className="uppercase">{generatedLicense.plan_tier || "Pro"}</strong><br />
                    • Festivals: <strong>{generatedLicense.max_festivals || 1}</strong> | Participants: <strong>{generatedLicense.max_participants ? generatedLicense.max_participants.toLocaleString() : "Unlimited"}</strong><br />
                    • Competitions: <strong>{generatedLicense.max_competitions || "Unlimited"}</strong> | Stages: <strong>{generatedLicense.max_stages || "Unlimited"}</strong><br />
                    • Validity: <strong>{generatedLicense.valid_until ? new Date(generatedLicense.valid_until).toLocaleDateString() : "Lifetime"}</strong>
                  </div>
                </div>

                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Input Form */
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Generate New Access Code
                    </h3>
                    <p className="text-xs text-gray-500">
                      Create a commercial license key with custom limits and pricing.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleGenerateSubmit} className="space-y-4">
                  {/* Section 1: Client Info */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                      Client &amp; Contact Details
                    </h4>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Client / Organization Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Crescent Arts Fest / MES Arts Club"
                        value={form.client_name}
                        onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Client Phone / WhatsApp
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 9876543210"
                          value={form.client_phone}
                          onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Client Email
                        </label>
                        <input
                          type="email"
                          placeholder="client@example.com"
                          value={form.client_email}
                          onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Quota & Limit Setting Options */}
                  <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-3.5">
                    <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-indigo-700" />
                      Limit Setting Options (Quotas)
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Plan Tier */}
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                          Plan Tier
                        </label>
                        <select
                          value={form.plan_tier}
                          onChange={(e) => setForm({ ...form, plan_tier: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="starter">Starter Plan</option>
                          <option value="pro">Pro Plan (Popular)</option>
                          <option value="enterprise">Enterprise Plan</option>
                        </select>
                      </div>

                      {/* Max Festivals */}
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                          Festival Quota
                        </label>
                        <select
                          value={form.max_festivals}
                          onChange={(e) => setForm({ ...form, max_festivals: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="1">1 Festival Limit</option>
                          <option value="2">2 Festivals</option>
                          <option value="3">3 Festivals</option>
                          <option value="5">5 Festivals</option>
                          <option value="10">10 Festivals</option>
                          <option value="0">Unlimited Festivals</option>
                        </select>
                      </div>

                      {/* Max Participants */}
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                          Max Participants
                        </label>
                        <select
                          value={form.max_participants}
                          onChange={(e) => setForm({ ...form, max_participants: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="250">Up to 250 Registrations</option>
                          <option value="500">Up to 500 Registrations</option>
                          <option value="1000">Up to 1,000 Registrations</option>
                          <option value="2500">Up to 2,500 Registrations</option>
                          <option value="5000">Up to 5,000 Registrations</option>
                          <option value="10000">Up to 10,000 Registrations</option>
                          <option value="0">Unlimited Participants</option>
                        </select>
                      </div>

                      {/* Max Competitions */}
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                          Max Competitions
                        </label>
                        <select
                          value={form.max_competitions}
                          onChange={(e) => setForm({ ...form, max_competitions: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="25">Up to 25 Events</option>
                          <option value="50">Up to 50 Events</option>
                          <option value="100">Up to 100 Events</option>
                          <option value="200">Up to 200 Events</option>
                          <option value="0">Unlimited Events</option>
                        </select>
                      </div>

                      {/* Max Stages */}
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                          Max Stages
                        </label>
                        <select
                          value={form.max_stages}
                          onChange={(e) => setForm({ ...form, max_stages: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="2">2 Stages</option>
                          <option value="4">4 Stages</option>
                          <option value="8">8 Stages</option>
                          <option value="15">15 Stages</option>
                          <option value="0">Unlimited Stages</option>
                        </select>
                      </div>

                      {/* Validity Period */}
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                          Validity Period
                        </label>
                        <select
                          value={form.valid_until_duration}
                          onChange={(e) => setForm({ ...form, valid_until_duration: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="1_month">1 Month</option>
                          <option value="3_months">3 Months</option>
                          <option value="6_months">6 Months</option>
                          <option value="1_year">1 Year (Standard)</option>
                          <option value="2_years">2 Years</option>
                          <option value="lifetime">Lifetime Access</option>
                          <option value="custom">Custom Date</option>
                        </select>
                      </div>
                    </div>

                    {form.valid_until_duration === "custom" && (
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                          Custom Expiration Date
                        </label>
                        <input
                          type="date"
                          value={form.custom_valid_until}
                          onChange={(e) => setForm({ ...form, custom_valid_until: e.target.value })}
                          className="px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg font-medium text-gray-900"
                        />
                      </div>
                    )}
                  </div>

                  {/* Section 3: Financial Details */}
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <div className="text-xs font-bold text-gray-900 flex items-center gap-1">
                      <IndianRupee className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Financial &amp; Payment Details</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          Total Deal Amount (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 10000"
                          value={form.total_amount}
                          onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg font-bold text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">
                          Paid Advance (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 5000"
                          value={form.paid_amount}
                          onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg font-bold text-emerald-700"
                        />
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-600 flex justify-between font-medium">
                      <span>Calculated Pending Balance:</span>
                      <span className="font-bold text-amber-800">
                        ₹
                        {(
                          (Number(form.total_amount) || 0) - (Number(form.paid_amount) || 0)
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Section 4: Notes */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Internal Notes / Festival Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Official license for State Kalolsavam, includes 4 stages and SMS gateway."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowGenerateModal(false)}
                      className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isPending ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Key className="h-3.5 w-3.5" />
                          <span>Issue License Key</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 2: EDIT LICENSE & LIMITS MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-indigo-600" />
                  <span>Edit License &amp; Limits: {showEditModal.client_name}</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Update client contact details, quotas, and financial balance.
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={editForm.client_name}
                    onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
                    required
                    className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editForm.client_phone}
                    onChange={(e) => setEditForm({ ...editForm, client_phone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.client_email}
                    onChange={(e) => setEditForm({ ...editForm, client_email: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg text-gray-900 font-medium"
                  />
                </div>
              </div>

              {/* Limit Quotas Box */}
              <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-3">
                <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-indigo-700" />
                  Adjust Client Quota Limits
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 mb-1">Plan Tier</label>
                    <select
                      value={editForm.plan_tier}
                      onChange={(e) => setEditForm({ ...editForm, plan_tier: e.target.value as any })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg font-bold text-indigo-900"
                    >
                      <option value="starter">Starter</option>
                      <option value="pro">Pro Plan</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 mb-1">Festival Limit</label>
                    <select
                      value={editForm.max_festivals}
                      onChange={(e) => setEditForm({ ...editForm, max_festivals: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg font-bold text-gray-900"
                    >
                      <option value="1">1 Festival</option>
                      <option value="2">2 Festivals</option>
                      <option value="3">3 Festivals</option>
                      <option value="5">5 Festivals</option>
                      <option value="10">10 Festivals</option>
                      <option value="0">Unlimited</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 mb-1">Max Participants</label>
                    <select
                      value={editForm.max_participants}
                      onChange={(e) => setEditForm({ ...editForm, max_participants: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg font-bold text-gray-900"
                    >
                      <option value="250">250</option>
                      <option value="500">500</option>
                      <option value="1000">1,000</option>
                      <option value="2500">2,500</option>
                      <option value="5000">5,000</option>
                      <option value="10000">10,000</option>
                      <option value="0">Unlimited</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 mb-1">Max Competitions</label>
                    <select
                      value={editForm.max_competitions}
                      onChange={(e) => setEditForm({ ...editForm, max_competitions: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg font-bold text-gray-900"
                    >
                      <option value="25">25 Events</option>
                      <option value="50">50 Events</option>
                      <option value="100">100 Events</option>
                      <option value="200">200 Events</option>
                      <option value="0">Unlimited</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 mb-1">Max Stages</label>
                    <select
                      value={editForm.max_stages}
                      onChange={(e) => setEditForm({ ...editForm, max_stages: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg font-bold text-gray-900"
                    >
                      <option value="2">2 Stages</option>
                      <option value="4">4 Stages</option>
                      <option value="8">8 Stages</option>
                      <option value="15">15 Stages</option>
                      <option value="0">Unlimited</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 mb-1">Valid Until</label>
                    <input
                      type="date"
                      value={editForm.valid_until ? editForm.valid_until.split("T")[0] : ""}
                      onChange={(e) => setEditForm({ ...editForm, valid_until: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg font-bold text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Financials */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Total Deal Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={editForm.total_amount}
                    onChange={(e) => setEditForm({ ...editForm, total_amount: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg font-bold text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Paid Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={editForm.paid_amount}
                    onChange={(e) => setEditForm({ ...editForm, paid_amount: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 3: RECORD PAYMENT MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Record Payment for {showPaymentModal.client_name}
              </h3>
              <button
                onClick={() => setShowPaymentModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Total Deal Amount (₹)
                </label>
                <input
                  type="number"
                  value={paymentForm.total_amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, total_amount: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Newly Updated Total Paid Amount (₹)
                </label>
                <input
                  type="number"
                  value={paymentForm.paid_amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, paid_amount: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg font-bold text-emerald-700"
                />
                <p className="text-[11px] text-gray-500 mt-1 font-medium">
                  If total paid equals total deal, pending balance becomes 0 and any hold is automatically released!
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg text-xs flex justify-between font-medium border border-gray-200">
                <span className="text-gray-600">New Pending Balance:</span>
                <span className="font-black text-amber-800">
                  ₹
                  {(
                    (Number(paymentForm.total_amount) || 0) -
                    (Number(paymentForm.paid_amount) || 0)
                  ).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-xs cursor-pointer"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 4: PUT ON HOLD REASON MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showHoldModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span>Put Account On Hold</span>
              </h3>
              <button
                onClick={() => setShowHoldModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-3">
              Putting <strong className="text-gray-900">{showHoldModal.client_name}</strong> on hold will display an alert banner across their dashboard asking them to clear pending dues.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Reason for Hold
                </label>
                <input
                  type="text"
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHoldModal(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleStatusUpdate(showHoldModal.id, "on_hold", holdReason)
                  }
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition shadow-xs cursor-pointer"
                >
                  Confirm Hold
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 5: DELETE LICENSE CONFIRMATION */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="h-6 w-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">
                Delete License Key?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to completely delete the license for <strong className="text-gray-800">{showDeleteConfirm.client_name}</strong> (<code className="font-mono text-indigo-700">{showDeleteConfirm.license_key}</code>)?
              </p>
              <p className="text-[11px] text-rose-600 font-semibold mt-2">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteLicense}
                disabled={isPending}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition shadow-xs cursor-pointer"
              >
                {isPending ? "Deleting..." : "Yes, Delete License"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 6: CLEAR ALL DEMO LICENSES CONFIRMATION */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showClearDemoConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">
                Clear All Demo Data?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                This will delete all sample/demo festival licenses and reset your client licensing dashboard to a completely clean state.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearDemoConfirm(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearDemoData}
                disabled={isPending}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition shadow-xs cursor-pointer"
              >
                {isPending ? "Clearing..." : "Yes, Clear Demo Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
