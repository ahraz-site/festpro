"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  Module30DashboardData, SecurityScanResult, ComplianceEvidence, RiskRegister,
  PolicyEntry, IncidentRecord, PerformanceBenchmark, HealthCheck,
  ReleaseReadiness, LtsVersion, MaintenanceCalendar, ConsentRecord,
} from "@/types/enterprise"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkPlatformAccess() {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  const { data: profile } = await admin.from("user_profiles").select("role").eq("user_id", user.id).single()
  if (!profile || !["super_admin", "platform_admin"].includes(profile.role)) return { allowed: false, error: "Insufficient permissions" } as const
  return { allowed: true, user } as const
}

// ---- Security Scans ----

export async function getSecurityScanResults() {
  const check = await checkPlatformAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("security_scan_results").select("*").order("scanned_at", { ascending: false }).limit(100)
  if (error) return { error: error.message }
  return { data: data as SecurityScanResult[] }
}

export async function getSecurityScanSummary() {
  const check = await checkPlatformAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data } = await admin.from("security_scan_results").select("severity, scan_result, scan_type")
  if (!data) return { data: { total: 0, critical: 0, high: 0, medium: 0, low: 0, by_type: {} } }
  const bySeverity: Record<string, number> = {}
  const byType: Record<string, number> = {}
  let critical = 0, high = 0, medium = 0, low = 0
  for (const r of data) {
    bySeverity[r.severity] = (bySeverity[r.severity] || 0) + 1
    byType[r.scan_type] = (byType[r.scan_type] || 0) + 1
    if (r.severity === "critical") critical++
    else if (r.severity === "high") high++
    else if (r.severity === "medium") medium++
    else low++
  }
  return { data: { total: data.length, critical, high, medium, low, by_severity: bySeverity, by_type: byType } }
}

// ---- Compliance Evidence ----

export async function getComplianceEvidence(framework?: string) {
  const check = await checkPlatformAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  let query = admin.from("compliance_evidence").select("*").order("control_id")
  if (framework) query = query.eq("framework", framework)
  const { data, error } = await query
  if (error) return { error: error.message }
  return { data: data as ComplianceEvidence[] }
}

export async function getComplianceSummary() {
  const check = await checkPlatformAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data } = await admin.from("compliance_evidence").select("framework, status")
  if (!data) return { data: { total: 0, compliant: 0, compliance_rate: 0, by_framework: {} } }
  const byFramework: Record<string, { total: number; compliant: number }> = {}
  let total = 0, compliant = 0
  for (const c of data) {
    if (!byFramework[c.framework]) byFramework[c.framework] = { total: 0, compliant: 0 }
    byFramework[c.framework].total++
    total++
    if (c.status === "compliant" || c.status === "audited") {
      byFramework[c.framework].compliant++
      compliant++
    }
  }
  return { data: { total, compliant, compliance_rate: total > 0 ? Math.round((compliant / total) * 100) : 0, by_framework: byFramework } }
}

// ---- Risk Register ----

export async function getRiskRegister() {
  const check = await checkPlatformAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("risk_register").select("*").order("risk_score", { ascending: false })
  if (error) return { error: error.message }
  return { data: data as RiskRegister[] }
}

// ---- Incidents ----

export async function getIncidents() {
  const check = await checkPlatformAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("incident_records").select("*").order("detected_at", { ascending: false }).limit(50)
  if (error) return { error: error.message }
  return { data: data as IncidentRecord[] }
}

// ---- Health Checks ----

export async function getHealthChecks() {
  const check = await checkPlatformAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("health_checks").select("*").order("check_name")
  if (error) return { error: error.message }
  return { data: data as HealthCheck[] }
}

// ---- Performance Benchmarks ----

export async function getPerformanceBenchmarks() {
  const check = await checkPlatformAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("performance_benchmarks").select("*").order("ran_at", { ascending: false }).limit(100)
  if (error) return { error: error.message }
  return { data: data as PerformanceBenchmark[] }
}

// ---- Release Readiness ----

export async function getReleaseReadiness() {
  const check = await checkPlatformAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("release_readiness").select("*").order("created_at", { ascending: false })
  if (error) return { error: error.message }
  return { data: data as ReleaseReadiness[] }
}

export async function upsertReleaseReadiness(release: Partial<ReleaseReadiness>) {
  const check = await checkPlatformAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  if (release.id) {
    const { error } = await admin.from("release_readiness").update(release).eq("id", release.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await admin.from("release_readiness").insert(release)
    if (error) return { error: error.message }
  }
  revalidatePath("/dashboard/platform/releases")
  return { data: true }
}

// ---- LTS Versions ----

export async function getLtsVersions() {
  const check = await checkPlatformAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("lts_versions").select("*").order("lts_start_date", { ascending: false })
  if (error) return { error: error.message }
  return { data: data as LtsVersion[] }
}

// ---- Maintenance Calendar ----

export async function getMaintenanceCalendar() {
  const check = await checkPlatformAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()
  const { data, error } = await admin.from("maintenance_calendar").select("*").order("scheduled_start")
  if (error) return { error: error.message }
  return { data: data as MaintenanceCalendar[] }
}

// ---- Dashboard ----

export async function getEnterpriseDashboard() {
  const check = await checkPlatformAccess()
  if (!check.allowed) return { error: check.error }
  const admin = createAdminClient()

  const [
    { count: scanCount },
    { data: scanData },
    { data: complianceData },
    { count: riskCount },
    { data: riskData },
    { data: incidentData },
    { count: benchCount },
    { data: benchData },
    { data: healthData },
    { count: releaseCount },
    { data: ltsData },
    { data: maintData },
    { data: recentIncidents },
  ] = await Promise.all([
    admin.from("security_scan_results").select("*", { count: "exact", head: true }),
    admin.from("security_scan_results").select("severity"),
    admin.from("compliance_evidence").select("framework, status"),
    admin.from("risk_register").select("*", { count: "exact", head: true }),
    admin.from("risk_register").select("risk_level"),
    admin.from("incident_records").select("status"),
    admin.from("performance_benchmarks").select("*", { count: "exact", head: true }),
    admin.from("performance_benchmarks").select("status"),
    admin.from("health_checks").select("is_healthy"),
    admin.from("release_readiness").select("*", { count: "exact", head: true }),
    admin.from("lts_versions").select("*"),
    admin.from("maintenance_calendar").select("*"),
    admin.from("incident_records").select("*").order("detected_at", { ascending: false }).limit(5),
  ])

  const criticalFindings = (scanData || []).filter((s) => s.severity === "critical").length
  const highFindings = (scanData || []).filter((s) => s.severity === "high").length
  const compliantControls = (complianceData || []).filter((c) => c.status === "compliant" || c.status === "audited").length
  const criticalRisks = (riskData || []).filter((r) => r.risk_level === "critical").length
  const openIncidents = (incidentData || []).filter((i) => !["resolved", "post_mortem"].includes(i.status)).length
  const failedBenchmarks = (benchData || []).filter((b) => b.status === "fail").length
  const unhealthyChecks = (healthData || []).filter((h) => !h.is_healthy).length
  const healthyChecks = (healthData || []).filter((h) => h.is_healthy).length
  const activeLts = (ltsData || []).filter((l) => l.support_level === "active").length
  const upcomingMaint = (maintData || []).filter((m) => m.status === "scheduled").length

  const totalControls = (complianceData || []).length
  const sc = scanCount ?? 0
  const bc = benchCount ?? 0
  const securityScore = sc > 0 ? Math.round(((sc - criticalFindings - highFindings) / sc) * 100) : 100
  const complianceScore = totalControls > 0 ? Math.round((compliantControls / totalControls) * 100) : 100
  const performanceScore = bc > 0 ? Math.round(((bc - failedBenchmarks) / bc) * 100) : 100
  const availabilityScore = (healthyChecks + unhealthyChecks) > 0 ? Math.round((healthyChecks / (healthyChecks + unhealthyChecks)) * 100) : 100

  const bySeverity: Record<string, number> = {}
  for (const s of (scanData || [])) bySeverity[s.severity] = (bySeverity[s.severity] || 0) + 1

  const byFramework: Record<string, number> = {}
  for (const c of (complianceData || [])) byFramework[c.framework] = (byFramework[c.framework] || 0) + 1

  return {
    data: {
      total_scan_results: scanCount || 0,
      critical_findings: criticalFindings,
      high_findings: highFindings,
      total_compliance_controls: totalControls,
      compliant_controls: compliantControls,
      total_risks: riskCount || 0,
      critical_risks: criticalRisks,
      open_incidents: openIncidents,
      total_benchmarks: benchCount || 0,
      failed_benchmarks: failedBenchmarks,
      healthy_checks: healthyChecks,
      unhealthy_checks: unhealthyChecks,
      total_releases: releaseCount || 0,
      active_lts_versions: activeLts,
      upcoming_maintenance: upcomingMaint,
      security_score: securityScore,
      compliance_score: complianceScore,
      performance_score: performanceScore,
      availability_score: availabilityScore,
      by_severity: Object.entries(bySeverity).map(([severity, count]) => ({ severity, count })),
      by_framework: Object.entries(byFramework).map(([framework, count]) => ({ framework, count })),
      recent_incidents: (recentIncidents || []) as IncidentRecord[],
    } as Module30DashboardData,
  }
}
