"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getSessions, createSession, updateSession, deleteSession } from "@/lib/actions/schedule"
import { getFestivalDays } from "@/lib/actions/festival"
import { SESSION_TYPES, BREAK_TYPES } from "@/config/schedule"
import type { ScheduleSession, SessionFormData } from "@/types/schedule"
import type { FestivalDay } from "@/types/festival"
import { Clock, Plus, Edit, Trash2, Loader2 } from "lucide-react"

export default function SessionsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [sessions, setSessions] = useState<ScheduleSession[]>([])
  const [days, setDays] = useState<FestivalDay[]>([])
  const [loading, setLoading] = useState(true)
  const [dayFilter, setDayFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<SessionFormData>({
    day_id: "", name: "", session_type: "morning", start_time: "09:00", end_time: "12:00",
    buffer_before_minutes: "5", buffer_after_minutes: "5", is_break: false, break_type: "", notes: "",
  })

  useEffect(() => {
    Promise.all([getSessions(festivalId, dayFilter || undefined), getFestivalDays(festivalId)]).then(([sRes, daysData]) => {
      setSessions(sRes.data as ScheduleSession[])
      setDays(daysData as FestivalDay[])
      setLoading(false)
    })
  }, [festivalId, dayFilter])

  const resetForm = () => {
    setForm({ day_id: "", name: "", session_type: "morning", start_time: "09:00", end_time: "12:00", buffer_before_minutes: "5", buffer_after_minutes: "5", is_break: false, break_type: "", notes: "" })
    setEditingId(null); setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      const res = await updateSession(editingId, form)
      if (res.error) toast.error(res.error); else { toast.success("Updated"); resetForm() }
    } else {
      const res = await createSession(festivalId, form)
      if (res.error) toast.error(res.error); else { toast.success("Created"); resetForm() }
    }
    const refreshed = await getSessions(festivalId, dayFilter || undefined)
    setSessions(refreshed.data as ScheduleSession[])
  }

  const handleEdit = (s: ScheduleSession) => {
    setForm({
      day_id: s.day_id || "", name: s.name, session_type: s.session_type,
      start_time: s.start_time, end_time: s.end_time,
      buffer_before_minutes: String(s.buffer_before_minutes), buffer_after_minutes: String(s.buffer_after_minutes),
      is_break: s.is_break, break_type: s.break_type || "", notes: s.notes || "",
    })
    setEditingId(s.id); setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this session?")) return
    const res = await deleteSession(id)
    if (res.error) toast.error(res.error); else {
      toast.success("Deleted")
      setSessions(prev => prev.filter(s => s.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Sessions</h1>
          <p className="text-sm text-gray-500 mt-1">Define time blocks (morning, afternoon, breaks) for each day.</p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(!showForm) }}>
          <Plus className="h-4 w-4 mr-1" />{showForm ? "Cancel" : "New Session"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-sm">{editingId ? "Edit" : "Create"} Session</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                  <Select options={days.map(d => ({ value: d.id, label: `${d.label || `Day ${d.day_number}`} (${d.date})` }))} placeholder="Select day" value={form.day_id} onChange={e => setForm(f => ({ ...f, day_id: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Name *</label>
                  <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Morning Session" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <Select options={SESSION_TYPES} value={form.session_type} onChange={e => setForm(f => ({ ...f, session_type: e.target.value as any }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buffer (min)</label>
                  <Input type="number" value={form.buffer_before_minutes} onChange={e => setForm(f => ({ ...f, buffer_before_minutes: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_break} onChange={e => setForm(f => ({ ...f, is_break: e.target.checked }))} className="rounded" />
                  Break Session
                </label>
                {form.is_break && (
                  <Select options={BREAK_TYPES} value={form.break_type} onChange={e => setForm(f => ({ ...f, break_type: e.target.value }))} />
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
                <Button type="submit" size="sm">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          <Select options={days.map(d => ({ value: d.id, label: `${d.label || `Day ${d.day_number}`} (${d.date})` }))} placeholder="All Days" value={dayFilter} onChange={e => setDayFilter(e.target.value)} />
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
      ) : sessions.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No sessions defined. Create your first session!</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {sessions.map(s => (
            <Card key={s.id} className={`${s.is_break ? "border-amber-200 bg-amber-50" : ""}`}>
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${s.is_break ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"}`}>
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{s.name}</h3>
                    <p className="text-xs text-gray-500">
                      {s.start_time} - {s.end_time} | {SESSION_TYPES.find(t => t.value === s.session_type)?.label}
                      {s.day ? ` | ${s.day.label || ""} (${s.day.date})` : ""}
                      {s.is_break && <span className="ml-2 text-amber-600 font-medium">Break</span>}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(s)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
