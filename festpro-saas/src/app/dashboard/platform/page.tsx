import { getSaasPlatformDashboard } from "@/lib/actions/saas-platform"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, CreditCard, DollarSign, Globe, Key, BarChart3, Users, AlertTriangle } from "lucide-react"
import { TENANT_STATUSES } from "@/config/saas-platform"

export default async function PlatformDashboardPage() {
  const result = await getSaasPlatformDashboard()
  if (result.error) return <div className="text-red-500">{result.error}</div>
  const d = result.data!

  const cards = [
    { label: "Total Tenants", value: d.total_tenants, icon: Building2, color: "text-blue-600" },
    { label: "Active", value: d.active_tenants, icon: Users, color: "text-green-600" },
    { label: "Trial", value: d.trial_tenants, icon: AlertTriangle, color: "text-amber-600" },
    { label: "Suspended", value: d.suspended_tenants, icon: AlertTriangle, color: "text-red-600" },
    { label: "Plans", value: d.total_plans, icon: CreditCard, color: "text-purple-600" },
    { label: "Subscriptions", value: d.total_subscriptions, icon: DollarSign, color: "text-indigo-600" },
    { label: "Total Revenue", value: `$${d.total_revenue.toLocaleString()}`, icon: BarChart3, color: "text-green-600" },
    { label: "Domains", value: `${d.verified_domains}/${d.total_domains}`, icon: Globe, color: "text-cyan-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Administration</h1>
        <p className="text-sm text-gray-500">Manage all tenants, plans, billing and platform settings</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{c.label}</CardTitle>
                <Icon className={`h-4 w-4 ${c.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
