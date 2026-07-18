"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { getDeployments, updateDeploymentStatus } from "@/lib/actions/devops"
import type { DeploymentRecord } from "@/types/devops"
import { DEPLOYMENT_STATUSES } from "@/config/devops"
import { Loader2, Rocket, CheckCircle, XCircle, Clock, RotateCcw, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DeploymentsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getDeployments()
    if (res.data) setDeployments(res.data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleStatusUpdate = async (id: string, status: string) => {
    await updateDeploymentStatus(id, status)
    load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/devops`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deployment Center</h1>
          <p className="text-sm text-gray-500">Monitor and manage deployments</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Deployment History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deployments.map((d) => {
              const cfg = DEPLOYMENT_STATUSES.find((s) => s.value === d.status)
              return (
                <div key={d.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {d.status === "healthy" ? <CheckCircle className="h-4 w-4 text-green-500" /> :
                       d.status === "failed" ? <XCircle className="h-4 w-4 text-red-500" /> :
                       d.status === "rolled_back" ? <RotateCcw className="h-4 w-4 text-purple-500" /> :
                       <Clock className="h-4 w-4 text-amber-500" />}
                      <span className="font-medium text-sm">{d.deployment_name}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg?.color}`}>{cfg?.label || d.status}</span>
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-gray-400">
                      <span>Strategy: {d.strategy?.replace("_", " ")}</span>
                      {d.branch && <span>Branch: {d.branch}</span>}
                      {d.commit_sha && <span className="font-mono">{d.commit_sha.substring(0, 8)}</span>}
                      {d.duration_seconds > 0 && <span>Duration: {d.duration_seconds}s</span>}
                    </div>
                    {d.error_message && <p className="text-xs text-red-500 mt-1">{d.error_message}</p>}
                  </div>
                  <div className="flex gap-1">
                    {d.status === "deploying" && <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(d.id, "healthy")}>Mark Healthy</Button>}
                    {d.status === "deploying" && <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleStatusUpdate(d.id, "failed")}>Mark Failed</Button>}
                    {d.status === "healthy" && <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(d.id, "rolled_back")}>Rollback</Button>}
                  </div>
                </div>
              )
            })}
            {deployments.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No deployments yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
