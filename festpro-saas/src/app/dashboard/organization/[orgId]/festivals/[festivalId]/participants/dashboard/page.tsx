"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getParticipantDashboard } from "@/lib/actions/participant"
import type { ParticipantDashboardData } from "@/types/participant"
import { Users, CheckCircle, Clock, XCircle, CheckSquare, CalendarX, Loader2 } from "lucide-react"

export default function ParticipantDashboardPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [data, setData] = useState<ParticipantDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getParticipantDashboard(festivalId).then((res: any) => {
      if (res.data) setData(res.data)
      setLoading(false)
    })
  }, [festivalId])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
  if (!data) return <div className="text-center py-12 text-red-500">Failed to load dashboard</div>

  const stats = [
    { label: "Total Participants", value: data.total, icon: Users, color: "text-indigo-600 bg-indigo-100" },
    { label: "Approved", value: data.approved, icon: CheckCircle, color: "text-green-600 bg-green-100" },
    { label: "Pending", value: data.pending, icon: Clock, color: "text-amber-600 bg-amber-100" },
    { label: "Rejected", value: data.rejected, icon: XCircle, color: "text-red-600 bg-red-100" },
    { label: "Checked In", value: data.checked_in, icon: CheckSquare, color: "text-blue-600 bg-blue-100" },
    { label: "Absent", value: data.absent, icon: CalendarX, color: "text-gray-600 bg-gray-100" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Participant Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of all participants in this festival.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Competition-wise Count</CardTitle></CardHeader>
          <CardContent>
            {data.competition_wise.length === 0 ? (
              <p className="text-gray-400 text-sm">No registrations yet</p>
            ) : (
              <div className="space-y-2">
                {data.competition_wise.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{c.name}</span>
                    <span className="font-semibold text-indigo-600">{c.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Gender Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Male</span>
                <span className="font-semibold text-blue-600">{data.gender_distribution.male}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Female</span>
                <span className="font-semibold text-pink-600">{data.gender_distribution.female}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Other</span>
                <span className="font-semibold text-gray-600">{data.gender_distribution.other}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
