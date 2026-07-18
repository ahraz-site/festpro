"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getDeploymentPipelines, getBuilds, deletePipeline } from "@/lib/actions/devops"
import type { DeploymentPipeline, BuildRecord } from "@/types/devops"
import { PIPELINE_STATUSES, BUILD_STATUSES } from "@/config/devops"
import { Loader2, GitBranch, Plus, Trash2, CheckCircle, XCircle, Clock, Activity, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PipelinesPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [pipelines, setPipelines] = useState<DeploymentPipeline[]>([])
  const [builds, setBuilds] = useState<BuildRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ pipeline_name: "", description: "", repository_url: "", repository_branch: "main", is_active: true })

  const load = useCallback(async () => {
    const [pRes, bRes] = await Promise.all([getDeploymentPipelines(), getBuilds()])
    if (pRes.data) setPipelines(pRes.data)
    if (bRes.data) setBuilds(bRes.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    await deletePipeline(id)
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/devops`}>
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline Monitor</h1>
            <p className="text-sm text-gray-500">CI/CD pipelines and build history</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" />New Pipeline</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input placeholder="Pipeline name" value={form.pipeline_name} onChange={(e) => setForm({ ...form, pipeline_name: e.target.value })} className="border rounded px-3 py-2 text-sm" />
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border rounded px-3 py-2 text-sm" />
              <input placeholder="Repository URL" value={form.repository_url} onChange={(e) => setForm({ ...form, repository_url: e.target.value })} className="border rounded px-3 py-2 text-sm" />
              <input placeholder="Branch (default: main)" value={form.repository_branch} onChange={(e) => setForm({ ...form, repository_branch: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={async () => {
                const { upsertDeploymentPipeline } = await import("@/lib/actions/devops")
                await upsertDeploymentPipeline(form)
                setShowForm(false)
                setForm({ pipeline_name: "", description: "", repository_url: "", repository_branch: "main", is_active: true })
                load()
              }}>Create Pipeline</Button>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Pipelines</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pipelines.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-sm truncate">{p.pipeline_name}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{p.is_active ? "Active" : "Inactive"}</span>
                    </div>
                    {p.description && <p className="text-xs text-gray-500 mt-1 truncate">{p.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">{p.repository_branch} &middot; {p.repository_url || "No repo"}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                </div>
              ))}
              {pipelines.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No pipelines defined</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Recent Builds</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {builds.map((b) => {
                const cfg = BUILD_STATUSES.find((s) => s.value === b.status)
                return (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {b.status === "succeeded" ? <CheckCircle className="h-4 w-4 text-green-500" /> :
                         b.status === "failed" ? <XCircle className="h-4 w-4 text-red-500" /> :
                         <Activity className="h-4 w-4 text-blue-500" />}
                        <span className="font-medium text-sm">{b.build_number}</span>
                        <span className="text-xs text-gray-400">{b.branch}</span>
                      </div>
                      {b.duration_seconds > 0 && <p className="text-xs text-gray-400 mt-1">Duration: {b.duration_seconds}s</p>}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg?.color}`}>{cfg?.label || b.status}</span>
                  </div>
                )
              })}
              {builds.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No builds yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
