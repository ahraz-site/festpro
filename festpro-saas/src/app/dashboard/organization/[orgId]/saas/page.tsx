import { getMyTenant, getMySubscription, getMyInvoices, getMyResourceUsage } from "@/lib/actions/saas-platform"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, DollarSign, BarChart3, Activity } from "lucide-react"

export default async function SaasDashboardPage(props: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await props.params
  const [tenantRes, subRes, invRes] = await Promise.all([getMyTenant(orgId), getMySubscription(orgId), getMyInvoices(orgId)])
  if (tenantRes.error) return <div className="text-red-500">{tenantRes.error}</div>
  const t = tenantRes.data!
  const sub = subRes.data as any

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SaaS & Subscription</h1>
        <p className="text-sm text-gray-500">Manage your plan, billing, and branding</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Current Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{sub?.saas_subscription_plans?.plan_name || "No Plan"}</div>
            <p className="text-sm text-gray-500 capitalize">{sub?.status || "inactive"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${sub?.saas_subscription_plans?.price_monthly || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Billing Cycle</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold capitalize">{sub?.billing_cycle || "-"}</div>
            <p className="text-sm text-gray-500">{sub ? `${new Date(sub.current_period_start).toLocaleDateString()} - ${new Date(sub.current_period_end).toLocaleDateString()}` : ""}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tenant Status</CardTitle>
            <Activity className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold capitalize">{t.status}</div>
            <p className="text-sm text-gray-500">{t.is_trial ? "Trial" : "Active"}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500">Recent Invoices</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {invRes.data?.slice(0, 5).map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-mono">{inv.invoice_number}</p>
                  <p className="text-xs text-gray-500">{new Date(inv.invoice_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${Number(inv.total).toFixed(2)}</p>
                  <p className="text-xs capitalize text-gray-500">{inv.status}</p>
                </div>
              </div>
            )) || <p className="text-sm text-gray-400">No invoices</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500">Account Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Tenant Code</span><span className="font-mono">{t.tenant_code}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Max Users</span><span>{t.max_users}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Storage Limit</span><span>{t.max_storage_gb} GB</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Country</span><span>{t.country}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
