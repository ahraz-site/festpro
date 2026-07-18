"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getWorkflows, updateWorkflowStatus, deleteWorkflow } from "@/lib/actions/communication"
import { WORKFLOW_TRIGGER_TYPES } from "@/config/communication"
import { Loader2, Workflow, Plus, Play, Pause, Trash2, Eye, Zap, History } from "lucide-react"

export default function WorkflowsPage() {
  const params = useParams()
  const router = useRouter()
  const festivalId = params.festivalId as string
  const [workflows, setWorkflows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    const res = await getWorkflows(festivalId)
    setWorkflows(res.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleToggleStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "paused" : "active"
    await updateWorkflowStatus(id, newStatus); toast.success(`Workflow ${newStatus}`); load()
  }

  const handleDelete = async (id: string) => {
    await deleteWorkflow(id); toast.success("Deleted"); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const activeCount = workflows.filter(w => w.status === "active").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Rules</h1>
          <p className="text-sm text-gray-500 mt-1">{workflows.length} rules · {activeCount} active</p>
        </div>
        <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/communication/workflows/create`}>
          <Button><Plus className="h-4 w-4 mr-1" /> New Rule</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workflows.length === 0 ? (
          <Card className="sm:col-span-2 lg:col-span-3"><CardContent className="py-12 text-center text-gray-400">
            <Workflow className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No workflow rules yet</p>
          </CardContent></Card>
        ) : workflows.map(w => {
          const triggerInfo = WORKFLOW_TRIGGER_TYPES.find(t => t.value === w.trigger_type)
          return (
            <Card key={w.id} className={`hover:shadow-md transition-shadow ${w.status === "active" ? "border-l-4 border-indigo-500" : ""}`}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Zap className={`h-4 w-4 ${w.status === "active" ? "text-indigo-500" : "text-gray-400"}`} />
                      <p className="font-semibold">{w.rule_name}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Trigger: {triggerInfo?.label || w.trigger_type}</p>
                    <p className="text-xs text-gray-500">Condition: {w.conditions?.type || "none"} {w.conditions?.value || ""}</p>
                    <p className="text-xs text-gray-500">Action: {w.actions?.type || "none"} {w.actions?.target ? `→ ${w.actions.target}` : ""}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        w.status === "active" ? "bg-green-100 text-green-700" :
                        w.status === "paused" ? "bg-amber-100 text-amber-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>{w.status}</span>
                      <span className="text-xs text-gray-400">Executed: {w.execution_count || 0}x</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                  <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(w.id, w.status)}>
                    {w.status === "active" ? <Pause className="h-3.5 w-3.5 text-amber-500" /> : <Play className="h-3.5 w-3.5 text-green-500" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/organization/${params.orgId}/festivals/${festivalId}/communication/workflows/create?id=${w.id}`)}>
                    <Eye className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/organization/${params.orgId}/festivals/${festivalId}/communication/workflows/${w.id}`)}>
                    <History className="h-3.5 w-3.5 text-gray-400" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(w.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
