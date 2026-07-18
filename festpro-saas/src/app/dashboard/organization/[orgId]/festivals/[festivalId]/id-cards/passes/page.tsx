"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getPasses, createPass, updatePassStatus } from "@/lib/actions/id-card"
import { PASS_TYPES, PASS_STATUSES } from "@/config/id-card"
import type { Pass } from "@/types/id-card"
import { Loader2, Plus, X, CreditCard, CalendarDays, User, Search } from "lucide-react"

export default function PassesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [passes, setPasses] = useState<Pass[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterType, setFilterType] = useState("")
  const [form, setForm] = useState({ pass_type: "general", holder_name: "", holder_contact: "", organization_name: "", access_areas: "", is_transferable: false, validity_start: "", validity_end: "" })

  const load = useCallback(async () => {
    const res = await getPasses(festivalId, { status: filterStatus || undefined, pass_type: filterType || undefined, search: search || undefined })
    setPasses(res.data || []); setLoading(false)
  }, [festivalId, filterStatus, filterType, search])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createPass({ festival_id: festivalId, ...form, access_areas: form.access_areas ? form.access_areas.split(",").map(s => s.trim()) : [] })
    setShowForm(false); setForm({ pass_type: "general", holder_name: "", holder_contact: "", organization_name: "", access_areas: "", is_transferable: false, validity_start: "", validity_end: "" })
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Passes</h1>
          <p className="text-sm text-gray-500 mt-1">{passes.length} passes issued.</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" /> Issue Pass</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Issue New Pass</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Pass Type *</label>
                <Select value={form.pass_type} onChange={e => setForm(f => ({ ...f, pass_type: e.target.value }))} options={PASS_TYPES.map(pt => ({ value: pt.value, label: pt.label }))} />
              </div>
              <div><label className="text-sm font-medium">Holder Name *</label><Input value={form.holder_name} onChange={e => setForm(f => ({ ...f, holder_name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Holder Contact</label><Input value={form.holder_contact} onChange={e => setForm(f => ({ ...f, holder_contact: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Organization</label><Input value={form.organization_name} onChange={e => setForm(f => ({ ...f, organization_name: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Access Areas (comma separated)</label><Input value={form.access_areas} onChange={e => setForm(f => ({ ...f, access_areas: e.target.value }))} /></div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={form.is_transferable} onChange={e => setForm(f => ({ ...f, is_transferable: e.target.checked }))} /><label className="text-sm font-medium">Transferable</label></div>
              <div><label className="text-sm font-medium">Valid From *</label><Input type="datetime-local" value={form.validity_start} onChange={e => setForm(f => ({ ...f, validity_start: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Valid Until *</label><Input type="datetime-local" value={form.validity_end} onChange={e => setForm(f => ({ ...f, validity_end: e.target.value }))} required /></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Issue Pass</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-9" placeholder="Search by name or pass number..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} placeholder="All Statuses" options={[{ value: "", label: "All Statuses" }, ...PASS_STATUSES.map(ps => ({ value: ps.value, label: ps.label }))]} className="w-40" />
        <Select value={filterType} onChange={e => setFilterType(e.target.value)} placeholder="All Types" options={[{ value: "", label: "All Types" }, ...PASS_TYPES.map(pt => ({ value: pt.value, label: pt.label }))]} className="w-44" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {passes.map(p => (
          <Card key={p.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{p.holder_name}</p>
                    <p className="text-xs text-gray-500">{p.pass_number}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${PASS_STATUSES.find(ps => ps.value === p.status)?.color || "bg-gray-100"}`}>
                  {PASS_STATUSES.find(ps => ps.value === p.status)?.label || p.status}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> {PASS_TYPES.find(pt => pt.value === p.pass_type)?.label || p.pass_type}</div>
                {p.organization_name && <div className="flex items-center gap-1"><User className="h-3 w-3" /> {p.organization_name}</div>}
                <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {new Date(p.validity_start).toLocaleDateString()} - {new Date(p.validity_end).toLocaleDateString()}</div>
              </div>
              {p.status === "active" && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={async () => { await updatePassStatus(p.id, "used"); load() }}>Mark Used</Button>
                  <Button size="sm" variant="outline" className="text-red-500" onClick={async () => { await updatePassStatus(p.id, "revoked", "Manual revoke"); load() }}>Revoke</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {passes.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No passes issued.</p>}
      </div>
    </div>
  )
}
