"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getMediaPasses, createMediaPass } from "@/lib/actions/id-card"
import { PASS_STATUSES, MEDIA_TYPES } from "@/config/id-card"
import type { MediaPass } from "@/types/id-card"
import { Loader2, Plus, X, Camera, CalendarDays, User, Phone, Mail, Building2, Camera as CameraIcon, Drone } from "lucide-react"

export default function MediaPassesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [passes, setPasses] = useState<MediaPass[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ media_name: "", media_organization: "", media_type: "press", media_phone: "", media_email: "", press_id_number: "", equipment_list: "", has_camera_permit: false, has_drone_permit: false, has_interview_access: true, validity_start: "", validity_end: "" })

  const load = useCallback(async () => {
    const res = await getMediaPasses(festivalId)
    setPasses(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createMediaPass({ festival_id: festivalId, ...form })
    setShowForm(false); setForm({ media_name: "", media_organization: "", media_type: "press", media_phone: "", media_email: "", press_id_number: "", equipment_list: "", has_camera_permit: false, has_drone_permit: false, has_interview_access: true, validity_start: "", validity_end: "" })
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Passes</h1>
          <p className="text-sm text-gray-500 mt-1">{passes.length} media passes issued.</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-1" /> Issue Media Pass</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Issue Media Pass</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Media Name *</label><Input value={form.media_name} onChange={e => setForm(f => ({ ...f, media_name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Organization *</label><Input value={form.media_organization} onChange={e => setForm(f => ({ ...f, media_organization: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Media Type</label>
                <Select value={form.media_type} onChange={e => setForm(f => ({ ...f, media_type: e.target.value }))} options={MEDIA_TYPES.map(mt => ({ value: mt.value, label: mt.label }))} />
              </div>
              <div><label className="text-sm font-medium">Phone</label><Input value={form.media_phone} onChange={e => setForm(f => ({ ...f, media_phone: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Email</label><Input type="email" value={form.media_email} onChange={e => setForm(f => ({ ...f, media_email: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Press ID Number</label><Input value={form.press_id_number} onChange={e => setForm(f => ({ ...f, press_id_number: e.target.value }))} /></div>
              <div className="sm:col-span-2"><label className="text-sm font-medium">Equipment List</label><Input value={form.equipment_list} onChange={e => setForm(f => ({ ...f, equipment_list: e.target.value }))} /></div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.has_camera_permit} onChange={e => setForm(f => ({ ...f, has_camera_permit: e.target.checked }))} /> Camera Permit</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.has_drone_permit} onChange={e => setForm(f => ({ ...f, has_drone_permit: e.target.checked }))} /> Drone Permit</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.has_interview_access} onChange={e => setForm(f => ({ ...f, has_interview_access: e.target.checked }))} /> Interview Access</label>
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
                  <div className="h-10 w-10 rounded-lg bg-pink-50 flex items-center justify-center">
                    <Camera className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{p.media_name}</p>
                    <p className="text-xs text-gray-500">{p.media_organization}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${PASS_STATUSES.find(ps => ps.value === p.status)?.color || "bg-gray-100"}`}>
                  {PASS_STATUSES.find(ps => ps.value === p.status)?.label || p.status}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1"><CameraIcon className="h-3 w-3" /> {MEDIA_TYPES.find(mt => mt.value === p.media_type)?.label || p.media_type}</div>
                {p.media_phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {p.media_phone}</div>}
                {p.media_email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {p.media_email}</div>}
                {p.press_id_number && <div className="flex items-center gap-1"><Building2 className="h-3 w-3" /> ID: {p.press_id_number}</div>}
                <div className="flex items-center gap-2 mt-1">
                  {p.has_camera_permit && <span className="text-green-600 text-xs">Camera</span>}
                  {p.has_drone_permit && <span className="text-amber-600 text-xs">Drone</span>}
                  {p.has_interview_access && <span className="text-blue-600 text-xs">Interview</span>}
                </div>
                <div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {new Date(p.validity_start).toLocaleDateString()} - {new Date(p.validity_end).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        ))}
        {passes.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No media passes issued.</p>}
      </div>
    </div>
  )
}
