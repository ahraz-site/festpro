import { getPredictions } from "@/lib/actions/ai"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AI_PREDICTION_STATUSES } from "@/config/ai-platform"
import { TrendingUp, BarChart3 } from "lucide-react"

export default async function PredictionsPage() {
  const result = await getPredictions({ limit: 100 })
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const { data: predictions, total } = result

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Predictions</h1>
        <p className="text-sm text-gray-500">AI-powered forecasts and predictive insights ({total})</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {predictions.map((p) => {
              const stCfg = AI_PREDICTION_STATUSES.find((s) => s.value === p.status)
              return (
                <div key={p.id} className="p-3 rounded-lg border text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{p.prediction_name || p.prediction_type}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${stCfg?.color ?? ""}`}>{stCfg?.label ?? p.status}</span>
                    </div>
                    <span className="text-xs text-gray-400">{p.prediction_type}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Confidence: {(p.confidence * 100).toFixed(0)}%</span>
                    {p.accuracy !== null && <span>Accuracy: {(p.accuracy * 100).toFixed(0)}%</span>}
                    <span>Created: {new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )
            })}
            {predictions.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No predictions yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
