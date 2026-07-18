"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getConflicts, resolveConflict } from "@/lib/actions/schedule"
import { CONFLICT_SEVERITIES, CONFLICT_TYPES } from "@/config/schedule"
import type { ScheduleConflict } from "@/types/schedule"
import { AlertTriangle, CheckCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react"

export default function ConflictsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([])
  const [loading, setLoading] = useState(true)
  const [showResolved, setShowResolved] = useState(false)

  useEffect(() => {
    getConflicts(festivalId, showResolved || undefined).then(res => {
      setConflicts(res.data as ScheduleConflict[])
      setLoading(false)
    })
  }, [festivalId, showResolved])

  const handleResolve = async (id: string) => {
    const res = await resolveConflict(id, "Resolved manually")
    if (res.error) toast.error(res.error); else {
      toast.success("Conflict resolved")
      setConflicts(prev => prev.filter(c => c.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Conflicts</h1>
          <p className="text-sm text-gray-500 mt-1">Auto-detected scheduling conflicts that need resolution.</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} className="rounded" />
          Show resolved
        </label>
      </div>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
      ) : conflicts.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
          <p className="text-gray-500">No conflicts detected. Your schedule is clean!</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {conflicts.map(c => {
            const sev = CONFLICT_SEVERITIES.find(s => s.value === c.severity)
            return (
              <Card key={c.id} className={`border-l-4 ${c.severity === "critical" ? "border-l-red-500" : c.severity === "error" ? "border-l-red-400" : "border-l-amber-400"}`}>
                <CardContent className="py-3 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${sev?.color.split(" ")[0] || "text-amber-600"}`} />
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">{c.conflict_type.replace(/_/g, " ")}</h3>
                      <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                      <div className="flex gap-2 mt-1 text-xs">
                        <span className={`px-1.5 py-0.5 rounded-full font-medium ${sev?.color || ""}`}>{sev?.label || c.severity}</span>
                        <span className="text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {!c.is_resolved && (
                    <Button variant="outline" size="sm" className="text-green-600 shrink-0" onClick={() => handleResolve(c.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />Resolve
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
