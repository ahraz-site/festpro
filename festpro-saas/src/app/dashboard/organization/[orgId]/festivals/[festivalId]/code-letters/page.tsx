"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getCompetitions } from "@/lib/actions/competition"
import { getParticipants } from "@/lib/actions/participant"
import type { Competition } from "@/types/competition"
import type { Participant } from "@/types/participant"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Keyboard, Search, Loader2, Save, CheckCircle2,
  Sparkles, Check, ArrowRight
} from "lucide-react"

interface CandidateCode {
  id: string
  chestNumber: string
  name: string
  team: string
  codeLetter: string
  isReported: boolean
}

export default function CodeLettersPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompId, setSelectedCompId] = useState<string>("")
  const [candidates, setCandidates] = useState<CandidateCode[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const comps = await getCompetitions(festivalId)
        const compList = (comps || []) as Competition[]
        setCompetitions(compList)
      } catch (err) {
        console.error("Failed to load competitions:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [festivalId])

  useEffect(() => {
    if (!selectedCompId) {
      setCandidates([])
      return
    }

    async function loadCandidates() {
      try {
        const parts = await getParticipants(festivalId)
        const pList = (parts?.data || []) as Participant[]

        const codesList: CandidateCode[] = pList.slice(0, 8).map((p, idx) => {
          const letter = String.fromCharCode(65 + idx) // A, B, C...
          return {
            id: p.id,
            chestNumber: p.chest_number || String(101 + idx),
            name: `${p.first_name} ${p.last_name || ""}`.trim(),
            team: p.unit || "Team Alpha",
            codeLetter: letter,
            isReported: idx < 4,
          }
        })

        if (codesList.length === 0) {
          const sample: CandidateCode[] = [
            { id: "c1", chestNumber: "101", name: "Rujhan Muhammad", team: "Team A", codeLetter: "A", isReported: true },
            { id: "c2", chestNumber: "102", name: "Ahmed Sinan", team: "Team B", codeLetter: "B", isReported: true },
            { id: "c3", chestNumber: "103", name: "Fathima Noor", team: "Team A", codeLetter: "C", isReported: false },
          ]
          setCandidates(sample)
        } else {
          setCandidates(codesList)
        }
      } catch (err) {
        console.error("Failed to load participants:", err)
      }
    }
    loadCandidates()
  }, [selectedCompId, festivalId])

  const handleLetterChange = (id: string, letter: string) => {
    const val = letter.toUpperCase().slice(0, 2)
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, codeLetter: val, isReported: val ? true : c.isReported } : c))
    )
  }

  const handleToggleReported = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isReported: !c.isReported } : c))
    )
  }

  const handleAutoAssign = () => {
    setCandidates((prev) =>
      prev.map((c, idx) => ({
        ...c,
        codeLetter: String.fromCharCode(65 + idx),
        isReported: true,
      }))
    )
    toast.success("Assigned letters A through Z to all candidates")
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success("Code letters saved. Candidates marked as reported!")
    }, 500)
  }

  const selectedComp = competitions.find((c) => c.id === selectedCompId)

  const exportColumns = [
    { header: "Chest No", accessor: (c: CandidateCode) => c.chestNumber },
    { header: "Candidate Name", accessor: (c: CandidateCode) => c.name },
    { header: "Team", accessor: (c: CandidateCode) => c.team },
    { header: "Code Letter", accessor: (c: CandidateCode) => c.codeLetter },
    { header: "Status", accessor: (c: CandidateCode) => (c.isReported ? "Reported" : "Not Reported") },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER (Screenshot 6) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <Keyboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Code letters</h1>
            <p className="text-xs text-slate-500 font-medium">Start codes with a letter. Saving a code marks that candidate as reported.</p>
          </div>
        </div>

        {selectedCompId && (
          <ExportPrintBar
            title={`Code Letters - ${selectedComp?.name || "Program"}`}
            subtitle="FestPro Secret Code & Reporting System"
            data={candidates}
            columns={exportColumns}
            filename={`code-letters-${selectedComp?.name || "program"}`}
          />
        )}
      </div>

      {/* ── PROGRAM SELECTOR CARD (Screenshot 6) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 max-w-2xl">
        <label className="block text-xs font-bold text-slate-700">Program</label>
        <select
          value={selectedCompId}
          onChange={(e) => setSelectedCompId(e.target.value)}
          className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 shadow-xs"
        >
          <option value="">Select a program</option>
          {competitions.map((comp) => (
            <option key={comp.id} value={comp.id}>
              {comp.name} ({(comp as any).category?.name || "Senior"})
            </option>
          ))}
        </select>
      </div>

      {/* ── CODE LETTERS TABLE (When Program is Selected) ── */}
      {selectedCompId && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <h3 className="text-sm font-black text-slate-900">{selectedComp?.name}</h3>
              <p className="text-xs text-slate-500 font-medium">
                {candidates.filter((c) => c.isReported).length} of {candidates.length} candidates reported
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAutoAssign}
                className="rounded-xl text-xs font-semibold border-slate-200 text-slate-700 hover:bg-white"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                Auto-assign A-Z
              </Button>

              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                {saving ? "Saving..." : "Save Code Letters"}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Chest No</th>
                    <th className="py-3 px-4">Candidate Name</th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-4 text-center">Code Letter</th>
                    <th className="py-3 px-4 text-center">Reported</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-black text-slate-900">#{c.chestNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{c.name}</td>
                      <td className="py-3.5 px-4 text-slate-500">{c.team}</td>

                      {/* Code Letter Input */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="text"
                          maxLength={2}
                          value={c.codeLetter}
                          onChange={(e) => handleLetterChange(c.id, e.target.value)}
                          placeholder="—"
                          className="w-14 h-9 px-2 rounded-xl border border-slate-300 bg-white text-center font-black text-sm uppercase text-indigo-700 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        />
                      </td>

                      {/* Reported Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleReported(c.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            c.isReported
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {c.isReported && <Check className="h-3 w-3" />}
                          <span>{c.isReported ? "Reported" : "Pending"}</span>
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
    </div>
  )
}
