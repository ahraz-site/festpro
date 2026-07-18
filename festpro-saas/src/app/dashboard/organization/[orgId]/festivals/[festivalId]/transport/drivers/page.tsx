"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getDrivers, createDriver, deleteDriver } from "@/lib/actions/accommodation-transport"
import { DRIVER_STATUSES } from "@/config/accommodation-transport"
import { Loader2, Users, Plus, Search, Pencil, Trash2 } from "lucide-react"

export default function DriversPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", email: "", license_number: "", license_type: "", license_expiry: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const d = await getDrivers(festivalId)
    setDrivers(d.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.first_name || !form.last_name) return
    await createDriver({ ...form, festival_id: festivalId })
    setForm({ first_name: "", last_name: "", phone: "", email: "", license_number: "", license_type: "", license_expiry: "" })
    setShowForm(false); load()
  }

  const handleDelete = async (id: string) => {
    await deleteDriver(id); load()
  }

  const getStatusBadge = (s: string) => {
    const st = DRIVER_STATUSES.find(x => x.value === s)
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${st?.color || "bg-gray-100 text-gray-600"}`}>{st?.label || s}</span>
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Drivers</h1><p className="text-sm text-gray-500 mt-1">Manage driver profiles, licenses and assignments.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Add Driver"}</Button>
      </div>

      {showForm && (
        <Card><CardHeader><CardTitle>Add Driver</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-sm font-medium">First Name *</label><Input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Last Name *</label><Input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Phone *</label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Email</label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div><label className="text-sm font-medium">License # *</label><Input value={form.license_number} onChange={e => setForm({...form, license_number: e.target.value})} /></div>
          <div><label className="text-sm font-medium">License Type</label><Input value={form.license_type} onChange={e => setForm({...form, license_type: e.target.value})} /></div>
          <div><label className="text-sm font-medium">License Expiry</label><Input type="date" value={form.license_expiry} onChange={e => setForm({...form, license_expiry: e.target.value})} /></div>
          <div className="md:col-span-3 flex gap-2 pt-2">
            <Button onClick={handleCreate}>Add Driver</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </CardContent></Card>
      )}

      <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search drivers..." value={search} onChange={e => setSearch(e.target.value)} /></div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drivers.filter(d => !search || d.first_name.toLowerCase().includes(search.toLowerCase()) || d.last_name.toLowerCase().includes(search.toLowerCase()) || d.phone?.includes(search)).map((d: any) => (
          <Card key={d.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center"><Users className="h-5 w-5 text-indigo-600" /></div>
                  <div><p className="font-semibold">{d.first_name} {d.last_name}</p><p className="text-xs text-gray-500">{d.email || "—"}</p></div>
                </div>
                {getStatusBadge(d.status)}
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-500">
                <p>Phone: {d.phone || "—"}</p>
                <p>License: {d.license_number} ({d.license_type})</p>
                {d.license_expiry && <p>Expiry: {new Date(d.license_expiry).toLocaleDateString()}</p>}
              </div>
              <div className="flex gap-1 mt-3 pt-3 border-t">
                <Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
