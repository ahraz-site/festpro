import { getAccessibilityProfiles } from "@/lib/actions/localization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ACCESSIBILITY_LEVELS, COLOR_BLIND_MODES } from "@/config/localization"
import { Eye, CheckCircle, Shield } from "lucide-react"

export default async function AccessibilityPage() {
  const result = await getAccessibilityProfiles()
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const profiles = result.data

  const wcagGuidelines = [
    { id: "1.1.1", label: "Non-text Content", level: "A" },
    { id: "1.2.1", label: "Audio-only and Video-only", level: "A" },
    { id: "1.3.1", label: "Info and Relationships", level: "A" },
    { id: "1.4.1", label: "Use of Color", level: "A" },
    { id: "1.4.3", label: "Contrast (Minimum)", level: "AA" },
    { id: "2.1.1", label: "Keyboard", level: "A" },
    { id: "2.2.1", label: "Timing Adjustable", level: "A" },
    { id: "2.4.1", label: "Bypass Blocks", level: "A" },
    { id: "2.4.7", label: "Focus Visible", level: "AA" },
    { id: "3.1.1", label: "Language of Page", level: "A" },
    { id: "3.3.2", label: "Labels or Instructions", level: "A" },
    { id: "4.1.2", label: "Name, Role, Value", level: "A" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Accessibility</h1>
        <p className="text-sm text-gray-500">WCAG compliance profiles and accessibility settings</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p) => {
          const lvlCfg = ACCESSIBILITY_LEVELS.find((l) => l.value === p.level)
          return (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <CardTitle className="text-sm font-medium">{p.profile_name}</CardTitle>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${lvlCfg?.color ?? ""}`}>{lvlCfg?.label ?? p.level}</span>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {p.is_default && <span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-600">Default</span>}
                <div className="grid grid-cols-2 gap-1">
                  {wcagGuidelines.slice(0, 8).map((g) => (
                    <div key={g.id} className="flex items-center gap-1 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-gray-600">{g.id}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
        {profiles.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-gray-400">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No accessibility profiles configured</p>
            </CardContent>
          </Card>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">WCAG 2.2 AA Compliance Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {wcagGuidelines.map((g) => (
              <div key={g.id} className="flex items-center gap-2 p-2 rounded border text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                <div>
                  <span className="font-mono text-xs text-gray-500">{g.id}</span>
                  <p className="text-xs text-gray-700">{g.label}</p>
                </div>
                <span className={`ml-auto px-1.5 py-0.5 rounded text-xs font-medium ${
                  g.level === "A" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                }`}>{g.level}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
