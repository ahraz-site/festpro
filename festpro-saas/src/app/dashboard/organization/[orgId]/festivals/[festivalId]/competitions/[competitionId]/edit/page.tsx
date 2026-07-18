"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getCompetition, updateCompetition } from "@/lib/actions/competition"
import { getCategories } from "@/lib/actions/competition/categories"
import { getGroups } from "@/lib/actions/competition/categories"
import { COMPETITION_TYPES, AGE_GROUPS, GENDER_OPTIONS, SCORING_METHODS, LANGUAGES, COMPETITION_STATUSES } from "@/config/competition"
import type { CompetitionCategory, CompetitionGroup, CompetitionFormData } from "@/types/competition"
import { Loader2, Save } from "lucide-react"

export default function EditCompetitionPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const competitionId = params.competitionId as string
  const [categories, setCategories] = useState<CompetitionCategory[]>([])
  const [groups, setGroups] = useState<CompetitionGroup[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    async function load() {
      const [comp, cats, grps] = await Promise.all([getCompetition(competitionId), getCategories(festivalId), getGroups(festivalId)])
      if (!comp) { toast.error("Not found"); return }
      const c = comp as any
      setForm({
        name: c.name, name_ml: c.name_ml || "", code: c.code || "", description: c.description || "",
        category_id: c.category_id, group_id: c.group_id || "",
        competition_type: c.competition_type, age_group: c.age_group,
        gender_restriction: c.gender_restriction, language: c.language,
        duration_minutes: c.duration_minutes.toString(), max_participants: c.max_participants.toString(),
        min_participants: c.min_participants.toString(), max_teams: c.max_teams.toString(),
        max_participants_per_team: c.max_participants_per_team.toString(),
        is_team_event: c.is_team_event, stage_required: c.stage_required,
        judge_count: c.judge_count.toString(), round_count: c.round_count.toString(),
        status: c.status, allow_multiple_entries: c.allow_multiple_entries,
        requires_approval: c.requires_approval, instructions: c.instructions || "",
        winning_criteria: c.winning_criteria || "", scoring_method: c.scoring_method,
        max_score: c.max_score.toString(), passing_score: c.passing_score?.toString() || "",
      })
      setCategories(cats as CompetitionCategory[])
      setGroups(grps as CompetitionGroup[])
      setLoading(false)
    }
    load()
  }, [competitionId, festivalId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const result = await updateCompetition(competitionId, form)
    setSaving(false)
    if (result.error) toast.error(result.error)
    else { toast.success("Updated!"); router.push(`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/${competitionId}`) }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>

  return (
    <div className="max-w-3xl mx-auto py-6">
      <Card>
        <CardHeader><CardTitle>Edit Competition</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Malayalam Name</label>
                <Input value={form.name_ml} onChange={(e) => setForm({ ...form, name_ml: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} options={categories.map((c) => ({ value: c.id, label: c.name }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Group</label>
                <Select value={form.group_id} onChange={(e) => setForm({ ...form, group_id: e.target.value })} options={[{ value: "", label: "None" }, ...groups.map((g) => ({ value: g.id, label: g.name }))]} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={COMPETITION_STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Duration</label>
                <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Max Participants</label>
                <Input type="number" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Judge Count</label>
                <Input type="number" value={form.judge_count} onChange={(e) => setForm({ ...form, judge_count: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Rounds</label>
                <Input type="number" value={form.round_count} onChange={(e) => setForm({ ...form, round_count: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <Select value={form.competition_type} onChange={(e) => setForm({ ...form, competition_type: e.target.value })} options={COMPETITION_TYPES} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Age Group</label>
                <Select value={form.age_group} onChange={(e) => setForm({ ...form, age_group: e.target.value })} options={AGE_GROUPS} />
              </div>
            </div>
            <div className="pt-4 flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
