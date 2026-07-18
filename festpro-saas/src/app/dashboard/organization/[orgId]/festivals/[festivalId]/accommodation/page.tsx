"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getAccommodationTransportDashboard, getAccommodationLocations, getRooms, getRoomAllocations } from "@/lib/actions/accommodation-transport"
import type { Module18DashboardData, AccommodationLocation } from "@/types/accommodation-transport"
import { ROOM_TYPES, ROOM_STATUSES } from "@/config/accommodation-transport"
import { Loader2, Building2, DoorOpen, Bed, MapPin, UserCheck, UserX, CheckCircle, BarChart3, TrendingUp, Users, Home } from "lucide-react"

export default function AccommodationDashboardPage() {
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
    { label: "Locations", value: dash?.total_locations || 0, icon: MapPin, color: "text-blue-600 bg-blue-50", href: "/accommodation/locations" },
    { label: "Buildings", value: dash?.total_buildings || 0, icon: Building2, color: "text-indigo-600 bg-indigo-50", href: "/accommodation/buildings" },
    { label: "Rooms", value: dash?.total_rooms || 0, icon: DoorOpen, color: "text-purple-600 bg-purple-50", href: "/accommodation/rooms" },
    { label: "Beds", value: dash?.total_beds || 0, icon: Bed, color: "text-pink-600 bg-pink-50", href: "/accommodation/beds" },
    { label: "Available Rooms", value: dash?.available_rooms || 0, icon: Home, color: "text-green-600 bg-green-50", href: "/accommodation/rooms", sub: `${dash?.occupancy_rate || 0}% occupancy` },
    { label: "Occupied Rooms", value: dash?.occupied_rooms || 0, icon: UserCheck, color: "text-amber-600 bg-amber-50", href: "/accommodation/rooms" },
    { label: "Occupancy Rate", value: `${dash?.occupancy_rate || 0}%`, icon: TrendingUp, color: "text-cyan-600 bg-cyan-50", href: "/accommodation/rooms" },
    { label: "Allocations", value: dash?.total_allocations || 0, icon: Users, color: "text-teal-600 bg-teal-50", href: "/accommodation/allocations" },
    { label: "Check-ins", value: dash?.checked_in || 0, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50", href: "/accommodation/check-in" },
    { label: "Check-outs", value: dash?.checked_out || 0, icon: UserX, color: "text-rose-600 bg-rose-50", href: "/accommodation/check-out" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accommodation & Transport</h1>
          <p className="text-sm text-gray-500 mt-1">Manage rooms, allocations, vehicles, drivers, and transport operations.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/accommodation/rooms`}>
            <Button variant="outline"><DoorOpen className="h-4 w-4 mr-1" /> Rooms</Button>
          </Link>
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/accommodation/allocations`}>
            <Button><Users className="h-4 w-4 mr-1" /> Allocations</Button>
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
              { label: "Rooms", href: "/accommodation/rooms", icon: DoorOpen },
              { label: "Allocations", href: "/accommodation/allocations", icon: Users },
              { label: "Check-in", href: "/accommodation/check-in", icon: UserCheck },
              { label: "Beds", href: "/accommodation/beds", icon: Bed },
              { label: "Vehicle", href: "/accommodation/vehicles", icon: Building2 },
              { label: "Drivers", href: "/accommodation/drivers", icon: Users },
              { label: "Trips", href: "/accommodation/trips", icon: MapPin },
              { label: "Transport Requests", href: "/accommodation/transport-requests", icon: BarChart3 },
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
          <CardHeader><CardTitle className="text-lg">Occupancy Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Occupied</span><span className="font-semibold">{dash?.occupied_rooms || 0} / {dash?.total_rooms || 0}</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${dash?.total_rooms ? ((dash.occupied_rooms / dash.total_rooms) * 100) : 0}%` }} />
            </div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Available</span><span className="font-semibold">{dash?.available_rooms || 0} / {dash?.total_rooms || 0}</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="h-2 rounded-full bg-green-500" style={{ width: `${dash?.total_rooms ? ((dash.available_rooms / dash.total_rooms) * 100) : 0}%` }} />
            </div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Occupancy Rate</span><span className="font-semibold text-blue-600">{dash?.occupancy_rate || 0}%</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Transport Overview</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="h-4 w-4 text-blue-500" />
              <span>{dash?.total_vehicles || 0} vehicles ({dash?.available_vehicles || 0} available)</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Users className="h-4 w-4 text-purple-500" />
              <span>{dash?.total_drivers || 0} drivers ({dash?.available_drivers || 0} available)</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-teal-500" />
              <span>{dash?.active_trips || 0} active trips, {dash?.pending_transport_requests || 0} pending requests</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <span>{dash?.pending_maintenance || 0} pending maintenance</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
