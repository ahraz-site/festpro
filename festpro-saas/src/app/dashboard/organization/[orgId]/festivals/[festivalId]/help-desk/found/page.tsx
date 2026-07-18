"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getFoundItems, createFoundItem, updateFoundItemStatus, deleteFoundItem } from "@/lib/actions/help-desk"
import { LOST_ITEM_CATEGORIES, LOST_ITEM_STATUSES } from "@/config/help-desk"
import { Loader2, Plus, Trash2, Package } from "lucide-react"

export default function FoundItemsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ item_name: "", description: "", category: "other", color: "", brand: "", found_location: "", finder_name: "", finder_phone: "", storage_location: "", notes: "" })

  const load = useCallback(async () => {
    const res = await getFoundItems(festivalId, filter || undefined)
    if (res.data) setItems(res.data); setLoading(false)
  }, [festivalId, filter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.item_name || !form.found_location) return
    setLoading(true)
    await createFoundItem({ ...form, festival_id: festivalId })
    setForm({ item_name: "", description: "", category: "other", color: "", brand: "", found_location: "", finder_name: "", finder_phone: "", storage_location: "", notes: "" })
    setShowForm(false); load()
  }

  if (loading && items.length === 0) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Found Items</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Report Found</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Report Found Item</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Item Name *</Label><Input value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} /></div>
              <div><Label>Category</Label><select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{LOST_ITEM_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
              <div><Label>Color</Label><Input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></div>
              <div><Label>Brand</Label><Input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} /></div>
              <div><Label>Found Location *</Label><Input value={form.found_location} onChange={e => setForm({ ...form, found_location: e.target.value })} /></div>
              <div><Label>Finder Name</Label><Input value={form.finder_name} onChange={e => setForm({ ...form, finder_name: e.target.value })} /></div>
              <div><Label>Finder Phone</Label><Input value={form.finder_phone} onChange={e => setForm({ ...form, finder_phone: e.target.value })} /></div>
              <div><Label>Storage Location</Label><Input value={form.storage_location} onChange={e => setForm({ ...form, storage_location: e.target.value })} /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <Button onClick={handleCreate}>Report</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button variant={filter === "" ? "default" : "outline"} size="sm" onClick={() => { setFilter(""); setLoading(true) }}>All</Button>
        {LOST_ITEM_STATUSES.map(s => (
          <Button key={s.value} variant={filter === s.value ? "default" : "outline"} size="sm" onClick={() => { setFilter(s.value); setLoading(true) }}>{s.label}</Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item: any) => {
          const s = LOST_ITEM_STATUSES.find(x => x.value === item.status)
          return (
            <Card key={item.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-500" />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s?.color || ""}`}>{s?.label || item.status}</span>
                    {item.matched_lost_item_id && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Matched</span>}
                  </div>
                  <div className="flex gap-1">
                    {item.status === "reported" && <Button size="sm" variant="ghost" onClick={() => updateFoundItemStatus(item.id, "returned")}>Return</Button>}
                    <Button size="sm" variant="ghost" onClick={async () => { if (confirm("Delete?")) { await deleteFoundItem(item.id); load() } }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </div>
                <p className="text-sm font-semibold mt-2">{item.item_name}</p>
                {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-400">
                  <span>📍 {item.found_location}</span>
                  {item.storage_location && <span>🗄️ {item.storage_location}</span>}
                  {item.finder_name && <span>Found by: {item.finder_name}</span>}
                </div>
                <p className="text-xs text-gray-400 mt-2">{new Date(item.found_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          )
        })}
        {items.length === 0 && <p className="text-center text-gray-400 py-8 col-span-3">No found items reported</p>}
      </div>
    </div>
  )
}
