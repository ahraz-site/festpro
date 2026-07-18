"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getKitchenInventory, createKitchenInventoryItem, getKitchens, getFoodSuppliers } from "@/lib/actions/food-catering"
import { INGREDIENT_UNITS } from "@/config/food-catering"
import { Loader2, Package, Plus, Search, AlertTriangle } from "lucide-react"

export default function InventoryPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [items, setItems] = useState<any[]>([])
  const [kitchens, setKitchens] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [kitchenFilter, setKitchenFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ kitchen_id: "", item_name: "", category: "", quantity: "0", unit: "kg", unit_price: "0", min_stock_level: "0", expiry_date: "", supplier_id: "", storage_location: "", batch_number: "", notes: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const [i, k, s] = await Promise.all([getKitchenInventory(festivalId, kitchenFilter || undefined), getKitchens(festivalId), getFoodSuppliers(festivalId)])
    setItems(i.data || []); setKitchens(k.data || []); setSuppliers(s.data || []); setLoading(false)
  }, [festivalId, kitchenFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.item_name) return
    await createKitchenInventoryItem({ ...form, festival_id: festivalId, quantity: Number(form.quantity), unit_price: Number(form.unit_price), min_stock_level: Number(form.min_stock_level) })
    setForm({ kitchen_id: "", item_name: "", category: "", quantity: "0", unit: "kg", unit_price: "0", min_stock_level: "0", expiry_date: "", supplier_id: "", storage_location: "", batch_number: "", notes: "" })
    setShowForm(false); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Kitchen Inventory</h1><p className="text-sm text-gray-500 mt-1">Track ingredient stock levels, expiry and values.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Add Item"}</Button>
      </div>

      {showForm && (
        <Card><CardHeader><CardTitle>Add Inventory Item</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-sm font-medium">Item Name *</label><Input value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Category</label><Input value={form.category} onChange={e => setForm({...form, category: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Kitchen</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.kitchen_id} onChange={e => setForm({...form, kitchen_id: e.target.value})}>
              <option value="">Select...</option>{kitchens.map((k: any) => <option key={k.id} value={k.id}>{k.kitchen_name}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Quantity</label><Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Unit</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
              {INGREDIENT_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Unit Price</label><Input type="number" value={form.unit_price} onChange={e => setForm({...form, unit_price: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Min Stock Level</label><Input type="number" value={form.min_stock_level} onChange={e => setForm({...form, min_stock_level: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Expiry Date</label><Input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Supplier</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.supplier_id} onChange={e => setForm({...form, supplier_id: e.target.value})}>
              <option value="">Select...</option>{suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.supplier_name}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Storage Location</label><Input value={form.storage_location} onChange={e => setForm({...form, storage_location: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Batch #</label><Input value={form.batch_number} onChange={e => setForm({...form, batch_number: e.target.value})} /></div>
          <div className="md:col-span-3 flex gap-2 pt-2"><Button onClick={handleCreate}>Add Item</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}

      <div className="flex gap-3">
        <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={kitchenFilter} onChange={e => setKitchenFilter(e.target.value)}>
          <option value="">All Kitchens</option>{kitchens.map((k: any) => <option key={k.id} value={k.id}>{k.kitchen_name}</option>)}
        </select>
      </div>

      <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <th className="px-4 py-3">Item</th><th className="px-4 py-3">Kitchen</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Unit</th><th className="px-4 py-3">Unit Price</th><th className="px-4 py-3">Total Value</th><th className="px-4 py-3">Min Stock</th><th className="px-4 py-3">Expiry</th><th className="px-4 py-3">Status</th>
      </tr></thead><tbody className="divide-y divide-gray-100">
        {items.filter(i => !search || i.item_name.toLowerCase().includes(search.toLowerCase())).map((i: any) => {
          const isLow = Number(i.quantity) <= Number(i.min_stock_level)
          const isExpiring = i.expiry_date && new Date(i.expiry_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          return (
            <tr key={i.id} className={`hover:bg-gray-50 ${isLow || isExpiring ? "bg-red-50" : ""}`}>
              <td className="px-4 py-3 text-sm font-medium">{i.item_name}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{i.kitchens?.kitchen_name || "—"}</td>
              <td className="px-4 py-3 text-sm">{i.quantity}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{INGREDIENT_UNITS.find(u => u.value === i.unit)?.label || i.unit}</td>
              <td className="px-4 py-3 text-sm">${Number(i.unit_price).toFixed(2)}</td>
              <td className="px-4 py-3 text-sm font-mono">${Number(i.total_value).toFixed(2)}</td>
              <td className="px-4 py-3 text-sm">{i.min_stock_level}</td>
              <td className="px-4 py-3 text-sm">{i.expiry_date ? new Date(i.expiry_date).toLocaleDateString() : "—"}</td>
              <td className="px-4 py-3">{isLow && <span className="flex items-center gap-1 text-xs text-red-600"><AlertTriangle className="h-3 w-3" /> Low</span>}{isExpiring && !isLow && <span className="text-xs text-amber-600">Expiring</span>}</td>
            </tr>
          )
        })}
      </tbody></table></CardContent></Card>
    </div>
  )
}
