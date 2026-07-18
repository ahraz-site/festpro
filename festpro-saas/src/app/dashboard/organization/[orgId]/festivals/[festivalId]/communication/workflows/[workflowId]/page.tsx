"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getWorkflowHistory, triggerWorkflow } from "@/lib/actions/communication"
import { WORKFLOW_TRIGGER_TYPES, WORKFLOW_ACTIONS } from "@/config/communication"
import { Loader2, History, Zap, Clock, CheckCircle, XCircle, RotateCcw, ArrowLeft } from "lucide-react"

export default function WorkflowDetailPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const workflowId = params.workflowId as string
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)

  const load = useCallback(async () => {
    const res = await getWorkflowHistory(workflowId)
    setHistory(res.data || []); setLoading(false)
  }, [workflowId])

  useEffect(() => { load() }, [load])

  const handleTrigger = async () => {
    setTriggering(true)
    const res = await triggerWorkflow(workflowId, { manual: true })
    setTriggering(false)
    if (res.error) toast.error(res.error); else { toast.success("Triggered"); load() }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/communication/workflows`}>
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflow History</h1>
            <p className="text-sm text-gray-500 mt-1">{history.length} executions</p>
          </div>
        </div>
        <Button onClick={handleTrigger} disabled={triggering}>
          {triggering ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Zap className="h-4 w-4 mr-1" />}
          Trigger Now
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <History className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No execution history yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {history.map(h => (
                <div key={h.id} className="flex items-start justify-between p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full mt-0.5 ${h.status === "completed" ? "bg-green-50 text-green-600" : h.status === "failed" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
                      {h.status === "completed" ? <CheckCircle className="h-4 w-4" /> : h.status === "failed" ? <XCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{h.result_summary || `Workflow ${h.status}`}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Triggered: {h.triggered_by === "manual" ? "Manual" : "Automatic"} · {new Date(h.executed_at).toLocaleString()}
                      </p>
                      {h.error_message && <p className="text-xs text-red-500 mt-1">{h.error_message}</p>}
                      {h.result_data && <pre className="text-xs text-gray-500 mt-1 max-h-20 overflow-y-auto">{JSON.stringify(h.result_data, null, 2)}</pre>}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    h.status === "completed" ? "bg-green-100 text-green-700" :
                    h.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}>{h.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
