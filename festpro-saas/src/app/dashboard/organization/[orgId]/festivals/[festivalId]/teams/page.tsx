"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Users, Plus, Search, Trash2, Edit2, Shield, X, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle"

interface Team {
  id: string
  name: string
  code: string
  color: string
  total_points: number
  leader_name?: string
  members_count?: number
}

export default function FestivalTeamsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [teamName, setTeamName] = useState("")
  const [teamCode, setTeamCode] = useState("")
  const [teamColor, setTeamColor] = useState("#4F46E5")
  const [submitting, setSubmitting] = useState(false)

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch(`/api/festival/${festivalId}/workspace?scope=teams`, { cache: "no-store" })
      if (res.ok) {
        const json = await res.json()
        setTeams((json.teams || []) as Team[])
      }
    } catch (e) {
      console.error("Failed to fetch teams:", e)
    } finally {
      setLoading(false)
    }
  }, [festivalId])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  const handleOpenAdd = () => {
    setEditingTeam(null)
    setTeamName("")
    setTeamCode("")
    setTeamColor("#4F46E5")
    setIsModalOpen(true)
  }

  const handleOpenEdit = (t: Team) => {
    setEditingTeam(t)
    setTeamName(t.name)
    setTeamCode(t.code)
    setTeamColor(t.color || "#4F46E5")
    setIsModalOpen(true)
  }

  const handleDeleteTeam = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return
    try {
      const res = await fetch(`/api/festival/${festivalId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_team", payload: { id } }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || "Failed to delete team")
        return
      }
      setTeams((prev) => prev.filter((t) => t.id !== id))
      toast.success(`Team "${name}" deleted`)
    } catch {
      toast.error("Failed to delete team")
    }
  }

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim()) {
      toast.error("Team name is required")
      return
    }

    setSubmitting(true)
    const code = teamCode.trim().toUpperCase() || teamName.trim().slice(0, 3).toUpperCase()
    try {
      const res = await fetch(`/api/festival/${festivalId}/operations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_team",
          payload: {
            id: editingTeam?.id,
            name: teamName.trim(),
            code,
            color: teamColor,
          },
        }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        toast.error(json.error || "Failed to save team")
        return
      }
      toast.success(editingTeam ? "Team updated successfully" : `Team "${teamName}" created!`)
      setIsModalOpen(false)
      fetchTeams()
    } catch {
      toast.error("Failed to save team")
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = teams.filter((t) => {
    const s = search.toLowerCase()
    return t.name.toLowerCase().includes(s) || (t.code && t.code.toLowerCase().includes(s))
  })

  const exportColumns = [
    { header: "Team Name", accessor: (t: Team) => t.name },
    { header: "Code", accessor: (t: Team) => t.code },
    { header: "Color", accessor: (t: Team) => t.color },
    { header: "Total Points", accessor: (t: Team) => t.total_points || 0 },
  ]

  const count = teams.length

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Teams</h1>
            <p className="text-xs text-slate-500 font-medium">Create house teams, assign team managers and view score tallies</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Excel / PDF Toolbar */}
          <ExportPrintBar
            title="Festival Teams List"
            subtitle="FestPro Festival Management System"
            data={filtered}
            columns={exportColumns}
            filename="teams"
          />

          {/* Line vs Grid View Toggle */}
          <ViewToggle mode={viewMode} onChange={setViewMode} />

          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/teams/portal`}
            className="rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs px-3.5 py-2 flex items-center gap-1.5 transition-all"
          >
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            <span>Team Manager Portal</span>
          </Link>

          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Team
          </Button>
        </div>
      </div>

      {/* ── TOTAL TEAMS METRIC CARD ── */}
      <div className="w-full sm:w-64">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">Total Teams</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{count}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 text-slate-400">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ── SEARCH BAR (Screenshot 3) ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search teams by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-xs"
        />
      </div>

      {/* ── CONTENT AREA (Grid View vs Line View) ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading teams...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <Users className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No teams found</h3>
          <p className="text-xs text-slate-400">Create house teams for your festival competitions.</p>
          <Button size="sm" onClick={handleOpenAdd} className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Team
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW (Exact layout from Screenshot 3) ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">{t.name}</h3>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase text-white shadow-2xs"
                  style={{ backgroundColor: t.color || "#4F46E5" }}
                >
                  {t.code || "TM"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span>Code:</span>
                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {t.code || "BJ"}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(t)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors text-center"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTeam(t.id, t.name)}
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── LINE / TABLE VIEW ── */
        <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Team Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Color</th>
                  <th className="py-3 px-4">Total Points</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{t.name}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{t.code}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border border-slate-300" style={{ backgroundColor: t.color }} />
                        <span className="text-[11px] text-slate-500 font-mono">{t.color}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-indigo-700">{t.total_points || 0} pts</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(t)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTeam(t.id, t.name)}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">{editingTeam ? "Edit Team" : "Add Team"}</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label className="block text-slate-600">Team Name</label>
                <Input
                  required
                  placeholder="e.g. Emerald House"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Team Code</label>
                <Input
                  placeholder="e.g. EMR"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                  className="h-10 rounded-xl border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-600">Team Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={teamColor}
                    onChange={(e) => setTeamColor(e.target.value)}
                    className="h-10 w-12 rounded-xl cursor-pointer border border-slate-200 p-1"
                  />
                  <Input
                    value={teamColor}
                    onChange={(e) => setTeamColor(e.target.value)}
                    className="h-10 rounded-xl border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {submitting ? "Saving..." : editingTeam ? "Update Team" : "Add Team"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
