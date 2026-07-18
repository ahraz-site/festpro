"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getJudgeAssignments, assignJudge, removeJudge, getOrgMembersForJudge } from "@/lib/actions/competition"
import type { CompetitionJudgeAssignment } from "@/types/competition"
import { Loader2, Trash2, Shield, Plus, Star } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"

export default function JudgeAssignmentPage() {
  const params = useParams()
  const competitionId = params.competitionId as string
  const festivalId = params.festivalId as string
  const [judges, setJudges] = useState<CompetitionJudgeAssignment[]>([])
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [orgId, setOrgId] = useState("")

  async function load() {
    const admin = createAdminClient()
    const { data: fest } = await admin.from("festivals").select("organization_id").eq("id", festivalId).single()
    if (!fest) return
    setOrgId(fest.organization_id)

    const [j, users] = await Promise.all([
      getJudgeAssignments(competitionId),
      getOrgMembersForJudge(fest.organization_id),
    ])
    setJudges(j as CompetitionJudgeAssignment[])
    setAvailableUsers(users || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [competitionId, festivalId])

  async function handleAssign() {
    if (!selectedUserId) { toast.error("Select a user"); return }
    setSaving(true)
    const result = await assignJudge(competitionId, selectedUserId, false)
    if (result.error) toast.error(result.error)
    else toast.success("Judge assigned!")
    setSaving(false)
    setSelectedUserId("")
    await load()
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this judge?")) return
    const result = await removeJudge(id)
    if (result.error) toast.error(result.error); else toast.success("Removed")
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  const assignedIds = judges.map((j) => j.user_id)
  const available = availableUsers.filter((u) => !assignedIds.includes(u.user_id))

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Judge Assignment</h1>
          <p className="text-sm text-gray-500 mt-1">Assign judges to evaluate this competition.</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Assign New Judge</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              options={[{ value: "", label: "Select a member..." }, ...available.map((u: any) => ({ value: u.user_id, label: `${u.profile?.first_name || ""} ${u.profile?.last_name || ""} (${u.profile?.email || ""})` }))]}
              className="flex-1"
            />
            <Button onClick={handleAssign} disabled={saving || !selectedUserId}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Plus className="h-4 w-4 mr-2" /> Assign
            </Button>
          </div>
        </CardContent>
      </Card>

      {judges.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No judges assigned.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {judges.map((j) => (
            <Card key={j.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    {j.is_lead_judge ? <Star className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {(j as any).profile?.first_name} {(j as any).profile?.last_name}
                      {j.is_lead_judge && <span className="text-xs text-amber-600 ml-2">Lead Judge</span>}
                    </p>
                    <p className="text-xs text-gray-500">{(j as any).profile?.email}</p>
                  </div>
                </div>
                <button onClick={() => handleRemove(j.id)} className="p-2 text-red-400 hover:text-red-600 rounded-lg"><Trash2 className="h-4 w-4" /></button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
