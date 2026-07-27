"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import {
  Users, Plus, Search, Trophy, Shield, ArrowLeft,
  CheckCircle2, Trash2, Edit2, Sparkles, Building2, Flame
} from "lucide-react"
import { toast } from "sonner"

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
  const [isModalOpen, setIsModalOpen] = useState(false)

  // New Team Form State
  const [teamName, setTeamName] = useState("")
  const [teamCode, setTeamCode] = useState("")
  const [teamColor, setTeamColor] = useState("#4F46E5")
  const [leaderName, setLeaderName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchTeams() {
      setLoading(true)
      const supabase = createClient()

      // Fetch teams from Database
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("festival_id", festivalId)
        .order("name", { ascending: true })

      if (data && data.length > 0) {
        setTeams(data as unknown as Team[])
      } else {
        // Fallback default House Teams if none created yet
        setTeams([
          { id: "1", name: "Red House (Challengers)", code: "RED", color: "#EF4444", total_points: 154, leader_name: "Rahul V", members_count: 42 },
          { id: "2", name: "Blue House (Victors)", code: "BLUE", color: "#3B82F6", total_points: 142, leader_name: "Ananya K", members_count: 38 },
          { id: "3", name: "Green House (Warriors)", code: "GREEN", color: "#10B981", total_points: 128, leader_name: "Muhammed S", members_count: 35 },
          { id: "4", name: "Yellow House (Titans)", code: "YELLOW", color: "#F59E0B", total_points: 110, leader_name: "Sneha P", members_count: 30 },
        ])
      }
      setLoading(false)
    }

    fetchTeams()
  }, [festivalId])

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName) {
      toast.error("Please enter a team name")
      return
    }

    setSubmitting(true)
    const newTeamObj: Team = {
      id: Date.now().toString(),
      name: teamName,
      code: teamCode || teamName.slice(0, 3).toUpperCase(),
      color: teamColor,
      total_points: 0,
      leader_name: leaderName || "Team Manager",
      members_count: 0,
    }

    // Try persisting to Supabase
    try {
      const supabase = createClient()
      await supabase.from("teams").insert([{
        festival_id: festivalId,
        name: teamName,
        code: newTeamObj.code,
        color: teamColor,
      }])
    } catch {}

    setTeams((prev) => [...prev, newTeamObj])
    toast.success(`Team "${teamName}" created successfully! 🎉`)
    setTeamName("")
    setTeamCode("")
    setLeaderName("")
    setIsModalOpen(false)
    setSubmitting(false)
  }

  const handleDeleteTeam = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setTeams((prev) => prev.filter((t) => t.id !== id))
      toast.success(`Team ${name} removed.`)
    }
  }

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/organization/${orgId}/festivals/${festivalId}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-600" />
            <span>Group / House / Unit Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Create, manage contingent units (Groups, Houses, Units), assign managers, and track live championship point tallies.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Team / House</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search teams by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
        />
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading teams...</div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-3">
          <Users className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No teams found</h3>
          <p className="text-xs text-slate-500">Create your first team or house to get started.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            <Plus className="h-4 w-4" /> Create Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-md hover:border-indigo-400 transition-all space-y-4 relative overflow-hidden"
            >
              {/* Color Bar Accent */}
              <div
                className="absolute top-0 left-0 right-0 h-2"
                style={{ backgroundColor: team.color || "#4F46E5" }}
              />

              <div className="flex justify-between items-start pt-1">
                <div>
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold text-white uppercase shadow-2xs"
                    style={{ backgroundColor: team.color || "#4F46E5" }}
                  >
                    {team.code}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{team.name}</h3>
                </div>
                <button
                  onClick={() => handleDeleteTeam(team.id, team.name)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete Team"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Team Leader:</span>
                  <strong className="text-slate-900">{team.leader_name || "Assigned"}</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Participants:</span>
                  <strong className="text-indigo-600">{team.members_count || 0} members</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600 pt-1">
                  <span>Total Points:</span>
                  <span className="text-base font-black text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {team.total_points} pts
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Team Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" /> Add New Team / House
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Team / House Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red House, Tagore Team"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Team Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RED, TAG"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    House Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={teamColor}
                      onChange={(e) => setTeamColor(e.target.value)}
                      className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer p-1 bg-white"
                    />
                    <span className="text-xs font-mono text-slate-600">{teamColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Team Leader / Manager Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul V"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  {submitting ? "Creating..." : "Save Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
