"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getInventoryAudits, createInventoryAudit, updateAuditStatus, getWarehouses } from "@/lib/actions/inventory"
import type { InventoryAudit, Warehouse } from "@/types/inventory"
import { AUDIT_STATUSES } from "@/config/inventory"
import { Loader2, ClipboardCheck, Plus, Play, CheckCircle, XCircle, Eye, Warehouse as WarehouseIcon } from "lucide-react"

export default function InventoryAuditsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [audits, setAudits] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [warehouseId, setWarehouseId] = useState("")
  const [notes, setNotes] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    const [auditsRes, whRes] = await Promise.all([
      getInventoryAudits(festivalId),
      getWarehouses(festivalId),
    ])
    if (auditsRes.data) setAudits(auditsRes.data)
    if (whRes.data) setWarehouses(whRes.data)
    setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!warehouseId) return
    setSubmitting(true)
    await createInventoryAudit({ festival_id: festivalId, warehouse_id: warehouseId, notes })
    setSubmitting(false)
    setShowForm(false)
    setWarehouseId("")
    setNotes("")
    load()
  }

  async function handleStatusUpdate(id: string, status: string) {
    await updateAuditStatus(id, status)
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const statusMap = Object.fromEntries(AUDIT_STATUSES.map(s => [s.value, s]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Audits</h1>
          <p className="text-sm text-gray-500 mt-1">Plan, conduct, and manage inventory audits.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> New Audit
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Inventory Audit</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                value={warehouseId}
                onChange={e => setWarehouseId(e.target.value)}
              >
                <option value="">Select warehouse...</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.warehouse_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                className="flex h-20 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 resize-none"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} loading={submitting} disabled={!warehouseId}>
                <ClipboardCheck className="h-4 w-4 mr-1" /> Create Audit
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Audit #</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Warehouse</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Conducted By</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Notes</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {audits.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No audits found.</td></tr>
              ) : audits.map(a => {
                const st = statusMap[a.status]
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.audit_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <WarehouseIcon className="h-3.5 w-3.5 text-gray-400" />
                        {a.warehouses?.warehouse_name || "\u2014"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(a.audit_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${st?.color || "bg-gray-100 text-gray-600"}`}>
                        {st?.label || a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.conducted_by || "\u2014"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{a.notes || "\u2014"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {a.status === "planned" && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(a.id, "in_progress")}>
                            <Play className="h-3.5 w-3.5 mr-1" /> Start
                          </Button>
                        )}
                        {a.status === "in_progress" && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(a.id, "completed")}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Complete
                          </Button>
                        )}
                        {a.status !== "completed" && a.status !== "cancelled" && (
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleStatusUpdate(a.id, "cancelled")}>
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                          </Button>
                        )}
                        <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/inventory/audit/${a.id}`}>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
