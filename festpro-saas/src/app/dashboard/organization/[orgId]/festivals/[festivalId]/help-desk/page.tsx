"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getHelpDeskDashboard, searchHelpDesk } from "@/lib/actions/help-desk"
import type { Module16DashboardData } from "@/types/help-desk"
import { Loader2, Ticket, Users, UserCheck, Search as SearchIcon, Package, Phone, Bell, MapPin, BookOpen, ClipboardList, Star, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react"

export default function HelpDeskDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const festivalId = params.festivalId as string
  const [dash, setDash] = useState<Module16DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState("")
  const [searchResults, setSearchResults] = useState<any>(null)

  const load = useCallback(async () => {
    const res = await getHelpDeskDashboard(festivalId)
    setDash(res.data || null); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const handleSearch = async () => {
    if (!searchQ.trim()) return
    const res = await searchHelpDesk(festivalId, searchQ)
    setSearchResults(res)
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const stats = [
    { label: "Total Tickets", value: dash?.total_tickets || 0, icon: Ticket, color: "text-blue-600 bg-blue-50", href: "/help-desk/tickets", sub: `${dash?.open_tickets || 0} open` },
    { label: "Resolved", value: dash?.resolved_tickets || 0, icon: ClipboardList, color: "text-green-600 bg-green-50", href: "/help-desk/tickets" },
    { label: "Escalated", value: dash?.escalated_tickets || 0, icon: AlertTriangle, color: "text-red-600 bg-red-50", href: "/help-desk/tickets" },
    { label: "Visitors", value: dash?.total_visitors || 0, icon: Users, color: "text-purple-600 bg-purple-50", href: "/help-desk/visitors", sub: `${dash?.vip_visitors || 0} VIP` },
    { label: "Checked In Today", value: dash?.checked_in_today || 0, icon: UserCheck, color: "text-teal-600 bg-teal-50", href: "/help-desk/checkins" },
    { label: "Lost Items", value: dash?.total_lost_items || 0, icon: SearchIcon, color: "text-amber-600 bg-amber-50", href: "/help-desk/lost", sub: `${dash?.claimed_items || 0} claimed` },
    { label: "Found Items", value: dash?.total_found_items || 0, icon: Package, color: "text-indigo-600 bg-indigo-50", href: "/help-desk/found" },
    { label: "Pending Claims", value: dash?.pending_claims || 0, icon: ShieldCheck, color: "text-rose-600 bg-rose-50", href: "/help-desk/claims" },
    { label: "Help Desks", value: dash?.total_desks || 0, icon: MapPin, color: "text-cyan-600 bg-cyan-50", href: "/help-desk/desks", sub: `${dash?.total_staff || 0} staff` },
    { label: "Avg Rating", value: dash?.avg_rating ? `${dash.avg_rating}/5` : "N/A", icon: Star, color: "text-yellow-600 bg-yellow-50", href: "/help-desk/ratings" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Help Desk & Reception</h1>
          <p className="text-sm text-gray-500 mt-1">Enterprise support ticketing, visitor management, lost & found, and feedback.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/help-desk/search`}>
            <Button variant="outline"><SearchIcon className="h-4 w-4 mr-1" /> Search</Button>
          </Link>
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/help-desk/tickets`}>
            <Button><Ticket className="h-4 w-4 mr-1" /> New Ticket</Button>
          </Link>
        </div>
      </div>

      <div className="relative">
        <Input placeholder="Search tickets, visitors, lost & found items..." value={searchQ} onChange={e => setSearchQ(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} className="pl-10" />
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map(s => (
          <Link key={s.label} href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}${s.href}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div>
                </div>
                <p className="text-2xl font-bold mt-2">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
                {s.sub && <p className="text-xs" style={{ color: s.color.split(" ")[1] }}>{s.sub}</p>}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: "New Ticket", href: "/help-desk/tickets", icon: Ticket },
              { label: "Register Visitor", href: "/help-desk/visitors", icon: Users },
              { label: "Check In", href: "/help-desk/checkins", icon: UserCheck },
              { label: "Report Lost", href: "/help-desk/lost", icon: SearchIcon },
              { label: "Report Found", href: "/help-desk/found", icon: Package },
              { label: "Knowledge Base", href: "/help-desk/knowledge", icon: BookOpen },
              { label: "FAQs", href: "/help-desk/faq", icon: ClipboardList },
              { label: "Feedback", href: "/help-desk/feedback", icon: Star },
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
          <CardHeader><CardTitle className="text-lg">Ticket Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Open</span><span className="font-semibold">{dash?.open_tickets || 0}</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${dash?.total_tickets ? ((dash.open_tickets / dash.total_tickets) * 100) : 0}%` }} /></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Resolved</span><span className="font-semibold">{dash?.resolved_tickets || 0}</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2"><div className="h-2 rounded-full bg-green-500" style={{ width: `${dash?.total_tickets ? ((dash.resolved_tickets / dash.total_tickets) * 100) : 0}%` }} /></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Escalated</span><span className="font-semibold text-red-600">{dash?.escalated_tickets || 0}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Today's Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <UserCheck className="h-4 w-4 text-teal-500" />
              <span>{dash?.checked_in_today || 0} visitors checked in today</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Users className="h-4 w-4 text-purple-500" />
              <span>{dash?.vip_visitors || 0} VIP visitors registered</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>{dash?.escalated_tickets || 0} open escalations</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
