"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getVolunteers, upsertVolunteer, deleteVolunteer } from "@/lib/actions/volunteer"
import { Loader2, Search, Plus, Pencil, Trash2, X, UserCheck, Phone, Mail, Globe, Heart } from "lucide-react"

export default function VolunteersPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", email: "", notes: "", status: "active" })

  const load = useCallback(async () => {
    const res = await getVolunteers(festivalId)
    setVolunteers(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsertVolunteer({ id: editingId || undefined, festival_id: festivalId, ...form })
    setShowForm(false); setEditingId(null); setForm({ first_name: "", last_name: "", phone: "", email: "", notes: "", status: "active" })
    load()
  }

  const handleEdit = (v: any) => {
    setForm({ first_name: v.first_name, last_name: v.last_name, phone: v.phone || "", email: v.email || "", notes: v.notes || "", status: v.status })
    setEditingId(v.id); setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this volunteer?")) return
    await deleteVolunteer(id); load()
  }

  const filtered = volunteers.filter(v => `${v.first_name} ${v.last_name}`.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
          <p className="text-sm text-gray-500 mt-1">{volunteers.length} total volunteers.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ first_name: "", last_name: "", phone: "", email: "", notes: "", status: "active" }); setShowForm(true) }}><Plus className="h-4 w-4 mr-1" /> Add Volunteer</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Volunteer" : "New Volunteer"}</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null) }}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">First Name *</label><Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Last Name *</label><Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Phone</label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Email</label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium">Notes</label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input className="pl-9" placeholder="Search volunteers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(v => (
          <Card key={v.id} className="relative">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{v.first_name} {v.last_name}</p>
                    <p className="text-xs text-gray-500">{v.status}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(v)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(v.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-500">
                {v.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {v.phone}</div>}
                {v.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {v.email}</div>}
                {v.blood_group && <div className="flex items-center gap-2"><Heart className="h-3.5 w-3.5" /> {v.blood_group}</div>}
                {v.emergency_contact_name && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {v.emergency_contact_name}: {v.emergency_contact_phone}</div>}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No volunteers found.</p>}
      </div>
    </div>
  )
}
