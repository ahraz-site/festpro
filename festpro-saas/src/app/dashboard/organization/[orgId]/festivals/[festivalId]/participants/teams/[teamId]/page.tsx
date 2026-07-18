"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getTeamById, addTeamMember, removeTeamMember } from "@/lib/actions/participant/teams"
import { getParticipants } from "@/lib/actions/participant"
import { TEAM_ROLES } from "@/config/participant"
import type { Team, TeamMember, Participant } from "@/types/participant"
import { Users, UserPlus, Trash2, ChevronLeft, Loader2 } from "lucide-react"

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const teamId = params.teamId as string
  const [team, setTeam] = useState<Team | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [selParticipant, setSelParticipant] = useState("")
  const [selRole, setSelRole] = useState("member")

  useEffect(() => {
    async function load() {
      const [tRes, pRes] = await Promise.all([
        getTeamById(teamId),
        getParticipants(festivalId, { limit: 200 }),
      ])
      if (tRes.error) { toast.error(tRes.error); return }
      setTeam(tRes.data as Team)
      setParticipants(pRes.data as Participant[])
      setLoading(false)
    }
    load()
  }, [teamId, festivalId])

  const handleAddMember = async () => {
    if (!selParticipant) { toast.error("Select a participant"); return }
    const res = await addTeamMember(teamId, selParticipant, selRole as any)
    if (res.error) toast.error(res.error); else {
      toast.success("Member added")
      setSelParticipant("")
      const refreshed = await getTeamById(teamId)
      setTeam(refreshed.data as Team)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member?")) return
    const res = await removeTeamMember(teamId, memberId)
    if (res.error) toast.error(res.error); else {
      toast.success("Member removed")
      const refreshed = await getTeamById(teamId)
      setTeam(refreshed.data as Team)
    }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
  if (!team) return <div className="text-center py-12 text-red-500">Team not found</div>

  const memberIds = team.members?.map(m => m.participant_id) || []
  const availableParticipants = participants.filter(p => !memberIds.includes(p.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ChevronLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
          <p className="text-sm text-gray-500">{team.code || ""} {team.competition?.name ? `• ${team.competition.name}` : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Team Members ({team.members?.length || 0}/{team.max_members})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {(!team.members || team.members.length === 0) ? (
                  <div className="text-center py-8 text-gray-400">No members yet</div>
                ) : team.members.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-medium">
                        {m.participant?.first_name?.[0]}{m.participant?.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {m.participant?.first_name} {m.participant?.last_name}
                        </p>
                        <p className="text-xs text-gray-400">{m.participant?.participant_id} • {m.participant?.chest_number || "No chest"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.role === "leader" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                        {TEAM_ROLES.find(r => r.value === m.role)?.label || m.role}
                      </span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleRemoveMember(m.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">Add Member</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Participant</label>
                <Select options={availableParticipants.map(p => ({ value: p.id, label: `${p.first_name} ${p.last_name} (${p.participant_id})` }))} placeholder="Select participant" value={selParticipant} onChange={e => setSelParticipant(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <Select options={TEAM_ROLES.map(r => ({ value: r.value, label: r.label }))} value={selRole} onChange={e => setSelRole(e.target.value)} />
              </div>
              <Button className="w-full" size="sm" onClick={handleAddMember}>
                <UserPlus className="h-4 w-4 mr-1" />Add to Team
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">Team Info</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Min Members</span><span className="font-medium">{team.min_members}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Max Members</span><span className="font-medium">{team.max_members}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Leader</span><span className="font-medium">{team.team_leader ? `${team.team_leader.first_name} ${team.team_leader.last_name}` : "Not set"}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
