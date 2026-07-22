import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GitBranch, CheckCircle, Play } from "lucide-react"

export default function PipelinesPage() {
  const pipelines = [
    { name: "Continuous Integration & TypeCheck", branch: "master", status: "Success", duration: "18.9s", trigger: "Git Push" },
    { name: "Production Deployment Pipeline", branch: "master", status: "Success", duration: "42.1s", trigger: "Vercel Webhook" },
    { name: "Database Schema Auto-Migration", branch: "master", status: "Active", duration: "5.2s", trigger: "Supabase CLI" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CI/CD Pipelines</h1>
          <p className="text-sm text-gray-500">View and run automated build and deployment pipelines.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"><Play className="h-4 w-4" /> Run Pipeline</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pipelines.map((p) => (
          <Card key={p.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-indigo-600" />
                {p.name}
              </CardTitle>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {p.status}
              </span>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p><strong>Branch:</strong> {p.branch}</p>
              <p><strong>Trigger:</strong> {p.trigger}</p>
              <p><strong>Duration:</strong> {p.duration}</p>
              <div className="pt-3">
                <Button variant="outline" size="sm" className="w-full">View Run Logs</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
