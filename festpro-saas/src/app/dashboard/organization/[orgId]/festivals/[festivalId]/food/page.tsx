"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getFoodCateringDashboard } from "@/lib/actions/food-catering"
import type { Module19DashboardData } from "@/types/food-catering"
import { Loader2, Utensils, ChefHat, ClipboardList, QrCode, ShoppingCart, Building2, Truck, Package, Trash2, Users, Star, Clock, CalendarDays, Activity, DollarSign } from "lucide-react"

export default function FoodDashboardPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [dash, setDash] = useState<Module19DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getFoodCateringDashboard(festivalId)
    setDash(res.data || null); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const stats = [
    { label: "Kitchens", value: dash?.total_kitchens || 0, icon: ChefHat, color: "text-orange-600 bg-orange-50", href: "/food/kitchens", sub: `${dash?.active_kitchens || 0} active` },
    { label: "Staff", value: dash?.total_staff || 0, icon: Users, color: "text-blue-600 bg-blue-50", href: "/food/kitchens" },
    { label: "Today's Sessions", value: dash?.today_sessions || 0, icon: Clock, color: "text-purple-600 bg-purple-50", href: "/food/sessions", sub: `${dash?.active_sessions || 0} active` },
    { label: "Menus", value: dash?.total_menus || 0, icon: ClipboardList, color: "text-indigo-600 bg-indigo-50", href: "/food/menus", sub: `${dash?.published_menus || 0} published` },
    { label: "Meals Served", value: dash?.meals_served_today || 0, icon: Utensils, color: "text-green-600 bg-green-50", href: "/food/distribution" },
    { label: "Coupons", value: dash?.total_coupons || 0, icon: QrCode, color: "text-cyan-600 bg-cyan-50", href: "/food/coupons", sub: `${dash?.active_coupons || 0} active` },
    { label: "Dining Halls", value: dash?.total_dining_halls || 0, icon: Building2, color: "text-teal-600 bg-teal-50", href: "/food/dining", sub: `${dash?.open_halls || 0} open` },
    { label: "Suppliers", value: dash?.total_suppliers || 0, icon: Truck, color: "text-amber-600 bg-amber-50", href: "/food/suppliers" },
    { label: "Avg Rating", value: dash?.average_rating ? dash.average_rating.toFixed(1) : "—", icon: Star, color: "text-yellow-600 bg-yellow-50", href: "/food/menus" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Food & Catering</h1><p className="text-sm text-gray-500 mt-1">Kitchen operations, meal planning, coupon management and distribution.</p></div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/food/sessions`}><Button variant="outline"><CalendarDays className="h-4 w-4 mr-1" /> Schedule</Button></Link>
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/food/coupons`}><Button><QrCode className="h-4 w-4 mr-1" /> New Coupon</Button></Link>
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
            { label: "Manage Kitchen", href: "/food/kitchens", icon: ChefHat },
            { label: "Schedule Meal", href: "/food/sessions", icon: CalendarDays },
            { label: "Create Menu", href: "/food/menus", icon: ClipboardList },
            { label: "Issue Coupon", href: "/food/coupons", icon: QrCode },
            { label: "Distribution", href: "/food/distribution", icon: ShoppingCart },
            { label: "Dining Halls", href: "/food/dining", icon: Building2 },
            { label: "Inventory", href: "/food/inventory", icon: Package },
            { label: "Food Waste", href: "/food/waste", icon: Trash2 },
          ].map(a => (
            <Link key={a.label} href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}${a.href}`}>
              <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                <a.icon className="h-4 w-4 text-gray-500" /><span className="text-sm font-medium">{a.label}</span>
              </div>
            </Link>
          ))}
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-lg">Today's Overview</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Meals Served Today</span><span className="font-semibold text-green-600">{dash?.meals_served_today || 0}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Active Sessions</span><span className="font-semibold text-purple-600">{dash?.active_sessions || 0}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Open Distribution Points</span><span className="font-semibold text-blue-600">{dash?.open_points || 0}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Pending Diet Requests</span><span className="font-semibold text-amber-600">{dash?.pending_diet_requests || 0}</span></div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle className="text-lg">Waste & Feedback</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm"><Trash2 className="h-4 w-4 text-red-500" /><span>{dash?.total_waste_logs || 0} waste records</span></div>
          <div className="flex items-center gap-3 text-sm"><DollarSign className="h-4 w-4 text-red-500" /><span>${(dash?.total_waste_cost || 0).toFixed(2)} total waste cost</span></div>
          <div className="flex items-center gap-3 text-sm"><Star className="h-4 w-4 text-yellow-500" /><span>{dash?.total_meal_feedback || 0} reviews · {dash?.average_rating ? dash.average_rating.toFixed(1) : "N/A"} avg</span></div>
        </CardContent></Card>
      </div>
    </div>
  )
}
