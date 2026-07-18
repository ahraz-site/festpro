"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getAttendanceLogs, recordAttendance } from "@/lib/actions/volunteer"
import { Loader2, Plus, X, Clock, UserCheck, MapPin, Camera } from "lucide-react"

export default function AttendancePage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [form, setForm] = useState({ volunteer_id: "", staff_id: "", shift_id: "", attendance_type: "manual", checkpoint_id: "", notes: "" })

  const load = useCallback(async () => {
    const res = await getAttendanceLogs(festivalId, date)
    setLogs(res.data || []); setLoading(false)
  }, [festivalId, date])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await recordAttendance({ festival_id: festivalId, ...form })
    setShowForm(false); setForm({ volunteer_id: "", staff_id: "", shift_id: "", attendance_type: "manual", checkpoint_id: "", notes: "" })
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Logs</h1>
          <p className="text-sm text-gray-500 mt-1">{logs.length} records for selected date.</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" /> Record Attendance</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Record Attendance</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Volunteer ID</label><Input value={form.volunteer_id} onChange={e => setForm(f => ({ ...f, volunteer_id: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Staff ID</label><Input value={form.staff_id} onChange={e => setForm(f => ({ ...f, staff_id: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Shift ID</label><Input value={form.shift_id} onChange={e => setForm(f => ({ ...f, shift_id: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Type</label>
                <Select value={form.attendance_type} onChange={e => setForm(f => ({ ...f, attendance_type: e.target.value }))} options={[
                  { value: "manual", label: "Manual" },
                  { value: "qr_checkin", label: "QR Check-in" },
                  { value: "qr_checkout", label: "QR Check-out" },
                  { value: "late", label: "Late" },
                  { value: "absent", label: "Absent" },
                ]} />
              </div>
              <div><label className="text-sm font-medium">Checkpoint ID</label><Input value={form.checkpoint_id} onChange={e => setForm(f => ({ ...f, checkpoint_id: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Notes</label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Record</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-48" />

      <div className="space-y-3">
        {logs.map(l => (
          <div key={l.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {l.volunteer ? `${l.volunteer.first_name} ${l.volunteer.last_name}` : l.staff ? `${l.staff.first_name} ${l.staff.last_name}` : "Unknown"}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Clock className="h-3 w-3" /> {new Date(l.timestamp).toLocaleString()}
                  <MapPin className="h-3 w-3 ml-1" /> {l.attendance_type}
                </p>
              </div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              l.attendance_type === "absent" ? "bg-red-100 text-red-700" :
              l.attendance_type === "late" ? "bg-amber-100 text-amber-700" :
              "bg-green-100 text-green-700"
            }`}>
              {l.attendance_type.replace("_", " ")}
            </span>
          </div>
        ))}
        {logs.length === 0 && <p className="text-gray-500 text-center py-8">No attendance records for this date.</p>}
      </div>
    </div>
  )
}
