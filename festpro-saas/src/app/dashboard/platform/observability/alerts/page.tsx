import { getSystemAlerts } from "@/lib/actions/observability"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ALERT_SEVERITIES } from "@/config/observability"
import { AlertTriangle, Bell } from "lucide-react"

const ALERTS_PAGE_SIZE = 100

export default async function AlertsPage() {
  const result = await getSystemAlerts({ limit: ALERTS_PAGE_SIZE })
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const { data: alerts, total } = result

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Alerts</h1>
        <p className="text-sm text-gray-500">View and manage system alerts</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-4 w-4" /> Alerts ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {alerts.map((a) => {
              const sevCfg = ALERT_SEVERITIES.find((s) => s.value === a.severity)
              return (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border text-sm">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                    a.severity === "critical" ? "text-red-500" :
                    a.severity === "high" ? "text-orange-500" : "text-amber-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${sevCfg?.color ?? ""}`}>{sevCfg?.label ?? a.severity}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        a.status === "active" ? "bg-red-100 text-red-700" :
                        a.status === "acknowledged" ? "bg-blue-100 text-blue-700" :
                        a.status === "resolved" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>{a.status}</span>
                      <span className="font-medium text-gray-900">{a.alert_name}</span>
                    </div>
                    <p className="text-gray-600 mt-1 truncate">{a.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(a.created_at).toLocaleString()} &middot; {a.source}</p>
                  </div>
                </div>
              )
            })}
            {alerts.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No alerts found</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
