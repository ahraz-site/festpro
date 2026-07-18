import { getMyTenant } from "@/lib/actions/saas-platform"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RESOURCE_TYPES } from "@/config/saas-platform"
import { Package, Users, HardDrive, Globe } from "lucide-react"

export default async function UsagePage(props: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await props.params
  const tenantRes = await getMyTenant(orgId)
  if (tenantRes.error) return <div className="text-red-500">{tenantRes.error}</div>
  const t = tenantRes.data!

  const usageItems = [
    { label: "Users Used", current: 0, limit: t.max_users, icon: Users, color: "text-blue-600" },
    { label: "Storage Used", current: 0, limit: t.max_storage_gb, unit: "GB", icon: HardDrive, color: "text-green-600" },
    { label: "Festivals", current: 0, limit: t.max_users, icon: Globe, color: "text-purple-600" },
    { label: "API Calls", current: 0, limit: t.max_users, icon: Package, color: "text-amber-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resource Usage</h1>
        <p className="text-sm text-gray-500">Monitor your plan limits and consumption</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {usageItems.map((item) => {
          const Icon = item.icon
          const pct = item.limit > 0 ? Math.min(100, Math.round((item.current / item.limit) * 100)) : 0
          return (
            <Card key={item.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Icon className={`h-4 w-4 ${item.color}`} /> {item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-2xl font-bold">{item.current}</span>
                    <span className="text-gray-500"> / {item.limit} {item.unit || ""}</span>
                  </div>
                  <span className="text-sm font-medium">{pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-indigo-600"}`} style={{ width: `${pct}%` }} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
