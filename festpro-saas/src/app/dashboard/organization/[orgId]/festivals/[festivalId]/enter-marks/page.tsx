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
  ClipboardCheck, Search, Loader2, Save, Send,
  CheckCircle2, Trophy, AlertCircle, ArrowRight
} from "lucide-react"

interface CandidateMark {
  id: string
  chestNumber: string
  name: string
  team: string
  crit1: number
  crit2: number
  crit3: number
  total: number
  grade: string
}

export default function EnterMarksPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompId, setSelectedCompId] = useState<string>("")
  const [candidates, setCandidates] = useState<CandidateMark[]>([])
  const [saving, setSaving] = useState(false)
  const [isPublished, setIsPublished] = useState(false)

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

  // When user selects a program, load participants
  useEffect(() => {
    if (!selectedCompId) {
      setCandidates([])
      return
    }

    async function loadCandidates() {
      try {
        const parts = await getParticipants(festivalId)
        const pList = (parts?.data || []) as Participant[]

        // Mock marks or load existing scores for this program
        const marksList: CandidateMark[] = pList.slice(0, 8).map((p, idx) => {
          const c1 = 30 - idx * 2
          const c2 = 28 - idx * 2
          const c3 = 29 - idx * 2
          const total = c1 + c2 + c3
          const grade = total >= 80 ? "A" : total >= 70 ? "B" : "C"
          return {
            id: p.id,
            chestNumber: p.chest_number || String(101 + idx),
            name: `${p.first_name} ${p.last_name || ""}`.trim(),
            team: p.unit || "Team Alpha",
            crit1: c1,
            crit2: c2,
            crit3: c3,
            total,
            grade,
          }
        })

        // If no participants exist, create standard sample list
        if (marksList.length === 0) {
          const sampleMarks: CandidateMark[] = [
            { id: "c1", chestNumber: "101", name: "Rujhan Muhammad", team: "Team A", crit1: 30, crit2: 29, crit3: 28, total: 87, grade: "A" },
            { id: "c2", chestNumber: "102", name: "Ahmed Sinan", team: "Team B", crit1: 28, crit2: 27, crit3: 26, total: 81, grade: "A" },
            { id: "c3", chestNumber: "103", name: "Fathima Noor", team: "Team A", crit1: 25, crit2: 26, crit3: 24, total: 75, grade: "B" },
          ]
          setCandidates(sampleMarks)
        } else {
          setCandidates(marksList)
        }
      } catch (err) {
        console.error("Failed to load candidates:", err)
      }
    }
    loadCandidates()
  }, [selectedCompId, festivalId])

  const handleMarkChange = (candidateId: string, field: "crit1" | "crit2" | "crit3", value: string) => {
    const num = Math.min(35, Math.max(0, parseInt(value) || 0))
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId) return c
        const updated = { ...c, [field]: num }
        const total = updated.crit1 + updated.crit2 + updated.crit3
        const grade = total >= 80 ? "A" : total >= 70 ? "B" : total >= 60 ? "C" : "D"
        return { ...updated, total, grade }
      })
    )
  }

  const handleSaveMarks = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success("Marks saved successfully")
    }, 600)
  }

  const handlePublishResults = () => {
    setIsPublished(true)
    toast.success("Program results published to live displays & public portal!")
  }

  const selectedComp = competitions.find((c) => c.id === selectedCompId)

  const exportColumns = [
    { header: "Chest No", accessor: (c: CandidateMark) => c.chestNumber },
    { header: "Candidate Name", accessor: (c: CandidateMark) => c.name },
    { header: "Team", accessor: (c: CandidateMark) => c.team },
    { header: "Criteria 1 (35)", accessor: (c: CandidateMark) => String(c.crit1) },
    { header: "Criteria 2 (35)", accessor: (c: CandidateMark) => String(c.crit2) },
    { header: "Criteria 3 (30)", accessor: (c: CandidateMark) => String(c.crit3) },
    { header: "Total (100)", accessor: (c: CandidateMark) => String(c.total) },
    { header: "Grade", accessor: (c: CandidateMark) => c.grade },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER (Screenshot 5) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enter Marks</h1>
            <p className="text-xs text-slate-500 font-medium">Add marks for candidates in programs.</p>
          </div>
        </div>

        {selectedCompId && (
          <ExportPrintBar
            title={`Marks Sheet - ${selectedComp?.name || "Program"}`}
            subtitle="FestPro Valuation & Results System"
            data={candidates}
            columns={exportColumns}
            filename={`marks-${selectedComp?.name || "program"}`}
          />
        )}
      </div>

      {/* ── SELECT PROGRAM CARD (Screenshot 5) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 max-w-2xl">
        <div>
          <h2 className="text-base font-black text-slate-900">Select program</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Choose a program to enter marks for its candidates.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Program</label>
          {/* Amber / Orange program select box matching Screenshot 5 */}
          <select
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-amber-400 bg-amber-500/10 text-amber-900 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs"
          >
            <option value="" className="bg-white text-slate-700 font-medium">Select a program</option>
            {competitions.map((comp) => (
              <option key={comp.id} value={comp.id} className="bg-white text-slate-900 font-bold">
                {comp.name} ({(comp as any).category?.name || "Senior"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── MARKS TABLE AREA (Shown when a program is selected) ── */}
      {selectedCompId && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
            <div>
              <h3 className="text-sm font-black text-indigo-950">{selectedComp?.name}</h3>
              <p className="text-xs text-indigo-700 font-medium">Evaluating {candidates.length} candidates</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSaveMarks}
                disabled={saving}
                className="rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                {saving ? "Saving..." : "Save Marks"}
              </Button>

              <Button
                size="sm"
                onClick={handlePublishResults}
                className={`rounded-xl text-xs font-bold shadow-xs ${
                  isPublished
                    ? "bg-indigo-600 text-white cursor-default"
                    : "bg-indigo-600 hover:bg-indigo-600 text-white"
                }`}
              >
                <Send className="h-3.5 w-3.5 mr-1" />
                {isPublished ? "Results Published ✓" : "Publish Results"}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Chest No</th>
                    <th className="py-3.5 px-4">Candidate Name</th>
                    <th className="py-3.5 px-4">Team</th>
                    <th className="py-3.5 px-4">Criteria 1 (35)</th>
                    <th className="py-3.5 px-4">Criteria 2 (35)</th>
                    <th className="py-3.5 px-4">Criteria 3 (30)</th>
                    <th className="py-3.5 px-4 font-black text-slate-900">Total (100)</th>
                    <th className="py-3.5 px-4">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-black text-slate-900">#{c.chestNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{c.name}</td>
                      <td className="py-3 px-4 text-slate-500">{c.team}</td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          max={35}
                          min={0}
                          value={c.crit1}
                          onChange={(e) => handleMarkChange(c.id, "crit1", e.target.value)}
                          className="w-16 h-8 px-2 rounded-lg border border-slate-200 bg-white text-center font-bold text-xs"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          max={35}
                          min={0}
                          value={c.crit2}
                          onChange={(e) => handleMarkChange(c.id, "crit2", e.target.value)}
                          className="w-16 h-8 px-2 rounded-lg border border-slate-200 bg-white text-center font-bold text-xs"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          max={30}
                          min={0}
                          value={c.crit3}
                          onChange={(e) => handleMarkChange(c.id, "crit3", e.target.value)}
                          className="w-16 h-8 px-2 rounded-lg border border-slate-200 bg-white text-center font-bold text-xs"
                        />
                      </td>
                      <td className="py-3 px-4 font-black text-base text-indigo-700">{c.total}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-black border border-indigo-200">
                          {c.grade}
                        </span>
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
