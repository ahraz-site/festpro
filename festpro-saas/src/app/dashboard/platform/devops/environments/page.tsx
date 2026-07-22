import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, CheckCircle, RefreshCw, Plus } from "lucide-react"

export default function EnvironmentsPage() {
  const envs = [
    { name: "Production (Vercel + Supabase)", url: "https://festpro-alpha.vercel.app", status: "Active", region: "iad1 (Washington, D.C.)", uptime: "99.99%" },
    { name: "Staging (Preview Branch)", url: "https://festpro-staging.vercel.app", status: "Active", region: "iad1 (Washington, D.C.)", uptime: "100%" },
    { name: "Development (Local Server)", url: "http://localhost:3000", status: "Running", region: "Local Host", uptime: "100%" }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Environments Management</h1>
          <p className="text-sm text-gray-500">Configure and monitor deployment environments.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"><Plus className="h-4 w-4" /> Add Environment</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {envs.map((e) => (
          <Card key={e.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-600" />
                {e.name}
              </CardTitle>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {e.status}
              </span>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p><strong>URL:</strong> <a href={e.url} target="_blank" rel="noreferrer" className="text-indigo-600 underline">{e.url}</a></p>
              <p><strong>Region:</strong> {e.region}</p>
              <p><strong>Uptime:</strong> {e.uptime}</p>
              <div className="pt-3">
                <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5" /> Sync Environment
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
