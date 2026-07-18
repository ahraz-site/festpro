"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSecurityDashboard } from "@/lib/actions/security"
import type { Module11DashboardData } from "@/types/security"
import { Loader2, Shield, Activity, AlertTriangle, Users, Key, Database, Server, Bug, Flag, RefreshCw, Ban, Settings, FileText, History, Lock, Eye } from "lucide-react"

export default function AdminDashboardPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [dash, setDash] = useState<Module11DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getSecurityDashboard(festivalId)
    setDash(res.data || null); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const healthPct = dash && dash.system_health_total > 0 ? Math.round((dash.system_health_healthy / dash.system_health_total) * 100) : 0

  const stats = [
    { label: "Audit Logs", value: dash?.total_audit_logs || 0, icon: FileText, color: "text-blue-600 bg-blue-50", href: "/admin/audit" },
    { label: "Security Events", value: dash?.security_events || 0, icon: AlertTriangle, color: "text-red-600 bg-red-50", href: "/admin/security", sub: `${dash?.critical_events || 0} critical` },
    { label: "Active Sessions", value: dash?.active_sessions || 0, icon: Users, color: "text-indigo-600 bg-indigo-50", href: "/admin/sessions" },
    { label: "Failed Logins (24h)", value: dash?.failed_logins_24h || 0, icon: Lock, color: "text-amber-600 bg-amber-50", href: "/admin/login-history" },
    { label: "API Tokens", value: dash?.api_tokens || 0, icon: Key, color: "text-purple-600 bg-purple-50", href: "/admin/api-tokens" },
    { label: "System Health", value: `${healthPct}%`, icon: Server, color: healthPct >= 80 ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50", href: "/admin/settings" },
    { label: "Error Logs (24h)", value: dash?.error_logs_24h || 0, icon: Bug, color: "text-orange-600 bg-orange-50", href: "/admin/errors" },
    { label: "Features Enabled", value: dash?.feature_flags_enabled || 0, icon: Flag, color: "text-teal-600 bg-teal-50", href: "/admin/features" },
    { label: "Backups", value: dash?.backups_completed || 0, icon: Database, color: "text-cyan-600 bg-cyan-50", href: "/admin/backups" },
    { label: "IP Blacklisted", value: dash?.ip_blacklist_count || 0, icon: Ban, color: "text-red-600 bg-red-50", href: "/admin/security" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
          <p className="text-sm text-gray-500 mt-1">Security, audit, and system management dashboard.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/admin/audit`}>
            <Button variant="outline"><Eye className="h-4 w-4 mr-1" /> View Audit Log</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map(s => (
          <Link key={s.label} href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}${s.href}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div>
                </div>
                <p className="text-2xl font-bold mt-2">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
                {s.sub && <p className="text-xs text-red-500">{s.sub}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: "Audit Logs", href: "/admin/audit", icon: FileText },
              { label: "Security Events", href: "/admin/security", icon: AlertTriangle },
              { label: "Active Sessions", href: "/admin/sessions", icon: Users },
              { label: "System Settings", href: "/admin/settings", icon: Settings },
              { label: "Feature Flags", href: "/admin/features", icon: Flag },
              { label: "API Tokens", href: "/admin/api-tokens", icon: Key },
              { label: "Backups", href: "/admin/backups", icon: Database },
              { label: "Error Logs", href: "/admin/errors", icon: Bug },
            ].map(a => (
              <Link key={a.label} href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}${a.href}`}>
                <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                  <a.icon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{a.label}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">System Health</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Healthy Components", value: dash?.system_health_healthy || 0, total: dash?.system_health_total || 1, color: "bg-green-500" },
              { label: "Error Rate (24h)", value: dash?.error_logs_24h || 0, total: Math.max(dash?.error_logs_24h || 0, 1), color: "bg-red-500" },
              { label: "Security Events", value: dash?.security_events || 0, total: Math.max(dash?.security_events || 0, 1), color: "bg-amber-500" },
            ].map(d => (
              <div key={d.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{d.label}</span>
                  <span className="font-semibold">{d.value}{d.total > 1 && d.total !== (dash?.system_health_total || 1) ? "" : `/${d.total}`}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${d.color}`} style={{ width: `${Math.min((d.value / d.total) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
