import { getLanguages } from "@/lib/actions/localization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SUPPORTED_LANGUAGES } from "@/config/localization"
import { Languages, CheckCircle, XCircle } from "lucide-react"

export default async function LanguagesPage() {
  const result = await getLanguages()
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const languages = result.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Languages</h1>
        <p className="text-sm text-gray-500">Manage supported languages and locale settings</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {languages.map((lang) => {
          const cfg = SUPPORTED_LANGUAGES.find((s) => s.code === lang.code)
          return (
            <Card key={lang.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{lang.flag_emoji || cfg?.name[0]}</span>
                  <div>
                    <CardTitle className="text-sm font-medium">{lang.name}</CardTitle>
                    <p className="text-xs text-gray-500">{lang.native_name || lang.locale}</p>
                  </div>
                </div>
                {lang.is_enabled ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Code</span><span className="font-mono">{lang.code}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Locale</span><span>{lang.locale}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Script</span><span className="capitalize">{lang.script}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Direction</span><span className={lang.is_rtl ? "text-purple-600 font-medium" : ""}>{lang.direction.toUpperCase()}</span></div>
                {lang.is_default && <span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-600">Default</span>}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
