"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { getAttendance, markAttendance, getAttendanceStats } from "@/lib/actions/participant/attendance"
import { getCompetitions } from "@/lib/actions/competition"
import { ATTENDANCE_STATUSES } from "@/config/participant"
import type { Attendance } from "@/types/participant"
import type { Competition } from "@/types/competition"
import { Loader2, Search, CheckCircle, XCircle, Clock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

export default function AttendancePage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [compFilter, setCompFilter] = useState("")
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    const [aRes, cRes, sRes] = await Promise.all([
      getAttendance(festivalId, { status: statusFilter, competition_id: compFilter, attendance_date: dateFilter, page, limit }),
      getCompetitions(festivalId),
      getAttendanceStats(festivalId),
    ])
    setAttendance(aRes.data as Attendance[])
    setTotalCount(aRes.count || 0)
    setCompetitions(cRes as Competition[])
    setStats(sRes.data)
    setLoading(false)
  }, [festivalId, statusFilter, compFilter, dateFilter, page])

  useEffect(() => { load() }, [load])

  const handleMark = async (participantId: string, status: string, regId?: string) => {
    const res = await markAttendance(participantId, festivalId, status as any, regId, compFilter || undefined)
    if (res.error) toast.error(res.error); else { toast.success(`Marked as ${status}`); load() }
  }

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">Track participant attendance (QR or manual).</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Present", value: stats.present, icon: CheckCircle, color: "text-green-600 bg-green-100" },
            { label: "Absent", value: stats.absent, icon: XCircle, color: "text-red-600 bg-red-100" },
            { label: "Late", value: stats.late, icon: Clock, color: "text-amber-600 bg-amber-100" },
            { label: "Excused", value: stats.excused, icon: AlertCircle, color: "text-blue-600 bg-blue-100" },
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-4 w-4" /></div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <Input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(1) }} className="w-auto" />
            <Select options={ATTENDANCE_STATUSES.map(s => ({ value: s.value, label: s.label }))} placeholder="All Statuses" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} />
            <Select options={competitions.map(c => ({ value: c.id, label: c.name }))} placeholder="All Competitions" value={compFilter} onChange={e => { setCompFilter(e.target.value); setPage(1) }} />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Participant</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></td></tr>
                ) : attendance.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No attendance records</td></tr>
                ) : attendance.map((a: any) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{a.participant?.first_name} {a.participant?.last_name}</span>
                      <div className="text-xs text-gray-400">{a.participant?.participant_id} • {a.participant?.chest_number || "No chest"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ATTENDANCE_STATUSES.find(s => s.value === a.status)?.color || ""}`}>
                        {ATTENDANCE_STATUSES.find(s => s.value === a.status)?.label || a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {a.check_in_time ? new Date(a.check_in_time).toLocaleTimeString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {["present", "absent", "late", "excused"].filter(s => s !== a.status).map(s => (
                          <Button key={s} variant="ghost" size="sm" className="text-xs h-7 capitalize"
                            onClick={() => handleMark(a.participant_id, s, a.registration_id)}>
                            {s}
                          </Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{totalCount} total</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm text-gray-600 self-center">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  )
}
