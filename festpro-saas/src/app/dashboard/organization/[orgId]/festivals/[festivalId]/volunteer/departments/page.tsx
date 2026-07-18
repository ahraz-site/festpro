"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { getDepartments, upsertDepartment } from "@/lib/actions/volunteer"
import { STAFF_DEPARTMENTS } from "@/config/volunteer"
import type { StaffDepartmentMeta } from "@/types/volunteer"
import { Loader2, Plus, Pencil, X, Building2, Users } from "lucide-react"

export default function DepartmentsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [departments, setDepartments] = useState<StaffDepartmentMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ department: "general", display_name: "", description: "", color: "#6366f1", max_capacity: "" })

  const load = useCallback(async () => {
    const res = await getDepartments(festivalId)
    setDepartments(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsertDepartment({ id: editingId || undefined, festival_id: festivalId, ...form, max_capacity: form.max_capacity ? Number(form.max_capacity) : undefined })
    setShowForm(false); setEditingId(null); setForm({ department: "general", display_name: "", description: "", color: "#6366f1", max_capacity: "" })
    load()
  }

  const handleEdit = (d: StaffDepartmentMeta) => {
    setForm({ department: d.department, display_name: d.display_name, description: d.description || "", color: d.color || "#6366f1", max_capacity: d.max_capacity?.toString() || "" })
    setEditingId(d.id); setShowForm(true)
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-sm text-gray-500 mt-1">{departments.length} departments configured.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ department: "general", display_name: "", description: "", color: "#6366f1", max_capacity: "" }); setShowForm(true) }}><Plus className="h-4 w-4 mr-1" /> Add Department</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Department" : "New Department"}</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null) }}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Type</label>
                <Select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} options={STAFF_DEPARTMENTS.map(d => ({ value: d.value, label: d.label }))} />
              </div>
              <div><label className="text-sm font-medium">Display Name *</label><Input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} required /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium">Description</label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Color</label><input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="h-10 w-full rounded-md border border-gray-200 p-1" /></div>
              <div><label className="text-sm font-medium">Max Capacity</label><Input type="number" value={form.max_capacity} onChange={e => setForm(f => ({ ...f, max_capacity: e.target.value }))} /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map(d => (
          <Card key={d.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: d.color || "#6366f1", opacity: 0.15 }}>
                    <Building2 className="h-5 w-5" style={{ color: d.color || "#6366f1" }} />
                  </div>
                  <div>
                    <p className="font-semibold">{d.display_name}</p>
                    <span className="text-xs text-gray-500">{STAFF_DEPARTMENTS.find(sd => sd.value === d.department)?.label || d.department}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button>
              </div>
              {d.description && <p className="mt-2 text-sm text-gray-500">{d.description}</p>}
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {d.head_count || 0}</div>
                {d.max_capacity && <div className="flex items-center gap-1">Cap: {d.max_capacity}</div>}
              </div>
            </CardContent>
          </Card>
        ))}
        {departments.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No departments configured.</p>}
      </div>
    </div>
  )
}
