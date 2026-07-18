"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getScores, getOrCreateScore, saveScoreItem, submitScore, lockScore } from "@/lib/actions/judging"
import { getCompetitionCriteria } from "@/lib/actions/judging"
import { getRegistrations } from "@/lib/actions/participant/registrations"
import type { Score, CompetitionCriteria } from "@/types/judging"
import type { Registration } from "@/types/participant"
import { Loader2, CheckCircle, Lock, Send, Save } from "lucide-react"

export default function ScoreEntryPage() {
  const params = useParams()
  const competitionId = params.competitionId as string
  const festivalId = params.festivalId as string
  const [scores, setScores] = useState<Score[]>([])
  const [criteriaList, setCriteriaList] = useState<CompetitionCriteria[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [scoreValues, setScoreValues] = useState<Record<string, Record<string, number>>>({})
  const [saving, setSaving] = useState(false)
  const [activeParticipant, setActiveParticipant] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [sRes, cRes, rRes] = await Promise.all([
      getScores(competitionId),
      getCompetitionCriteria(competitionId),
      getRegistrations(festivalId, { competition_id: competitionId }),
    ])
    setScores(sRes.data || [])
    setCriteriaList(cRes.data || [])
    setRegistrations(rRes.data || [])
    setLoading(false)
  }, [competitionId])

  useEffect(() => { load() }, [load])

  const handleScoreChange = (participantId: string, criteriaId: string, value: number) => {
    setScoreValues(prev => ({
      ...prev,
      [participantId]: { ...(prev[participantId] || {}), [criteriaId]: value },
    }))
  }

  const handleAutoSave = async (participantId: string) => {
    setSaving(true)
    const values = scoreValues[participantId]
    if (!values) { setSaving(false); return }

    let score = scores.find(s => s.participant_id === participantId)
    if (!score) {
      const res = await getOrCreateScore(competitionId, participantId, "", festivalId)
      if (res.error) { toast.error(res.error); setSaving(false); return }
      score = res.data
      setScores(prev => [...prev, score!])
    }

    if (!score) { setSaving(false); return }
    for (const c of criteriaList) {
      const val = values[c.criteria_id]
      if (val !== undefined) {
        await saveScoreItem(score.id, c.criteria_id, val, c.max_score || c.criteria?.max_score, c.weight || c.criteria?.weight)
      }
    }
    setSaving(false)
    toast.success("Scores saved")
  }

  const handleSubmitScore = async (participantId: string) => {
    let score = scores.find(s => s.participant_id === participantId)
    if (!score) { toast.error("Save scores first"); return }
    await handleAutoSave(participantId)
    const res = await submitScore(score.id)
    if (res.error) toast.error(res.error); else { toast.success("Score submitted"); load() }
  }

  const handleLockScore = async (participantId: string) => {
    let score = scores.find(s => s.participant_id === participantId)
    if (!score) { toast.error("Save scores first"); return }
    const res = await lockScore(score.id)
    if (res.error) toast.error(res.error); else { toast.success("Score locked"); load() }
  }

  const participantStatus = (pid: string) => {
    const s = scores.find(s => s.participant_id === pid)
    return s?.status || "pending"
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Score Entry</h1>
        <p className="text-sm text-gray-500 mt-1">Enter scores for each participant across all criteria.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Assigned Criteria</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {criteriaList.map(c => (
            <span key={c.id} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
              {c.criteria?.name} (max: {c.max_score ?? c.criteria?.max_score})
            </span>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {registrations.map((reg) => {
          const p = reg.participant
          const status = participantStatus(p?.id || "")
          return (
            <Card key={reg.id}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{p?.first_name} {p?.last_name}</p>
                    <p className="text-xs text-gray-400">ID: {p?.participant_id} | Chest: {p?.chest_number}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    status === "approved" ? "bg-green-100 text-green-700" :
                    status === "submitted" ? "bg-blue-100 text-blue-700" :
                    status === "locked" ? "bg-purple-100 text-purple-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>{status}</span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleAutoSave(p?.id || "")} disabled={saving}>
                    <Save className="h-3 w-3 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="outline" className="text-blue-600" onClick={() => handleSubmitScore(p?.id || "")} disabled={status === "submitted" || status === "locked"}>
                    <Send className="h-3 w-3 mr-1" /> Submit
                  </Button>
                  <Button size="sm" variant="outline" className="text-purple-600" onClick={() => handleLockScore(p?.id || "")} disabled={status === "locked"}>
                    <Lock className="h-3 w-3 mr-1" /> Lock
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {criteriaList.map(c => (
                    <div key={c.id}>
                      <label className="text-xs text-gray-500 block mb-1">{c.criteria?.name}</label>
                      <Input
                        type="number"
                        step="0.1"
                        min={0}
                        max={c.max_score ?? c.criteria?.max_score}
                        placeholder={`0-${c.max_score ?? c.criteria?.max_score}`}
                        value={scoreValues[p?.id || ""]?.[c.criteria_id] ?? ""}
                        onChange={e => handleScoreChange(p?.id || "", c.criteria_id, parseFloat(e.target.value) || 0)}
                        disabled={status === "locked"}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
