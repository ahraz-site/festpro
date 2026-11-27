"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Gavel,
  LayoutDashboard,
  HelpCircle,
  Search,
  LogOut,
  Lock,
  RefreshCw,
  ArrowLeft,
  Sliders,
  Check,
  User,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { logoutStaffAction } from "@/lib/actions/staff-auth"
import { FesProLogo } from "@/components/ui/logo"

interface CandidateItem {
  id: string
  chestNumber: string
  blindCode: string
  team?: string
  status: "pending" | "submitted"
  criteriaScores: Record<string, number>
  totalScore: number
  remarks?: string
}

interface CompetitionItem {
  id: string
  name: string
  code: string
  category: string
  stageName: string
  scoringStatus: "LOCKED" | "VALUATION" | "NOT_OPEN"
  maxMarks: number
  criteria: Array<{ id: string; name: string; maxMarks: number }>
  candidates: CandidateItem[]
}

type StatusTab = "All" | "Not Open" | "Valuation" | "Locked"

export default function JudgeDashboardPage() {
  const [festivalInfo, setFestivalInfo] = useState<{ id: string; name: string } | null>(null)
  const [judgeInfo, setJudgeInfo] = useState<{ id: string; name: string; username: string; stageName?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [viewMode, setViewMode] = useState<"list" | "scoring">("list")
  const [statusFilter, setStatusFilter] = useState<StatusTab>("All")
  const [searchQuery, setSearchQuery] = useState("")

  const [competitions, setCompetitions] = useState<CompetitionItem[]>([])
  const [selectedCompId, setSelectedCompId] = useState<string>("")
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("")
  const [currentScores, setCurrentScores] = useState<Record<string, number>>({})
  const [remarks, setRemarks] = useState("")

  const loadJudgeConsole = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/judge/console", { cache: "no-store" })
      if (res.status === 401) {
        window.location.href = "/login"
        return
      }
      const json = await res.json()
      if (json.festival) setFestivalInfo(json.festival)
      if (json.judge) setJudgeInfo(json.judge)
      if (Array.isArray(json.competitions)) {
        setCompetitions(json.competitions)
        if (!selectedCompId && json.competitions[0]) {
          setSelectedCompId(json.competitions[0].id)
          if (json.competitions[0].candidates[0]) {
            setSelectedCandidateId(json.competitions[0].candidates[0].id)
          }
        }
      }
    } catch (err) {
      console.error("Failed to load judge console:", err)
      toast.error("Could not load judging queue.")
    } finally {
      setLoading(false)
    }
  }, [selectedCompId])

  useEffect(() => {
    loadJudgeConsole()
  }, [])

  const selectedComp = competitions.find((c) => c.id === selectedCompId) || competitions[0]
  const selectedCandidate =
    selectedComp?.candidates.find((cd) => cd.id === selectedCandidateId) ||
    selectedComp?.candidates[0]

  useEffect(() => {
    if (selectedCandidate) {
      setCurrentScores(selectedCandidate.criteriaScores || {})
      setRemarks(selectedCandidate.remarks || "")
    }
  }, [selectedCandidateId, selectedCompId, selectedCandidate?.id])

  const totalCalculated = selectedComp
    ? selectedComp.criteria.reduce((sum, c) => sum + (Number(currentScores[c.id]) || 0), 0)
    : 0

  const handleScoreChange = (criteriaId: string, val: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, val))
    setCurrentScores((prev) => ({ ...prev, [criteriaId]: clamped }))
  }

  const handleSaveAndSubmit = async (lockScore: boolean) => {
    if (!selectedComp || !selectedCandidate || !festivalInfo) return
    setSaving(true)

    try {
      const res = await fetch("/api/judge/console", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          festivalId: festivalInfo.id,
          competitionId: selectedComp.id,
          candidateId: selectedCandidate.id,
          criteriaScores: currentScores,
          totalScore: totalCalculated,
          remarks,
          lockScore,
          candidateMeta: {
            chestNumber: selectedCandidate.chestNumber,
            blindCode: selectedCandidate.blindCode,
            team: selectedCandidate.team,
          },
        }),
      })

      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || "Failed to save marks")
        return
      }

      setCompetitions((prev) =>
        prev.map((comp) => {
          if (comp.id !== selectedComp.id) return comp
          return {
            ...comp,
            candidates: comp.candidates.map((cand) => {
              if (cand.id !== selectedCandidate.id) return cand
              return {
                ...cand,
                status: lockScore ? "submitted" : cand.status,
                criteriaScores: { ...currentScores },
                totalScore: totalCalculated,
                remarks,
              }
            }),
          }
        })
      )

      if (lockScore) {
        toast.success(
          `Locked ${totalCalculated}/${selectedComp.maxMarks} for ${selectedCandidate.blindCode}`
        )
        const nextPending = selectedComp.candidates.find(
          (c) => c.id !== selectedCandidate.id && c.status === "pending"
        )
        if (nextPending) {
          setSelectedCandidateId(nextPending.id)
        }
      } else {
        toast.success("Draft score saved to festival server.")
      }
    } catch {
      toast.error("Network error while saving score")
    } finally {
      setSaving(false)
    }
  }

  const handleOpenScoring = (comp: CompetitionItem) => {
    setSelectedCompId(comp.id)
    const firstPending = comp.candidates.find((c) => c.status === "pending") || comp.candidates[0]
    if (firstPending) setSelectedCandidateId(firstPending.id)
    setViewMode("scoring")
  }

  const handleLogout = async () => {
    await logoutStaffAction()
    toast.success("Signed out successfully.")
    window.location.href = "/login"
  }

  const filteredCompetitions = competitions.filter((comp) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      comp.name.toLowerCase().includes(q) ||
      comp.category.toLowerCase().includes(q) ||
      comp.stageName.toLowerCase().includes(q)

    if (!matchesSearch) return false
    if (statusFilter === "Not Open" && comp.scoringStatus !== "NOT_OPEN") return false
    if (statusFilter === "Valuation" && comp.scoringStatus !== "VALUATION") return false
    if (statusFilter === "Locked" && comp.scoringStatus !== "LOCKED") return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Loading FesPro Judge Portal...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* ── OFFICIAL FESPRO HEADER ── */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center">
            <FesProLogo height={24} />
          </Link>

          <div className="hidden sm:block border-l border-slate-200 pl-4">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              FESTIVAL
            </span>
            <span className="text-xs font-bold text-slate-900">
              {festivalInfo?.name || "Festival Portal"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadJudgeConsole}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer transition-colors"
          >
            <RefreshCw className="h-3 w-3 text-indigo-600" />
            <span>Sync Live Queue</span>
          </button>

          {judgeInfo && (
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-700 bg-indigo-50/70 border border-indigo-200/70 px-3 py-1.5 rounded-full">
              <User className="h-3.5 w-3.5 text-indigo-600" />
              <span>{judgeInfo.name}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-bold text-slate-700 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── SECONDARY SUBNAV BAR ── */}
      <div className="bg-white/80 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-8 flex items-center gap-6 text-sm">
        <Link
          href="/dashboard"
          className="py-3 text-slate-500 hover:text-slate-900 flex items-center gap-2 font-semibold transition-colors border-b-2 border-transparent"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>

        <button
          onClick={() => setViewMode("list")}
          className={`py-3 flex items-center gap-2 font-bold transition-all border-b-2 cursor-pointer ${
            viewMode === "list"
              ? "text-indigo-600 border-indigo-600"
              : "text-slate-500 hover:text-slate-900 border-transparent"
          }`}
        >
          <Gavel className="h-4 w-4" />
          <span>My judging</span>
        </button>

        {viewMode === "scoring" && selectedComp && (
          <div className="py-3 flex items-center gap-2 font-bold text-indigo-700 border-b-2 border-indigo-600">
            <Sliders className="h-4 w-4" />
            <span>Valuation ({selectedComp.name})</span>
          </div>
        )}

        <Link
          href="/dashboard/help"
          className="py-3 text-slate-500 hover:text-slate-900 flex items-center gap-2 font-semibold transition-colors border-b-2 border-transparent"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Help</span>
        </Link>
      </div>

      {/* ── VIEW 1: MY JUDGING PROGRAMS LIST ── */}
      {viewMode === "list" && (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Gavel className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">My judging</h1>
              <p className="text-xs text-slate-500 font-medium">
                Active competitions and scorecards for {festivalInfo?.name || "your festival"}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search programs..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs transition-all"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2.5 flex-wrap text-sm">
            <span className="font-bold text-slate-500 text-xs">Status:</span>
            {(["All", "Not Open", "Valuation", "Locked"] as StatusTab[]).map((tab) => {
              const isActive = statusFilter === tab
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  {tab}
                </button>
              )
            })}
          </div>

          {/* Programs Grid */}
          {filteredCompetitions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
              {filteredCompetitions.map((comp) => {
                const isLocked = comp.scoringStatus === "LOCKED"
                const isValuation = comp.scoringStatus === "VALUATION"

                return (
                  <div
                    key={comp.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all shadow-xs"
                  >
                    <div className="space-y-4">
                      <h2 className="text-lg font-black text-slate-900 leading-snug">{comp.name}</h2>

                      <div className="space-y-1.5 text-xs text-slate-500">
                        <div>
                          <span>Category:</span>{" "}
                          <span className="text-slate-800 font-bold">{comp.category}</span>
                        </div>
                        <div>
                          <span>Stage:</span>{" "}
                          <span className="text-slate-800 font-bold">{comp.stageName}</span>
                        </div>
                        <div>
                          <span>Candidates:</span>{" "}
                          <span className="text-slate-800 font-bold">{comp.candidates.length}</span>
                        </div>
                        <div>
                          <span>Scoring:</span>{" "}
                          <span
                            className={`font-black uppercase tracking-wider ${
                              isLocked
                                ? "text-rose-600"
                                : isValuation
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }`}
                          >
                            {comp.scoringStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6">
                      {isLocked ? (
                        <button
                          onClick={() => handleOpenScoring(comp)}
                          className="w-full px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          View Submitted Marks
                        </button>
                      ) : isValuation ? (
                        <button
                          onClick={() => handleOpenScoring(comp)}
                          className="w-full px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Sliders className="h-3.5 w-3.5" />
                          <span>Enter Marks</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full px-5 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed"
                        >
                          Not Open Yet
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 space-y-2">
              <Gavel className="h-9 w-9 mx-auto text-slate-300" />
              <p className="font-bold text-slate-800 text-sm">
                {competitions.length === 0
                  ? "No competitions created for this festival yet"
                  : `No programs match "${statusFilter}"`}
              </p>
              <p className="text-xs text-slate-400">
                {competitions.length === 0
                  ? "Programs added by the festival coordinator will automatically appear here."
                  : "Try switching filter tabs or clearing search."}
              </p>
            </div>
          )}
        </main>
      )}

      {/* ── VIEW 2: LIVE TABLET SCORING CONSOLE ── */}
      {viewMode === "scoring" && selectedComp && (
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode("list")}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-indigo-600" />
                <span>Back to My judging</span>
              </button>
              <div>
                <span className="text-xs text-slate-400">Active Program:</span>
                <span className="ml-1.5 text-sm font-black text-slate-900">{selectedComp.name}</span>
                <span className="ml-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {selectedComp.stageName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Scored:</span>
              <span className="font-black text-slate-900">
                {selectedComp.candidates.filter((c) => c.status === "submitted").length}/
                {selectedComp.candidates.length}
              </span>
            </div>
          </div>

          {selectedComp.candidates.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-md w-full bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">No candidates enrolled yet</h3>
                <p className="text-xs text-slate-500">
                  Add participants and enroll them in this program before entering marks.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
              {/* LEFT COLUMN: CANDIDATES QUEUE */}
              <aside className="lg:col-span-4 xl:col-span-3 border-r border-slate-200 bg-white flex flex-col">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Contestant Queue
                    </h3>
                    <p className="text-[11px] text-slate-400">Blind code evaluation</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                    {selectedComp.candidates.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {selectedComp.candidates.map((cand) => {
                    const isSelected = cand.id === selectedCandidate?.id
                    const isSubmitted = cand.status === "submitted"
                    return (
                      <button
                        key={cand.id}
                        onClick={() => setSelectedCandidateId(cand.id)}
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50/70 border-indigo-500 shadow-xs ring-1 ring-indigo-500"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black text-slate-900">
                              #{cand.chestNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-500">({cand.blindCode})</span>
                          </div>
                          {isSubmitted ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <Check className="h-3 w-3" />
                              {cand.totalScore}/{selectedComp.maxMarks}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Pending
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </aside>

              {/* RIGHT COLUMN: SCORING CRITERIA SLIDERS */}
              {selectedCandidate && (
                <main className="lg:col-span-8 xl:col-span-9 p-4 sm:p-8 overflow-y-auto space-y-6">
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Currently Evaluating
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-2xl font-black text-slate-900 font-mono">
                          Chest #{selectedCandidate.chestNumber}
                        </span>
                        <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {selectedCandidate.blindCode}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-500 font-medium">Calculated Total</span>
                      <div className="text-3xl font-black text-indigo-700 font-mono leading-none mt-0.5">
                        {totalCalculated}
                        <span className="text-sm font-normal text-slate-400">
                          /{selectedComp.maxMarks}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Criteria Sliders */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Official Criteria Marks Breakdown
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      {selectedComp.criteria.map((crit) => {
                        const score = Number(currentScores[crit.id]) || 0
                        return (
                          <div
                            key={crit.id}
                            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 text-sm">{crit.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-black text-indigo-700 font-mono">
                                  {score}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">/{crit.maxMarks}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <input
                                type="range"
                                min={0}
                                max={crit.maxMarks}
                                step={1}
                                value={score}
                                onChange={(e) =>
                                  handleScoreChange(crit.id, Number(e.target.value), crit.maxMarks)
                                }
                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              />
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleScoreChange(crit.id, score - 1, crit.maxMarks)}
                                  className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleScoreChange(crit.id, score + 1, crit.maxMarks)}
                                  className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Remarks Field */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Judge Confidential Remarks (Optional)
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Notes on performance, pitch, rhythm, or rules..."
                      rows={2}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleSaveAndSubmit(false)}
                      disabled={saving}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      {saving ? "Saving..." : "Save Draft"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveAndSubmit(true)}
                      disabled={saving}
                      className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Lock &amp; Submit Score ({totalCalculated}/{selectedComp.maxMarks})</span>
                    </button>
                  </div>
                </main>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
