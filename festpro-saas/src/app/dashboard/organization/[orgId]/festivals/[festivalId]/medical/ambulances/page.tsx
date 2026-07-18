"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAmbulances, createAmbulance, updateAmbulanceStatus, assignAmbulance, getMedicalCenters } from "@/lib/actions/medical-emergency"
import { AMBULANCE_STATUSES, AMBULANCE_TYPES } from "@/config/medical-emergency"
import { Loader2, Truck, Plus, Search, Gauge } from "lucide-react"

export default function AmbulancesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [ambulances, setAmbulances] = useState<any[]>([])
  const [centers, setCenters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ vehicle_number: "", ambulance_type: "basic", capacity: "1", equipment_level: "basic", center_id: "", notes: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const [a, c] = await Promise.all([getAmbulances(festivalId), getMedicalCenters(festivalId)])
    setAmbulances(a.data || []); setCenters(c.data || []); setLoading(false)
  }, [festivalId, statusFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.vehicle_number) return
    await createAmbulance({ ...form, festival_id: festivalId, capacity: Number(form.capacity) })
    setForm({ vehicle_number: "", ambulance_type: "basic", capacity: "1", equipment_level: "basic", center_id: "", notes: "" })
    setShowForm(false); load()
  }

  const handleStatus = async (id: string, status: string) => { await updateAmbulanceStatus(id, status); load() }
  const handleAssign = async (id: string, centerId: string) => { await assignAmbulance(id, centerId); load() }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Ambulances</h1><p className="text-sm text-gray-500 mt-1">Manage fleet, dispatching and status tracking.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Add Ambulance"}</Button>
      </div>
      {showForm && (
        <Card><CardHeader><CardTitle>Register Ambulance</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Vehicle # *</label><Input value={form.vehicle_number} onChange={e => setForm({...form, vehicle_number: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Type</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.ambulance_type} onChange={e => setForm({...form, ambulance_type: e.target.value})}>
              {AMBULANCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Capacity</label><Input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Equipment Level</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.equipment_level} onChange={e => setForm({...form, equipment_level: e.target.value})}>
              <option value="basic">Basic</option><option value="advanced">Advanced</option><option value="mobile_icu">Mobile ICU</option>
            </select></div>
          <div><label className="text-sm font-medium">Station</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.center_id} onChange={e => setForm({...form, center_id: e.target.value})}>
              <option value="">Select...</option>{centers.map((c: any) => <option key={c.id} value={c.id}>{c.center_name}</option>)}
            </select></div>
          <div className="md:col-span-2 flex gap-2 pt-2"><Button onClick={handleCreate}>Register</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}
      <div className="flex gap-3">
        <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>{AMBULANCE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {ambulances.filter(a => !search || a.vehicle_number?.toLowerCase().includes(search.toLowerCase())).map((a: any) => (
          <Card key={a.id}><CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${a.status === "available" ? "bg-green-100" : a.status === "dispatched" ? "bg-blue-100" : "bg-gray-100"}`}><Truck className={`h-5 w-5 ${a.status === "available" ? "text-green-600" : a.status === "dispatched" ? "text-blue-600" : "text-gray-400"}`} /></div>
                <div><p className="font-semibold">{a.vehicle_number}</p><p className="text-xs text-gray-500">{AMBULANCE_TYPES.find(t => t.value === a.ambulance_type)?.label || a.ambulance_type} · Cap: {a.capacity}</p></div>
              </div>
              <div className="text-right"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${AMBULANCE_STATUSES.find(x => x.value === a.status)?.color || "bg-gray-100"}`}>{AMBULANCE_STATUSES.find(x => x.value === a.status)?.label || a.status}</span>
                <p className="text-xs text-gray-400 mt-1">Equip: {a.equipment_level}</p></div>
            </div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {a.status === "available" && <Button size="sm" variant="outline" className="text-xs" onClick={() => handleStatus(a.id, "dispatched")}>Dispatch</Button>}
              {a.status === "dispatched" && <Button size="sm" variant="outline" className="text-xs" onClick={() => handleStatus(a.id, "available")}>Mark Available</Button>}
              {(a.status === "available" || a.status === "dispatched") && <Button size="sm" variant="outline" className="text-xs" onClick={() => handleStatus(a.id, "maintenance")}>Maintenance</Button>}
              {a.status === "maintenance" && <Button size="sm" variant="outline" className="text-xs" onClick={() => handleStatus(a.id, "available")}>Ready</Button>}
              {centers.length > 0 && <select className="text-xs h-8 rounded border px-2" value="" onChange={e => { if (e.target.value) { handleAssign(a.id, e.target.value) } }}>
                <option value="">Assign to center...</option>{centers.map((c: any) => <option key={c.id} value={c.id}>{c.center_name}</option>)}
              </select>}
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
