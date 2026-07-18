"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getTimeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot } from "@/lib/actions/competition"
import { getFestivalStages } from "@/lib/actions/festival"
import { getCompetitionRounds } from "@/lib/actions/competition"
import type { CompetitionTimeSlot, CompetitionRound } from "@/types/competition"
import type { FestivalStage } from "@/types/festival"
import { Loader2, Trash2, Calendar, Plus, Save } from "lucide-react"

export default function SchedulePage() {
  const params = useParams()
  const competitionId = params.competitionId as string
  const festivalId = params.festivalId as string
  const [slots, setSlots] = useState<CompetitionTimeSlot[]>([])
  const [stages, setStages] = useState<FestivalStage[]>([])
  const [rounds, setRounds] = useState<CompetitionRound[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ round_id: "", stage_id: "", slot_date: "", start_time: "", end_time: "", notes: "" })

  async function load() {
    const [s, st, r] = await Promise.all([
      getTimeSlots(festivalId),
      getFestivalStages(festivalId),
      getCompetitionRounds(competitionId),
    ])
    const compSlots = (s as CompetitionTimeSlot[]).filter((sl) => sl.competition_id === competitionId)
    setSlots(compSlots)
    setStages(st as any)
    setRounds(r as CompetitionRound[])
    setLoading(false)
  }
  useEffect(() => { load() }, [competitionId, festivalId])

  async function handleSave() {
    if (!form.slot_date || !form.start_time || !form.end_time) { toast.error("Date and time required"); return }
    setSaving(true)
    const result = editingId
      ? await updateTimeSlot(editingId, form as any)
      : await createTimeSlot(competitionId, form)
    if (result.error) toast.error(result.error)
    else { toast.success(editingId ? "Updated" : "Created"); setShowForm(false); setEditingId(null); setForm({ round_id: "", stage_id: "", slot_date: "", start_time: "", end_time: "", notes: "" }) }
    setSaving(false)
    await load()
  }

  function handleEdit(slot: CompetitionTimeSlot) {
    setForm({ round_id: slot.round_id || "", stage_id: slot.stage_id || "", slot_date: slot.slot_date, start_time: slot.start_time, end_time: slot.end_time, notes: slot.notes || "" })
    setEditingId(slot.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this time slot?")) return
    const result = await deleteTimeSlot(id)
    if (result.error) toast.error(result.error); else toast.success("Deleted")
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">Manage time slots for this competition.</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ round_id: "", stage_id: "", slot_date: "", start_time: "", end_time: "", notes: "" }) }}>
          <Plus className="h-4 w-4 mr-2" /> Add Time Slot
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <Input type="date" value={form.slot_date} onChange={(e) => setForm({ ...form, slot_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Time</label>
                <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Time</label>
                <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Round</label>
                <Select value={form.round_id} onChange={(e) => setForm({ ...form, round_id: e.target.value })} options={[{ value: "", label: "All Rounds" }, ...rounds.map((r) => ({ value: r.id, label: r.name }))]} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Stage</label>
                <Select value={form.stage_id} onChange={(e) => setForm({ ...form, stage_id: e.target.value })} options={[{ value: "", label: "No Stage" }, ...stages.filter((s) => s.is_active).map((s) => ({ value: s.id, label: s.name }))]} />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? <><Save className="h-4 w-4 mr-2" /> Update</> : <><Plus className="h-4 w-4 mr-2" /> Create</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {slots.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No time slots scheduled.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {slots.sort((a, b) => a.slot_date.localeCompare(b.slot_date) || a.start_time.localeCompare(b.start_time)).map((slot) => (
            <Card key={slot.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><Calendar className="h-5 w-5" /></div>
                  <div>
                    <p className="font-medium text-gray-900">{new Date(slot.slot_date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{slot.start_time} - {slot.end_time}{(slot as any).stage?.name ? ` | ${(slot as any).stage.name}` : ""}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(slot)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg text-xs">Edit</button>
                  <button onClick={() => handleDelete(slot.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
