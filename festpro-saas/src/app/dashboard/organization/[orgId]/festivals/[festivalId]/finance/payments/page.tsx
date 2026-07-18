"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getRegistrationPayments, createRegistrationPayment, updatePaymentStatus } from "@/lib/actions/finance"
import { getPaymentMethods } from "@/lib/actions/finance"
import { PAYMENT_STATUSES } from "@/config/finance"
import { Loader2, Plus, CheckCircle, XCircle, RefreshCw, Search, User } from "lucide-react"

export default function PaymentsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [payments, setPayments] = useState<any[]>([])
  const [methods, setMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState("")
  const [search, setSearch] = useState("")
  const [form, setForm] = useState({ participant_id: "", amount: "", discount_amount: "0", scholarship_amount: "0", payment_method_id: "", notes: "" })

  const load = useCallback(async () => {
    const [pRes, mRes] = await Promise.all([getRegistrationPayments(festivalId, { status: statusFilter || undefined }), getPaymentMethods()])
    setPayments(pRes.data || []); setMethods(mRes.data || []); setLoading(false)
  }, [festivalId, statusFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.participant_id || !form.amount) { toast.error("Participant and amount required"); return }
    const res = await createRegistrationPayment({
      festival_id: festivalId, participant_id: form.participant_id, amount: parseFloat(form.amount),
      discount_amount: parseFloat(form.discount_amount) || 0, scholarship_amount: parseFloat(form.scholarship_amount) || 0,
      payment_method_id: form.payment_method_id || undefined, notes: form.notes || undefined,
    })
    if (res.error) toast.error(res.error); else { toast.success("Payment recorded"); setShowForm(false); load() }
  }

  const filtered = payments.filter(p => !search || p.participant?.first_name?.toLowerCase().includes(search.toLowerCase()) || p.participant?.last_name?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registration Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Track participant registration fees, discounts, and scholarships.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Record Payment</Button>
      </div>

      <Card>
        <CardContent className="pt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by participant name..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm" />
          </div>
          <Select options={[{ value: "", label: "All Status" }, ...PAYMENT_STATUSES.map(s => ({ value: s.value, label: s.label }))]} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40" />
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Input value={form.participant_id} onChange={e => setForm(f => ({ ...f, participant_id: e.target.value }))} placeholder="Participant ID" />
            <div className="grid grid-cols-3 gap-2">
              <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Amount" />
              <Input type="number" value={form.discount_amount} onChange={e => setForm(f => ({ ...f, discount_amount: e.target.value }))} placeholder="Discount" />
              <Input type="number" value={form.scholarship_amount} onChange={e => setForm(f => ({ ...f, scholarship_amount: e.target.value }))} placeholder="Scholarship" />
            </div>
            <Select options={methods.map(m => ({ value: m.id, label: m.method_name }))} value={form.payment_method_id} onChange={e => setForm(f => ({ ...f, payment_method_id: e.target.value }))} placeholder="Payment Method" />
            <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes" />
            <Button onClick={handleCreate}>Record Payment</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No payments found</p>
          ) : (
            <div className="divide-y">
              {filtered.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 p-1.5 rounded-full bg-indigo-50 text-indigo-600" />
                    <div>
                      <p className="font-medium">{p.participant?.first_name} {p.participant?.last_name}</p>
                      <p className="text-xs text-gray-400">{p.participant?.participant_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">₹{p.net_amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{p.discount_amount > 0 || p.scholarship_amount > 0 ? `Discount: ₹${p.discount_amount} Scholarship: ₹${p.scholarship_amount}` : "No discounts"}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${PAYMENT_STATUSES.find(s => s.value === p.status)?.color || ""}`}>{p.status}</span>
                    {p.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={async () => { await updatePaymentStatus(p.id, "completed"); load() }}><CheckCircle className="h-3 w-3 text-green-500" /></Button>
                        <Button size="sm" variant="ghost" onClick={async () => { await updatePaymentStatus(p.id, "cancelled"); load() }}><XCircle className="h-3 w-3 text-red-500" /></Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
