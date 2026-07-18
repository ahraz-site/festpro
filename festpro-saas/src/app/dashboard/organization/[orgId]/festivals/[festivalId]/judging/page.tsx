"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getJudgingDashboard } from "@/lib/actions/judging/approval"
import { Loader2, Users, CheckCircle, Star, Lock, Clock, Trophy } from "lucide-react"

export default function JudgingDashboardPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getJudgingDashboard(festivalId).then((res: any) => {
      if (res.data) setStats(res.data)
      setLoading(false)
    })
  }, [festivalId])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const cards = [
    { label: "Total Judges", value: stats?.total_judges ?? 0, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Active Judges", value: stats?.active_judges ?? 0, icon: CheckCircle, color: "text-green-600 bg-green-50" },
    { label: "Total Scores", value: stats?.total_scores ?? 0, icon: Star, color: "text-yellow-600 bg-yellow-50" },
    { label: "Locked Scores", value: stats?.locked_scores ?? 0, icon: Lock, color: "text-purple-600 bg-purple-50" },
    { label: "Pending Approvals", value: stats?.pending_approvals ?? 0, icon: Clock, color: "text-orange-600 bg-orange-50" },
    { label: "Completed Competitions", value: stats?.completed_competitions ?? 0, icon: Trophy, color: "text-indigo-600 bg-indigo-50" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Judging Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of scoring, judges, and approvals.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(c => (
          <Card key={c.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${c.color}`}><c.icon className="h-6 w-6" /></div>
                <div>
                  <p className="text-sm text-gray-500">{c.label}</p>
                  <p className="text-2xl font-bold">{c.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
