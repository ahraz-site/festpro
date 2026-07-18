"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMealCoupons, createMealCoupon, redeemMealCoupon, cancelMealCoupon, getMealSessions } from "@/lib/actions/food-catering"
import { COUPON_STATUSES, DIET_TYPES } from "@/config/food-catering"
import { Loader2, QrCode, Plus, Search, CheckCircle, XCircle } from "lucide-react"

export default function CouponsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [coupons, setCoupons] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ meal_session_id: "", holder_name: "", holder_type: "participant", diet_type: "", expires_at: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const [c, s] = await Promise.all([getMealCoupons(festivalId, statusFilter || undefined), getMealSessions(festivalId)])
    setCoupons(c.data || []); setSessions(s.data || []); setLoading(false)
  }, [festivalId, statusFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.holder_name) return
    await createMealCoupon({ ...form, festival_id: festivalId, expires_at: form.expires_at || null })
    setForm({ meal_session_id: "", holder_name: "", holder_type: "participant", diet_type: "", expires_at: "" })
    setShowForm(false); load()
  }

  const handleRedeem = async (id: string) => { await redeemMealCoupon(id); load() }
  const handleCancel = async (id: string) => { await cancelMealCoupon(id); load() }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Meal Coupons</h1><p className="text-sm text-gray-500 mt-1">Issue, verify and redeem QR meal coupons.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Issue Coupon"}</Button>
      </div>

      {showForm && (
        <Card><CardHeader><CardTitle>Issue Coupon</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Holder Name *</label><Input value={form.holder_name} onChange={e => setForm({...form, holder_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Holder Type</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.holder_type} onChange={e => setForm({...form, holder_type: e.target.value})}>
              <option value="participant">Participant</option><option value="volunteer">Volunteer</option><option value="judge">Judge</option><option value="guest">Guest</option><option value="vip">VIP</option>
            </select></div>
          <div><label className="text-sm font-medium">Meal Session</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.meal_session_id} onChange={e => setForm({...form, meal_session_id: e.target.value})}>
              <option value="">Select...</option>{sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session_name}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Diet Type</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.diet_type} onChange={e => setForm({...form, diet_type: e.target.value})}>
              <option value="">None</option>{DIET_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Expires At</label><Input type="datetime-local" value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})} /></div>
          <div className="md:col-span-2 flex gap-2 pt-2"><Button onClick={handleCreate}><QrCode className="h-4 w-4 mr-1" /> Issue</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}

      <div className="flex gap-3">
        <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search coupons..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>{COUPON_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <th className="px-4 py-3">Code</th><th className="px-4 py-3">Holder</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Session</th><th className="px-4 py-3">Issued</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
      </tr></thead><tbody className="divide-y divide-gray-100">
        {coupons.filter(c => !search || c.coupon_code.toLowerCase().includes(search.toLowerCase()) || c.holder_name.toLowerCase().includes(search.toLowerCase())).map((c: any) => (
          <tr key={c.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-mono">{c.coupon_code}</td>
            <td className="px-4 py-3 text-sm font-medium">{c.holder_name}</td>
            <td className="px-4 py-3 text-sm text-gray-500 capitalize">{c.holder_type}</td>
            <td className="px-4 py-3 text-sm text-gray-500">{c.meal_sessions?.session_name || "—"}</td>
            <td className="px-4 py-3 text-sm">{c.issued_at ? new Date(c.issued_at).toLocaleString() : "—"}</td>
            <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${COUPON_STATUSES.find(x => x.value === c.status)?.color || ""}`}>{COUPON_STATUSES.find(x => x.value === c.status)?.label || c.status}</span></td>
            <td className="px-4 py-3 text-right">
              {c.status === "active" && <><Button size="sm" variant="outline" className="mr-1" onClick={() => handleRedeem(c.id)}><CheckCircle className="h-4 w-4 mr-1" /> Redeem</Button><Button size="sm" variant="ghost" onClick={() => handleCancel(c.id)}><XCircle className="h-4 w-4 text-red-500" /></Button></>}
              {c.qr_code && <span className="text-xs text-gray-400 ml-1">QR: {c.qr_code.substring(0, 8)}...</span>}
            </td>
          </tr>
        ))}
      </tbody></table></CardContent></Card>
    </div>
  )
}
