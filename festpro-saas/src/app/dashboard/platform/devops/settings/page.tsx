import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, CheckCircle } from "lucide-react"

export default function DevOpsSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">DevOps Settings</h1>
        <p className="text-sm text-gray-500">Configure deployment hooks, build timeouts, and webhook integrations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600" />
            Global Infrastructure Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-600">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <p className="font-medium text-gray-900">Auto-Deploy on Git Push to Master</p>
              <p className="text-xs text-gray-500">Automatically trigger production build on Vercel</p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-medium flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Enabled
            </span>
          </div>

          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <p className="font-medium text-gray-900">Turbopack Build Cache</p>
              <p className="text-xs text-gray-500">Speed up Next.js compilation using remote cache</p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-medium flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Active
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
