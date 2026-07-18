"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getShifts, upsertShift, getShiftTemplates, upsertShiftTemplate } from "@/lib/actions/volunteer"
import { SHIFT_TYPES, DUTY_STATUSES } from "@/config/volunteer"
import type { Shift, ShiftTemplate } from "@/types/volunteer"
import { Loader2, Plus, Pencil, X, Clock, CalendarDays, Sun, Sunset, Moon } from "lucide-react"

export default function ShiftsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [shifts, setShifts] = useState<any[]>([])
  const [templates, setTemplates] = useState<ShiftTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [filterStatus, setFilterStatus] = useState("")
  const [form, setForm] = useState({ volunteer_id: "", staff_id: "", template_id: "", date: new Date().toISOString().split("T")[0], start_time: "09:00", end_time: "17:00", is_overtime: false, notes: "" })
  const [templateForm, setTemplateForm] = useState({ name: "", shift_type: "morning", start_time: "06:00", end_time: "14:00", break_duration: "30", color: "#6366f1" })

  const load = useCallback(async () => {
    const [sRes, tRes] = await Promise.all([getShifts(festivalId, date, filterStatus ? { status: filterStatus } : undefined), getShiftTemplates(festivalId)])
    setShifts(sRes.data || []); setTemplates(tRes.data || []); setLoading(false)
  }, [festivalId, date, filterStatus])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsertShift({ id: editingId || undefined, festival_id: festivalId, ...form })
    setShowForm(false); setEditingId(null); setForm({ volunteer_id: "", staff_id: "", template_id: "", date: new Date().toISOString().split("T")[0], start_time: "09:00", end_time: "17:00", is_overtime: false, notes: "" })
    load()
  }

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsertShiftTemplate({ festival_id: festivalId, ...templateForm, break_duration: Number(templateForm.break_duration) })
    setShowTemplateForm(false); setTemplateForm({ name: "", shift_type: "morning", start_time: "06:00", end_time: "14:00", break_duration: "30", color: "#6366f1" })
    load()
  }

  const handleEdit = (s: any) => {
    setForm({ volunteer_id: s.volunteer_id || "", staff_id: s.staff_id || "", template_id: s.template_id || "", date: s.date, start_time: s.start_time.slice(0, 5), end_time: s.end_time.slice(0, 5), is_overtime: s.is_overtime, notes: s.notes || "" })
    setEditingId(s.id); setShowForm(true)
  }

  const shiftIcon = (type: string) => {
    switch (type) {
      case "morning": return <Sun className="h-4 w-4 text-amber-500" />
      case "afternoon": return <Sun className="h-4 w-4 text-orange-500" />
      case "evening": return <Sunset className="h-4 w-4 text-indigo-500" />
      case "night": return <Moon className="h-4 w-4 text-blue-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shifts</h1>
          <p className="text-sm text-gray-500 mt-1">{shifts.length} shifts on selected date.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplateForm(true)}><Plus className="h-4 w-4 mr-1" /> Template</Button>
          <Button onClick={() => { setEditingId(null); setShowForm(true) }}><Plus className="h-4 w-4 mr-1" /> Add Shift</Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Shift" : "New Shift"}</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null) }}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Volunteer ID</label><Input value={form.volunteer_id} onChange={e => setForm(f => ({ ...f, volunteer_id: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Staff ID</label><Input value={form.staff_id} onChange={e => setForm(f => ({ ...f, staff_id: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Template</label>
                <Select value={form.template_id} onChange={e => setForm(f => ({ ...f, template_id: e.target.value }))} placeholder="Select template" options={templates.map(t => ({ value: t.id, label: t.name }))} />
              </div>
              <div><label className="text-sm font-medium">Date *</label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Start *</label><Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">End *</label><Input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} required /></div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={form.is_overtime} onChange={e => setForm(f => ({ ...f, is_overtime: e.target.checked }))} /><label className="text-sm font-medium">Overtime</label></div>
              <div><label className="text-sm font-medium">Notes</label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {showTemplateForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Shift Template</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowTemplateForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleTemplateSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Name *</label><Input value={templateForm.name} onChange={e => setTemplateForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Shift Type</label>
                <Select value={templateForm.shift_type} onChange={e => setTemplateForm(f => ({ ...f, shift_type: e.target.value }))} options={SHIFT_TYPES.map(t => ({ value: t.value, label: t.label }))} />
              </div>
              <div><label className="text-sm font-medium">Start *</label><Input type="time" value={templateForm.start_time} onChange={e => setTemplateForm(f => ({ ...f, start_time: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">End *</label><Input type="time" value={templateForm.end_time} onChange={e => setTemplateForm(f => ({ ...f, end_time: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Break (min)</label><Input type="number" value={templateForm.break_duration} onChange={e => setTemplateForm(f => ({ ...f, break_duration: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Color</label><input type="color" value={templateForm.color} onChange={e => setTemplateForm(f => ({ ...f, color: e.target.value }))} className="h-10 w-full rounded-md border border-gray-200 p-1" /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowTemplateForm(false)}>Cancel</Button>
                <Button type="submit">Create Template</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-48" />
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} placeholder="All Statuses" options={[{ value: "", label: "All Statuses" }, ...DUTY_STATUSES.map(ds => ({ value: ds.value, label: ds.label }))]} className="w-40" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shifts.map(s => (
          <Card key={s.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    {s.template_id ? shiftIcon(templates.find(t => t.id === s.template_id)?.shift_type || "") : <Clock className="h-5 w-5 text-amber-600" />}
                  </div>
                  <div>
                    <p className="font-semibold">{s.volunteer ? `${s.volunteer.first_name} ${s.volunteer.last_name}` : s.staff ? `${s.staff.first_name} ${s.staff.last_name}` : "Unassigned"}</p>
                    <p className="text-xs text-gray-500">{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${DUTY_STATUSES.find(ds => ds.value === s.status)?.color || "bg-gray-100"}`}>
                    {DUTY_STATUSES.find(ds => ds.value === s.status)?.label || s.status}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5" /> {s.date}
                {s.is_overtime && <span className="text-amber-600 font-medium">Overtime</span>}
              </div>
            </CardContent>
          </Card>
        ))}
        {shifts.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No shifts for this date.</p>}
      </div>

      {templates.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-semibold mb-3">Shift Templates</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  {shiftIcon(t.shift_type)}
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.start_time.slice(0, 5)} - {t.end_time.slice(0, 5)} | Break: {t.break_duration}min</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
