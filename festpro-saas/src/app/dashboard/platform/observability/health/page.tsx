import { getServiceStatuses } from "@/lib/actions/observability"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, Server } from "lucide-react"

export default async function SystemHealthPage() {
  const result = await getServiceStatuses()
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const services = result.data

  const statusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "degraded": return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "unhealthy": case "down": return <XCircle className="h-5 w-5 text-red-500" />
      default: return <MinusCircle className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
        <p className="text-sm text-gray-500">Monitor service status, uptime & health checks</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Card key={s.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-gray-600" />
                <CardTitle className="text-sm font-medium capitalize">{s.service}</CardTitle>
              </div>
              {statusIcon(s.status)}
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="font-medium capitalize">{s.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Uptime</span>
                <span className="font-medium">{s.uptime_percent.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Version</span>
                <span className="font-medium">{s.version ?? "—"}</span>
              </div>
              {s.is_maintenance_mode && (
                <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
                  <AlertTriangle className="h-3 w-3" /> Maintenance Mode
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
