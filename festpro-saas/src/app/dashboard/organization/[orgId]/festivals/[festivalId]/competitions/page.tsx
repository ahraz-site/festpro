"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Trophy, Plus, Search, Filter, Trash2, Edit2, Loader2,
  Check, X, Users, Layers, ExternalLink, Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getCompetitions, createCompetition, updateCompetition, deleteCompetition } from "@/lib/actions/competition"
import { getCategories } from "@/lib/actions/competition/categories"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle"
import type { Competition, CompetitionCategory } from "@/types/competition"
import {
  getCachedWorkspace,
  fetchWorkspaceWithSWR,
  invalidateFestivalWorkspace,
} from "@/lib/cache/workspace-cache"

export default function CompetitionsManagementPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const initialCache = getCachedWorkspace(festivalId, "competitions")
  const [competitions, setCompetitions] = useState<Competition[]>(() => (initialCache?.competitions || []) as Competition[])
  const [categories, setCategories] = useState<CompetitionCategory[]>(() => (initialCache?.categories || []) as CompetitionCategory[])
  const [maxLimit, setMaxLimit] = useState<number | null>(() => initialCache?.license?.max_competitions ?? null)
  const [loading, setLoading] = useState(!initialCache)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Filters
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all") // all, individual, group
  const [stageFilter, setStageFilter] = useState("all") // all, stage, no_stage
  const [categoryFilter, setCategoryFilter] = useState("all")

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingComp, setEditingComp] = useState<Competition | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form Fields
  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [compType, setCompType] = useState<"individual" | "group">("individual")
  const [stageRequired, setStageRequired] = useState(true)
  const [duration, setDuration] = useState("30")

  const loadData = useCallback(async () => {
    try {
      await fetchWorkspaceWithSWR(festivalId, "competitions", (json) => {
        setCompetitions((json.competitions || []) as Competition[])
        const cats = (json.categories || []) as CompetitionCategory[]
        setCategories(cats)
        if (json.license !== undefined) {
          setMaxLimit(json.license?.max_competitions ?? null)
        }
        if (cats[0]) setCategoryId((prev) => prev || cats[0].id)
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [festivalId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenAdd = () => {
    setEditingComp(null)
    setName("")
    setCompType("individual")
    setStageRequired(true)
    setDuration("30")
    if (categories[0]) setCategoryId(categories[0].id)
    setShowAddModal(true)
  }

  const handleOpenEdit = (comp: Competition) => {
    setEditingComp(comp)
    setName(comp.name)
    setCategoryId(comp.category_id || (categories[0]?.id || ""))
    setCompType(((comp.competition_type as string) === "group" || comp.competition_type === "team") ? "group" : "individual")
    setStageRequired(comp.stage_required ?? true)
    setDuration(String(comp.duration_minutes || 30))
    setShowAddModal(true)
  }

  const handleDelete = async (id: string, compName: string) => {
    if (!confirm(`Are you sure you want to delete program "${compName}"?`)) return
    const res = await deleteCompetition(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      invalidateFestivalWorkspace(festivalId)
      toast.success("Program removed")
      setCompetitions((prev) => prev.filter((c) => c.id !== id))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Program name is required")
      return
    }

    setSubmitting(true)
    const code = name.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "") + "-" + Math.floor(Math.random() * 90 + 10)
    const payload = {
      name,
      category_id: categoryId || categories[0]?.id,
      competition_type: compType,
      is_team_event: compType === "group",
      stage_required: stageRequired,
      duration_minutes: duration,
      code,
      status: "published",
    }

    const res = editingComp
      ? await updateCompetition(editingComp.id, payload as any)
      : await createCompetition(festivalId, payload as any)

    setSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      invalidateFestivalWorkspace(festivalId)
      toast.success(editingComp ? "Program updated" : "Program added successfully!")
      setShowAddModal(false)
      loadData()
    }
  }

  const filtered = competitions.filter((c) => {
    const s = search.toLowerCase()
    const matchesSearch = c.name.toLowerCase().includes(s) || (c.code && c.code.toLowerCase().includes(s))
    if (!matchesSearch) return false

    // Type filter (Screenshot 10)
    const isCompGroup = (c.competition_type as string) === "group" || c.competition_type === "team"
    if (typeFilter === "group" && !isCompGroup) return false
    if (typeFilter === "individual" && isCompGroup) return false

    // Stage filter
    if (stageFilter === "stage" && c.stage_required === false) return false
    if (stageFilter === "no_stage" && c.stage_required !== false) return false

    // Category filter
    if (categoryFilter !== "all") {
      const catName = categories.find((cat) => cat.id === c.category_id)?.name || (c as any).category?.name || ""
      if (catName.toLowerCase() !== categoryFilter.toLowerCase()) return false
    }

    return true
  })

  const exportColumns = [
    { header: "Program Name", accessor: (c: Competition) => c.name },
    {
      header: "Category",
      accessor: (c: Competition) =>
        categories.find((cat) => cat.id === c.category_id)?.name || (c as any).category?.name || "Senior",
    },
    {
      header: "Type",
      accessor: (c: Competition) =>
        ((c.competition_type as string) === "group" || c.competition_type === "team") ? "Group" : "Individual",
    },
    { header: "Stage", accessor: (c: Competition) => (c.stage_required !== false ? "Stage" : "No Stage") },
    { header: "Duration", accessor: (c: Competition) => `${c.duration_minutes || 30} mins` },
    { header: "Code", accessor: (c: Competition) => c.code || "-" },
  ]

  const count = competitions.length
  const remaining = maxLimit !== null ? Math.max(0, maxLimit - count) : null

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Programs</h1>
            <p className="text-xs text-slate-500 font-medium">Create and schedule individual & group competition events</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Excel / PDF Toolbar */}
          <ExportPrintBar
            title="Festival Competition Programs"
            subtitle="FestPro Festival Management System"
            data={filtered}
            columns={exportColumns}
            filename="programs"
          />

          {/* Line vs Grid View Toggle */}
          <ViewToggle mode={viewMode} onChange={setViewMode} />

          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add program
          </Button>
        </div>
      </div>

      {/* ── SUMMARY BAR (Real Count + License Quota if applicable) ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 shadow-xs">
        <Check className="h-4 w-4 text-indigo-600 shrink-0" />
        <span>
          {maxLimit !== null ? (
            <>
              <strong className="text-slate-900">{count} of {maxLimit} programs</strong> · {remaining} remaining
            </>
          ) : (
            <strong className="text-slate-900">{count} competition programs</strong>
          )}
        </span>
      </div>

      {/* ── SEARCH & 3-FILTER BAR (Screenshot 9 & 10) ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-xs"
          />
        </div>

        {/* Filter 1: Type (All Types, Group, Individual) */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
        >
          <option value="all">Type: All Types</option>
          <option value="individual">Individual</option>
          <option value="group">Group</option>
        </select>

        {/* Filter 2: Stage (All Stages, Stage, No stage) */}
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
        >
          <option value="all">Stage: All Stages</option>
          <option value="stage">Stage</option>
          <option value="no_stage">No stage</option>
        </select>

        {/* Filter 3: Category */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
        >
          <option value="all">Category: All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* ── CONTENT AREA (Grid View vs Line View) ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading programs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <Trophy className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No programs found</h3>
          <p className="text-xs text-slate-400">Add competition programs like Solo Song, Group Dance, or Elocution.</p>
          <Button size="sm" onClick={handleOpenAdd} className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Program
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW (Exact layout from Screenshot 9) ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((comp) => {
            const catName =
              categories.find((cat) => cat.id === comp.category_id)?.name ||
              (comp as any).category?.name ||
              "Senior"
            const isGroup = (comp.competition_type as string) === "group" || comp.competition_type === "team"
            const onStage = comp.stage_required !== false

            return (
              <div
                key={comp.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">{comp.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">{catName}</p>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                      {isGroup ? "Group" : "Individual"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                      {onStage ? "Stage" : "No stage"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  <Link
                    href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/${comp.id}`}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition-colors"
                  >
                    View details
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(comp)}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(comp.id, comp.name)}
                    className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition-colors"
                  >
                    Delete
                  </button>
                  <Link
                    href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/${comp.id}/participants`}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors"
                  >
                    Assign participants
                  </Link>
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
                  <th className="py-3 px-4">Program Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((comp) => {
                  const catName =
                    categories.find((cat) => cat.id === comp.category_id)?.name ||
                    (comp as any).category?.name ||
                    "Senior"
                  const isGroup = (comp.competition_type as string) === "group" || comp.competition_type === "team"
                  const onStage = comp.stage_required !== false

                  return (
                    <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{comp.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{catName}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                          {isGroup ? "Group" : "Individual"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                          {onStage ? "Stage" : "No stage"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{comp.duration_minutes || 30} mins</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(comp)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(comp.id, comp.name)}
                            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition-colors"
                          >
                            Delete
                          </button>
                          <Link
                            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/${comp.id}/participants`}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors"
                          >
                            Assign
                          </Link>
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

      {/* ── ADD / EDIT PROGRAM MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">{editingComp ? "Edit Program" : "Add Program"}</h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-600">Program Name</label>
                <Input
                  required
                  placeholder="e.g. Solo Song, Group Dance, Elocution"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-slate-600">Type</label>
                  <select
                    value={compType}
                    onChange={(e) => setCompType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                  >
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-600">Stage</label>
                  <select
                    value={stageRequired ? "true" : "false"}
                    onChange={(e) => setStageRequired(e.target.value === "true")}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                  >
                    <option value="true">Stage</option>
                    <option value="false">No stage</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Duration (Minutes)</label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {submitting ? "Saving..." : editingComp ? "Save Changes" : "Add Program"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
