"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getAccounts, upsertAccount, deleteAccount } from "@/lib/actions/finance"
import { ACCOUNT_TYPES, ACCOUNT_TYPE_COLORS } from "@/config/finance"
import type { FinanceAccount } from "@/types/finance"
import { Loader2, Plus, Trash2, Save, Edit3, Building2 } from "lucide-react"

export default function AccountsPage() {
  const params = useParams()
  const [accounts, setAccounts] = useState<FinanceAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ account_code: "", account_name: "", account_type: "income", description: "", opening_balance: "0" })

  const load = useCallback(async () => {
    const res = await getAccounts()
    setAccounts(res.data || []); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async () => {
    const res = await upsertAccount({
      id: editId || undefined, account_code: form.account_code, account_name: form.account_name,
      account_type: form.account_type as any, description: form.description || null,
      opening_balance: parseFloat(form.opening_balance) || 0,
    })
    if (res.error) toast.error(res.error); else { toast.success(editId ? "Account updated" : "Account created"); setShowForm(false); setEditId(null); setForm({ account_code: "", account_name: "", account_type: "income", description: "", opening_balance: "0" }); load() }
  }

  const handleEdit = (a: FinanceAccount) => {
    setEditId(a.id); setForm({ account_code: a.account_code, account_name: a.account_name, account_type: a.account_type, description: a.description || "", opening_balance: String(a.opening_balance) }); setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    const res = await deleteAccount(id)
    if (res.error) toast.error(res.error); else { toast.success("Account deleted"); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your organization's chart of accounts.</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ account_code: "", account_name: "", account_type: "income", description: "", opening_balance: "0" }) }}>
          <Plus className="h-4 w-4 mr-1" /> Add Account
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input value={form.account_code} onChange={e => setForm(f => ({ ...f, account_code: e.target.value }))} placeholder="Account Code (e.g. 1001)" />
              <Input value={form.account_name} onChange={e => setForm(f => ({ ...f, account_name: e.target.value }))} placeholder="Account Name" />
            </div>
            <Select options={ACCOUNT_TYPES.map(t => ({ value: t.value, label: t.label }))} value={form.account_type} onChange={e => setForm(f => ({ ...f, account_type: e.target.value }))} />
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" />
            <Input type="number" value={form.opening_balance} onChange={e => setForm(f => ({ ...f, opening_balance: e.target.value }))} placeholder="Opening Balance" />
            <div className="flex gap-2">
              <Button onClick={handleSave}><Save className="h-4 w-4 mr-1" /> Save</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map(a => (
          <Card key={a.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${ACCOUNT_TYPE_COLORS[a.account_type] || "bg-gray-100"}`}><Building2 className="h-4 w-4" /></div>
                  <div>
                    <p className="font-semibold">{a.account_name}</p>
                    <p className="text-xs text-gray-400">{a.account_code} · {a.account_type}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(a)}><Edit3 className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}><Trash2 className="h-3 w-3 text-red-400" /></Button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">{a.description || "No description"}</p>
              <p className="text-sm font-semibold mt-2">Opening: ₹{a.opening_balance.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && !showForm && (
        <Card><CardContent className="py-12 text-center text-gray-400">No accounts configured. Add your first account.</CardContent></Card>
      )}
    </div>
  )
}
