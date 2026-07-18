import { getMyTenant, getMySubscription, getSubscriptionPlans } from "@/lib/actions/saas-platform"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SUBSCRIPTION_STATUSES, BILLING_CYCLES } from "@/config/saas-platform"
import { Check } from "lucide-react"

export default async function SubscriptionPage(props: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await props.params
  const [tenantRes, subRes, plansRes] = await Promise.all([getMyTenant(orgId), getMySubscription(orgId), getSubscriptionPlans({ is_active: true, is_public: true })])
  if (tenantRes.error) return <div className="text-red-500">{tenantRes.error}</div>
  const t = tenantRes.data!
  const sub = subRes.data as any
  const currentPlanId = sub?.plan_id

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
        <p className="text-sm text-gray-500">Current plan and available options</p>
      </div>
      {sub && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500">Current Subscription</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">{sub.saas_subscription_plans?.plan_name || "Unknown"}</p>
                <p className="text-gray-500">{sub.saas_subscription_plans?.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${SUBSCRIPTION_STATUSES.find(s => s.value === sub.status)?.color || ""}`}>{sub.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div><span className="text-gray-500">Billing Cycle</span><p className="font-medium capitalize">{BILLING_CYCLES.find(b => b.value === sub.billing_cycle)?.label || sub.billing_cycle}</p></div>
              <div><span className="text-gray-500">Period</span><p className="font-medium">{new Date(sub.current_period_start).toLocaleDateString()} - {new Date(sub.current_period_end).toLocaleDateString()}</p></div>
              <div><span className="text-gray-500">Auto Renew</span><p className="font-medium">{sub.auto_renew ? "Yes" : "No"}</p></div>
              <div><span className="text-gray-500">Price</span><p className="font-medium">${sub.saas_subscription_plans?.price_monthly}/mo</p></div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button size="sm" variant="outline">Change Plan</Button>
              <Button size="sm" variant="outline">Update Billing</Button>
              {sub.status !== "canceled" && <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Cancel Subscription</Button>}
            </div>
          </CardContent>
        </Card>
      )}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plansRes.data?.map((p) => (
            <div key={p.id} className={`bg-white border rounded-xl p-6 ${currentPlanId === p.id ? "border-indigo-300 ring-2 ring-indigo-200" : "border-gray-200"}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{p.plan_name}</h3>
                  <p className="text-sm text-gray-500">{p.description}</p>
                </div>
                {currentPlanId === p.id && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Current</span>}
              </div>
              <div className="mb-4">
                <p className="text-3xl font-bold">${p.price_monthly}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                <p className="text-sm text-gray-500">or ${p.price_yearly}/year</p>
              </div>
              <div className="space-y-2">
                <FeatureRow label="Festivals" value={p.max_festivals} />
                <FeatureRow label="Participants" value={p.max_participants?.toLocaleString()} />
                <FeatureRow label="Users" value={p.max_users} />
                <FeatureRow label="Storage" value={`${p.max_storage_gb} GB`} />
                <FeatureRow label="White Label" value={p.white_label_allowed ? "Yes" : "No"} />
                <FeatureRow label="Custom Domain" value={p.custom_domain_allowed ? "Yes" : "No"} />
                <FeatureRow label="API Access" value={p.api_access ? "Yes" : "No"} />
                <FeatureRow label="Priority Support" value={p.priority_support ? "Yes" : "No"} />
              </div>
              <Button className="w-full mt-6" variant={currentPlanId === p.id ? "outline" : "default"} disabled={currentPlanId === p.id}>
                {currentPlanId === p.id ? "Current Plan" : "Upgrade"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FeatureRow({ label, value }: { label: string; value: string | number | boolean | undefined | null }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium flex items-center gap-1">{value === "Yes" ? <Check className="h-3 w-3 text-green-500" /> : null}{value || "-"}</span>
    </div>
  )
}
