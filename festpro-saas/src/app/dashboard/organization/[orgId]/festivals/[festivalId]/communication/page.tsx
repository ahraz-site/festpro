"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCommunicationDashboard } from "@/lib/actions/communication"
import type { Module10DashboardData } from "@/types/communication"
import { Loader2, Bell, Mail, MessageSquare, Smartphone, Megaphone, Workflow, AlertTriangle, Clock, Send, BarChart3, Settings, Plus, FileText } from "lucide-react"

export default function CommunicationDashboardPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [dash, setDash] = useState<Module10DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getCommunicationDashboard(festivalId)
    setDash(res.data || null); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const stats = [
    { label: "Unread", value: dash?.unread_notifications || 0, icon: Bell, color: "text-red-600 bg-red-50", href: "/communication/notifications" },
    { label: "Announcements", value: dash?.active_announcements || 0, icon: Megaphone, color: "text-purple-600 bg-purple-50", href: "/communication/announcements" },
    { label: "Emergency", value: dash?.emergency_announcements || 0, icon: AlertTriangle, color: "text-red-600 bg-red-50", href: "/communication/announcements" },
    { label: "Active Workflows", value: dash?.active_workflows || 0, icon: Workflow, color: "text-indigo-600 bg-indigo-50", href: "/communication/workflows" },
    { label: "Pending Emails", value: dash?.pending_emails || 0, icon: Mail, color: "text-blue-600 bg-blue-50", href: "/communication/email" },
    { label: "Scheduled", value: dash?.scheduled_notifications || 0, icon: Clock, color: "text-amber-600 bg-amber-50", href: "/communication/notifications" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communication Center</h1>
          <p className="text-sm text-gray-500 mt-1">Manage notifications, announcements, email, and workflow automation.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/communication/announcements/create`}>
            <Button><Plus className="h-4 w-4 mr-1" /> New Announcement</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(s => (
          <Link key={s.label} href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}${s.href}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
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
              { label: "Send Notification", href: "/communication/notifications", icon: Bell },
              { label: "Create Announcement", href: "/communication/announcements/create", icon: Megaphone },
              { label: "Send Email", href: "/communication/email", icon: Mail },
              { label: "Workflow Builder", href: "/communication/workflows", icon: Workflow },
              { label: "Email Templates", href: "/communication/email/templates", icon: FileText },
              { label: "Settings", href: "/communication/settings", icon: Settings },
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
          <CardHeader><CardTitle className="text-lg">Delivery Status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Emails Sent (30d)", value: dash?.total_email_sent || 0, total: Math.max(dash?.total_email_sent || 0, 1), color: "bg-blue-500" },
              { label: "Pending Delivery", value: dash?.pending_emails || 0, total: Math.max(dash?.total_email_sent || 0, 1), color: "bg-amber-500" },
              { label: "Failed", value: dash?.failed_emails || 0, total: Math.max(dash?.total_email_sent || 0, 1), color: "bg-red-500" },
            ].map(d => (
              <div key={d.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{d.label}</span>
                  <span className="font-semibold">{d.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${d.color}`} style={{ width: `${Math.min((d.value / d.total) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
