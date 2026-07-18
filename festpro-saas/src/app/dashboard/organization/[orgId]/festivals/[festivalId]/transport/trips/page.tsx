"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getTripSchedules, createTripSchedule, updateTripStatus, getTransportRoutes } from "@/lib/actions/accommodation-transport"
import { TRIP_STATUSES } from "@/config/accommodation-transport"
import { Loader2, Route, Plus, Search, Calendar, Truck, Users, MapPin, Clock } from "lucide-react"

export default function TripsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [trips, setTrips] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ route_id: "", trip_name: "", trip_type: "regular", scheduled_date: "", departure_time: "", estimated_arrival_time: "", max_passengers: "1", notes: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const [t, r] = await Promise.all([getTripSchedules(festivalId, statusFilter || undefined), getTransportRoutes(festivalId)])
    setTrips(t.data || []); setRoutes(r.data || []); setLoading(false)
  }, [festivalId, statusFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.trip_name || !form.departure_time) return
    await createTripSchedule({ ...form, festival_id: festivalId, max_passengers: Number(form.max_passengers) })
    setForm({ route_id: "", trip_name: "", trip_type: "regular", scheduled_date: "", departure_time: "", estimated_arrival_time: "", max_passengers: "1", notes: "" })
    setShowForm(false); load()
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateTripStatus(id, status); load()
  }

  const getStatusBadge = (s: string) => {
    const st = TRIP_STATUSES.find(x => x.value === s)
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${st?.color || "bg-gray-100 text-gray-600"}`}>{st?.label || s}</span>
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Trip Schedules</h1><p className="text-sm text-gray-500 mt-1">Plan, assign and track transport trips.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Schedule Trip"}</Button>
      </div>

      {showForm && (
        <Card><CardHeader><CardTitle>Schedule Trip</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Trip Name *</label><Input value={form.trip_name} onChange={e => setForm({...form, trip_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Trip Type</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.trip_type} onChange={e => setForm({...form, trip_type: e.target.value})}>
              <option value="regular">Regular</option>
              <option value="shuttle">Shuttle</option>
              <option value="emergency">Emergency</option>
              <option value="charter">Charter</option>
            </select>
          </div>
          <div><label className="text-sm font-medium">Route</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.route_id} onChange={e => setForm({...form, route_id: e.target.value})}>
              <option value="">Select route...</option>
              {routes.map((r: any) => <option key={r.id} value={r.id}>{r.route_name}</option>)}
            </select>
          </div>
          <div><label className="text-sm font-medium">Scheduled Date</label><Input type="date" value={form.scheduled_date} onChange={e => setForm({...form, scheduled_date: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Departure Time *</label><Input type="time" value={form.departure_time} onChange={e => setForm({...form, departure_time: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Est. Arrival</label><Input type="time" value={form.estimated_arrival_time} onChange={e => setForm({...form, estimated_arrival_time: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Max Passengers</label><Input type="number" value={form.max_passengers} onChange={e => setForm({...form, max_passengers: e.target.value})} /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Notes</label><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
          <div className="md:col-span-2 flex gap-2 pt-2">
            <Button onClick={handleCreate}><Calendar className="h-4 w-4 mr-1" /> Schedule</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </CardContent></Card>
      )}

      <div className="flex gap-3">
        <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search trips..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {TRIP_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <th className="px-4 py-3">Trip Name</th><th className="px-4 py-3">Route</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Departure</th><th className="px-4 py-3">Arrival</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
      </tr></thead><tbody className="divide-y divide-gray-100">
        {trips.filter(t => !search || t.trip_name?.toLowerCase().includes(search.toLowerCase()) || t.routes?.route_name?.toLowerCase().includes(search.toLowerCase())).map((t: any) => (
          <tr key={t.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-medium">{t.trip_name || "—"}</td>
            <td className="px-4 py-3 text-sm">{t.routes?.route_name || "—"}</td>
            <td className="px-4 py-3 text-sm">{t.scheduled_date ? new Date(t.scheduled_date).toLocaleDateString() : "—"}</td>
            <td className="px-4 py-3 text-sm">{t.departure_time || "—"}</td>
            <td className="px-4 py-3 text-sm">{t.estimated_arrival_time || "—"}</td>
            <td className="px-4 py-3">{getStatusBadge(t.status)}</td>
            <td className="px-4 py-3 text-right">
              {t.status === "scheduled" && <Button size="sm" variant="outline" className="mr-1" onClick={() => handleUpdateStatus(t.id, "in_progress")}>Start</Button>}
              {t.status === "in_progress" && <Button size="sm" variant="outline" className="mr-1" onClick={() => handleUpdateStatus(t.id, "completed")}>Complete</Button>}
            </td>
          </tr>
        ))}
      </tbody></table></CardContent></Card>
    </div>
  )
}
