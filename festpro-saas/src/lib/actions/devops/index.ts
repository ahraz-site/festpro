"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Module29DashboardData, DeploymentEnvironment, DeploymentPipeline, DeploymentRecord, BuildRecord, ReleaseVersion, ClusterNode, ClusterService, ContainerImage, ContainerRegistry, EnvironmentVariable, SecretReference, FeatureRollout, SecurityScan } from "@/types/devops"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkOrgAccess() {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  const { data: members } = await admin.from("organization_members").select("organization_id").eq("user_id", user.id).limit(1)
  if (!members || members.length === 0) return { allowed: false, error: "No organization found" } as const
  return { allowed: true, user, organization_id: members[0].organization_id } as const
}

function getRevalidateBase() {
  return "/dashboard/organization/%/festivals/%/devops"
}

// ---- Environments ----

export async function getDeploymentEnvironments() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("deployment_environments").select("*").order("sort_order")
  if (error) return { error: error.message }
  return { data: data as DeploymentEnvironment[] }
}

export async function upsertDeploymentEnvironment(env: Partial<DeploymentEnvironment>) {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (env.id) {
    const { error } = await admin.from("deployment_environments").update(env).eq("id", env.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await admin.from("deployment_environments").insert(env)
    if (error) return { error: error.message }
  }
  revalidatePath(getRevalidateBase())
  return { data: true }
}

// ---- Pipelines ----

export async function getDeploymentPipelines() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("deployment_pipelines").select("*, environment:environment_id(*)").order("pipeline_name")
  if (error) return { error: error.message }
  return { data: data as DeploymentPipeline[] }
}

export async function upsertDeploymentPipeline(pipeline: Partial<DeploymentPipeline>) {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (pipeline.id) {
    const { error } = await admin.from("deployment_pipelines").update(pipeline).eq("id", pipeline.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await admin.from("deployment_pipelines").insert(pipeline)
    if (error) return { error: error.message }
  }
  revalidatePath(getRevalidateBase())
  return { data: true }
}

export async function deletePipeline(id: string) {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from("deployment_pipelines").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(getRevalidateBase())
  return { data: true }
}

// ---- Deployments ----

export async function getDeployments() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("deployment_history").select("*, pipeline:pipeline_id(*), environment:environment_id(*)").order("created_at", { ascending: false }).limit(50)
  if (error) return { error: error.message }
  return { data: data as DeploymentRecord[] }
}

export async function createDeployment(deployment: Partial<DeploymentRecord>) {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { error } = await admin.from("deployment_history").insert({ ...deployment, start_time: new Date().toISOString() })
  if (error) return { error: error.message }
  revalidatePath(getRevalidateBase())
  return { data: true }
}

export async function updateDeploymentStatus(id: string, status: string) {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const updates: Record<string, any> = { status }
  if (["healthy", "failed", "rolled_back"].includes(status)) updates.end_time = new Date().toISOString()
  const { error } = await admin.from("deployment_history").update(updates).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(getRevalidateBase())
  return { data: true }
}

// ---- Builds ----

export async function getBuilds() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("build_history").select("*, pipeline:pipeline_id(*)").order("created_at", { ascending: false }).limit(50)
  if (error) return { error: error.message }
  return { data: data as BuildRecord[] }
}

// ---- Releases ----

export async function getReleases() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("release_versions").select("*").order("created_at", { ascending: false }).limit(50)
  if (error) return { error: error.message }
  return { data: data as ReleaseVersion[] }
}

export async function upsertRelease(release: Partial<ReleaseVersion>) {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (release.id) {
    const { error } = await admin.from("release_versions").update(release).eq("id", release.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await admin.from("release_versions").insert(release)
    if (error) return { error: error.message }
  }
  revalidatePath(getRevalidateBase())
  return { data: true }
}

// ---- Clusters ----

export async function getClusterNodes() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("cluster_nodes").select("*").order("node_name")
  if (error) return { error: error.message }
  return { data: data as ClusterNode[] }
}

export async function getClusterServices() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("cluster_services").select("*").order("service_name")
  if (error) return { error: error.message }
  return { data: data as ClusterService[] }
}

// ---- Container Images ----

export async function getContainerImages() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("container_images").select("*").order("created_at", { ascending: false }).limit(50)
  if (error) return { error: error.message }
  return { data: data as ContainerImage[] }
}

// ---- Environment Variables ----

export async function getEnvironmentVariables() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("environment_variables").select("*, environment:environment_id(*)").order("var_key")
  if (error) return { error: error.message }
  return { data: data as EnvironmentVariable[] }
}

export async function upsertEnvironmentVariable(variable: Partial<EnvironmentVariable>) {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (variable.id) {
    const { error } = await admin.from("environment_variables").update(variable).eq("id", variable.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await admin.from("environment_variables").insert(variable)
    if (error) return { error: error.message }
  }
  revalidatePath(getRevalidateBase())
  return { data: true }
}

// ---- Feature Rollouts ----

export async function getFeatureRollouts() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("feature_rollouts").select("*").order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data: data as FeatureRollout[] }
}

// ---- Security Scans ----

export async function getSecurityScans() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("security_scans").select("*, build:build_id(*)").order("created_at", { ascending: false }).limit(50)
  if (error) return { error: error.message }
  return { data: data as SecurityScan[] }
}

// ---- Dashboard ----

export async function getDevOpsDashboard() {
  const check = await checkOrgAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()

  const [
    { count: envCount },
    { count: pipelineCount },
    { count: deployCount },
    { count: releaseCount },
    { count: buildCount },
    { count: nodeCount },
    { count: imageCount },
    { data: recentDeployments },
    { data: recentBuilds },
    { data: envStats },
    { data: statusDist },
  ] = await Promise.all([
    admin.from("deployment_environments").select("*", { count: "exact", head: true }),
    admin.from("deployment_pipelines").select("*", { count: "exact", head: true }),
    admin.from("deployment_history").select("*", { count: "exact", head: true }),
    admin.from("release_versions").select("*", { count: "exact", head: true }),
    admin.from("build_history").select("*", { count: "exact", head: true }),
    admin.from("cluster_nodes").select("*", { count: "exact", head: true }),
    admin.from("container_images").select("*", { count: "exact", head: true }),
    admin.from("deployment_history").select("*, pipeline:pipeline_id(*), environment:environment_id(*)").order("created_at", { ascending: false }).limit(5),
    admin.from("build_history").select("*, pipeline:pipeline_id(*)").order("created_at", { ascending: false }).limit(5),
    admin.from("deployment_environments").select("env_type"),
    admin.from("deployment_history").select("status"),
  ])

  const envTypeCounts: Record<string, number> = {}
  for (const e of (envStats || [])) {
    envTypeCounts[e.env_type] = (envTypeCounts[e.env_type] || 0) + 1
  }

  const statusCounts: Record<string, number> = {}
  for (const d of (statusDist || [])) {
    statusCounts[d.status] = (statusCounts[d.status] || 0) + 1
  }

  const totalDeploys = statusCounts.healthy || 0 + statusCounts.failed || 0 + statusCounts.rolled_back || 0
  const deploySuccessRate = totalDeploys > 0 ? ((statusCounts.healthy || 0) / totalDeploys * 100) : 0

  return {
    data: {
      total_environments: envCount || 0,
      total_pipelines: pipelineCount || 0,
      total_deployments: deployCount || 0,
      total_releases: releaseCount || 0,
      total_builds: buildCount || 0,
      total_cluster_nodes: nodeCount || 0,
      total_container_images: imageCount || 0,
      pipeline_success_rate: 0,
      deployment_success_rate: Math.round(deploySuccessRate),
      recent_deployments: (recentDeployments || []) as DeploymentRecord[],
      recent_builds: (recentBuilds || []) as BuildRecord[],
      environment_stats: Object.entries(envTypeCounts).map(([env_type, count]) => ({ env_type, count })),
      status_distribution: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    } as Module29DashboardData,
  }
}
