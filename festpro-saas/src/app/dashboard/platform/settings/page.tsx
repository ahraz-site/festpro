import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DEFAULT_PLANS, PAYMENT_GATEWAY_PROVIDERS } from "@/config/saas-platform"

export default async function PlatformSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-sm text-gray-500">Global platform configuration</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500">Default Plans</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {DEFAULT_PLANS.map((p) => (
              <div key={p.plan_code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{p.plan_name}</p>
                  <p className="text-xs text-gray-500">{p.max_participants?.toLocaleString()} participants, {p.max_storage_gb}GB</p>
                </div>
                <p className="text-sm font-bold">${p.price_monthly}<span className="text-xs text-gray-500 font-normal">/mo</span></p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500">Payment Gateways</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {PAYMENT_GATEWAY_PROVIDERS.map((g) => (
              <div key={g.value} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">{g.label}</span>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Not Configured</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500">Currency Settings</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Default Currency</span><span className="font-medium">USD</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax Rate</span><span className="font-medium">0%</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Invoice Prefix</span><span className="font-mono">INV</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment Terms</span><span className="font-medium">30 days</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500">Branding</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Platform Name</span><span className="font-medium">FestPro</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Support Email</span><span className="font-medium">support@festpro.com</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Support URL</span><span className="text-indigo-600">https://festpro.com/support</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
