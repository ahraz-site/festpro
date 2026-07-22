import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Container, CheckCircle } from "lucide-react"

export default function ContainersPage() {
  const containers = [
    { name: "Next.js Application Container", image: "festpro/app:v1.2.0", status: "Running", memory: "256 MB / 8 GB" },
    { name: "Supabase GoTrue Auth Service", image: "supabase/gotrue:v2.158", status: "Running", memory: "128 MB" },
    { name: "PostgREST API Server", image: "postgrest/postgrest:v12.2", status: "Running", memory: "180 MB" }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Containers</h1>
        <p className="text-sm text-gray-500">Container services and resource allocations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {containers.map((c) => (
          <Card key={c.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Container className="h-5 w-5 text-indigo-600" />
                {c.name}
              </CardTitle>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {c.status}
              </span>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p><strong>Image:</strong> <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{c.image}</code></p>
              <p><strong>Memory Usage:</strong> {c.memory}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
