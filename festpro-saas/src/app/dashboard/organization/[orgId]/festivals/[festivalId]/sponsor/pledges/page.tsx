"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getPledges, createPledge, updatePledgeStatus } from "@/lib/actions/sponsor-crm"
import { PLEDGE_STATUSES } from "@/config/sponsor-crm"
import type { Pledge } from "@/types/sponsor-crm"
import { Loader2, Plus, X, PiggyBank, CalendarDays, User, DollarSign, TrendingUp } from "lucide-react"

export default function PledgesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [pledges, setPledges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState("")
  const [form, setForm] = useState({ donor_name: "", amount: "", due_date: "", installments: "1", purpose: "", notes: "" })

  const load = useCallback(async () => {
    const res = await getPledges(festivalId, { status: filterStatus || undefined })
    setPledges(res.data || []); setLoading(false)
  }, [festivalId, filterStatus])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createPledge({ festival_id: festivalId, amount: Number(form.amount), due_date: form.due_date || undefined, installments: Number(form.installments), purpose: form.purpose || undefined, notes: form.notes || undefined })
    setShowForm(false); setForm({ donor_name: "", amount: "", due_date: "", installments: "1", purpose: "", notes: "" })
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pledges</h1>
          <p className="text-sm text-gray-500 mt-1">{pledges.length} pledges.</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" /> New Pledge</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create Pledge</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Amount *</label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Due Date</label><Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Installments</label>
                <Select value={form.installments} onChange={e => setForm(f => ({ ...f, installments: e.target.value }))} options={[{ value: "1", label: "1 (One-time)" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }, { value: "6", label: "6" }, { value: "12", label: "12" }]} />
              </div>
              <div><label className="text-sm font-medium">Purpose</label><Input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium">Notes</label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Create Pledge</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} placeholder="All Statuses" options={[{ value: "", label: "All Statuses" }, ...PLEDGE_STATUSES.map(ps => ({ value: ps.value, label: ps.label }))]} className="w-44" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pledges.map(p => (
          <Card key={p.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <PiggyBank className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{p.donor?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-500">{p.pledge_number}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${PLEDGE_STATUSES.find(ps => ps.value === p.status)?.color || "bg-gray-100"}`}>
                  {PLEDGE_STATUSES.find(ps => ps.value === p.status)?.label || p.status}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-lg font-bold text-gray-900"><DollarSign className="h-4 w-4" /> {p.amount.toLocaleString()}</div>
                <div className="text-right text-sm">
                  <p className="text-green-600">Paid: ₹{p.amount_paid.toLocaleString()}</p>
                  <p className="text-amber-600">Balance: ₹{p.balance.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-green-500" style={{ width: `${p.amount > 0 ? Math.min((p.amount_paid / p.amount) * 100, 100) : 0}%` }} />
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                {p.due_date && <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Due: {p.due_date}</div>}
                {p.collector && <div className="flex items-center gap-1"><User className="h-3 w-3" /> Collector: {p.collector.name}</div>}
                {p.purpose && <div className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {p.purpose}</div>}
              </div>
              {p.status === "pending" && (
                <div className="mt-3">
                  <Button size="sm" variant="outline" className="text-green-600" onClick={async () => { await updatePledgeStatus(p.id, "completed"); load() }}>Mark Completed</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {pledges.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No pledges created.</p>}
      </div>
    </div>
  )
}
