"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { getTeams, deleteTeam } from "@/lib/actions/participant/teams"
import { getCompetitions } from "@/lib/actions/competition"
import type { Team } from "@/types/participant"
import type { Competition } from "@/types/competition"
import { Users, Plus, Eye, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function TeamsPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [teams, setTeams] = useState<Team[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [compFilter, setCompFilter] = useState("")

  useEffect(() => {
    async function load() {
      const [tRes, cRes] = await Promise.all([
        getTeams(festivalId, { competition_id: compFilter }),
        getCompetitions(festivalId),
      ])
      setTeams(tRes.data as Team[])
      setCompetitions(cRes as Competition[])
      setLoading(false)
    }
    load()
  }, [festivalId, compFilter])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team?")) return
    const res = await deleteTeam(id)
    if (res.error) toast.error(res.error); else { toast.success("Team deleted"); setTeams(prev => prev.filter(t => t.id !== id)) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team registrations.</p>
        </div>
        <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/participants/teams/create`}>
          <Button size="sm"><Plus className="h-4 w-4 mr-1" />Create Team</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-4">
          <Select options={competitions.filter(c => c.is_team_event).map(c => ({ value: c.id, label: c.name }))} placeholder="All Competitions" value={compFilter} onChange={e => setCompFilter(e.target.value)} />
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
      ) : teams.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No teams found. Create your first team!</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(team => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600"><Users className="h-5 w-5" /></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{team.name}</h3>
                      <p className="text-xs text-gray-500">{team.competition?.name || "N/A"}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">{team.code || "No code"}</span>
                  <span className="text-gray-500">{team.members?.length || 0}/{team.max_members} members</span>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Leader: {team.team_leader ? `${team.team_leader.first_name} ${team.team_leader.last_name}` : "Not assigned"}
                </div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/participants/teams/${team.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full"><Eye className="h-3.5 w-3.5 mr-1" />View</Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(team.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
