"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getStageAssignments, assignStage, removeStageAssignment } from "@/lib/actions/competition"
import { getFestivalStages } from "@/lib/actions/festival"
import type { CompetitionStageAssignment } from "@/types/competition"
import type { FestivalStage } from "@/types/festival"
import { Loader2, Trash2, MapPin, Plus } from "lucide-react"

export default function StageAssignmentPage() {
  const params = useParams()
  const competitionId = params.competitionId as string
  const festivalId = params.festivalId as string
  const [assignments, setAssignments] = useState<CompetitionStageAssignment[]>([])
  const [stages, setStages] = useState<FestivalStage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ stage_id: "", assigned_date: "", start_time: "", end_time: "", notes: "" })

  async function load() {
    const [as, st] = await Promise.all([getStageAssignments(competitionId), getFestivalStages(festivalId)])
    setAssignments(as as CompetitionStageAssignment[])
    setStages(st as any)
    setLoading(false)
  }
  useEffect(() => { load() }, [competitionId, festivalId])

  async function handleAssign() {
    if (!form.stage_id) { toast.error("Select a stage"); return }
    setSaving(true)
    const result = await assignStage(competitionId, form)
    if (result.error) toast.error(result.error)
    else { toast.success("Stage assigned!"); setShowForm(false); setForm({ stage_id: "", assigned_date: "", start_time: "", end_time: "", notes: "" }) }
    setSaving(false)
    await load()
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this stage assignment?")) return
    const result = await removeStageAssignment(id)
    if (result.error) toast.error(result.error); else toast.success("Removed")
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stage Assignment</h1>
          <p className="text-sm text-gray-500 mt-1">Assign this competition to festival stages.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" /> Assign Stage</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Stage</label>
              <Select value={form.stage_id} onChange={(e) => setForm({ ...form, stage_id: e.target.value })} options={[{ value: "", label: "Select Stage" }, ...stages.filter((s) => s.is_active).map((s) => ({ value: s.id, label: s.name }))]} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Date</label><Input type="date" value={form.assigned_date} onChange={(e) => setForm({ ...form, assigned_date: e.target.value })} /></div>
              <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Start</label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
              <div className="space-y-2"><label className="text-sm font-medium text-gray-700">End</label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
            </div>
            <Button onClick={handleAssign} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <MapPin className="h-4 w-4 mr-2" /> Assign
            </Button>
          </CardContent>
        </Card>
      )}

      {assignments.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No stages assigned.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600"><MapPin className="h-5 w-5" /></div>
                  <div>
                    <p className="font-medium text-gray-900">{(a as any).stage?.name || "Stage"}</p>
                    <p className="text-xs text-gray-500">
                      {a.assigned_date && new Date(a.assigned_date).toLocaleDateString()}
                      {a.start_time && ` | ${a.start_time}`}{a.end_time && ` - ${a.end_time}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleRemove(a.id)} className="p-2 text-red-400 hover:text-red-600 rounded-lg"><Trash2 className="h-4 w-4" /></button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
