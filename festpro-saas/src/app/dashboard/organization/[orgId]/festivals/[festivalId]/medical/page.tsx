"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getMedicalEmergencyDashboard } from "@/lib/actions/medical-emergency"
import type { Module20DashboardData } from "@/types/medical-emergency"
import { Loader2, Building2, Users, Stethoscope, Activity, AlertTriangle, Truck, Pill, FileText, Plus, AlertCircle, HeartPulse, Syringe, UserCheck } from "lucide-react"

export default function MedicalDashboardPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [dash, setDash] = useState<Module20DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getMedicalEmergencyDashboard(festivalId)
    setDash(res.data || null); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const stats = [
    { label: "Medical Centers", value: dash?.total_centers || 0, icon: Building2, color: "text-blue-600 bg-blue-50", href: "/medical/centers", sub: `${dash?.active_centers || 0} active` },
    { label: "Medical Staff", value: dash?.total_staff || 0, icon: Users, color: "text-green-600 bg-green-50", href: "/medical/staff", sub: `${dash?.total_doctors || 0} doctors` },
    { label: "Patients", value: dash?.total_patients || 0, icon: UserCheck, color: "text-indigo-600 bg-indigo-50", href: "/medical/patients" },
    { label: "Active Cases", value: dash?.open_cases || 0, icon: Activity, color: "text-amber-600 bg-amber-50", href: "/medical/cases", sub: `${dash?.cases_today || 0} today` },
    { label: "Emergency Cases", value: dash?.emergency_cases || 0, icon: AlertCircle, color: "text-red-600 bg-red-50", href: "/medical/cases" },
    { label: "Incidents", value: dash?.total_incidents || 0, icon: AlertTriangle, color: "text-orange-600 bg-orange-50", href: "/medical/incidents", sub: `${dash?.open_incidents || 0} open` },
    { label: "Critical Incidents", value: dash?.critical_incidents || 0, icon: AlertTriangle, color: "text-red-600 bg-red-50", href: "/medical/incidents" },
    { label: "Ambulances", value: dash?.total_ambulances || 0, icon: Truck, color: "text-purple-600 bg-purple-50", href: "/medical/ambulances", sub: `${dash?.available_ambulances || 0} available` },
    { label: "Active Trips", value: dash?.active_trips || 0, icon: Truck, color: "text-cyan-600 bg-cyan-50", href: "/medical/ambulances" },
    { label: "Medications", value: dash?.total_medications || 0, icon: Pill, color: "text-teal-600 bg-teal-50", href: "/medical/medications" },
    { label: "Referrals", value: dash?.total_referrals || 0, icon: FileText, color: "text-pink-600 bg-pink-50", href: "/medical/referrals", sub: `${dash?.pending_referrals || 0} pending` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Medical & Emergency</h1><p className="text-sm text-gray-500 mt-1">Medical desk, emergency response, incident management and ambulance coordination.</p></div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/medical/cases`}><Button variant="outline"><Plus className="h-4 w-4 mr-1" /> New Case</Button></Link>
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/medical/incidents`}><Button><AlertTriangle className="h-4 w-4 mr-1" /> Report Incident</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map(s => (
          <Link key={s.label} href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}${s.href}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer"><CardContent className="pt-4">
              <div className="flex items-center justify-between"><div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-5 w-5" /></div></div>
              <p className="text-2xl font-bold mt-2">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
              {s.sub && <p className="text-xs text-gray-400">{s.sub}</p>}
            </CardContent></Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {[
            { label: "Register Patient", href: "/medical/patients", icon: UserCheck },
            { label: "Create Case", href: "/medical/cases", icon: Stethoscope },
            { label: "Manage Centers", href: "/medical/centers", icon: Building2 },
            { label: "Medicine Stock", href: "/medical/inventory", icon: Pill },
            { label: "Report Incident", href: "/medical/incidents", icon: AlertTriangle },
            { label: "Dispatch Ambulance", href: "/medical/ambulances", icon: Truck },
            { label: "Referrals", href: "/medical/referrals", icon: FileText },
            { label: "Certificates", href: "/medical/certificates", icon: FileText },
          ].map(a => (
            <Link key={a.label} href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}${a.href}`}>
              <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                <a.icon className="h-4 w-4 text-gray-500" /><span className="text-sm font-medium">{a.label}</span>
              </div>
            </Link>
          ))}
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-lg">Case Overview</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Open Cases</span><span className="font-semibold text-amber-600">{dash?.open_cases || 0}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Emergency Cases</span><span className="font-semibold text-red-600">{dash?.emergency_cases || 0}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Cases Today</span><span className="font-semibold text-blue-600">{dash?.cases_today || 0}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Pending Referrals</span><span className="font-semibold text-purple-600">{dash?.pending_referrals || 0}</span></div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-lg">Ambulance Status</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Total Ambulances</span><span className="font-semibold">{dash?.total_ambulances || 0}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Available</span><span className="font-semibold text-green-600">{dash?.available_ambulances || 0}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Active Trips</span><span className="font-semibold text-blue-600">{dash?.active_trips || 0}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Low Stock Items</span><span className="font-semibold text-red-600">{dash?.low_stock_items || 0}</span></div>
        </CardContent></Card>
      </div>
    </div>
  )
}
