import { getProviders, getModels } from "@/lib/actions/ai"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AI_PROVIDER_TYPES, AI_MODEL_STATUSES } from "@/config/ai-platform"
import { Bot, Cpu } from "lucide-react"

export default async function ProvidersPage() {
  const [providersRes, modelsRes] = await Promise.all([getProviders(), getModels()])
  if ("error" in providersRes) return <div className="text-red-500">{providersRes.error}</div>
  if ("error" in modelsRes) return <div className="text-red-500">{modelsRes.error}</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Providers & Models</h1>
        <p className="text-sm text-gray-500">Configure AI providers and manage models</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Bot className="h-4 w-4" /> Providers ({providersRes.data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {providersRes.data.map((p) => {
              const tpCfg = AI_PROVIDER_TYPES.find((t) => t.value === p.provider_type)
              return (
                <div key={p.id} className="p-3 rounded-lg border text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{p.provider_name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {p.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">{tpCfg?.label ?? p.provider_type}</span>
                  {p.is_default && <span className="ml-1 px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-600">Default</span>}
                  <p className="text-xs text-gray-400 mt-1">Rate: {p.rate_limit_per_minute}/min, {p.rate_limit_per_day}/day</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Cpu className="h-4 w-4" /> Models ({modelsRes.data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {modelsRes.data.map((m) => {
              const stCfg = AI_MODEL_STATUSES.find((s) => s.value === m.status)
              return (
                <div key={m.id} className="p-3 rounded-lg border text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{m.model_display_name || m.model_name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${stCfg?.color ?? ""}`}>{stCfg?.label ?? m.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">{m.model_name} {m.model_version ? `(${m.model_version})` : ""}</p>
                  <div className="flex gap-2 mt-1 text-xs text-gray-400">
                    <span>Context: {m.context_window.toLocaleString()}</span>
                    <span>Max: {m.max_tokens.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2 mt-1 text-xs text-gray-400">
                    <span>In: ${m.input_cost_per_1k}/1k</span>
                    <span>Out: ${m.output_cost_per_1k}/1k</span>
                  </div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {m.supports_streaming && <span className="text-xs bg-blue-50 text-blue-600 px-1 rounded">Stream</span>}
                    {m.supports_vision && <span className="text-xs bg-purple-50 text-purple-600 px-1 rounded">Vision</span>}
                    {m.supports_tools && <span className="text-xs bg-green-50 text-green-600 px-1 rounded">Tools</span>}
                    {m.supports_embeddings && <span className="text-xs bg-amber-50 text-amber-600 px-1 rounded">Embeddings</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
