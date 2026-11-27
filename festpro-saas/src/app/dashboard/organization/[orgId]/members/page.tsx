"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  Users, Plus, Search, Filter, Trash2, Edit2, Shield, X,
  Loader2, Mail, Phone, CheckCircle2, UserCheck, Eye, EyeOff, KeyRound, Copy, Sparkles, Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  getOrganizationStaff,
  upsertOrganizationStaff,
  removeOrganizationStaff,
  type StaffMember,
} from "@/lib/actions/staff-auth"
import { ExportPrintBar } from "@/components/ui/export-print-bar"
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle"

function generateRandomPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789"
  let pwd = ""
  for (let i = 0; i < 6; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `fest@${pwd}`
}

export default function PeopleAndAccessPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = (params.festivalId as string) || null

  const [members, setMembers] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Add / Edit Person Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [phone, setPhone] = useState("+91 ")
  const [role, setRole] = useState("judge")
  const [copiedPass, setCopiedPass] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await getOrganizationStaff(orgId)
      setMembers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleNameChange = (val: string) => {
    setName(val)
    if (!editingId) {
      const autoUser = val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ".")
        .replace(/\.+/g, ".")
        .replace(/^\.|\.$/g, "")
      setUsername(autoUser)
    }
  }

  const handleOpenAdd = () => {
    setEditingId(null)
    setName("")
    setUsername("")
    setPassword(generateRandomPassword())
    setShowPassword(true)
    setPhone("+91 ")
    setRole("judge")
    setShowAddModal(true)
  }

  const handleOpenEdit = (m: StaffMember) => {
    setEditingId(m.id)
    setName(m.name)
    setUsername(m.username)
    setPassword(m.raw_password || m.password || "fest123")
    setShowPassword(false)
    setPhone(m.phone || "+91 ")
    setRole(m.role)
    setShowAddModal(true)
  }

  const handleCopyPassword = () => {
    if (!password) return
    navigator.clipboard.writeText(password)
    setCopiedPass(true)
    toast.success("Password copied to clipboard")
    setTimeout(() => setCopiedPass(false), 2000)
  }

  const handleRemove = async (member: StaffMember) => {
    if (!confirm(`Are you sure you want to remove ${member.name} (${member.username})?`)) return
    const res = await removeOrganizationStaff(orgId, festivalId, member.id, member.username)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Person removed")
      setMembers((prev) => prev.filter((m) => m.id !== member.id && m.username !== member.username))
    }
  }

  const handleSavePerson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !username.trim()) {
      toast.error("Name and username are required.")
      return
    }
    if (!password.trim()) {
      toast.error("Password is required.")
      return
    }

    setSubmitting(true)
    const res = await upsertOrganizationStaff(orgId, festivalId, {
      id: editingId || undefined,
      name: name.trim(),
      username: username.trim().toLowerCase(),
      password: password.trim(),
      raw_password: password.trim(),
      role: role,
      phone: phone.trim(),
    })

    setSubmitting(false)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success(`${name} saved successfully with username "${username.trim().toLowerCase()}"!`)
      setShowAddModal(false)
      loadData()
    }
  }

  // 7 Role summary pill cards matching Festize / Quaf Reference
  const roleSummaries = [
    {
      label: "Fest administrator",
      code: "fes",
      count: members.filter((m) => m.role === "fest_administrator" || m.role === "admin" || m.role === "organization_admin").length,
    },
    {
      label: "Team manager",
      code: "tea",
      count: members.filter((m) => m.role === "team_manager" || m.role?.includes("team")).length,
    },
    {
      label: "Judge",
      code: "jud",
      count: members.filter((m) => m.role === "judge").length,
    },
    {
      label: "Stage manager",
      code: "sta",
      count: members.filter((m) => m.role === "stage_manager" || m.role?.includes("stage")).length,
    },
    {
      label: "Announcer",
      code: "ann",
      count: members.filter((m) => m.role === "announcer" || m.role === "reception").length,
    },
    {
      label: "Media manager",
      code: "med",
      count: members.filter((m) => m.role === "media_manager" || m.role === "media").length,
    },
    {
      label: "Prizes",
      code: "pri",
      count: members.filter((m) => m.role === "prizes" || m.role?.includes("prize")).length,
    },
    {
      label: "Green room",
      code: "gre",
      count: members.filter((m) => m.role === "green_room" || m.role?.includes("green")).length,
    },
  ]

  const formatRoleLabel = (r: string) => {
    if (!r) return "Member"
    if (r === "organization_owner") return "Organization owner"
    if (r === "fest_administrator" || r === "organization_admin") return "Fest administrator"
    if (r === "judge") return "Judge"
    if (r === "media_manager" || r === "media") return "Media manager"
    if (r === "stage_manager") return "Stage manager"
    if (r === "team_manager") return "Team manager"
    if (r === "announcer") return "Announcer"
    if (r === "prizes") return "Prizes"
    if (r === "green_room" || r === "greenroom") return "Green room"
    return r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const getRoleBadgeStyle = (r: string) => {
    const roleLower = (r || "").toLowerCase()
    if (roleLower === "organization_owner") return "bg-slate-100 text-slate-800 border-slate-300"
    if (roleLower === "judge") return "bg-purple-50 text-purple-700 border-purple-200"
    if (roleLower.includes("media")) return "bg-amber-50 text-amber-700 border-amber-200"
    if (roleLower.includes("stage")) return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (roleLower.includes("admin")) return "bg-rose-50 text-rose-700 border-rose-200"
    if (roleLower.includes("team")) return "bg-blue-50 text-blue-700 border-blue-200"
    if (roleLower.includes("green")) return "bg-teal-50 text-teal-700 border-teal-200"
    return "bg-indigo-50 text-indigo-700 border-indigo-200"
  }

  const filtered = members.filter((m) => {
    const fullName = (m.name || "").toLowerCase()
    const uname = (m.username || "").toLowerCase()
    const roleStr = (m.role || "").toLowerCase()
    const s = search.toLowerCase()

    if (s && !fullName.includes(s) && !uname.includes(s) && !roleStr.includes(s)) {
      return false
    }

    if (roleFilter !== "all" && !roleStr.includes(roleFilter.toLowerCase())) {
      return false
    }
    return true
  })

  const exportColumns = [
    { header: "Name", accessor: (m: StaffMember) => m.name },
    { header: "Role", accessor: (m: StaffMember) => formatRoleLabel(m.role) },
    { header: "Username", accessor: (m: StaffMember) => m.username },
    { header: "Phone", accessor: (m: StaffMember) => m.phone || "-" },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* ── HEADER (FesPro Enterprise Style) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">People & access</h1>
            <p className="text-xs text-slate-500 font-medium">
              Create and manage festival credentials for judges, stage managers, media team & administrators
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Excel / PDF Toolbar */}
          <ExportPrintBar
            title="People & Access Roster"
            subtitle="FestPro Festival Management System"
            data={filtered}
            columns={exportColumns}
            filename="people-and-access"
          />

          {/* Line vs Grid View Toggle */}
          <ViewToggle mode={viewMode} onChange={setViewMode} />

          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add person
          </Button>
        </div>
      </div>

      {/* ── 7 ROLE SUMMARY COUNTERS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {roleSummaries.map((item) => (
          <div
            key={item.code}
            className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs flex flex-col justify-between h-24 hover:border-indigo-400 transition-colors"
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold text-slate-600 leading-tight truncate pr-1">
                {item.label}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase shrink-0">
                {item.code}
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900">{item.count}</p>
          </div>
        ))}
      </div>

      {/* ── SEARCH & FILTER ROW (Festize Style) ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, username, role, or team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-white border-slate-200 text-xs"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-teal-500"
        >
          <option value="all">All roles</option>
          <option value="owner">Organization owner</option>
          <option value="admin">Fest administrator</option>
          <option value="team">Team manager</option>
          <option value="judge">Judge</option>
          <option value="stage">Stage manager</option>
          <option value="announcer">Announcer</option>
          <option value="media">Media manager</option>
          <option value="prizes">Prizes</option>
        </select>
      </div>

      {/* ── CONTENT AREA (Grid View vs Line View) ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-wider">Loading team credentials...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
          <Users className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No members found</h3>
          <p className="text-xs text-slate-400">Add judges, media managers, and coordinators with username and password.</p>
          <Button size="sm" onClick={handleOpenAdd} className="rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Person
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => {
            const fullName = m.name || "User"
            const roleName = formatRoleLabel(m.role)
            const isOwner = m.role === "organization_owner"
            const username = m.username

            return (
              <div
                key={m.id}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <h3 className="text-base font-black text-slate-900">{fullName}</h3>
                  <div className="mt-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getRoleBadgeStyle(m.role)}`}>
                      {roleName}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Username:</span>
                      <span className="text-slate-900 font-mono font-bold text-[11px]">{username}</span>
                    </div>
                    {m.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">Phone:</span>
                        <span className="text-slate-800">{m.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  {isOwner ? (
                    <span className="w-full py-2 rounded-xl border border-slate-200 text-center text-xs font-bold text-slate-700 bg-slate-50/70">
                      Organization access
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(m)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors text-center cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(m)}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </>
                  )}
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
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((m) => {
                  const isOwner = m.role === "organization_owner"
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{m.name}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeStyle(m.role)}`}>
                          {formatRoleLabel(m.role)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-900 font-mono font-bold text-[11px]">{m.username}</td>
                      <td className="py-3.5 px-4 text-slate-600">{m.phone || "-"}</td>
                      <td className="py-3.5 px-4 text-right">
                        {isOwner ? (
                          <span className="text-[11px] font-bold text-slate-400">Primary Owner</span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(m)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemove(m)}
                              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT PERSON MODAL (Matching Quaf / Festize Screenshots) ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {editingId ? "Edit Person / Credentials" : "Add Person to Fest"}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Set up username and password for this team member to access their console.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePerson} className="space-y-4 text-xs font-semibold text-slate-700">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold">Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Judge 1 or Staff Coordinator"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-xs"
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold">Assigned Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="fest_administrator">Fest administrator</option>
                  <option value="team_manager">Team manager</option>
                  <option value="judge">Judge</option>
                  <option value="stage_manager">Stage manager</option>
                  <option value="announcer">Announcer</option>
                  <option value="media_manager">Media manager</option>
                  <option value="prizes">Prizes</option>
                  <option value="green_room">Green room</option>
                </select>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold">Username (used for login) *</label>
                <Input
                  required
                  placeholder="e.g. stage1.judge"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  className="h-10 rounded-xl border-slate-200 font-mono text-xs font-bold text-indigo-800"
                />
                <p className="text-[10px] text-slate-400">
                  This username will be entered on the login screen to sign in.
                </p>
              </div>

              {/* Password with Generator, Toggle & Copy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold">Password *</label>
                  <button
                    type="button"
                    onClick={() => setPassword(generateRandomPassword())}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    Generate password
                  </button>
                </div>
                <div className="relative">
                  <Input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter or generate password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 pr-20 rounded-xl border-slate-200 font-mono text-xs"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-1 hover:text-indigo-600 cursor-pointer"
                      title="Copy password"
                    >
                      {copiedPass ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Phone (Optional) */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold">Phone Number (Optional)</label>
                <Input
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 rounded-xl border-slate-200 text-xs"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Saving person...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      {editingId ? "Update Person" : "Save Person"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
