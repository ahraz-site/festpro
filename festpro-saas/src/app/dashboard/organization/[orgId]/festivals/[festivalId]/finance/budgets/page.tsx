"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getBudgets, upsertBudget, updateBudgetStatus, getExpenseCategories } from "@/lib/actions/finance"
import { BUDGET_STATUSES } from "@/config/finance"
import type { Budget, ExpenseCategory } from "@/types/finance"
import { Loader2, Plus, Edit3, DollarSign, CheckCircle, XCircle, PieChart } from "lucide-react"

export default function BudgetsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("")
  const [form, setForm] = useState({ name: "", description: "", category_id: "", allocated_amount: "", start_date: "", end_date: "" })

  const load = useCallback(async () => {
    const [bRes, cRes] = await Promise.all([getBudgets(festivalId, { status: statusFilter || undefined }), getExpenseCategories()])
    setBudgets(bRes.data || []); setCategories(cRes.data || []); setLoading(false)
  }, [festivalId, statusFilter])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    if (!form.name || !form.allocated_amount) { toast.error("Name and amount required"); return }
    const res = await upsertBudget({
      id: editId || undefined, festival_id: festivalId, name: form.name,
      description: form.description || undefined, category_id: form.category_id || undefined,
      allocated_amount: parseFloat(form.allocated_amount),
      start_date: form.start_date || undefined, end_date: form.end_date || undefined,
    })
    if (res.error) toast.error(res.error); else { toast.success(editId ? "Budget updated" : "Budget created"); setShowForm(false); setEditId(null); setForm({ name: "", description: "", category_id: "", allocated_amount: "", start_date: "", end_date: "" }); load() }
  }

  const handleEdit = (b: Budget) => {
    setEditId(b.id); setForm({ name: b.name, description: b.description || "", category_id: b.category_id || "", allocated_amount: String(b.allocated_amount), start_date: b.start_date || "", end_date: b.end_date || "" }); setShowForm(true)
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-sm text-gray-500 mt-1">Plan and track festival budgets by category.</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: "", description: "", category_id: "", allocated_amount: "", start_date: "", end_date: "" }) }}>
          <Plus className="h-4 w-4 mr-1" /> Create Budget
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <Select options={[{ value: "", label: "All Status" }, ...BUDGET_STATUSES.map(s => ({ value: s.value, label: s.label }))]} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40" />
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Budget Name *" />
              <Input type="number" value={form.allocated_amount} onChange={e => setForm(f => ({ ...f, allocated_amount: e.target.value }))} placeholder="Allocated Amount *" />
            </div>
            <Select options={categories.map(c => ({ value: c.id, label: c.name }))} value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} placeholder="Category" />
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} placeholder="Start Date" />
              <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} placeholder="End Date" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}><DollarSign className="h-4 w-4 mr-1" /> Save Budget</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {budgets.length === 0 ? (
          <Card className="sm:col-span-2"><CardContent className="py-12 text-center text-gray-400">No budgets created</CardContent></Card>
        ) : budgets.map(b => {
          const pct = b.allocated_amount > 0 ? Math.round((b.spent_amount / b.allocated_amount) * 100) : 0
          return (
            <Card key={b.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{b.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${BUDGET_STATUSES.find(s => s.value === b.status)?.color || ""}`}>{b.status}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{b.category?.name || "All Categories"}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(b)}><Edit3 className="h-3 w-3" /></Button>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Allocated: <strong>₹{b.allocated_amount.toLocaleString()}</strong></span>
                    <span>Spent: <strong>₹{b.spent_amount.toLocaleString()}</strong></span>
                    <span className={pct > 100 ? "text-red-600 font-bold" : "text-green-600"}>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${pct > 100 ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-green-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
                {b.status === "active" && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={async () => { await updateBudgetStatus(b.id, "closed"); load() }}><CheckCircle className="h-3 w-3 mr-1" /> Close</Button>
                    <Button size="sm" variant="outline" className="text-red-600" onClick={async () => { await updateBudgetStatus(b.id, "cancelled"); load() }}><XCircle className="h-3 w-3 mr-1" /> Cancel</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
