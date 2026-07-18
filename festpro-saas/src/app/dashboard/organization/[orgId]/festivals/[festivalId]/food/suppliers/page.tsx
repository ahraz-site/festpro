"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFoodSuppliers, createFoodSupplier } from "@/lib/actions/food-catering"
import { Loader2, Truck, Plus, Search, Star } from "lucide-react"

export default function SuppliersPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ supplier_name: "", contact_person: "", contact_phone: "", contact_email: "", address: "", supply_categories: "", payment_terms: "", notes: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const s = await getFoodSuppliers(festivalId)
    setSuppliers(s.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.supplier_name) return
    await createFoodSupplier({ ...form, festival_id: festivalId })
    setForm({ supplier_name: "", contact_person: "", contact_phone: "", contact_email: "", address: "", supply_categories: "", payment_terms: "", notes: "" })
    setShowForm(false); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Food Suppliers</h1><p className="text-sm text-gray-500 mt-1">Manage ingredient and food suppliers.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Add Supplier"}</Button>
      </div>

      {showForm && (
        <Card><CardHeader><CardTitle>Add Supplier</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Name *</label><Input value={form.supplier_name} onChange={e => setForm({...form, supplier_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Contact Person</label><Input value={form.contact_person} onChange={e => setForm({...form, contact_person: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Phone</label><Input value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Email</label><Input type="email" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Address</label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Supply Categories</label><Input value={form.supply_categories} onChange={e => setForm({...form, supply_categories: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Payment Terms</label><Input value={form.payment_terms} onChange={e => setForm({...form, payment_terms: e.target.value})} /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium">Notes</label><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
          <div className="md:col-span-2 flex gap-2 pt-2"><Button onClick={handleCreate}>Add Supplier</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}

      <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search suppliers..." value={search} onChange={e => setSearch(e.target.value)} /></div>

      <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <th className="px-4 py-3">Supplier</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Categories</th><th className="px-4 py-3">Rating</th><th className="px-4 py-3">Status</th>
      </tr></thead><tbody className="divide-y divide-gray-100">
        {suppliers.filter(s => !search || s.supplier_name.toLowerCase().includes(search.toLowerCase())).map((s: any) => (
          <tr key={s.id} className="hover:bg-gray-50">
            <td className="px-4 py-3"><p className="text-sm font-medium">{s.supplier_name}</p><p className="text-xs text-gray-400">{s.supplier_code}</p></td>
            <td className="px-4 py-3 text-sm text-gray-500">{s.contact_person || "—"}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{s.contact_phone || "—"}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{s.supply_categories || "—"}</td>
            <td className="px-4 py-3"><span className="flex items-center gap-1 text-sm">{s.rating} <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /></span></td>
            <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{s.is_active ? "Active" : "Inactive"}</span></td>
          </tr>
        ))}
      </tbody></table></CardContent></Card>
    </div>
  )
}
