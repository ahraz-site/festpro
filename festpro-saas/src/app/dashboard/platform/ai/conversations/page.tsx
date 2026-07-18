import { getConversations } from "@/lib/actions/ai"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AI_CONVERSATION_STATUSES, AI_AGENT_ROLES } from "@/config/ai-platform"
import { MessageSquare, Bot, User } from "lucide-react"

export default async function ConversationsPage() {
  const result = await getConversations({ limit: 100 })
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const { data: conversations, total } = result

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <p className="text-sm text-gray-500">View AI chat history ({total} total)</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="h-4 w-4" /> All Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {conversations.map((c) => {
              const stCfg = AI_CONVERSATION_STATUSES.find((s) => s.value === c.status)
              const agentCfg = AI_AGENT_ROLES.find((a) => a.value === c.agent_id as any)
              return (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <Bot className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${stCfg?.color ?? ""}`}>{stCfg?.label ?? c.status}</span>
                    <span className="font-medium text-gray-900 truncate">{c.conversation_title || "Untitled"}</span>
                    {agentCfg && <span className="text-xs text-gray-400">{agentCfg.label}</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                    <span>{c.message_count} msgs</span>
                    <span>${c.cost.toFixed(4)}</span>
                    <span>{new Date(c.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )
            })}
            {conversations.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No conversations yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
