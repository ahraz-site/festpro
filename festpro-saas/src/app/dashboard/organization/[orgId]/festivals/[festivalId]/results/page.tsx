"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getModule8Dashboard, getResultItemsByFestival, processResults, publishResults, setResultsLive, archiveResults, overrideResultRank } from "@/lib/actions/result"
import { getCompetitions } from "@/lib/actions/competition"
import { RESULT_PUBLISH_STATUSES } from "@/config/result"
import type { ResultItem, Module8DashboardData } from "@/types/result"
import type { Competition } from "@/types/competition"
import { Loader2, Trophy, Medal, Award, CheckCircle, Archive, RefreshCw, Eye, FileBarChart, Globe, Lock, Edit3, AlertTriangle } from "lucide-react"

export default function ResultsDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const festivalId = params.festivalId as string
  const orgId = params.orgId as string
  const [stats, setStats] = useState<Module8DashboardData | null>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [results, setResults] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selComp, setSelComp] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [processing, setProcessing] = useState(false)
  const [overrideId, setOverrideId] = useState<string | null>(null)
  const [overrideRank, setOverrideRank] = useState("")
  const [overrideReason, setOverrideReason] = useState("")

  const load = useCallback(async () => {
    const [sRes, cRes] = await Promise.all([getModule8Dashboard(festivalId), getCompetitions(festivalId)])
    setStats(sRes.data || null)
    setCompetitions(cRes || [])
    setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const loadResults = useCallback(async () => {
    setLoading(true)
    const res = await getResultItemsByFestival(festivalId, statusFilter || undefined)
    setResults(res.data || [])
    setLoading(false)
  }, [festivalId, statusFilter])

  useEffect(() => { loadResults() }, [loadResults])

  const handleProcess = async () => {
    if (!selComp) { toast.error("Select a competition"); return }
    setProcessing(true)
    const res = await processResults(selComp, festivalId)
    if (res.error) toast.error(res.error); else { toast.success(`Processed ${res.processed} results`); loadResults() }
    setProcessing(false)
  }

  const handlePublish = async () => {
    if (!selComp) { toast.error("Select a competition"); return }
    const res = await publishResults(selComp)
    if (res.error) toast.error(res.error); else { toast.success("Results published"); loadResults() }
  }

  const handleLive = async () => {
    if (!selComp) return
    const res = await setResultsLive(selComp)
    if (res.error) toast.error(res.error); else { toast.success("Results set live"); loadResults() }
  }

  const handleArchive = async () => {
    if (!selComp) return
    const res = await archiveResults(selComp)
    if (res.error) toast.error(res.error); else { toast.success("Results archived"); loadResults() }
  }

  const handleOverride = async (id: string) => {
    if (!overrideRank || !overrideReason) { toast.error("Enter rank and reason"); return }
    const res = await overrideResultRank(id, parseInt(overrideRank), overrideReason)
    if (res.error) toast.error(res.error); else { toast.success("Rank overridden"); setOverrideId(null); loadResults() }
  }

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-orange-400" />
    return <span className="text-gray-400 font-mono text-sm">{rank}</span>
  }

  const statCards = stats ? [
    { label: "Total Results", value: stats.total_results, color: "bg-blue-50 text-blue-600", icon: FileBarChart, href: "" },
    { label: "Published", value: stats.published_results, color: "bg-green-50 text-green-600", icon: CheckCircle, href: "" },
    { label: "Live", value: stats.live_results, color: "bg-emerald-50 text-emerald-600", icon: Globe, href: "" },
    { label: "Draft", value: stats.draft_results, color: "bg-gray-50 text-gray-600", icon: Lock, href: "" },
    { label: "Pending Appeals", value: stats.pending_appeals, color: "bg-amber-50 text-amber-600", icon: AlertTriangle, href: "/results/appeals" },
    { label: "Certificates", value: stats.total_certificates, color: "bg-purple-50 text-purple-600", icon: Award, href: "/results/certificates" },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results Engine</h1>
          <p className="text-sm text-gray-500 mt-1">Process, publish, and manage competition results, team points, appeals, and certificates.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/results/grades`}><Button variant="outline" size="sm"><Award className="h-4 w-4 mr-1" />Grades</Button></Link>
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/results/team-points`}><Button variant="outline" size="sm"><Trophy className="h-4 w-4 mr-1" />Team Points</Button></Link>
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/results/championship`}><Button variant="outline" size="sm"><Medal className="h-4 w-4 mr-1" />Championship</Button></Link>
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/results/appeals`}><Button variant="outline" size="sm"><AlertTriangle className="h-4 w-4 mr-1" />Appeals</Button></Link>
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/results/certificates`}><Button variant="outline" size="sm"><Award className="h-4 w-4 mr-1" />Certificates</Button></Link>
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/results/publications`}><Button variant="outline" size="sm"><Globe className="h-4 w-4 mr-1" />Publications</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map(c => (
          <Link key={c.label} href={c.href ? `/dashboard/organization/${orgId}/festivals/${festivalId}${c.href}` : "#"}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${c.color}`}><c.icon className="h-5 w-5" /></div>
                  <div><p className="text-xs text-gray-500">{c.label}</p><p className="text-xl font-bold">{c.value}</p></div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="pt-4 flex flex-wrap gap-2">
          <Select
            options={competitions.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Select competition"
            value={selComp}
            onChange={e => setSelComp(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Select
            options={[{ value: "", label: "All Status" }, ...RESULT_PUBLISH_STATUSES.map(s => ({ value: s.value, label: s.label }))]}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          />
          <Button onClick={handleProcess} disabled={!selComp || processing} size="sm">
            {processing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />} Process
          </Button>
          <Button onClick={handlePublish} disabled={!selComp} size="sm" variant="outline" className="text-green-600"><CheckCircle className="h-4 w-4 mr-1" />Publish</Button>
          <Button onClick={handleLive} disabled={!selComp} size="sm" variant="outline" className="text-emerald-600"><Globe className="h-4 w-4 mr-1" />Go Live</Button>
          <Button onClick={handleArchive} disabled={!selComp} size="sm" variant="outline" className="text-gray-400"><Archive className="h-4 w-4 mr-1" />Archive</Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
      ) : results.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No results. Select a competition and click Process.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {results.map(r => (
            <Card key={r.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 text-center">{r.rank ? rankIcon(r.rank) : "—"}</div>
                    <div className="flex-1">
                      <p className="font-medium">{r.participant?.first_name} {r.participant?.last_name}</p>
                      <p className="text-xs text-gray-400">ID: {r.participant?.participant_id} | Chest: {r.participant?.chest_number} | {r.competition?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">{r.final_score?.toFixed(2) ?? "—"}</p>
                      {r.grade && <span className="text-xs px-1.5 py-0.5 rounded border text-green-600 border-green-200 bg-green-50">{r.grade}</span>}
                      {r.is_tie && <span className="text-xs text-orange-500 ml-1">Tied</span>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${RESULT_PUBLISH_STATUSES.find(s => s.value === r.status)?.color || ""}`}>{r.status}</span>
                    {r.rank_overridden && <span className="text-xs text-amber-600 flex items-center"><Edit3 className="h-3 w-3 mr-0.5" />Override</span>}
                    <Button variant="ghost" size="sm" onClick={() => setOverrideId(overrideId === r.id ? null : r.id)}>
                      <Edit3 className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                </div>
                {overrideId === r.id && (
                  <div className="mt-3 pt-3 border-t flex gap-2 items-end">
                    <div><label className="text-xs text-gray-500">New Rank</label><Input type="number" min={1} value={overrideRank} onChange={e => setOverrideRank(e.target.value)} className="w-20" /></div>
                    <div className="flex-1"><label className="text-xs text-gray-500">Reason</label><Input value={overrideReason} onChange={e => setOverrideReason(e.target.value)} placeholder="Reason for override" /></div>
                    <Button size="sm" onClick={() => handleOverride(r.id)}>Save</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
