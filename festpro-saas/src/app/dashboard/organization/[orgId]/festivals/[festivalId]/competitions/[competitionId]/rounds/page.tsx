"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getCompetitionRounds, createCompetitionRound, updateCompetitionRound, deleteCompetitionRound } from "@/lib/actions/competition"
import { ROUND_TYPES } from "@/config/competition"
import type { CompetitionRound } from "@/types/competition"
import { Plus, Loader2, Trash2, Save, LayoutGrid } from "lucide-react"

export default function CompetitionRoundsPage() {
  const params = useParams()
  const competitionId = params.competitionId as string
  const [rounds, setRounds] = useState<CompetitionRound[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", round_type: "preliminary", round_number: 1, duration_minutes: "60", max_participants: "", description: "" })

  async function load() {
    const data = await getCompetitionRounds(competitionId)
    setRounds(data as CompetitionRound[])
    setLoading(false)
  }

  useEffect(() => { load() }, [competitionId])

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Name required"); return }
    setSaving(true)
    const payload = { name: form.name, round_type: form.round_type, round_number: rounds.length + 1, duration_minutes: parseInt(form.duration_minutes) || 60, max_participants: form.max_participants ? parseInt(form.max_participants) : undefined, description: form.description || undefined }
    const result = editingId ? await updateCompetitionRound(editingId, payload as any) : await createCompetitionRound(competitionId, payload as any)
    if (result.error) toast.error(result.error)
    else { toast.success(editingId ? "Updated" : "Created"); setShowForm(false); setEditingId(null); setForm({ name: "", round_type: "preliminary", round_number: rounds.length + 2, duration_minutes: "60", max_participants: "", description: "" }) }
    setSaving(false)
    await load()
  }

  function handleEdit(r: CompetitionRound) {
    setForm({ name: r.name, round_type: r.round_type, round_number: r.round_number, duration_minutes: r.duration_minutes.toString(), max_participants: r.max_participants?.toString() || "", description: r.description || "" })
    setEditingId(r.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this round?")) return
    const result = await deleteCompetitionRound(id)
    if (result.error) toast.error(result.error)
    else toast.success("Deleted")
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rounds</h1>
          <p className="text-sm text-gray-500 mt-1">Manage competition rounds (preliminary, finals, etc.)</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", round_type: "preliminary", round_number: rounds.length + 1, duration_minutes: "60", max_participants: "", description: "" }) }}>
          <Plus className="h-4 w-4 mr-2" /> Add Round
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Preliminary Round" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <Select value={form.round_type} onChange={(e) => setForm({ ...form, round_type: e.target.value })} options={ROUND_TYPES} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Duration (min)</label>
                <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Max Participants</label>
                <Input type="number" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? <><Save className="h-4 w-4 mr-2" /> Update</> : <><Plus className="h-4 w-4 mr-2" /> Create</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {rounds.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <LayoutGrid className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No rounds defined yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rounds.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 text-sm font-bold">
                    R{r.round_number}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{r.round_type.replace("_", " ")} | {r.duration_minutes}min{r.max_participants ? ` | Max ${r.max_participants}` : ""}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(r)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg text-xs">Edit</button>
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
