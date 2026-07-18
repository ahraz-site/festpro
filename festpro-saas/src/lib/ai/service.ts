import { createAdminClient } from "@/lib/supabase/admin"
import { createProvider } from "./provider"
import { semanticSearch } from "./rag"
import type { AiChatCompletionMessage } from "./provider"
import type { AiCopilotRequest, AiCopilotResponse } from "@/types/ai-platform"

function truncateMessages(messages: AiChatCompletionMessage[], maxTokens: number): AiChatCompletionMessage[] {
  let total = 0
  const result: AiChatCompletionMessage[] = []
  for (const m of [...messages].reverse()) {
    const tokens = m.content.split(/\s+/).length
    if (total + tokens > maxTokens) break
    total += tokens
    result.unshift(m)
  }
  if (!result.length && messages.length) result.push(messages[messages.length - 1])
  return result
}

export async function processCopilotRequest(req: AiCopilotRequest): Promise<AiCopilotResponse> {
  const admin = createAdminClient()
  const orgId = req.organization_id
  const settings = orgId
    ? (await admin.from("ai_settings").select("*").eq("organization_id", orgId).maybeSingle()).data
    : null
  const defaultProviderId = settings?.default_provider_id
  const defaultModelId = settings?.default_model_id

  const provider = defaultProviderId
    ? (await admin.from("ai_providers").select("*").eq("id", defaultProviderId).single()).data
    : (await admin.from("ai_providers").select("*").eq("is_default", true).limit(1).maybeSingle()).data

  const model = defaultModelId
    ? (await admin.from("ai_models").select("*").eq("id", defaultModelId).single()).data
    : (await admin.from("ai_models").select("*").eq("status", "active").eq("supports_streaming", true).limit(1).maybeSingle()).data

  if (!provider || !model) throw new Error("No AI provider or model configured")

  const adapter = createProvider(provider.provider_type, provider.api_key_encrypted ?? "", provider.api_base_url)

  let conversationId = req.conversation_id
  let existingMessages: AiChatCompletionMessage[] = []

  if (conversationId) {
    const { data: msgs } = await admin.from("ai_messages")
      .select("role, content").eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }).limit(50)
    if (msgs) existingMessages = msgs.map((m: any) => ({ role: m.role, content: m.content }))
  }

  const agent = req.agent_role
    ? (await admin.from("ai_agents").select("*").eq("agent_role", req.agent_role).eq("is_active", true).limit(1).maybeSingle()).data
    : null

  const systemPrompt = agent?.system_prompt ?? (req.agent_role
    ? `You are an AI ${req.agent_role.replace(/_/g, " ")} assistant for FestPro. Help the user with their queries.`
    : "You are FestPro AI, an enterprise assistant for festival management. Help users with their questions about the platform, festivals, competitions, participants, and operations. Be concise, accurate, and helpful.")

  const knowledgeSources = agent?.knowledge_source_ids?.length
    ? await semanticSearch(req.message, { organization_id: orgId, festival_id: req.festival_id, limit: 5 })
    : await semanticSearch(req.message, { organization_id: orgId, festival_id: req.festival_id, limit: 3 })

  const contextBlock = knowledgeSources.length
    ? `\n\nRelevant context from knowledge base:\n${knowledgeSources.map((s) => `[Source: ${s.title}] ${s.text}`).join("\n\n")}`
    : ""

  const messages: AiChatCompletionMessage[] = [
    { role: "system", content: systemPrompt + contextBlock },
    ...truncateMessages(existingMessages, model.context_window - req.message.split(/\s+/).length - 500),
    { role: "user", content: req.message },
  ]

  const start = Date.now()
  const result = await adapter.chatCompletion({
    model: model.model_name, messages, temperature: agent?.temperature ?? model.default_temperature,
    max_tokens: agent?.max_tokens ?? model.max_tokens,
  })

  if (!conversationId) {
    const { data: conv } = await admin.from("ai_conversations").insert({
      organization_id: orgId, festival_id: req.festival_id, user_id: "00000000-0000-0000-0000-000000000000",
      agent_id: agent?.id, conversation_title: req.message.slice(0, 200),
      status: "active",
    }).select().single()
    conversationId = conv?.id
  }

  if (conversationId) {
    await admin.from("ai_messages").insert({
      conversation_id: conversationId, role: "user", content: req.message,
      tokens_input: result.tokensInput, tokens_output: 0, cost: 0,
    })
    await admin.from("ai_messages").insert({
      conversation_id: conversationId, role: "assistant", content: result.content,
      model_id: model.id, tokens_input: 0, tokens_output: result.tokensOutput,
      cost: result.cost, latency_ms: result.latencyMs,
    })
  }

  return {
    message: result.content, conversation_id: conversationId ?? "",
    sources: knowledgeSources.map((s) => ({ title: s.title, content: s.text, relevance: s.relevance })),
    tokens_input: result.tokensInput, tokens_output: result.tokensOutput,
    cost: result.cost, latency_ms: result.latencyMs,
  }
}
