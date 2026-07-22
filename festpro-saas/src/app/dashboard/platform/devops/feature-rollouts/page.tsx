import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flag, CheckCircle } from "lucide-react"

export default function FeatureRolloutsPage() {
  const flags = [
    { flag: "AI_COPILOT_GENERATION", rollout: "100% Active", status: "Enabled" },
    { flag: "WHITE_LABEL_CUSTOM_DOMAINS", rollout: "100% Active", status: "Enabled" },
    { flag: "AUTO_HEALING_PROFILES", rollout: "100% Active", status: "Enabled" }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feature Flags & Rollouts</h1>
        <p className="text-sm text-gray-500">Manage real-time feature flags across production and staging environments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {flags.map((f) => (
          <Card key={f.flag}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Flag className="h-5 w-5 text-indigo-600" />
                {f.flag}
              </CardTitle>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {f.status}
              </span>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p><strong>Rollout Percentage:</strong> {f.rollout}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
