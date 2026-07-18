"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getFestivalVenues, createFestivalVenue, updateFestivalVenue, deleteFestivalVenue } from "@/lib/actions/festival"
import type { FestivalVenue } from "@/types/festival"
import { Plus, Loader2, Trash2, MapPin, Save } from "lucide-react"

export default function FestivalVenuesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [venues, setVenues] = useState<FestivalVenue[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", code: "", description: "", address: "", capacity: "", display_order: "" })

  async function load() {
    const data = await getFestivalVenues(festivalId)
    setVenues(data as FestivalVenue[])
    setLoading(false)
  }

  useEffect(() => { load() }, [festivalId])

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Venue name is required"); return }
    setSaving(true)
    const payload = { name: form.name, code: form.code || null, description: form.description || null, address: form.address || null, capacity: form.capacity ? parseInt(form.capacity) : 0 }
    const result = editingId ? await updateFestivalVenue(editingId, payload) : await createFestivalVenue(festivalId, payload)
    if (result.error) toast.error(result.error)
    else { toast.success(editingId ? "Venue updated" : "Venue created"); setShowForm(false); setEditingId(null); setForm({ name: "", code: "", description: "", address: "", capacity: "", display_order: "" }) }
    setSaving(false)
    await load()
  }

  async function handleEdit(venue: FestivalVenue) {
    setForm({ name: venue.name, code: venue.code || "", description: venue.description || "", address: venue.address || "", capacity: venue.capacity.toString(), display_order: venue.display_order.toString() })
    setEditingId(venue.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this venue?")) return
    const result = await deleteFestivalVenue(id)
    if (result.error) toast.error(result.error)
    else toast.success("Venue deleted")
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Venues</h1>
          <p className="text-sm text-gray-500 mt-1">Manage festival venues and locations.</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", code: "", description: "", address: "", capacity: "", display_order: "" }) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Venue
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Main Auditorium" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Code</label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="VEN-001" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Capacity</label>
                <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? <><Save className="h-4 w-4 mr-2" /> Update</> : <><Plus className="h-4 w-4 mr-2" /> Create</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {venues.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No venues added yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {venues.map((venue) => (
            <Card key={venue.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{venue.name}</h3>
                      {venue.code && <p className="text-xs text-gray-500">{venue.code}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(venue)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs">Edit</button>
                    <button onClick={() => handleDelete(venue.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {venue.description && <p className="text-sm text-gray-500 mt-2">{venue.description}</p>}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {venue.capacity > 0 && <span>Capacity: {venue.capacity}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
