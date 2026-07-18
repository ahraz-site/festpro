"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { getVipPasses, createVipPass } from "@/lib/actions/id-card"
import { PASS_STATUSES } from "@/config/id-card"
import type { VipPass } from "@/types/id-card"
import { Loader2, Plus, X, Crown, CalendarDays, User, Phone, Mail, Shield, Car, Coffee } from "lucide-react"

export default function VipPassesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [passes, setPasses] = useState<VipPass[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ vip_name: "", vip_title: "", vip_phone: "", vip_email: "", vip_level: "1", personal_assistant: "", security_clearance: "", special_requirements: "", has_parking: true, has_hospitality: true, validity_start: "", validity_end: "" })

  const load = useCallback(async () => {
    const res = await getVipPasses(festivalId)
    setPasses(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createVipPass({ festival_id: festivalId, ...form, vip_level: Number(form.vip_level) })
    setShowForm(false); setForm({ vip_name: "", vip_title: "", vip_phone: "", vip_email: "", vip_level: "1", personal_assistant: "", security_clearance: "", special_requirements: "", has_parking: true, has_hospitality: true, validity_start: "", validity_end: "" })
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">VIP Passes</h1>
          <p className="text-sm text-gray-500 mt-1">{passes.length} VIP passes issued.</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" /> Issue VIP Pass</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Issue VIP Pass</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">VIP Name *</label><Input value={form.vip_name} onChange={e => setForm(f => ({ ...f, vip_name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Title</label><Input value={form.vip_title} onChange={e => setForm(f => ({ ...f, vip_title: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Phone</label><Input value={form.vip_phone} onChange={e => setForm(f => ({ ...f, vip_phone: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Email</label><Input type="email" value={form.vip_email} onChange={e => setForm(f => ({ ...f, vip_email: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">VIP Level</label>
                <Select value={form.vip_level} onChange={e => setForm(f => ({ ...f, vip_level: e.target.value }))} options={[{ value: "1", label: "Level 1" }, { value: "2", label: "Level 2" }, { value: "3", label: "Level 3" }, { value: "4", label: "Level 4" }, { value: "5", label: "Level 5" }]} />
              </div>
              <div><label className="text-sm font-medium">Personal Assistant</label><Input value={form.personal_assistant} onChange={e => setForm(f => ({ ...f, personal_assistant: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Security Clearance</label><Input value={form.security_clearance} onChange={e => setForm(f => ({ ...f, security_clearance: e.target.value }))} /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium">Special Requirements</label><Textarea value={form.special_requirements} onChange={e => setForm(f => ({ ...f, special_requirements: e.target.value }))} /></div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.has_parking} onChange={e => setForm(f => ({ ...f, has_parking: e.target.checked }))} /> Parking</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.has_hospitality} onChange={e => setForm(f => ({ ...f, has_hospitality: e.target.checked }))} /> Hospitality</label>
              </div>
              <div><label className="text-sm font-medium">Valid From *</label><Input type="datetime-local" value={form.validity_start} onChange={e => setForm(f => ({ ...f, validity_start: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Valid Until *</label><Input type="datetime-local" value={form.validity_end} onChange={e => setForm(f => ({ ...f, validity_end: e.target.value }))} required /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Issue</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {passes.map(p => (
          <Card key={p.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                    <Crown className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{p.vip_name}</p>
                    {p.vip_title && <p className="text-xs text-gray-500">{p.vip_title}</p>}
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">L{p.vip_level}</span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                {p.vip_phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {p.vip_phone}</div>}
                {p.vip_email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {p.vip_email}</div>}
                {p.personal_assistant && <div className="flex items-center gap-1"><User className="h-3 w-3" /> PA: {p.personal_assistant}</div>}
                {p.security_clearance && <div className="flex items-center gap-1"><Shield className="h-3 w-3" /> {p.security_clearance}</div>}
                <div className="flex items-center gap-2 mt-1">
                  {p.has_parking && <span className="flex items-center gap-1"><Car className="h-3 w-3" />Parking</span>}
                  {p.has_hospitality && <span className="flex items-center gap-1"><Coffee className="h-3 w-3" />Hospitality</span>}
                </div>
                <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {new Date(p.validity_start).toLocaleDateString()} - {new Date(p.validity_end).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        ))}
        {passes.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No VIP passes issued.</p>}
      </div>
    </div>
  )
}
