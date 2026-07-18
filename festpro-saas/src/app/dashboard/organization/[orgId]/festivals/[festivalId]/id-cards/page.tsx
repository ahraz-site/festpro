"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getIdCardDashboard } from "@/lib/actions/id-card"
import type { Module14DashboardData } from "@/types/id-card"
import { Loader2, IdCard, Award, CreditCard, QrCode, Scan, Printer, History, CheckCircle, XCircle, Shield, Car, Users } from "lucide-react"

export default function IdCardDashboardPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [dash, setDash] = useState<Module14DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getIdCardDashboard(festivalId)
    setDash(res.data || null); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const stats = [
    { label: "ID Cards", value: dash?.total_id_cards || 0, icon: IdCard, color: "text-blue-600 bg-blue-50", href: "/id-cards/cards", sub: `${dash?.active_id_cards || 0} active` },
    { label: "Badges", value: dash?.total_badges || 0, icon: Award, color: "text-purple-600 bg-purple-50", href: "/id-cards/badges", sub: `${dash?.active_badges || 0} active` },
    { label: "Passes", value: dash?.total_passes || 0, icon: CreditCard, color: "text-amber-600 bg-amber-50", href: "/id-cards/passes", sub: `${dash?.active_passes || 0} active` },
    { label: "QR Codes", value: dash?.total_qr_codes || 0, icon: QrCode, color: "text-indigo-600 bg-indigo-50", href: "/id-cards/qr-codes" },
    { label: "Verifications Today", value: dash?.verifications_today || 0, icon: Scan, color: "text-teal-600 bg-teal-50", href: "/id-cards/logs" },
    { label: "Valid", value: dash?.valid_verifications || 0, icon: CheckCircle, color: "text-green-600 bg-green-50", href: "/id-cards/logs" },
    { label: "Failed", value: dash?.failed_verifications || 0, icon: XCircle, color: "text-red-600 bg-red-50", href: "/id-cards/logs" },
    { label: "Print Queue", value: dash?.print_queue_count || 0, icon: Printer, color: "text-cyan-600 bg-cyan-50", href: "/id-cards/print" },
    { label: "Recent Prints", value: dash?.recent_prints || 0, icon: History, color: "text-gray-600 bg-gray-50", href: "/id-cards/print" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ID Card & Pass Management</h1>
          <p className="text-sm text-gray-500 mt-1">Issue and manage ID cards, badges, passes, QR codes, and verification.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/id-cards/verification`}>
            <Button variant="outline"><Shield className="h-4 w-4 mr-1" /> Verify</Button>
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
              { label: "Issue ID Card", href: "/id-cards/cards", icon: IdCard },
              { label: "Create Badge", href: "/id-cards/badges", icon: Award },
              { label: "Issue Pass", href: "/id-cards/passes", icon: CreditCard },
              { label: "Vehicle Pass", href: "/id-cards/vehicle-passes", icon: Car },
              { label: "Guest Pass", href: "/id-cards/guest-passes", icon: Users },
              { label: "Print Queue", href: "/id-cards/print", icon: Printer },
              { label: "Verification", href: "/id-cards/verification", icon: Scan },
              { label: "View Logs", href: "/id-cards/logs", icon: History },
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
          <CardHeader><CardTitle className="text-lg">Today's Verification Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Success Rate</span>
              <span className="font-semibold">{dash && dash.verifications_today > 0 ? Math.round((dash.valid_verifications / dash.verifications_today) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-green-500" style={{ width: `${dash && dash.verifications_today > 0 ? Math.min((dash.valid_verifications / dash.verifications_today) * 100, 100) : 0}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" /> Valid</span>
              <span className="font-semibold text-green-600">{dash?.valid_verifications || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1"><XCircle className="h-4 w-4 text-red-500" /> Failed</span>
              <span className="font-semibold text-red-600">{dash?.failed_verifications || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
