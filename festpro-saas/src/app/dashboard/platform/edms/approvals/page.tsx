import { getPendingApprovals, getApprovalWorkflows } from "@/lib/actions/edms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { APPROVAL_STATUSES, APPROVAL_STEP_TYPES } from "@/config/edms"
import { FileSignature, Workflow } from "lucide-react"

export default async function ApprovalsPage() {
  const [pendingRes, workflowsRes] = await Promise.all([getPendingApprovals(), getApprovalWorkflows()])
  if ("error" in pendingRes) return <div className="text-red-500">{pendingRes.error}</div>
  if ("error" in workflowsRes) return <div className="text-red-500">{workflowsRes.error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
        <p className="text-sm text-gray-500">Approval workflows and pending requests</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><FileSignature className="h-4 w-4" /> Pending Approvals ({pendingRes.data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pendingRes.data.map((a) => {
              const doc = a as any
              return (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                  <div className="flex items-center gap-3">
                    <FileSignature className="h-4 w-4 text-amber-500" />
                    <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">Pending</span>
                    <span className="text-gray-900 font-medium">{doc.documents?.document_title ?? "Untitled"}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span>Approver: {a.approver_id.slice(0, 8)}</span>
                    <span className="ml-3">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )
            })}
            {pendingRes.data.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No pending approvals</p>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Workflow className="h-4 w-4" /> Approval Workflows ({workflowsRes.data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workflowsRes.data.map((w) => {
              const steps = (w as any).approval_steps ?? []
              return (
                <div key={w.id} className="p-3 rounded-lg border text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{w.workflow_name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${w.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {w.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {w.description && <p className="text-xs text-gray-500 mb-2">{w.description}</p>}
                  <div className="flex gap-2">
                    {steps.map((s: any, i: number) => (
                      <div key={s.id} className="flex items-center gap-1 text-xs">
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{s.step_name}</span>
                        {i < steps.length - 1 && <span className="text-gray-300">→</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {workflowsRes.data.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No workflows configured</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
