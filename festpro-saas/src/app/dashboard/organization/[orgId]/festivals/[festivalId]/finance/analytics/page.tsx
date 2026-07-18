"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAnalytics } from "@/lib/actions/reports"
import { Loader2, TrendingUp, Users, Award, FileText, BarChart3, Activity, BookOpen, Trophy } from "lucide-react"

export default function AnalyticsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getAnalytics(festivalId)
    setData(res.data || null); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const stats = [
    { label: "Total Participants", value: data?.total_participants || 0, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Total Competitions", value: data?.total_competitions || 0, icon: BookOpen, color: "text-indigo-600 bg-indigo-50" },
    { label: "Total Judges", value: data?.total_judges || 0, icon: Award, color: "text-purple-600 bg-purple-50" },
    { label: "Total Results", value: data?.total_results || 0, icon: Trophy, color: "text-amber-600 bg-amber-50" },
    { label: "Results Published", value: data?.results_published || 0, icon: Activity, color: "text-green-600 bg-green-50" },
    { label: "Certificates", value: data?.total_certificates || 0, icon: FileText, color: "text-cyan-600 bg-cyan-50" },
  ]

  const categoryEntries = Object.entries(data?.competition_popularity || {}).sort((a: any, b: any) => b[1] - a[1])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Festival analytics, trends, and insights.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{s.label}</p>
              <p className="text-2xl font-bold">{s.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Competition Popularity by Category</CardTitle></CardHeader>
          <CardContent>
            {categoryEntries.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No data</p>
            ) : (
              <div className="space-y-3">
                {categoryEntries.map(([name, count]: [string, any], i: number) => {
                  const maxCount = Math.max(...categoryEntries.map(([, c]: [string, any]) => c))
                  const pct = maxCount > 0 ? (Number(count) / maxCount) * 100 : 0
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{name}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Revenue Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Income</p>
                <p className="text-2xl font-bold text-green-600">₹{(data?.total_income || 0).toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Expense</p>
                <p className="text-2xl font-bold text-red-600">₹{(data?.total_expense || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="text-center mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-500">Net Balance</p>
              <p className={`text-2xl font-bold ${(data?.total_income || 0) - (data?.total_expense || 0) >= 0 ? "text-blue-600" : "text-red-600"}`}>
                ₹{((data?.total_income || 0) - (data?.total_expense || 0)).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
