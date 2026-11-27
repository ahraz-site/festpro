"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Users, Plus, Search, Filter, Trash2, Edit2, Loader2,
  Trophy, Check, X, Bookmark, Layers, Sparkles
} from "lucide-react"
import { toast } from "sonner"
import {
  softDeleteParticipant,
  addFestParticipantAction,
  updateFestParticipantAction,
  bulkAddParticipantsAction,
} from "@/lib/actions/participant"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle"
import type { Participant } from "@/types/participant"
import type { CompetitionCategory, Competition } from "@/types/competition"
import {
  getCachedWorkspace,
  fetchWorkspaceWithSWR,
  invalidateFestivalWorkspace,
} from "@/lib/cache/workspace-cache"

export default function ParticipantsManagementPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const initialCache = getCachedWorkspace(festivalId, "participants")

  const [participants, setParticipants] = useState<Participant[]>(() => (initialCache?.participants || []) as Participant[])
  const [categories, setCategories] = useState<CompetitionCategory[]>(() => (initialCache?.categories || []) as CompetitionCategory[])
  const [teams, setTeams] = useState<{ id: string; name: string; code: string }[]>(() => initialCache?.teams || [])
  const [competitions, setCompetitions] = useState<Competition[]>(() => (initialCache?.competitions || []) as Competition[])
  const [registrations, setRegistrations] = useState<Array<{ participant_id: string; competition_id: string }>>(() => initialCache?.registrations || [])
  const [maxLimit, setMaxLimit] = useState<number | null>(() => initialCache?.license?.max_participants ?? null)
  const [loading, setLoading] = useState(!initialCache)
  const [viewMode, setViewMode] = useState<ViewMode>("table")

  // Filters
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [teamFilter, setTeamFilter] = useState("all")

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [programModalParticipant, setProgramModalParticipant] = useState<Participant | null>(null)
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Single Add / Edit Form
  const [formName, setFormName] = useState("")
  const [formNameMl, setFormNameMl] = useState("")
  const [formDob, setFormDob] = useState("")
  const [formCategory, setFormCategory] = useState("")
  const [formTeam, setFormTeam] = useState("")

  // Bulk Add Form
  const [bulkTeam, setBulkTeam] = useState("")
  const [bulkCategory, setBulkCategory] = useState("")
  const [bulkNames, setBulkNames] = useState("")

  const applyWorkspace = useCallback((json: any) => {
    const partsList = (json.participants || []) as Participant[]
    const catsList = (json.categories || []) as CompetitionCategory[]
    const teamsList = (json.teams || []) as { id: string; name: string; code: string }[]
    const compsList = (json.competitions || []) as Competition[]
    const regsList = (json.registrations || []) as Array<{ participant_id: string; competition_id: string }>

    setParticipants(partsList)
    setCategories(catsList)
    setTeams(teamsList)
    setCompetitions(compsList)
    setRegistrations(regsList)
    if (json.license !== undefined) {
      setMaxLimit(json.license?.max_participants ?? null)
    }

    if (teamsList[0]) {
      setFormTeam((prev) => prev || teamsList[0].code || teamsList[0].name)
      setBulkTeam((prev) => prev || teamsList[0].code || teamsList[0].name)
    }
    if (catsList[0]) {
      setFormCategory((prev) => prev || catsList[0].name)
      setBulkCategory((prev) => prev || catsList[0].name)
    }
  }, [])

  const loadData = useCallback(async () => {
    try {
      await fetchWorkspaceWithSWR(festivalId, "participants", applyWorkspace)
    } catch (err) {
      console.error("Failed to load participants workspace:", err)
    } finally {
      setLoading(false)
    }
  }, [festivalId, applyWorkspace])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this participant?")) return
    const res = await softDeleteParticipant(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      invalidateFestivalWorkspace(festivalId)
      toast.success("Participant removed")
      setParticipants((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormName("")
    setFormNameMl("")
    setFormDob("")
    setFormCategory(categories[0]?.name || "")
    setFormTeam(teams[0]?.code || teams[0]?.name || "")
    setShowAddModal(true)
  }

  const handleOpenEdit = (p: Participant) => {
    setEditingId(p.id)
    setFormName(`${p.first_name || ""} ${p.last_name || ""}`.trim())
    setFormNameMl(p.notes || "")
    setFormDob(p.date_of_birth || "")
    setFormCategory(p.division || categories[0]?.name || "")
    setFormTeam(p.unit || teams[0]?.code || teams[0]?.name || "")
    setShowAddModal(true)
  }

  const handleOpenProgramsModal = (p: Participant) => {
    const enrolled = registrations
      .filter((r) => r.participant_id === p.id)
      .map((r) => r.competition_id)
    setSelectedProgramIds(enrolled)
    setProgramModalParticipant(p)
  }

  const handleSavePrograms = async () => {
    if (!programModalParticipant) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/festival/${festivalId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sync_participant_programs",
          payload: {
            participantId: programModalParticipant.id,
            competitionIds: selectedProgramIds,
          },
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || "Failed to save program enrollments")
      } else {
        invalidateFestivalWorkspace(festivalId)
        toast.success("Program enrollments updated!")
        setProgramModalParticipant(null)
        loadData()
      }
    } catch {
      toast.error("Failed to update enrollments")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSingleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      toast.error("Participant name is required")
      return
    }
    setSubmitting(true)
    const res = editingId
      ? await updateFestParticipantAction(editingId, festivalId, {
          name: formName,
          name_ml: formNameMl,
          date_of_birth: formDob,
          team: formTeam || teams[0]?.code || teams[0]?.name || "",
          category: formCategory || categories[0]?.name || "General",
        })
      : await addFestParticipantAction(festivalId, {
          name: formName,
          name_ml: formNameMl,
          date_of_birth: formDob,
          team: formTeam || teams[0]?.code || teams[0]?.name || "",
          category: formCategory || categories[0]?.name || "General",
        })

    setSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      invalidateFestivalWorkspace(festivalId)
      toast.success(editingId ? "Participant updated!" : "Participant added successfully!")
      setShowAddModal(false)
      setEditingId(null)
      setFormName("")
      setFormNameMl("")
      setFormDob("")
      loadData()
    }
  }

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkNames.trim()) {
      toast.error("Please enter participant names (one per line)")
      return
    }
    setSubmitting(true)
    const res = await bulkAddParticipantsAction(
      festivalId,
      bulkTeam || teams[0]?.code || teams[0]?.name || "",
      bulkCategory || categories[0]?.name || "General",
      bulkNames
    )
    setSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      invalidateFestivalWorkspace(festivalId)
      toast.success(`Successfully added ${res.count} participants!`)
      setShowBulkModal(false)
      setBulkNames("")
      loadData()
    }
  }

  const filtered = participants.filter((p) => {
    const fullName = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase()
    const chest = (p.chest_number || "").toLowerCase()
    const team = (p.unit || "").toLowerCase()
    const cat = (p.division || "").toLowerCase()

    if (search) {
      const s = search.toLowerCase()
      if (!fullName.includes(s) && !chest.includes(s) && !team.includes(s) && !cat.includes(s)) {
        return false
      }
    }
    if (categoryFilter !== "all" && cat !== categoryFilter.toLowerCase()) return false
    if (teamFilter !== "all" && team !== teamFilter.toLowerCase()) return false
    return true
  })

  // Export Columns definition
  const exportColumns = [
    { header: "Chest No", accessor: (p: Participant) => p.chest_number || "-" },
    { header: "First Name", accessor: (p: Participant) => p.first_name },
    { header: "Last Name", accessor: (p: Participant) => p.last_name || "" },
    { header: "Team", accessor: (p: Participant) => p.unit || "-" },
    { header: "Category", accessor: (p: Participant) => p.division || "-" },
    { header: "DOB", accessor: (p: Participant) => p.date_of_birth || "-" },
    { header: "Status", accessor: (p: Participant) => (p as any).status || "active" },
  ]

  const count = participants.length
  const remaining = maxLimit !== null ? Math.max(0, maxLimit - count) : null

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Participants</h1>
            <p className="text-xs text-slate-500 font-medium">Manage and assign participants to teams & programs</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Excel / PDF Toolbar */}
          <ExportPrintBar
            title="Festival Participants Roster"
            subtitle="FestPro Festival Management System"
            data={filtered}
            columns={exportColumns}
            filename="participants"
          />

          {/* Line vs Grid View Toggle */}
          <ViewToggle mode={viewMode} onChange={setViewMode} />

          {/* Action Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkModal(true)}
            className="rounded-xl text-xs font-bold border-slate-300 hover:bg-slate-50 text-slate-700"
          >
            Bulk add participants
          </Button>

          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add participant
          </Button>
        </div>
      </div>

      {/* ── SUMMARY BAR (Real Count + License Quota if applicable) ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 shadow-xs">
        <Check className="h-4 w-4 text-indigo-600 shrink-0" />
        <span>
          {maxLimit !== null ? (
            <>
              <strong className="text-slate-900">{count} of {maxLimit} participants</strong> · {remaining} remaining
            </>
          ) : (
            <strong className="text-slate-900">{count} registered participants</strong>
          )}
        </span>
      </div>

      {/* ── SEARCH & FILTER ROW (Screenshot 4 & 7) ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, team, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-xs"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
        >
          <option value="all">Filter by Category (All)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-indigo-500"
        >
          <option value="all">Filter by Team (All)</option>
          {teams.map((t) => (
            <option key={t.id} value={t.code || t.name}>{t.name} ({t.code || t.name})</option>
          ))}
        </select>
      </div>

      {/* ── CONTENT AREA (Toggle between Line View and Grid View) ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading participants...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <Users className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No participants found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Get started by adding participants individually or bulk paste a list of participant names.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Button size="sm" onClick={handleOpenAdd} className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Participant
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowBulkModal(true)} className="rounded-xl text-xs">
              Bulk Add
            </Button>
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* ── 1. LINE / TABLE VIEW ── */
        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Chest number</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((p) => {
                  const fullName = `${p.first_name || ""} ${p.last_name || ""}`.trim()
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {fullName}
                        {p.notes && <span className="block text-[10px] text-slate-400 font-normal">{p.notes}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">
                        {p.chest_number || `#${p.id.slice(0, 5)}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                          {p.division || "General"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-200">
                          {p.unit || "Unassigned"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenProgramsModal(p)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Programs
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
      ) : (
        /* ── 2. GRID / CARDS VIEW ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const fullName = `${p.first_name || ""} ${p.last_name || ""}`.trim()
            return (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-slate-900 text-base leading-tight">
                      {fullName}
                    </h3>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 shrink-0">
                      {p.chest_number || `#${p.id.slice(0, 5)}`}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Category:</span>
                      <span className="font-semibold text-slate-700">{p.division || "General"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Team:</span>
                      <span className="font-bold text-indigo-700">{p.unit || "Unassigned"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(p)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors text-center cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenProgramsModal(p)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors text-center cursor-pointer"
                  >
                    Programs
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── MODAL 1: ADD / EDIT PARTICIPANT ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">
                {editingId ? "Edit participant" : "Add participant"}
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSingleAdd} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-600">Name</label>
                <Input
                  required
                  placeholder="Enter full name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Name in Malayalam / العربية (optional)</label>
                <Input
                  placeholder="പേര് / الاسم"
                  value={formNameMl}
                  onChange={(e) => setFormNameMl(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Date of birth (optional)</label>
                <Input
                  type="date"
                  value={formDob}
                  onChange={(e) => setFormDob(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Team</label>
                <select
                  value={formTeam}
                  onChange={(e) => setFormTeam(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.code || t.name}>{t.name} ({t.code || t.name})</option>
                  ))}
                </select>
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
                  {submitting ? "Saving..." : editingId ? "Update participant" : "Add participant"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: BULK ADD PARTICIPANTS (Exact layout from Screenshot 8) ── */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">Add multiple participants</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Select a team and category, then enter a list of participants (one per line).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBulkAdd} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-600">Team</label>
                <select
                  value={bulkTeam}
                  onChange={(e) => setBulkTeam(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.code || t.name}>{t.name} ({t.code || t.name})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Category</label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Participants</label>
                <textarea
                  rows={6}
                  placeholder="Participant 1&#10;Participant 2&#10;Participant 3"
                  value={bulkNames}
                  onChange={(e) => setBulkNames(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBulkModal(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {submitting ? "Adding..." : "Add participants"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: ENROLL IN PROGRAMS ── */}
      {programModalParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Programs for {programModalParticipant.first_name} {programModalParticipant.last_name}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Select competitions to enroll this participant
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProgramModalParticipant(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {competitions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No programs created yet. Add competitions first under Programs.
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {competitions.map((comp) => {
                  const checked = selectedProgramIds.includes(comp.id)
                  return (
                    <label
                      key={comp.id}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        checked ? "border-indigo-500 bg-indigo-50/70" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{comp.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {(comp as any).category?.name || "General"}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProgramIds((prev) => [...prev, comp.id])
                          } else {
                            setSelectedProgramIds((prev) => prev.filter((id) => id !== comp.id))
                          }
                        }}
                        className="h-4 w-4 accent-indigo-600 rounded"
                      />
                    </label>
                  )
                })}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setProgramModalParticipant(null)}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={submitting || competitions.length === 0}
                onClick={handleSavePrograms}
                className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {submitting ? "Saving..." : "Save Enrollments"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
