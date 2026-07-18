"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAssets, createAsset, deleteAsset } from "@/lib/actions/inventory"
import type { Asset } from "@/types/inventory"
import { ASSET_STATUSES } from "@/config/inventory"
import { Loader2, Plus, Search, Pencil, Trash2 } from "lucide-react"

const emptyForm = {
  name: "",
  description: "",
  serial_number: "",
  model_number: "",
  brand: "",
  purchase_date: "",
  purchase_cost: "",
  current_value: "",
  warranty_expiry: "",
  location: "",
  notes: "",
}

export default function AssetsPage() {
  const { orgId, festivalId } = useParams<{ orgId: string; festivalId: string }>()
  const router = useRouter()

  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const loadAssets = async () => {
    setLoading(true)
    try {
      const res = await getAssets(festivalId, statusFilter || undefined)
      setAssets(res.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssets()
  }, [festivalId, statusFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createAsset({
        ...form,
        festival_id: festivalId,
        purchase_cost: form.purchase_cost ? Number(form.purchase_cost) : undefined,
        current_value: form.current_value ? Number(form.current_value) : undefined,
      })
      setForm(emptyForm)
      setShowForm(false)
      await loadAssets()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return
    await deleteAsset(assetId)
    await loadAssets()
  }

  const filtered = assets.filter(
    (a) =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.asset_code?.toLowerCase().includes(search.toLowerCase()) ||
      a.serial_number?.toLowerCase().includes(search.toLowerCase()) ||
      a.brand?.toLowerCase().includes(search.toLowerCase()),
  )

  const statusColor = (status: string) => {
    const s = ASSET_STATUSES.find((st) => st.value === status)
    return s?.color || "#6b7280"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assets</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Cancel" : "New Asset"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Asset</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name *</label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Serial Number</label>
                <Input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Model Number</label>
                <Input value={form.model_number} onChange={(e) => setForm({ ...form, model_number: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Brand</label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Purchase Date</label>
                <Input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Purchase Cost</label>
                <Input type="number" step="0.01" value={form.purchase_cost} onChange={(e) => setForm({ ...form, purchase_cost: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Current Value</label>
                <Input type="number" step="0.01" value={form.current_value} onChange={(e) => setForm({ ...form, current_value: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Warranty Expiry</label>
                <Input type="date" value={form.warranty_expiry} onChange={(e) => setForm({ ...form, warranty_expiry: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Location</label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium">Notes</label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setForm(emptyForm) }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Asset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-[180px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {ASSET_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No assets found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Asset Code</th>
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Brand</th>
                    <th className="pb-3 font-medium">Serial #</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Location</th>
                    <th className="pb-3 font-medium">Cost</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((asset) => (
                    <tr key={asset.id} className="border-b last:border-0">
                      <td className="py-3 font-mono text-xs">{asset.asset_code}</td>
                      <td className="py-3">{asset.name}</td>
                      <td className="py-3">{asset.brand}</td>
                      <td className="py-3 font-mono text-xs">{asset.serial_number}</td>
                      <td className="py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: `${statusColor(asset.status)}20`, color: statusColor(asset.status) }}
                        >
                          {ASSET_STATUSES.find((s) => s.value === asset.status)?.label || asset.status}
                        </span>
                      </td>
                      <td className="py-3">{asset.location}</td>
                      <td className="py-3">{asset.purchase_cost != null ? `$${Number(asset.purchase_cost).toFixed(2)}` : "-"}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/inventory/assets/${asset.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id)}>
                            <Trash2 className="h-4 w-4" />
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
