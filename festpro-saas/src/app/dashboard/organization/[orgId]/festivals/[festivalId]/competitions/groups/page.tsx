"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getGroups, createGroup, updateGroup, deleteGroup } from "@/lib/actions/competition/categories"
import { AGE_GROUPS } from "@/config/competition"
import type { CompetitionGroup } from "@/types/competition"
import { Plus, Loader2, Trash2, Save, Users } from "lucide-react"

export default function GroupsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [groups, setGroups] = useState<CompetitionGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", age_group: "open", min_age: "", max_age: "", description: "" })

  async function load() {
    const data = await getGroups(festivalId)
    setGroups(data as CompetitionGroup[])
    setLoading(false)
  }
  useEffect(() => { load() }, [festivalId])

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Name required"); return }
    setSaving(true)
    const result = editingId
      ? await updateGroup(editingId, form as any)
      : await createGroup(festivalId, form)
    if (result.error) toast.error(result.error)
    else { toast.success(editingId ? "Updated" : "Created"); setShowForm(false); setEditingId(null); setForm({ name: "", age_group: "open", min_age: "", max_age: "", description: "" }) }
    setSaving(false)
    await load()
  }

  function handleEdit(g: CompetitionGroup) {
    setForm({ name: g.name, age_group: g.age_group, min_age: g.min_age?.toString() || "", max_age: g.max_age?.toString() || "", description: g.description || "" })
    setEditingId(g.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Archive this group?")) return
    const result = await deleteGroup(id)
    if (result.error) toast.error(result.error); else toast.success("Archived")
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Age Groups</h1>
          <p className="text-sm text-gray-500 mt-1">Manage age-based groups for competitions.</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", age_group: "open", min_age: "", max_age: "", description: "" }) }}>
          <Plus className="h-4 w-4 mr-2" /> Add Group
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sub Junior" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Age Group</label>
                <Select value={form.age_group} onChange={(e) => setForm({ ...form, age_group: e.target.value })} options={AGE_GROUPS} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Min Age</label><Input type="number" value={form.min_age} onChange={(e) => setForm({ ...form, min_age: e.target.value })} /></div>
              <div className="space-y-2"><label className="text-sm font-medium text-gray-700">Max Age</label><Input type="number" value={form.max_age} onChange={(e) => setForm({ ...form, max_age: e.target.value })} /></div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? <><Save className="h-4 w-4 mr-2" /> Update</> : <><Plus className="h-4 w-4 mr-2" /> Create</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {groups.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Users className="h-12 w-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No groups defined.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <Card key={g.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600"><Users className="h-5 w-5" /></div>
                  <div>
                    <p className="font-medium text-gray-900">{g.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{g.age_group.replace("_", " ")}{g.min_age !== null && ` | ${g.min_age}-${g.max_age || "∞"} years`}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(g)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg text-xs">Edit</button>
                  <button onClick={() => handleDelete(g.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
