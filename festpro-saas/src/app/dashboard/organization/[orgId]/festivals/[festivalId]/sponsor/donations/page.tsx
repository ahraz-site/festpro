"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getDonations, createDonation } from "@/lib/actions/sponsor-crm"
import { DONATION_METHODS } from "@/config/sponsor-crm"
import { Loader2, Plus, X, DollarSign, CalendarDays, User, Phone, Building2, Wallet } from "lucide-react"

export default function DonationsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterMethod, setFilterMethod] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const [form, setForm] = useState({ donor_name: "", amount: "", payment_method: "cash", payment_date: new Date().toISOString().split("T")[0], donor_phone: "", donor_email: "", purpose: "", collector_id: "", campaign_id: "", pledge_id: "", is_anonymous: false, notes: "" })

  const load = useCallback(async () => {
    const res = await getDonations(festivalId, { payment_method: filterMethod || undefined, date: filterDate || undefined })
    setDonations(res.data || []); setLoading(false)
  }, [festivalId, filterMethod, filterDate])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createDonation({ festival_id: festivalId, ...form, amount: Number(form.amount) })
    setShowForm(false); setForm({ donor_name: "", amount: "", payment_method: "cash", payment_date: new Date().toISOString().split("T")[0], donor_phone: "", donor_email: "", purpose: "", collector_id: "", campaign_id: "", pledge_id: "", is_anonymous: false, notes: "" })
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
          <p className="text-sm text-gray-500 mt-1">{donations.length} donations recorded.</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" /> Record Donation</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Record Donation</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Donor Name *</label><Input value={form.donor_name} onChange={e => setForm(f => ({ ...f, donor_name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Amount *</label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Payment Method</label>
                <Select value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))} options={DONATION_METHODS.map(dm => ({ value: dm.value, label: dm.label }))} />
              </div>
              <div><label className="text-sm font-medium">Date *</label><Input type="date" value={form.payment_date} onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Phone</label><Input value={form.donor_phone} onChange={e => setForm(f => ({ ...f, donor_phone: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Email</label><Input type="email" value={form.donor_email} onChange={e => setForm(f => ({ ...f, donor_email: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Purpose</label><Input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} /></div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={form.is_anonymous} onChange={e => setForm(f => ({ ...f, is_anonymous: e.target.checked }))} /><label className="text-sm font-medium">Anonymous</label></div>
              <div><label className="text-sm font-medium">Collector ID</label><Input value={form.collector_id} onChange={e => setForm(f => ({ ...f, collector_id: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Campaign ID</label><Input value={form.campaign_id} onChange={e => setForm(f => ({ ...f, campaign_id: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Pledge ID</label><Input value={form.pledge_id} onChange={e => setForm(f => ({ ...f, pledge_id: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Notes</label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Record Donation</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 flex-wrap">
        <Select value={filterMethod} onChange={e => setFilterMethod(e.target.value)} placeholder="All Methods" options={[{ value: "", label: "All Methods" }, ...DONATION_METHODS.map(dm => ({ value: dm.value, label: dm.label }))]} className="w-40" />
        <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="w-44" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {donations.map(d => (
          <Card key={d.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{d.donor_name}</p>
                    <p className="text-xs text-gray-500">{d.donation_number}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">₹{d.amount.toLocaleString()}</span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-500">
                <div className="flex items-center gap-1"><Wallet className="h-3.5 w-3.5" /> {DONATION_METHODS.find(dm => dm.value === d.payment_method)?.label || d.payment_method}</div>
                <div className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {d.payment_date}</div>
                {d.donor_phone && <div className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {d.donor_phone}</div>}
                {d.collector && <div className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Collector: {d.collector.name}</div>}
                {d.campaign && <div className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {d.campaign.name}</div>}
              </div>
              <p className={`text-xs mt-1 ${d.receipt_status === "issued" ? "text-green-600" : "text-gray-400"}`}>
                Receipt: {d.receipt_status}
              </p>
            </CardContent>
          </Card>
        ))}
        {donations.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No donations recorded.</p>}
      </div>
    </div>
  )
}
