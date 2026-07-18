"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { getDevOpsDashboard } from "@/lib/actions/devops"
import type { Module29DashboardData } from "@/types/devops"
import { DEPLOYMENT_STATUSES, PIPELINE_STATUSES, BUILD_STATUSES } from "@/config/devops"
import { Loader2, GitBranch, Rocket, Package, Server, Container, BarChart3, Activity, Clock, CheckCircle, XCircle, AlertTriangle, Layers, Globe, Terminal, ArrowRight } from "lucide-react"

export default function DevOpsDashboardPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [dash, setDash] = useState<Module29DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getDevOpsDashboard()
    if (res.data) setDash(res.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const stats = [
    { label: "Environments", value: dash?.total_environments ?? 0, icon: Globe, color: "text-blue-600 bg-blue-50" },
    { label: "Pipelines", value: dash?.total_pipelines ?? 0, icon: GitBranch, color: "text-indigo-600 bg-indigo-50" },
    { label: "Deployments", value: dash?.total_deployments ?? 0, icon: Rocket, color: "text-purple-600 bg-purple-50" },
    { label: "Releases", value: dash?.total_releases ?? 0, icon: Package, color: "text-green-600 bg-green-50" },
    { label: "Builds", value: dash?.total_builds ?? 0, icon: Activity, color: "text-amber-600 bg-amber-50" },
    { label: "Cluster Nodes", value: dash?.total_cluster_nodes ?? 0, icon: Server, color: "text-cyan-600 bg-cyan-50" },
    { label: "Container Images", value: dash?.total_container_images ?? 0, icon: Container, color: "text-rose-600 bg-rose-50" },
    { label: "Deploy Success", value: `${dash?.deployment_success_rate ?? 0}%`, icon: BarChart3, color: "text-emerald-600 bg-emerald-50" },
  ]

  const orgId = params.orgId as string

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DevOps Platform</h1>
          <p className="text-sm text-gray-500 mt-1">Enterprise CI/CD, Kubernetes, and Release Engineering</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/devops/pipelines`}>
            <Button variant="outline"><GitBranch className="h-4 w-4 mr-2" />Pipelines</Button>
          </Link>
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/devops/deployments`}>
            <Button variant="outline"><Rocket className="h-4 w-4 mr-2" />Deployments</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent Deployments</CardTitle>
            <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/devops/deployments`}>
              <Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {dash?.recent_deployments && dash.recent_deployments.length > 0 ? (
              <div className="space-y-3">
                {dash.recent_deployments.map((d) => {
                  const statusCfg = DEPLOYMENT_STATUSES.find((s) => s.value === d.status)
                  return (
                    <div key={d.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        {d.status === "healthy" ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> :
                         d.status === "failed" ? <XCircle className="h-4 w-4 text-red-500 shrink-0" /> :
                         <Clock className="h-4 w-4 text-amber-500 shrink-0" />}
                        <span className="truncate font-medium">{d.deployment_name}</span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg?.color || "bg-gray-100"} shrink-0`}>{statusCfg?.label || d.status}</span>
                    </div>
                  )
                })}
              </div>
            ) : <p className="text-sm text-gray-400">No recent deployments</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Recent Builds</CardTitle>
            <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/devops/pipelines`}>
              <Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            {dash?.recent_builds && dash.recent_builds.length > 0 ? (
              <div className="space-y-3">
                {dash.recent_builds.map((b) => {
                  const statusCfg = BUILD_STATUSES.find((s) => s.value === b.status)
                  return (
                    <div key={b.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        {b.status === "succeeded" ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" /> :
                         b.status === "failed" ? <XCircle className="h-4 w-4 text-red-500 shrink-0" /> :
                         <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />}
                        <span className="truncate font-medium">{b.build_number}</span>
                        <span className="text-gray-400 text-xs truncate">{b.branch}</span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg?.color || "bg-gray-100"} shrink-0`}>{statusCfg?.label || b.status}</span>
                    </div>
                  )
                })}
              </div>
            ) : <p className="text-sm text-gray-400">No recent builds</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/devops/releases`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50"><Package className="h-5 w-5 text-green-600" /></div>
              <div><p className="font-semibold text-gray-900">Release Manager</p><p className="text-xs text-gray-500">Versioning &amp; changelogs</p></div>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/devops/clusters`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-50"><Server className="h-5 w-5 text-cyan-600" /></div>
              <div><p className="font-semibold text-gray-900">Cluster Dashboard</p><p className="text-xs text-gray-500">Nodes, services &amp; workloads</p></div>
            </CardContent>
          </Card>
        </Link>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50"><AlertTriangle className="h-5 w-5 text-amber-600" /></div>
            <div><p className="font-semibold text-gray-900">Security Scans</p><p className="text-xs text-gray-500">SAST, dependency &amp; container scans</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
