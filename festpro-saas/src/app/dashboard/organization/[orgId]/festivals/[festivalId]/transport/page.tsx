"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAccommodationTransportDashboard } from "@/lib/actions/accommodation-transport"
import type { Module18DashboardData } from "@/types/accommodation-transport"
import { Loader2, Truck, Users, Route, MapPin, Calendar, Fuel, Wrench, ClipboardList, TrendingUp, Bus, Car, UserCheck, Activity, CheckCircle } from "lucide-react"

export default function TransportDashboardPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [dash, setDash] = useState<Module18DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getAccommodationTransportDashboard(festivalId)
    setDash(res.data || null); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const stats = [
    { label: "Vehicles", value: dash?.total_vehicles || 0, icon: Truck, color: "text-blue-600 bg-blue-50", href: "/transport/vehicles", sub: `${dash?.available_vehicles || 0} available` },
    { label: "Drivers", value: dash?.total_drivers || 0, icon: Users, color: "text-green-600 bg-green-50", href: "/transport/drivers", sub: `${dash?.available_drivers || 0} available` },
    { label: "Total Trips", value: dash?.total_trips || 0, icon: Route, color: "text-purple-600 bg-purple-50", href: "/transport/trips", sub: `${dash?.active_trips || 0} active` },
    { label: "Completed Trips", value: dash?.completed_trips || 0, icon: CheckCircle, color: "text-teal-600 bg-teal-50", href: "/transport/trips" },
    { label: "Pending Requests", value: dash?.pending_transport_requests || 0, icon: ClipboardList, color: "text-amber-600 bg-amber-50", href: "/transport/requests" },
    { label: "Fuel Cost", value: `$${(dash?.total_fuel_cost || 0).toLocaleString()}`, icon: Fuel, color: "text-orange-600 bg-orange-50", href: "/transport/vehicles" },
    { label: "Maintenance", value: dash?.pending_maintenance || 0, icon: Wrench, color: "text-red-600 bg-red-50", href: "/transport/vehicles" },
    { label: "Vehicles In Use", value: dash?.in_use_vehicles || 0, icon: Car, color: "text-indigo-600 bg-indigo-50", href: "/transport/vehicles" },
    { label: "On Trip Drivers", value: dash?.on_trip_drivers || 0, icon: UserCheck, color: "text-cyan-600 bg-cyan-50", href: "/transport/drivers" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Transport Management</h1><p className="text-sm text-gray-500 mt-1">Vehicle fleet, driver management, trip scheduling and transport requests.</p></div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/transport/trips`}><Button variant="outline"><Calendar className="h-4 w-4 mr-1" /> Schedule Trip</Button></Link>
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/transport/requests`}><Button><ClipboardList className="h-4 w-4 mr-1" /> New Request</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
            { label: "Add Vehicle", href: "/transport/vehicles", icon: Truck },
            { label: "Add Driver", href: "/transport/drivers", icon: Users },
            { label: "Schedule Trip", href: "/transport/trips", icon: Calendar },
            { label: "Transport Request", href: "/transport/requests", icon: ClipboardList },
            { label: "Log Fuel", href: "/transport/vehicles", icon: Fuel },
            { label: "Maintenance", href: "/transport/vehicles", icon: Wrench },
          ].map(a => (
            <Link key={a.label} href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}${a.href}`}>
              <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                <a.icon className="h-4 w-4 text-gray-500" /><span className="text-sm font-medium">{a.label}</span>
              </div>
            </Link>
          ))}
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-lg">Fleet Status</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Available Vehicles</span><span className="font-semibold text-green-600">{dash?.available_vehicles || 0}/{dash?.total_vehicles || 0}</span></div>
          <div className="w-full bg-gray-200 rounded-full h-2"><div className="h-2 rounded-full bg-green-500" style={{ width: `${dash?.total_vehicles ? ((dash.available_vehicles / dash.total_vehicles) * 100) : 0}%` }} /></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Available Drivers</span><span className="font-semibold text-blue-600">{dash?.available_drivers || 0}/{dash?.total_drivers || 0}</span></div>
          <div className="w-full bg-gray-200 rounded-full h-2"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${dash?.total_drivers ? ((dash.available_drivers / dash.total_drivers) * 100) : 0}%` }} /></div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-lg">Trip Overview</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm"><Activity className="h-4 w-4 text-blue-500" /><span>{dash?.active_trips || 0} active trips</span></div>
          <div className="flex items-center gap-3 text-sm"><CheckCircle className="h-4 w-4 text-green-500" /><span>{dash?.completed_trips || 0} completed trips</span></div>
          <div className="flex items-center gap-3 text-sm"><ClipboardList className="h-4 w-4 text-amber-500" /><span>{dash?.pending_transport_requests || 0} pending requests</span></div>
        </CardContent></Card>
      </div>
    </div>
  )
}
