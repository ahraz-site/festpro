"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMedicineInventory, createMedicineStock, getMedicalCenters, getMedications } from "@/lib/actions/medical-emergency"
import { Loader2, Pill, Plus, Search, AlertTriangle } from "lucide-react"

export default function MedicineInventoryPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [items, setItems] = useState<any[]>([])
  const [centers, setCenters] = useState<any[]>([])
  const [meds, setMeds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [centerFilter, setCenterFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ center_id: "", medication_id: "", batch_number: "", quantity: "0", unit_price: "0", expiry_date: "", manufacturer: "", storage_location: "", notes: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const [i, c, m] = await Promise.all([getMedicineInventory(festivalId, centerFilter || undefined), getMedicalCenters(festivalId), getMedications(festivalId)])
    setItems(i.data || []); setCenters(c.data || []); setMeds(m.data || []); setLoading(false)
  }, [festivalId, centerFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.batch_number || !form.expiry_date) return
    await createMedicineStock({ ...form, festival_id: festivalId, quantity: Number(form.quantity), unit_price: Number(form.unit_price) })
    setForm({ center_id: "", medication_id: "", batch_number: "", quantity: "0", unit_price: "0", expiry_date: "", manufacturer: "", storage_location: "", notes: "" })
    setShowForm(false); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Medicine Inventory</h1><p className="text-sm text-gray-500 mt-1">Track medicine stock levels, batches and expiry.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Add Stock"}</Button>
      </div>
      {showForm && (
        <Card><CardHeader><CardTitle>Add Medicine Stock</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-sm font-medium">Medication</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.medication_id} onChange={e => setForm({...form, medication_id: e.target.value})}>
              <option value="">Select...</option>{meds.map((m: any) => <option key={m.id} value={m.id}>{m.medication_name}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Center</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.center_id} onChange={e => setForm({...form, center_id: e.target.value})}>
              <option value="">Select...</option>{centers.map((c: any) => <option key={c.id} value={c.id}>{c.center_name}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Batch # *</label><Input value={form.batch_number} onChange={e => setForm({...form, batch_number: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Quantity</label><Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Unit Price</label><Input type="number" value={form.unit_price} onChange={e => setForm({...form, unit_price: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Expiry Date *</label><Input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Manufacturer</label><Input value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Storage</label><Input value={form.storage_location} onChange={e => setForm({...form, storage_location: e.target.value})} /></div>
          <div className="md:col-span-3 flex gap-2 pt-2"><Button onClick={handleCreate}>Add Stock</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}
      <div className="flex gap-3">
        <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={centerFilter} onChange={e => setCenterFilter(e.target.value)}>
          <option value="">All Centers</option>{centers.map((c: any) => <option key={c.id} value={c.id}>{c.center_name}</option>)}
        </select>
      </div>
      <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <th className="px-4 py-3">Medication</th><th className="px-4 py-3">Batch</th><th className="px-4 py-3">Center</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Expiry</th><th className="px-4 py-3">Status</th>
      </tr></thead><tbody className="divide-y divide-gray-100">
        {items.filter(i => !search || (i.medications?.medication_name || "").toLowerCase().includes(search.toLowerCase())).map((i: any) => {
          const low = Number(i.quantity) < 10; const exp = i.expiry_date && new Date(i.expiry_date) < new Date(Date.now() + 30*24*60*60*1000)
          return (
            <tr key={i.id} className={`hover:bg-gray-50 ${low || exp ? "bg-red-50" : ""}`}>
              <td className="px-4 py-3 text-sm font-medium">{i.medications?.medication_name || "—"}</td>
              <td className="px-4 py-3 text-sm font-mono">{i.batch_number}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{i.medical_centers?.center_name || "—"}</td>
              <td className="px-4 py-3 text-sm">{i.quantity}</td>
              <td className="px-4 py-3 text-sm">{i.expiry_date ? new Date(i.expiry_date).toLocaleDateString() : "—"}</td>
              <td className="px-4 py-3">{low && <span className="flex items-center gap-1 text-xs text-red-600"><AlertTriangle className="h-3 w-3" /> Low</span>}{exp && !low && <span className="text-xs text-amber-600">Expiring</span>}</td>
            </tr>
          )
        })}
      </tbody></table></CardContent></Card>
    </div>
  )
}
