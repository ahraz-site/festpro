import { getCostTracking, getUsageLogs } from "@/lib/actions/ai"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, BarChart3 } from "lucide-react"

export default async function CostPage() {
  const [costRes, usageRes] = await Promise.all([
    getCostTracking({ from: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0] }),
    getUsageLogs({ limit: 50 }),
  ])
  if ("error" in costRes) return <div className="text-red-500">{costRes.error}</div>
  if ("error" in usageRes) return <div className="text-red-500">{usageRes.error}</div>

  const totalCost = costRes.data.reduce((s: number, c: any) => s + (c.cost_total ?? 0), 0)
  const totalTokens = costRes.data.reduce((s: number, c: any) => s + (c.tokens_input_total ?? 0) + (c.tokens_output_total ?? 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cost & Usage</h1>
        <p className="text-sm text-gray-500">Track AI token usage, costs, and provider spending</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Cost (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalCost.toFixed(4)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Tokens (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{totalTokens.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">API Requests (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {costRes.data.reduce((s: number, c: any) => s + (c.request_count ?? 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-4 w-4" /> Daily Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {costRes.data.slice(0, 30).map((c) => (
              <div key={c.id} className="flex items-center justify-between p-2 rounded border text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-gray-900 font-medium">{c.date}</span>
                  <span className="text-xs text-gray-500">{(c as any).ai_models?.model_name ?? "Unknown"}</span>
                  <span className="text-xs text-gray-400">{(c as any).ai_providers?.provider_name ?? ""}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>In: {c.tokens_input_total.toLocaleString()}</span>
                  <span>Out: {c.tokens_output_total.toLocaleString()}</span>
                  <span className="text-green-600 font-medium">${c.cost_total.toFixed(4)}</span>
                  <span>{c.request_count} req</span>
                </div>
              </div>
            ))}
            {costRes.data.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No cost data available</p>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Recent Usage Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {usageRes.data.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-2 rounded border text-xs">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${u.success ? "bg-green-400" : "bg-red-400"}`} />
                  <span className="text-gray-600">{u.feature_name}</span>
                  <span className="text-gray-400">{u.model_id ? `model:${u.model_id.slice(0, 8)}` : ""}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <span>In: {u.tokens_input}</span>
                  <span>Out: {u.tokens_output}</span>
                  <span>${u.cost.toFixed(6)}</span>
                  <span>{u.latency_ms}ms</span>
                  <span>{new Date(u.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {usageRes.data.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No usage logs yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
