"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createCompetition } from "@/lib/actions/competition"
import { getCategories } from "@/lib/actions/competition/categories"
import { getGroups } from "@/lib/actions/competition/categories"
import { getFestivalStages } from "@/lib/actions/festival"
import { COMPETITION_TYPES, AGE_GROUPS, GENDER_OPTIONS, SCORING_METHODS, LANGUAGES, COMPETITION_STATUSES } from "@/config/competition"
import type { CompetitionCategory, CompetitionGroup } from "@/types/competition"
import type { FestivalStage } from "@/types/festival"
import type { CompetitionFormData } from "@/types/competition"
import { Loader2, Trophy } from "lucide-react"

const defaultForm: CompetitionFormData = {
  name: "", name_ml: "", code: "", description: "",
  category_id: "", subcategory_id: "", group_id: "",
  competition_type: "individual", age_group: "open",
  gender_restriction: "all", language: "all",
  duration_minutes: "60", max_participants: "100", min_participants: "1",
  max_teams: "50", max_participants_per_team: "1",
  is_team_event: false, stage_required: true,
  judge_count: "3", round_count: "1",
  status: "draft", allow_multiple_entries: false, requires_approval: false,
  instructions: "", winning_criteria: "",
  scoring_method: "points", max_score: "100", passing_score: "",
}

export default function CreateCompetitionPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [categories, setCategories] = useState<CompetitionCategory[]>([])
  const [groups, setGroups] = useState<CompetitionGroup[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CompetitionFormData>(defaultForm)

  useEffect(() => {
    async function load() {
      const [cats, grps] = await Promise.all([getCategories(festivalId), getGroups(festivalId)])
      setCategories(cats as CompetitionCategory[])
      setGroups(grps as CompetitionGroup[])
    }
    load()
  }, [festivalId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.category_id) { toast.error("Name and category are required"); return }
    setSaving(true)
    const result = await createCompetition(festivalId, form)
    setSaving(false)
    if (result.error) { toast.error(result.error) }
    else if (result.id) {
      toast.success("Competition created!")
      router.push(`/dashboard/organization/${orgId}/festivals/${festivalId}/competitions/${result.id}`)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Create Competition</CardTitle>
              <CardDescription>Define a new competition for this festival.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Basic Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Name *</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Malayalam Essay Writing" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Malayalam Name</label>
                  <Input value={form.name_ml} onChange={(e) => setForm({ ...form, name_ml: e.target.value })} placeholder="മലയാളം ഉപന്യാസ രചന" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Code</label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="COMP-001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category *</label>
                  <Select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} options={[{ value: "", label: "Select Category" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Group</label>
                  <Select value={form.group_id} onChange={(e) => setForm({ ...form, group_id: e.target.value })} options={[{ value: "", label: "No Group" }, ...groups.map((g) => ({ value: g.id, label: g.name }))]} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Configuration</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <Select value={form.competition_type} onChange={(e) => setForm({ ...form, competition_type: e.target.value as any })} options={COMPETITION_TYPES} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Age Group</label>
                  <Select value={form.age_group} onChange={(e) => setForm({ ...form, age_group: e.target.value as any })} options={AGE_GROUPS} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <Select value={form.gender_restriction} onChange={(e) => setForm({ ...form, gender_restriction: e.target.value as any })} options={GENDER_OPTIONS} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Language</label>
                  <Select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} options={LANGUAGES} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} options={COMPETITION_STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Capacity & Scoring</h3>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Duration (min)</label>
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
                  <label className="text-sm font-medium text-gray-700">Scoring Method</label>
                  <Select value={form.scoring_method} onChange={(e) => setForm({ ...form, scoring_method: e.target.value })} options={SCORING_METHODS} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Max Score</label>
                  <Input type="number" step="0.1" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Toggles</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { key: "is_team_event", label: "Team Event" },
                  { key: "stage_required", label: "Stage Required" },
                  { key: "allow_multiple_entries", label: "Allow Multiple Entries" },
                  { key: "requires_approval", label: "Requires Approval" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <input type="checkbox" checked={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="rounded" />
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Trophy className="h-4 w-4 mr-2" />
                Create Competition
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
