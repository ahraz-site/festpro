import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { DocumentFile } from "@/types/edms"

export interface StorageAdapter {
  upload(bucket: string, path: string, file: File | Blob, metadata?: Record<string, string>): Promise<string>
  download(bucket: string, path: string): Promise<Blob | null>
  delete(bucket: string, path: string): Promise<void>
  getUrl(bucket: string, path: string): string
  list(bucket: string, prefix: string): Promise<string[]>
}

class SupabaseStorageAdapter implements StorageAdapter {
  async getClient() {
    const s = await createClient()
    return s
  }

  async upload(bucket: string, path: string, file: File | Blob, metadata?: Record<string, string>): Promise<string> {
    const supabase = await this.getClient()
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600", upsert: true, metadata,
    })
    if (error) throw new Error(`Storage upload error: ${error.message}`)
    return data.path
  }

  async download(bucket: string, path: string): Promise<Blob | null> {
    const supabase = await this.getClient()
    const { data } = await supabase.storage.from(bucket).download(path)
    return data
  }

  async delete(bucket: string, path: string): Promise<void> {
    const supabase = await this.getClient()
    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) throw new Error(`Storage delete error: ${error.message}`)
  }

  getUrl(bucket: string, path: string): string {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
  }

  async list(bucket: string, prefix: string): Promise<string[]> {
    const supabase = await this.getClient()
    const { data, error } = await supabase.storage.from(bucket).list(prefix)
    if (error) throw new Error(`Storage list error: ${error.message}`)
    return (data ?? []).map((f: any) => f.name)
  }
}

let storageInstance: StorageAdapter | null = null

export function getStorageAdapter(): StorageAdapter {
  if (!storageInstance) storageInstance = new SupabaseStorageAdapter()
  return storageInstance
}

export async function storeDocumentFile(
  documentId: string, file: File | Blob, originalFilename: string,
  bucket = "documents", userId?: string,
): Promise<{ file: DocumentFile; path: string }> {
  const storage = getStorageAdapter()
  const extension = originalFilename.split(".").pop()?.toLowerCase() ?? ""
  const storagePath = `${documentId}/${Date.now()}_${originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}`

  const fullPath = await storage.upload(bucket, storagePath, file, {
    documentId, originalFilename, uploadedBy: userId ?? "system",
  })

  const admin = createAdminClient()
  const { data: docFile, error } = await admin.from("document_files").insert({
    document_id: documentId, original_filename: originalFilename,
    storage_path: fullPath, storage_bucket: bucket,
    file_size_bytes: file.size, mime_type: file.type || `application/${extension}`,
    created_by: userId ?? null,
  }).select().single()

  if (error) throw new Error(`Failed to record document file: ${error.message}`)

  return { file: docFile, path: fullPath }
}

export async function getDocumentDownloadUrl(documentId: string, versionId?: string): Promise<string | null> {
  const admin = createAdminClient()
  let q = admin.from("document_files").select("storage_path, storage_bucket").eq("document_id", documentId).order("created_at", { ascending: false })
  if (versionId) q = q.eq("version_id", versionId)
  const { data } = await q.limit(1).maybeSingle()
  if (!data) return null
  const storage = getStorageAdapter()
  return storage.getUrl(data.storage_bucket, data.storage_path)
}

export async function deleteDocumentFiles(documentId: string): Promise<void> {
  const admin = createAdminClient()
  const { data: files } = await admin.from("document_files").select("storage_path, storage_bucket").eq("document_id", documentId)
  if (!files?.length) return
  const storage = getStorageAdapter()
  for (const f of files) {
    try { await storage.delete(f.storage_bucket, f.storage_path) } catch { /* continue */ }
  }
  await admin.from("document_files").delete().eq("document_id", documentId)
}
