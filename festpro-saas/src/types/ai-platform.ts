export type AiProviderType = "openai" | "anthropic" | "google_gemini" | "azure_openai" | "aws_bedrock" | "local" | "custom"
export type AiModelStatus = "active" | "inactive" | "deprecated" | "beta"
export type AiAgentRole = "admin_copilot" | "festival_copilot" | "judge_copilot" | "volunteer_copilot" | "finance_copilot" | "help_desk_copilot" | "inventory_copilot" | "medical_copilot"
export type AiConversationStatus = "active" | "resolved" | "archived" | "deleted"
export type AiMessageRole = "user" | "assistant" | "system" | "tool"
export type AiJobType = "summarize" | "generate_report" | "generate_certificate" | "draft_email" | "draft_whatsapp" | "draft_press_release" | "generate_minutes" | "generate_instructions" | "schedule_optimization" | "conflict_detection" | "forecast" | "recommendation" | "embedding"
export type AiJobStatus = "pending" | "processing" | "completed" | "failed" | "cancelled"
export type KnowledgeSourceType = "festival_rules" | "competition_rules" | "documents" | "faq" | "policies" | "announcements" | "reports" | "erp_data" | "custom"
export type KnowledgeDocumentStatus = "pending" | "indexing" | "indexed" | "failed" | "orphaned"
export type AiPredictionStatus = "pending" | "completed" | "failed" | "expired"
export type AiFeedbackRating = "thumbs_up" | "thumbs_down" | "helpful" | "not_helpful" | "inaccurate" | "harmful"
export type AiSummaryType = "daily" | "incident" | "sponsor_followup" | "volunteer_briefing" | "event_recap" | "custom"

export interface AiProvider {
  id: string; provider_name: string; provider_type: AiProviderType
  api_base_url: string; api_key_encrypted: string | null
  organization_id: string | null; is_default: boolean; is_active: boolean
  config: any; rate_limit_per_minute: number; rate_limit_per_day: number
  fallback_provider_id: string | null; created_at: string; updated_at: string
}

export interface AiModel {
  id: string; provider_id: string; model_name: string; model_display_name: string
  model_version: string | null; status: AiModelStatus; context_window: number
  max_tokens: number; default_temperature: number; supports_streaming: boolean
  supports_vision: boolean; supports_tools: boolean; supports_embeddings: boolean
  input_cost_per_1k: number; output_cost_per_1k: number; config: any; created_at: string
}

export interface AiSettings {
  id: string; organization_id: string | null; default_provider_id: string | null
  default_model_id: string | null; max_conversations_per_user: number
  max_messages_per_conversation: number; enable_copilot: boolean
  enable_knowledge_base: boolean; enable_predictions: boolean
  enable_automation: boolean; enable_usage_tracking: boolean
  budget_limit_monthly: number; budget_limit_total: number
  sensitive_data_filtering: boolean; audit_logging: boolean; config: any
  created_at: string; updated_at: string
}

export interface AiAgent {
  id: string; organization_id: string | null; agent_role: AiAgentRole
  agent_name: string; agent_description: string | null; system_prompt: string
  model_id: string | null; temperature: number; max_tokens: number
  is_active: boolean; allowed_tools: string[]; knowledge_source_ids: string[]
  config: any; created_at: string; updated_at: string
}

export interface AiTool {
  id: string; organization_id: string | null; tool_name: string
  tool_description: string | null; tool_schema: any; function_name: string
  is_active: boolean; requires_approval: boolean; required_role: string | null
  config: any; created_at: string
}

export interface AiPrompt {
  id: string; organization_id: string | null; prompt_name: string
  prompt_description: string | null; prompt_category: string; prompt_text: string
  prompt_variables: string[]; output_format: string; is_active: boolean
  is_public: boolean; version: number; created_by: string | null
  created_at: string; updated_at: string
}

export interface AiPromptVersion {
  id: string; prompt_id: string; version: number; prompt_text: string
  prompt_variables: string[]; change_notes: string | null; approved: boolean
  approved_by: string | null; approved_at: string | null; created_by: string | null
  created_at: string
}

export interface AiConversation {
  id: string; organization_id: string | null; festival_id: string | null
  user_id: string; agent_id: string | null; conversation_title: string
  status: AiConversationStatus; message_count: number; token_count: number
  cost: number; metadata: any; created_at: string; updated_at: string
}

export interface AiMessage {
  id: string; conversation_id: string; role: AiMessageRole; content: string
  metadata: any; tool_calls: any; tool_results: any; tokens_input: number
  tokens_output: number; model_id: string | null; latency_ms: number
  cost: number; created_at: string
}

export interface AiJob {
  id: string; organization_id: string | null; festival_id: string | null
  agent_id: string | null; job_type: AiJobType; status: AiJobStatus
  input_data: any; output_data: any; error_message: string | null
  priority: number; scheduled_for: string | null; started_at: string | null
  completed_at: string | null; duration_ms: number; retry_count: number
  max_retries: number; created_by: string | null; created_at: string
}

export interface AiJobHistory {
  id: string; job_id: string; previous_status: AiJobStatus | null
  new_status: AiJobStatus; message: string | null; changed_by: string | null
  created_at: string
}

export interface AiEmbedding {
  id: string; source_type: string; source_id: string; content_hash: string
  embedding: number[] | null; chunk_text: string; metadata: any
  model_id: string | null; created_at: string
}

export interface KnowledgeSource {
  id: string; organization_id: string | null; festival_id: string | null
  source_name: string; source_type: KnowledgeSourceType; description: string | null
  is_active: boolean; auto_sync: boolean; sync_interval_minutes: number
  last_synced_at: string | null; config: any; created_by: string | null
  created_at: string; updated_at: string
}

export interface KnowledgeDocument {
  id: string; source_id: string; organization_id: string | null
  festival_id: string | null; document_title: string; document_type: string
  content: string; content_summary: string | null; content_hash: string
  file_url: string | null; file_size_bytes: number | null; mime_type: string
  status: KnowledgeDocumentStatus; chunk_count: number; is_indexed: boolean
  is_public: boolean; allowed_roles: string[]; metadata: any
  created_by: string | null; created_at: string; updated_at: string
}

export interface KnowledgeChunk {
  id: string; document_id: string; chunk_index: number; chunk_text: string
  chunk_tokens: number; embedding_id: string | null; metadata: any; created_at: string
}

export interface KnowledgeIndex {
  id: string; organization_id: string | null; festival_id: string | null
  source_id: string | null; document_id: string | null; index_name: string
  index_type: string; is_active: boolean; total_chunks: number; total_tokens: number
  last_indexed_at: string | null; metadata: any; created_at: string
}

export interface AiFeedback {
  id: string; organization_id: string | null; conversation_id: string | null
  message_id: string | null; user_id: string; rating: AiFeedbackRating
  comment: string | null; metadata: any; created_at: string
}

export interface AiUsageLog {
  id: string; organization_id: string | null; user_id: string | null
  provider_id: string | null; model_id: string | null; agent_id: string | null
  conversation_id: string | null; feature_name: string; tokens_input: number
  tokens_output: number; cost: number; latency_ms: number; success: boolean
  error_message: string | null; ip_address: string; user_agent: string | null
  created_at: string
}

export interface AiCostTracking {
  id: string; organization_id: string | null; provider_id: string | null
  model_id: string | null; date: string; tokens_input_total: number
  tokens_output_total: number; cost_total: number; request_count: number
  average_latency_ms: number; metadata: any; created_at: string; updated_at: string
}

export interface AiPrediction {
  id: string; organization_id: string | null; festival_id: string | null
  prediction_type: string; prediction_name: string; input_data: any
  result_data: any; confidence: number; status: AiPredictionStatus
  model_id: string | null; actual_outcome: any; accuracy: number | null
  expires_at: string | null; created_by: string | null; created_at: string; updated_at: string
}

export interface AiRecommendation {
  id: string; organization_id: string | null; festival_id: string | null
  recommendation_type: string; title: string; description: string | null
  priority: string; impact_score: number; effort_score: number; data: any
  is_applied: boolean; applied_at: string | null; applied_by: string | null
  created_by: string | null; created_at: string
}

export interface AiSummary {
  id: string; organization_id: string | null; festival_id: string | null
  summary_type: AiSummaryType; title: string; source_data: any
  summary_text: string; key_points: string[]; model_id: string | null
  tokens_used: number; cost: number; is_published: boolean
  created_by: string | null; created_at: string
}

export interface AiCopilotRequest {
  message: string; conversation_id?: string; agent_role?: AiAgentRole
  organization_id?: string; festival_id?: string
}

export interface AiCopilotResponse {
  message: string; conversation_id: string; sources?: { title: string; content: string; relevance: number }[]
  tokens_input: number; tokens_output: number; cost: number; latency_ms: number
}

export interface AiChatMessage {
  role: AiMessageRole; content: string; created_at?: string
}

export interface AiDashboardData {
  total_conversations: number; active_conversations: number; total_messages: number
  total_tokens: number; total_cost: number; total_providers: number
  active_agents: number; total_knowledge_docs: number; indexed_docs: number
  total_predictions: number; total_recommendations: number; total_jobs: number
  failed_jobs: number; cost_today: number; avg_latency_ms: number
}
