import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Rocket, CheckCircle, RefreshCw } from "lucide-react"

export default function DeploymentsPage() {
  const deployments = [
    { title: "Production Deployment - Commit ebbc0b6", env: "Production", commit: "ebbc0b6", status: "Ready", time: "Just now" },
    { title: "Production Deployment - Commit fa27815", env: "Production", commit: "fa27815", status: "Promoted", time: "10 mins ago" },
    { title: "Staging Preview - Commit e1d9dc6", env: "Staging", commit: "e1d9dc6", status: "Active", time: "1 hour ago" }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deployments</h1>
          <p className="text-sm text-gray-500">Track and manage Vercel and cloud deployments.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Refresh Deployments</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {deployments.map((d) => (
          <Card key={d.commit}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Rocket className="h-5 w-5 text-indigo-600" />
                {d.env}
              </CardTitle>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {d.status}
              </span>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p><strong>Commit:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{d.commit}</code></p>
              <p><strong>Info:</strong> {d.title}</p>
              <p><strong>Timestamp:</strong> {d.time}</p>
              <div className="pt-3">
                <Button variant="outline" size="sm" className="w-full">Inspect Logs</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
