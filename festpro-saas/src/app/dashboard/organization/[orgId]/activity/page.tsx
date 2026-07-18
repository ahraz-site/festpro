"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getActivityLogs } from "@/lib/actions/organization"
import type { ActivityLog } from "@/types/organization"
import { Activity, User } from "lucide-react"

export default function ActivityPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getActivityLogs(orgId, 100)
      setLogs(data as unknown as ActivityLog[])
      setLoading(false)
    }
    load()
  }, [orgId])

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-sm text-gray-500 mt-1">Track changes and actions within your organization.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <p className="text-sm text-gray-500 py-12 text-center">No activity recorded yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                    {log.user ? (
                      <span className="text-xs font-medium">
                        {log.user.first_name?.[0]}{log.user.last_name?.[0]}
                      </span>
                    ) : (
                      <Activity className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {log.user ? `${log.user.first_name} ${log.user.last_name}` : "System"}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">
                        {log.action.replace(/\./g, " ")}
                      </span>
                    </div>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {JSON.stringify(log.metadata)}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
