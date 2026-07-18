"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getGuestPasses, createGuestPass } from "@/lib/actions/id-card"
import { PASS_STATUSES } from "@/config/id-card"
import type { GuestPass } from "@/types/id-card"
import { Loader2, Plus, X, Users, CalendarDays, User, Building2, Phone, Mail } from "lucide-react"

export default function GuestPassesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [passes, setPasses] = useState<GuestPass[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ guest_name: "", guest_phone: "", guest_email: "", host_name: "", host_department: "", purpose: "", company: "", validity_start: "", validity_end: "" })

  const load = useCallback(async () => {
    const res = await getGuestPasses(festivalId)
    setPasses(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createGuestPass({ festival_id: festivalId, ...form })
    setShowForm(false); setForm({ guest_name: "", guest_phone: "", guest_email: "", host_name: "", host_department: "", purpose: "", company: "", validity_start: "", validity_end: "" })
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guest Passes</h1>
          <p className="text-sm text-gray-500 mt-1">{passes.length} guest passes issued.</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" /> Issue Guest Pass</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Issue Guest Pass</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Guest Name *</label><Input value={form.guest_name} onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Host Name *</label><Input value={form.host_name} onChange={e => setForm(f => ({ ...f, host_name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Guest Phone</label><Input value={form.guest_phone} onChange={e => setForm(f => ({ ...f, guest_phone: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Guest Email</label><Input type="email" value={form.guest_email} onChange={e => setForm(f => ({ ...f, guest_email: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Host Department</label><Input value={form.host_department} onChange={e => setForm(f => ({ ...f, host_department: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Company</label><Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Purpose</label><Input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} /></div>
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
                  <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{p.guest_name}</p>
                    <p className="text-xs text-gray-500">Host: {p.host_name}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${PASS_STATUSES.find(ps => ps.value === p.status)?.color || "bg-gray-100"}`}>
                  {PASS_STATUSES.find(ps => ps.value === p.status)?.label || p.status}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                {p.guest_phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {p.guest_phone}</div>}
                {p.guest_email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {p.guest_email}</div>}
                {p.company && <div className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {p.company}</div>}
                {p.purpose && <div className="flex items-center gap-1"><User className="h-3 w-3" /> {p.purpose}</div>}
                <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {new Date(p.validity_start).toLocaleDateString()} - {new Date(p.validity_end).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        ))}
        {passes.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No guest passes issued.</p>}
      </div>
    </div>
  )
}
