"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import {
  getOrganizationMembers, inviteMember, removeMember, changeMemberRole,
  suspendMember, reactivateMember, getInvitations, cancelInvitation,
} from "@/lib/actions/organization"
import { ROLES, ROLE_LABELS } from "@/config/roles"
import type { OrganizationMember, Invitation } from "@/types/organization"
import type { UserRole } from "@/types"
import { Loader2, Mail, X, UserMinus, UserCheck, Shield, AlertTriangle } from "lucide-react"

export default function MembersPage() {
  const params = useParams()
  const orgId = params.orgId as string

  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<UserRole>("participant")
  const [inviting, setInviting] = useState(false)

  async function load() {
    const [mems, invs] = await Promise.all([
      getOrganizationMembers(orgId),
      getInvitations(orgId),
    ])
    setMembers(mems as unknown as OrganizationMember[])
    setInvitations(invs as unknown as Invitation[])
    setLoading(false)
  }

  useEffect(() => { load() }, [orgId])

  async function handleInvite() {
    if (!inviteEmail) { toast.error("Please enter an email"); return }
    setInviting(true)
    const result = await inviteMember(orgId, { email: inviteEmail, role: inviteRole })
    if (result.error) { toast.error(result.error) } else { toast.success("Invitation sent!"); setInviteEmail("") }
    setInviting(false)
    await load()
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Are you sure you want to remove this member?")) return
    const result = await removeMember(orgId, memberId)
    if (result.error) { toast.error(result.error) } else { toast.success("Member removed") }
    await load()
  }

  async function handleRoleChange(memberId: string, role: string) {
    const result = await changeMemberRole(orgId, memberId, role as UserRole)
    if (result.error) { toast.error(result.error) } else { toast.success("Role updated") }
    await load()
  }

  async function handleSuspend(memberId: string, suspended: boolean) {
    const result = suspended ? await reactivateMember(orgId, memberId) : await suspendMember(orgId, memberId)
    if (result.error) { toast.error(result.error) } else { toast.success(suspended ? "Member reactivated" : "Member suspended") }
    await load()
  }

  async function handleCancelInvite(invitationId: string) {
    const result = await cancelInvitation(orgId, invitationId)
    if (result.error) { toast.error(result.error) } else { toast.success("Invitation cancelled") }
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        <p className="text-sm text-gray-500 mt-1">Manage who has access to your organization.</p>
      </div>

      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Member</CardTitle>
          <CardDescription>Send an invitation to join your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="email@example.com"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <Select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as UserRole)}
              options={ROLES.filter((r) => !["platform_owner", "platform_admin", "public_user"].includes(r)).map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
              className="w-full sm:w-44"
            />
            <Button onClick={handleInvite} disabled={inviting}>
              {inviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Mail className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No members yet.</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-4 rounded-lg border border-gray-200 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium shrink-0">
                    {member.profile?.first_name?.[0]}{member.profile?.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {member.profile?.first_name} {member.profile?.last_name}
                      </p>
                      {member.is_suspended && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="h-3 w-3" /> Suspended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{member.profile?.email}</p>
                  </div>
                  <Select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
                    className="w-40"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSuspend(member.id, member.is_suspended)}
                      className={`p-2 rounded-lg transition-colors ${member.is_suspended ? "text-green-600 hover:bg-green-50" : "text-amber-600 hover:bg-amber-50"}`}
                      title={member.is_suspended ? "Reactivate" : "Suspend"}
                    >
                      {member.is_suspended ? <UserCheck className="h-4 w-4" /> : <UserMinus className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleRemove(member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.filter((i) => i.status === "pending").length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invitations.filter((i) => i.status === "pending").map((inv) => (
              <div key={inv.id} className="flex items-center gap-4 rounded-lg border border-gray-200 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{inv.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{ROLE_LABELS[inv.role]} - Expires {new Date(inv.expires_at).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleCancelInvite(inv.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
