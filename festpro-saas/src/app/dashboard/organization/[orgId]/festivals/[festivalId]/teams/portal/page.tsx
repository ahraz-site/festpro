"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Users,
  Trophy,
  Award,
  Clock,
  Search,
  Plus,
  Printer,
  ChevronRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { getParticipants } from "@/lib/actions/participant"
import { getCompetitions } from "@/lib/actions/competition"
import { ExportPrintBar } from "@/components/ui/export-print-bar"

interface TeamMember {
  id: string
  name: string
  chestNumber: string
  category: string
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

const DEMO_TEAMS: TeamHouse[] = [
  {
    id: "team-1",
    name: "Team Alpha (Emerald)",
    code: "ALP",
    color: "#10b981",
    totalPoints: 245,
    rank: 1,
    managerName: "Rashid K",
    managerPhone: "+91 98471 23456",
  },
  {
    id: "team-2",
    name: "Team Beta (Sapphire)",
    code: "BET",
    color: "#3b82f6",
    totalPoints: 210,
    rank: 2,
    managerName: "Shamil V",
    managerPhone: "+91 98472 34567",
  },
  {
    id: "team-3",
    name: "Team Gamma (Ruby)",
    code: "GAM",
    color: "#ef4444",
    totalPoints: 185,
    rank: 3,
    managerName: "Muhammed Ali",
    managerPhone: "+91 98473 45678",
  },
]

export default function TeamManagerPortalPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [teams, setTeams] = useState<TeamHouse[]>(DEMO_TEAMS)
  const [selectedTeamId, setSelectedTeamId] = useState<string>(DEMO_TEAMS[0].id)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  // Team contestants roster
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "tm-1",
      name: "Aysha Fathima",
      chestNumber: "101",
      category: "Senior",
      enrolledCompetitions: ["Classical Solo Dance", "Light Music Solo"],
      greenRoomStatus: "on_stage",
      phone: "+91 98470 11111",
    },
    {
      id: "tm-2",
      name: "Muhammed Sinan",
      chestNumber: "105",
      category: "Senior",
      enrolledCompetitions: ["Madh Song", "Mappilappattu Solo"],
      greenRoomStatus: "reported",
      phone: "+91 98470 22222",
    },
    {
      id: "tm-3",
      name: "Fathima Nihala",
      chestNumber: "112",
      category: "Junior",
      enrolledCompetitions: ["Elocution (English)", "Essay Writing"],
      greenRoomStatus: "waiting",
      phone: "+91 98470 33333",
    },
    {
      id: "tm-4",
      name: "Bilal Ahmed",
      chestNumber: "118",
      category: "Sub Junior",
      enrolledCompetitions: ["Pencil Drawing", "Water Color"],
      greenRoomStatus: "waiting",
      phone: "+91 98470 44444",
    },
    {
      id: "tm-5",
      name: "Zainab Mariyam",
      chestNumber: "124",
      category: "Junior",
      enrolledCompetitions: ["Action Song", "Story Telling"],
      greenRoomStatus: "completed",
      phone: "+91 98470 55555",
    },
  ])

  // Quick Register Modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [newStudentName, setNewStudentName] = useState("")
  const [newChestNumber, setNewChestNumber] = useState("")
  const [newCategory, setNewCategory] = useState("Senior")
  const [newProgram, setNewProgram] = useState("Madh Song")

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0]

  useEffect(() => {
    async function loadTeamData() {
      try {
        const supabase = createClient()
        const { data: dbTeams } = await supabase
          .from("teams")
          .select("*")
          .eq("festival_id", festivalId)

        if (dbTeams && dbTeams.length > 0) {
          const mapped: TeamHouse[] = dbTeams.map((t: any, idx: number) => ({
            id: t.id,
            name: t.name,
            code: t.code || `T${idx + 1}`,
            color: t.color || "#4f46e5",
            totalPoints: t.total_points || 0,
            rank: idx + 1,
            managerName: t.leader_name || "Team Captain",
            managerPhone: "+91 98765 43210",
          }))
          setTeams(mapped)
          setSelectedTeamId(mapped[0].id)
        }

        const pRes = await getParticipants(festivalId, { limit: 100 })
        if (pRes?.data && pRes.data.length > 0) {
          const list: TeamMember[] = pRes.data.slice(0, 15).map((p: any, idx: number) => ({
            id: p.id,
            name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || `Student ${idx + 1}`,
            chestNumber: p.chest_number || String(100 + idx + 1),
            category: p.division || "Senior",
            enrolledCompetitions: ["Madh Song", "Light Music"],
            greenRoomStatus: idx === 0 ? "on_stage" : idx < 3 ? "reported" : "waiting",
            phone: p.phone || "",
          }))
          setMembers(list)
        }
      } catch (err) {
        console.warn("loadTeamData notice:", err)
      } finally {
        setLoading(false)
      }
    }
    if (festivalId) loadTeamData()
  }, [festivalId])

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStudentName.trim()) {
      toast.error("Please enter contestant name")
      return
    }

    const chest = newChestNumber.trim() || String(Math.floor(100 + Math.random() * 899))
    const newMember: TeamMember = {
      id: `tm_${Date.now()}`,
      name: newStudentName.trim(),
      chestNumber: chest,
      category: newCategory,
      enrolledCompetitions: [newProgram],
      greenRoomStatus: "waiting",
    }

    setMembers((prev) => [newMember, ...prev])
    toast.success(`Registered #${chest} (${newMember.name}) for ${selectedTeam.name}`)
    setShowAddModal(false)
    setNewStudentName("")
    setNewChestNumber("")
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-[#00c9a7] uppercase tracking-wider">
            <Users className="h-4 w-4" />
            <span>House Captain &amp; Team Leader Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Team Manager Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your house contestants, monitor live stage calls, and track overall point standing.
          </p>
        </div>

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
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Contestant</span>
          </button>
        </div>
      </div>

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
                  ? "border-indigo-600 dark:border-[#00a389] bg-indigo-50/60 dark:bg-[#00a389]/10 shadow-xs ring-1 ring-indigo-500"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c131d] hover:border-slate-300"
              }`}
            >
              <span
                className="h-3.5 w-3.5 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-white block">
                  {t.name}
                </span>
                <span className="text-[10px] text-slate-500">
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
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c131d] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>House Score</span>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {selectedTeam.totalPoints}{" "}
            <span className="text-xs font-normal text-slate-500">pts</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            Rank #{selectedTeam.rank} in Grand Standings
          </p>
        </div>

        {/* Registered Participants */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c131d] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Enrolled Contestants</span>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {members.length}
          </div>
          <p className="text-[11px] text-slate-500">
            Representing {selectedTeam.name}
          </p>
        </div>

        {/* Live Stage Status */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c131d] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active on Stage</span>
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {members.filter((m) => m.greenRoomStatus === "on_stage").length}
          </div>
          <p className="text-[11px] text-slate-500">
            {members.filter((m) => m.greenRoomStatus === "reported").length} reported in Green Room
          </p>
        </div>
      </div>

      {/* ── LIVE CALL BANNER (NEXT PERFORMER ON STAGE) ── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 block">
              Urgent Green Room Call
            </span>
            <span className="text-sm font-black">
              Chest #105 (Muhammed Sinan) - Madh Song on Stage 1
            </span>
            <p className="text-xs text-slate-400">Please ensure contestant is in the green room ready for call 2.</p>
          </div>
        </div>

        <Link
          href={`/dashboard/organization/${orgId}/festivals/${festivalId}/green-room`}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-all shrink-0"
        >
          <span>Open Green Room Desk</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* ── CONTESTANTS ROSTER TABLE ── */}
      <div className="space-y-4 bg-white dark:bg-[#0c131d] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            {selectedTeam.name} Contestants
          </h2>

          <div className="relative max-w-xs w-full">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chest # or student name..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-y border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Chest #</th>
                <th className="py-3 px-4">Contestant</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Enrolled Programs</th>
                <th className="py-3 px-4">Stage Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMembers.map((m) => {
                const isOnStage = m.greenRoomStatus === "on_stage"
                const isReported = m.greenRoomStatus === "reported"
                const isCompleted = m.greenRoomStatus === "completed"

                return (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-slate-900 dark:text-white">
                      #{m.chestNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {m.name}
                      </span>
                      {m.phone && <span className="text-[10px] text-slate-400">{m.phone}</span>}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                      {m.category}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {m.enrolledCompetitions.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isOnStage ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 animate-pulse">
                          ON STAGE
                        </span>
                      ) : isReported ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          REPORTED
                        </span>
                      ) : isCompleted ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                          COMPLETED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          WAITING
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toast.info(`Printing admit card for #${m.chestNumber} (${m.name})`)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer"
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
          <div className="bg-white dark:bg-[#0c131d] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Add Contestant to {selectedTeam.name}
                </h3>
                <p className="text-xs text-slate-500">Direct house entry</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Aysha Nihala"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Chest # (Optional)
                  </label>
                  <input
                    type="text"
                    value={newChestNumber}
                    onChange={(e) => setNewChestNumber(e.target.value)}
                    placeholder="Auto if blank"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Senior">Senior</option>
                    <option value="Junior">Junior</option>
                    <option value="Sub Junior">Sub Junior</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Enrolled Program
                </label>
                <select
                  value={newProgram}
                  onChange={(e) => setNewProgram(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Madh Song">Madh Song</option>
                  <option value="Classical Solo Dance">Classical Solo Dance</option>
                  <option value="Light Music Solo">Light Music Solo</option>
                  <option value="Mappilappattu Solo">Mappilappattu Solo</option>
                  <option value="Elocution (English)">Elocution (English)</option>
                  <option value="Pencil Drawing">Pencil Drawing</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  Save &amp; Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
