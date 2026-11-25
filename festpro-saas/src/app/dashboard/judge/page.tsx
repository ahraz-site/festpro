"use client"

import React, { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Shield,
  Star,
  CheckCircle2,
  Clock,
  LogOut,
  ChevronRight,
  Award,
  Sparkles,
  Lock,
  Unlock,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react"
import { toast } from "sonner"
import { getJudgeSessionAction, logoutJudgeAction, type JudgeSession } from "@/lib/actions/judge-auth"

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
  maxMarks: number
  criteria: Array<{ id: string; name: string; maxMarks: number }>
  candidates: CandidateItem[]
}

const DEMO_COMPETITIONS: CompetitionItem[] = [
  {
    id: "comp-1",
    name: "Classical Solo Dance (Bharatanatyam)",
    code: "CL-DNC-01",
    category: "Dance",
    stageName: "Main Stage 1",
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
    id: "comp-2",
    name: "Light Music Solo (Malayalam)",
    code: "MUS-LGT-02",
    category: "Music",
    stageName: "Stage 2",
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
    id: "comp-3",
    name: "Mappilappattu Solo",
    code: "MUS-MAP-03",
    category: "Music",
    stageName: "Stage 3",
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
]

export default function JudgeDashboardPage() {
  const router = useRouter()
  const [judgeSession, setJudgeSession] = useState<JudgeSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const [competitions, setCompetitions] = useState<CompetitionItem[]>(DEMO_COMPETITIONS)
  const [selectedCompId, setSelectedCompId] = useState<string>(DEMO_COMPETITIONS[0].id)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(DEMO_COMPETITIONS[0].candidates[1]?.id || DEMO_COMPETITIONS[0].candidates[0].id)
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
          // Fallback demo judge
          setJudgeSession({
            judgeId: "demo-judge",
            festivalId: "c66d0281-bc93-4cb8-b94e-e54bf27c7119",
            name: "Official Stage Judge",
            username: "judge1",
            stageName: "Main Stage 1",
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
  const selectedCandidate = selectedComp.candidates.find((cd) => cd.id === selectedCandidateId) || selectedComp.candidates[0]

  // Synchronize scores when candidate changes
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
        toast.success(`Score of ${totalCalculated}/${selectedComp.maxMarks} locked for ${selectedCandidate.blindCode} (Chest #${selectedCandidate.chestNumber})`)
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

  const handleLogout = async () => {
    await logoutJudgeAction()
    toast.success("Judge signed out successfully.")
    window.location.href = "/login"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080d14] text-white flex items-center justify-center p-6">
        <div className="flex items-center gap-3">
          <span className="h-6 w-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-300">Loading Official Judge Console...</span>
        </div>
      </div>
    )
  }

  const scoredCount = selectedComp.candidates.filter((c) => c.status === "submitted").length
  const totalCount = selectedComp.candidates.length

  return (
    <div className="min-h-screen bg-[#080d14] text-slate-100 flex flex-col">
      {/* ── TOP HEADER ── */}
      <header className="bg-[#0c131d] border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-white">Judge Scoring Console</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Official Jury Portal
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>{judgeSession?.name || "Judge Panel"}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{judgeSession?.stageName || selectedComp.stageName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-[#111927] border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400">Username:</span>
            <span className="font-mono font-bold text-white">{judgeSession?.username || "judge1"}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-rose-500/50 bg-[#111927] hover:bg-rose-500/10 text-xs font-bold text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── MAIN JUDGING WORKSPACE ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Competition & Candidate List */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-800 bg-[#0a1018] p-4 flex flex-col gap-4">
          {/* Competition Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Active Stage Competition
            </label>
            <select
              value={selectedCompId}
              onChange={(e) => {
                setSelectedCompId(e.target.value)
                const comp = competitions.find((c) => c.id === e.target.value)
                if (comp?.candidates[0]) setSelectedCandidateId(comp.candidates[0].id)
              }}
              className="w-full bg-[#111927] border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {competitions.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name} ({comp.code})
                </option>
              ))}
            </select>
          </div>

          {/* Progress Banner */}
          <div className="bg-[#111927] border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Scoring Progress</span>
              <div className="font-black text-white text-sm">
                {scoredCount} of {totalCount} evaluated
              </div>
            </div>
            <div className="h-9 w-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              {Math.round((scoredCount / (totalCount || 1)) * 100)}%
            </div>
          </div>

          {/* Candidates / Blind Codes List */}
          <div className="flex-1 space-y-1.5 overflow-y-auto">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block pb-1">
              Participants on Stage
            </label>
            {selectedComp.candidates.map((cand) => {
              const isSelected = cand.id === selectedCandidateId
              const isSubmitted = cand.status === "submitted"
              return (
                <button
                  key={cand.id}
                  onClick={() => setSelectedCandidateId(cand.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10"
                      : "bg-[#111927] border-slate-800/80 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-white">{cand.blindCode}</span>
                      <span className="text-[10px] font-semibold text-slate-400">Chest #{cand.chestNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isSubmitted ? (
                        <span className="text-emerald-400 font-bold">Score: {cand.totalScore} / {selectedComp.maxMarks}</span>
                      ) : (
                        <span>Ready to score</span>
                      )}
                    </div>
                  </div>

                  <div>
                    {isSubmitted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" /> Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Area: Digital Marksheet Scoring Console */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-between max-w-4xl mx-auto w-full space-y-6">
          {/* Candidate Card Header */}
          <div className="bg-[#0c131d] border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Double-Blind Evaluation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>{selectedCandidate.blindCode}</span>
                <span className="text-sm px-2.5 py-1 rounded-md bg-slate-800 font-mono text-slate-300">
                  Chest #{selectedCandidate.chestNumber}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Evaluating item: <span className="text-white font-semibold">{selectedComp.name}</span> • Stage: <span className="text-white font-semibold">{selectedComp.stageName}</span>
              </p>
            </div>

            {/* Total Marks Badge */}
            <div className="bg-[#111927] border border-slate-800 px-5 py-3 rounded-xl text-center shrink-0">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Score</div>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {totalCalculated}
                <span className="text-xs text-slate-500 ml-1 font-sans">/ {selectedComp.maxMarks}</span>
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                {totalCalculated >= 80 ? "Grade A" : totalCalculated >= 70 ? "Grade B" : totalCalculated >= 60 ? "Grade C" : "Standard"}
              </div>
            </div>
          </div>

          {/* Criteria Scoring Sliders & Inputs */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Evaluation Criteria &amp; Marks Distribution
            </h3>

            <div className="space-y-3">
              {selectedComp.criteria.map((cr) => {
                const mark = Number(currentScores[cr.id]) || 0
                return (
                  <div
                    key={cr.id}
                    className="bg-[#0c131d] border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{cr.name}</div>
                        <div className="text-[11px] text-slate-400">Maximum allowable marks: {cr.maxMarks}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={cr.maxMarks}
                          value={mark || ""}
                          onChange={(e) => handleScoreChange(cr.id, parseInt(e.target.value) || 0, cr.maxMarks)}
                          placeholder="0"
                          className="w-16 bg-[#111927] border border-emerald-500/50 rounded-lg py-1.5 px-2 text-center text-base font-black text-emerald-400 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <span className="text-xs text-slate-500 font-bold">/ {cr.maxMarks}</span>
                      </div>
                    </div>

                    {/* Quick Stepper Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 font-bold mr-1">Quick Select:</span>
                      {[
                        Math.round(cr.maxMarks * 0.4),
                        Math.round(cr.maxMarks * 0.6),
                        Math.round(cr.maxMarks * 0.75),
                        Math.round(cr.maxMarks * 0.85),
                        Math.round(cr.maxMarks * 0.95),
                        cr.maxMarks,
                      ].map((presetVal) => (
                        <button
                          key={presetVal}
                          type="button"
                          onClick={() => handleScoreChange(cr.id, presetVal, cr.maxMarks)}
                          className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                            mark === presetVal
                              ? "bg-emerald-500 text-white border-emerald-400 shadow-sm"
                              : "bg-[#111927] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                          }`}
                        >
                          {presetVal}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Remarks Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Jury Notes / Feedback (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter technical comments, stage feedback, or violation notes for scrutiny committee..."
              rows={2}
              className="w-full bg-[#0c131d] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => handleSaveAndSubmit(false)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-[#111927] text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Save Draft Score
            </button>

            <button
              onClick={() => handleSaveAndSubmit(true)}
              disabled={isPending || totalCalculated === 0}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-black text-xs tracking-wider uppercase shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Lock &amp; Submit Scorecard ({totalCalculated} Marks)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
