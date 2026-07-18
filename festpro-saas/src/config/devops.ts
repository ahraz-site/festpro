export const DEVOPS_ENVIRONMENT_TYPES = [
  { value: "development", label: "Development", color: "bg-gray-100 text-gray-700" },
  { value: "testing", label: "Testing", color: "bg-blue-100 text-blue-700" },
  { value: "qa", label: "QA", color: "bg-cyan-100 text-cyan-700" },
  { value: "uat", label: "UAT", color: "bg-indigo-100 text-indigo-700" },
  { value: "staging", label: "Staging", color: "bg-amber-100 text-amber-700" },
  { value: "production", label: "Production", color: "bg-red-100 text-red-700" },
  { value: "disaster_recovery", label: "Disaster Recovery", color: "bg-purple-100 text-purple-700" },
  { value: "sandbox", label: "Sandbox", color: "bg-teal-100 text-teal-700" },
] as const

export const PIPELINE_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-700" },
  { value: "running", label: "Running", color: "bg-blue-100 text-blue-700" },
  { value: "succeeded", label: "Succeeded", color: "bg-green-100 text-green-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-orange-100 text-orange-700" },
  { value: "skipped", label: "Skipped", color: "bg-gray-100 text-gray-500" },
] as const

export const DEPLOYMENT_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-700" },
  { value: "provisioning", label: "Provisioning", color: "bg-blue-100 text-blue-700" },
  { value: "deploying", label: "Deploying", color: "bg-amber-100 text-amber-700" },
  { value: "healthy", label: "Healthy", color: "bg-green-100 text-green-700" },
  { value: "degraded", label: "Degraded", color: "bg-orange-100 text-orange-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "rolled_back", label: "Rolled Back", color: "bg-purple-100 text-purple-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-500" },
] as const

export const DEPLOYMENT_STRATEGIES = [
  { value: "recreate", label: "Recreate" },
  { value: "rolling", label: "Rolling Update" },
  { value: "blue_green", label: "Blue-Green" },
  { value: "canary", label: "Canary" },
  { value: "ramped", label: "Ramped" },
] as const

export const RELEASE_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-700" },
  { value: "prerelease", label: "Pre-release", color: "bg-amber-100 text-amber-700" },
  { value: "released", label: "Released", color: "bg-green-100 text-green-700" },
  { value: "deprecated", label: "Deprecated", color: "bg-orange-100 text-orange-700" },
  { value: "rolled_back", label: "Rolled Back", color: "bg-red-100 text-red-700" },
] as const

export const BUILD_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-700" },
  { value: "building", label: "Building", color: "bg-blue-100 text-blue-700" },
  { value: "succeeded", label: "Succeeded", color: "bg-green-100 text-green-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-orange-100 text-orange-700" },
] as const

export const CLUSTER_NODE_STATUSES = [
  { value: "ready", label: "Ready", color: "bg-green-100 text-green-700" },
  { value: "not_ready", label: "Not Ready", color: "bg-red-100 text-red-700" },
  { value: "maintenance", label: "Maintenance", color: "bg-amber-100 text-amber-700" },
  { value: "unknown", label: "Unknown", color: "bg-gray-100 text-gray-500" },
] as const

export const CLUSTER_SERVICE_STATUSES = [
  { value: "running", label: "Running", color: "bg-green-100 text-green-700" },
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "stopped", label: "Stopped", color: "bg-red-100 text-red-700" },
  { value: "failed", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "unknown", label: "Unknown", color: "bg-gray-100 text-gray-500" },
] as const

export const CONTAINER_IMAGE_STATUSES = [
  { value: "building", label: "Building", color: "bg-blue-100 text-blue-700" },
  { value: "available", label: "Available", color: "bg-green-100 text-green-700" },
  { value: "deprecated", label: "Deprecated", color: "bg-orange-100 text-orange-700" },
  { value: "vulnerable", label: "Vulnerable", color: "bg-red-100 text-red-700" },
] as const

export const FEATURE_ROLLOUT_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-700" },
  { value: "active", label: "Active", color: "bg-green-100 text-green-700" },
  { value: "paused", label: "Paused", color: "bg-amber-100 text-amber-700" },
  { value: "completed", label: "Completed", color: "bg-blue-100 text-blue-700" },
  { value: "rolled_back", label: "Rolled Back", color: "bg-red-100 text-red-700" },
] as const

export const FEATURE_ROLLOUT_STRATEGIES = [
  { value: "manual", label: "Manual" },
  { value: "gradual", label: "Gradual" },
  { value: "canary", label: "Canary" },
  { value: "ab_test", label: "A/B Test" },
  { value: "blue_green", label: "Blue-Green" },
] as const

export const SCAN_TYPES = [
  { value: "sast", label: "SAST" },
  { value: "dast", label: "DAST" },
  { value: "dependency", label: "Dependency" },
  { value: "container", label: "Container" },
  { value: "secret", label: "Secret" },
  { value: "license", label: "License" },
  { value: "sbom", label: "SBOM" },
] as const

export const SCAN_SEVERITIES = [
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "medium", label: "Medium", color: "bg-amber-100 text-amber-700" },
  { value: "low", label: "Low", color: "bg-yellow-100 text-yellow-700" },
  { value: "info", label: "Info", color: "bg-blue-100 text-blue-700" },
] as const

export const ENV_TYPE_COLORS: Record<string, string> = {
  development: "text-gray-600 bg-gray-50 border-gray-200",
  testing: "text-blue-600 bg-blue-50 border-blue-200",
  qa: "text-cyan-600 bg-cyan-50 border-cyan-200",
  uat: "text-indigo-600 bg-indigo-50 border-indigo-200",
  staging: "text-amber-600 bg-amber-50 border-amber-200",
  production: "text-red-600 bg-red-50 border-red-200",
  disaster_recovery: "text-purple-600 bg-purple-50 border-purple-200",
  sandbox: "text-teal-600 bg-teal-50 border-teal-200",
}

export const CONTAINER_REGISTRY_PROVIDERS = [
  { value: "dockerhub", label: "Docker Hub" },
  { value: "gcr", label: "Google Container Registry" },
  { value: "ecr", label: "AWS ECR" },
  { value: "acr", label: "Azure Container Registry" },
  { value: "ghcr", label: "GitHub Container Registry" },
  { value: "harbor", label: "Harbor" },
  { value: "self_hosted", label: "Self-Hosted" },
] as const

export const WORKLOAD_TYPES = [
  { value: "deployment", label: "Deployment" },
  { value: "statefulset", label: "StatefulSet" },
  { value: "daemonset", label: "DaemonSet" },
  { value: "job", label: "Job" },
  { value: "cronjob", label: "CronJob" },
] as const
