"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { processCopilotRequest } from "@/lib/ai/service"
import { indexDocument, semanticSearch } from "@/lib/ai/rag"
import type {
  AiProvider, AiModel, AiSettings, AiAgent, AiTool, AiPrompt, AiPromptVersion,
  AiConversation, AiMessage, AiJob, AiFeedback, KnowledgeSource, KnowledgeDocument,
  AiPrediction, AiRecommendation, AiSummary, AiUsageLog, AiCostTracking,
  AiDashboardData, AiCopilotRequest, AiCopilotResponse, KnowledgeChunk,
} from "@/types/ai-platform"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkSuperAdmin() {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single()
  const allowedRoles = ["platform_owner", "platform_admin", "organization_owner", "organization_admin", "super_admin"]
  if (!profile || !allowedRoles.includes(profile.role)) {
    return { allowed: false, error: "Not authorized" } as const
  }
  return { allowed: true, user } as const
}

async function checkOrgAccess(organizationId: string) {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  const { data: member } = await admin.from("organization_members").select("role").eq("organization_id", organizationId).eq("user_id", user.id).single()
  if (!member) return { allowed: false, error: "Not a member" } as const
  return { allowed: true, user, org_member_role: member.role } as const
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getAiDashboard(): Promise<{ data: AiDashboardData } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const today = new Date().toISOString().split("T")[0]
    const [{ count: tc }, { count: ac }, { count: tmsg }, { count: ttok }, { count: tj }, { count: fj },
      { count: tp }, { count: ta }, { count: tkd }, { count: kid }, { count: tpred }, { count: trec },
    ] = await Promise.all([
      admin.from("ai_conversations").select("*", { count: "exact", head: true }),
      admin.from("ai_conversations").select("*", { count: "exact", head: true }).eq("status", "active"),
      admin.from("ai_messages").select("*", { count: "exact", head: true }),
      admin.from("ai_messages").select("tokens_input, tokens_output", { count: "exact", head: false }).neq("model_id", null),
      admin.from("ai_jobs").select("*", { count: "exact", head: true }),
      admin.from("ai_jobs").select("*", { count: "exact", head: true }).eq("status", "failed"),
      admin.from("ai_providers").select("*", { count: "exact", head: true }),
      admin.from("ai_agents").select("*", { count: "exact", head: true }).eq("is_active", true),
      admin.from("knowledge_documents").select("*", { count: "exact", head: true }),
      admin.from("knowledge_documents").select("*", { count: "exact", head: true }).eq("is_indexed", true),
      admin.from("ai_predictions").select("*", { count: "exact", head: true }),
      admin.from("ai_recommendations").select("*", { count: "exact", head: true }),
    ])
    const { data: costToday } = await admin.from("ai_cost_tracking").select("cost_total").eq("date", today).maybeSingle()
    const { data: latencyData } = await admin.from("ai_usage_logs").select("latency_ms").limit(100).order("created_at", { ascending: false })
    const avgLat = latencyData?.length ? latencyData.reduce((s: number, r: any) => s + (r.latency_ms ?? 0), 0) / latencyData.length : 0
    return {
      data: {
        total_conversations: tc ?? 0, active_conversations: ac ?? 0, total_messages: tmsg ?? 0,
        total_tokens: ttok ?? 0, total_cost: costToday?.cost_total ?? 0,
        total_providers: tp ?? 0, active_agents: ta ?? 0, total_knowledge_docs: tkd ?? 0,
        indexed_docs: kid ?? 0, total_predictions: tpred ?? 0, total_recommendations: trec ?? 0,
        total_jobs: tj ?? 0, failed_jobs: fj ?? 0, cost_today: costToday?.cost_total ?? 0, avg_latency_ms: Math.round(avgLat),
      },
    }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// AI CONVERSATIONS
// ============================================================

export async function copilotChat(req: AiCopilotRequest): Promise<{ data: AiCopilotResponse } | { error: string }> {
  try {
    const auth = await getAuth()
    if (!auth) return { error: "Not authenticated" }
    const result = await processCopilotRequest(req)
    revalidatePath("/dashboard/platform/ai")
    return { data: result }
  } catch (e: any) { return { error: e.message } }
}

export async function getConversations(options?: { status?: string; limit?: number; offset?: number }): Promise<{ data: AiConversation[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50; const offset = options?.offset ?? 0
    let q = admin.from("ai_conversations").select("*", { count: "exact" })
    let cq = admin.from("ai_conversations").select("*", { count: "exact", head: true })
    if (options?.status) { q = q.eq("status", options.status); cq = cq.eq("status", options.status) }
    q = q.order("updated_at", { ascending: false }).range(offset, offset + limit - 1)
    const [{ data, count }, { count: total }] = await Promise.all([q, cq])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

export async function getConversation(id: string): Promise<{ data: AiConversation } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data, error } = await admin.from("ai_conversations").select("*").eq("id", id).single()
    if (error) return { error: error.message }
    return { data }
  } catch (e: any) { return { error: e.message } }
}

export async function getConversationMessages(conversationId: string): Promise<{ data: AiMessage[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("ai_messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true })
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function updateConversation(id: string, updates: Partial<AiConversation>): Promise<{ data: AiConversation } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data, error } = await admin.from("ai_conversations").update(updates).eq("id", id).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/ai")
    return { data }
  } catch (e: any) { return { error: e.message } }
}

export async function deleteConversation(id: string): Promise<{ success: boolean } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { error } = await admin.from("ai_conversations").delete().eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/ai")
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// AI PROVIDERS
// ============================================================

export async function getProviders(): Promise<{ data: AiProvider[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("ai_providers").select("*").order("provider_name")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function createProvider(data: Partial<AiProvider>): Promise<{ data: AiProvider } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: prov, error } = await admin.from("ai_providers").insert(data).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/ai")
    return { data: prov }
  } catch (e: any) { return { error: e.message } }
}

export async function updateProvider(id: string, updates: Partial<AiProvider>): Promise<{ data: AiProvider } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: prov, error } = await admin.from("ai_providers").update(updates).eq("id", id).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/ai")
    return { data: prov }
  } catch (e: any) { return { error: e.message } }
}

export async function deleteProvider(id: string): Promise<{ success: boolean } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { error } = await admin.from("ai_providers").delete().eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/ai")
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// AI MODELS
// ============================================================

export async function getModels(providerId?: string): Promise<{ data: AiModel[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    let q = admin.from("ai_models").select("*, ai_providers(provider_name, provider_type)").order("model_name")
    if (providerId) q = q.eq("provider_id", providerId)
    const { data } = await q
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function createModel(data: Partial<AiModel>): Promise<{ data: AiModel } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: model, error } = await admin.from("ai_models").insert(data).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/ai")
    return { data: model }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// AI SETTINGS
// ============================================================

export async function getAiSettings(organizationId?: string): Promise<{ data: AiSettings } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    let q = admin.from("ai_settings").select("*, ai_providers!default_provider_id(provider_name), ai_models!default_model_id(model_name)")
    if (organizationId) q = q.eq("organization_id", organizationId)
    else q = q.is("organization_id", null)
    const { data, error } = await q.maybeSingle()
    if (error) return { error: error.message }
    return { data: data ?? null as any }
  } catch (e: any) { return { error: e.message } }
}

export async function upsertAiSettings(data: Partial<AiSettings>): Promise<{ data: AiSettings } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: settings, error } = await admin.from("ai_settings").upsert(data, { onConflict: "organization_id" }).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/ai")
    return { data: settings }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// AI AGENTS
// ============================================================

export async function getAgents(organizationId?: string): Promise<{ data: AiAgent[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    let q = admin.from("ai_agents").select("*, ai_models(model_name)").order("agent_role")
    if (organizationId) q = q.eq("organization_id", organizationId)
    const { data } = await q
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function createAgent(data: Partial<AiAgent>): Promise<{ data: AiAgent } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: agent, error } = await admin.from("ai_agents").insert(data).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/ai")
    return { data: agent }
  } catch (e: any) { return { error: e.message } }
}

export async function updateAgent(id: string, updates: Partial<AiAgent>): Promise<{ data: AiAgent } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: agent, error } = await admin.from("ai_agents").update(updates).eq("id", id).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/ai")
    return { data: agent }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// AI PROMPTS
// ============================================================

export async function getPrompts(options?: { category?: string; limit?: number; offset?: number }): Promise<{ data: AiPrompt[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50; const offset = options?.offset ?? 0
    let q = admin.from("ai_prompts").select("*, user_profiles!created_by(first_name, last_name)", { count: "exact" })
    let cq = admin.from("ai_prompts").select("*", { count: "exact", head: true })
    if (options?.category) { q = q.eq("prompt_category", options.category); cq = cq.eq("prompt_category", options.category) }
    q = q.order("updated_at", { ascending: false }).range(offset, offset + limit - 1)
    const [{ data, count }, { count: total }] = await Promise.all([q, cq])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

export async function createPrompt(data: Partial<AiPrompt>): Promise<{ data: AiPrompt } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: prompt, error } = await admin.from("ai_prompts").insert(data).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/ai")
    return { data: prompt }
  } catch (e: any) { return { error: e.message } }
}

export async function updatePrompt(id: string, updates: Partial<AiPrompt>): Promise<{ data: AiPrompt } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: prompt, error } = await admin.from("ai_prompts").update(updates).eq("id", id).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/ai")
    return { data: prompt }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// KNOWLEDGE SOURCES
// ============================================================

export async function getKnowledgeSources(organizationId?: string): Promise<{ data: KnowledgeSource[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    let q = admin.from("knowledge_sources").select("*").order("source_name")
    if (organizationId) q = q.eq("organization_id", organizationId)
    const { data } = await q
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function createKnowledgeSource(data: Partial<KnowledgeSource>): Promise<{ data: KnowledgeSource } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: source, error } = await admin.from("knowledge_sources").insert(data).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/ai")
    return { data: source }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// KNOWLEDGE DOCUMENTS
// ============================================================

export async function getKnowledgeDocuments(sourceId?: string): Promise<{ data: KnowledgeDocument[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    let q = admin.from("knowledge_documents").select("*, knowledge_sources(source_name)").order("created_at", { ascending: false })
    if (sourceId) q = q.eq("source_id", sourceId)
    const { data } = await q
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function createKnowledgeDocument(data: Partial<KnowledgeDocument>): Promise<{ data: KnowledgeDocument } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: doc, error } = await admin.from("knowledge_documents").insert(data).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/ai")
    return { data: doc }
  } catch (e: any) { return { error: e.message } }
}

export async function triggerDocumentIndexing(documentId: string): Promise<{ success: boolean } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const result = await indexDocument(documentId)
    revalidatePath("/dashboard/platform/ai")
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// SEMANTIC SEARCH
// ============================================================

export async function searchKnowledge(query: string, options?: { organization_id?: string; limit?: number }): Promise<{ data: any[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const results = await semanticSearch(query, options)
    return { data: results }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// AI PREDICTIONS
// ============================================================

export async function getPredictions(options?: { type?: string; status?: string; limit?: number }): Promise<{ data: AiPrediction[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50; const offset = 0
    let q = admin.from("ai_predictions").select("*", { count: "exact" })
    let cq = admin.from("ai_predictions").select("*", { count: "exact", head: true })
    if (options?.type) { q = q.eq("prediction_type", options.type); cq = cq.eq("prediction_type", options.type) }
    if (options?.status) { q = q.eq("status", options.status); cq = cq.eq("status", options.status) }
    q = q.order("created_at", { ascending: false }).limit(limit)
    const [{ data, count }, { count: total }] = await Promise.all([q, cq])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// AI RECOMMENDATIONS
// ============================================================

export async function getRecommendations(options?: { type?: string; limit?: number }): Promise<{ data: AiRecommendation[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50; const offset = 0
    let q = admin.from("ai_recommendations").select("*", { count: "exact" }).order("created_at", { ascending: false })
    let cq = admin.from("ai_recommendations").select("*", { count: "exact", head: true })
    if (options?.type) { q = q.eq("recommendation_type", options.type); cq = cq.eq("recommendation_type", options.type) }
    q = q.limit(limit)
    const [{ data, count }, { count: total }] = await Promise.all([q, cq])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// AI JOBS
// ============================================================

export async function getAiJobs(options?: { type?: string; status?: string; limit?: number }): Promise<{ data: AiJob[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50; const offset = 0
    let q = admin.from("ai_jobs").select("*", { count: "exact" })
    let cq = admin.from("ai_jobs").select("*", { count: "exact", head: true })
    if (options?.type) { q = q.eq("job_type", options.type); cq = cq.eq("job_type", options.type) }
    if (options?.status) { q = q.eq("status", options.status); cq = cq.eq("status", options.status) }
    q = q.order("created_at", { ascending: false }).limit(limit)
    const [{ data, count }, { count: total }] = await Promise.all([q, cq])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// USAGE & COST
// ============================================================

export async function getUsageLogs(options?: { limit?: number; offset?: number }): Promise<{ data: AiUsageLog[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50; const offset = options?.offset ?? 0
    const [{ data, count }, { count: total }] = await Promise.all([
      admin.from("ai_usage_logs").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(offset, offset + limit - 1),
      admin.from("ai_usage_logs").select("*", { count: "exact", head: true }),
    ])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

export async function getCostTracking(options?: { from?: string; to?: string }): Promise<{ data: AiCostTracking[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    let q = admin.from("ai_cost_tracking").select("*, ai_models(model_name), ai_providers(provider_name)").order("date", { ascending: false }).limit(90)
    if (options?.from) q = q.gte("date", options.from)
    if (options?.to) q = q.lte("date", options.to)
    const { data } = await q
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// AI FEEDBACK
// ============================================================

export async function submitFeedback(data: Partial<AiFeedback>): Promise<{ data: AiFeedback } | { error: string }> {
  try {
    const auth = await getAuth()
    if (!auth) return { error: "Not authenticated" }
    const admin = createAdminClient()
    const { data: fb, error } = await admin.from("ai_feedback").insert(data).select().single()
    if (error) return { error: error.message }
    return { data: fb }
  } catch (e: any) { return { error: e.message } }
}
