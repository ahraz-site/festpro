import { getMaintenanceWindows } from "@/lib/actions/observability"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MAINTENANCE_STATUSES } from "@/config/observability"
import { Clock } from "lucide-react"

const MAINTENANCE_PAGE_SIZE = 100

export default async function MaintenancePage() {
  const result = await getMaintenanceWindows({ limit: MAINTENANCE_PAGE_SIZE })
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const { data: windows, total } = result

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Windows</h1>
        <p className="text-sm text-gray-500">Schedule and track maintenance activities</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Clock className="h-4 w-4" /> Maintenance Windows ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {windows.map((w) => {
              const stCfg = MAINTENANCE_STATUSES.find((s) => s.value === w.status)
              return (
                <div key={w.id} className="p-3 rounded-lg border text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${stCfg?.color ?? ""}`}>{stCfg?.label ?? w.status}</span>
                      <span className="font-medium text-gray-900">{w.title}</span>
                    </div>
                  </div>
                  {w.description && <p className="text-gray-600 text-xs mb-2">{w.description}</p>}
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Scheduled: {new Date(w.scheduled_start).toLocaleString()} — {new Date(w.scheduled_end).toLocaleString()}</span>
                    {w.affected_services?.length > 0 && <span>Services: {w.affected_services.join(", ")}</span>}
                  </div>
                </div>
              )
            })}
            {windows.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No maintenance windows found</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
