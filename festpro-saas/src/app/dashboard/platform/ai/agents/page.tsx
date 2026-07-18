import { getAgents } from "@/lib/actions/ai"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AI_AGENT_ROLES } from "@/config/ai-platform"
import { Bot, Cpu } from "lucide-react"

export default async function AgentsPage() {
  const result = await getAgents()
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const agents = result.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Agents</h1>
        <p className="text-sm text-gray-500">Configure copilot agents and their system prompts</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => {
          const roleCfg = AI_AGENT_ROLES.find((r) => r.value === a.agent_role)
          return (
            <Card key={a.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-gray-600" />
                  <CardTitle className="text-sm font-medium">{a.agent_name}</CardTitle>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${a.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {a.is_active ? "Active" : "Inactive"}
                </span>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-xs text-gray-500">{roleCfg?.label ?? a.agent_role}</p>
                {a.agent_description && <p className="text-xs text-gray-600">{a.agent_description}</p>}
                <div className="flex gap-2 text-xs text-gray-400">
                  <Cpu className="h-3 w-3" />
                  <span>Temp: {a.temperature}</span>
                  <span>Max tokens: {a.max_tokens}</span>
                </div>
                <details>
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">System Prompt</summary>
                  <p className="text-xs text-gray-600 mt-1 p-2 bg-gray-50 rounded">{a.system_prompt}</p>
                </details>
                {a.allowed_tools?.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {a.allowed_tools.map((t) => <span key={t} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{t}</span>)}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
        {agents.length === 0 && <p className="text-sm text-gray-400 col-span-3 py-4 text-center">No agents configured</p>}
      </div>
    </div>
  )
}
