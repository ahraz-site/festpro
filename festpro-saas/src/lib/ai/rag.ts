import { createAdminClient } from "@/lib/supabase/admin"
import { createProvider } from "./provider"

function chunkText(text: string, maxTokens = 512): string[] {
  const chunks: string[] = []
  const sentences = text.match(/[^.!?\n]+[.!?\n]+/g) ?? [text]
  let current = ""
  for (const s of sentences) {
    const wordCount = (current + s).split(/\s+/).length
    if (wordCount > maxTokens && current) { chunks.push(current.trim()); current = s }
    else current += s
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks.length ? chunks : [text.trim()]
}

export async function indexDocument(documentId: string) {
  const admin = createAdminClient()
  const { data: doc } = await admin.from("knowledge_documents").select("*").eq("id", documentId).single()
  if (!doc) throw new Error("Document not found")

  const { data: source } = await admin.from("knowledge_sources").select("*").eq("id", doc.source_id).single()
  if (!source) throw new Error("Source not found")

  const { data: settings } = await admin.from("ai_settings").select("*").eq("organization_id", source.organization_id).single()
  const { data: provider } = await admin.from("ai_providers").select("*").eq("id", settings?.default_provider_id ?? "none").maybeSingle()
  const { data: model } = await admin.from("ai_models").select("*").eq("supports_embeddings", true).limit(1).maybeSingle()

  const adapter = provider ? createProvider(provider.provider_type, provider.api_key_encrypted ?? "", provider.api_base_url) : null
  const embedModel = model?.model_name ?? "text-embedding-3-small"

  const chunks = chunkText(doc.content)
  const embeddings: number[][] = []
  if (adapter) {
    for (const chunk of chunks) {
      try {
        const result = await adapter.generateEmbedding({ model: embedModel, input: chunk })
        embeddings.push(result.embeddings[0])
      } catch { embeddings.push([]) }
    }
  }

  const chunkIds: string[] = []
  for (let i = 0; i < chunks.length; i++) {
    const hash = chunks[i].length.toString(36) + "_" + i
    const { data: emb, error: embErr } = await admin.from("ai_embeddings").insert({
      source_type: "knowledge_document", source_id: doc.id, content_hash: hash,
      embedding: embeddings[i]?.length ? embeddings[i] : null, chunk_text: chunks[i],
      metadata: { document_title: doc.document_title, source_name: source.source_name, chunk_index: i, total_chunks: chunks.length },
    }).select().single()
    if (embErr) continue
    const { data: chunk } = await admin.from("knowledge_chunks").insert({
      document_id: doc.id, chunk_index: i, chunk_text: chunks[i],
      chunk_tokens: chunks[i].split(/\s+/).length, embedding_id: emb?.id ?? null,
      metadata: { document_title: doc.document_title, chunk_index: i, total_chunks: chunks.length },
    }).select().single()
    if (chunk) chunkIds.push(chunk.id)
  }

  await admin.from("knowledge_documents").update({
    status: "indexed", is_indexed: true, chunk_count: chunks.length,
    content_hash: chunks.length.toString(),
  }).eq("id", doc.id)

  await admin.from("knowledge_indexes").upsert({
    organization_id: source.organization_id, source_id: doc.source_id, document_id: doc.id,
    index_name: `idx_${doc.id.slice(0, 8)}`, index_type: "vector",
    total_chunks: chunks.length, total_tokens: doc.content.split(/\s+/).length,
    last_indexed_at: new Date().toISOString(),
  }, { onConflict: "document_id", ignoreDuplicates: false })

  return { chunks: chunkIds.length, total: chunks.length }
}

export async function semanticSearch(query: string, options?: { organization_id?: string; festival_id?: string; limit?: number; min_relevance?: number }): Promise<{ text: string; title: string; source: string; relevance: number; document_id: string }[]> {
  const admin = createAdminClient()
  const limit = options?.limit ?? 10

  const { data: settings } = await admin.from("ai_settings").select("default_provider_id").eq("organization_id", options?.organization_id ?? "none").maybeSingle()
  const { data: provider } = await admin.from("ai_providers").select("*").eq("id", settings?.default_provider_id ?? "none").maybeSingle()
  const { data: model } = await admin.from("ai_models").select("*").eq("supports_embeddings", true).limit(1).maybeSingle()
  const adapter = provider ? createProvider(provider.provider_type, provider.api_key_encrypted ?? "", provider.api_base_url) : null

  if (adapter && model) {
    try {
      const embResult = await adapter.generateEmbedding({ model: model.model_name, input: query })
      const queryEmbedding = embResult.embeddings[0]
      if (queryEmbedding?.length) {
        let q = admin.from("ai_embeddings").select("id, chunk_text, metadata, source_id, source_type")
          .order("embedding <=> " + JSON.stringify(queryEmbedding) + "::vector", { ascending: false } as any)
          .limit(limit)
        const { data: results } = await q
        if (results?.length) {
          return results.map((r: any) => ({
            text: r.chunk_text, title: r.metadata?.document_title ?? "Unknown",
            source: r.metadata?.source_name ?? "Unknown", relevance: 1,
            document_id: r.source_id,
          }))
        }
      }
    } catch { /* fallback to text search */ }
  }

  let q = admin.from("knowledge_chunks").select("chunk_text, document_id, metadata, documents!inner(document_title, source_id, knowledge_sources!inner(source_name))")
  if (options?.organization_id) q = q.eq("documents.organization_id", options.organization_id)
  if (options?.festival_id) q = q.eq("documents.festival_id", options.festival_id)
  q = q.ilike("chunk_text", `%${query}%`).limit(limit)
  const { data: results } = await q
  if (!results?.length) return []
  return results.map((r: any) => ({
    text: r.chunk_text, title: r.documents?.document_title ?? "Unknown",
    source: r.documents?.knowledge_sources?.source_name ?? "Unknown",
    relevance: 0.5, document_id: r.document_id,
  }))
}
