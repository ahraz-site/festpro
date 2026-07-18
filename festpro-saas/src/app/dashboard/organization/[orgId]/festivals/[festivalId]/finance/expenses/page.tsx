"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getExpenses, createExpense, updateExpenseStatus, deleteExpense, getExpenseCategories } from "@/lib/actions/finance"
import { EXPENSE_STATUSES } from "@/config/finance"
import type { Expense, ExpenseCategory } from "@/types/finance"
import { Loader2, Plus, Trash2, CheckCircle, DollarSign, Filter, Receipt, XCircle } from "lucide-react"

export default function ExpensesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [form, setForm] = useState({ title: "", amount: "", category_id: "", description: "", vendor_name: "", vendor_contact: "", invoice_number: "" })

  const load = useCallback(async () => {
    const [eRes, cRes] = await Promise.all([getExpenses(festivalId, { category_id: categoryFilter || undefined, status: statusFilter || undefined }), getExpenseCategories()])
    setExpenses(eRes.data || []); setCategories(cRes.data || []); setLoading(false)
  }, [festivalId, categoryFilter, statusFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.title || !form.amount) { toast.error("Title and amount required"); return }
    const res = await createExpense({
      festival_id: festivalId, title: form.title, amount: parseFloat(form.amount),
      category_id: form.category_id || undefined, description: form.description || undefined,
      vendor_name: form.vendor_name || undefined, vendor_contact: form.vendor_contact || undefined,
      invoice_number: form.invoice_number || undefined,
    })
    if (res.error) toast.error(res.error); else { toast.success("Expense created"); setShowForm(false); setForm({ title: "", amount: "", category_id: "", description: "", vendor_name: "", vendor_contact: "", invoice_number: "" }); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0)
  const statusColors: Record<string, string> = { draft: "bg-gray-100 text-gray-600", approved: "bg-blue-100 text-blue-700", paid: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700" }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">Total: ₹{totalAmount.toLocaleString()} across {expenses.length} expenses</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Add Expense</Button>
      </div>

      <Card>
        <CardContent className="pt-4 flex gap-2">
          <Select options={[{ value: "", label: "All Categories" }, ...categories.map(c => ({ value: c.id, label: c.name }))]} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-48" />
          <Select options={[{ value: "", label: "All Status" }, ...EXPENSE_STATUSES.map(s => ({ value: s.value, label: s.label }))]} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40" />
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Expense Title *" />
              <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Amount *" />
            </div>
            <Select options={categories.map(c => ({ value: c.id, label: c.name }))} value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} placeholder="Category" />
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
            <div className="grid grid-cols-3 gap-2">
              <Input value={form.vendor_name} onChange={e => setForm(f => ({ ...f, vendor_name: e.target.value }))} placeholder="Vendor" />
              <Input value={form.vendor_contact} onChange={e => setForm(f => ({ ...f, vendor_contact: e.target.value }))} placeholder="Contact" />
              <Input value={form.invoice_number} onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))} placeholder="Invoice #" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create Expense</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {expenses.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-400">No expenses recorded</CardContent></Card>
        ) : expenses.map(e => (
          <Card key={e.id}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Receipt className="h-8 w-8 p-1.5 rounded-lg bg-red-50 text-red-500" />
                  <div>
                    <p className="font-semibold">{e.title}</p>
                    <p className="text-xs text-gray-400">{e.category?.name || "Uncategorized"} · {e.vendor_name || "—"} · {new Date(e.expense_date).toLocaleDateString()}</p>
                    {e.description && <p className="text-xs text-gray-400 mt-0.5">{e.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{e.amount.toLocaleString()}</p>
                    {e.invoice_number && <p className="text-xs text-gray-400">Inv: {e.invoice_number}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${EXPENSE_STATUSES.find(s => s.value === e.status)?.color || ""}`}>{e.status}</span>
                  <div className="flex gap-1">
                    {e.status === "draft" && (
                      <>
                        <Button size="sm" variant="ghost" onClick={async () => { await updateExpenseStatus(e.id, "approved"); load() }}><CheckCircle className="h-3 w-3 text-blue-500" /></Button>
                        <Button size="sm" variant="ghost" onClick={async () => { await updateExpenseStatus(e.id, "cancelled"); load() }}><XCircle className="h-3 w-3 text-red-500" /></Button>
                      </>
                    )}
                    {e.status === "approved" && (
                      <Button size="sm" variant="ghost" onClick={async () => { await updateExpenseStatus(e.id, "paid"); load() }}><DollarSign className="h-3 w-3 text-green-500" /></Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={async () => { await deleteExpense(e.id); load() }}><Trash2 className="h-3 w-3 text-red-400" /></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
