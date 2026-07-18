"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMedicalCenters, createMedicalCenter } from "@/lib/actions/medical-emergency"
import { MEDICAL_CENTER_TYPES, MEDICAL_CENTER_STATUSES } from "@/config/medical-emergency"
import { Loader2, Building2, Plus, Search, MapPin, Clock } from "lucide-react"

export default function CentersPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [centers, setCenters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ center_name: "", center_type: "first_aid_station", location: "", capacity: "0", phone: "", contact_person: "", opening_time: "", closing_time: "", is_24h: false, notes: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const c = await getMedicalCenters(festivalId); setCenters(c.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.center_name) return
    await createMedicalCenter({ ...form, festival_id: festivalId, capacity: Number(form.capacity) })
    setForm({ center_name: "", center_type: "first_aid_station", location: "", capacity: "0", phone: "", contact_person: "", opening_time: "", closing_time: "", is_24h: false, notes: "" })
    setShowForm(false); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Medical Centers</h1><p className="text-sm text-gray-500 mt-1">Manage first aid stations, clinics and medical facilities.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Add Center"}</Button>
      </div>
      {showForm && (
        <Card><CardHeader><CardTitle>Add Medical Center</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-sm font-medium">Name *</label><Input value={form.center_name} onChange={e => setForm({...form, center_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Type</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.center_type} onChange={e => setForm({...form, center_type: e.target.value})}>
              {MEDICAL_CENTER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Location</label><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Capacity</label><Input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Phone</label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Contact Person</label><Input value={form.contact_person} onChange={e => setForm({...form, contact_person: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Opening Time</label><Input type="time" value={form.opening_time} onChange={e => setForm({...form, opening_time: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Closing Time</label><Input type="time" value={form.closing_time} onChange={e => setForm({...form, closing_time: e.target.value})} /></div>
          <div className="flex items-center gap-2 pt-6"><input type="checkbox" checked={form.is_24h} onChange={e => setForm({...form, is_24h: e.target.checked})} /><label className="text-sm">24/7 Facility</label></div>
          <div className="md:col-span-3 flex gap-2 pt-2"><Button onClick={handleCreate}>Add Center</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}
      <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search centers..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {centers.filter(c => !search || c.center_name.toLowerCase().includes(search.toLowerCase())).map((c: any) => (
          <Card key={c.id} className="hover:shadow-md transition-shadow"><CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"><Building2 className="h-5 w-5 text-blue-600" /></div>
                <div><p className="font-semibold">{c.center_name}</p><p className="text-xs text-gray-500">{MEDICAL_CENTER_TYPES.find(t => t.value === c.center_type)?.label || c.center_type}</p></div>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${MEDICAL_CENTER_STATUSES.find(s => s.value === c.status)?.color || ""}`}>{MEDICAL_CENTER_STATUSES.find(s => s.value === c.status)?.label || c.status}</span>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-500">
              {c.location && <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.location}</p>}
              {c.opening_time && <p className="flex items-center gap-1"><Clock className="h-3 w-3" /> {c.is_24h ? "24/7" : `${c.opening_time.substring(0,5)} - ${c.closing_time?.substring(0,5) || "—"}`}</p>}
              <p>Capacity: {c.capacity}</p>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
