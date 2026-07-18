"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getCompetitionRules, createCompetitionRule, updateCompetitionRule, deleteCompetitionRule } from "@/lib/actions/competition"
import type { CompetitionRule } from "@/types/competition"
import { Plus, Loader2, Trash2, Save, BookOpen } from "lucide-react"

export default function CompetitionRulesPage() {
  const params = useParams()
  const competitionId = params.competitionId as string
  const [rules, setRules] = useState<CompetitionRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: "", description: "" })

  async function load() {
    const data = await getCompetitionRules(competitionId)
    setRules(data as CompetitionRule[])
    setLoading(false)
  }
  useEffect(() => { load() }, [competitionId])

  async function handleSave() {
    if (!form.title.trim()) { toast.error("Title required"); return }
    setSaving(true)
    const payload = { title: form.title, description: form.description || undefined, rule_number: rules.length + 1 }
    const result = editingId ? await updateCompetitionRule(editingId, payload as any) : await createCompetitionRule(competitionId, payload)
    if (result.error) toast.error(result.error)
    else { toast.success(editingId ? "Updated" : "Created"); setShowForm(false); setEditingId(null); setForm({ title: "", description: "" }) }
    setSaving(false)
    await load()
  }

  function handleEdit(r: CompetitionRule) {
    setForm({ title: r.title, description: r.description || "" }); setEditingId(r.id); setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this rule?")) return
    const result = await deleteCompetitionRule(id)
    if (result.error) toast.error(result.error); else toast.success("Deleted")
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rules</h1>
          <p className="text-sm text-gray-500 mt-1">Define competition rules and guidelines.</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ title: "", description: "" }) }}>
          <Plus className="h-4 w-4 mr-2" /> Add Rule
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Time Limit" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? <><Save className="h-4 w-4 mr-2" /> Update</> : <><Plus className="h-4 w-4 mr-2" /> Create</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {rules.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No rules defined.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="p-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">{rule.rule_number}</span>
                    <h3 className="font-medium text-gray-900">{rule.title}</h3>
                  </div>
                  {rule.description && <p className="text-sm text-gray-600 mt-1 ml-8">{rule.description}</p>}
                </div>
                <div className="flex gap-1 ml-4">
                  <button onClick={() => handleEdit(rule)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg text-xs">Edit</button>
                  <button onClick={() => handleDelete(rule.id)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
