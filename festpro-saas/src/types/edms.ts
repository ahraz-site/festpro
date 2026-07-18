export type DocumentStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "published" | "archived" | "deleted"
export type DocumentVersionType = "major" | "minor"
export type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated" | "skipped"
export type ApprovalStepType = "single" | "parallel" | "conditional" | "escalation"
export type SignatureStatus = "pending" | "signed" | "declined" | "expired"
export type ArchiveStatus = "pending" | "archiving" | "archived" | "restoring" | "restored" | "failed"
export type RetentionAction = "archive" | "delete" | "review" | "notify"
export type KnowledgeArticleStatus = "draft" | "published" | "archived" | "deprecated"
export type ShareAccessLevel = "view" | "comment" | "edit"
export type ShareTargetType = "user" | "organization" | "public"

export interface DocumentFolder {
  id: string; organization_id: string; parent_folder_id: string | null; folder_name: string
  folder_slug: string; description: string | null; icon: string; color: string; sort_order: number
  is_archived: boolean; path: string; depth: number; created_by: string | null; created_at: string; updated_at: string
}

export interface DocumentCategory {
  id: string; organization_id: string; category_name: string; description: string | null
  color: string; icon: string; is_active: boolean; sort_order: number; created_at: string
}

export interface DocumentTag {
  id: string; organization_id: string; tag_name: string; color: string; is_active: boolean; usage_count: number; created_at: string
}

export interface Document {
  id: string; organization_id: string; festival_id: string | null; folder_id: string | null
  category_id: string | null; document_title: string; document_slug: string; description: string | null
  document_type: string; mime_type: string | null; file_extension: string | null; file_size_bytes: number | null
  status: DocumentStatus; current_version: number; is_template: boolean; template_id: string | null
  is_encrypted: boolean; checksum: string | null; metadata: any; tags: string[]
  category_ids: string[]; is_locked: boolean; locked_by: string | null; locked_at: string | null
  retention_rule_id: string | null; archive_at: string | null; expires_at: string | null
  created_by: string | null; updated_by: string | null; created_at: string; updated_at: string
}

export interface DocumentVersion {
  id: string; document_id: string; version: number; version_type: DocumentVersionType
  version_label: string | null; change_notes: string | null; file_url: string; storage_path: string
  file_size_bytes: number; checksum: string | null; mime_type: string | null; is_restored: boolean
  restored_from_version: number | null; metadata: any; created_by: string | null; created_at: string
}

export interface DocumentFile {
  id: string; document_id: string; version_id: string | null; original_filename: string
  storage_path: string; storage_bucket: string; file_size_bytes: number; mime_type: string | null
  checksum: string | null; is_encrypted: boolean; metadata: any; created_by: string | null; created_at: string
}

export interface DocumentPermission {
  id: string; document_id: string; user_id: string | null; role_id: string | null
  can_view: boolean; can_edit: boolean; can_delete: boolean; can_share: boolean; can_approve: boolean
  expires_at: string | null; created_at: string
}

export interface DocumentShare {
  id: string; document_id: string; organization_id: string | null; target_type: ShareTargetType
  target_id: string; access_level: ShareAccessLevel; share_token: string; share_link: string | null
  is_password_protected: boolean; password_hash: string | null; expires_at: string | null
  max_downloads: number | null; download_count: number; is_active: boolean; created_by: string | null; created_at: string; updated_at: string
}

export interface DocumentComment {
  id: string; document_id: string; version_id: string | null; parent_comment_id: string | null
  content: string; page_number: number | null; x_position: number | null; y_position: number | null
  is_resolved: boolean; created_by: string | null; created_at: string; updated_at: string
}

export interface DocumentReview {
  id: string; document_id: string; reviewer_id: string; review_type: string
  status: ApprovalStatus; comments: string | null; reviewed_at: string | null; due_at: string | null; created_at: string
}

export interface DocumentApproval {
  id: string; document_id: string; workflow_id: string | null; step_id: string | null
  approver_id: string; status: ApprovalStatus; comments: string | null; signed_at: string | null; created_at: string
}

export interface ApprovalWorkflow {
  id: string; organization_id: string; workflow_name: string; description: string | null
  document_category_id: string | null; is_active: boolean; config: any; created_by: string | null; created_at: string; updated_at: string
}

export interface ApprovalStep {
  id: string; workflow_id: string; step_order: number; step_name: string; step_type: ApprovalStepType
  approver_ids: string[]; min_approvals: number; timeout_hours: number | null; escalation_step_id: string | null; config: any; created_at: string
}

export interface ApprovalHistory {
  id: string; approval_id: string | null; document_id: string; action: string
  from_status: string; to_status: string; comments: string | null; changed_by: string | null; metadata: any; created_at: string
}

export interface DocumentTemplate {
  id: string; organization_id: string; template_name: string; template_type: string
  description: string | null; content: string | null; schema: any; variables: string[]
  category_id: string | null; is_active: boolean; is_public: boolean; current_version: number
  thumbnail_url: string | null; created_by: string | null; created_at: string; updated_at: string
}

export interface TemplateVersion {
  id: string; template_id: string; version: number; content: string; schema: any
  variables: string[]; change_notes: string | null; created_by: string | null; created_at: string
}

export interface DocumentSignature {
  id: string; document_id: string; version_id: string | null; signer_id: string
  signature_data: string | null; signature_hash: string | null; certificate_id: string | null
  ip_address: string; user_agent: string | null; signed_at: string
}

export interface SignatureRequest {
  id: string; document_id: string; signer_email: string; signer_name: string; message: string | null
  status: SignatureStatus; token: string; expires_at: string | null; signed_at: string | null; created_by: string | null; created_at: string
}

export interface DigitalCertificate {
  id: string; organization_id: string | null; certificate_name: string; certificate_type: string
  public_key: string | null; certificate_data: string | null; fingerprint: string | null
  issuer: string | null; valid_from: string; valid_until: string | null; is_revoked: boolean
  revoked_at: string | null; created_by: string | null; created_at: string
}

export interface DocumentBookmark {
  id: string; user_id: string; document_id: string; folder_id: string | null; note: string | null; created_at: string
}

export interface RetentionRule {
  id: string; organization_id: string; rule_name: string; description: string | null
  document_type: string | null; category_id: string | null; retention_days: number
  action_on_expiry: RetentionAction; is_legal_hold: boolean; is_active: boolean; created_by: string | null; created_at: string; updated_at: string
}

export interface ArchivePolicy {
  id: string; organization_id: string; policy_name: string; description: string | null
  archive_frequency: string; retention_after_archive_days: number; compress_archives: boolean
  encrypt_archives: boolean; storage_location: string; is_active: boolean; created_by: string | null; created_at: string; updated_at: string
}

export interface ArchiveJob {
  id: string; organization_id: string; policy_id: string | null; archive_name: string; status: ArchiveStatus
  total_documents: number; archived_documents: number; failed_documents: number; total_size_bytes: number
  storage_path: string | null; checksum: string | null; started_at: string | null; completed_at: string | null
  duration_seconds: number; error_message: string | null; created_by: string | null; created_at: string
}

export interface KnowledgeArticle {
  id: string; organization_id: string; festival_id: string | null; category_id: string | null
  title: string; slug: string; content: string; excerpt: string | null; article_type: string
  status: KnowledgeArticleStatus; is_featured: boolean; is_public: boolean; view_count: number
  helpful_count: number; tags: string[]; related_document_ids: string[]; metadata: any
  created_by: string | null; updated_by: string | null; published_at: string | null; created_at: string; updated_at: string
}

export interface KnowledgeCategory {
  id: string; organization_id: string; parent_category_id: string | null; category_name: string
  slug: string; description: string | null; icon: string; sort_order: number; is_active: boolean; created_at: string; updated_at: string
}

export interface KnowledgeFeedback {
  id: string; article_id: string; user_id: string; rating: number; comment: string | null; is_helpful: boolean | null; created_at: string
}

export interface KnowledgeRelationship {
  id: string; article_id: string; related_article_id: string; relationship_type: string; weight: number; created_at: string
}

export interface EdmsDashboardData {
  total_documents: number; published_documents: number; draft_documents: number
  total_folders: number; total_templates: number; total_approvals_pending: number
  total_knowledge_articles: number; published_articles: number
  total_archive_jobs: number; total_retention_rules: number
  total_shares_active: number; total_storage_bytes: number
}
