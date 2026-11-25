"use client"

import React, { useState, useEffect, useTransition } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  ShieldCheck,
  Award,
  Users,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  RefreshCw,
  FileText,
  AlertCircle,
  Eye,
  Filter,
  Copy,
  Plus,
  Key,
  Check,
  Trash2,
} from "lucide-react"
import { getJudgingDashboard, getPendingApprovals, approveScore } from "@/lib/actions/judging/approval"
import { getCompetitions } from "@/lib/actions/competition"
import {
  getFestivalJudgesAction,
  saveFestivalJudgeAction,
  deleteFestivalJudgeAction,
  type JudgeAccount,
} from "@/lib/actions/judge-auth"

export default function JudgesPanelPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [dashboard, setDashboard] = useState<any>(null)
  const [competitions, setCompetitions] = useState<any[]>([])
  const [approvals, setApprovals] = useState<any[]>([])
  const [judgesList, setJudgesList] = useState<JudgeAccount[]>([])
  const [showAddJudge, setShowAddJudge] = useState(false)
  const [newJudgeForm, setNewJudgeForm] = useState({
    name: "",
    username: "",
    password: "123",
    stageName: "Main Stage 1",
    phone: "",
    isLead: false,
  })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<"competitions" | "approvals" | "judge_accounts" | "blind_codes">("judge_accounts")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  const loadData = () => {
    setLoading(true)
    Promise.all([
      getJudgingDashboard(festivalId),
      getCompetitions(festivalId),
      getPendingApprovals(festivalId),
      getFestivalJudgesAction(festivalId),
    ])
      .then(([dashRes, compRes, appRes, judgeRes]) => {
        if (dashRes?.data) setDashboard(dashRes.data)
        if (Array.isArray(compRes)) setCompetitions(compRes)
        if (appRes?.data) setApprovals(appRes.data)
        if (judgeRes?.data) setJudgesList(judgeRes.data)
      })
      .catch((err) => toast.error(err.message || "Failed to load judges data"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (festivalId) loadData()
  }, [festivalId])

  const handleApprove = (approvalId: string) => {
    startTransition(async () => {
      const res = await approveScore(approvalId)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Score scorecard approved and verified")
        setApprovals((prev) => prev.filter((a) => a.id !== approvalId))
      }
    })
  }

  const handleCreateJudge = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await saveFestivalJudgeAction(festivalId, newJudgeForm)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(`Judge "${newJudgeForm.name}" created with username: ${res.data?.username}`)
        setShowAddJudge(false)
        setNewJudgeForm({
          name: "",
          username: `judge${judgesList.length + 1}`,
          password: "123",
          stageName: "Main Stage 1",
          phone: "",
          isLead: false,
        })
        loadData()
      }
    })
  }

  const handleDeleteJudge = (judgeId: string) => {
    if (!confirm("Remove this judge account?")) return
    startTransition(async () => {
      const res = await deleteFestivalJudgeAction(festivalId, judgeId)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Judge removed")
        setJudgesList((prev) => prev.filter((j) => j.id !== judgeId))
      }
    })
  }

  const copyJudgeSlip = (j: JudgeAccount) => {
    const text = `FestPro Judge Login\nJudge: ${j.name}\nUsername: ${j.username}\nPassword: ${j.password || "123"}\nStage: ${j.stage_name || "Main Stage"}\nLogin Portal: https://fespro.ahraz.site/login`
    navigator.clipboard.writeText(text)
    setCopiedId(j.id)
    toast.success(`Credentials copied for ${j.name}!`)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const copyAllSlips = () => {
    const text = judgesList
      .map(
        (j, i) =>
          `${i + 1}. ${j.name}\n   Username: ${j.username}\n   Password: ${j.password || "123"}\n   Stage: ${j.stage_name || "Main Stage"}`
      )
      .join("\n\n")
    navigator.clipboard.writeText(
      `Official Festival Judges Login Roster:\nLogin Link: https://fespro.ahraz.site/login\n\n${text}`
    )
    toast.success("All judge credentials copied to clipboard for WhatsApp/print!")
  }

  const filteredCompetitions = competitions.filter((c) => {
    const matchesSearch =
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase())
    const matchesCat =
      selectedCategory === "All" || c.category?.name === selectedCategory
    return matchesSearch && matchesCat
  })

  const categories = ["All", ...Array.from(new Set(competitions.map((c) => c.category?.name).filter(Boolean)))]

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Judging &amp; Jury Control Console</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Judges Panel
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage stage jury assignments, blind code sheets, score verification &amp; official result approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/judging`}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>Approval Desk</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Total Judges</span>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {dashboard?.total_judges || 0}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {dashboard?.active_judges || 0} active in jury roster
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Competitions</span>
            <Award className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {competitions.length}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {dashboard?.completed_competitions || 0} finalized &amp; locked
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Locked Scores</span>
            <Lock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {dashboard?.locked_scores || 0}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            of {dashboard?.total_scores || 0} total score sheets
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Pending Approvals</span>
            <Clock className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 text-rose-600 dark:text-rose-400">
            {approvals.length || dashboard?.pending_approvals || 0}
          </div>
          <div className="text-[11px] text-rose-500 font-semibold mt-1">
            Requires Chief Judge sign-off
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("judge_accounts")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "judge_accounts"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Key className="h-3.5 w-3.5" />
          <span>Judges & Login Credentials ({judgesList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("competitions")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "competitions"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Competition Jury Status ({competitions.length})
        </button>
        <button
          onClick={() => setActiveTab("approvals")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer relative ${
            activeTab === "approvals"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Chief Approvals Queue ({approvals.length})
          {approvals.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black">
              {approvals.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("blind_codes")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "blind_codes"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Blind Code Guidelines
        </button>
      </div>

      {/* Tab 1: Competitions Table */}
      {activeTab === "competitions" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search competition code or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Competition Event</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Judges Count</th>
                    <th className="px-4 py-3">Scoring Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredCompetitions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No matching competitions found.
                      </td>
                    </tr>
                  ) : (
                    filteredCompetitions.map((c) => {
                      const isCompleted = c.status === "completed"
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                            {c.code || "COMP"}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                            <div>{c.name}</div>
                            {c.name_ml && <div className="text-[11px] font-normal text-slate-400">{c.name_ml}</div>}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold text-[10px]">
                              {c.category?.name || "General"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-300">
                            {c.judge_count || 3} Judges
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                isCompleted
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isCompleted ? "bg-emerald-500" : "bg-amber-500"
                                }`}
                              />
                              {c.status || "Scheduled"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right space-x-2">
                            <Link
                              href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/${c.id}/scoring`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold transition-all"
                            >
                              <span>Enter Scores</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Chief Approvals */}
      {activeTab === "approvals" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Chief Judge Verification Rule:</span> Marks submitted by judges are reviewed here. Once approved, final grades and house championship points sync live to public boards.
            </div>
          </div>

          {approvals.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400">
              <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500/60 mb-2" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-200">All scorecards verified</div>
              <div className="text-xs mt-0.5">No pending approval requests waiting in jury queue.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {approvals.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {app.competition?.name || "Competition Event"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-600 dark:text-amber-300">
                      Pending
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {app.score?.participant?.first_name} {app.score?.participant?.last_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Chest No: #{app.score?.participant?.chest_number || "N/A"} • Total Score:{" "}
                      <span className="font-bold text-slate-900 dark:text-white">
                        {app.score?.total_score || "N/A"}
                      </span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleApprove(app.id)}
                      disabled={isPending}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-all"
                    >
                      Approve &amp; Lock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Judge Accounts & Login Credentials */}
      {activeTab === "judge_accounts" && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Judge Usernames &amp; Access PINs
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Judges use their simple username and password to log in directly into the tablet scoring console.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyAllSlips}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Copy All for WhatsApp</span>
              </button>
              <Link
                href="/dashboard/judge"
                target="_blank"
                className="px-3 py-2 text-xs font-bold rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 transition-all"
              >
                <span>Preview Judge Console</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={() => {
                  setNewJudgeForm({
                    name: "",
                    username: `judge${judgesList.length + 1}`,
                    password: "123",
                    stageName: "Main Stage 1",
                    phone: "",
                    isLead: false,
                  })
                  setShowAddJudge(true)
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Judge</span>
              </button>
            </div>
          </div>

          {/* Add Judge Modal / Form */}
          {showAddJudge && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-emerald-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Create New Stage Judge Account
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddJudge(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕ Cancel
                </button>
              </div>

              <form onSubmit={handleCreateJudge} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Judge Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. K. Radhakrishnan"
                    value={newJudgeForm.name}
                    onChange={(e) => setNewJudgeForm({ ...newJudgeForm, name: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Username (Login ID) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. judge1, judge_dance"
                    value={newJudgeForm.username}
                    onChange={(e) => setNewJudgeForm({ ...newJudgeForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Password / Access PIN *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 123 or fest@123"
                    value={newJudgeForm.password}
                    onChange={(e) => setNewJudgeForm({ ...newJudgeForm, password: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Assigned Stage</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Stage 1"
                    value={newJudgeForm.stageName}
                    onChange={(e) => setNewJudgeForm({ ...newJudgeForm, stageName: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddJudge(false)}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    Save Judge Account
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Judges Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Judge Name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Password / PIN</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {judgesList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No judge accounts created yet. Click &quot;Add Judge&quot; to provision judge credentials.
                    </td>
                  </tr>
                ) : (
                  judgesList.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                            {j.name.charAt(0)}
                          </div>
                          <div>
                            <div>{j.name}</div>
                            {j.phone && <div className="text-[10px] text-slate-400">{j.phone}</div>}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-500/20">
                          {j.username}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white">
                          <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">
                            {j.password || "123"}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(j.password || "123")
                              toast.success(`Password for ${j.name} copied!`)
                            }}
                            title="Copy Password"
                            className="p-1 hover:text-indigo-600 text-slate-400 cursor-pointer"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {j.stage_name || "Main Stage"}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <Check className="h-2.5 w-2.5" />
                          <span>Active</span>
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyJudgeSlip(j)}
                            title="Copy Full Login Slip"
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === j.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedId === j.id ? "Copied" : "Slip"}</span>
                          </button>

                          <Link
                            href={`/login?username=${j.username}`}
                            target="_blank"
                            title="Test Login as this Judge"
                            className="px-2.5 py-1 rounded-lg border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                          >
                            <span>Login</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>

                          <button
                            onClick={() => handleDeleteJudge(j.id)}
                            title="Delete Judge Account"
                            className="p-1.5 hover:text-rose-600 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
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
      )}

      {/* Tab 3: Blind Code Management */}
      {activeTab === "blind_codes" && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Blind Code-Letter Judging Standard
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
            In competitive festival scoring, judges evaluate contestants purely by randomized Code Letters (A, B, C, D...) instead of Chest Numbers or Institution names. This guarantees complete impartiality.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="font-bold text-xs text-slate-900 dark:text-white">1. Green Room Draw</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Reporting officers assign blind letters when participants check in at the Green Room desk.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="font-bold text-xs text-slate-900 dark:text-white">2. Blind Evaluation</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Judges record marks under Code Letter only. No school, house, or candidate name is revealed.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="font-bold text-xs text-slate-900 dark:text-white">3. Final Decryption</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                The Chief Approval console joins Code Letters back to original chest numbers before publishing results.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
