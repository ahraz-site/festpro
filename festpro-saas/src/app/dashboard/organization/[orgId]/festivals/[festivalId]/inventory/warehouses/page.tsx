"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getWarehouses, createWarehouse, deleteWarehouse } from "@/lib/actions/inventory"
import type { Warehouse } from "@/types/inventory"
import { Loader2, Warehouse as WarehouseIcon, Plus, MapPin, Pencil, Trash2 } from "lucide-react"

export default function WarehousesPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ warehouse_code: "", warehouse_name: "", location: "", capacity_sqft: "", contact_person: "", contact_phone: "" })

  const load = useCallback(async () => {
    const res = await getWarehouses(festivalId)
    if (res.data) setWarehouses(res.data); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const resetForm = () => {
    setForm({ warehouse_code: "", warehouse_name: "", location: "", capacity_sqft: "", contact_person: "", contact_phone: "" })
    setEditingId(null)
    setShowForm(false)
  }

  const handleCreate = async () => {
    if (!form.warehouse_code || !form.warehouse_name) return
    await createWarehouse({ ...form, festival_id: festivalId, capacity_sqft: form.capacity_sqft ? Number(form.capacity_sqft) : null })
    resetForm()
    load()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Delete this warehouse?")) {
      await deleteWarehouse(id)
      load()
    }
  }

  const startEdit = (w: Warehouse) => {
    setForm({
      warehouse_code: w.warehouse_code,
      warehouse_name: w.warehouse_name,
      location: w.location || "",
      capacity_sqft: w.capacity_sqft?.toString() || "",
      contact_person: w.contact_person || "",
      contact_phone: w.contact_phone || "",
    })
    setEditingId(w.id)
    setShowForm(true)
  }

  if (loading && warehouses.length === 0) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WarehouseIcon className="h-6 w-6 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900">Warehouses</h1>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm) }}><Plus className="h-4 w-4 mr-1" /> New Warehouse</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editingId ? "Edit Warehouse" : "New Warehouse"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Warehouse Code *</Label><Input value={form.warehouse_code} onChange={e => setForm({ ...form, warehouse_code: e.target.value })} /></div>
              <div><Label>Warehouse Name *</Label><Input value={form.warehouse_name} onChange={e => setForm({ ...form, warehouse_name: e.target.value })} /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
              <div><Label>Capacity (sq ft)</Label><Input type="number" value={form.capacity_sqft} onChange={e => setForm({ ...form, capacity_sqft: e.target.value })} /></div>
              <div><Label>Contact Person</Label><Input value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} /></div>
              <div><Label>Contact Phone</Label><Input value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>{editingId ? "Update" : "Create"} Warehouse</Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {warehouses.map(w => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-500">{w.warehouse_code}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{w.warehouse_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {w.location ? <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{w.location}</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${w.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{w.is_active ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(w)}><Pencil className="h-4 w-4 text-gray-400" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(w.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {warehouses.length === 0 && <p className="text-center text-gray-400 py-8">No warehouses configured</p>}
        </CardContent>
      </Card>
    </div>
  )
}
