import { getAiJobs } from "@/lib/actions/ai"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AI_JOB_TYPES, AI_JOB_STATUSES } from "@/config/ai-platform"
import { Layers } from "lucide-react"

export default async function JobsPage() {
  const result = await getAiJobs({ limit: 100 })
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const { data: jobs, total } = result

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Jobs</h1>
        <p className="text-sm text-gray-500">Automation and background AI job history ({total})</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Layers className="h-4 w-4" /> Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {jobs.map((j) => {
              const tpCfg = AI_JOB_TYPES.find((t) => t.value === j.job_type)
              const stCfg = AI_JOB_STATUSES.find((s) => s.value === j.status)
              return (
                <div key={j.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                  <div className="flex items-center gap-3">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${stCfg?.color ?? ""}`}>{stCfg?.label ?? j.status}</span>
                    <span className="font-medium text-gray-900">{tpCfg?.label ?? j.job_type}</span>
                    {j.error_message && <span className="text-xs text-red-500 truncate max-w-[200px]">{j.error_message}</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Priority: {j.priority}</span>
                    <span>Retries: {j.retry_count}/{j.max_retries}</span>
                    {j.duration_ms > 0 && <span>{(j.duration_ms / 1000).toFixed(1)}s</span>}
                    <span>{new Date(j.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )
            })}
            {jobs.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No AI jobs found</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
