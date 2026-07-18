"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getIdCards, createIdCard, updateIdCardStatus } from "@/lib/actions/id-card"
import { ID_CARD_TYPES, CARD_STATUSES } from "@/config/id-card"
import type { IdCard } from "@/types/id-card"
import { Loader2, Plus, X, IdCard as IdCardIcon, CalendarDays, User, Shield, Search } from "lucide-react"

export default function IdCardsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [cards, setCards] = useState<IdCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterType, setFilterType] = useState("")
  const [form, setForm] = useState({ card_type: "participant", first_name: "", last_name: "", chest_number: "", registration_number: "", role_title: "", unit: "", division: "", sector: "", emergency_contact_name: "", emergency_contact_phone: "", blood_group: "", organization_name: "", validity_start: "", validity_end: "" })

  const load = useCallback(async () => {
    const res = await getIdCards(festivalId, { status: filterStatus || undefined, card_type: filterType || undefined, search: search || undefined })
    setCards(res.data || []); setLoading(false)
  }, [festivalId, filterStatus, filterType, search])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createIdCard({ festival_id: festivalId, ...form })
    setShowForm(false); setForm({ card_type: "participant", first_name: "", last_name: "", chest_number: "", registration_number: "", role_title: "", unit: "", division: "", sector: "", emergency_contact_name: "", emergency_contact_phone: "", blood_group: "", organization_name: "", validity_start: "", validity_end: "" })
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ID Cards</h1>
          <p className="text-sm text-gray-500 mt-1">{cards.length} cards issued.</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" /> Issue ID Card</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Issue New ID Card</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
              <div><label className="text-sm font-medium">Card Type *</label>
                <Select value={form.card_type} onChange={e => setForm(f => ({ ...f, card_type: e.target.value }))} options={ID_CARD_TYPES.map(ct => ({ value: ct.value, label: ct.label }))} />
              </div>
              <div><label className="text-sm font-medium">First Name *</label><Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Last Name *</label><Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Chest Number</label><Input value={form.chest_number} onChange={e => setForm(f => ({ ...f, chest_number: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Registration No.</label><Input value={form.registration_number} onChange={e => setForm(f => ({ ...f, registration_number: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Role Title</label><Input value={form.role_title} onChange={e => setForm(f => ({ ...f, role_title: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Unit</label><Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Division</label><Input value={form.division} onChange={e => setForm(f => ({ ...f, division: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Sector</label><Input value={form.sector} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Blood Group</label><Input value={form.blood_group} onChange={e => setForm(f => ({ ...f, blood_group: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Emergency Contact</label><Input value={form.emergency_contact_name} onChange={e => setForm(f => ({ ...f, emergency_contact_name: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Emergency Phone</label><Input value={form.emergency_contact_phone} onChange={e => setForm(f => ({ ...f, emergency_contact_phone: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Organization</label><Input value={form.organization_name} onChange={e => setForm(f => ({ ...f, organization_name: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Valid From *</label><Input type="date" value={form.validity_start} onChange={e => setForm(f => ({ ...f, validity_start: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Valid Until *</label><Input type="date" value={form.validity_end} onChange={e => setForm(f => ({ ...f, validity_end: e.target.value }))} required /></div>
              <div className="sm:col-span-3 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Issue Card</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-9" placeholder="Search by name or card number..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} placeholder="All Statuses" options={[{ value: "", label: "All Statuses" }, ...CARD_STATUSES.map(cs => ({ value: cs.value, label: cs.label }))]} className="w-40" />
        <Select value={filterType} onChange={e => setFilterType(e.target.value)} placeholder="All Types" options={[{ value: "", label: "All Types" }, ...ID_CARD_TYPES.map(ct => ({ value: ct.value, label: ct.label }))]} className="w-44" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(c => (
          <Card key={c.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <IdCardIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{c.first_name} {c.last_name}</p>
                    <p className="text-xs text-gray-500">{c.card_number}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${CARD_STATUSES.find(cs => cs.value === c.status)?.color || "bg-gray-100"}`}>
                  {CARD_STATUSES.find(cs => cs.value === c.status)?.label || c.status}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1"><User className="h-3 w-3" /> {ID_CARD_TYPES.find(ct => ct.value === c.card_type)?.label || c.card_type}</div>
                {c.chest_number && <div className="flex items-center gap-1"><Shield className="h-3 w-3" /> Chest: {c.chest_number}</div>}
                <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {c.validity_start} - {c.validity_end}</div>
              </div>
              {c.status === "active" && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="text-red-500" onClick={async () => { await updateIdCardStatus(c.id, "revoked", "Manual revoke"); load() }}>Revoke</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {cards.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No ID cards issued.</p>}
      </div>
    </div>
  )
}
