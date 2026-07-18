import Link from "next/link"
import { getObservabilityDashboard } from "@/lib/actions/observability"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, Bug, Database, RefreshCw, Shield, Clock, BarChart3, Server, Layers } from "lucide-react"

export default async function ObservabilityDashboardPage() {
  const result = await getObservabilityDashboard()
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const d = result.data!

  const cards = [
    { label: "Services", value: d.services.length, icon: Server, color: "text-blue-600" },
    { label: "Active Alerts", value: d.active_alerts, icon: AlertTriangle, color: d.critical_alerts > 0 ? "text-red-600" : "text-amber-600" },
    { label: "Open Incidents", value: d.open_incidents, icon: Activity, color: "text-orange-600" },
    { label: "Total Backups", value: d.total_backups, icon: Database, color: "text-green-600" },
    { label: "Failed Backups", value: d.failed_backups, icon: Shield, color: d.failed_backups > 0 ? "text-red-600" : "text-gray-600" },
    { label: "Pending Restores", value: d.pending_restores, icon: RefreshCw, color: "text-amber-600" },
    { label: "Logs Today", value: d.total_logs_today.toLocaleString(), icon: BarChart3, color: "text-indigo-600" },
    { label: "Errors Today", value: d.error_logs_today, icon: Bug, color: d.error_logs_today > 0 ? "text-red-600" : "text-green-600" },
    { label: "Deployments", value: d.total_deployments, icon: Layers, color: "text-purple-600" },
    { label: "Avg Response", value: `${d.avg_response_time}ms`, icon: Clock, color: "text-cyan-600" },
  ]

  const sections = [
    { href: "/dashboard/platform/observability/health", label: "System Health", desc: "Monitor service status & uptime", icon: Server },
    { href: "/dashboard/platform/observability/logs", label: "Application Logs", desc: "View & search log entries", icon: BarChart3 },
    { href: "/dashboard/platform/observability/alerts", label: "Alerts", desc: "Active & resolved alerts", icon: AlertTriangle },
    { href: "/dashboard/platform/observability/incidents", label: "Incidents", desc: "Track and manage incidents", icon: Activity },
    { href: "/dashboard/platform/observability/backups", label: "Backups", desc: "Backup & restore jobs", icon: Database },
    { href: "/dashboard/platform/observability/deployments", label: "Deployments", desc: "Deployment history", icon: Layers },
    { href: "/dashboard/platform/observability/maintenance", label: "Maintenance", desc: "Maintenance windows", icon: Clock },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Observability Dashboard</h1>
        <p className="text-sm text-gray-500">System health, monitoring, backups, incidents & alerts</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{c.label}</CardTitle>
                <Icon className={`h-4 w-4 ${c.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.href} href={s.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <div>
                    <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
            {d.services.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm font-medium capitalize">{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{s.uptime.toFixed(1)}%</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    s.status === "healthy" ? "bg-green-500" :
                    s.status === "degraded" ? "bg-amber-500" :
                    s.status === "down" ? "bg-red-500" : "bg-gray-400"
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
