"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getSponsors, upsertSponsor, deleteSponsor } from "@/lib/actions/finance"
import { SPONSORSHIP_TIERS } from "@/config/finance"
import type { Sponsor } from "@/types/finance"
import { Loader2, Plus, Trash2, Edit3, Building2, Globe, Phone, Mail, ExternalLink } from "lucide-react"

export default function SponsorsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ sponsor_name: "", contact_person: "", email: "", phone: "", sponsorship_tier: "", amount: "", website: "", notes: "" })

  const load = useCallback(async () => {
    const res = await getSponsors(festivalId)
    setSponsors(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    if (!form.sponsor_name) { toast.error("Sponsor name required"); return }
    const res = await upsertSponsor({
      id: editId || undefined, festival_id: festivalId, sponsor_name: form.sponsor_name,
      contact_person: form.contact_person || undefined, email: form.email || undefined,
      phone: form.phone || undefined, sponsorship_tier: form.sponsorship_tier || undefined,
      amount: parseFloat(form.amount) || 0, website: form.website || undefined, notes: form.notes || undefined,
    })
    if (res.error) toast.error(res.error); else { toast.success(editId ? "Sponsor updated" : "Sponsor added"); setShowForm(false); setEditId(null); setForm({ sponsor_name: "", contact_person: "", email: "", phone: "", sponsorship_tier: "", amount: "", website: "", notes: "" }); load() }
  }

  const handleEdit = (s: Sponsor) => {
    setEditId(s.id); setForm({ sponsor_name: s.sponsor_name, contact_person: s.contact_person || "", email: s.email || "", phone: s.phone || "", sponsorship_tier: s.sponsorship_tier || "", amount: String(s.amount), website: s.website || "", notes: s.notes || "" }); setShowForm(true)
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sponsors</h1>
          <p className="text-sm text-gray-500 mt-1">Manage festival sponsors and partnerships.</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ sponsor_name: "", contact_person: "", email: "", phone: "", sponsorship_tier: "", amount: "", website: "", notes: "" }) }}>
          <Plus className="h-4 w-4 mr-1" /> Add Sponsor
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input value={form.sponsor_name} onChange={e => setForm(f => ({ ...f, sponsor_name: e.target.value }))} placeholder="Sponsor Name *" />
              <Input value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} placeholder="Contact Person" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" />
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select options={SPONSORSHIP_TIERS.map(t => ({ value: t.value, label: t.label }))} value={form.sponsorship_tier} onChange={e => setForm(f => ({ ...f, sponsorship_tier: e.target.value }))} placeholder="Tier" />
              <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Amount" />
            </div>
            <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="Website" />
            <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes" />
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save Sponsor</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sponsors.length === 0 ? (
          <Card className="sm:col-span-3"><CardContent className="py-12 text-center text-gray-400">No sponsors added</CardContent></Card>
        ) : sponsors.map(s => (
          <Card key={s.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-50"><Building2 className="h-5 w-5 text-indigo-600" /></div>
                  <div>
                    <p className="font-semibold">{s.sponsor_name}</p>
                    {s.sponsorship_tier && <span className={`text-xs px-2 py-0.5 rounded-full ${SPONSORSHIP_TIERS.find(t => t.value === s.sponsorship_tier)?.color || ""}`}>{s.sponsorship_tier}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(s)}><Edit3 className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="sm" onClick={async () => { await deleteSponsor(s.id); load() }}><Trash2 className="h-3 w-3 text-red-400" /></Button>
                </div>
              </div>
              {s.contact_person && <p className="text-sm text-gray-600 mt-2">{s.contact_person}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                {s.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {s.email}</span>}
                {s.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {s.phone}</span>}
              </div>
              {s.website && <a href={s.website} target="_blank" className="flex items-center gap-1 text-xs text-indigo-600 mt-1"><Globe className="h-3 w-3" /> {s.website}</a>}
              <p className="text-lg font-bold mt-2">₹{s.amount.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
