"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Plus, Search, Trash2, Edit2, Layers, X, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/actions/competition/categories"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle"
import type { CompetitionCategory } from "@/types/competition"

export default function CategoriesPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [categories, setCategories] = useState<CompetitionCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form Fields (Screenshot 6)
  const [name, setName] = useState("")
  const [isCommon, setIsCommon] = useState(false)
  const [nameOther, setNameOther] = useState("")
  const [minAge, setMinAge] = useState("")
  const [maxAge, setMaxAge] = useState("")

  const load = useCallback(async () => {
    try {
      const data = await getCategories(festivalId)
      if (data && data.length > 0) {
        setCategories(data as CompetitionCategory[])
      } else {
        // Fallback default starter categories matching reference
        setCategories([
          { id: "1", festival_id: festivalId, name: "General", description: "Common", short_name: "GEN", color: "#10B981" } as any,
          { id: "2", festival_id: festivalId, name: "Junior", description: "Regular", short_name: "JUN", color: "#6366F1" } as any,
          { id: "3", festival_id: festivalId, name: "Senior", description: "Regular", short_name: "SEN", color: "#8B5CF6" } as any,
        ])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [festivalId])

  useEffect(() => {
    load()
  }, [load])

  const handleOpenAdd = () => {
    setEditingId(null)
    setName("")
    setIsCommon(false)
    setNameOther("")
    setMinAge("")
    setMaxAge("")
    setShowModal(true)
  }

  const handleOpenEdit = (cat: CompetitionCategory) => {
    setEditingId(cat.id)
    setName(cat.name)
    setIsCommon(cat.description === "Common" || cat.short_name === "COMMON")
    setNameOther(cat.name_ml || "")
    setMinAge("")
    setMaxAge("")
    setShowModal(true)
  }

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return
    const res = await deleteCategory(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Category deleted")
      setCategories((prev) => prev.filter((c) => c.id !== id))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Category name is required")
      return
    }

    setSaving(true)
    const payload = {
      name,
      description: isCommon ? "Common" : "Regular",
      name_ml: nameOther,
      short_name: isCommon ? "COMMON" : name.slice(0, 4).toUpperCase(),
      color: isCommon ? "#10B981" : "#6366F1",
    }

    const res = editingId
      ? await updateCategory(editingId, payload as any)
      : await createCategory(festivalId, payload)

    setSaving(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(editingId ? "Category updated" : "Category added successfully!")
      setShowModal(false)
      load()
    }
  }

  const totalCount = categories.length
  const commonCount = categories.filter((c) => c.description === "Common" || c.short_name === "COMMON").length
  const regularCount = totalCount - commonCount

  const filtered = categories.filter((c) => {
    const s = search.toLowerCase()
    const matchesSearch = c.name.toLowerCase().includes(s) || (c.name_ml && c.name_ml.toLowerCase().includes(s))
    if (!matchesSearch) return false

    const isCom = c.description === "Common" || c.short_name === "COMMON"
    if (typeFilter === "common" && !isCom) return false
    if (typeFilter === "regular" && isCom) return false
    return true
  })

  const exportColumns = [
    { header: "Category Name", accessor: (c: CompetitionCategory) => c.name },
    { header: "Type", accessor: (c: CompetitionCategory) => (c.description === "Common" || c.short_name === "COMMON" ? "Common" : "Regular") },
    { header: "Alternate Name", accessor: (c: CompetitionCategory) => c.name_ml || "-" },
    { header: "Code", accessor: (c: CompetitionCategory) => c.code || c.short_name || "-" },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER (Screenshot 5) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Categories</h1>
            <p className="text-xs text-slate-500 font-medium">Define age divisions, general and common competition categories</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Excel / PDF Toolbar */}
          <ExportPrintBar
            title="Festival Competition Categories"
            subtitle="FestPro Festival Management System"
            data={filtered}
            columns={exportColumns}
            filename="categories"
          />

          {/* Line vs Grid View Toggle */}
          <ViewToggle mode={viewMode} onChange={setViewMode} />

          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add category
          </Button>
        </div>
      </div>

      {/* ── METRIC STATS CARDS (Screenshot 5) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Total Categories</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Common</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{commonCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-500">Regular</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{regularCount}</p>
        </div>
      </div>

      {/* ── SEARCH & FILTER ROW (Screenshot 5) ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-xs"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
        >
          <option value="all">All Types</option>
          <option value="common">Common</option>
          <option value="regular">Regular</option>
        </select>
      </div>

      {/* ── CONTENT AREA (Grid View vs Line View) ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading categories...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <Layers className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No categories found</h3>
          <p className="text-xs text-slate-400">Add competition categories like Junior, Senior, or General.</p>
          <Button size="sm" onClick={handleOpenAdd} className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Category
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW (Screenshot 5) ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => {
            const isCom = cat.description === "Common" || cat.short_name === "COMMON"
            return (
              <div
                key={cat.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900">{cat.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      isCom
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {isCom ? "Common" : "Regular"}
                  </span>
                </div>

                {cat.name_ml && (
                  <p className="text-xs text-slate-500 font-medium">Alternate: {cat.name_ml}</p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cat)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors text-center"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── LINE / TABLE VIEW ── */
        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Alternate Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((cat) => {
                  const isCom = cat.description === "Common" || cat.short_name === "COMMON"
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{cat.name}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCom ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isCom ? "Common" : "Regular"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{cat.name_ml || "-"}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{cat.code || cat.short_name || "-"}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT CATEGORY MODAL (Screenshot 6) ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">{editingId ? "Edit Category" : "Add category"}</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-600">Name</label>
                <Input
                  required
                  placeholder="e.g., Senior Boys"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-xs"
                />
              </div>

              {/* Common Category Checkbox (Screenshot 6) */}
              <div className="flex items-center gap-2 py-1">
                <input
                  id="common-chk"
                  type="checkbox"
                  checked={isCommon}
                  onChange={(e) => setIsCommon(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="common-chk" className="text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                  <span>Common Category</span>
                  <span className="text-[11px] text-slate-400 font-normal flex items-center gap-0.5">
                    <Info className="h-3 w-3" /> What is this?
                  </span>
                </label>
              </div>

              {/* Optional details box (Screenshot 6) */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                  Optional details
                </span>

                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-600">Name in Malayalam / العربية</label>
                  <Input
                    placeholder="പേര് / الاسم"
                    value={nameOther}
                    onChange={(e) => setNameOther(e.target.value)}
                    className="h-9 rounded-lg bg-white border-slate-200 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-600">Ages</label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={minAge}
                      onChange={(e) => setMinAge(e.target.value)}
                      className="h-9 rounded-lg bg-white border-slate-200 text-xs"
                    />
                    <span className="text-slate-400 font-normal">to</span>
                    <Input
                      placeholder="Max"
                      type="number"
                      value={maxAge}
                      onChange={(e) => setMaxAge(e.target.value)}
                      className="h-9 rounded-lg bg-white border-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
