"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getInventoryDashboard } from "@/lib/actions/inventory"
import type { Module17DashboardData } from "@/types/inventory"
import { Loader2, Warehouse, MapPin, Package, DollarSign, AlertTriangle, ShoppingCart, FileText, Truck, Building2, Wrench, ClipboardCheck, BarChart3, TrendingUp, Activity } from "lucide-react"

export default function InventoryDashboardPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [dash, setDash] = useState<Module17DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getInventoryDashboard(festivalId)
    setDash(res.data || null); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const stats = [
    { label: "Warehouses", value: dash?.total_warehouses || 0, icon: Warehouse, color: "text-blue-600 bg-blue-50", href: "/inventory/warehouses" },
    { label: "Locations", value: dash?.total_locations || 0, icon: MapPin, color: "text-teal-600 bg-teal-50", href: "/inventory/warehouses" },
    { label: "Items", value: dash?.total_items || 0, icon: Package, color: "text-purple-600 bg-purple-50", href: "/inventory/items", sub: `${dash?.low_stock_items || 0} low stock` },
    { label: "Stock Value", value: `$${(dash?.total_stock_value || 0).toLocaleString()}`, icon: DollarSign, color: "text-green-600 bg-green-50", href: "/inventory/items" },
    { label: "Out of Stock", value: dash?.out_of_stock_items || 0, icon: AlertTriangle, color: "text-red-600 bg-red-50", href: "/inventory/items" },
    { label: "Purchase Requests", value: dash?.total_purchase_requests || 0, icon: ShoppingCart, color: "text-amber-600 bg-amber-50", href: "/inventory/purchase", sub: `${dash?.pending_prs || 0} pending` },
    { label: "Purchase Orders", value: dash?.total_purchase_orders || 0, icon: FileText, color: "text-indigo-600 bg-indigo-50", href: "/inventory/purchase", sub: `${dash?.pending_pos || 0} pending` },
    { label: "Vendors", value: dash?.total_vendors || 0, icon: Truck, color: "text-cyan-600 bg-cyan-50", href: "/inventory/vendors", sub: `${dash?.active_vendors || 0} active` },
    { label: "Assets", value: dash?.total_assets || 0, icon: Building2, color: "text-rose-600 bg-rose-50", href: "/inventory/assets", sub: `${dash?.assigned_assets || 0} assigned` },
    { label: "Maintenance", value: dash?.under_maintenance || 0, icon: Wrench, color: "text-orange-600 bg-orange-50", href: "/inventory/maintenance" },
    { label: "Audits", value: dash?.total_audits || 0, icon: ClipboardCheck, color: "text-violet-600 bg-violet-50", href: "/inventory/audit", sub: `${dash?.in_progress_audits || 0} in progress` },
    { label: "Pending Adj.", value: dash?.pending_adjustments || 0, icon: Activity, color: "text-yellow-600 bg-yellow-50", href: "/inventory/transactions" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory & Assets</h1>
          <p className="text-sm text-gray-500 mt-1">Enterprise inventory management, procurement, vendor management, and asset tracking.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/inventory/items`}>
            <Button variant="outline"><Package className="h-4 w-4 mr-1" /> Add Item</Button>
          </Link>
          <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/inventory/purchase`}>
            <Button><ShoppingCart className="h-4 w-4 mr-1" /> New Purchase</Button>
          </Link>
        </div>
      </div>

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
                {s.sub && <p className="text-xs text-gray-400">{s.sub}</p>}
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
              { label: "Add Warehouse", href: "/inventory/warehouses", icon: Warehouse },
              { label: "Add Item", href: "/inventory/items", icon: Package },
              { label: "New PR", href: "/inventory/purchase", icon: ShoppingCart },
              { label: "New PO", href: "/inventory/purchase", icon: FileText },
              { label: "Add Vendor", href: "/inventory/vendors", icon: Truck },
              { label: "Add Asset", href: "/inventory/assets", icon: Building2 },
              { label: "Record Transfer", href: "/inventory/transactions", icon: TrendingUp },
              { label: "New Audit", href: "/inventory/audit", icon: ClipboardCheck },
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
          <CardHeader><CardTitle className="text-lg">Stock Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Low Stock Items</span><span className="font-semibold text-amber-600">{dash?.low_stock_items || 0}</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2"><div className="h-2 rounded-full bg-amber-500" style={{ width: `${dash?.total_items ? Math.min((dash.low_stock_items / dash.total_items) * 100, 100) : 0}%` }} /></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Out of Stock</span><span className="font-semibold text-red-600">{dash?.out_of_stock_items || 0}</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2"><div className="h-2 rounded-full bg-red-500" style={{ width: `${dash?.total_items ? Math.min((dash.out_of_stock_items / dash.total_items) * 100, 100) : 0}%` }} /></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Pending PRs</span><span className="font-semibold">{dash?.pending_prs || 0}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Pending POs</span><span className="font-semibold">{dash?.pending_pos || 0}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Asset Overview</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="h-4 w-4 text-rose-500" />
              <span>{dash?.total_assets || 0} total assets</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Package className="h-4 w-4 text-blue-500" />
              <span>{dash?.assigned_assets || 0} currently assigned</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Wrench className="h-4 w-4 text-orange-500" />
              <span>{dash?.under_maintenance || 0} under maintenance</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Stock value: ${(dash?.total_stock_value || 0).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
