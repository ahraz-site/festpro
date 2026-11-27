"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import type { Competition } from "@/types/competition"
import type { Participant } from "@/types/participant"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ClipboardCheck, Loader2, Save, Send, Users } from "lucide-react"
import { getCachedWorkspace, fetchWorkspaceWithSWR, invalidateFestivalWorkspace } from "@/lib/cache/workspace-cache"

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
  const festivalId = params.festivalId as string

  const initialCache = getCachedWorkspace(festivalId, "enter-marks")
  const [competitions, setCompetitions] = useState<Competition[]>(() => (initialCache?.competitions || []) as Competition[])
  const [participants, setParticipants] = useState<Participant[]>(() => (initialCache?.participants || []) as Participant[])
  const [registrations, setRegistrations] = useState<any[]>(() => initialCache?.registrations || [])
  const [programMarksMap, setProgramMarksMap] = useState<Record<string, CandidateMark[]>>(() => initialCache?.customFields?.program_marks || {})
  const [resultItems, setResultItems] = useState<any[]>(() => initialCache?.resultItems || [])

  const [loading, setLoading] = useState(!initialCache)
  const [selectedCompId, setSelectedCompId] = useState<string>("")
  const [candidates, setCandidates] = useState<CandidateMark[]>([])
  const [saving, setSaving] = useState(false)
  const [isPublished, setIsPublished] = useState(false)

  const loadWorkspace = useCallback(async () => {
    try {
      await fetchWorkspaceWithSWR(festivalId, "enter-marks", (json) => {
        setCompetitions((json.competitions || []) as Competition[])
        setParticipants((json.participants || []) as Participant[])
        setRegistrations(json.registrations || [])
        setProgramMarksMap(json.customFields?.program_marks || {})
        setResultItems(json.resultItems || [])
      })
    } catch (err) {
      console.error("Failed to load enter-marks workspace:", err)
    } finally {
      setLoading(false)
    }
  }, [festivalId])

  useEffect(() => {
    if (festivalId) loadWorkspace()
  }, [festivalId, loadWorkspace])

  // Sync candidates list cleanly when selected competition changes
  useEffect(() => {
    if (!selectedCompId) {
      setCandidates([])
      setIsPublished(false)
      return
    }

    const comp = competitions.find((c) => c.id === selectedCompId)
    const compCatName = ((comp as any)?.category?.name || "").toLowerCase()
    const compRegs = registrations.filter((r) => r.competition_id === selectedCompId)

    let eligibleParts: Participant[] = []
    if (compRegs.length > 0) {
      const regIds = new Set(compRegs.map((r) => r.participant_id))
      eligibleParts = participants.filter((p) => regIds.has(p.id))
    } else if (compCatName) {
      const catMatch = participants.filter(
        (p) => (p.division || "").toLowerCase() === compCatName
      )
      eligibleParts = catMatch.length > 0 ? catMatch : participants
    } else {
      eligibleParts = participants
    }

    const savedMarks = programMarksMap[selectedCompId] || []
    const savedById = new Map(savedMarks.map((m) => [m.id, m]))

    const list: CandidateMark[] = eligibleParts.map((p) => {
      const prev = savedById.get(p.id)
      const c1 = prev?.crit1 ?? 0
      const c2 = prev?.crit2 ?? 0
      const c3 = prev?.crit3 ?? 0
      const total = c1 + c2 + c3
      const grade = total >= 80 ? "A" : total >= 70 ? "B" : total >= 60 ? "C" : total > 0 ? "D" : "—"
      return {
        id: p.id,
        chestNumber: p.chest_number || p.participant_id || "-",
        name: `${p.first_name || ""} ${p.last_name || ""}`.trim(),
        team: p.unit || "Unassigned",
        crit1: c1,
        crit2: c2,
        crit3: c3,
        total,
        grade,
      }
    })

    const alreadyPub =
      comp?.status === "completed" ||
      resultItems.some(
        (r) => r.competition_id === selectedCompId && (r.status === "live" || r.status === "published")
      )

    setCandidates(list)
    setIsPublished(alreadyPub)
  }, [selectedCompId, competitions, participants, registrations, programMarksMap, resultItems])

  const handleMarkChange = (candidateId: string, field: "crit1" | "crit2" | "crit3", value: string) => {
    const maxVal = field === "crit3" ? 30 : 35
    const num = Math.min(maxVal, Math.max(0, parseInt(value) || 0))
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== candidateId) return c
        const updated = { ...c, [field]: num }
        const total = updated.crit1 + updated.crit2 + updated.crit3
        const grade = total >= 80 ? "A" : total >= 70 ? "B" : total >= 60 ? "C" : total > 0 ? "D" : "—"
        return { ...updated, total, grade }
      })
    )
  }

  const persistMarks = async (publish: boolean) => {
    if (!selectedCompId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/festival/${festivalId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: publish ? "publish_results" : "save_marks",
          payload: {
            competitionId: selectedCompId,
            candidates,
            publish,
          },
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || "Failed to save marks")
      } else {
        setProgramMarksMap((prev) => ({ ...prev, [selectedCompId]: candidates }))
        if (publish) {
          setIsPublished(true)
          toast.success("Results published live to public portal, TV screens & standings!")
        } else {
          toast.success("Draft marks saved cleanly!")
        }
      }
    } catch {
      toast.error("Failed to connect to server")
    } finally {
      setSaving(false)
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enter Marks</h1>
            <p className="text-xs text-slate-500 font-medium">Enter valuation marks and publish official results.</p>
          </div>
        </div>

        {selectedCompId && candidates.length > 0 && (
          <ExportPrintBar
            title={`Marks Sheet - ${selectedComp?.name || "Program"}`}
            subtitle="FestPro Valuation & Results System"
            data={candidates}
            columns={exportColumns}
            filename={`marks-${selectedComp?.name || "program"}`}
          />
        )}
      </div>

      {/* ── SELECT PROGRAM CARD ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 max-w-2xl">
        <div>
          <h2 className="text-base font-black text-slate-900">Select program</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Choose a program to enter marks for its candidates.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Program</label>
          <select
            value={selectedCompId}
            onChange={(e) => setSelectedCompId(e.target.value)}
            disabled={loading}
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          >
            <option value="">{loading ? "Loading programs..." : "Select a program"}</option>
            {competitions.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name} ({(comp as any).category?.name || "General"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── MARKS TABLE AREA ── */}
      {selectedCompId && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
            <div>
              <h3 className="text-sm font-black text-indigo-950">{selectedComp?.name}</h3>
              <p className="text-xs text-indigo-700 font-medium">
                {candidates.length} eligible candidate{candidates.length === 1 ? "" : "s"}
              </p>
            </div>

            {candidates.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => persistMarks(false)}
                  disabled={saving}
                  className="rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  {saving ? "Saving..." : "Save Marks"}
                </Button>

                <Button
                  size="sm"
                  onClick={() => persistMarks(true)}
                  disabled={saving}
                  className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  <Send className="h-3.5 w-3.5 mr-1" />
                  {isPublished ? "Update Published Results ✓" : "Publish Results"}
                </Button>
              </div>
            )}
          </div>

          {candidates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-2">
              <Users className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No participants enrolled yet</h3>
              <p className="text-xs text-slate-400">
                Add participants and assign them to this program or category before entering marks.
              </p>
            </div>
          ) : (
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
          )}
        </div>
      )}
    </div>
  )
}
