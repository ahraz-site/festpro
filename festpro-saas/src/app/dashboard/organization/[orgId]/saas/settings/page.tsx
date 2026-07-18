import { getMyTenant } from "@/lib/actions/saas-platform"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Mail, Phone, MapPin, Globe, Clock } from "lucide-react"

export default async function SaasSettingsPage(props: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await props.params
  const tenantRes = await getMyTenant(orgId)
  if (tenantRes.error) return <div className="text-red-500">{tenantRes.error}</div>
  const t = tenantRes.data!

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SaaS Settings</h1>
        <p className="text-sm text-gray-500">Manage your tenant configuration</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Building2 className="h-4 w-4" /> General</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <div><p className="font-medium">Tenant Name</p><p className="text-gray-500">{t.tenant_name}</p></div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <div><p className="font-medium">Tenant Code</p><p className="text-gray-500 font-mono">{t.tenant_code}</p></div>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <div><p className="font-medium">Status</p><p className="text-gray-500 capitalize">{t.status}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Mail className="h-4 w-4" /> Contact</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <div><p className="font-medium">Email</p><p className="text-gray-500">{t.contact_email}</p></div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <div><p className="font-medium">Phone</p><p className="text-gray-500">{t.contact_phone || "Not set"}</p></div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            {t.address_line1 && (
              <div className="p-2 bg-gray-50 rounded-lg">
                <p className="font-medium">Address</p>
                <p className="text-gray-500">{t.address_line1}{t.address_line2 ? `, ${t.address_line2}` : ""}</p>
                <p className="text-gray-500">{t.city}{t.state ? `, ${t.state}` : ""} {t.postal_code}</p>
                <p className="text-gray-500">{t.country}</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Globe className="h-4 w-4" /> Localization</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Country</span><span>{t.country}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Currency</span><span>{t.currency}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Timezone</span><span>{t.timezone}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Locale</span><span>{t.locale}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Clock className="h-4 w-4" /> Plan Info</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Max Users</span><span>{t.max_users}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Max Storage</span><span>{t.max_storage_gb} GB</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Trial</span><span>{t.is_trial ? "Yes" : "No"}</span>
            </div>
            {t.trial_ends_at && (
              <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Trial Ends</span><span>{new Date(t.trial_ends_at).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
