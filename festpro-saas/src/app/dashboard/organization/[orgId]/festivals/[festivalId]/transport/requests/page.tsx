"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getTransportRequests, createTransportRequest, updateTransportRequestStatus } from "@/lib/actions/accommodation-transport"
import { TRANSPORT_REQUEST_STATUSES, TRANSPORT_REQUEST_PURPOSES } from "@/config/accommodation-transport"
import { Loader2, ClipboardList, Plus, Search } from "lucide-react"

export default function TransportRequestsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ requester_name: "", requester_phone: "", requester_email: "", purpose: "artist_transfer", num_passengers: "1", pickup_location: "", drop_location: "", pickup_time: "", notes: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const res = await getTransportRequests(festivalId, statusFilter || undefined)
    setRequests(res.data || []); setLoading(false)
  }, [festivalId, statusFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.requester_name || !form.pickup_location || !form.pickup_time) return
    await createTransportRequest({ ...form, festival_id: festivalId, num_passengers: Number(form.num_passengers), pickup_time: new Date(form.pickup_time).toISOString() })
    setForm({ requester_name: "", requester_phone: "", requester_email: "", purpose: "artist_transfer", num_passengers: "1", pickup_location: "", drop_location: "", pickup_time: "", notes: "" })
    setShowForm(false); load()
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateTransportRequestStatus(id, status); load()
  }

  const getStatusBadge = (s: string) => {
    const st = TRANSPORT_REQUEST_STATUSES.find(x => x.value === s)
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${st?.color || "bg-gray-100 text-gray-600"}`}>{st?.label || s}</span>
  }

  const getPurposeLabel = (v: string) => TRANSPORT_REQUEST_PURPOSES.find(x => x.value === v)?.label || v

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Transport Requests</h1><p className="text-sm text-gray-500 mt-1">Manage transport requests from artists, staff and organizers.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "New Request"}</Button>
      </div>

      {showForm && (
        <Card><CardHeader><CardTitle>New Transport Request</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Requester Name *</label><Input value={form.requester_name} onChange={e => setForm({...form, requester_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Purpose</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})}>
              {TRANSPORT_REQUEST_PURPOSES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div><label className="text-sm font-medium">Phone</label><Input value={form.requester_phone} onChange={e => setForm({...form, requester_phone: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Email</label><Input type="email" value={form.requester_email} onChange={e => setForm({...form, requester_email: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Passenger Count</label><Input type="number" value={form.num_passengers} onChange={e => setForm({...form, num_passengers: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Pickup Time *</label><Input type="datetime-local" value={form.pickup_time} onChange={e => setForm({...form, pickup_time: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Pickup Location *</label><Input value={form.pickup_location} onChange={e => setForm({...form, pickup_location: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Drop-off Location</label><Input value={form.drop_location} onChange={e => setForm({...form, drop_location: e.target.value})} /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Notes</label><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
          <div className="md:col-span-2 flex gap-2 pt-2">
            <Button onClick={handleCreate}>Submit Request</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </CardContent></Card>
      )}

      <div className="flex gap-3">
        <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {TRANSPORT_REQUEST_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <th className="px-4 py-3">Requester</th><th className="px-4 py-3">Purpose</th><th className="px-4 py-3">Passengers</th><th className="px-4 py-3">Pickup</th><th className="px-4 py-3">Dropoff</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
      </tr></thead><tbody className="divide-y divide-gray-100">
        {requests.filter(r => !search || r.requester_name.toLowerCase().includes(search.toLowerCase())).map((r: any) => (
          <tr key={r.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-medium">{r.requester_name}<br /><span className="text-xs text-gray-400">{r.requester_phone}</span></td>
            <td className="px-4 py-3 text-sm text-gray-500">{getPurposeLabel(r.purpose)}</td>
            <td className="px-4 py-3 text-sm">{r.num_passengers}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{r.pickup_location}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{r.drop_location || "—"}</td>
            <td className="px-4 py-3 text-sm">{r.pickup_time ? new Date(r.pickup_time).toLocaleString() : "—"}</td>
            <td className="px-4 py-3">{getStatusBadge(r.status)}</td>
            <td className="px-4 py-3 text-right">
              {r.status === "pending" && <><Button size="sm" variant="outline" className="mr-1" onClick={() => handleUpdateStatus(r.id, "approved")}>Approve</Button><Button size="sm" variant="outline" onClick={() => handleUpdateStatus(r.id, "cancelled")}>Reject</Button></>}
              {r.status === "approved" && <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(r.id, "completed")}>Complete</Button>}
            </td>
          </tr>
        ))}
      </tbody></table></CardContent></Card>
    </div>
  )
}
