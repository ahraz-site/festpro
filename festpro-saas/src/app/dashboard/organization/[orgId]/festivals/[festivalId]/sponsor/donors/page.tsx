"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getDonors, upsertDonor, deleteDonor } from "@/lib/actions/sponsor-crm"
import { DONOR_TYPES } from "@/config/sponsor-crm"
import { Loader2, Plus, Pencil, Trash2, X, Users, Phone, Mail, MapPin, DollarSign, Search } from "lucide-react"

export default function DonorsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [donors, setDonors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("")
  const [form, setForm] = useState({ name: "", donor_type: "individual", email: "", phone: "", address: "", city: "", state: "", occupation: "", company_name: "", notes: "" })

  const load = useCallback(async () => {
    const res = await getDonors(festivalId, { type: filterType || undefined, search: search || undefined })
    setDonors(res.data || []); setLoading(false)
  }, [festivalId, filterType, search])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsertDonor({ id: editingId || undefined, festival_id: festivalId, ...form })
    setShowForm(false); setEditingId(null); setForm({ name: "", donor_type: "individual", email: "", phone: "", address: "", city: "", state: "", occupation: "", company_name: "", notes: "" })
    load()
  }

  const handleEdit = (d: any) => {
    setForm({ name: d.name, donor_type: d.donor_type, email: d.email || "", phone: d.phone || "", address: d.address || "", city: d.city || "", state: d.state || "", occupation: d.occupation || "", company_name: d.company_name || "", notes: d.notes || "" })
    setEditingId(d.id); setShowForm(true)
  }

  const handleDelete = async (id: string) => { if (!confirm("Delete this donor?")) return; await deleteDonor(id); load() }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donors</h1>
          <p className="text-sm text-gray-500 mt-1">{donors.length} donors.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ name: "", donor_type: "individual", email: "", phone: "", address: "", city: "", state: "", occupation: "", company_name: "", notes: "" }); setShowForm(true) }}><Plus className="h-4 w-4 mr-1" /> Add Donor</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Donor" : "New Donor"}</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null) }}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Name *</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Type</label>
                <Select value={form.donor_type} onChange={e => setForm(f => ({ ...f, donor_type: e.target.value }))} options={DONOR_TYPES.map(dt => ({ value: dt.value, label: dt.label }))} />
              </div>
              <div><label className="text-sm font-medium">Email</label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Phone</label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Address</label><Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">City</label><Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">State</label><Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Occupation</label><Input value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Company</label><Input value={form.company_name} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Notes</label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-9" placeholder="Search donors..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onChange={e => setFilterType(e.target.value)} placeholder="All Types" options={[{ value: "", label: "All Types" }, ...DONOR_TYPES.map(dt => ({ value: dt.value, label: dt.label }))]} className="w-40" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {donors.map(d => (
          <Card key={d.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{d.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${DONOR_TYPES.find(dt => dt.value === d.donor_type)?.color || "bg-gray-100"}`}>
                      {DONOR_TYPES.find(dt => dt.value === d.donor_type)?.label || d.donor_type}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-500">
                {d.phone && <div className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {d.phone}</div>}
                {d.email && <div className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {d.email}</div>}
                {d.city && <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {d.city}{d.state ? `, ${d.state}` : ""}</div>}
                {d.total_donated > 0 && <div className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> ₹{d.total_donated.toLocaleString()}</div>}
                {d.last_donation_date && <p className="text-xs text-gray-400">Last: {d.last_donation_date}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
        {donors.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No donors found.</p>}
      </div>
    </div>
  )
}
