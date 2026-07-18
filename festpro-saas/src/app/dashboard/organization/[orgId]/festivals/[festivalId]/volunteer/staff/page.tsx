"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getStaffMembers, upsertStaffMember, deleteStaffMember } from "@/lib/actions/volunteer"
import { STAFF_DEPARTMENTS } from "@/config/volunteer"
import type { StaffMember } from "@/types/volunteer"
import { Loader2, Search, Plus, Pencil, Trash2, X, Briefcase, Phone, Mail, Star } from "lucide-react"

export default function StaffPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [department, setDepartment] = useState("")
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", email: "", department: "general", position: "", is_supervisor: false, is_active: true })

  const load = useCallback(async () => {
    const res = await getStaffMembers(festivalId, department ? { department } : undefined)
    setStaff(res.data || []); setLoading(false)
  }, [festivalId, department])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsertStaffMember({ id: editingId || undefined, festival_id: festivalId, ...form })
    setShowForm(false); setEditingId(null); setForm({ first_name: "", last_name: "", phone: "", email: "", department: "general", position: "", is_supervisor: false, is_active: true })
    load()
  }

  const handleEdit = (s: StaffMember) => {
    setForm({ first_name: s.first_name, last_name: s.last_name, phone: s.phone || "", email: s.email || "", department: s.department, position: s.position || "", is_supervisor: s.is_supervisor, is_active: s.is_active })
    setEditingId(s.id); setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this staff member?")) return
    await deleteStaffMember(id); load()
  }

  const filtered = staff.filter(s => `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Members</h1>
          <p className="text-sm text-gray-500 mt-1">{staff.length} total staff.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ first_name: "", last_name: "", phone: "", email: "", department: "general", position: "", is_supervisor: false, is_active: true }); setShowForm(true) }}><Plus className="h-4 w-4 mr-1" /> Add Staff</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Staff" : "New Staff Member"}</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null) }}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">First Name *</label><Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Last Name *</label><Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Phone</label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Email</label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Department</label>
                <Select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} options={STAFF_DEPARTMENTS.map(d => ({ value: d.value, label: d.label }))} />
              </div>
              <div><label className="text-sm font-medium">Position</label><Input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} /></div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_supervisor} onChange={e => setForm(f => ({ ...f, is_supervisor: e.target.checked }))} /> Supervisor</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Active</label>
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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-9" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={department} onChange={e => setDepartment(e.target.value)} placeholder="All Departments" options={[{ value: "", label: "All Departments" }, ...STAFF_DEPARTMENTS.map(d => ({ value: d.value, label: d.label }))]} className="w-48" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(s => (
          <Card key={s.id} className="relative">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{s.first_name} {s.last_name}{s.is_supervisor && <Star className="h-3.5 w-3.5 inline text-amber-500 ml-1" />}</p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${STAFF_DEPARTMENTS.find(d => d.value === s.department)?.color || "bg-gray-100 text-gray-600"}`}>
                      {STAFF_DEPARTMENTS.find(d => d.value === s.department)?.label || s.department}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-500">
                {s.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {s.phone}</div>}
                {s.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {s.email}</div>}
                {s.position && <div className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" /> {s.position}</div>}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No staff found.</p>}
      </div>
    </div>
  )
}
