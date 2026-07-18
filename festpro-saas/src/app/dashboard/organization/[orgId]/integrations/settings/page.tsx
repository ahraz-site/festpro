import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Globe, Clock, Shield, Bell } from "lucide-react"

export default async function IntegrationSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integration Settings</h1>
        <p className="text-sm text-gray-500">Global configuration for integrations, webhooks and API</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Globe className="h-4 w-4" /> API Settings</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Default Rate Limit</span>
              <span className="font-medium">1,000 req/hour</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Max Payload Size</span>
              <span className="font-medium">10 MB</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">API Version</span>
              <span className="font-medium">v1.0</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Clock className="h-4 w-4" /> Webhook Defaults</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Max Retries</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Retry Interval</span>
              <span className="font-medium">300 seconds</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Timeout</span>
              <span className="font-medium">30 seconds</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Shield className="h-4 w-4" /> Security</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Signature Header</span>
              <span className="font-mono text-xs">X-Webhook-Signature</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">OAuth Token Expiry</span>
              <span className="font-medium">1 hour</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Refresh Token Expiry</span>
              <span className="font-medium">30 days</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Failed Webhook Alert</span>
              <span className="text-green-600 font-medium">Enabled</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">API Key Expiry Warning</span>
              <span className="text-green-600 font-medium">7 days before</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-500">Sync Failure Alert</span>
              <span className="text-green-600 font-medium">Enabled</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
