"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getVehiclePasses, createVehiclePass } from "@/lib/actions/id-card"
import { PASS_STATUSES, VEHICLE_TYPES } from "@/config/id-card"
import type { VehiclePass } from "@/types/id-card"
import { Loader2, Plus, X, Car, CalendarDays, User, MapPin } from "lucide-react"

export default function VehiclePassesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [passes, setPasses] = useState<VehiclePass[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ vehicle_number: "", vehicle_type: "car", driver_name: "", driver_phone: "", parking_zone: "", validity_start: "", validity_end: "" })

  const load = useCallback(async () => {
    const res = await getVehiclePasses(festivalId)
    setPasses(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createVehiclePass({ festival_id: festivalId, ...form })
    setShowForm(false); setForm({ vehicle_number: "", vehicle_type: "car", driver_name: "", driver_phone: "", parking_zone: "", validity_start: "", validity_end: "" })
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Passes</h1>
          <p className="text-sm text-gray-500 mt-1">{passes.length} vehicle passes issued.</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" /> Issue Vehicle Pass</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Issue Vehicle Pass</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Vehicle Number *</label><Input value={form.vehicle_number} onChange={e => setForm(f => ({ ...f, vehicle_number: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Vehicle Type</label>
                <Select value={form.vehicle_type} onChange={e => setForm(f => ({ ...f, vehicle_type: e.target.value }))} options={VEHICLE_TYPES.map(vt => ({ value: vt.value, label: vt.label }))} />
              </div>
              <div><label className="text-sm font-medium">Driver Name</label><Input value={form.driver_name} onChange={e => setForm(f => ({ ...f, driver_name: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Driver Phone</label><Input value={form.driver_phone} onChange={e => setForm(f => ({ ...f, driver_phone: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Parking Zone</label><Input value={form.parking_zone} onChange={e => setForm(f => ({ ...f, parking_zone: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Valid From *</label><Input type="datetime-local" value={form.validity_start} onChange={e => setForm(f => ({ ...f, validity_start: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Valid Until *</label><Input type="datetime-local" value={form.validity_end} onChange={e => setForm(f => ({ ...f, validity_end: e.target.value }))} required /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Issue</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {passes.map(p => (
          <Card key={p.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Car className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{p.vehicle_number}</p>
                    <p className="text-xs text-gray-500">{p.vehicle_type}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${PASS_STATUSES.find(ps => ps.value === p.status)?.color || "bg-gray-100"}`}>
                  {PASS_STATUSES.find(ps => ps.value === p.status)?.label || p.status}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                {p.driver_name && <div className="flex items-center gap-1"><User className="h-3 w-3" /> {p.driver_name} ({p.driver_phone})</div>}
                {p.parking_zone && <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.parking_zone}</div>}
                <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {new Date(p.validity_start).toLocaleDateString()} - {new Date(p.validity_end).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        ))}
        {passes.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No vehicle passes issued.</p>}
      </div>
    </div>
  )
}
