import { getMyTenant, getMyBranding } from "@/lib/actions/saas-platform"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette, Globe, Image, Type, Eye } from "lucide-react"

export default async function WhiteLabelPage(props: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await props.params
  const [tenantRes, brandRes] = await Promise.all([getMyTenant(orgId), getMyBranding(orgId)])
  if (tenantRes.error) return <div className="text-red-500">{tenantRes.error}</div>
  const t = tenantRes.data!
  const b = brandRes.data

  if (false) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">White Label</h1>
          <p className="text-sm text-gray-500">Customize your tenant experience</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Palette className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">White Label not available</h3>
            <p className="text-sm text-gray-500 mb-6">Upgrade to a plan that includes White Label and Custom Domain features.</p>
            <Button>View Plans</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const colors = b ? [
    { label: "Primary", value: b.primary_color },
    { label: "Secondary", value: b.secondary_color },
    { label: "Accent", value: b.accent_color },
    { label: "Background", value: b.background_color },
    { label: "Text", value: b.text_color },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">White Label</h1>
        <p className="text-sm text-gray-500">Customize branding for your organization</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Palette className="h-4 w-4" /> Branding Colors</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {colors.length > 0 ? colors.map((c) => (
              <div key={c.label} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">{c.label}</span>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded border border-gray-200" style={{ backgroundColor: c.value }} />
                  <span className="text-xs font-mono">{c.value}</span>
                </div>
              </div>
            )) : <p className="text-sm text-gray-400">No branding configured</p>}
            {b?.font_family && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Font</span>
                <span className="text-sm font-medium">{b.font_family}</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Image className="h-4 w-4" /> Logos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Main Logo</p>
              {b?.logo_url ? <img src={b.logo_url} alt="Logo" className="h-12 object-contain" /> : <div className="h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">No logo uploaded</div>}
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Favicon</p>
              {b?.favicon_url ? <img src={b.favicon_url} alt="Favicon" className="h-8 w-8 object-contain" /> : <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">-</div>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Globe className="h-4 w-4" /> Custom Domain</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Custom domains are supported on eligible plans.</p>
            <Button variant="outline" size="sm">Configure Domain</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Eye className="h-4 w-4" /> Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: b?.background_color || "#ffffff", fontFamily: b?.font_family || "inherit" }}>
              <p className="text-sm font-bold" style={{ color: b?.primary_color || "#4F46E5" }}>FestPro</p>
              <p className="text-xs mt-1" style={{ color: b?.text_color || "#374151" }}>Powered by FestPro Enterprise Platform</p>
              <div className="flex gap-2 mt-2">
                <div className="px-2 py-1 text-xs text-white rounded" style={{ backgroundColor: b?.primary_color || "#4F46E5" }}>Button</div>
                <div className="px-2 py-1 text-xs text-white rounded" style={{ backgroundColor: b?.secondary_color || "#7C3AED" }}>Action</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
