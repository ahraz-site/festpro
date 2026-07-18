"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { createTeam, getTeams } from "@/lib/actions/participant/teams"
import { getCompetitions } from "@/lib/actions/competition"
import type { Competition } from "@/types/competition"
import { Loader2, Users } from "lucide-react"

export default function CreateTeamPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: "", code: "", competition_id: "", max_members: "10", min_members: "2" })

  useEffect(() => {
    getCompetitions(festivalId).then(data => {
      const comps = (data as Competition[]).filter(c => c.is_team_event)
      setCompetitions(comps)
    })
  }, [festivalId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.competition_id) { toast.error("Select a competition"); return }
    if (!form.name.trim()) { toast.error("Team name is required"); return }
    setSaving(true)
    const res = await createTeam(festivalId, form)
    setSaving(false)
    if (res.error) toast.error(res.error); else {
      toast.success("Team created")
      router.push(`/dashboard/organization/${orgId}/festivals/${festivalId}/participants/teams`)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Team</h1>
        <p className="text-sm text-gray-500 mt-1">Register a new team for a competition.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Team Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Competition *</label>
              <Select options={competitions.map(c => ({ value: c.id, label: c.name }))} placeholder="Select team competition" value={form.competition_id} onChange={e => setForm(f => ({ ...f, competition_id: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
              <Input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Code</label>
              <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="Optional short code" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Members</label>
                <Input type="number" value={form.max_members} onChange={e => setForm(f => ({ ...f, max_members: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Members</label>
                <Input type="number" value={form.min_members} onChange={e => setForm(f => ({ ...f, min_members: e.target.value }))} />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
            Create Team
          </Button>
        </div>
      </form>
    </div>
  )
}
