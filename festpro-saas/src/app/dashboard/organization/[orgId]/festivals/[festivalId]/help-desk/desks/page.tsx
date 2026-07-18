"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getHelpDesks, createHelpDesk, toggleHelpDesk, deleteHelpDesk } from "@/lib/actions/help-desk"
import type { HelpDesk } from "@/types/help-desk"
import { Loader2, Plus, Trash2, MapPin, Power, PowerOff } from "lucide-react"

export default function DesksPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [desks, setDesks] = useState<HelpDesk[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ desk_code: "", desk_name: "", location: "", department: "", contact_number: "" })

  const load = useCallback(async () => {
    const res = await getHelpDesks(festivalId)
    if (res.data) setDesks(res.data); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.desk_code || !form.desk_name) return
    await createHelpDesk({ ...form, festival_id: festivalId })
    setForm({ desk_code: "", desk_name: "", location: "", department: "", contact_number: "" })
    setShowForm(false); load()
  }

  if (loading && desks.length === 0) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Help Desks</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> Add Desk</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Help Desk</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Desk Code *</Label><Input value={form.desk_code} onChange={e => setForm({ ...form, desk_code: e.target.value })} /></div>
              <div><Label>Desk Name *</Label><Input value={form.desk_name} onChange={e => setForm({ ...form, desk_name: e.target.value })} /></div>
              <div><Label>Location</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
              <div><Label>Department</Label><Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
              <div><Label>Contact Number</Label><Input value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} /></div>
            </div>
            <Button onClick={handleCreate}>Add Desk</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {desks.map(d => (
          <Card key={d.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${d.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{d.is_active ? "Active" : "Inactive"}</span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={async () => { await toggleHelpDesk(d.id, !d.is_active); load() }}>{d.is_active ? <PowerOff className="h-4 w-4 text-gray-400" /> : <Power className="h-4 w-4 text-green-500" />}</Button>
                  <Button size="sm" variant="ghost" onClick={async () => { if (confirm("Delete desk?")) { await deleteHelpDesk(d.id); load() } }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </div>
              <p className="text-sm font-semibold mt-2">{d.desk_name}</p>
              <p className="text-xs font-mono text-gray-400">{d.desk_code}</p>
              {d.location && <p className="text-xs text-gray-500 mt-1">{d.location}</p>}
              {d.department && <p className="text-xs text-gray-400">{d.department}</p>}
              {d.contact_number && <p className="text-xs text-gray-400 mt-1">📞 {d.contact_number}</p>}
            </CardContent>
          </Card>
        ))}
        {desks.length === 0 && <p className="text-center text-gray-400 py-8 col-span-3">No help desks configured</p>}
      </div>
    </div>
  )
}
