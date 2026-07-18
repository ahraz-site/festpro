"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getScoringRules, upsertScoringRules, getCompetitionCriteria, assignCriteriaToCompetition, removeCriteriaFromCompetition } from "@/lib/actions/judging"
import { getCriteria } from "@/lib/actions/judging"
import { SCORING_METHODS } from "@/config/judging"
import type { CompetitionScoringRule, CompetitionCriteria, ScoringCriteria } from "@/types/judging"
import { Loader2, Plus, Trash2, Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function CompetitionScoringPage() {
  const params = useParams()
  const competitionId = params.competitionId as string
  const festivalId = params.festivalId as string
  const [rules, setRules] = useState<CompetitionScoringRule | null>(null)
  const [assigned, setAssigned] = useState<CompetitionCriteria[]>([])
  const [allCriteria, setAllCriteria] = useState<ScoringCriteria[]>([])
  const [loading, setLoading] = useState(true)
  const [selCriteria, setSelCriteria] = useState("")
  const [selMethod, setSelMethod] = useState("average")
  const [passThreshold, setPassThreshold] = useState("60")

  const load = useCallback(async () => {
    const [rRes, aRes, cRes] = await Promise.all([
      getScoringRules(competitionId),
      getCompetitionCriteria(competitionId),
      getCriteria(festivalId),
    ])
    setRules(rRes.data as any)
    setAssigned(aRes.data as any)
    setAllCriteria(cRes.data as any)
    if (rRes.data) { setSelMethod(rRes.data.scoring_method); setPassThreshold(String(rRes.data?.passing_score ?? 60)) }
    setLoading(false)
  }, [competitionId, festivalId])

  useEffect(() => { load() }, [load])

  const handleSaveRules = async () => {
    const res = await upsertScoringRules(competitionId, {
      scoring_method: selMethod as any, passing_score: parseFloat(passThreshold) || 60,
    })
    if (res.error) toast.error(res.error); else toast.success("Scoring rules saved")
  }

  const handleAssign = async () => {
    if (!selCriteria) return
    const res = await assignCriteriaToCompetition(competitionId, selCriteria)
    if (res.error) toast.error(res.error); else { toast.success("Criteria assigned"); load() }
  }

  const handleRemove = async (id: string) => {
    const res = await removeCriteriaFromCompetition(id)
    if (res.error) toast.error(res.error); else { toast.success("Criteria removed"); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scoring Rules & Criteria</h1>
        <p className="text-sm text-gray-500 mt-1">Configure scoring method and assign criteria for this competition.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Scoring Rules</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Scoring Method</label>
            <Select options={SCORING_METHODS.map(m => ({ value: m.value, label: m.label }))} value={selMethod} onChange={e => setSelMethod(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Pass Threshold (%)</label>
            <Input type="number" value={passThreshold} onChange={e => setPassThreshold(e.target.value)} />
          </div>
          <Button onClick={handleSaveRules}><Save className="h-4 w-4 mr-1" /> Save Rules</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Assigned Criteria</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {assigned.length === 0 ? (
            <p className="text-sm text-gray-400">No criteria assigned yet.</p>
          ) : (
            assigned.map(a => (
              <div key={a.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{a.criteria?.name}</span>
                  {a.criteria?.group && <span className="text-xs text-gray-400 ml-2">({a.criteria.group.name})</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Max: {a.max_score ?? a.criteria?.max_score}</span>
                  <span>Weight: {a.weight ?? a.criteria?.weight}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(a.id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Assign Criteria</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Select
            options={allCriteria.filter(c => !assigned.find(a => a.criteria_id === c.id)).map(c => ({ value: c.id, label: `${c.name} (max: ${c.max_score})` }))}
            placeholder="Select criteria"
            value={selCriteria}
            onChange={e => setSelCriteria(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAssign} disabled={!selCriteria}><Plus className="h-4 w-4 mr-1" /> Assign</Button>
        </CardContent>
      </Card>
    </div>
  )
}
