"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getCriteriaGroups, createCriteriaGroup, deleteCriteriaGroup, getCriteria, createCriteria, deleteCriteria } from "@/lib/actions/judging"
import { getCompetitions } from "@/lib/actions/competition"
import type { CriteriaGroup, ScoringCriteria } from "@/types/judging"
import type { Competition } from "@/types/competition"
import { Loader2, Plus, Trash2, ListOrdered } from "lucide-react"

export default function CriteriaPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [groups, setGroups] = useState<CriteriaGroup[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [allCriteria, setAllCriteria] = useState<ScoringCriteria[]>([])
  const [loading, setLoading] = useState(true)
  const [newGroupName, setNewGroupName] = useState("")
  const [newCritName, setNewCritName] = useState("")
  const [newCritMax, setNewCritMax] = useState("100")
  const [newCritWeight, setNewCritWeight] = useState("1.0")
  const [newCritGroup, setNewCritGroup] = useState("")

  const load = useCallback(async () => {
    const [gRes, cRes, compRes] = await Promise.all([
      getCriteriaGroups(festivalId),
      getCriteria(festivalId),
      getCompetitions(festivalId),
    ])
    setGroups(gRes.data || [])
    setAllCriteria(cRes.data || [])
    setCompetitions(compRes || [])
    setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return
    const res = await createCriteriaGroup(festivalId, newGroupName)
    if (res.error) toast.error(res.error); else { toast.success("Group created"); setNewGroupName(""); load() }
  }

  const handleDeleteGroup = async (id: string) => {
    const res = await deleteCriteriaGroup(id)
    if (res.error) toast.error(res.error); else { toast.success("Group deleted"); load() }
  }

  const handleCreateCriteria = async () => {
    if (!newCritName.trim()) return
    const res = await createCriteria(festivalId, {
      name: newCritName, max_score: parseInt(newCritMax) || 100,
      weight: parseFloat(newCritWeight) || 1.0, group_id: newCritGroup || undefined,
    })
    if (res.error) toast.error(res.error); else { toast.success("Criteria created"); setNewCritName(""); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scoring Criteria</h1>
        <p className="text-sm text-gray-500 mt-1">Define criteria groups and scoring criteria for judging.</p>
      </div>

      {/* Create Group */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Create Criteria Group</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Group name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
          <Button onClick={handleCreateGroup}><Plus className="h-4 w-4 mr-1" /> Create</Button>
        </CardContent>
      </Card>

      {/* Groups List */}
      <div className="grid gap-4">
        {groups.map(g => (
          <Card key={g.id}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-gray-400" />
                {g.name}
                <span className="text-xs text-gray-400 font-normal">Order: {g.display_order}</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteGroup(g.id)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </CardHeader>
            <CardContent>
              {allCriteria.filter(c => c.group_id === g.id).length === 0 ? (
                <p className="text-sm text-gray-400">No criteria in this group yet.</p>
              ) : (
                <div className="space-y-2">
                  {allCriteria.filter(c => c.group_id === g.id).map(c => (
                    <div key={c.id} className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{c.name}</span>
                        {c.description && <span className="text-gray-400 ml-2">{c.description}</span>}
                      </div>
                      <div className="text-gray-500 text-xs">
                        Max: {c.max_score} | Weight: {c.weight}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ungrouped Criteria */}
      {allCriteria.filter(c => !c.group_id).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Ungrouped Criteria</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {allCriteria.filter(c => !c.group_id).map(c => (
              <div key={c.id} className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded-lg">
                <span className="font-medium">{c.name}</span>
                <div className="text-gray-500 text-xs">Max: {c.max_score} | Weight: {c.weight}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Create Criteria */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Create Scoring Criteria</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Criteria name" value={newCritName} onChange={e => setNewCritName(e.target.value)} />
          <div className="flex gap-2">
            <Input type="number" placeholder="Max score" value={newCritMax} onChange={e => setNewCritMax(e.target.value)} />
            <Input type="number" step="0.1" placeholder="Weight" value={newCritWeight} onChange={e => setNewCritWeight(e.target.value)} />
          </div>
          <select value={newCritGroup} onChange={e => setNewCritGroup(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <option value="">No group</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <Button onClick={handleCreateCriteria}><Plus className="h-4 w-4 mr-1" /> Create Criteria</Button>
        </CardContent>
      </Card>
    </div>
  )
}
