"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getStorageAdapter, storeDocumentFile, deleteDocumentFiles } from "@/lib/edms/storage"
import { getDocumentTree, generateShareToken, detectDocumentType, generateDocumentSlug, applyRetentionRules } from "@/lib/edms/engine"
import type {
  Document, DocumentFolder, DocumentCategory, DocumentTag, DocumentVersion, DocumentFile,
  DocumentShare, DocumentComment, DocumentApproval, ApprovalWorkflow, ApprovalStep,
  DocumentTemplate, TemplateVersion, DocumentSignature, SignatureRequest, DigitalCertificate,
  DocumentBookmark, RetentionRule, ArchiveJob, ArchivePolicy, KnowledgeArticle, KnowledgeCategory,
  KnowledgeFeedback, EdmsDashboardData,
} from "@/types/edms"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkSuperAdmin() {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  const { data: profile } = await admin.from("user_profiles").select("role").eq("user_id", user.id).single()
  if (!profile || !["super_admin", "platform_admin"].includes(profile.role)) return { allowed: false, error: "Not authorized" } as const
  return { allowed: true, user } as const
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getEdmsDashboard(): Promise<{ data: EdmsDashboardData } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const [{ count: td }, { count: pd }, { count: dd }, { count: tf }, { count: tt }, { count: tap },
      { count: tka }, { count: pa }, { count: taj }, { count: trr }, { count: ts }, { count: tsb },
    ] = await Promise.all([
      admin.from("documents").select("*", { count: "exact", head: true }),
      admin.from("documents").select("*", { count: "exact", head: true }).eq("status", "published"),
      admin.from("documents").select("*", { count: "exact", head: true }).eq("status", "draft"),
      admin.from("document_folders").select("*", { count: "exact", head: true }),
      admin.from("document_templates").select("*", { count: "exact", head: true }),
      admin.from("document_approvals").select("*", { count: "exact", head: true }).eq("status", "pending"),
      admin.from("knowledge_articles").select("*", { count: "exact", head: true }),
      admin.from("knowledge_articles").select("*", { count: "exact", head: true }).eq("status", "published"),
      admin.from("archive_jobs").select("*", { count: "exact", head: true }),
      admin.from("retention_rules").select("*", { count: "exact", head: true }),
      admin.from("document_shares").select("*", { count: "exact", head: true }).eq("is_active", true),
      admin.from("document_files").select("file_size_bytes", { count: "exact", head: false }).limit(1000),
    ])
    return {
      data: {
        total_documents: td ?? 0, published_documents: pd ?? 0, draft_documents: dd ?? 0,
        total_folders: tf ?? 0, total_templates: tt ?? 0, total_approvals_pending: tap ?? 0,
        total_knowledge_articles: tka ?? 0, published_articles: pa ?? 0,
        total_archive_jobs: taj ?? 0, total_retention_rules: trr ?? 0,
        total_shares_active: ts ?? 0, total_storage_bytes: tsb ?? 0,
      },
    }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// FOLDERS
// ============================================================

export async function getFolders(organizationId: string): Promise<{ data: DocumentFolder[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("document_folders").select("*").eq("organization_id", organizationId).eq("is_archived", false).order("sort_order").order("folder_name")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function createFolder(data: Partial<DocumentFolder>): Promise<{ data: DocumentFolder } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: folder, error } = await admin.from("document_folders").insert(data).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/edms")
    return { data: folder }
  } catch (e: any) { return { error: e.message } }
}

export async function getFolderTree(organizationId: string): Promise<{ data: any[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const tree = await getDocumentTree(organizationId)
    return { data: tree }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// DOCUMENTS
// ============================================================

export async function getDocuments(options?: { folder_id?: string; status?: string; type?: string; limit?: number; offset?: number }): Promise<{ data: Document[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50; const offset = options?.offset ?? 0
    let q = admin.from("documents").select("*, document_folders(folder_name), document_categories(category_name)", { count: "exact" })
    let cq = admin.from("documents").select("*", { count: "exact", head: true })
    if (options?.folder_id) { q = q.eq("folder_id", options.folder_id); cq = cq.eq("folder_id", options.folder_id) }
    if (options?.status) { q = q.eq("status", options.status); cq = cq.eq("status", options.status) }
    if (options?.type) { q = q.eq("document_type", options.type); cq = cq.eq("document_type", options.type) }
    q = q.order("updated_at", { ascending: false }).range(offset, offset + limit - 1)
    const [{ data, count }, { count: total }] = await Promise.all([q, cq])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

export async function getDocument(id: string): Promise<{ data: Document } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data, error } = await admin.from("documents").select("*, document_folders(folder_name), document_categories(category_name)").eq("id", id).single()
    if (error) return { error: error.message }
    return { data }
  } catch (e: any) { return { error: e.message } }
}

export async function createDocument(data: Partial<Document>): Promise<{ data: Document } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const slug = data.document_title ? generateDocumentSlug(data.document_title) : ""
    const { data: doc, error } = await admin.from("documents").insert({ ...data, document_slug: slug }).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/edms")
    return { data: doc }
  } catch (e: any) { return { error: e.message } }
}

export async function updateDocument(id: string, updates: Partial<Document>): Promise<{ data: Document } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: doc, error } = await admin.from("documents").update(updates).eq("id", id).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/edms")
    return { data: doc }
  } catch (e: any) { return { error: e.message } }
}

export async function deleteDocument(id: string): Promise<{ success: boolean } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    await deleteDocumentFiles(id)
    const admin = createAdminClient()
    const { error } = await admin.from("documents").update({ status: "deleted" }).eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/edms")
    return { success: true }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// VERSIONS
// ============================================================

export async function getDocumentVersions(documentId: string): Promise<{ data: DocumentVersion[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("document_versions").select("*").eq("document_id", documentId).order("version", { ascending: false })
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// CATEGORIES
// ============================================================

export async function getDocumentCategories(): Promise<{ data: DocumentCategory[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("document_categories").select("*").order("sort_order").order("category_name")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function getDocumentTags(): Promise<{ data: DocumentTag[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("document_tags").select("*").order("tag_name")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// APPROVALS
// ============================================================

export async function getApprovalWorkflows(): Promise<{ data: ApprovalWorkflow[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("approval_workflows").select("*, approval_steps(*)").order("workflow_name")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function getPendingApprovals(): Promise<{ data: DocumentApproval[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("document_approvals").select("*, documents(document_title, document_slug)").eq("status", "pending").order("created_at", { ascending: false }).limit(50)
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function submitApproval(approvalId: string, status: string, comments?: string): Promise<{ data: DocumentApproval } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data, error } = await admin.from("document_approvals").update({
      status, comments: comments ?? null, signed_at: new Date().toISOString(),
    }).eq("id", approvalId).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/edms")
    return { data }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// TEMPLATES
// ============================================================

export async function getTemplates(): Promise<{ data: DocumentTemplate[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("document_templates").select("*, document_categories(category_name)").order("template_name")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function createTemplate(data: Partial<DocumentTemplate>): Promise<{ data: DocumentTemplate } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: template, error } = await admin.from("document_templates").insert(data).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/edms")
    return { data: template }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// SHARES
// ============================================================

export async function getActiveShares(): Promise<{ data: DocumentShare[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("document_shares").select("*, documents(document_title)").eq("is_active", true).order("created_at", { ascending: false }).limit(50)
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function createShare(data: Partial<DocumentShare>): Promise<{ data: DocumentShare } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: share, error } = await admin.from("document_shares").insert({
      ...data, share_token: generateShareToken(), is_active: true,
    }).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/edms")
    return { data: share }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// RETENTION
// ============================================================

export async function getRetentionRules(): Promise<{ data: RetentionRule[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("retention_rules").select("*, document_categories(category_name)").order("rule_name")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function createRetentionRule(data: Partial<RetentionRule>): Promise<{ data: RetentionRule } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: rule, error } = await admin.from("retention_rules").insert(data).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/edms")
    return { data: rule }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// ARCHIVE
// ============================================================

export async function getArchivePolicies(): Promise<{ data: ArchivePolicy[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("archive_policies").select("*").order("policy_name")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function getArchiveJobs(): Promise<{ data: ArchiveJob[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("archive_jobs").select("*, archive_policies(policy_name)").order("created_at", { ascending: false }).limit(50)
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// KNOWLEDGE
// ============================================================

export async function getKnowledgeArticles(options?: { status?: string; category_id?: string; limit?: number }): Promise<{ data: KnowledgeArticle[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50; const offset = 0
    let q = admin.from("knowledge_articles").select("*, knowledge_categories(category_name)", { count: "exact" })
    let cq = admin.from("knowledge_articles").select("*", { count: "exact", head: true })
    if (options?.status) { q = q.eq("status", options.status); cq = cq.eq("status", options.status) }
    if (options?.category_id) { q = q.eq("category_id", options.category_id); cq = cq.eq("category_id", options.category_id) }
    q = q.order("updated_at", { ascending: false }).limit(limit)
    const [{ data, count }, { count: total }] = await Promise.all([q, cq])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

export async function createKnowledgeArticle(data: Partial<KnowledgeArticle>): Promise<{ data: KnowledgeArticle } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const slug = data.title ? generateDocumentSlug(data.title) : ""
    const { data: article, error } = await admin.from("knowledge_articles").insert({ ...data, slug }).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/edms")
    return { data: article }
  } catch (e: any) { return { error: e.message } }
}

export async function getKnowledgeCategories(): Promise<{ data: KnowledgeCategory[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("knowledge_categories").select("*").order("sort_order").order("category_name")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// BOOKMARKS
// ============================================================

export async function toggleBookmark(documentId: string): Promise<{ bookmarked: boolean } | { error: string }> {
  try {
    const auth = await getAuth()
    if (!auth) return { error: "Not authenticated" }
    const admin = createAdminClient()
    const { data: existing } = await admin.from("document_bookmarks").select("id").eq("user_id", auth.id).eq("document_id", documentId).maybeSingle()
    if (existing) {
      await admin.from("document_bookmarks").delete().eq("id", existing.id)
      return { bookmarked: false }
    }
    await admin.from("document_bookmarks").insert({ user_id: auth.id, document_id: documentId })
    return { bookmarked: true }
  } catch (e: any) { return { error: e.message } }
}
