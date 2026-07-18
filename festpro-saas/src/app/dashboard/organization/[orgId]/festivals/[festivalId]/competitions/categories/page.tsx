"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/actions/competition/categories"
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/config/competition"
import type { CompetitionCategory } from "@/types/competition"
import { Plus, Loader2, Trash2, Save, Palette, Trophy, Layers } from "lucide-react"

export default function CategoriesPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [categories, setCategories] = useState<CompetitionCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", name_ml: "", short_name: "", code: "", description: "", color: "#4F46E5", icon: "trophy" })

  async function load() {
    const data = await getCategories(festivalId)
    setCategories(data as CompetitionCategory[])
    setLoading(false)
  }

  useEffect(() => { load() }, [festivalId])

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Category name is required"); return }
    setSaving(true)
    const result = editingId
      ? await updateCategory(editingId, form as any)
      : await createCategory(festivalId, form)
    if (result.error) toast.error(result.error)
    else { toast.success(editingId ? "Updated" : "Created"); setShowForm(false); setEditingId(null); setForm({ name: "", name_ml: "", short_name: "", code: "", description: "", color: "#4F46E5", icon: "trophy" }) }
    setSaving(false)
    await load()
  }

  function handleEdit(cat: CompetitionCategory) {
    setForm({ name: cat.name, name_ml: cat.name_ml || "", short_name: cat.short_name || "", code: cat.code || "", description: cat.description || "", color: cat.color, icon: cat.icon })
    setEditingId(cat.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Archive this category?")) return
    const result = await deleteCategory(id)
    if (result.error) toast.error(result.error)
    else toast.success("Category archived")
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competition Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Organize competitions into categories.</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", name_ml: "", short_name: "", code: "", description: "", color: "#4F46E5", icon: "trophy" }) }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Literary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Malayalam Name</label>
                <Input value={form.name_ml} onChange={(e) => setForm({ ...form, name_ml: e.target.value })} placeholder="സാഹിത്യം" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Short Name</label>
                <Input value={form.short_name} onChange={(e) => setForm({ ...form, short_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Code</label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="LIT" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Color</label>
                <div className="flex gap-2 items-center">
                  <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-12 h-10 p-1" />
                  <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-2">
              {CATEGORY_COLORS.slice(0, 6).map((c) => (
                <button key={c} onClick={() => setForm({ ...form, color: c })} className="h-8 w-8 rounded-full border-2 border-transparent hover:border-gray-400 transition-colors" style={{ backgroundColor: c }} />
              ))}
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? <><Save className="h-4 w-4 mr-2" /> Update</> : <><Plus className="h-4 w-4 mr-2" /> Create</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No categories yet. Create your first category.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white text-lg" style={{ backgroundColor: cat.color }}>
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                      {cat.name_ml && <p className="text-xs text-gray-500">{cat.name_ml}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(cat)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs">Edit</button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {cat.short_name && <p className="text-xs text-gray-500 mt-2">{cat.short_name}{cat.code ? ` (${cat.code})` : ""}</p>}
                <p className="text-xs text-gray-400 mt-2">{(cat as any)._count?.competitions || 0} competitions</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

