"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getFestivalDays, createFestivalDay, updateFestivalDay, deleteFestivalDay } from "@/lib/actions/festival"
import type { FestivalDay } from "@/types/festival"
import { Plus, Loader2, Trash2, Sun, Moon, CalendarDays } from "lucide-react"

export default function FestivalDaysPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [days, setDays] = useState<FestivalDay[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ day_number: days.length + 1, label: "", date: "", working_hours_start: "09:00", working_hours_end: "18:00", is_holiday: false, opening_ceremony_at: "", closing_ceremony_at: "" })

  async function load() {
    const data = await getFestivalDays(festivalId)
    setDays(data as FestivalDay[])
    setLoading(false)
  }

  useEffect(() => { load() }, [festivalId])

  async function handleCreate() {
    setSaving(true)
    const result = await createFestivalDay(festivalId, { ...form, day_number: days.length + 1 } as any)
    if (result.error) toast.error(result.error)
    else { toast.success("Day added"); setShowForm(false); setForm({ day_number: days.length + 2, label: "", date: "", working_hours_start: "09:00", working_hours_end: "18:00", is_holiday: false, opening_ceremony_at: "", closing_ceremony_at: "" }) }
    setSaving(false)
    await load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this day?")) return
    const result = await deleteFestivalDay(id)
    if (result.error) toast.error(result.error)
    else toast.success("Day removed")
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Festival Days</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the schedule of days for this festival.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Day
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Label</label>
                <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Day 1" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Start Time</label>
                <Input type="time" value={form.working_hours_start} onChange={(e) => setForm({ ...form, working_hours_start: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">End Time</label>
                <Input type="time" value={form.working_hours_end} onChange={(e) => setForm({ ...form, working_hours_end: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_holiday} onChange={(e) => setForm({ ...form, is_holiday: e.target.checked })} className="rounded" />
                <span className="text-sm text-gray-700">Holiday</span>
              </label>
            </div>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Plus className="h-4 w-4 mr-2" />
              Create Day
            </Button>
          </CardContent>
        </Card>
      )}

      {days.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No days added yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {days.map((day) => (
            <Card key={day.id} className={`${day.is_holiday ? "opacity-60" : ""}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${day.is_holiday ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600"}`}>
                    {day.is_holiday ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Day {day.day_number}{day.label ? ` - ${day.label}` : ""}</p>
                    <p className="text-xs text-gray-500">
                      {day.date ? new Date(day.date).toLocaleDateString() : "No date set"}
                      {day.working_hours_start && ` | ${day.working_hours_start} - ${day.working_hours_end}`}
                      {day.is_holiday && " | Holiday"}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDelete(day.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
