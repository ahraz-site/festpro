"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getFestivalStages, createFestivalStage, updateFestivalStage, deleteFestivalStage, getFestivalVenues } from "@/lib/actions/festival"
import type { FestivalStage, FestivalVenue } from "@/types/festival"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle"
import {
  Layers, Plus, Loader2, Trash2, Edit3, Search,
  Tv, X, Check, AlertCircle, ExternalLink
} from "lucide-react"

export default function FestivalStagesPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [stages, setStages] = useState<FestivalStage[]>([])
  const [venues, setVenues] = useState<FestivalVenue[]>([])
  const [maxStages, setMaxStages] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingStage, setEditingStage] = useState<FestivalStage | null>(null)
  const [form, setForm] = useState({ name: "", code: "", venue_id: "", capacity: "500", stage_type: "Main" })

  async function load() {
    try {
      const [wsRes, venuesData] = await Promise.all([
        fetch(`/api/festival/${festivalId}/workspace?scope=stages`, { cache: "no-store" }).then((r) => r.json()),
        getFestivalVenues(festivalId).catch(() => []),
      ])
      setStages((wsRes?.stages || []) as FestivalStage[])
      setVenues((venuesData || []) as FestivalVenue[])
      setMaxStages(wsRes?.license?.max_stages ?? null)
    } catch (err) {
      console.error("Failed to load stages:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [festivalId])

  const handleOpenAdd = () => {
    setEditingStage(null)
    setForm({ name: `Stage ${stages.length + 1}`, code: `STG-${stages.length + 1}`, venue_id: venues[0]?.id || "", capacity: "500", stage_type: "Main" })
    setShowModal(true)
  }

  const handleOpenEdit = (stage: FestivalStage) => {
    setEditingStage(stage)
    setForm({
      name: stage.name,
      code: stage.code || "",
      venue_id: stage.venue_id || "",
      capacity: String(stage.capacity || 500),
      stage_type: stage.stage_type || "Main",
    })
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error("Stage name is required")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/festival/${festivalId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_stage",
          payload: {
            id: editingStage?.id,
            name: form.name,
            code: form.code || null,
            venue_id: form.venue_id || null,
            capacity: form.capacity ? parseInt(form.capacity) : 500,
            stage_type: form.stage_type || "Main",
          },
        }),
      })
      const result = await res.json()
      if (!res.ok || result.error) {
        toast.error(result.error || "Failed to save stage")
      } else {
        toast.success(editingStage ? "Stage updated" : "Stage created")
        setShowModal(false)
        await load()
      }
    } catch {
      toast.error("Failed to save stage")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    try {
      const res = await fetch(`/api/festival/${festivalId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_stage", payload: { id } }),
      })
      const result = await res.json()
      if (!res.ok || result.error) {
        toast.error(result.error || "Failed to delete stage")
      } else {
        toast.success("Stage deleted")
        await load()
      }
    } catch {
      toast.error("Failed to delete stage")
    }
  }

  const filtered = stages.filter((s) => {
    const q = search.toLowerCase()
    return s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q))
  })

  const exportColumns = [
    { header: "Stage Name", accessor: (s: FestivalStage) => s.name },
    { header: "Code", accessor: (s: FestivalStage) => s.code || "-" },
    { header: "Capacity", accessor: (s: FestivalStage) => String(s.capacity || 500) },
    { header: "Type", accessor: (s: FestivalStage) => s.stage_type || "Main" },
  ]

  const count = stages.length

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Stages</h1>
          <p className="text-xs text-slate-500 font-medium">Manage venues, performance zones, and live stage feeds</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportPrintBar
            title="Festival Performance Stages"
            subtitle="FestPro Festival Management System"
            data={filtered}
            columns={exportColumns}
            filename="stages"
          />

          <ViewToggle mode={viewMode} onChange={setViewMode} />

          {/* TV Displays Button */}
          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/tv-displays`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Tv className="h-4 w-4 text-slate-500" />
            <span>TV displays</span>
          </Link>

          {/* Add Stage Button */}
          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add stage
          </Button>
        </div>
      </div>

      {/* ── LICENSE LIMIT REACHED BANNER (Only if license explicitly defines max_stages) ── */}
      {maxStages !== null && count >= maxStages && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-amber-200 bg-amber-50/70 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5 font-semibold">
            <div className="p-1 rounded-full bg-amber-100 text-amber-700">
              <AlertCircle className="h-4 w-4" />
            </div>
            <span>
              <strong>{count} of {maxStages} stages</strong> configured in current plan
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/contact"
              className="px-3 py-1.5 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 text-amber-800 font-bold text-xs transition-colors"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      )}

      {/* ── SEARCH BAR (Screenshot 2) ── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search stages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-xs"
        />
      </div>

      {/* ── CONTENT AREA (Screenshot 2: Stage 1 Card with Edit & Delete) ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading stages...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <Layers className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No stages found</h3>
          <p className="text-xs text-slate-400">Add a stage to schedule and run your festival programs.</p>
          <Button size="sm" onClick={handleOpenAdd} className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Stage
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((stage) => (
            <div
              key={stage.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 max-w-sm"
            >
              <div>
                <h3 className="text-lg font-black text-slate-900">{stage.name}</h3>
                {stage.code && <p className="text-xs text-slate-400 font-mono mt-0.5">{stage.code}</p>}
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                    Capacity: {stage.capacity || 500}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                    {stage.stage_type || "Main"}
                  </span>
                </div>
              </div>

              {/* Action Buttons (Screenshot 2: Edit & Delete) */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(stage)}
                  className="rounded-xl text-xs font-semibold px-4 h-8 text-slate-700 hover:bg-slate-50 border-slate-200"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDelete(stage.id, stage.name)}
                  className="rounded-xl text-xs font-semibold px-4 h-8 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5">Stage Name</th>
                  <th className="py-3 px-5">Code</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Capacity</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((stage) => (
                  <tr key={stage.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900">{stage.name}</td>
                    <td className="py-4 px-5 font-mono text-slate-500">{stage.code || "-"}</td>
                    <td className="py-4 px-5 text-slate-600">{stage.stage_type || "Main"}</td>
                    <td className="py-4 px-5 text-slate-600">{stage.capacity || 500}</td>
                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(stage)}
                          className="rounded-xl text-xs font-semibold px-3 h-8 text-slate-700 border-slate-200"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDelete(stage.id, stage.name)}
                          className="rounded-xl text-xs font-semibold px-3 h-8 bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT STAGE MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">{editingStage ? "Edit Stage" : "Add Stage"}</h2>
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
                <label className="block text-slate-600">Stage Name *</label>
                <Input
                  required
                  placeholder="e.g. Stage 1, Main Auditorium"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-10 rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-slate-600">Code</label>
                  <Input
                    placeholder="e.g. STG-1"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="h-10 rounded-xl border-slate-200 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-slate-600">Capacity</label>
                  <Input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    className="h-10 rounded-xl border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Stage Type</label>
                <select
                  value={form.stage_type}
                  onChange={(e) => setForm({ ...form, stage_type: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                >
                  <option value="Main">Main Stage</option>
                  <option value="Auditorium">Auditorium</option>
                  <option value="Classroom">Classroom / Indoor</option>
                  <option value="Open Ground">Open Ground</option>
                </select>
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
                  {saving ? "Saving..." : editingStage ? "Update Stage" : "Create Stage"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
