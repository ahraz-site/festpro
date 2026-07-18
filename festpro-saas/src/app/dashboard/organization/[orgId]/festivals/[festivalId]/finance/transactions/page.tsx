"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getTransactions, createTransaction, updateTransactionStatus } from "@/lib/actions/finance"
import { getAccounts, getTransactionCategories, getPaymentMethods } from "@/lib/actions/finance"
import { TRANSACTION_TYPES, PAYMENT_STATUSES } from "@/config/finance"
import type { Transaction, FinanceAccount, TransactionCategory, PaymentMethod } from "@/types/finance"
import { Loader2, Plus, ArrowUpRight, ArrowDownRight, Filter, CheckCircle, XCircle } from "lucide-react"

export default function TransactionsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [txns, setTxns] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<FinanceAccount[]>([])
  const [categories, setCategories] = useState<TransactionCategory[]>([])
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [form, setForm] = useState({ transaction_type: "credit", amount: "", description: "", account_id: "", category_id: "", payment_method_id: "", reference_number: "" })

  const load = useCallback(async () => {
    const [tRes, aRes, cRes, mRes] = await Promise.all([
      getTransactions(festivalId, { type: typeFilter || undefined, status: statusFilter || undefined }),
      getAccounts(), getTransactionCategories(), getPaymentMethods(),
    ])
    setTxns(tRes.data || []); setAccounts(aRes.data || []); setCategories(cRes.data || []); setMethods(mRes.data || []); setLoading(false)
  }, [festivalId, typeFilter, statusFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.amount) { toast.error("Enter amount"); return }
    const res = await createTransaction({
      festival_id: festivalId, transaction_type: form.transaction_type, amount: parseFloat(form.amount),
      description: form.description || undefined, account_id: form.account_id || undefined,
      category_id: form.category_id || undefined, payment_method_id: form.payment_method_id || undefined,
      reference_number: form.reference_number || undefined,
    })
    if (res.error) toast.error(res.error); else { toast.success("Transaction created"); setShowForm(false); setForm({ transaction_type: "credit", amount: "", description: "", account_id: "", category_id: "", payment_method_id: "", reference_number: "" }); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">All financial transactions across the festival.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> New Transaction</Button>
      </div>

      <Card>
        <CardContent className="pt-4 flex gap-2">
          <Select options={[{ value: "", label: "All Types" }, ...TRANSACTION_TYPES.map(t => ({ value: t.value, label: t.label }))]} value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-40" />
          <Select options={[{ value: "", label: "All Status" }, ...PAYMENT_STATUSES.map(s => ({ value: s.value, label: s.label }))]} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40" />
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Select options={TRANSACTION_TYPES.map(t => ({ value: t.value, label: t.label }))} value={form.transaction_type} onChange={e => setForm(f => ({ ...f, transaction_type: e.target.value }))} />
            <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="Amount" />
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
            <div className="grid grid-cols-2 gap-2">
              <Select options={accounts.map(a => ({ value: a.id, label: `${a.account_code} - ${a.account_name}` }))} value={form.account_id} onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))} placeholder="Account" />
              <Select options={categories.map(c => ({ value: c.id, label: c.name }))} value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} placeholder="Category" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select options={methods.map(m => ({ value: m.id, label: m.method_name }))} value={form.payment_method_id} onChange={e => setForm(f => ({ ...f, payment_method_id: e.target.value }))} placeholder="Payment Method" />
              <Input value={form.reference_number} onChange={e => setForm(f => ({ ...f, reference_number: e.target.value }))} placeholder="Reference #" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {txns.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No transactions found</p>
          ) : (
            <div className="divide-y">
              {txns.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${t.transaction_type === "credit" ? "bg-green-50" : "bg-red-50"}`}>
                      {t.transaction_type === "credit" ? <ArrowUpRight className="h-4 w-4 text-green-600" /> : <ArrowDownRight className="h-4 w-4 text-red-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{t.description || "No description"}</p>
                      <p className="text-xs text-gray-400">{t.account?.account_name || "—"} · {t.category?.name || "—"} · {new Date(t.transaction_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${t.transaction_type === "credit" ? "text-green-600" : "text-red-600"}`}>
                      {t.transaction_type === "credit" ? "+" : "-"}₹{t.amount.toLocaleString()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${PAYMENT_STATUSES.find(s => s.value === t.status)?.color || ""}`}>{t.status}</span>
                    {t.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={async () => { await updateTransactionStatus(t.id, "completed"); load() }}><CheckCircle className="h-3 w-3 text-green-500" /></Button>
                        <Button size="sm" variant="ghost" onClick={async () => { await updateTransactionStatus(t.id, "failed"); load() }}><XCircle className="h-3 w-3 text-red-500" /></Button>
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
