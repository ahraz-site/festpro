"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getIncome, createIncome } from "@/lib/actions/finance"
import type { Income } from "@/types/finance"
import { Loader2, Plus, TrendingUp, Trash2, Calendar } from "lucide-react"

export default function IncomePage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [items, setItems] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", amount: "", description: "", source: "", is_recurring: false })

  const load = useCallback(async () => {
    const res = await getIncome(festivalId)
    setItems(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.title || !form.amount) { toast.error("Title and amount required"); return }
    const res = await createIncome({
      festival_id: festivalId, title: form.title, amount: parseFloat(form.amount),
      description: form.description || undefined, source: form.source || undefined, is_recurring: form.is_recurring,
    })
    if (res.error) toast.error(res.error); else { toast.success("Income recorded"); setShowForm(false); setForm({ title: "", amount: "", description: "", source: "", is_recurring: false }); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const total = items.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Income</h1>
          <p className="text-sm text-gray-500 mt-1">Total Income: ₹{total.toLocaleString()} · {items.length} records</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Record Income</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Income Title *" />
              <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Amount *" />
            </div>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
            <Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="Source (e.g. Registration Fee, Sponsorship)" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_recurring} onChange={e => setForm(f => ({ ...f, is_recurring: e.target.checked }))} />
              Recurring income
            </label>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Record</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {items.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-400">No income recorded</CardContent></Card>
        ) : items.map(i => (
          <Card key={i.id}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-50"><TrendingUp className="h-5 w-5 text-green-600" /></div>
                  <div>
                    <p className="font-semibold">{i.title}</p>
                    <p className="text-xs text-gray-400">{i.source || "—"} · {new Date(i.income_date).toLocaleDateString()} {i.is_recurring ? "· Recurring" : ""}</p>
                    {i.description && <p className="text-xs text-gray-400 mt-0.5">{i.description}</p>}
                  </div>
                </div>
                <p className="font-bold text-lg text-green-600">+₹{i.amount.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
