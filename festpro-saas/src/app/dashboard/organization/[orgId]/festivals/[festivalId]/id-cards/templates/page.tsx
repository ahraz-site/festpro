"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { getIdCardTemplates, upsertIdCardTemplate } from "@/lib/actions/id-card"
import { ID_CARD_TYPES } from "@/config/id-card"
import type { IdCardTemplate } from "@/types/id-card"
import { Loader2, Plus, Pencil, X, FileText, LayoutTemplate } from "lucide-react"

export default function IdCardTemplatesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [templates, setTemplates] = useState<IdCardTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", card_type: "participant" })

  const load = useCallback(async () => {
    const res = await getIdCardTemplates(festivalId)
    setTemplates(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsertIdCardTemplate({ id: editingId || undefined, festival_id: festivalId, ...form })
    setShowForm(false); setEditingId(null); setForm({ name: "", card_type: "participant" })
    load()
  }

  const handleEdit = (t: IdCardTemplate) => {
    setForm({ name: t.name, card_type: t.card_type })
    setEditingId(t.id); setShowForm(true)
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ID Card Templates</h1>
          <p className="text-sm text-gray-500 mt-1">{templates.length} templates.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ name: "", card_type: "participant" }); setShowForm(true) }}><Plus className="h-4 w-4 mr-1" /> Create Template</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Template" : "New Template"}</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditingId(null) }}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-sm font-medium">Name *</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label className="text-sm font-medium">Card Type</label>
                <Select value={form.card_type} onChange={e => setForm(f => ({ ...f, card_type: e.target.value }))} options={ID_CARD_TYPES.map(ct => ({ value: ct.value, label: ct.label }))} />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map(t => (
          <Card key={t.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <LayoutTemplate className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${ID_CARD_TYPES.find(ct => ct.value === t.card_type)?.color || "bg-gray-100"}`}>
                      {ID_CARD_TYPES.find(ct => ct.value === t.card_type)?.label || t.card_type}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
              </div>
              <p className="mt-2 text-xs text-gray-500">{t.width_mm} x {t.height_mm} mm | {t.orientation}</p>
            </CardContent>
          </Card>
        ))}
        {templates.length === 0 && <p className="text-gray-500 col-span-3 text-center py-8">No templates created.</p>}
      </div>
    </div>
  )
}
