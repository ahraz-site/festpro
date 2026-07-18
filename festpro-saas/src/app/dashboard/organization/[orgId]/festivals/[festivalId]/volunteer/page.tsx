"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getVolunteerDashboard } from "@/lib/actions/volunteer"
import type { Module13DashboardData } from "@/types/volunteer"
import { Loader2, Users, UserCheck, Briefcase, ClipboardList, Clock, CalendarDays, CheckCircle, MapPin, AlertTriangle } from "lucide-react"

export default function VolunteerDashboardPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [dash, setDash] = useState<Module13DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getVolunteerDashboard(festivalId)
    setDash(res.data || null); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const stats = [
    { label: "Total Volunteers", value: dash?.total_volunteers || 0, icon: Users, color: "text-blue-600 bg-blue-50", href: "/volunteer/volunteers" },
    { label: "Active Volunteers", value: dash?.active_volunteers || 0, icon: UserCheck, color: "text-green-600 bg-green-50", href: "/volunteer/volunteers" },
    { label: "Total Staff", value: dash?.total_staff || 0, icon: Briefcase, color: "text-indigo-600 bg-indigo-50", href: "/volunteer/staff" },
    { label: "Total Duties", value: dash?.total_duties || 0, icon: ClipboardList, color: "text-purple-600 bg-purple-50", href: "/volunteer/duties" },
    { label: "Active Shifts", value: dash?.active_shifts || 0, icon: Clock, color: "text-amber-600 bg-amber-50", href: "/volunteer/shifts" },
    { label: "Present Today", value: dash?.present_today || 0, icon: CalendarDays, color: "text-green-600 bg-green-50", href: "/volunteer/attendance" },
    { label: "Absent Today", value: dash?.absent_today || 0, icon: AlertTriangle, color: "text-red-600 bg-red-50", href: "/volunteer/attendance" },
    { label: "Pending Tasks", value: dash?.pending_tasks || 0, icon: CheckCircle, color: "text-amber-600 bg-amber-50", href: "/volunteer/tasks" },
    { label: "Checkpoints", value: dash?.total_checkpoints || 0, icon: MapPin, color: "text-cyan-600 bg-cyan-50", href: "/volunteer/checkpoints" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteer & Staff Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage volunteers, staff, duties, shifts, attendance and tasks.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/volunteer/volunteers`}>
            <Button variant="outline"><Users className="h-4 w-4 mr-1" /> Volunteers</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map(s => (
          <Link key={s.label} href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}${s.href}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div>
                </div>
                <p className="text-2xl font-bold mt-2">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: "Volunteers", href: "/volunteer/volunteers", icon: Users },
              { label: "Staff", href: "/volunteer/staff", icon: Briefcase },
              { label: "Departments", href: "/volunteer/departments", icon: Users },
              { label: "Duties", href: "/volunteer/duties", icon: ClipboardList },
              { label: "Shifts", href: "/volunteer/shifts", icon: Clock },
              { label: "Attendance", href: "/volunteer/attendance", icon: CalendarDays },
              { label: "Tasks", href: "/volunteer/tasks", icon: CheckCircle },
              { label: "Checkpoints", href: "/volunteer/checkpoints", icon: MapPin },
            ].map(a => (
              <Link key={a.label} href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}${a.href}`}>
                <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                  <a.icon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{a.label}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Today's Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Attendance Rate</span>
              <span className="font-semibold">
                {dash && (dash.present_today + dash.absent_today) > 0
                  ? Math.round((dash.present_today / (dash.present_today + dash.absent_today)) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-green-500" style={{ width: `${dash && (dash.present_today + dash.absent_today) > 0 ? Math.min((dash.present_today / (dash.present_today + dash.absent_today)) * 100, 100) : 0}%` }} />
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Task Completion</span>
              <span className="font-semibold">-</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-indigo-500" style={{ width: "0%" }} />
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Staff Utilization</span>
              <span className="font-semibold">{dash && dash.total_staff > 0 ? Math.round((dash.total_duties / (dash.total_staff * 3)) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-amber-500" style={{ width: `${dash && dash.total_staff > 0 ? Math.min((dash.total_duties / (dash.total_staff * 3)) * 100, 100) : 0}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
