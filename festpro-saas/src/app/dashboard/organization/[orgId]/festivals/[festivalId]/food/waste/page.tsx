"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFoodWasteLogs, createFoodWasteLog, getKitchens, getMealSessions } from "@/lib/actions/food-catering"
import { WASTE_CATEGORIES, INGREDIENT_UNITS } from "@/config/food-catering"
import { Loader2, Trash2, Plus, Search, BarChart3 } from "lucide-react"

export default function WastePage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [logs, setLogs] = useState<any[]>([])
  const [kitchens, setKitchens] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ kitchen_id: "", meal_session_id: "", item_name: "", waste_category: "preparation", quantity: "0", unit: "kg", estimated_cost: "0", reason: "", notes: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const [l, k, s] = await Promise.all([getFoodWasteLogs(festivalId, catFilter || undefined), getKitchens(festivalId), getMealSessions(festivalId)])
    setLogs(l.data || []); setKitchens(k.data || []); setSessions(s.data || []); setLoading(false)
  }, [festivalId, catFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.item_name || !form.quantity) return
    await createFoodWasteLog({ ...form, festival_id: festivalId, quantity: Number(form.quantity), estimated_cost: Number(form.estimated_cost) })
    setForm({ kitchen_id: "", meal_session_id: "", item_name: "", waste_category: "preparation", quantity: "0", unit: "kg", estimated_cost: "0", reason: "", notes: "" })
    setShowForm(false); load()
  }

  const totalCost = logs.reduce((sum: number, l: any) => sum + Number(l.estimated_cost || 0), 0)

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Food Waste</h1><p className="text-sm text-gray-500 mt-1">Track, analyze and reduce food waste across kitchens.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Log Waste"}</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-red-600">{logs.length}</p><p className="text-sm text-gray-500">Total Records</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-orange-600">${totalCost.toFixed(2)}</p><p className="text-sm text-gray-500">Total Cost</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-amber-600">{logs.filter(l => l.waste_category === "overproduction").length}</p><p className="text-sm text-gray-500">Overproduction</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-2xl font-bold text-gray-600">{logs.filter(l => l.waste_category === "spoilage").length}</p><p className="text-sm text-gray-500">Spoilage</p></CardContent></Card>
      </div>

      {showForm && (
        <Card><CardHeader><CardTitle>Log Food Waste</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-sm font-medium">Item Name *</label><Input value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Category</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.waste_category} onChange={e => setForm({...form, waste_category: e.target.value})}>
              {WASTE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Kitchen</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.kitchen_id} onChange={e => setForm({...form, kitchen_id: e.target.value})}>
              <option value="">Select...</option>{kitchens.map((k: any) => <option key={k.id} value={k.id}>{k.kitchen_name}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Quantity *</label><Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Unit</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
              {INGREDIENT_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Est. Cost</label><Input type="number" value={form.estimated_cost} onChange={e => setForm({...form, estimated_cost: e.target.value})} /></div>
          <div className="md:col-span-3"><label className="text-sm font-medium">Reason</label><Input value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} /></div>
          <div className="md:col-span-3 flex gap-2 pt-2"><Button onClick={handleCreate}><Trash2 className="h-4 w-4 mr-1" /> Log Waste</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}

      <div className="flex gap-3">
        <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search waste logs..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>{WASTE_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <th className="px-4 py-3">Item</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Kitchen</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Cost</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Date</th>
      </tr></thead><tbody className="divide-y divide-gray-100">
        {logs.filter(l => !search || l.item_name.toLowerCase().includes(search.toLowerCase())).map((l: any) => (
          <tr key={l.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-medium">{l.item_name}</td>
            <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${WASTE_CATEGORIES.find(c => c.value === l.waste_category)?.color || ""}`}>{WASTE_CATEGORIES.find(c => c.value === l.waste_category)?.label || l.waste_category}</span></td>
            <td className="px-4 py-3 text-sm text-gray-500">{l.kitchens?.kitchen_name || "—"}</td>
            <td className="px-4 py-3 text-sm">{l.quantity} {INGREDIENT_UNITS.find(u => u.value === l.unit)?.label || l.unit}</td>
            <td className="px-4 py-3 text-sm font-mono">${Number(l.estimated_cost).toFixed(2)}</td>
            <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{l.reason || "—"}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{l.recorded_at ? new Date(l.recorded_at).toLocaleString() : "—"}</td>
          </tr>
        ))}
      </tbody></table></CardContent></Card>
    </div>
  )
}
