"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Users,
  Trophy,
  Clock,
  Search,
  Plus,
  ExternalLink,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { addFestParticipantAction } from "@/lib/actions/participant"
import { ExportPrintBar } from "@/components/ui/export-print-bar"

interface TeamMember {
  id: string
  name: string
  chestNumber: string
  category: string
  unit: string
  teamId?: string
  enrolledCompetitions: string[]
  greenRoomStatus: "waiting" | "reported" | "on_stage" | "completed"
  phone?: string
}

interface TeamHouse {
  id: string
  name: string
  code: string
  color: string
  totalPoints: number
  rank: number
  managerName: string
  managerPhone: string
}

export default function TeamManagerPortalPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [teams, setTeams] = useState<TeamHouse[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [allMembers, setAllMembers] = useState<TeamMember[]>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [competitions, setCompetitions] = useState<Array<{ id: string; name: string }>>([])

  // Quick Register Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newStudentName, setNewStudentName] = useState("")
  const [newChestNumber, setNewChestNumber] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newProgram, setNewProgram] = useState("")

  const loadTeamData = useCallback(async () => {
    if (!festivalId) return
    try {
      const res = await fetch(`/api/festival/${festivalId}/workspace?scope=portal`, { cache: "no-store" })
      const data = await res.json()

      const dbTeams = Array.isArray(data?.teams) ? data.teams : []
      const dbTeamPoints = Array.isArray(data?.teamPoints) ? data.teamPoints : []
      const dbCategories = Array.isArray(data?.categories) ? data.categories : []
      const dbComps = Array.isArray(data?.competitions) ? data.competitions : []
      const dbParticipants = Array.isArray(data?.participants) ? data.participants : []
      const dbRegs = Array.isArray(data?.registrations) ? data.registrations : []
      const grMap = (data?.customFields?.green_room || {}) as Record<
        string,
        { status?: TeamMember["greenRoomStatus"] }
      >

      const tpByTeamId = new Map(dbTeamPoints.map((tp: any) => [tp.entity_id, Number(tp.total_points || 0)]))
      const mappedTeams: TeamHouse[] = dbTeams
        .map((t: any, idx: number) => ({
          id: t.id,
          name: t.name,
          code: t.code || t.name.slice(0, 3).toUpperCase() || `T${idx + 1}`,
          color: t.color || "#4f46e5",
          totalPoints: tpByTeamId.get(t.id) ?? Number(t.total_points || 0),
          rank: idx + 1,
          managerName: t.leader_name || "Team Captain",
          managerPhone: t.leader_phone || "",
        }))
        .sort((a: TeamHouse, b: TeamHouse) => b.totalPoints - a.totalPoints)
        .map((t: TeamHouse, idx: number) => ({ ...t, rank: idx + 1 }))

      setTeams(mappedTeams)
      setSelectedTeamId((prev) => (prev && mappedTeams.some((t) => t.id === prev) ? prev : mappedTeams[0]?.id || ""))

      setCategories(dbCategories)
      setCompetitions(dbComps)
      setNewCategory((prev) => prev || dbCategories[0]?.name || "General")

      const compNameById = new Map<string, string>(dbComps.map((c: any) => [c.id, c.name]))
      const regsByParticipant = new Map<string, string[]>()
      dbRegs.forEach((r: any) => {
        const compName = compNameById.get(r.competition_id)
        if (!compName) return
        const arr = regsByParticipant.get(r.participant_id) || []
        arr.push(compName)
        regsByParticipant.set(r.participant_id, arr)
      })

      const mappedMembers: TeamMember[] = dbParticipants.map((p: any, idx: number) => ({
        id: p.id,
        name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || `Participant ${idx + 1}`,
        chestNumber: p.chest_number || "—",
        category: p.division || "General",
        unit: p.unit || "",
        teamId: p.team_id || undefined,
        enrolledCompetitions: regsByParticipant.get(p.id) || [],
        greenRoomStatus: grMap[p.id]?.status || "waiting",
        phone: p.phone || "",
      }))
      setAllMembers(mappedMembers)
    } catch (err) {
      console.warn("loadTeamData notice:", err)
    } finally {
      setLoading(false)
    }
  }, [festivalId])

  useEffect(() => {
    loadTeamData()
  }, [loadTeamData])

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0]

  const members = useMemo(() => {
    if (!selectedTeam) return []
    return allMembers.filter((m) => {
      if (m.teamId && m.teamId === selectedTeam.id) return true
      const unitLower = m.unit.trim().toLowerCase()
      return (
        unitLower === selectedTeam.name.trim().toLowerCase() ||
        (Boolean(selectedTeam.code) && unitLower === selectedTeam.code.trim().toLowerCase())
      )
    })
  }, [allMembers, selectedTeam])

  const activeStageMember = useMemo(() => {
    return (
      members.find((m) => m.greenRoomStatus === "on_stage") ||
      members.find((m) => m.greenRoomStatus === "reported") ||
      null
    )
  }, [members])

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam) {
      toast.error("Please create a team first")
      return
    }
    if (!newStudentName.trim()) {
      toast.error("Please enter contestant name")
      return
    }

    setSubmitting(true)
    try {
      const res = await addFestParticipantAction(festivalId, {
        name: newStudentName.trim(),
        team: selectedTeam.code || selectedTeam.name,
        category: newCategory || categories[0]?.name || "General",
      })
      if (res.error) {
        toast.error(res.error)
        return
      }

      const createdId = (res as any)?.participant?.id || (res as any)?.data?.id
      if (createdId && newProgram) {
        await fetch(`/api/festival/${festivalId}/operations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "sync_participant_programs",
            payload: {
              participantId: createdId,
              competitionIds: [newProgram],
            },
          }),
        })
      }

      toast.success(`Registered ${newStudentName.trim()} for ${selectedTeam.name}`)
      setShowAddModal(false)
      setNewStudentName("")
      setNewChestNumber("")
      await loadTeamData()
    } catch (err: any) {
      toast.error(err?.message || "Failed to add contestant")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase().trim()
    return (
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.chestNumber.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.enrolledCompetitions.some((c) => c.toLowerCase().includes(q))
    )
  })

  const exportColumns = [
    { header: "Chest #", accessor: (m: TeamMember) => m.chestNumber },
    { header: "Contestant Name", accessor: (m: TeamMember) => m.name },
    { header: "Category", accessor: (m: TeamMember) => m.category },
    { header: "Competitions", accessor: (m: TeamMember) => m.enrolledCompetitions.join(", ") },
    { header: "Stage Status", accessor: (m: TeamMember) => m.greenRoomStatus.toUpperCase() },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <Users className="h-4 w-4" />
            <span>House Captain &amp; Team Leader Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Team Manager Desk
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage your house contestants, monitor live stage calls, and track overall point standing.
          </p>
        </div>

        {selectedTeam && (
          <div className="flex items-center gap-2">
            <ExportPrintBar
              title={`${selectedTeam.name} - Official Contestant Roster`}
              subtitle={`FestPro House Standing: Rank #${selectedTeam.rank} (${selectedTeam.totalPoints} pts)`}
              data={filteredMembers}
              columns={exportColumns}
              filename={`${selectedTeam.code}-roster`}
            />

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Contestant</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading team portal...</p>
        </div>
      ) : !selectedTeam ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center space-y-3">
          <Users className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-900">No Teams / Houses Configured Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Create teams or houses first so team captains can manage contestants and monitor live calls.
          </p>
          <Link
            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/teams`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Go to Teams
          </Link>
        </div>
      ) : (
        <>

      {/* ── TEAM / HOUSE SELECTOR TABS ── */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {teams.map((t) => {
          const isSelected = t.id === selectedTeamId
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTeamId(t.id)}
              className={`px-5 py-3 rounded-2xl border text-left transition-all flex items-center gap-3 shrink-0 cursor-pointer ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span
                className="h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              <div>
                <span className="text-xs font-black text-slate-900 block">
                  {t.name}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Rank #{t.rank} · {t.totalPoints} pts
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── 3 METRIC CARDS FOR CURRENT TEAM ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Points */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>House Score</span>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {selectedTeam.totalPoints}{" "}
            <span className="text-xs font-normal text-slate-500">pts</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold">
            Rank #{selectedTeam.rank} in Grand Standings
          </p>
        </div>

        {/* Registered Participants */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Enrolled Contestants</span>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {members.length}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Representing {selectedTeam.name}
          </p>
        </div>

        {/* Live Stage Status */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Active on Stage</span>
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {members.filter((m) => m.greenRoomStatus === "on_stage").length}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {members.filter((m) => m.greenRoomStatus === "reported").length} reported in Green Room
          </p>
        </div>
      </div>

      {/* ── LIVE CALL BANNER (NEXT PERFORMER ON STAGE) ── */}
      <div className="p-5 rounded-2xl bg-indigo-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-800/80 border border-indigo-700 flex items-center justify-center text-indigo-300 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 block">
              Green Room Status
            </span>
            {activeStageMember ? (
              <>
                <span className="text-sm font-black text-white">
                  Chest #{activeStageMember.chestNumber} ({activeStageMember.name}) — {activeStageMember.greenRoomStatus === "on_stage" ? "Currently On Stage" : "Reported in Green Room"}
                </span>
                <p className="text-xs text-indigo-200">
                  {activeStageMember.enrolledCompetitions[0] || activeStageMember.category}
                </p>
              </>
            ) : (
              <>
                <span className="text-sm font-black text-white">
                  {selectedTeam.name} Green Room Monitor
                </span>
                <p className="text-xs text-indigo-200">
                  No active green room or on-stage calls for this team right now.
                </p>
              </>
            )}
          </div>
        </div>

        <Link
          href={`/dashboard/organization/${orgId}/festivals/${festivalId}/green-room`}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-xs"
        >
          <span>Open Green Room Desk</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* ── CONTESTANTS ROSTER TABLE ── */}
      <div className="space-y-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-900">
            {selectedTeam.name} Contestants
          </h2>

          <div className="relative max-w-xs w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chest # or student name..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Chest #</th>
                <th className="py-3 px-4">Contestant</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Enrolled Programs</th>
                <th className="py-3 px-4">Stage Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-slate-500">
                    No contestants registered in {selectedTeam.name} yet.
                  </td>
                </tr>
              ) : filteredMembers.map((m) => {
                const isOnStage = m.greenRoomStatus === "on_stage"
                const isReported = m.greenRoomStatus === "reported"
                const isCompleted = m.greenRoomStatus === "completed"

                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-slate-900">
                      #{m.chestNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">
                        {m.name}
                      </span>
                      {m.phone && <span className="text-[10px] text-slate-400">{m.phone}</span>}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {m.category}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {m.enrolledCompetitions.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-700"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isOnStage ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 animate-pulse">
                          ON STAGE
                        </span>
                      ) : isReported ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          REPORTED
                        </span>
                      ) : isCompleted ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          COMPLETED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          WAITING
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toast.info(`Printing admit card for #${m.chestNumber} (${m.name})`)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 font-bold text-[11px] text-slate-700 cursor-pointer shadow-2xs"
                      >
                        Print Slip
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: QUICK ADD CONTESTANT ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Add Contestant to {selectedTeam.name}
                </h3>
                <p className="text-xs text-slate-500">Direct house entry</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Enter contestant full name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))
                    ) : (
                      <option value="General">General</option>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Enrolled Program (Optional)
                  </label>
                  <select
                    value={newProgram}
                    onChange={(e) => setNewProgram(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None (Assign later)</option>
                    {competitions.map((comp) => (
                      <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white shadow-sm cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save & Enroll"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  )
}
