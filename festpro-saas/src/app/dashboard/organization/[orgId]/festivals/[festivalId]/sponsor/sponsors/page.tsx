"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { getSponsors, upsertSponsor, deleteSponsor, updateSponsorStatus } from "@/lib/actions/sponsor-crm"
import { SPONSOR_CATEGORIES, SPONSOR_STATUSES } from "@/config/sponsor-crm"
import { Loader2, Plus, Pencil, Trash2, X, Building2, Globe, Phone, Mail, ExternalLink, DollarSign } from "lucide-react"

export default function SponsorsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [sponsors, setSponsors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("")
  const [form, setForm] = useState({ company_name: "", contact_person: "", email: "", phone: "", website: "", address: "", tax_id: "", gst_number: "", sponsorship_amount: "", notes: "" })

  const load = useCallback(async () => {
    const res = await getSponsors(festivalId, { status: filterStatus || undefined })
    setSponsors(res.data || []); setLoading(false)
  }, [festivalId, filterStatus])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsertSponsor({ id: editingId || undefined, festival_id: festivalId, ...form, sponsorship_amount: form.sponsorship_amount ? Number(form.sponsorship_amount) : 0 })
    setShowForm(false); setEditingId(null); setForm({ company_name: "", contact_person: "", email: "", phone: "", website: "", address: "", tax_id: "", gst_number: "", sponsorship_amount: "", notes: "" })
    load()
  }

  const handleEdit = (s: any) => {
    setForm({ company_name: s.company_name, contact_person: s.contact_person, email: s.email || "", phone: s.phone || "", website: s.website || "", address: s.address || "", tax_id: s.tax_id || "", gst_number: s.gst_number || "", sponsorship_amount: s.sponsorship_amount?.toString() || "", notes: s.notes || "" })
    setEditingId(s.id); setShowForm(true)
  }

  const handleDelete = async (id: string) => { if (!confirm("Delete this sponsor?")) return; await deleteSponsor(id); load() }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sponsors</h1>
          <p className="text-sm text-gray-500 mt-1">{sponsors.length} sponsors.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ company_name: "", contact_person: "", email: "", phone: "", website: "", address: "", tax_id: "", gst_number: "", sponsorship_amount: "", notes: "" }); setShowForm(true) }}><Plus className="h-4 w-4 mr-1" /> Add Sponsor</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Sponsor" : "New Sponsor"}</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null) }}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Company Name *</label><Input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Contact Person *</label><Input value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Email</label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Phone</label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Website</label><Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Sponsorship Amount</label><Input type="number" value={form.sponsorship_amount} onChange={e => setForm(f => ({ ...f, sponsorship_amount: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Tax ID</label><Input value={form.tax_id} onChange={e => setForm(f => ({ ...f, tax_id: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">GST Number</label><Input value={form.gst_number} onChange={e => setForm(f => ({ ...f, gst_number: e.target.value }))} /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium">Address</label><Textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium">Notes</label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} placeholder="All Statuses" options={[{ value: "", label: "All Statuses" }, ...SPONSOR_STATUSES.map(s => ({ value: s.value, label: s.label }))]} className="w-44" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sponsors.map(s => (
          <Card key={s.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{s.company_name}</p>
                    <p className="text-xs text-gray-500">{s.contact_person}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                </div>
              </div>
              <div className="mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${SPONSOR_STATUSES.find(st => st.value === s.agreement_status)?.color || "bg-gray-100"}`}>
                  {SPONSOR_STATUSES.find(st => st.value === s.agreement_status)?.label || s.agreement_status}
                </span>
                {s.category && <span className={`text-xs px-2 py-0.5 rounded-full ml-1 ${SPONSOR_CATEGORIES.find(sc => sc.value === s.category.category)?.color || "bg-gray-100"}`}>{s.category.name}</span>}
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-500">
                {s.email && <div className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {s.email}</div>}
                {s.phone && <div className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {s.phone}</div>}
                {s.website && <div className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> {s.website}</div>}
                {s.sponsorship_amount > 0 && <div className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> ₹{s.sponsorship_amount.toLocaleString()}</div>}
              </div>
              {s.agreement_status !== "active" && s.agreement_status !== "completed" && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={async () => { await updateSponsorStatus(s.id, "active"); load() }}>Activate</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {sponsors.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No sponsors added.</p>}
      </div>
    </div>
  )
}
