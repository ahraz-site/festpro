"use client"

import React, { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Gavel,
  LayoutDashboard,
  HelpCircle,
  Search,
  CheckCircle2,
  Clock,
  LogOut,
  ChevronRight,
  Shield,
  Star,
  Lock,
  Unlock,
  AlertCircle,
  RefreshCw,
  Award,
  Sparkles,
  ArrowLeft,
  Sliders,
  Check,
  User,
  Sun,
  Download,
} from "lucide-react"
import { toast } from "sonner"
import { getJudgeSessionAction, logoutJudgeAction, type JudgeSession } from "@/lib/actions/judge-auth"
import { FestProFavicon } from "@/components/ui/logo"

interface CandidateItem {
  id: string
  chestNumber: string
  blindCode: string
  participantName?: string
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

const INITIAL_COMPETITIONS: CompetitionItem[] = [
  {
    id: "comp-madh-song",
    name: "Madh Song",
    code: "MADH-01",
    category: "Senior",
    stageName: "Stage 1",
    scoringStatus: "VALUATION",
    maxMarks: 100,
    criteria: [
      { id: "ms1", name: "Thalam & Tune", maxMarks: 30 },
      { id: "ms2", name: "Pronunciation & Sahithya", maxMarks: 30 },
      { id: "ms3", name: "Voice & Melody", maxMarks: 25 },
      { id: "ms4", name: "Presentation & Stage Presence", maxMarks: 15 },
    ],
    candidates: [
      { id: "cand-ms1", chestNumber: "102", blindCode: "CODE A", status: "submitted", criteriaScores: { ms1: 27, ms2: 28, ms3: 24, ms4: 14 }, totalScore: 93 },
      { id: "cand-ms2", chestNumber: "106", blindCode: "CODE B", status: "pending", criteriaScores: { ms1: 0, ms2: 0, ms3: 0, ms4: 0 }, totalScore: 0 },
      { id: "cand-ms3", chestNumber: "114", blindCode: "CODE C", status: "pending", criteriaScores: { ms1: 0, ms2: 0, ms3: 0, ms4: 0 }, totalScore: 0 },
    ],
  },
  {
    id: "comp-classical-dance",
    name: "Classical Solo Dance (Bharatanatyam)",
    code: "CL-DNC-01",
    category: "Senior",
    stageName: "Stage 1",
    scoringStatus: "VALUATION",
    maxMarks: 100,
    criteria: [
      { id: "c1", name: "Talam & Rhythm", maxMarks: 25 },
      { id: "c2", name: "Bhavam & Expression", maxMarks: 25 },
      { id: "c3", name: "Mudras & Technique", maxMarks: 25 },
      { id: "c4", name: "Costume & Overall Presentation", maxMarks: 25 },
    ],
    candidates: [
      { id: "cand-1", chestNumber: "101", blindCode: "CODE A", status: "submitted", criteriaScores: { c1: 23, c2: 24, c3: 22, c4: 24 }, totalScore: 93 },
      { id: "cand-2", chestNumber: "105", blindCode: "CODE B", status: "pending", criteriaScores: { c1: 20, c2: 21, c3: 20, c4: 21 }, totalScore: 82 },
      { id: "cand-3", chestNumber: "112", blindCode: "CODE C", status: "pending", criteriaScores: { c1: 0, c2: 0, c3: 0, c4: 0 }, totalScore: 0 },
      { id: "cand-4", chestNumber: "118", blindCode: "CODE D", status: "pending", criteriaScores: { c1: 0, c2: 0, c3: 0, c4: 0 }, totalScore: 0 },
      { id: "cand-5", chestNumber: "124", blindCode: "CODE E", status: "pending", criteriaScores: { c1: 0, c2: 0, c3: 0, c4: 0 }, totalScore: 0 },
    ],
  },
  {
    id: "comp-light-music",
    name: "Light Music Solo (Malayalam)",
    code: "MUS-LGT-02",
    category: "Junior",
    stageName: "Stage 2",
    scoringStatus: "VALUATION",
    maxMarks: 100,
    criteria: [
      { id: "m1", name: "Shruti & Pitch Accuracy", maxMarks: 30 },
      { id: "m2", name: "Talam & Tempo", maxMarks: 25 },
      { id: "m3", name: "Bhava & Voice Modulation", maxMarks: 25 },
      { id: "m4", name: "Pronunciation & Clarity", maxMarks: 20 },
    ],
    candidates: [
      { id: "cand-201", chestNumber: "201", blindCode: "CODE K", status: "pending", criteriaScores: { m1: 0, m2: 0, m3: 0, m4: 0 }, totalScore: 0 },
      { id: "cand-202", chestNumber: "208", blindCode: "CODE L", status: "pending", criteriaScores: { m1: 0, m2: 0, m3: 0, m4: 0 }, totalScore: 0 },
    ],
  },
  {
    id: "comp-mappilappattu",
    name: "Mappilappattu Solo",
    code: "MUS-MAP-03",
    category: "General",
    stageName: "Stage 3",
    scoringStatus: "NOT_OPEN",
    maxMarks: 100,
    criteria: [
      { id: "p1", name: "Isai & Traditional Tune", maxMarks: 30 },
      { id: "p2", name: "Rhythm & Thaalam", maxMarks: 25 },
      { id: "p3", name: "Voice Quality", maxMarks: 25 },
      { id: "p4", name: "Sahithya Shudhi", maxMarks: 20 },
    ],
    candidates: [
      { id: "cand-301", chestNumber: "301", blindCode: "CODE X", status: "pending", criteriaScores: { p1: 0, p2: 0, p3: 0, p4: 0 }, totalScore: 0 },
    ],
  },
  {
    id: "comp-elocution-eng",
    name: "Elocution (English)",
    code: "ENG-ELO-04",
    category: "Senior",
    stageName: "Stage 1",
    scoringStatus: "LOCKED",
    maxMarks: 100,
    criteria: [
      { id: "e1", name: "Content & Substance", maxMarks: 35 },
      { id: "e2", name: "Delivery & Body Language", maxMarks: 35 },
      { id: "e3", name: "Pronunciation & Vocabulary", maxMarks: 30 },
    ],
    candidates: [
      { id: "cand-401", chestNumber: "109", blindCode: "CODE G", status: "submitted", criteriaScores: { e1: 32, e2: 33, e3: 28 }, totalScore: 93 },
      { id: "cand-402", chestNumber: "115", blindCode: "CODE H", status: "submitted", criteriaScores: { e1: 30, e2: 31, e3: 27 }, totalScore: 88 },
    ],
  },
]

type StatusTab = "All" | "Not Open" | "Valuation" | "Locked"

export default function JudgeDashboardPage() {
  const router = useRouter()
  const [judgeSession, setJudgeSession] = useState<JudgeSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // View state: "list" (Screenshot 2: My judging) vs "scoring" (Tablet Console)
  const [viewMode, setViewMode] = useState<"list" | "scoring">("list")
  const [statusFilter, setStatusFilter] = useState<StatusTab>("All")
  const [searchQuery, setSearchQuery] = useState("")

  const [competitions, setCompetitions] = useState<CompetitionItem[]>(INITIAL_COMPETITIONS)
  const [selectedCompId, setSelectedCompId] = useState<string>(INITIAL_COMPETITIONS[0].id)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    INITIAL_COMPETITIONS[0].candidates[1]?.id || INITIAL_COMPETITIONS[0].candidates[0].id
  )
  const [currentScores, setCurrentScores] = useState<Record<string, number>>({})
  const [remarks, setRemarks] = useState("")

  // Load Judge Session
  useEffect(() => {
    async function initSession() {
      try {
        const session = await getJudgeSessionAction()
        if (session) {
          setJudgeSession(session)
        } else {
          // Default fallback demo judge
          setJudgeSession({
            judgeId: "demo-judge",
            festivalId: "c66d0281-bc93-4cb8-b94e-e54bf27c7119",
            name: "Sinan (Official Judge)",
            username: "sinan",
            stageName: "Stage 1",
            isLead: true,
          })
        }
      } catch (err) {
        console.warn("Session check error:", err)
      } finally {
        setLoading(false)
      }
    }
    initSession()
  }, [])

  const selectedComp = competitions.find((c) => c.id === selectedCompId) || competitions[0]
  const selectedCandidate =
    selectedComp.candidates.find((cd) => cd.id === selectedCandidateId) || selectedComp.candidates[0]

  // Synchronize scores when candidate or competition changes
  useEffect(() => {
    if (selectedCandidate) {
      setCurrentScores(selectedCandidate.criteriaScores || {})
      setRemarks(selectedCandidate.remarks || "")
    }
  }, [selectedCandidateId, selectedCompId])

  const totalCalculated = selectedComp.criteria.reduce(
    (sum, c) => sum + (Number(currentScores[c.id]) || 0),
    0
  )

  const handleScoreChange = (criteriaId: string, val: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, val))
    setCurrentScores((prev) => ({ ...prev, [criteriaId]: clamped }))
  }

  const handleSaveAndSubmit = (lockScore: boolean) => {
    if (!selectedCandidate) return

    startTransition(() => {
      setCompetitions((prev) =>
        prev.map((comp) => {
          if (comp.id !== selectedCompId) return comp
          return {
            ...comp,
            candidates: comp.candidates.map((cand) => {
              if (cand.id !== selectedCandidateId) return cand
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
          `Score of ${totalCalculated}/${selectedComp.maxMarks} locked for ${selectedCandidate.blindCode} (Chest #${selectedCandidate.chestNumber})`
        )
        // Auto advance to next pending candidate
        const nextPending = selectedComp.candidates.find(
          (c) => c.id !== selectedCandidateId && c.status === "pending"
        )
        if (nextPending) {
          setSelectedCandidateId(nextPending.id)
        }
      } else {
        toast.info("Draft score saved locally.")
      }
    })
  }

  const handleOpenScoring = (comp: CompetitionItem) => {
    setSelectedCompId(comp.id)
    const firstPending = comp.candidates.find((c) => c.status === "pending") || comp.candidates[0]
    if (firstPending) setSelectedCandidateId(firstPending.id)
    setViewMode("scoring")
  }

  const handleLogout = async () => {
    await logoutJudgeAction()
    toast.success("Judge signed out successfully.")
    window.location.href = "/login"
  }

  // Filter competitions for Screenshot 2 list
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
      <div className="min-h-screen bg-[#080d14] text-white flex items-center justify-center p-6">
        <div className="flex items-center gap-3">
          <span className="h-6 w-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-300">Loading Official Judge Portal...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080d14] text-slate-100 flex flex-col font-sans selection:bg-[#00a389] selection:text-white">
      {/* ── TOP HEADER (Matching Screenshot 1 & 2 Festize Topbar) ── */}
      <header className="bg-[#0b1118] border-b border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#00a389] flex items-center justify-center shadow-md shadow-emerald-500/20 font-black text-white text-base">
              F
            </div>
            <span className="text-lg font-black tracking-tight text-white">Festize</span>
          </div>

          <div className="hidden sm:block border-l border-slate-800 pl-4">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              FEST
            </span>
            <span className="text-xs font-bold text-slate-200">Festize</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-400 bg-[#0e1622] px-3 py-1.5 rounded-full border border-slate-800">
            <RefreshCw className="h-3 w-3 text-[#00a389] animate-spin" />
            <span>Refreshing live data...</span>
          </div>

          <button
            onClick={() => toast.info("Festival Jury Helpdesk is active.")}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          <button
            onClick={() => toast.info("Dark mode active for judging console.")}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Theme"
          >
            <Sun className="h-4 w-4" />
          </button>

          <button
            onClick={() => toast.success("Offline marks cache synchronized.")}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Download offline backup"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            onClick={handleLogout}
            className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all cursor-pointer"
            title="Sign Out"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ── SECONDARY SUBNAV BAR (Screenshot 2: Dashboard | My judging | Help) ── */}
      <div className="bg-[#0b1118]/60 border-b border-slate-800/80 px-4 sm:px-8 flex items-center gap-6 text-sm">
        <Link
          href="/dashboard"
          className="py-3 text-slate-400 hover:text-slate-200 flex items-center gap-2 font-medium transition-colors border-b-2 border-transparent"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>

        <button
          onClick={() => setViewMode("list")}
          className={`py-3 flex items-center gap-2 font-bold transition-all border-b-2 cursor-pointer ${
            viewMode === "list"
              ? "text-[#00a389] border-[#00a389]"
              : "text-slate-400 hover:text-slate-200 border-transparent"
          }`}
        >
          <Gavel className="h-4 w-4" />
          <span>My judging</span>
        </button>

        {viewMode === "scoring" && (
          <div className="py-3 flex items-center gap-2 font-bold text-emerald-400 border-b-2 border-emerald-400">
            <Sliders className="h-4 w-4" />
            <span>Scoring Console ({selectedComp.name})</span>
          </div>
        )}

        <Link
          href="/dashboard/help"
          className="py-3 text-slate-400 hover:text-slate-200 flex items-center gap-2 font-medium transition-colors border-b-2 border-transparent"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Help</span>
        </Link>
      </div>

      {/* ── VIEW 1: "MY JUDGING" PORTAL (EXACT REPLICA OF USER SCREENSHOT 2) ── */}
      {viewMode === "list" && (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
          {/* Section Header with Gavel Icon (Screenshot 2) */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#00a389]/15 border border-[#00a389]/30 flex items-center justify-center text-[#00c9a7]">
              <Gavel className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">My judging</h1>
          </div>

          {/* Search Bar (Screenshot 2) */}
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search programs..."
              className="w-full bg-[#0e1622] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#00a389] transition-all"
            />
          </div>

          {/* Status Filter Tabs (Screenshot 2: Status: [All] [Not Open] [Valuation] [Locked]) */}
          <div className="flex items-center gap-3 flex-wrap text-sm">
            <span className="font-bold text-slate-400">Status:</span>
            {(["All", "Not Open", "Valuation", "Locked"] as StatusTab[]).map((tab) => {
              const isActive = statusFilter === tab
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#00a389] text-white shadow-xs"
                      : "bg-[#0e1622] text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {tab}
                </button>
              )
            })}
          </div>

          {/* Programs Grid (Screenshot 2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
            {filteredCompetitions.map((comp) => {
              const isLocked = comp.scoringStatus === "LOCKED"
              const isValuation = comp.scoringStatus === "VALUATION"
              const isNotOpen = comp.scoringStatus === "NOT_OPEN"

              return (
                <div
                  key={comp.id}
                  className="bg-[#0e1622] border border-slate-800/90 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
                >
                  <div className="space-y-4">
                    <h2 className="text-xl font-black text-white leading-snug">{comp.name}</h2>

                    <div className="space-y-1 text-xs text-slate-400">
                      <div>
                        <span className="text-slate-500">Category:</span>{" "}
                        <span className="text-slate-300 font-medium">{comp.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Stage:</span>{" "}
                        <span className="text-slate-300 font-medium">{comp.stageName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Scoring:</span>{" "}
                        <span
                          className={`font-black uppercase tracking-wider ${
                            isLocked
                              ? "text-red-400"
                              : isValuation
                              ? "text-emerald-400"
                              : "text-amber-400"
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
                        disabled
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#14232c] text-[#00c9a7] border border-[#00a389]/30 text-xs font-bold opacity-80 cursor-not-allowed"
                      >
                        Valuation closed
                      </button>
                    ) : isValuation ? (
                      <button
                        onClick={() => handleOpenScoring(comp)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00a389] hover:bg-[#008f78] text-white text-xs font-bold shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sliders className="h-3.5 w-3.5" />
                        <span>Enter Marks</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold cursor-not-allowed"
                      >
                        Not Open Yet
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filteredCompetitions.length === 0 && (
            <div className="text-center py-16 bg-[#0e1622] rounded-2xl border border-slate-800 text-slate-400">
              <Gavel className="h-8 w-8 mx-auto text-slate-600 mb-2" />
              <p className="font-bold">No programs match &ldquo;{statusFilter}&rdquo;</p>
              <p className="text-xs text-slate-500 mt-1">Try switching to &ldquo;All&rdquo; status tab.</p>
            </div>
          )}
        </main>
      )}

      {/* ── VIEW 2: LIVE TABLET SCORING CONSOLE ── */}
      {viewMode === "scoring" && (
        <div className="flex-1 flex flex-col">
          {/* Subheader bar for Scoring Console */}
          <div className="bg-[#0b1118] border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode("list")}
                className="px-3 py-1.5 rounded-xl bg-[#0e1622] border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-[#00a389]" />
                <span>Back to My judging</span>
              </button>
              <div>
                <span className="text-xs text-slate-400">Active Program:</span>
                <span className="ml-1.5 text-sm font-black text-white">{selectedComp.name}</span>
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#00a389]/20 text-[#00c9a7]">
                  {selectedComp.stageName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Scored:</span>
              <span className="font-bold text-white">
                {selectedComp.candidates.filter((c) => c.status === "submitted").length}/
                {selectedComp.candidates.length}
              </span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
            {/* LEFT COLUMN: CANDIDATES QUEUE */}
            <aside className="lg:col-span-4 xl:col-span-3 border-r border-slate-800 bg-[#0a1019] flex flex-col">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Contestant Queue
                  </h3>
                  <p className="text-[11px] text-slate-500">Blind code evaluation</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                  {selectedComp.candidates.length} Candidates
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {selectedComp.candidates.map((cand, idx) => {
                  const isSelected = cand.id === selectedCandidate.id
                  const isSubmitted = cand.status === "submitted"
                  return (
                    <button
                      key={cand.id}
                      onClick={() => setSelectedCandidateId(cand.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#0e1724] border-[#00a389] shadow-lg shadow-teal-500/10 ring-1 ring-[#00a389]"
                          : "bg-[#0c131d] border-slate-800/80 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-white">
                            #{cand.chestNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-400">({cand.blindCode})</span>
                        </div>
                        {isSubmitted ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <Check className="h-3 w-3" />
                            {cand.totalScore}/{selectedComp.maxMarks}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
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
            <main className="lg:col-span-8 xl:col-span-9 p-4 sm:p-8 overflow-y-auto space-y-6">
              {/* Candidate Info Header */}
              <div className="p-5 rounded-2xl bg-[#0e1622] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Currently Evaluating
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-2xl font-black text-white font-mono">
                      Chest #{selectedCandidate.chestNumber}
                    </span>
                    <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-[#00a389]/20 text-[#00c9a7] border border-[#00a389]/30">
                      {selectedCandidate.blindCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-medium">Calculated Total</span>
                    <div className="text-3xl font-black text-white font-mono leading-none mt-0.5">
                      {totalCalculated}
                      <span className="text-sm font-normal text-slate-500">
                        /{selectedComp.maxMarks}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Criteria Sliders */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Official Criteria Marks Breakdown
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {selectedComp.criteria.map((crit) => {
                    const score = Number(currentScores[crit.id]) || 0
                    return (
                      <div
                        key={crit.id}
                        className="p-5 rounded-2xl bg-[#0e1622] border border-slate-800/90 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200 text-sm">{crit.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-[#00c9a7] font-mono">
                              {score}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">/{crit.maxMarks}</span>
                          </div>
                        </div>

                        {/* Slider + Stepper Controls */}
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
                            className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00a389]"
                          />
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleScoreChange(crit.id, score - 1, crit.maxMarks)}
                              className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleScoreChange(crit.id, score + 1, crit.maxMarks)}
                              className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center cursor-pointer"
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
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Judges Confidential Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Note on pitch, rhythm, expression, or technical violations..."
                  rows={2}
                  className="w-full bg-[#0e1622] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#00a389]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleSaveAndSubmit(false)}
                  disabled={isPending}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                >
                  Save Draft
                </button>

                <button
                  onClick={() => handleSaveAndSubmit(true)}
                  disabled={isPending}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#00a389] hover:bg-[#008f78] text-white text-xs font-black shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="h-4 w-4" />
                  <span>Lock &amp; Submit Score ({totalCalculated}/{selectedComp.maxMarks})</span>
                </button>
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  )
}
