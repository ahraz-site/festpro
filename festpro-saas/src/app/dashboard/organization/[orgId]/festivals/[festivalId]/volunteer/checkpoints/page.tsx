"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getCheckpoints, upsertCheckpoint } from "@/lib/actions/volunteer"
import { CHECKPOINT_TYPES } from "@/config/volunteer"
import type { Checkpoint } from "@/types/volunteer"
import { Loader2, Plus, Pencil, X, MapPin, QrCode, Music, Users, HelpCircle, Heart, Car, UserCheck } from "lucide-react"

const iconMap: Record<string, any> = { MapPin, Music, Users, HelpCircle, Heart, Car, UserCheck }

export default function CheckpointsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", checkpoint_type: "gate", location: "", is_active: true })

  const load = useCallback(async () => {
    const res = await getCheckpoints(festivalId)
    setCheckpoints(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsertCheckpoint({ id: editingId || undefined, festival_id: festivalId, ...form })
    setShowForm(false); setEditingId(null); setForm({ name: "", checkpoint_type: "gate", location: "", is_active: true })
    load()
  }

  const handleEdit = (c: Checkpoint) => {
    setForm({ name: c.name, checkpoint_type: c.checkpoint_type, location: c.location || "", is_active: c.is_active })
    setEditingId(c.id); setShowForm(true)
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checkpoints</h1>
          <p className="text-sm text-gray-500 mt-1">{checkpoints.length} checkpoints configured.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ name: "", checkpoint_type: "gate", location: "", is_active: true }); setShowForm(true) }}><Plus className="h-4 w-4 mr-1" /> Add Checkpoint</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Checkpoint" : "New Checkpoint"}</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null) }}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="text-sm font-medium">Name *</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Type</label>
                <Select value={form.checkpoint_type} onChange={e => setForm(f => ({ ...f, checkpoint_type: e.target.value }))} options={CHECKPOINT_TYPES.map(ct => ({ value: ct.value, label: ct.label }))} />
              </div>
              <div><label className="text-sm font-medium">Location</label><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} /></div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} /><label className="text-sm font-medium">Active</label></div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {checkpoints.map(c => {
          const cpType = CHECKPOINT_TYPES.find(ct => ct.value === c.checkpoint_type)
          const CpIcon = iconMap[cpType?.icon || ""] || MapPin
          return (
            <Card key={c.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${c.is_active ? "bg-green-50" : "bg-gray-50"}`}>
                      <CpIcon className={`h-5 w-5 ${c.is_active ? "text-green-600" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-gray-500">{cpType?.label || c.checkpoint_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${c.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                {c.location && <p className="mt-2 text-sm text-gray-500 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {c.location}</p>}
                {c.qr_code && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                    <QrCode className="h-3 w-3" /> {c.qr_code}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
        {checkpoints.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No checkpoints configured.</p>}
      </div>
    </div>
  )
}
