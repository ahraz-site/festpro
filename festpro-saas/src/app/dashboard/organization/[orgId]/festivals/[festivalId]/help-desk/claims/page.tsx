"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getClaimRequests, createClaimRequest, updateClaimStatus, getLostItems, getFoundItems } from "@/lib/actions/help-desk"
import { CLAIM_STATUSES } from "@/config/help-desk"
import { Loader2, Plus, CheckCircle, XCircle, ShieldCheck, ClipboardList } from "lucide-react"

export default function ClaimsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [claims, setClaims] = useState<any[]>([])
  const [lostItems, setLostItems] = useState<any[]>([])
  const [foundItems, setFoundItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ lost_item_id: "", found_item_id: "", claimant_name: "", claimant_email: "", claimant_phone: "", description: "", id_proof_type: "", id_proof_number: "" })

  const load = useCallback(async () => {
    const [cRes, lRes, fRes] = await Promise.all([getClaimRequests(festivalId), getLostItems(festivalId), getFoundItems(festivalId)])
    if (cRes.data) setClaims(cRes.data)
    if (lRes.data) setLostItems(lRes.data.filter((i: any) => i.status === "reported" || i.status === "matched"))
    if (fRes.data) setFoundItems(fRes.data.filter((i: any) => i.status === "reported"))
    setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.claimant_name || !form.description) return
    await createClaimRequest({ ...form, festival_id: festivalId })
    setForm({ lost_item_id: "", found_item_id: "", claimant_name: "", claimant_email: "", claimant_phone: "", description: "", id_proof_type: "", id_proof_number: "" })
    setShowForm(false); load()
  }

  if (loading && claims.length === 0) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Claim Requests</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> New Claim</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>File a Claim</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Lost Item</Label><select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.lost_item_id} onChange={e => setForm({ ...form, lost_item_id: e.target.value })}><option value="">Select lost item...</option>{lostItems.map((i: any) => <option key={i.id} value={i.id}>{i.item_name}</option>)}</select></div>
              <div><Label>Found Item</Label><select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={form.found_item_id} onChange={e => setForm({ ...form, found_item_id: e.target.value })}><option value="">Select found item...</option>{foundItems.map((i: any) => <option key={i.id} value={i.id}>{i.item_name}</option>)}</select></div>
              <div><Label>Claimant Name *</Label><Input value={form.claimant_name} onChange={e => setForm({ ...form, claimant_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={form.claimant_email} onChange={e => setForm({ ...form, claimant_email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={form.claimant_phone} onChange={e => setForm({ ...form, claimant_phone: e.target.value })} /></div>
              <div><Label>ID Proof Type</Label><Input value={form.id_proof_type} onChange={e => setForm({ ...form, id_proof_type: e.target.value })} /></div>
              <div><Label>ID Proof Number</Label><Input value={form.id_proof_number} onChange={e => setForm({ ...form, id_proof_number: e.target.value })} /></div>
            </div>
            <div><Label>Description *</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <Button onClick={handleCreate}>Submit Claim</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {claims.map((c: any) => {
          const s = CLAIM_STATUSES.find(x => x.value === c.status)
          return (
            <Card key={c.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ShieldCheck className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-sm">{c.claimant_name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s?.color || ""}`}>{s?.label || c.status}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 space-y-1">
                      {c.lost_items && <p>Lost Item: {c.lost_items.item_name}</p>}
                      {c.found_items && <p>Found Item: {c.found_items.item_name}</p>}
                      {c.claimant_email && <p>{c.claimant_email}</p>}
                      {c.claimant_phone && <p>{c.claimant_phone}</p>}
                      <p className="text-gray-600">{c.description}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{new Date(c.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                    {c.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateClaimStatus(c.id, "under_review")}>Review</Button>
                        <Button size="sm" variant="outline" onClick={() => updateClaimStatus(c.id, "approved")}><CheckCircle className="h-4 w-4 mr-1 text-green-600" /> Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => { const r = prompt("Rejection reason:"); if (r) updateClaimStatus(c.id, "rejected", undefined, r) }}><XCircle className="h-4 w-4 mr-1 text-red-600" /> Reject</Button>
                      </>
                    )}
                    {c.status === "approved" && <Button size="sm" variant="outline" onClick={() => updateClaimStatus(c.id, "collected", prompt("Collector name:") || "")}><ClipboardList className="h-4 w-4 mr-1" /> Collect</Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {claims.length === 0 && <p className="text-center text-gray-400 py-8">No claims filed</p>}
      </div>
    </div>
  )
}
