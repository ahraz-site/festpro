import { getSubscriptionPlanById, getPlanFeatures } from "@/lib/actions/saas-platform"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PlanDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const [planRes, featuresRes] = await Promise.all([getSubscriptionPlanById(id), getPlanFeatures(id)])
  if (planRes.error) return <div className="text-red-500">{planRes.error}</div>
  const p = planRes.data!

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white text-lg font-bold">{p.plan_name[0]}</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{p.plan_name}</h1>
              <p className="text-sm text-gray-500 font-mono">{p.plan_code}</p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">Edit Plan</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500">Pricing</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Monthly</span><span className="font-bold">${p.price_monthly}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Yearly</span><span className="font-bold">${p.price_yearly}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Interval</span><span>{p.plan_interval}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Trial Days</span><span>{p.trial_days}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500">Limits</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Organizations</span><span>{p.max_organizations}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Festivals</span><span>{p.max_festivals}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Participants</span><span>{p.max_participants?.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Users</span><span>{p.max_users}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Storage</span><span>{p.max_storage_gb} GB</span></div>
            <div className="flex justify-between"><span className="text-gray-500">SMS</span><span>{p.max_sms}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Emails</span><span>{p.max_emails}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">API Calls</span><span>{p.max_api_calls?.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">AI Credits</span><span>{p.max_ai_credits}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium text-gray-500">Features</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            {p.white_label_allowed && <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">White Label</span>}
            {p.custom_domain_allowed && <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">Custom Domain</span>}
            {p.priority_support && <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">Priority Support</span>}
            {p.api_access && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">API Access</span>}
            {p.advanced_reports && <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Advanced Reports</span>}
          </div>
          {featuresRes.data && featuresRes.data.length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-500"><th className="pb-2">Feature</th><th className="pb-2">Type</th><th className="pb-2">Value</th><th className="pb-2">Limit</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {featuresRes.data.map((f) => (
                    <tr key={f.id}><td className="py-2">{f.feature_name}</td><td className="py-2 text-gray-500">{f.feature_type}</td><td className="py-2">{f.feature_value || "-"}</td><td className="py-2">{f.max_limit ?? "-"}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
