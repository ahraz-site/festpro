"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSponsorDashboard } from "@/lib/actions/sponsor-crm"
import type { Module15DashboardData } from "@/types/sponsor-crm"
import { Loader2, Handshake, Users, Target, UserCheck, DollarSign, PiggyBank, Receipt, TrendingUp, Building2, Phone } from "lucide-react"

export default function SponsorDashboardPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [dash, setDash] = useState<Module15DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getSponsorDashboard(festivalId)
    setDash(res.data || null); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const stats = [
    { label: "Sponsors", value: dash?.total_sponsors || 0, icon: Handshake, color: "text-purple-600 bg-purple-50", href: "/sponsor/sponsors", sub: `${dash?.active_sponsors || 0} active` },
    { label: "Donors", value: dash?.total_donors || 0, icon: Users, color: "text-blue-600 bg-blue-50", href: "/sponsor/donors" },
    { label: "Campaigns", value: dash?.total_campaigns || 0, icon: Target, color: "text-red-600 bg-red-50", href: "/sponsor/campaigns", sub: `${dash?.active_campaigns || 0} active` },
    { label: "Collectors", value: dash?.total_collectors || 0, icon: UserCheck, color: "text-teal-600 bg-teal-50", href: "/sponsor/collectors" },
    { label: "Donations Today", value: `₹${(dash?.donation_amount_today || 0).toLocaleString()}`, icon: DollarSign, color: "text-green-600 bg-green-50", href: "/sponsor/donations" },
    { label: "Total Collected", value: `₹${(dash?.total_collected || 0).toLocaleString()}`, icon: TrendingUp, color: "text-indigo-600 bg-indigo-50", href: "/sponsor/donations" },
    { label: "Pledges", value: dash?.total_pledges || 0, icon: PiggyBank, color: "text-amber-600 bg-amber-50", href: "/sponsor/pledges", sub: `${dash?.pending_pledges || 0} pending` },
    { label: "Receipts", value: dash?.total_receipts || 0, icon: Receipt, color: "text-cyan-600 bg-cyan-50", href: "/sponsor/receipts" },
  ]

  const progress = dash && dash.total_campaign_goal > 0 ? Math.min(Math.round((dash.total_collected / dash.total_campaign_goal) * 100), 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sponsor, Donor & Fund CRM</h1>
          <p className="text-sm text-gray-500 mt-1">Manage sponsors, donors, campaigns, collections and receipts.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/sponsor/donations`}>
            <Button><DollarSign className="h-4 w-4 mr-1" /> Record Donation</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Campaign Goal Progress</CardTitle></CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span>₹{(dash?.total_collected || 0).toLocaleString()} collected</span>
            <span className="font-semibold">{progress}% of ₹{(dash?.total_campaign_goal || 0).toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: "Add Sponsor", href: "/sponsor/sponsors", icon: Handshake },
              { label: "Add Donor", href: "/sponsor/donors", icon: Users },
              { label: "New Campaign", href: "/sponsor/campaigns", icon: Target },
              { label: "Add Collector", href: "/sponsor/collectors", icon: UserCheck },
              { label: "Record Donation", href: "/sponsor/donations", icon: DollarSign },
              { label: "View Pledges", href: "/sponsor/pledges", icon: PiggyBank },
              { label: "Receipts", href: "/sponsor/receipts", icon: Receipt },
              { label: "CRM", href: "/sponsor/crm", icon: Phone },
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
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-green-500" /> Donations Today</span>
              <span className="font-semibold text-green-600">₹{(dash?.donation_amount_today || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1"><TrendingUp className="h-4 w-4 text-indigo-500" /> Total Collected</span>
              <span className="font-semibold text-indigo-600">₹{(dash?.total_collected || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1"><PiggyBank className="h-4 w-4 text-amber-500" /> Pending Pledges</span>
              <span className="font-semibold text-amber-600">{dash?.pending_pledges || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1"><Receipt className="h-4 w-4 text-cyan-500" /> Receipts Issued</span>
              <span className="font-semibold text-cyan-600">{dash?.total_receipts || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
