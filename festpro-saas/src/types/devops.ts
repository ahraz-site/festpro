export type DevopsEnvironmentType = "development" | "testing" | "qa" | "uat" | "staging" | "production" | "disaster_recovery" | "sandbox"
export type PipelineStatus = "pending" | "running" | "succeeded" | "failed" | "cancelled" | "skipped"
export type DeploymentStatus = "pending" | "provisioning" | "deploying" | "healthy" | "degraded" | "failed" | "rolled_back" | "cancelled"
export type DeploymentStrategy = "recreate" | "rolling" | "blue_green" | "canary" | "ramped"
export type ReleaseStatus = "draft" | "prerelease" | "released" | "deprecated" | "rolled_back"
export type BuildStatus = "pending" | "building" | "succeeded" | "failed" | "cancelled"
export type ContainerImageStatus = "building" | "available" | "deprecated" | "vulnerable"
export type ClusterNodeStatus = "ready" | "not_ready" | "maintenance" | "unknown"
export type ClusterServiceStatus = "running" | "pending" | "stopped" | "failed" | "unknown"
export type FeatureRolloutStatus = "draft" | "active" | "paused" | "completed" | "rolled_back"
export type FeatureRolloutStrategy = "manual" | "gradual" | "canary" | "ab_test" | "blue_green"
export type ScanSeverity = "critical" | "high" | "medium" | "low" | "info"
export type ScanType = "sast" | "dast" | "dependency" | "container" | "secret" | "license" | "sbom"

export interface DeploymentEnvironment {
  id: string
  env_name: string
  env_type: DevopsEnvironmentType
  description: string
  is_active: boolean
  is_protected: boolean
  requires_approval: boolean
  auto_deploy: boolean
  env_url: string
  k8s_namespace: string
  k8s_context: string
  region: string
  config: Record<string, any>
  sort_order: number
  created_at: string
  updated_at: string
}

export interface DeploymentPipeline {
  id: string
  pipeline_name: string
  description: string
  repository_url: string
  repository_branch: string
  pipeline_yaml: string
  triggers: string[]
  environment_id: string | null
  is_active: boolean
  config: Record<string, any>
  created_by: string | null
  created_at: string
  updated_at: string
  environment?: DeploymentEnvironment
}

export interface DeploymentRecord {
  id: string
  pipeline_id: string | null
  environment_id: string | null
  release_id: string | null
  deployment_name: string
  commit_sha: string
  commit_message: string
  branch: string
  status: DeploymentStatus
  strategy: DeploymentStrategy
  deployment_yaml: string
  duration_seconds: number
  start_time: string | null
  end_time: string | null
  error_message: string
  rolled_back_from: string | null
  rollback_time: string | null
  triggered_by: string | null
  approved_by: string | null
  metadata: Record<string, any>
  created_at: string
  pipeline?: DeploymentPipeline
  environment?: DeploymentEnvironment
}

export interface DeploymentArtifact {
  id: string
  deployment_id: string
  artifact_name: string
  artifact_type: string
  storage_path: string
  file_size_bytes: number
  checksum: string
  metadata: Record<string, any>
  created_at: string
}

export interface BuildRecord {
  id: string
  pipeline_id: string | null
  commit_sha: string
  branch: string
  build_number: string
  status: BuildStatus
  docker_image_tag: string
  docker_image_sha: string
  duration_seconds: number
  start_time: string | null
  end_time: string | null
  error_message: string
  triggered_by: string | null
  config: Record<string, any>
  created_at: string
  pipeline?: DeploymentPipeline
}

export interface BuildLog {
  id: string
  build_id: string
  log_level: string
  message: string
  source: string
  timestamp: string
}

export interface ReleaseVersion {
  id: string
  project_name: string
  version: string
  release_name: string
  status: ReleaseStatus
  commit_sha: string
  commit_message: string
  branch: string
  docker_image_tag: string
  changelog: string
  is_critical: boolean
  is_security_release: boolean
  requires_downtime: boolean
  approved_by: string | null
  released_by: string | null
  released_at: string | null
  created_at: string
  updated_at: string
}

export interface ReleaseNote {
  id: string
  release_id: string
  category: string
  title: string
  description: string
  ticket_url: string
  commit_sha: string
  author_id: string | null
  created_at: string
}

export interface RollbackRecord {
  id: string
  deployment_id: string
  rolled_back_to_version: string
  reason: string
  duration_seconds: number
  success: boolean
  triggered_by: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface ClusterNode {
  id: string
  node_name: string
  node_role: string
  status: ClusterNodeStatus
  k8s_version: string
  instance_type: string
  region: string
  cpu_cores: number
  memory_gb: number
  pod_capacity: number
  pod_count: number
  cpu_usage_percent: number
  memory_usage_percent: number
  labels: Record<string, any>
  taints: Record<string, any>
  last_heartbeat: string | null
  created_at: string
  updated_at: string
}

export interface ClusterService {
  id: string
  service_name: string
  namespace: string
  service_type: string
  status: ClusterServiceStatus
  replicas: number
  available_replicas: number
  image: string
  cpu_request: number
  memory_request_mb: number
  cpu_limit: number
  memory_limit_mb: number
  labels: Record<string, any>
  annotations: Record<string, any>
  created_at: string
  updated_at: string
}

export interface KubernetesWorkload {
  id: string
  workload_name: string
  namespace: string
  workload_type: string
  image: string
  replicas: number
  strategy: DeploymentStrategy
  config: Record<string, any>
  status: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ContainerImage {
  id: string
  registry_id: string | null
  image_name: string
  image_tag: string
  image_sha: string
  size_bytes: number
  status: ContainerImageStatus
  vulnerability_count: number
  critical_vulnerabilities: number
  high_vulnerabilities: number
  labels: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ContainerRegistry {
  id: string
  registry_name: string
  registry_url: string
  registry_provider: string
  username: string
  password_encrypted: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EnvironmentVariable {
  id: string
  environment_id: string | null
  var_key: string
  var_value: string
  is_secret: boolean
  is_encrypted: boolean
  description: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface SecretReference {
  id: string
  secret_name: string
  secret_provider: string
  provider_path: string
  provider_key: string
  environments: string[]
  description: string
  rotation_days: number
  last_rotated_at: string | null
  created_at: string
  updated_at: string
}

export interface FeatureRollout {
  id: string
  feature_name: string
  description: string
  strategy: FeatureRolloutStrategy
  status: FeatureRolloutStatus
  rollout_percentage: number
  target_groups: Record<string, any>
  start_time: string | null
  end_time: string | null
  config: Record<string, any>
  created_by: string | null
  reviewed_by: string | null
  created_at: string
  updated_at: string
}

export interface BlueGreenDeployment {
  id: string
  deployment_id: string
  active_service: string
  standby_service: string
  active_version: string
  standby_version: string
  current_active: string
  traffic_blue: number
  traffic_green: number
  switch_time: string | null
  created_at: string
  updated_at: string
}

export interface CanaryDeployment {
  id: string
  deployment_id: string
  canary_percentage: number
  max_percentage: number
  step_percentage: number
  interval_minutes: number
  evaluation_metric: string
  threshold: number
  auto_promote: boolean
  auto_rollback: boolean
  current_percentage: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SecurityScan {
  id: string
  build_id: string | null
  scan_type: ScanType
  scan_status: string
  scanner_name: string
  total_findings: number
  critical_findings: number
  high_findings: number
  medium_findings: number
  low_findings: number
  report_url: string
  sbom_url: string
  duration_seconds: number
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface Module29DashboardData {
  total_environments: number
  total_pipelines: number
  total_deployments: number
  total_releases: number
  total_builds: number
  total_cluster_nodes: number
  total_container_images: number
  pipeline_success_rate: number
  deployment_success_rate: number
  recent_deployments: DeploymentRecord[]
  recent_builds: BuildRecord[]
  environment_stats: { env_type: string; count: number }[]
  status_distribution: { status: string; count: number }[]
}
