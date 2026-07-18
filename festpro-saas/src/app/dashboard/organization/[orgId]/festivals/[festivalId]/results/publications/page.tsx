"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getPublications, createPublication } from "@/lib/actions/result"
import { getCompetitions } from "@/lib/actions/competition"
import { getFestivalStages } from "@/lib/actions/festival"
import { getCategories } from "@/lib/actions/competition/categories"
import { PUBLISH_SCOPES } from "@/config/result"
import type { ResultPublication } from "@/types/result"
import type { Competition, CompetitionCategory } from "@/types/competition"
import type { FestivalStage } from "@/types/festival"
import { Loader2, Globe, Plus, ExternalLink } from "lucide-react"

export default function PublicationsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [pubs, setPubs] = useState<ResultPublication[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [stages, setStages] = useState<FestivalStage[]>([])
  const [categories, setCategories] = useState<CompetitionCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ publish_scope: "competition", competition_id: "", stage_id: "", category_id: "", title: "", description: "" })

  const load = useCallback(async () => {
    const [pRes, cRes, sRes, catRes] = await Promise.all([
      getPublications(festivalId), getCompetitions(festivalId),
      getFestivalStages(festivalId), getCategories(festivalId),
    ])
    setPubs(pRes.data || []); setCompetitions(cRes || []); setStages(sRes || []); setCategories(catRes as any || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    const res = await createPublication(festivalId, {
      publish_scope: form.publish_scope,
      competition_id: form.competition_id || undefined,
      stage_id: form.stage_id || undefined,
      category_id: form.category_id || undefined,
      title: form.title || undefined, description: form.description || undefined,
    })
    if (res.error) toast.error(res.error); else { toast.success("Publication created"); setShowCreate(false); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Result Publications</h1>
          <p className="text-sm text-gray-500 mt-1">Publish results by competition, stage, category, or festival-wide.</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4 mr-1" /> New Publication</Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Create Publication</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Select
              options={PUBLISH_SCOPES.map(s => ({ value: s.value, label: s.label }))}
              value={form.publish_scope}
              onChange={e => setForm(f => ({ ...f, publish_scope: e.target.value }))}
            />
            {form.publish_scope === "competition" && (
              <Select options={competitions.map(c => ({ value: c.id, label: c.name }))} placeholder="Select competition" value={form.competition_id} onChange={e => setForm(f => ({ ...f, competition_id: e.target.value }))} />
            )}
            {form.publish_scope === "stage" && (
              <Select options={stages.map(s => ({ value: s.id, label: s.name }))} placeholder="Select stage" value={form.stage_id} onChange={e => setForm(f => ({ ...f, stage_id: e.target.value }))} />
            )}
            {form.publish_scope === "category" && (
              <Select options={categories.map(c => ({ value: c.id, label: c.name }))} placeholder="Select category" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} />
            )}
            <div className="flex gap-2">
              <input placeholder="Title (optional)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm" />
              <Button onClick={handleCreate}><Globe className="h-4 w-4 mr-1" /> Publish</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {pubs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No publications yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {pubs.map(p => (
            <Card key={p.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className={`h-5 w-5 ${p.status === "live" ? "text-emerald-500" : "text-gray-400"}`} />
                    <div>
                      <p className="font-medium">{p.title || p.publish_scope}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.publish_scope} — {new Date(p.published_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_live ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                      {p.is_live ? "Live" : p.status}
                    </span>
                    <Button variant="ghost" size="sm"><ExternalLink className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
