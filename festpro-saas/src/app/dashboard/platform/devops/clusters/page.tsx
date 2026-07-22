import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, CheckCircle } from "lucide-react"

export default function ClustersPage() {
  const clusters = [
    { name: "Vercel Edge Network (Global)", provider: "Vercel CDN", status: "Healthy", nodes: "100+ Edge Locations" },
    { name: "Supabase DB Cluster (Primary)", provider: "AWS us-east-1", status: "Healthy", nodes: "PostgreSQL HA Cluster" }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clusters & Infrastructure</h1>
        <p className="text-sm text-gray-500">Monitor high availability clusters and edge infrastructure nodes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clusters.map((c) => (
          <Card key={c.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Server className="h-5 w-5 text-indigo-600" />
                {c.name}
              </CardTitle>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {c.status}
              </span>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p><strong>Provider:</strong> {c.provider}</p>
              <p><strong>Nodes:</strong> {c.nodes}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
