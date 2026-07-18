"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getDistributionPoints, createDistributionPoint, updateDistributionPointStatus, getKitchens, getDiningHalls } from "@/lib/actions/food-catering"
import { DISTRIBUTION_POINT_STATUSES } from "@/config/food-catering"
import { Loader2, ShoppingCart, Plus, Search, MapPin } from "lucide-react"

export default function DistributionPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [points, setPoints] = useState<any[]>([])
  const [kitchens, setKitchens] = useState<any[]>([])
  const [halls, setHalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ kitchen_id: "", hall_id: "", point_name: "", location: "", counter_type: "regular" })

  const load = useCallback(async () => {
    setLoading(true)
    const [p, k, h] = await Promise.all([getDistributionPoints(festivalId), getKitchens(festivalId), getDiningHalls(festivalId)])
    setPoints(p.data || []); setKitchens(k.data || []); setHalls(h.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.point_name) return
    await createDistributionPoint({ ...form, festival_id: festivalId })
    setForm({ kitchen_id: "", hall_id: "", point_name: "", location: "", counter_type: "regular" })
    setShowForm(false); load()
  }

  const handleStatus = async (id: string, status: string) => { await updateDistributionPointStatus(id, status); load() }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Distribution Points</h1><p className="text-sm text-gray-500 mt-1">Manage food distribution counters and queue monitoring.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Add Point"}</Button>
      </div>

      {showForm && (
        <Card><CardHeader><CardTitle>Add Distribution Point</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Point Name *</label><Input value={form.point_name} onChange={e => setForm({...form, point_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Counter Type</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.counter_type} onChange={e => setForm({...form, counter_type: e.target.value})}>
              <option value="regular">Regular</option><option value="express">Express</option><option value="vip">VIP</option><option value="diet_specific">Diet Specific</option>
            </select></div>
          <div><label className="text-sm font-medium">Kitchen</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.kitchen_id} onChange={e => setForm({...form, kitchen_id: e.target.value})}>
              <option value="">Select...</option>{kitchens.map((k: any) => <option key={k.id} value={k.id}>{k.kitchen_name}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Dining Hall</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.hall_id} onChange={e => setForm({...form, hall_id: e.target.value})}>
              <option value="">Select...</option>{halls.map((h: any) => <option key={h.id} value={h.id}>{h.hall_name}</option>)}
            </select></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Location</label><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></div>
          <div className="md:col-span-2 flex gap-2 pt-2"><Button onClick={handleCreate}>Add Point</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}

      <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search distribution points..." value={search} onChange={e => setSearch(e.target.value)} /></div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {points.filter(p => !search || p.point_name.toLowerCase().includes(search.toLowerCase())).map((p: any) => (
          <Card key={p.id} className="hover:shadow-md transition-shadow"><CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"><ShoppingCart className="h-5 w-5 text-green-600" /></div>
                <div><p className="font-semibold">{p.point_name}</p><p className="text-xs text-gray-500 capitalize">{p.counter_type} counter</p></div>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${DISTRIBUTION_POINT_STATUSES.find(x => x.value === p.status)?.color || ""}`}>{DISTRIBUTION_POINT_STATUSES.find(x => x.value === p.status)?.label || p.status}</span>
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-500">
              {p.location && <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.location}</p>}
              <p>Queue: {p.queue_length} · Wait: {p.estimated_wait_minutes}min</p>
              <p>Kitchen: {p.kitchens?.kitchen_name || "—"} · Hall: {p.dining_halls?.hall_name || "—"}</p>
            </div>
            <div className="flex gap-1 mt-3 pt-3 border-t">
              {p.status === "closed" && <Button size="sm" variant="outline" onClick={() => handleStatus(p.id, "open")}>Open</Button>}
              {p.status === "open" && <Button size="sm" variant="outline" onClick={() => handleStatus(p.id, "paused")}>Pause</Button>}
              {p.status === "paused" && <Button size="sm" variant="outline" onClick={() => handleStatus(p.id, "open")}>Resume</Button>}
              {(p.status === "paused" || p.status === "open") && <Button size="sm" variant="ghost" onClick={() => handleStatus(p.id, "closed")}>Close</Button>}
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  )
}
