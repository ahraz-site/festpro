import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, CheckCircle } from "lucide-react"

export default function ReleasesPage() {
  const releases = [
    { tag: "v1.2.0 (Commercial Production)", date: "2026-07-23", status: "Current Stable Release", notes: "Multi-tenant SaaS Platform with Auth Auto-healing and RLS" },
    { tag: "v1.1.0 (Beta Launch)", date: "2026-07-15", status: "Archived", notes: "Initial festival & participant management release" }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Releases</h1>
        <p className="text-sm text-gray-500">Release versions and production changelogs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {releases.map((r) => (
          <Card key={r.tag}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                {r.tag}
              </CardTitle>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {r.status}
              </span>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p><strong>Release Date:</strong> {r.date}</p>
              <p><strong>Highlights:</strong> {r.notes}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
