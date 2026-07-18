"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getPurchaseRequests, createPurchaseRequest, updatePurchaseRequestStatus, deletePurchaseRequest, getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, getVendors } from "@/lib/actions/inventory"
import type { PurchaseRequest, PurchaseOrder } from "@/types/inventory"
import { PURCHASE_REQUEST_STATUSES, PURCHASE_ORDER_STATUSES } from "@/config/inventory"
import { Loader2, ShoppingCart, FileText, Plus, Pencil, Trash2, CheckCircle, XCircle, Send, Eye } from "lucide-react"

function statusBadge(status: string, statuses: readonly { value: string; label: string; color: string }[]) {
  const s = statuses.find(st => st.value === status)
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s?.color || "bg-gray-100 text-gray-600"}`}>{s?.label || status}</span>
}

export default function PurchasePage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [activeTab, setActiveTab] = useState<"pr" | "po">("pr")
  const [loading, setLoading] = useState(true)
  const [prs, setPrs] = useState<PurchaseRequest[]>([])
  const [pos, setPos] = useState<any[]>([])
  const [vendors, setVendors] = useState<any[]>([])

  const [showPrForm, setShowPrForm] = useState(false)
  const [showPoForm, setShowPoForm] = useState(false)
  const [editingPo, setEditingPo] = useState<any | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // PR form
  const [prTitle, setPrTitle] = useState("")
  const [prDesc, setPrDesc] = useState("")
  const [prNotes, setPrNotes] = useState("")

  // PO form
  const [poTitle, setPoTitle] = useState("")
  const [poDesc, setPoDesc] = useState("")
  const [poVendorId, setPoVendorId] = useState("")
  const [poExpectedDelivery, setPoExpectedDelivery] = useState("")
  const [poDeliveryAddress, setPoDeliveryAddress] = useState("")
  const [poNotes, setPoNotes] = useState("")

  const loadPrs = useCallback(async () => {
    const res = await getPurchaseRequests(festivalId)
    if (res.data) setPrs(res.data as PurchaseRequest[])
  }, [festivalId])

  const loadPos = useCallback(async () => {
    const res = await getPurchaseOrders(festivalId)
    if (res.data) setPos(res.data)
  }, [festivalId])

  const loadVendors = useCallback(async () => {
    const res = await getVendors(festivalId)
    if (res.data) setVendors(res.data)
  }, [festivalId])

  const loadAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([loadPrs(), loadPos(), loadVendors()])
    setLoading(false)
  }, [loadPrs, loadPos, loadVendors])

  useEffect(() => { loadAll() }, [loadAll])

  function resetPrForm() {
    setPrTitle(""); setPrDesc(""); setPrNotes(""); setShowPrForm(false)
  }

  function resetPoForm() {
    setPoTitle(""); setPoDesc(""); setPoVendorId(""); setPoExpectedDelivery(""); setPoDeliveryAddress(""); setPoNotes(""); setEditingPo(null); setShowPoForm(false)
  }

  async function handleCreatePr() {
    if (!prTitle.trim()) return
    setSubmitting(true)
    await createPurchaseRequest({ festival_id: festivalId, title: prTitle, description: prDesc, notes: prNotes })
    resetPrForm()
    await loadPrs()
    setSubmitting(false)
  }

  async function handleUpdatePrStatus(id: string, status: string) {
    await updatePurchaseRequestStatus(id, status)
    await loadPrs()
  }

  async function handleDeletePr(id: string) {
    await deletePurchaseRequest(id)
    await loadPrs()
  }

  async function handleCreatePo() {
    if (!poTitle.trim()) return
    setSubmitting(true)
    await createPurchaseOrder({
      festival_id: festivalId, title: poTitle, description: poDesc,
      vendor_id: poVendorId || null, expected_delivery: poExpectedDelivery || null,
      delivery_address: poDeliveryAddress || null, notes: poNotes || null,
    })
    resetPoForm()
    await loadPos()
    setSubmitting(false)
  }

  async function handleUpdatePo() {
    if (!editingPo || !poTitle.trim()) return
    setSubmitting(true)
    await updatePurchaseOrder(editingPo.id, {
      title: poTitle, description: poDesc,
      vendor_id: poVendorId || null, expected_delivery: poExpectedDelivery || null,
      delivery_address: poDeliveryAddress || null, notes: poNotes || null,
    })
    resetPoForm()
    await loadPos()
    setSubmitting(false)
  }

  async function handleDeletePo(id: string) {
    await deletePurchaseOrder(id)
    await loadPos()
  }

  function startEditPo(po: any) {
    setEditingPo(po)
    setPoTitle(po.title || "")
    setPoDesc(po.description || "")
    setPoVendorId(po.vendor_id || "")
    setPoExpectedDelivery(po.expected_delivery || "")
    setPoDeliveryAddress(po.delivery_address || "")
    setPoNotes(po.notes || "")
    setShowPoForm(true)
  }

  const tabClass = (tab: "pr" | "po") =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage purchase requests and purchase orders.</p>
        </div>
        <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/inventory`}>
          <Button variant="outline" size="sm">Back to Inventory</Button>
        </Link>
      </div>

      <div className="flex gap-2">
        <button className={tabClass("pr")} onClick={() => setActiveTab("pr")}>
          <ShoppingCart className="h-4 w-4 inline mr-1" /> Purchase Requests
        </button>
        <button className={tabClass("po")} onClick={() => setActiveTab("po")}>
          <FileText className="h-4 w-4 inline mr-1" /> Purchase Orders
        </button>
      </div>

      {activeTab === "pr" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { resetPrForm(); setShowPrForm(!showPrForm) }}>
              <Plus className="h-4 w-4 mr-1" /> {showPrForm ? "Cancel" : "New PR"}
            </Button>
          </div>

          {showPrForm && (
            <Card>
              <CardHeader><CardTitle className="text-lg">New Purchase Request</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Title *</label>
                  <Input value={prTitle} onChange={e => setPrTitle(e.target.value)} placeholder="Enter PR title" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" value={prDesc} onChange={e => setPrDesc(e.target.value)} placeholder="Enter description" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <textarea className="flex min-h-[60px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" value={prNotes} onChange={e => setPrNotes(e.target.value)} placeholder="Enter notes" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleCreatePr} disabled={submitting || !prTitle.trim()}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                    Submit PR
                  </Button>
                  <Button variant="outline" onClick={resetPrForm}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {prs.length === 0 ? (
            <Card><CardContent className="text-center py-8 text-gray-500">No purchase requests found.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {prs.map(pr => (
                <Card key={pr.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-gray-500">{pr.pr_number}</span>
                          {statusBadge(pr.status, PURCHASE_REQUEST_STATUSES)}
                        </div>
                        <p className="font-semibold text-gray-900">{pr.title}</p>
                        <p className="text-xs text-gray-500">Requested by: {pr.requested_by || "N/A"} | {pr.requested_date ? new Date(pr.requested_date).toLocaleDateString() : ""}</p>
                        {pr.description && <p className="text-sm text-gray-600">{pr.description}</p>}
                      </div>
                      <div className="flex gap-1">
                        {(pr.status === "pending_approval" || pr.status === "draft") && (
                          <>
                            <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleUpdatePrStatus(pr.id, "approved")} title="Approve">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleUpdatePrStatus(pr.id, "rejected")} title="Reject">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeletePr(pr.id)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "po" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { resetPoForm(); setShowPoForm(!showPoForm) }}>
              <Plus className="h-4 w-4 mr-1" /> {showPoForm ? "Cancel" : "New PO"}
            </Button>
          </div>

          {showPoForm && (
            <Card>
              <CardHeader><CardTitle className="text-lg">{editingPo ? "Edit" : "New"} Purchase Order</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Title *</label>
                  <Input value={poTitle} onChange={e => setPoTitle(e.target.value)} placeholder="Enter PO title" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea className="flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" value={poDesc} onChange={e => setPoDesc(e.target.value)} placeholder="Enter description" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Vendor</label>
                  <select className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={poVendorId} onChange={e => setPoVendorId(e.target.value)}>
                    <option value="">Select vendor</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.company_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Expected Delivery</label>
                  <Input type="date" value={poExpectedDelivery} onChange={e => setPoExpectedDelivery(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Delivery Address</label>
                  <textarea className="flex min-h-[60px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" value={poDeliveryAddress} onChange={e => setPoDeliveryAddress(e.target.value)} placeholder="Enter delivery address" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <textarea className="flex min-h-[60px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" value={poNotes} onChange={e => setPoNotes(e.target.value)} placeholder="Enter notes" />
                </div>
                <div className="flex gap-2 pt-2">
                  {editingPo ? (
                    <Button onClick={handleUpdatePo} disabled={submitting || !poTitle.trim()}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Pencil className="h-4 w-4 mr-1" />}
                      Update PO
                    </Button>
                  ) : (
                    <Button onClick={handleCreatePo} disabled={submitting || !poTitle.trim()}>
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                      Create PO
                    </Button>
                  )}
                  <Button variant="outline" onClick={resetPoForm}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {pos.length === 0 ? (
            <Card><CardContent className="text-center py-8 text-gray-500">No purchase orders found.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {pos.map((po: any) => (
                <Card key={po.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-gray-500">{po.po_number}</span>
                          {statusBadge(po.status, PURCHASE_ORDER_STATUSES)}
                        </div>
                        <p className="font-semibold text-gray-900">{po.title}</p>
                        <p className="text-xs text-gray-500">
                          Vendor: {po.vendors?.company_name || "N/A"} | Order: {po.order_date ? new Date(po.order_date).toLocaleDateString() : "N/A"} | Total: ${(po.total_amount || 0).toFixed(2)}
                        </p>
                        {po.description && <p className="text-sm text-gray-600">{po.description}</p>}
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => startEditPo(po)} title="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeletePo(po.id)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
