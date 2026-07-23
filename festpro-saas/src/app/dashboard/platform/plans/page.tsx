import Link from "next/link"
import { getSubscriptionPlans } from "@/lib/actions/saas-platform"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function PlansPage() {
  const result = await getSubscriptionPlans()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-sm text-gray-500">{result.total} plans</p>
        </div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Plan</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {result.data?.map((p) => (
          <Link key={p.id} href={`/dashboard/platform/plans/${p.id}`} className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{p.plan_name}</h3>
                <p className="text-sm text-gray-500 font-mono">{p.plan_code}</p>
              </div>
              {!p.is_active && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Inactive</span>}
            </div>
            <div className="space-y-1 mb-4">
              <p className="text-2xl font-bold">${p.price_monthly}<span className="text-sm font-normal text-gray-500">/mo</span></p>
              <p className="text-sm text-gray-500">or ${p.price_yearly}/yr</p>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Organizations</span><span>{p.max_organizations}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Festivals</span><span>{p.max_festivals}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Participants</span><span>{p.max_participants?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Users</span><span>{p.max_users}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Storage</span><span>{p.max_storage_gb} GB</span></div>
            </div>
            {p.white_label_allowed && <div className="mt-3 flex gap-1.5 flex-wrap"><span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">White Label</span></div>}
            {p.custom_domain_allowed && <div className="mt-1 flex gap-1.5 flex-wrap"><span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">Custom Domain</span></div>}
            {p.priority_support && <div className="mt-1 flex gap-1.5 flex-wrap"><span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Priority Support</span></div>}
          </Link>
        ))}
      </div>
    </div>
  )
}
