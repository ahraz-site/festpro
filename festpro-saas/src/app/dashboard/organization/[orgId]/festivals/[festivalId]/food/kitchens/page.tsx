"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getKitchens, createKitchen, deleteKitchen } from "@/lib/actions/food-catering"
import { KITCHEN_STATUSES, KITCHEN_TYPES } from "@/config/food-catering"
import { Loader2, ChefHat, Plus, Search, Pencil, Trash2, Clock, MapPin } from "lucide-react"

export default function KitchensPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [kitchens, setKitchens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ kitchen_name: "", kitchen_type: "main", location: "", capacity: "0", preparation_areas: "1", opening_time: "", closing_time: "", contact_person: "", contact_phone: "", description: "", notes: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const k = await getKitchens(festivalId)
    setKitchens(k.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.kitchen_name) return
    await createKitchen({ ...form, festival_id: festivalId, capacity: Number(form.capacity), preparation_areas: Number(form.preparation_areas) })
    setForm({ kitchen_name: "", kitchen_type: "main", location: "", capacity: "0", preparation_areas: "1", opening_time: "", closing_time: "", contact_person: "", contact_phone: "", description: "", notes: "" })
    setShowForm(false); load()
  }

  const handleDelete = async (id: string) => { await deleteKitchen(id); load() }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Kitchens</h1><p className="text-sm text-gray-500 mt-1">Manage kitchen operations, staff and preparation areas.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Add Kitchen"}</Button>
      </div>

      {showForm && (
        <Card><CardHeader><CardTitle>Add Kitchen</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-sm font-medium">Name *</label><Input value={form.kitchen_name} onChange={e => setForm({...form, kitchen_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Type</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.kitchen_type} onChange={e => setForm({...form, kitchen_type: e.target.value})}>{KITCHEN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
          </div>
          <div><label className="text-sm font-medium">Location</label><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Capacity</label><Input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Prep Areas</label><Input type="number" value={form.preparation_areas} onChange={e => setForm({...form, preparation_areas: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Opening Time</label><Input type="time" value={form.opening_time} onChange={e => setForm({...form, opening_time: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Closing Time</label><Input type="time" value={form.closing_time} onChange={e => setForm({...form, closing_time: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Contact Person</label><Input value={form.contact_person} onChange={e => setForm({...form, contact_person: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Contact Phone</label><Input value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} /></div>
          <div className="md:col-span-3"><label className="text-sm font-medium">Description</label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
          <div className="md:col-span-3 flex gap-2 pt-2"><Button onClick={handleCreate}>Add Kitchen</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}

      <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search kitchens..." value={search} onChange={e => setSearch(e.target.value)} /></div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kitchens.filter(k => !search || k.kitchen_name.toLowerCase().includes(search.toLowerCase())).map((k: any) => (
          <Card key={k.id} className="hover:shadow-md transition-shadow"><CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center"><ChefHat className="h-5 w-5 text-orange-600" /></div>
                <div><p className="font-semibold">{k.kitchen_name}</p><p className="text-xs text-gray-500">{KITCHEN_TYPES.find(t => t.value === k.kitchen_type)?.label || k.kitchen_type}</p></div>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${KITCHEN_STATUSES.find(s => s.value === (k.is_active ? "active" : "inactive"))?.color || "bg-gray-100 text-gray-600"}`}>{k.is_active ? "Active" : "Inactive"}</span>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-500">
              {k.location && <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {k.location}</p>}
              {k.opening_time && <p className="flex items-center gap-1"><Clock className="h-3 w-3" /> {k.opening_time} - {k.closing_time || "—"}</p>}
              <p>Capacity: {k.capacity} · Prep Areas: {k.preparation_areas}</p>
            </div>
            <div className="flex gap-1 mt-3 pt-3 border-t">
              <Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(k.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
