import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, CheckCircle } from "lucide-react"

export default function SecretsPage() {
  const secrets = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", env: "Production & Staging", status: "Configured & Encrypted" },
    { key: "SUPABASE_SERVICE_ROLE_KEY", env: "Production Server", status: "Configured & Encrypted" },
    { key: "NEXT_PUBLIC_APP_URL", env: "Production (https://festpro.ahraz.site)", status: "Configured" }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Secrets & Key Vault</h1>
        <p className="text-sm text-gray-500">Securely managed environment variables and API keys.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {secrets.map((s) => (
          <Card key={s.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-600" />
                {s.key}
              </CardTitle>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Secured
              </span>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p><strong>Environment:</strong> {s.env}</p>
              <p><strong>Status:</strong> {s.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
