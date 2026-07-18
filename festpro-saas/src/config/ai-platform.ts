export const AI_PROVIDER_TYPES = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google_gemini", label: "Google Gemini" },
  { value: "azure_openai", label: "Azure OpenAI" },
  { value: "aws_bedrock", label: "AWS Bedrock" },
  { value: "local", label: "Local / Self-hosted" },
  { value: "custom", label: "Custom" },
] as const

export const AI_MODEL_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-600" },
  { value: "deprecated", label: "Deprecated", color: "bg-red-100 text-red-700" },
  { value: "beta", label: "Beta", color: "bg-blue-100 text-blue-700" },
] as const

export const AI_AGENT_ROLES = [
  { value: "admin_copilot", label: "Admin Copilot" },
  { value: "festival_copilot", label: "Festival Copilot" },
  { value: "judge_copilot", label: "Judge Copilot" },
  { value: "volunteer_copilot", label: "Volunteer Copilot" },
  { value: "finance_copilot", label: "Finance Copilot" },
  { value: "help_desk_copilot", label: "Help Desk Copilot" },
  { value: "inventory_copilot", label: "Inventory Copilot" },
  { value: "medical_copilot", label: "Medical Copilot" },
] as const

export const AI_CONVERSATION_STATUSES = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "resolved", label: "Resolved", color: "bg-blue-100 text-blue-700" },
  { value: "archived", label: "Archived", color: "bg-gray-100 text-gray-600" },
] as const

export const AI_JOB_TYPES = [
  { value: "summarize", label: "Summarize" },
  { value: "generate_report", label: "Generate Report" },
  { value: "generate_certificate", label: "Generate Certificate" },
  { value: "draft_email", label: "Draft Email" },
  { value: "draft_whatsapp", label: "Draft WhatsApp" },
  { value: "draft_press_release", label: "Draft Press Release" },
  { value: "generate_minutes", label: "Generate Minutes" },
  { value: "generate_instructions", label: "Generate Instructions" },
  { value: "schedule_optimization", label: "Schedule Optimization" },
  { value: "conflict_detection", label: "Conflict Detection" },
  { value: "forecast", label: "Forecast" },
  { value: "recommendation", label: "Recommendation" },
] as const

export const AI_JOB_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-600" },
  { value: "processing", label: "Processing", color: "bg-blue-100 text-blue-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
] as const

export const KNOWLEDGE_SOURCE_TYPES = [
  { value: "festival_rules", label: "Festival Rules" },
  { value: "competition_rules", label: "Competition Rules" },
  { value: "documents", label: "Documents" },
  { value: "faq", label: "FAQ" },
  { value: "policies", label: "Policies" },
  { value: "announcements", label: "Announcements" },
  { value: "reports", label: "Reports" },
  { value: "erp_data", label: "ERP Data" },
  { value: "custom", label: "Custom" },
] as const

export const AI_PREDICTION_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-600" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
] as const

export const AI_FEEDBACK_RATINGS = [
  { value: "thumbs_up", label: "Thumbs Up", icon: "👍" },
  { value: "thumbs_down", label: "Thumbs Down", icon: "👎" },
  { value: "helpful", label: "Helpful" },
  { value: "not_helpful", label: "Not Helpful" },
  { value: "inaccurate", label: "Inaccurate" },
  { value: "harmful", label: "Harmful" },
] as const

export const AI_SUMMARY_TYPES = [
  { value: "daily", label: "Daily Summary" },
  { value: "incident", label: "Incident Summary" },
  { value: "sponsor_followup", label: "Sponsor Follow-up" },
  { value: "volunteer_briefing", label: "Volunteer Briefing" },
  { value: "event_recap", label: "Event Recap" },
  { value: "custom", label: "Custom" },
] as const

export const COPILOT_DEFAULT_SYSTEM_PROMPTS: Record<string, string> = {
  admin_copilot: "You are an AI assistant for platform administrators. Help with system management, user queries, reports, and platform operations. Always respect data permissions and never expose sensitive information.",
  festival_copilot: "You are an AI assistant for festival organizers. Help manage festivals, schedules, venues, participants, and operations. Provide actionable insights based on festival data.",
  judge_copilot: "You are an AI assistant for competition judges. Help with scoring guidelines, rubrics, participant evaluation, and scheduling. Maintain fairness and consistency.",
  volunteer_copilot: "You are an AI assistant for festival volunteers. Help with task assignments, schedules, communication, and on-ground coordination.",
  finance_copilot: "You are an AI assistant for financial operations. Help with budgeting, invoicing, revenue tracking, expense management, and financial reporting.",
  help_desk_copilot: "You are an AI assistant for help desk operations. Help with ticket resolution, FAQ responses, user guidance, and escalation management.",
  inventory_copilot: "You are an AI assistant for inventory management. Help with stock tracking, order management, supply chain, and resource allocation.",
  medical_copilot: "You are an AI assistant for medical operations. Help with first aid coordination, emergency response, medical inventory, and health monitoring.",
}

export const DEFAULT_AI_SETTINGS = {
  max_conversations_per_user: 100,
  max_messages_per_conversation: 200,
  enable_copilot: true,
  enable_knowledge_base: true,
  enable_predictions: false,
  enable_automation: false,
  enable_usage_tracking: true,
  sensitive_data_filtering: true,
  audit_logging: true,
}
