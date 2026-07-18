"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAssetMaintenanceRecords, createAssetMaintenance, completeAssetMaintenance, getAssets } from "@/lib/actions/inventory"
import type { AssetMaintenance, Asset } from "@/types/inventory"
import { MAINTENANCE_TYPES, MAINTENANCE_STATUSES } from "@/config/inventory"
import { Loader2, Wrench, Plus, Pencil, CheckCircle, Clock, AlertTriangle } from "lucide-react"

const emptyForm = {
  asset_id: "",
  maintenance_type: "preventive",
  title: "",
  description: "",
  scheduled_date: "",
  cost: "",
  notes: "",
}

export default function MaintenancePage() {
  const { orgId, festivalId } = useParams<{ orgId: string; festivalId: string }>()

  const [records, setRecords] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [recordsRes, assetsRes] = await Promise.all([
        getAssetMaintenanceRecords(undefined, festivalId),
        getAssets(festivalId),
      ])
      setRecords(recordsRes.data || [])
      setAssets(assetsRes.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [festivalId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createAssetMaintenance({
        ...form,
        festival_id: festivalId,
        cost: form.cost ? Number(form.cost) : 0,
      })
      setForm(emptyForm)
      setShowForm(false)
      await loadData()
    } finally {
      setSubmitting(false)
    }
  }

  const handleComplete = async (id: string) => {
    await completeAssetMaintenance(id)
    await loadData()
  }

  const typeColor = (type: string) => {
    const t = MAINTENANCE_TYPES.find((mt) => mt.value === type)
    return t?.color || "#6b7280"
  }

  const statusColor = (status: string) => {
    const s = MAINTENANCE_STATUSES.find((st) => st.value === status)
    return s?.color || "#6b7280"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          <Wrench className="mr-2 inline-block h-6 w-6" />
          Asset Maintenance
        </h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? "Cancel" : "New Record"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Maintenance Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Asset *</label>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={form.asset_id}
                  onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
                >
                  <option value="">Select asset...</option>
                  {assets.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.asset_code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Type *</label>
                <select
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={form.maintenance_type}
                  onChange={(e) => setForm({ ...form, maintenance_type: e.target.value })}
                >
                  {MAINTENANCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Scheduled Date</label>
                <Input
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Cost</label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                />
              </div>
              <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setForm(emptyForm) }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Record
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : records.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No maintenance records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Asset</th>
                    <th className="pb-3 font-medium">Title</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Scheduled</th>
                    <th className="pb-3 font-medium">Completed</th>
                    <th className="pb-3 font-medium">Cost</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec: any) => (
                    <tr key={rec.id} className="border-b last:border-0">
                      <td className="py-3">{rec.assets?.name || "—"}</td>
                      <td className="py-3 font-medium">{rec.title}</td>
                      <td className="py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: `${typeColor(rec.maintenance_type)}20`,
                            color: typeColor(rec.maintenance_type),
                          }}
                        >
                          {MAINTENANCE_TYPES.find((t) => t.value === rec.maintenance_type)?.label || rec.maintenance_type}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: `${statusColor(rec.status)}20`,
                            color: statusColor(rec.status),
                          }}
                        >
                          {rec.status === "overdue" && <AlertTriangle className="mr-1 h-3 w-3" />}
                          {rec.status === "scheduled" && <Clock className="mr-1 h-3 w-3" />}
                          {rec.status === "completed" && <CheckCircle className="mr-1 h-3 w-3" />}
                          {MAINTENANCE_STATUSES.find((s) => s.value === rec.status)?.label || rec.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {rec.scheduled_date ? new Date(rec.scheduled_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3">
                        {rec.completed_date ? new Date(rec.completed_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3">
                        {rec.cost != null ? `$${Number(rec.cost).toFixed(2)}` : "—"}
                      </td>
                      <td className="py-3 text-right">
                        {rec.status !== "completed" && rec.status !== "cancelled" && (
                          <Button variant="ghost" size="sm" onClick={() => handleComplete(rec.id)}>
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Complete
                          </Button>
                        )}
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
