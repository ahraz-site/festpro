import { Suspense } from "react"
import { getApplicationLogs } from "@/lib/actions/observability"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LOG_LEVELS } from "@/config/observability"
import { Search, Filter } from "lucide-react"

interface Props { searchParams: Promise<{ level?: string; source?: string; q?: string }> }

async function LogsTable({ level, source, q }: { level?: string; source?: string; q?: string }) {
  const result = await getApplicationLogs({ log_level: level, log_source: source, search: q, limit: 100 })
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const { data: logs, total } = result
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">{total.toLocaleString()} log entries</p>
      <div className="space-y-1">
        {logs.map((log) => {
          const lvlCfg = LOG_LEVELS.find((l) => l.value === log.log_level)
          return (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border text-sm font-mono">
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${lvlCfg?.color ?? ""}`}>{log.log_level.toUpperCase()}</span>
              <span className="text-gray-400 text-xs shrink-0">{new Date(log.created_at).toISOString().replace("T", " ").slice(0, 19)}</span>
              <span className="text-gray-600">{log.log_source}</span>
              <span className="flex-1 text-gray-900">{log.message}</span>
              {log.organization_id && <span className="text-xs text-gray-400">{log.organization_id.slice(0, 8)}</span>}
            </div>
          )
        })}
        {logs.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No logs found</p>}
      </div>
    </div>
  )
}

export default async function LogsPage({ searchParams }: Props) {
  const sp = await searchParams
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Application Logs</h1>
        <p className="text-sm text-gray-500">Search and view system logs</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Filter className="h-4 w-4" /> Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Level</label>
              <select name="level" className="border rounded px-2 py-1.5 text-sm">
                <option value="">All</option>
                {LOG_LEVELS.map((l) => <option key={l.value} value={l.value} selected={sp.level === l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Search</label>
              <div className="flex items-center gap-1">
                <Search className="h-4 w-4 text-gray-400" />
                <input name="q" defaultValue={sp.q} placeholder="Search messages..." className="border rounded px-2 py-1.5 text-sm w-48" />
              </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">Apply</button>
          </form>
        </CardContent>
      </Card>
      <Suspense fallback={<div className="text-sm text-gray-400">Loading logs...</div>}>
        <LogsTable level={sp.level} source={sp.source} q={sp.q} />
      </Suspense>
    </div>
  )
}
