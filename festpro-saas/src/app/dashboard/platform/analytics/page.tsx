import { getTenants } from "@/lib/actions/saas-platform"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, CreditCard, Globe } from "lucide-react"

export default async function AnalyticsPage() {
  const result = await getTenants({ limit: 200 })
  if (result.error) return <div className="text-red-500">{result.error}</div>
  const tenants = result.data || []

  const byStatus: Record<string, number> = {}
  for (const t of tenants) { byStatus[t.status] = (byStatus[t.status] || 0) + 1 }

  const trial = tenants.filter(t => t.is_trial).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-sm text-gray-500">Tenant metrics and platform insights</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{tenants.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Trial</CardTitle>
            <CreditCard className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{trial}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{byStatus.active || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Suspended</CardTitle>
            <Globe className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{byStatus.suspended || 0}</div></CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium text-gray-500">Tenants by Status</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="text-sm capitalize font-medium w-24">{status}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(count / tenants.length) * 100}%` }} />
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
