import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CheckCircle } from "lucide-react"

export default function BuildsPage() {
  const builds = [
    { id: "BUILD-901", project: "festpro-saas", status: "Clean", duration: "12.4s", type: "Next.js Turbopack" },
    { id: "BUILD-900", project: "festpro-saas", status: "Clean", duration: "11.7s", type: "Next.js Turbopack" },
    { id: "BUILD-899", project: "festpro-saas", status: "Clean", duration: "12.8s", type: "Next.js Turbopack" }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Build History</h1>
        <p className="text-sm text-gray-500">Monitor compilation and static asset generation performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {builds.map((b) => (
          <Card key={b.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600" />
                {b.id}
              </CardTitle>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {b.status}
              </span>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p><strong>Project:</strong> {b.project}</p>
              <p><strong>Engine:</strong> {b.type}</p>
              <p><strong>Build Time:</strong> {b.duration}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
