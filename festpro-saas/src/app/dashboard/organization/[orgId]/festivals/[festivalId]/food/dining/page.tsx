"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getDiningHalls, createDiningHall, deleteDiningHall, createDiningTable } from "@/lib/actions/food-catering"
import { DINING_HALL_STATUSES } from "@/config/food-catering"
import { Loader2, Building2, Plus, Search, Trash2, Users } from "lucide-react"

export default function DiningPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [halls, setHalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showTableForm, setShowTableForm] = useState<string | null>(null)
  const [form, setForm] = useState({ hall_name: "", location: "", capacity: "0", is_ac: false, contact_person: "", contact_phone: "", notes: "" })
  const [tableForm, setTableForm] = useState({ table_number: "", capacity: "4" })

  const load = useCallback(async () => {
    setLoading(true)
    const h = await getDiningHalls(festivalId)
    setHalls(h.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.hall_name) return
    await createDiningHall({ ...form, festival_id: festivalId, capacity: Number(form.capacity) })
    setForm({ hall_name: "", location: "", capacity: "0", is_ac: false, contact_person: "", contact_phone: "", notes: "" })
    setShowForm(false); load()
  }

  const handleAddTable = async (hallId: string) => {
    if (!tableForm.table_number) return
    await createDiningTable({ ...tableForm, festival_id: festivalId, hall_id: hallId, capacity: Number(tableForm.capacity) })
    setTableForm({ table_number: "", capacity: "4" })
    setShowTableForm(null); load()
  }

  const handleDelete = async (id: string) => { await deleteDiningHall(id); load() }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Dining Halls</h1><p className="text-sm text-gray-500 mt-1">Manage dining halls, tables and occupancy.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Add Hall"}</Button>
      </div>

      {showForm && (
        <Card><CardHeader><CardTitle>Add Dining Hall</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Hall Name *</label><Input value={form.hall_name} onChange={e => setForm({...form, hall_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Location</label><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Capacity</label><Input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} /></div>
          <div className="flex items-center gap-2 pt-6"><input type="checkbox" checked={form.is_ac} onChange={e => setForm({...form, is_ac: e.target.checked})} /><label className="text-sm">Air Conditioned</label></div>
          <div><label className="text-sm font-medium">Contact Person</label><Input value={form.contact_person} onChange={e => setForm({...form, contact_person: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Contact Phone</label><Input value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} /></div>
          <div className="md:col-span-2 flex gap-2 pt-2"><Button onClick={handleCreate}>Add Hall</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}

      <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search halls..." value={search} onChange={e => setSearch(e.target.value)} /></div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {halls.filter(h => !search || h.hall_name.toLowerCase().includes(search.toLowerCase())).map((h: any) => (
          <Card key={h.id} className="hover:shadow-md transition-shadow"><CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center"><Building2 className="h-5 w-5 text-teal-600" /></div>
                <div><p className="font-semibold">{h.hall_name}</p><p className="text-xs text-gray-500">{h.hall_code}</p></div>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${DINING_HALL_STATUSES.find(x => x.value === h.status)?.color || ""}`}>{DINING_HALL_STATUSES.find(x => x.value === h.status)?.label || h.status}</span>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-500">
              <p>{h.location || "—"} · {h.is_ac ? "AC" : "Non-AC"}</p>
              <p>Capacity: {h.capacity} · Occupancy: {h.current_occupancy}</p>
            </div>
            <div className="flex gap-1 mt-3 pt-3 border-t">
              <Button size="sm" variant="outline" onClick={() => setShowTableForm(showTableForm === h.id ? null : h.id)}>Tables ({h.dining_tables?.length || 0})</Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(h.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
            </div>
            {showTableForm === h.id && (
              <div className="mt-3 pt-3 border-t space-y-2">
                {h.dining_tables?.map((t: any) => (
                  <div key={t.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                    <span>Table {t.table_number} · Capacity {t.capacity}</span>
                    <span className={t.is_available ? "text-green-600" : "text-red-600"}>{t.is_available ? "Available" : "Occupied"}</span>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Input placeholder="Table #" value={tableForm.table_number} onChange={e => setTableForm({...tableForm, table_number: e.target.value})} className="w-24" />
                  <Input placeholder="Capacity" type="number" value={tableForm.capacity} onChange={e => setTableForm({...tableForm, capacity: e.target.value})} className="w-24" />
                  <Button size="sm" onClick={() => handleAddTable(h.id)}>Add</Button>
                </div>
              </div>
            )}
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
