import { getTenantById, getTenantSubscriptions, getInvoices, getCustomDomains, getTenantBranding } from "@/lib/actions/saas-platform"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TENANT_STATUSES, SUBSCRIPTION_STATUSES, INVOICE_STATUSES, DOMAIN_STATUSES } from "@/config/saas-platform"
import { Building2, Mail, Globe, Calendar, Users, HardDrive, Phone, MapPin } from "lucide-react"

export default async function TenantDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const [tenantRes, subsRes, invRes, domainsRes, brandRes] = await Promise.all([
    getTenantById(id), getTenantSubscriptions(id), getInvoices({ tenant_id: id }), getCustomDomains({ tenant_id: id }), getTenantBranding(id),
  ])
  if (tenantRes.error) return <div className="text-red-500">{tenantRes.error}</div>
  const t = tenantRes.data!

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-lg font-bold">{t.tenant_name[0]}</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.tenant_name}</h1>
              <p className="text-sm text-gray-500 font-mono">{t.tenant_code}</p>
            </div>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${TENANT_STATUSES.find(s => s.value === t.status)?.color || ""}`}>
          {t.status}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Building2 className="h-4 w-4" /> Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Slug</span><span className="font-mono">{t.slug}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Contact</span><span>{t.contact_email}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{t.contact_phone || "-"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Country</span><span>{t.country}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Timezone</span><span>{t.timezone}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Currency</span><span>{t.currency}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Users className="h-4 w-4" /> Limits</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Max Users</span><span>{t.max_users}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Max Storage</span><span>{t.max_storage_gb} GB</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Trial</span><span>{t.is_trial ? "Yes" : "No"}</span></div>
            {t.trial_ends_at && <div className="flex justify-between"><span className="text-gray-500">Trial Ends</span><span>{new Date(t.trial_ends_at).toLocaleDateString()}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Activated</span><span>{t.activated_at ? new Date(t.activated_at).toLocaleDateString() : "-"}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Calendar className="h-4 w-4" /> Subscriptions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {subsRes.data?.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{s.saas_subscription_plans?.plan_name || "Unknown Plan"}</p>
                  <p className="text-xs text-gray-500">{new Date(s.current_period_start).toLocaleDateString()} - {new Date(s.current_period_end).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SUBSCRIPTION_STATUSES.find(st => st.value === s.status)?.color || ""}`}>{s.status}</span>
              </div>
            )) || <p className="text-sm text-gray-400">No subscriptions</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Globe className="h-4 w-4" /> Domains</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {domainsRes.data?.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-mono">{d.domain}</p>
                  <p className="text-xs text-gray-500">SSL: {d.ssl_status}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DOMAIN_STATUSES.find(ds => ds.value === d.ssl_status)?.color || ""}`}>{d.is_verified ? "Verified" : "Pending"}</span>
              </div>
            )) || <p className="text-sm text-gray-400">No domains</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Mail className="h-4 w-4" /> Invoices</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {invRes.data?.slice(0, 5).map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-mono">{inv.invoice_number}</p>
                  <p className="text-xs text-gray-500">${Number(inv.total).toFixed(2)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${INVOICE_STATUSES.find(is => is.value === inv.status)?.color || ""}`}>{inv.status}</span>
              </div>
            )) || <p className="text-sm text-gray-400">No invoices</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
