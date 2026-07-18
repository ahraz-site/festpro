"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getCompetitionMaterials, createCompetitionMaterial, deleteCompetitionMaterial } from "@/lib/actions/competition"
import type { CompetitionMaterial } from "@/types/competition"
import { Plus, Loader2, Trash2, Package } from "lucide-react"

export default function CompetitionMaterialsPage() {
  const params = useParams()
  const competitionId = params.competitionId as string
  const [materials, setMaterials] = useState<CompetitionMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", is_required: true, quantity: "1" })

  async function load() {
    const data = await getCompetitionMaterials(competitionId)
    setMaterials(data as CompetitionMaterial[])
    setLoading(false)
  }
  useEffect(() => { load() }, [competitionId])

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Name required"); return }
    setSaving(true)
    const result = await createCompetitionMaterial(competitionId, { name: form.name, description: form.description || undefined, is_required: form.is_required, quantity: parseInt(form.quantity) || 1 })
    if (result.error) toast.error(result.error)
    else { toast.success("Added"); setForm({ name: "", description: "", is_required: true, quantity: "1" }) }
    setSaving(false)
    await load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove?")) return
    const result = await deleteCompetitionMaterial(id)
    if (result.error) toast.error(result.error); else toast.success("Removed")
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Required Materials</h1>
          <p className="text-sm text-gray-500 mt-1">Equipment and materials needed for this competition.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" /> Add Material</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Projector" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_required} onChange={(e) => setForm({ ...form, is_required: e.target.checked })} className="rounded" />
              <span className="text-sm text-gray-700">Required</span>
            </label>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </CardContent>
        </Card>
      )}

      {materials.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Package className="h-12 w-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No materials listed.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {materials.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600"><Package className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.name} {m.is_required ? "*" : ""}</p>
                    <p className="text-xs text-gray-500">{m.description}{m.quantity > 1 ? ` (x${m.quantity})` : ""}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(m.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg"><Trash2 className="h-4 w-4" /></button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
