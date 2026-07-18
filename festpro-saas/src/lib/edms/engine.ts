import { createAdminClient } from "@/lib/supabase/admin"
import crypto from "crypto"

export function generateChecksum(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

export function generateShareToken(): string {
  return `fp_share_${crypto.randomBytes(24).toString("hex")}`
}

export function detectDocumentType(mimeType: string, extension: string): string {
  const ext = extension.toLowerCase()
  if (["pdf"].includes(ext)) return "document"
  if (["docx", "odt", "rtf", "txt"].includes(ext)) return "document"
  if (["csv", "xlsx", "ods"].includes(ext)) return "spreadsheet"
  if (["pptx", "odp"].includes(ext)) return "presentation"
  if (["png", "jpg", "jpeg", "svg", "webp"].includes(ext)) return "image"
  if (["mp4", "webm"].includes(ext)) return "video"
  if (["mp3", "wav"].includes(ext)) return "audio"
  if (["zip"].includes(ext)) return "archive"
  if (["json", "xml"].includes(ext)) return "data"
  return "other"
}

export function generateDocumentSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 200)
}

export async function getDocumentTree(organizationId: string): Promise<any[]> {
  const admin = createAdminClient()
  const { data: folders } = await admin.from("document_folders")
    .select("*").eq("organization_id", organizationId).eq("is_archived", false)
    .order("sort_order").order("folder_name")

  if (!folders) return []

  const map = new Map<string, any>()
  const roots: any[] = []

  for (const f of folders) {
    map.set(f.id, { ...f, children: [] })
  }

  for (const f of folders) {
    const node = map.get(f.id)
    if (f.parent_folder_id && map.has(f.parent_folder_id)) {
      map.get(f.parent_folder_id).children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export async function applyRetentionRules(documentId: string): Promise<void> {
  const admin = createAdminClient()
  const { data: doc } = await admin.from("documents").select("organization_id, retention_rule_id, status").eq("id", documentId).single()
  if (!doc || !doc.retention_rule_id) return

  const { data: rule } = await admin.from("retention_rules").select("*").eq("id", doc.retention_rule_id).single()
  if (!rule || !rule.is_active) return

  const createdAt = new Date()
  const expiresAt = new Date(createdAt.getTime() + rule.retention_days * 86400000)

  await admin.from("documents").update({ expires_at: expiresAt.toISOString() }).eq("id", documentId)
}

export async function processExpiredDocuments(): Promise<{ archived: number; deleted: number }> {
  const admin = createAdminClient()
  const now = new Date().toISOString()
  let archived = 0; let deleted = 0

  const { data: expired } = await admin.from("documents")
    .select("id, retention_rule_id, expires_at, status")
    .lt("expires_at", now)
    .not("status", "in", '("archived","deleted")')
    .limit(100)

  if (!expired) return { archived: 0, deleted: 0 }

  for (const doc of expired) {
    const { data: rule } = await admin.from("retention_rules").select("*").eq("id", doc.retention_rule_id).single()
    if (!rule) continue

    switch (rule.action_on_expiry) {
      case "archive":
        await admin.from("documents").update({ status: "archived", archive_at: now }).eq("id", doc.id)
        archived++
        break
      case "delete":
        await admin.from("documents").update({ status: "deleted" }).eq("id", doc.id)
        deleted++
        break
      case "notify":
        break
    }
  }

  return { archived, deleted }
}

export function computeFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024; const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
