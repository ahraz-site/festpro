"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { getDuties, upsertDuty, deleteDuty, getDutyAssignments, createDutyAssignment, updateDutyAssignmentStatus } from "@/lib/actions/volunteer"
import { STAFF_DEPARTMENTS, DUTY_STATUSES } from "@/config/volunteer"
import type { Duty } from "@/types/volunteer"
import { Loader2, Plus, Pencil, Trash2, X, ClipboardList, AlertTriangle, MapPin, UserCheck } from "lucide-react"

export default function DutiesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [duties, setDuties] = useState<Duty[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [selectedDutyId, setSelectedDutyId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterDept, setFilterDept] = useState("")
  const [form, setForm] = useState({ title: "", description: "", department: "general", location: "", is_critical: false })
  const [assignForm, setAssignForm] = useState({ volunteer_id: "", staff_id: "", notes: "" })

  const load = useCallback(async () => {
    const [dRes, aRes] = await Promise.all([getDuties(festivalId, filterDept ? { department: filterDept } : undefined), getDutyAssignments(festivalId)])
    setDuties(dRes.data || []); setAssignments(aRes.data || []); setLoading(false)
  }, [festivalId, filterDept])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsertDuty({ id: editingId || undefined, festival_id: festivalId, ...form })
    setShowForm(false); setEditingId(null); setForm({ title: "", description: "", department: "general", location: "", is_critical: false })
    load()
  }

  const handleEdit = (d: Duty) => {
    setForm({ title: d.title, description: d.description || "", department: d.department, location: d.location || "", is_critical: d.is_critical })
    setEditingId(d.id); setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this duty?")) return
    await deleteDuty(id); load()
  }

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDutyId) return
    await createDutyAssignment({ duty_id: selectedDutyId, ...assignForm })
    setShowAssign(false); setSelectedDutyId(null); setAssignForm({ volunteer_id: "", staff_id: "", notes: "" })
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Duties</h1>
          <p className="text-sm text-gray-500 mt-1">{duties.length} total duties.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ title: "", description: "", department: "general", location: "", is_critical: false }); setShowForm(true) }}><Plus className="h-4 w-4 mr-1" /> Create Duty</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Duty" : "New Duty"}</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null) }}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="text-sm font-medium">Title *</label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium">Description</label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Department</label>
                <Select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} options={STAFF_DEPARTMENTS.map(d => ({ value: d.value, label: d.label }))} />
              </div>
              <div><label className="text-sm font-medium">Location</label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_critical" checked={form.is_critical} onChange={e => setForm(f => ({ ...f, is_critical: e.target.checked }))} />
                <label htmlFor="is_critical" className="text-sm font-medium">Critical Duty</label>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Select value={filterDept} onChange={e => setFilterDept(e.target.value)} options={[{ value: "", label: "All Departments" }, ...STAFF_DEPARTMENTS.map(d => ({ value: d.value, label: d.label }))]} className="w-48" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {duties.map(d => (
          <Card key={d.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{d.title} {d.is_critical && <AlertTriangle className="h-3.5 w-3.5 inline text-red-500" />}</p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${STAFF_DEPARTMENTS.find(sd => sd.value === d.department)?.color || "bg-gray-100 text-gray-600"}`}>
                      {STAFF_DEPARTMENTS.find(sd => sd.value === d.department)?.label || d.department}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                </div>
              </div>
              {d.description && <p className="mt-2 text-sm text-gray-500">{d.description}</p>}
              {d.location && <div className="mt-2 flex items-center gap-1 text-sm text-gray-500"><MapPin className="h-3.5 w-3.5" /> {d.location}</div>}
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={() => { setSelectedDutyId(d.id); setShowAssign(true) }}><UserCheck className="h-3.5 w-3.5 mr-1" /> Assign</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {duties.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No duties found.</p>}
      </div>

      {showAssign && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Assign to Duty</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowAssign(false); setSelectedDutyId(null) }}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleAssign} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Volunteer ID</label><Input value={assignForm.volunteer_id} onChange={e => setAssignForm(f => ({ ...f, volunteer_id: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Staff ID</label><Input value={assignForm.staff_id} onChange={e => setAssignForm(f => ({ ...f, staff_id: e.target.value }))} /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium">Notes</label><Textarea value={assignForm.notes} onChange={e => setAssignForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowAssign(false); setSelectedDutyId(null) }}>Cancel</Button>
                <Button type="submit">Assign</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {assignments.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Current Assignments</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments.slice(0, 20).map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{a.duty?.title || "Unknown Duty"}</p>
                    <p className="text-xs text-gray-500">{a.volunteer ? `${a.volunteer.first_name} ${a.volunteer.last_name}` : a.staff ? `${a.staff.first_name} ${a.staff.last_name}` : "Unassigned"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${DUTY_STATUSES.find(ds => ds.value === a.status)?.color || "bg-gray-100"}`}>
                      {DUTY_STATUSES.find(ds => ds.value === a.status)?.label || a.status}
                    </span>
                    {a.status === "scheduled" && (
                      <Button size="sm" variant="outline" onClick={async () => { await updateDutyAssignmentStatus(a.id, "checked_in"); load() }}>Check In</Button>
                    )}
                    {a.status === "checked_in" && (
                      <Button size="sm" variant="outline" onClick={async () => { await updateDutyAssignmentStatus(a.id, "completed"); load() }}>Complete</Button>
                    )}
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
