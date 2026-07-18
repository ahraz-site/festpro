export const COMPLIANCE_FRAMEWORKS = [
  { value: "soc2", label: "SOC 2", color: "bg-blue-100 text-blue-700" },
  { value: "iso_27001", label: "ISO 27001", color: "bg-indigo-100 text-indigo-700" },
  { value: "gdpr", label: "GDPR", color: "bg-green-100 text-green-700" },
  { value: "hipaa", label: "HIPAA", color: "bg-red-100 text-red-700" },
  { value: "pci_dss", label: "PCI DSS", color: "bg-amber-100 text-amber-700" },
  { value: "fedramp", label: "FedRAMP", color: "bg-purple-100 text-purple-700" },
] as const

export const COMPLIANCE_STATUSES = [
  { value: "non_compliant", label: "Non-Compliant", color: "bg-red-100 text-red-700" },
  { value: "partially_compliant", label: "Partially Compliant", color: "bg-amber-100 text-amber-700" },
  { value: "compliant", label: "Compliant", color: "bg-green-100 text-green-700" },
  { value: "audited", label: "Audited", color: "bg-blue-100 text-blue-700" },
] as const

export const RISK_LEVELS = [
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700", score: 15 },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700", score: 10 },
  { value: "medium", label: "Medium", color: "bg-amber-100 text-amber-700", score: 5 },
  { value: "low", label: "Low", color: "bg-yellow-100 text-yellow-700", score: 2 },
  { value: "informational", label: "Info", color: "bg-blue-100 text-blue-700", score: 0 },
] as const

export const RISK_STATUSES = [
  { value: "identified", label: "Identified", color: "bg-gray-100 text-gray-700" },
  { value: "assessed", label: "Assessed", color: "bg-blue-100 text-blue-700" },
  { value: "mitigated", label: "Mitigated", color: "bg-green-100 text-green-700" },
  { value: "accepted", label: "Accepted", color: "bg-amber-100 text-amber-700" },
  { value: "monitoring", label: "Monitoring", color: "bg-purple-100 text-purple-700" },
] as const

export const SCAN_RESULTS = [
  { value: "pass", label: "Pass", color: "bg-green-100 text-green-700" },
  { value: "fail", label: "Fail", color: "bg-red-100 text-red-700" },
  { value: "warning", label: "Warning", color: "bg-amber-100 text-amber-700" },
  { value: "error", label: "Error", color: "bg-orange-100 text-orange-700" },
] as const

export const SCAN_CATEGORIES = [
  { value: "sast", label: "SAST" },
  { value: "dast", label: "DAST" },
  { value: "dependency", label: "Dependency" },
  { value: "container", label: "Container" },
  { value: "secret", label: "Secret" },
  { value: "license", label: "License" },
  { value: "sbom", label: "SBOM" },
  { value: "infrastructure", label: "Infrastructure" },
] as const

export const INCIDENT_SEVERITIES = [
  { value: "sev1_critical", label: "SEV1 Critical", color: "bg-red-100 text-red-700" },
  { value: "sev2_high", label: "SEV2 High", color: "bg-orange-100 text-orange-700" },
  { value: "sev3_medium", label: "SEV3 Medium", color: "bg-amber-100 text-amber-700" },
  { value: "sev4_low", label: "SEV4 Low", color: "bg-yellow-100 text-yellow-700" },
] as const

export const INCIDENT_STATUSES = [
  { value: "detected", label: "Detected", color: "bg-red-100 text-red-700" },
  { value: "triaging", label: "Triaging", color: "bg-orange-100 text-orange-700" },
  { value: "investigating", label: "Investigating", color: "bg-amber-100 text-amber-700" },
  { value: "mitigating", label: "Mitigating", color: "bg-blue-100 text-blue-700" },
  { value: "resolved", label: "Resolved", color: "bg-green-100 text-green-700" },
  { value: "post_mortem", label: "Post-Mortem", color: "bg-purple-100 text-purple-700" },
] as const

export const MAINTENANCE_TYPES = [
  { value: "security_patch", label: "Security Patch", color: "bg-red-100 text-red-700" },
  { value: "bugfix", label: "Bug Fix", color: "bg-amber-100 text-amber-700" },
  { value: "performance", label: "Performance", color: "bg-blue-100 text-blue-700" },
  { value: "feature", label: "Feature", color: "bg-green-100 text-green-700" },
  { value: "infrastructure", label: "Infrastructure", color: "bg-purple-100 text-purple-700" },
  { value: "compliance", label: "Compliance", color: "bg-indigo-100 text-indigo-700" },
] as const

export const MAINTENANCE_STATUSES = [
  { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-700" },
  { value: "in_progress", label: "In Progress", color: "bg-amber-100 text-amber-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-500" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
] as const

export const RELEASE_CHANNELS = [
  { value: "stable", label: "Stable" },
  { value: "lts", label: "LTS" },
  { value: "beta", label: "Beta" },
  { value: "alpha", label: "Alpha" },
  { value: "nightly", label: "Nightly" },
] as const

export const RELEASE_READINESS_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-700" },
  { value: "in_review", label: "In Review", color: "bg-blue-100 text-blue-700" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  { value: "deployed", label: "Deployed", color: "bg-purple-100 text-purple-700" },
] as const

export const BENCHMARK_CATEGORIES = [
  { value: "api", label: "API" },
  { value: "database", label: "Database" },
  { value: "cache", label: "Cache" },
  { value: "realtime", label: "Realtime" },
  { value: "background", label: "Background" },
  { value: "storage", label: "Storage" },
  { value: "network", label: "Network" },
] as const

export const BENCHMARK_STATUSES = [
  { value: "pass", label: "Pass", color: "bg-green-100 text-green-700" },
  { value: "warning", label: "Warning", color: "bg-amber-100 text-amber-700" },
  { value: "fail", label: "Fail", color: "bg-red-100 text-red-700" },
] as const

export const CONSENT_TYPES = [
  { value: "marketing", label: "Marketing" },
  { value: "analytics", label: "Analytics" },
  { value: "third_party", label: "Third Party" },
  { value: "data_processing", label: "Data Processing" },
  { value: "cookies", label: "Cookies" },
  { value: "communications", label: "Communications" },
] as const

export const DATA_CATEGORIES = [
  { value: "personal", label: "Personal Data" },
  { value: "financial", label: "Financial Data" },
  { value: "health", label: "Health Data" },
  { value: "biometric", label: "Biometric Data" },
  { value: "behavioral", label: "Behavioral Data" },
  { value: "demographic", label: "Demographic Data" },
] as const
