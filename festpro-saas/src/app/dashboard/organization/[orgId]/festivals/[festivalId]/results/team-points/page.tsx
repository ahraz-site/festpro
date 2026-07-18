"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getTeamPoints, calculateTeamPoints, publishTeamPoints, getPointRules, upsertPointRule, deletePointRule } from "@/lib/actions/team-points"
import { ENTITY_TYPES, POINT_TYPES, MEDAL_EMOJIS } from "@/config/result"
import type { TeamPoint, TeamPointRule } from "@/types/result"
import { Loader2, Trophy, Medal, Award, RefreshCw, Plus, Trash2, Save } from "lucide-react"

export default function TeamPointsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [points, setPoints] = useState<TeamPoint[]>([])
  const [rules, setRules] = useState<TeamPointRule[]>([])
  const [loading, setLoading] = useState(true)
  const [entityFilter, setEntityFilter] = useState("")
  const [showRules, setShowRules] = useState(false)
  const [newRule, setNewRule] = useState({ rule_name: "", entity_type: "unit", point_type: "rank", rank_from: "1", rank_to: "1", points: "10" })

  const load = useCallback(async () => {
    const [pRes, rRes] = await Promise.all([getTeamPoints(festivalId, entityFilter || undefined), getPointRules(festivalId)])
    setPoints(pRes.data || []); setRules(rRes.data || []); setLoading(false)
  }, [festivalId, entityFilter])

  useEffect(() => { load() }, [load])

  const handleCalculate = async () => {
    const res = await calculateTeamPoints(festivalId)
    if (res.error) toast.error(res.error); else { toast.success(`Calculated ${res.processed} team points`); load() }
  }

  const handlePublish = async () => {
    const res = await publishTeamPoints(festivalId)
    if (res.error) toast.error(res.error); else { toast.success("Points published"); load() }
  }

  const handleSaveRule = async () => {
    const res = await upsertPointRule(festivalId, {
      rule_name: newRule.rule_name, entity_type: newRule.entity_type, point_type: newRule.point_type,
      rank_from: parseInt(newRule.rank_from) || undefined,
      rank_to: parseInt(newRule.rank_to) || undefined,
      points: parseFloat(newRule.points) || 0,
    })
    if (res.error) toast.error(res.error); else { toast.success("Rule saved"); setNewRule({ rule_name: "", entity_type: "unit", point_type: "rank", rank_from: "1", rank_to: "1", points: "10" }); load() }
  }

  const handleDeleteRule = async (id: string) => {
    const res = await deletePointRule(id)
    if (res.error) toast.error(res.error); else { toast.success("Rule deleted"); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Points</h1>
          <p className="text-sm text-gray-500 mt-1">Calculate and manage team/school unit points from results.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowRules(!showRules)}><Plus className="h-4 w-4 mr-1" /> {showRules ? "Hide Rules" : "Scoring Rules"}</Button>
          <Button onClick={handleCalculate}><RefreshCw className="h-4 w-4 mr-1" /> Calculate</Button>
          <Button variant="outline" className="text-green-600" onClick={handlePublish}><Save className="h-4 w-4 mr-1" /> Publish</Button>
        </div>
      </div>

      {showRules && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Point Rules</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Input placeholder="Rule name" value={newRule.rule_name} onChange={e => setNewRule(r => ({ ...r, rule_name: e.target.value }))} className="w-40" />
              <select value={newRule.entity_type} onChange={e => setNewRule(r => ({ ...r, entity_type: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                {ENTITY_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
              <select value={newRule.point_type} onChange={e => setNewRule(r => ({ ...r, point_type: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                {POINT_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <Input type="number" placeholder="From rank" value={newRule.rank_from} onChange={e => setNewRule(r => ({ ...r, rank_from: e.target.value }))} className="w-24" />
              <Input type="number" placeholder="To rank" value={newRule.rank_to} onChange={e => setNewRule(r => ({ ...r, rank_to: e.target.value }))} className="w-24" />
              <Input type="number" placeholder="Points" value={newRule.points} onChange={e => setNewRule(r => ({ ...r, points: e.target.value }))} className="w-20" />
              <Button size="sm" onClick={handleSaveRule}><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {rules.map(r => (
                <div key={r.id} className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded text-sm">
                  <span><strong>{r.rule_name}</strong> — {r.entity_type} / {r.point_type} (ranks {r.rank_from ?? "—"}-{r.rank_to ?? "—"}): {r.points} pts</span>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(r.id)}><Trash2 className="h-3 w-3 text-red-400" /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm mb-4">
            <option value="">All Entity Types</option>
            {ENTITY_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
          {points.length === 0 ? (
            <p className="text-center py-8 text-gray-400">No team points. Click Calculate.</p>
          ) : (
            <div className="space-y-2">
              {points.map(p => (
                <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg ${p.rank === 1 ? "bg-yellow-50 border border-yellow-200" : p.rank === 2 ? "bg-gray-50 border border-gray-200" : p.rank === 3 ? "bg-orange-50 border border-orange-200" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    {p.rank === 1 ? <Trophy className="h-5 w-5 text-yellow-500" /> : p.rank === 2 ? <Medal className="h-5 w-5 text-gray-400" /> : p.rank === 3 ? <Award className="h-5 w-5 text-orange-400" /> : <span className="w-5 text-center font-mono text-sm text-gray-400">{p.rank}</span>}
                    <div>
                      <p className="font-medium">{p.entity_name || p.entity_id.slice(0, 12)}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.entity_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold">{p.total_points} pts</span>
                    <span>{MEDAL_EMOJIS.gold} {p.medals_gold}</span>
                    <span>{MEDAL_EMOJIS.silver} {p.medals_silver}</span>
                    <span>{MEDAL_EMOJIS.bronze} {p.medals_bronze}</span>
                    <span className="text-gray-400">{p.participation_count} entries</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
