import { getIncidentLogs } from "@/lib/actions/observability"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { INCIDENT_SEVERITIES, INCIDENT_STATUSES } from "@/config/observability"
import { Activity } from "lucide-react"

const INCIDENTS_PAGE_SIZE = 100

export default async function IncidentsPage() {
  const result = await getIncidentLogs({ limit: INCIDENTS_PAGE_SIZE })
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const { data: incidents, total } = result

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
        <p className="text-sm text-gray-500">Track and manage system incidents</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Activity className="h-4 w-4" /> Incidents ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {incidents.map((inc) => {
              const sevCfg = INCIDENT_SEVERITIES.find((s) => s.value === inc.severity)
              const stCfg = INCIDENT_STATUSES.find((s) => s.value === inc.status)
              return (
                <div key={inc.id} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${sevCfg?.color ?? ""}`}>{sevCfg?.label ?? inc.severity}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${stCfg?.color ?? ""}`}>{stCfg?.label ?? inc.status}</span>
                      <span className="font-medium text-gray-900">{inc.incident_name}</span>
                    </div>
                    <span className="text-xs text-gray-400">ID: {inc.incident_id}</span>
                  </div>
                  <p className="text-sm text-gray-600">{inc.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Detected: {new Date(inc.detected_at).toLocaleString()}</span>
                    {inc.time_to_resolve_minutes && <span>Resolved in: {inc.time_to_resolve_minutes}m</span>}
                    {inc.affected_services?.length > 0 && <span>Affected: {inc.affected_services.join(", ")}</span>}
                  </div>
                </div>
              )
            })}
            {incidents.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No incidents found</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
