"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getStockTransactions, createStockTransaction, getStockAdjustments, createStockAdjustment, approveStockAdjustment, getInventoryItems, getWarehouses } from "@/lib/actions/inventory"
import type { StockTransaction, StockAdjustment, InventoryItem, Warehouse } from "@/types/inventory"
import { STOCK_MOVEMENT_TYPES, STOCK_ADJUSTMENT_STATUSES } from "@/config/inventory"
import { Loader2, TrendingUp, Plus, CheckCircle, XCircle, ArrowUpDown, AlertTriangle } from "lucide-react"

export default function StockTransactionsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [activeTab, setActiveTab] = useState<"transactions" | "adjustments">("transactions")

  const [transactions, setTransactions] = useState<any[]>([])
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [items, setItems] = useState<InventoryItem[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [showTxnForm, setShowTxnForm] = useState(false)
  const [showAdjForm, setShowAdjForm] = useState(false)

  const [txnForm, setTxnForm] = useState({ item_id: "", warehouse_id: "", movement_type: "in", quantity: "", unit_cost: "", notes: "" })
  const [adjForm, setAdjForm] = useState({ reason: "", notes: "" })

  const load = useCallback(async () => {
    const [txnRes, adjRes, itemsRes, whRes] = await Promise.all([
      getStockTransactions(festivalId),
      getStockAdjustments(festivalId),
      getInventoryItems(festivalId),
      getWarehouses(festivalId),
    ])
    if (txnRes.data) setTransactions(txnRes.data as any[])
    if (adjRes.data) setAdjustments(adjRes.data)
    if (itemsRes.data) setItems(itemsRes.data as InventoryItem[])
    if (whRes.data) setWarehouses(whRes.data)
    setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreateTransaction = async () => {
    if (!txnForm.item_id || !txnForm.warehouse_id || !txnForm.movement_type || !txnForm.quantity) return
    setSubmitting(true)
    await createStockTransaction({
      festival_id: festivalId,
      item_id: txnForm.item_id,
      warehouse_id: txnForm.warehouse_id,
      movement_type: txnForm.movement_type,
      quantity: Number(txnForm.quantity),
      unit_cost: txnForm.unit_cost ? Number(txnForm.unit_cost) : null,
      notes: txnForm.notes || null,
    })
    setSubmitting(false)
    setShowTxnForm(false)
    setTxnForm({ item_id: "", warehouse_id: "", movement_type: "in", quantity: "", unit_cost: "", notes: "" })
    load()
  }

  const handleCreateAdjustment = async () => {
    if (!adjForm.reason) return
    setSubmitting(true)
    await createStockAdjustment({ festival_id: festivalId, reason: adjForm.reason, notes: adjForm.notes || null })
    setSubmitting(false)
    setShowAdjForm(false)
    setAdjForm({ reason: "", notes: "" })
    load()
  }

  const handleApprove = async (id: string, approved: boolean) => {
    await approveStockAdjustment(id, approved)
    load()
  }

  const getMovementBadge = (type: string) => {
    const mt = STOCK_MOVEMENT_TYPES.find(m => m.value === type)
    return mt ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${mt.color}`}>{mt.label}</span> : type
  }

  const getStatusBadge = (status: string) => {
    const st = STOCK_ADJUSTMENT_STATUSES.find(s => s.value === status)
    return st ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span> : status
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowUpDown className="h-6 w-6 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900">Stock Transactions</h1>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "transactions" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("transactions")}
        >
          <TrendingUp className="h-4 w-4 inline mr-1" />Transactions
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "adjustments" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("adjustments")}
        >
          <AlertTriangle className="h-4 w-4 inline mr-1" />Adjustments
        </button>
      </div>

      {activeTab === "transactions" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setShowTxnForm(!showTxnForm); setShowAdjForm(false) }}>
              <Plus className="h-4 w-4 mr-1" /> {showTxnForm ? "Cancel" : "New Transaction"}
            </Button>
          </div>

          {showTxnForm && (
            <Card>
              <CardHeader><CardTitle>New Stock Transaction</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Item *</label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      value={txnForm.item_id}
                      onChange={e => setTxnForm({ ...txnForm, item_id: e.target.value })}
                    >
                      <option value="">Select item...</option>
                      {items.map(item => <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Warehouse *</label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      value={txnForm.warehouse_id}
                      onChange={e => setTxnForm({ ...txnForm, warehouse_id: e.target.value })}
                    >
                      <option value="">Select warehouse...</option>
                      {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.warehouse_name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Movement Type *</label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      value={txnForm.movement_type}
                      onChange={e => setTxnForm({ ...txnForm, movement_type: e.target.value })}
                    >
                      {STOCK_MOVEMENT_TYPES.map(mt => <option key={mt.value} value={mt.value}>{mt.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Quantity *</label>
                    <Input type="number" min="1" value={txnForm.quantity} onChange={e => setTxnForm({ ...txnForm, quantity: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Unit Cost</label>
                    <Input type="number" step="0.01" value={txnForm.unit_cost} onChange={e => setTxnForm({ ...txnForm, unit_cost: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Notes</label>
                    <Input value={txnForm.notes} onChange={e => setTxnForm({ ...txnForm, notes: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateTransaction} loading={submitting}>
                    <Plus className="h-4 w-4 mr-1" /> Create Transaction
                  </Button>
                  <Button variant="outline" onClick={() => setShowTxnForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3 text-right">Quantity</th>
                    <th className="px-4 py-3">Warehouse</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map(txn => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{getMovementBadge(txn.movement_type)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{(txn as any).inventory_items?.name || "—"}</td>
                      <td className="px-4 py-3 text-sm text-right font-mono">{txn.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{(txn as any).warehouses?.warehouse_name || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{txn.notes || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(txn.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && <p className="text-center text-gray-400 py-8">No transactions recorded</p>}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "adjustments" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setShowAdjForm(!showAdjForm); setShowTxnForm(false) }}>
              <Plus className="h-4 w-4 mr-1" /> {showAdjForm ? "Cancel" : "New Adjustment"}
            </Button>
          </div>

          {showAdjForm && (
            <Card>
              <CardHeader><CardTitle>New Stock Adjustment</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Reason *</label>
                    <Input value={adjForm.reason} onChange={e => setAdjForm({ ...adjForm, reason: e.target.value })} placeholder="e.g. Physical count variance" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Notes</label>
                    <Input value={adjForm.notes} onChange={e => setAdjForm({ ...adjForm, notes: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateAdjustment} loading={submitting}>
                    <Plus className="h-4 w-4 mr-1" /> Create Adjustment
                  </Button>
                  <Button variant="outline" onClick={() => setShowAdjForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Adjustment #</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {adjustments.map(adj => (
                    <tr key={adj.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-500">{adj.adjustment_number}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{adj.reason}</td>
                      <td className="px-4 py-3">{getStatusBadge(adj.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(adj.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        {adj.status === "pending" && (
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleApprove(adj.id, true)}>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleApprove(adj.id, false)}>
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {adjustments.length === 0 && <p className="text-center text-gray-400 py-8">No adjustments recorded</p>}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
