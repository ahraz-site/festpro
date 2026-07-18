import Link from "next/link"
import { getLocalizationDashboard } from "@/lib/actions/localization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Languages, FileKey, CheckCircle, Clock, Download, Upload, AlertTriangle, Eye, Mic } from "lucide-react"

export default async function LocalizationDashboardPage() {
  const result = await getLocalizationDashboard()
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const d = result.data

  const cards = [
    { label: "Languages", value: d.total_languages, sub: `${d.enabled_languages} enabled`, icon: Languages, color: "text-blue-600" },
    { label: "RTL Languages", value: d.rtl_languages, icon: Globe, color: "text-purple-600" },
    { label: "Language Packs", value: d.total_packs, icon: FileKey, color: "text-indigo-600" },
    { label: "Translation Keys", value: d.total_keys.toLocaleString(), icon: Globe, color: "text-cyan-600" },
    { label: "Approved", value: d.approved_keys.toLocaleString(), icon: CheckCircle, color: "text-green-600" },
    { label: "Missing", value: d.missing_keys.toLocaleString(), icon: AlertTriangle, color: d.missing_keys > 0 ? "text-red-600" : "text-gray-600" },
    { label: "Avg Coverage", value: `${d.average_coverage}%`, icon: Clock, color: d.average_coverage > 80 ? "text-green-600" : "text-amber-600" },
    { label: "Imports", value: d.total_imports, icon: Upload, color: "text-blue-600" },
    { label: "Exports", value: d.total_exports, icon: Download, color: "text-green-600" },
    { label: "Accessibility", value: d.accessibility_profiles, icon: Eye, color: "text-rose-600" },
  ]

  const sections = [
    { href: "/dashboard/platform/localization/languages", label: "Languages", desc: "Manage supported languages", icon: Languages },
    { href: "/dashboard/platform/localization/packs", label: "Language Packs", desc: "Translation packs & coverage", icon: FileKey },
    { href: "/dashboard/platform/localization/translations", label: "Translations", desc: "Translation editor & keys", icon: Globe },
    { href: "/dashboard/platform/localization/regional", label: "Regional Settings", desc: "Currency, date, time & number formats", icon: Download },
    { href: "/dashboard/platform/localization/imports", label: "Import/Export", desc: "Bulk translation management", icon: Upload },
    { href: "/dashboard/platform/localization/accessibility", label: "Accessibility", desc: "WCAG profiles & user preferences", icon: Eye },
    { href: "/dashboard/platform/localization/tts", label: "Text to Speech", desc: "Voice & audio preferences", icon: Mic },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Localization & Accessibility</h1>
        <p className="text-sm text-gray-500">Manage languages, translations, regional formats & accessibility settings</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{c.label}</CardTitle>
                <Icon className={`h-4 w-4 ${c.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.value}</div>
                {c.sub && <p className="text-xs text-gray-500">{c.sub}</p>}
              </CardContent>
            </Card>
          )
        })}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.href} href={s.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <div>
                    <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
