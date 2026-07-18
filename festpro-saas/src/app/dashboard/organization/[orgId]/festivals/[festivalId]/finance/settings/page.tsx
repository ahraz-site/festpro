"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getPaymentMethods, upsertPaymentMethod } from "@/lib/actions/finance"
import { getTransactionCategories } from "@/lib/actions/finance"
import { getDashboardWidgets, upsertDashboardWidget, deleteDashboardWidget } from "@/lib/actions/reports"
import { PAYMENT_GATEWAYS, WIDGET_TYPES } from "@/config/finance"
import { Loader2, Plus, Trash2, Save, CreditCard, Layers, Layout, Sliders } from "lucide-react"

export default function FinanceSettingsPage() {
  const params = useParams()
  const [methods, setMethods] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [widgets, setWidgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showMethodForm, setShowMethodForm] = useState(false)
  const [showWidgetForm, setShowWidgetForm] = useState(false)
  const [methodForm, setMethodForm] = useState({ method_name: "", gateway: "cash", is_online: false })
  const [widgetForm, setWidgetForm] = useState({ widget_type: "stat", title: "", size: "full", config: "{}" })

  const load = useCallback(async () => {
    const [mRes, cRes, wRes] = await Promise.all([getPaymentMethods(), getTransactionCategories(), getDashboardWidgets()])
    setMethods(mRes.data || []); setCategories(cRes.data || []); setWidgets(wRes.data || []); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSaveMethod = async () => {
    if (!methodForm.method_name) { toast.error("Method name required"); return }
    const res = await upsertPaymentMethod({
      method_name: methodForm.method_name, gateway: methodForm.gateway, is_online: methodForm.is_online,
    })
    if (res.error) toast.error(res.error); else { toast.success("Payment method saved"); setShowMethodForm(false); setMethodForm({ method_name: "", gateway: "cash", is_online: false }); load() }
  }

  const handleSaveWidget = async () => {
    if (!widgetForm.title) { toast.error("Widget title required"); return }
    const res = await upsertDashboardWidget({
      widget_type: widgetForm.widget_type, title: widgetForm.title,
      size: widgetForm.size, config: JSON.parse(widgetForm.config || "{}"),
    })
    if (res.error) toast.error(res.error); else { toast.success("Widget added"); setShowWidgetForm(false); setWidgetForm({ widget_type: "stat", title: "", size: "full", config: "{}" }); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finance Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure payment methods, categories, and dashboard widgets.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5" /> Payment Methods</CardTitle>
          <Button size="sm" onClick={() => setShowMethodForm(!showMethodForm)}><Plus className="h-3 w-3 mr-1" /> Add</Button>
        </CardHeader>
        <CardContent>
          {showMethodForm && (
            <div className="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg">
              <Input value={methodForm.method_name} onChange={e => setMethodForm(f => ({ ...f, method_name: e.target.value }))} placeholder="Method Name" />
              <Select options={PAYMENT_GATEWAYS.map(g => ({ value: g.value, label: g.label }))} value={methodForm.gateway} onChange={e => setMethodForm(f => ({ ...f, gateway: e.target.value }))} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={methodForm.is_online} onChange={e => setMethodForm(f => ({ ...f, is_online: e.target.checked }))} />
                Online payment
              </label>
              <Button size="sm" onClick={handleSaveMethod}><Save className="h-3 w-3 mr-1" /> Save</Button>
            </div>
          )}
          {methods.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No payment methods configured</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {methods.map(m => (
                <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 text-sm">
                  <div className={`w-2 h-2 rounded-full ${m.is_online ? "bg-green-500" : "bg-amber-500"}`} />
                  <span>{m.method_name}</span>
                  <span className="text-xs text-gray-400">({m.gateway})</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5" /> Transaction Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No categories configured</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map(c => (
                <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 text-sm">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span>{c.name}</span>
                  <span className="text-xs text-gray-400">({c.type})</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2"><Layout className="h-5 w-5" /> Dashboard Widgets</CardTitle>
          <Button size="sm" onClick={() => setShowWidgetForm(!showWidgetForm)}><Plus className="h-3 w-3 mr-1" /> Add Widget</Button>
        </CardHeader>
        <CardContent>
          {showWidgetForm && (
            <div className="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg">
              <Select options={WIDGET_TYPES.map(w => ({ value: w.value, label: w.label }))} value={widgetForm.widget_type} onChange={e => setWidgetForm(f => ({ ...f, widget_type: e.target.value }))} />
              <Input value={widgetForm.title} onChange={e => setWidgetForm(f => ({ ...f, title: e.target.value }))} placeholder="Widget Title" />
              <Select options={[{ value: "full", label: "Full Width" }, { value: "half", label: "Half Width" }, { value: "third", label: "One Third" }]} value={widgetForm.size} onChange={e => setWidgetForm(f => ({ ...f, size: e.target.value }))} />
              <Button size="sm" onClick={handleSaveWidget}><Plus className="h-3 w-3 mr-1" /> Add to Dashboard</Button>
            </div>
          )}
          {widgets.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No custom widgets configured</p>
          ) : (
            <div className="space-y-2">
              {widgets.map(w => (
                <div key={w.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 text-sm">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{w.title}</span>
                    <span className="text-xs text-gray-400">({w.widget_type} · {w.size})</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={async () => { await deleteDashboardWidget(w.id); load() }}>
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
