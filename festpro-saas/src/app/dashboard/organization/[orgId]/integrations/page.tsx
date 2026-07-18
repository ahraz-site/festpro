import { getIntegrationDashboard } from "@/lib/actions/integration-hub"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Key, Webhook, Link, Activity, CloudSync, FileText, Download, AlertTriangle, BarChart3 } from "lucide-react"

export default async function IntegrationsDashboardPage(props: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await props.params
  const result = await getIntegrationDashboard(orgId)
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const d = result.data

  const cards = [
    { label: "API Keys", value: `${d.active_api_keys}/${d.total_api_keys}`, icon: Key, color: "text-indigo-600" },
    { label: "Webhooks", value: `${d.active_webhooks}/${d.total_webhooks}`, icon: Webhook, color: "text-purple-600" },
    { label: "Integrations", value: `${d.active_integrations}/${d.total_integrations}`, icon: Link, color: "text-blue-600" },
    { label: "Pending Events", value: d.pending_events, icon: Activity, color: "text-amber-600" },
    { label: "Failed Events", value: d.failed_events, icon: AlertTriangle, color: "text-red-600" },
    { label: "Pending Jobs", value: d.pending_jobs, icon: CloudSync, color: "text-cyan-600" },
    { label: "Imports", value: `${d.completed_imports}/${d.total_imports}`, icon: FileText, color: "text-green-600" },
    { label: "Exports", value: `${d.completed_exports}/${d.total_exports}`, icon: Download, color: "text-emerald-600" },
    { label: "API Requests Today", value: d.api_requests_today, icon: BarChart3, color: "text-rose-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integration Hub</h1>
        <p className="text-sm text-gray-500">Manage APIs, webhooks, integrations, imports/exports and scheduled jobs</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{c.label}</CardTitle>
                <Icon className={`h-4 w-4 ${c.color}`} />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{c.value}</div></CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
