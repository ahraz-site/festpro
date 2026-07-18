import { getDeploymentHistory } from "@/lib/actions/observability"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers, GitCommit } from "lucide-react"

const DEPLOYMENTS_PAGE_SIZE = 100

export default async function DeploymentsPage() {
  const result = await getDeploymentHistory({ limit: DEPLOYMENTS_PAGE_SIZE })
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const { data: deployments, total } = result

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Deployment History</h1>
        <p className="text-sm text-gray-500">Track deployments across all environments</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Layers className="h-4 w-4" /> Deployments ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {deployments.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                <div className="flex items-center gap-3">
                  <GitCommit className="h-4 w-4 text-gray-400" />
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    d.status === "completed" ? "bg-green-100 text-green-700" :
                    d.status === "failed" ? "bg-red-100 text-red-700" :
                    d.status === "running" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                  }`}>{d.status}</span>
                  <span className="font-medium text-gray-900">{d.deployment_version}</span>
                  <span className="text-gray-400 text-xs">{d.environment}</span>
                  {d.branch && <span className="text-gray-400 text-xs">{d.branch}</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {d.deployed_by && <span>{d.deployed_by}</span>}
                  <span>{new Date(d.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {deployments.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No deployments found</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
