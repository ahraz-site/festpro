"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getBadges, createBadge, updateBadgeStatus } from "@/lib/actions/id-card"
import { BADGE_TYPES, CARD_STATUSES } from "@/config/id-card"
import type { Badge } from "@/types/id-card"
import { Loader2, Plus, X, Award, CalendarDays, Shield, User } from "lucide-react"

export default function BadgesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState("")
  const [filterType, setFilterType] = useState("")
  const [form, setForm] = useState({ badge_type: "volunteer", holder_name: "", role_title: "", department: "", access_levels: "", validity_start: "", validity_end: "" })

  const load = useCallback(async () => {
    const res = await getBadges(festivalId, { status: filterStatus || undefined, badge_type: filterType || undefined })
    setBadges(res.data || []); setLoading(false)
  }, [festivalId, filterStatus, filterType])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createBadge({ festival_id: festivalId, ...form, access_levels: form.access_levels ? form.access_levels.split(",").map(s => s.trim()) : [] })
    setShowForm(false); setForm({ badge_type: "volunteer", holder_name: "", role_title: "", department: "", access_levels: "", validity_start: "", validity_end: "" })
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Badges</h1>
          <p className="text-sm text-gray-500 mt-1">{badges.length} badges issued.</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" /> Create Badge</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create Badge</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Badge Type *</label>
                <Select value={form.badge_type} onChange={e => setForm(f => ({ ...f, badge_type: e.target.value }))} options={BADGE_TYPES.map(bt => ({ value: bt.value, label: bt.label }))} />
              </div>
              <div><label className="text-sm font-medium">Holder Name *</label><Input value={form.holder_name} onChange={e => setForm(f => ({ ...f, holder_name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Role Title</label><Input value={form.role_title} onChange={e => setForm(f => ({ ...f, role_title: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Department</label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Access Levels (comma separated)</label><Input value={form.access_levels} onChange={e => setForm(f => ({ ...f, access_levels: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Valid From *</label><Input type="date" value={form.validity_start} onChange={e => setForm(f => ({ ...f, validity_start: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Valid Until *</label><Input type="date" value={form.validity_end} onChange={e => setForm(f => ({ ...f, validity_end: e.target.value }))} required /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Create Badge</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} placeholder="All Statuses" options={[{ value: "", label: "All Statuses" }, ...CARD_STATUSES.map(cs => ({ value: cs.value, label: cs.label }))]} className="w-40" />
        <Select value={filterType} onChange={e => setFilterType(e.target.value)} placeholder="All Types" options={[{ value: "", label: "All Types" }, ...BADGE_TYPES.map(bt => ({ value: bt.value, label: bt.label }))]} className="w-44" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map(b => (
          <Card key={b.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{b.holder_name}</p>
                    <p className="text-xs text-gray-500">{b.badge_number}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${CARD_STATUSES.find(cs => cs.value === b.status)?.color || "bg-gray-100"}`}>
                  {CARD_STATUSES.find(cs => cs.value === b.status)?.label || b.status}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1"><Award className="h-3 w-3" /> {BADGE_TYPES.find(bt => bt.value === b.badge_type)?.label || b.badge_type}</div>
                {b.role_title && <div className="flex items-center gap-1"><User className="h-3 w-3" /> {b.role_title}</div>}
                <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {b.validity_start} - {b.validity_end}</div>
              </div>
              {b.status === "active" && (
                <div className="mt-3">
                  <Button size="sm" variant="outline" className="text-red-500" onClick={async () => { await updateBadgeStatus(b.id, "revoked", "Manual revoke"); load() }}>Revoke</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {badges.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No badges issued.</p>}
      </div>
    </div>
  )
}
