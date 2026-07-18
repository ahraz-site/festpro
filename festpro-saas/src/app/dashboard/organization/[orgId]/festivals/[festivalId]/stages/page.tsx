"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getFestivalStages, createFestivalStage, updateFestivalStage, deleteFestivalStage, getFestivalVenues } from "@/lib/actions/festival"
import type { FestivalStage, FestivalVenue } from "@/types/festival"
import { Plus, Loader2, Trash2, LayoutGrid, Save } from "lucide-react"

export default function FestivalStagesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [stages, setStages] = useState<FestivalStage[]>([])
  const [venues, setVenues] = useState<FestivalVenue[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", code: "", venue_id: "", capacity: "", stage_type: "", description: "" })

  async function load() {
    const [stagesData, venuesData] = await Promise.all([getFestivalStages(festivalId), getFestivalVenues(festivalId)])
    setStages(stagesData as FestivalStage[])
    setVenues(venuesData as FestivalVenue[])
    setLoading(false)
  }

  useEffect(() => { load() }, [festivalId])

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Stage name is required"); return }
    setSaving(true)
    const payload = { name: form.name, code: form.code || null, venue_id: form.venue_id || null, capacity: form.capacity ? parseInt(form.capacity) : 0, stage_type: form.stage_type || null, description: form.description || null }
    const result = editingId ? await updateFestivalStage(editingId, payload) : await createFestivalStage(festivalId, payload)
    if (result.error) toast.error(result.error)
    else { toast.success(editingId ? "Stage updated" : "Stage created"); setShowForm(false); setEditingId(null); setForm({ name: "", code: "", venue_id: "", capacity: "", stage_type: "", description: "" }) }
    setSaving(false)
    await load()
  }

  async function handleEdit(stage: FestivalStage) {
    setForm({ name: stage.name, code: stage.code || "", venue_id: stage.venue_id || "", capacity: stage.capacity.toString(), stage_type: stage.stage_type || "", description: stage.description || "" })
    setEditingId(stage.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this stage?")) return
    const result = await deleteFestivalStage(id)
    if (result.error) toast.error(result.error)
    else toast.success("Stage deleted")
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stages</h1>
          <p className="text-sm text-gray-500 mt-1">Manage festival stages and assign venues.</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", code: "", venue_id: "", capacity: "", stage_type: "", description: "" }) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Stage
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Main Stage" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Code</label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="STG-001" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Venue</label>
              <Select value={form.venue_id} onChange={(e) => setForm({ ...form, venue_id: e.target.value })} options={[{ value: "", label: "No Venue" }, ...venues.map((v) => ({ value: v.id, label: v.name }))]} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Capacity</label>
                <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Stage Type</label>
                <Input value={form.stage_type} onChange={(e) => setForm({ ...form, stage_type: e.target.value })} placeholder="Main | Side | Practice" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? <><Save className="h-4 w-4 mr-2" /> Update</> : <><Plus className="h-4 w-4 mr-2" /> Create</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {stages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <LayoutGrid className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No stages added yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {stages.map((stage) => (
            <Card key={stage.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <LayoutGrid className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{stage.name}</h3>
                      {stage.code && <p className="text-xs text-gray-500">{stage.code}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(stage)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs">Edit</button>
                    <button onClick={() => handleDelete(stage.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {(stage as any).venue && <span>Venue: {(stage as any).venue?.name}</span>}
                  {stage.capacity > 0 && <span>Capacity: {stage.capacity}</span>}
                  {stage.stage_type && <span>Type: {stage.stage_type}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
