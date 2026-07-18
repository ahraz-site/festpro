export const DOCUMENT_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "submitted", label: "Submitted", color: "bg-blue-100 text-blue-700" },
  { value: "under_review", label: "Under Review", color: "bg-amber-100 text-amber-700" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  { value: "published", label: "Published", color: "bg-purple-100 text-purple-700" },
  { value: "archived", label: "Archived", color: "bg-gray-100 text-gray-500" },
] as const

export const VERSION_TYPES = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
] as const

export const APPROVAL_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  { value: "escalated", label: "Escalated", color: "bg-orange-100 text-orange-700" },
] as const

export const APPROVAL_STEP_TYPES = [
  { value: "single", label: "Single Approver" },
  { value: "parallel", label: "Parallel Approval" },
  { value: "conditional", label: "Conditional" },
  { value: "escalation", label: "Escalation" },
] as const

export const SIGNATURE_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "signed", label: "Signed", color: "bg-green-100 text-green-700" },
  { value: "declined", label: "Declined", color: "bg-red-100 text-red-700" },
  { value: "expired", label: "Expired", color: "bg-gray-100 text-gray-500" },
] as const

export const ARCHIVE_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-600" },
  { value: "archiving", label: "Archiving", color: "bg-blue-100 text-blue-700" },
  { value: "archived", label: "Archived", color: "bg-green-100 text-green-700" },
  { value: "restoring", label: "Restoring", color: "bg-amber-100 text-amber-700" },
  { value: "restored", label: "Restored", color: "bg-purple-100 text-purple-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
] as const

export const RETENTION_ACTIONS = [
  { value: "archive", label: "Archive" },
  { value: "delete", label: "Delete" },
  { value: "review", label: "Require Review" },
  { value: "notify", label: "Notify Owner" },
] as const

export const KNOWLEDGE_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "published", label: "Published", color: "bg-green-100 text-green-700" },
  { value: "archived", label: "Archived", color: "bg-gray-100 text-gray-500" },
  { value: "deprecated", label: "Deprecated", color: "bg-red-100 text-red-700" },
] as const

export const SHARE_ACCESS_LEVELS = [
  { value: "view", label: "View Only" },
  { value: "comment", label: "Can Comment" },
  { value: "edit", label: "Can Edit" },
] as const

export const SUPPORTED_FILE_TYPES = [
  "pdf", "docx", "odt", "rtf", "txt", "csv", "xlsx", "ods", "pptx", "odp",
  "json", "xml", "zip", "png", "jpg", "jpeg", "svg", "webp", "mp4", "webm", "mp3", "wav",
] as const

export const DOCUMENT_TYPES = [
  { value: "document", label: "Document" },
  { value: "spreadsheet", label: "Spreadsheet" },
  { value: "presentation", label: "Presentation" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "archive", label: "Archive" },
  { value: "other", label: "Other" },
] as const

export const TEMPLATE_TYPES = [
  { value: "certificate", label: "Certificate" },
  { value: "invoice", label: "Invoice" },
  { value: "receipt", label: "Receipt" },
  { value: "letter", label: "Letter" },
  { value: "report", label: "Report" },
  { value: "minutes", label: "Meeting Minutes" },
  { value: "agenda", label: "Agenda" },
  { value: "volunteer_letter", label: "Volunteer Letter" },
  { value: "sponsor_agreement", label: "Sponsor Agreement" },
  { value: "medical_form", label: "Medical Form" },
] as const

export const KNOWLEDGE_ARTICLE_TYPES = [
  { value: "article", label: "Article" },
  { value: "faq", label: "FAQ" },
  { value: "policy", label: "Policy" },
  { value: "guideline", label: "Guideline" },
  { value: "tutorial", label: "Tutorial" },
  { value: "manual", label: "Manual" },
  { value: "rule", label: "Rule" },
  { value: "sop", label: "SOP" },
] as const

export const STORAGE_BUCKETS = {
  documents: "documents",
  archives: "archives",
  templates: "templates",
  signatures: "signatures",
  thumbnails: "thumbnails",
} as const
