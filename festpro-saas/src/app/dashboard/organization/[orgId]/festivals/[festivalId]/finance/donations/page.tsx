"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getDonations, createDonation, getPaymentMethods } from "@/lib/actions/finance"
import { PAYMENT_STATUSES } from "@/config/finance"
import type { Donation } from "@/types/finance"
import { Loader2, Plus, Gift, Heart, Eye, EyeOff } from "lucide-react"

export default function DonationsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [donations, setDonations] = useState<Donation[]>([])
  const [methods, setMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ donor_name: "", donor_email: "", donor_phone: "", amount: "", message: "", is_anonymous: false, payment_method_id: "" })

  const load = useCallback(async () => {
    const [dRes, mRes] = await Promise.all([getDonations(festivalId), getPaymentMethods()])
    setDonations(dRes.data || []); setMethods(mRes.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.donor_name || !form.amount) { toast.error("Donor name and amount required"); return }
    const res = await createDonation({
      festival_id: festivalId, donor_name: form.donor_name, donor_email: form.donor_email || undefined,
      donor_phone: form.donor_phone || undefined, amount: parseFloat(form.amount),
      message: form.message || undefined, is_anonymous: form.is_anonymous,
      payment_method_id: form.payment_method_id || undefined,
    })
    if (res.error) toast.error(res.error); else { toast.success("Donation recorded"); setShowForm(false); setForm({ donor_name: "", donor_email: "", donor_phone: "", amount: "", message: "", is_anonymous: false, payment_method_id: "" }); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const total = donations.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
          <p className="text-sm text-gray-500 mt-1">Total: ₹{total.toLocaleString()} · {donations.length} donations</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Record Donation</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input value={form.donor_name} onChange={e => setForm(f => ({ ...f, donor_name: e.target.value }))} placeholder="Donor Name *" />
              <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Amount *" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={form.donor_email} onChange={e => setForm(f => ({ ...f, donor_email: e.target.value }))} placeholder="Email" />
              <Input value={form.donor_phone} onChange={e => setForm(f => ({ ...f, donor_phone: e.target.value }))} placeholder="Phone" />
            </div>
            <Select options={methods.map(m => ({ value: m.id, label: m.method_name }))} value={form.payment_method_id} onChange={e => setForm(f => ({ ...f, payment_method_id: e.target.value }))} placeholder="Payment Method" />
            <Input value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Message" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm(f => ({ ...f, is_anonymous: e.target.checked }))} />
              Hide donor name (anonymous donation)
            </label>
            <div className="flex gap-2">
              <Button onClick={handleCreate}><Heart className="h-4 w-4 mr-1" /> Record Donation</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {donations.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-400">No donations received</CardContent></Card>
        ) : donations.map(d => (
          <Card key={d.id}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-pink-50"><Gift className="h-5 w-5 text-pink-500" /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{d.is_anonymous ? "Anonymous Donor" : d.donor_name}</p>
                      {d.is_anonymous && <EyeOff className="h-3 w-3 text-gray-400" />}
                    </div>
                    <p className="text-xs text-gray-400">{d.donor_email || "—"} · {new Date(d.created_at).toLocaleDateString()}</p>
                    {d.message && <p className="text-xs text-gray-500 mt-0.5 italic">"{d.message}"</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">+₹{d.amount.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${PAYMENT_STATUSES.find(s => s.value === d.status)?.color || ""}`}>{d.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
