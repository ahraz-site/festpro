"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getInventoryItems, createInventoryItem, deleteInventoryItem } from "@/lib/actions/inventory"
import type { InventoryItem } from "@/types/inventory"
import { INVENTORY_UNITS } from "@/config/inventory"
import { Loader2, Package, Plus, Search, Pencil, Trash2, Barcode } from "lucide-react"

export default function InventoryItemsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    const res = await getInventoryItems(festivalId, categoryFilter || undefined, search || undefined)
    setItems((res.data as any) || [])
    setLoading(false)
  }, [festivalId, categoryFilter, search])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const form = new FormData(e.currentTarget)
    const payload: Record<string, any> = {
      festival_id: festivalId,
      sku: form.get("sku"),
      name: form.get("name"),
      brand: form.get("brand") || null,
      model: form.get("model") || null,
      unit: form.get("unit") || "piece",
      unit_price: parseFloat(form.get("unit_price") as string) || 0,
      cost_price: parseFloat(form.get("cost_price") as string) || 0,
      min_stock: parseInt(form.get("min_stock") as string) || 0,
      max_stock: parseInt(form.get("max_stock") as string) || 0,
      reorder_level: parseInt(form.get("reorder_level") as string) || 0,
      description: form.get("description") as string || null,
    }
    await createInventoryItem(payload)
    setSubmitting(false)
    setShowForm(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    await deleteInventoryItem(id)
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Items</h1>
          <p className="text-sm text-gray-500 mt-1">Manage products and materials in your inventory.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "New Item"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create Inventory Item</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">SKU *</label>
                <Input name="sku" required placeholder="e.g. ITM-001" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Name *</label>
                <Input name="name" required placeholder="Item name" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Brand</label>
                <Input name="brand" placeholder="Brand name" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Model</label>
                <Input name="model" placeholder="Model number" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Unit</label>
                <select name="unit" className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
                  {INVENTORY_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Unit Price</label>
                <Input name="unit_price" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Cost Price</label>
                <Input name="cost_price" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Min Stock</label>
                <Input name="min_stock" type="number" placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Max Stock</label>
                <Input name="max_stock" type="number" placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Reorder Level</label>
                <Input name="reorder_level" type="number" placeholder="0" />
              </div>
              <div className="space-y-1 md:col-span-3">
                <label className="text-sm font-medium">Description</label>
                <textarea name="description" rows={3} className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 placeholder:text-gray-400" placeholder="Optional description" />
              </div>
              <div className="md:col-span-3 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" loading={submitting}>
                  <Package className="h-4 w-4 mr-1" /> Create Item
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search by name, SKU, or brand..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <Card>
        <CardHeader><CardTitle>All Items ({items.length})</CardTitle></CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No items found</p>
              <p className="text-sm">Click &quot;New Item&quot; to add your first inventory item.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-3 font-medium">SKU / Barcode</th>
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Brand</th>
                    <th className="pb-3 font-medium">Unit</th>
                    <th className="pb-3 font-medium text-right">Unit Price</th>
                    <th className="pb-3 font-medium text-right">Min Stock</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Barcode className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-xs">{item.sku}</span>
                        </div>
                      </td>
                      <td className="py-3 font-medium">{item.name}</td>
                      <td className="py-3 text-gray-600">{item.brand || "—"}</td>
                      <td className="py-3">{INVENTORY_UNITS.find(u => u.value === item.unit)?.label || item.unit}</td>
                      <td className="py-3 text-right">${(item.unit_price || 0).toFixed(2)}</td>
                      <td className="py-3 text-right">{item.min_stock}</td>
                      <td className="py-3">
                        {item.is_active ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Inactive</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon-sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
