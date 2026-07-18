"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCollectors, upsertCollector } from "@/lib/actions/sponsor-crm"
import type { FundCollector } from "@/types/sponsor-crm"
import { Loader2, Plus, Pencil, X, UserCheck, Phone, Mail, MapPin, TrendingUp, DollarSign, Award } from "lucide-react"

export default function CollectorsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [collectors, setCollectors] = useState<FundCollector[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", phone: "", email: "", area: "" })

  const load = useCallback(async () => {
    const res = await getCollectors(festivalId)
    setCollectors(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsertCollector({ id: editingId || undefined, festival_id: festivalId, ...form })
    setShowForm(false); setEditingId(null); setForm({ name: "", phone: "", email: "", area: "" })
    load()
  }

  const handleEdit = (c: FundCollector) => {
    setForm({ name: c.name, phone: c.phone || "", email: c.email || "", area: c.area || "" })
    setEditingId(c.id); setShowForm(true)
  }

  const sorted = [...collectors].sort((a, b) => b.total_collected - a.total_collected)

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fund Collectors</h1>
          <p className="text-sm text-gray-500 mt-1">{collectors.length} collectors.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ name: "", phone: "", email: "", area: "" }); setShowForm(true) }}><Plus className="h-4 w-4 mr-1" /> Add Collector</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Collector" : "New Collector"}</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null) }}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Name *</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Phone</label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Email</label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Area</label><Input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg"><Award className="h-5 w-5 inline mr-1" /> Collector Leaderboard</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sorted.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-amber-100 text-amber-700" : "bg-gray-50 text-gray-500"
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {c.phone && <><Phone className="h-3 w-3" />{c.phone}</>}
                      {c.area && <><MapPin className="h-3 w-3" />{c.area}</>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">₹{c.total_collected.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Target: ₹{c.total_target.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {sorted.length === 0 && <p className="text-gray-500 text-center py-4">No collectors added.</p>}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collectors.map(c => (
          <Card key={c.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.is_active ? "Active" : "Inactive"}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-500">
                {c.phone && <div className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {c.phone}</div>}
                {c.email && <div className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {c.email}</div>}
                {c.area && <div className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {c.area}</div>}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-green-500" /> <span className="font-semibold text-green-600">₹{c.total_collected.toLocaleString()}</span></div>
                <div className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5 text-blue-500" /> <span>₹{c.total_target.toLocaleString()}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
