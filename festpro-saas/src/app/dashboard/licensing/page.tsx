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
} from "lucide-react"
import { toast } from "sonner"
import {
  generateLicense,
  getLicenses,
  updateLicenseStatus,
  updateLicensePayment,
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

  // Generate form state
  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    total_amount: "",
    paid_amount: "",
    max_festivals: "1",
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

      const res = await generateLicense({
        client_name: form.client_name,
        client_phone: form.client_phone,
        client_email: form.client_email,
        total_amount: total,
        paid_amount: paid,
        max_festivals: Number(form.max_festivals) || 1,
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
          notes: "",
        })
        loadLicenses()
      }
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/30 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/40">
              Super Admin Console
            </span>
            <span className="bg-emerald-500/30 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
              Commercial SaaS
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            License & Access Key Management
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Issue access codes for clients, enforce the 1-festival limit, track payments, and put accounts on hold or block if dues are pending.
          </p>
        </div>

        <button
          onClick={() => {
            setGeneratedLicense(null)
            setShowGenerateModal(true)
          }}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold px-5 py-3 rounded-xl shadow-lg transition duration-150 whitespace-nowrap cursor-pointer"
        >
          <Key className="h-5 w-5" />
          <span>Generate License Key</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Clients
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalDeals}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-600 font-medium">{activeCount} Active</span>
            <span>•</span>
            <span className="text-amber-600 font-medium">{holdCount} Hold</span>
            <span>•</span>
            <span className="text-rose-600 font-medium">{blockedCount} Blocked</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Deal Value
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Across all issued festival licenses
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Collected Amount
          </div>
          <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1">
            ₹{totalCollected.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Verified Paid Funds</span>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-xl border border-amber-200 dark:border-amber-800 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Pending Balance
          </div>
          <div className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1">
            ₹{totalPending.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Outstanding Client Dues</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client name, license key, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-semibold rounded-lg transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg text-xs font-medium">
            {[
              { id: "all", label: "All" },
              { id: "active", label: "Active" },
              { id: "on_hold", label: "On Hold" },
              { id: "blocked", label: "Blocked" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={loadLicenses}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Licenses Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                <th className="p-4">Client / Organization</th>
                <th className="p-4">Access Code / Key</th>
                <th className="p-4">Payment Breakdown</th>
                <th className="p-4">Status & Dues</th>
                <th className="p-4">Quota & Activation</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-200 dark:divide-slate-700">
              {licenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <Key className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="font-semibold text-base">No License Keys Found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click "Generate License Key" above to create an access code for your first client!
                    </p>
                  </td>
                </tr>
              ) : (
                licenses.map((license) => (
                  <tr
                    key={license.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition"
                  >
                    {/* Client info */}
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-indigo-500" />
                        <span>{license.client_name}</span>
                      </div>
                      <div className="text-xs text-slate-500 space-y-0.5 mt-1">
                        {license.client_phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{license.client_phone}</span>
                          </div>
                        )}
                        {license.client_email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{license.client_email}</span>
                          </div>
                        )}
                        {license.notes && (
                          <div className="text-slate-400 italic">"{license.notes}"</div>
                        )}
                      </div>
                    </td>

                    {/* License Key */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <code className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          {license.license_key}
                        </code>
                        <button
                          onClick={() => copyToClipboard(license.license_key, "License Key Copied!")}
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                          title="Copy Key"
                        >
                          {copiedKey === license.license_key ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Created {new Date(license.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Financials */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex justify-between gap-4">
                          <span>Total:</span>
                          <span>₹{license.total_amount?.toLocaleString("en-IN") || 0}</span>
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 flex justify-between gap-4">
                          <span>Paid:</span>
                          <span className="font-semibold">₹{license.paid_amount?.toLocaleString("en-IN") || 0}</span>
                        </div>
                        <div className="text-xs flex justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-700">
                          <span className="font-medium text-slate-500">Balance:</span>
                          <span
                            className={`font-bold ${
                              (license.pending_amount || 0) > 0
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-emerald-600 dark:text-emerald-400"
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
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : license.status === "on_hold"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                          }`}
                        >
                          {license.status === "active" && <CheckCircle2 className="h-3 w-3" />}
                          {license.status === "on_hold" && <AlertTriangle className="h-3 w-3" />}
                          {license.status === "blocked" && <Ban className="h-3 w-3" />}
                          {license.status === "on_hold" ? "ON HOLD" : license.status.toUpperCase()}
                        </span>

                        {license.status === "on_hold" && license.hold_reason && (
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 p-1.5 rounded border border-amber-200 dark:border-amber-900">
                            Reason: {license.hold_reason}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Quota & Activation */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Limit: {license.max_festivals || 1} Festival
                        </div>
                        <div>
                          {license.is_activated ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="h-3 w-3" />
                              Activated {license.activated_at ? new Date(license.activated_at).toLocaleDateString() : ""}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                              <Clock className="h-3 w-3" />
                              Not Claimed Yet
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Record Payment Button */}
                        <button
                          onClick={() => {
                            setShowPaymentModal(license)
                            setPaymentForm({
                              paid_amount: String(license.paid_amount || 0),
                              total_amount: String(license.total_amount || 0),
                            })
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                        >
                          Update Payment
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
                            className="px-2.5 py-1 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 transition cursor-pointer"
                          >
                            Hold Account
                          </button>
                        ) : license.status === "on_hold" ? (
                          <button
                            onClick={() => handleStatusUpdate(license.id, "active")}
                            className="px-2.5 py-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800 transition cursor-pointer"
                          >
                            Activate (Unhold)
                          </button>
                        ) : null}

                        {/* Block / Unblock Button */}
                        {license.status !== "blocked" ? (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to completely BLOCK ${license.client_name}? They will lose access to manage festivals.`)) {
                                handleStatusUpdate(license.id, "blocked", "Account blocked by administration")
                              }
                            }}
                            className="px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition cursor-pointer"
                          >
                            Block
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusUpdate(license.id, "active")}
                            className="px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition cursor-pointer"
                          >
                            Unblock
                          </button>
                        )}
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
      {/* MODAL 1: GENERATE LICENSE KEY MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {generatedLicense ? (
              /* Success View after Generating */
              <div className="space-y-5 text-center">
                <div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    License Key Created!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Send this code to <span className="font-semibold text-slate-800 dark:text-slate-200">{generatedLicense.client_name}</span> to activate their festival.
                  </p>
                </div>

                {/* Display Key */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <code className="text-lg md:text-xl font-mono font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
                    {generatedLicense.license_key}
                  </code>
                  <button
                    onClick={() => copyToClipboard(generatedLicense.license_key, "License Key Copied!")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </button>
                </div>

                {/* WhatsApp Message Template */}
                <div className="text-left bg-indigo-50/70 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900 text-xs space-y-2">
                  <div className="font-bold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp / Client Message:</span>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-100/60 dark:border-slate-800 text-[11px] select-all">
{`Hello ${generatedLicense.client_name},
Your FestPro Festival Management access is ready!

🔗 Registration Link: https://festpro.ahraz.site/signup
🔑 Access Code: ${generatedLicense.license_key}
🎪 Quota: 1 Festival
💰 Total: ₹${generatedLicense.total_amount} | Paid: ₹${generatedLicense.paid_amount} | Balance: ₹${generatedLicense.pending_amount}

Please open the link, enter the Access Code, and create your account.`}
                  </pre>
                  <button
                    onClick={() => {
                      const msg = `Hello ${generatedLicense.client_name},\nYour FestPro Festival Management access is ready!\n\n🔗 Registration Link: https://festpro.ahraz.site/signup\n🔑 Access Code: ${generatedLicense.license_key}\n🎪 Quota: 1 Festival\n💰 Total: ₹${generatedLicense.total_amount} | Paid: ₹${generatedLicense.paid_amount} | Balance: ₹${generatedLicense.pending_amount}\n\nPlease open the link, enter the Access Code, and create your account.`
                      copyToClipboard(msg, "Client Message Copied to Clipboard!")
                    }}
                    className="w-full py-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/60 dark:hover:bg-indigo-800 text-indigo-800 dark:text-indigo-200 font-semibold rounded-lg text-xs transition cursor-pointer"
                  >
                    Copy Complete Message
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowGenerateModal(false)
                      setGeneratedLicense(null)
                    }}
                    className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-sm transition cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              /* Generate Form */
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Generate New Access Code
                    </h3>
                    <p className="text-xs text-slate-500">
                      Create a commercial license key for a customer deal.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleGenerateSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Client / Organization Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MES College Arts Club / Crescent Fest"
                      value={form.client_name}
                      onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Client Phone / WhatsApp
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        value={form.client_phone}
                        onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Client Email
                      </label>
                      <input
                        type="email"
                        placeholder="client@example.com"
                        value={form.client_email}
                        onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Financial details */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                      <IndianRupee className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Financial & Payment Details</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Total Deal Amount (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 10000"
                          value={form.total_amount}
                          onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Paid Advance (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 5000"
                          value={form.paid_amount}
                          onChange={(e) => setForm({ ...form, paid_amount: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>Calculated Pending Balance:</span>
                      <span className="font-bold text-amber-600">
                        ₹
                        {(
                          (Number(form.total_amount) || 0) - (Number(form.paid_amount) || 0)
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Festival Quota */}
                  <div className="flex items-center justify-between p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900 text-xs">
                    <div>
                      <span className="font-bold text-indigo-950 dark:text-indigo-300">
                        Festival Quota: 1 Festival Limit
                      </span>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                        Strictly enforced for commercial tier.
                      </p>
                    </div>
                    <span className="bg-indigo-600 text-white font-bold px-2 py-0.5 rounded text-[11px]">
                      1 FEST
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Internal Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 50% advance received via GPay"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowGenerateModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      {isPending ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Key className="h-3.5 w-3.5" />
                          <span>Generate Access Key</span>
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
      {/* MODAL 2: UPDATE PAYMENT MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Record Payment for {showPaymentModal.client_name}
              </h3>
              <button
                onClick={() => setShowPaymentModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Deal Amount (₹)
                </label>
                <input
                  type="number"
                  value={paymentForm.total_amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, total_amount: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Newly Updated Total Paid Amount (₹)
                </label>
                <input
                  type="number"
                  value={paymentForm.paid_amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, paid_amount: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-emerald-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  If total paid equals total deal, pending balance becomes 0 and any hold is automatically released!
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs flex justify-between">
                <span>New Pending Balance:</span>
                <span className="font-bold text-amber-600">
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
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition shadow cursor-pointer"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 3: PUT ON HOLD REASON MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showHoldModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>Put Account On Hold</span>
              </h3>
              <button
                onClick={() => setShowHoldModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Putting <strong className="text-slate-800 dark:text-slate-200">{showHoldModal.client_name}</strong> on hold will display an alert banner across their dashboard asking them to clear pending dues.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Hold
                </label>
                <input
                  type="text"
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHoldModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleStatusUpdate(showHoldModal.id, "on_hold", holdReason)
                  }
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition shadow cursor-pointer"
                >
                  Confirm Hold
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
