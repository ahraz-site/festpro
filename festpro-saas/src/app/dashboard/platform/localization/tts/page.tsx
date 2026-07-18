import { getTtsSettings, getLanguages } from "@/lib/actions/localization"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Volume2, Speaker } from "lucide-react"

export default async function TtsPage() {
  const [ttsRes, langsRes] = await Promise.all([getTtsSettings(), getLanguages()])
  if ("error" in ttsRes) return <div className="text-red-500">{ttsRes.error}</div>
  if ("error" in langsRes) return <div className="text-red-500">{langsRes.error}</div>
  const settings = ttsRes.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Text to Speech</h1>
        <p className="text-sm text-gray-500">Voice settings and audio preferences</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Mic className="h-4 w-4" /> Voice Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!settings && <p className="text-sm text-gray-400">No TTS settings configured. Use the form below.</p>}
            {settings && (
              <>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Voice</span><span className="capitalize">{settings.voice}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Speed</span><span>{settings.speed}x</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Pitch</span><span>{settings.pitch}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Volume</span><span>{settings.volume}</span></div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Volume2 className="h-4 w-4" /> Auto-read Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {settings && [
              { label: "Announcements", value: settings.auto_read_announcements },
              { label: "Reports", value: settings.auto_read_reports },
              { label: "Results", value: settings.auto_read_results },
              { label: "Navigation", value: settings.auto_read_navigation },
            ].map((f) => (
              <div key={f.label} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{f.label}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${f.value ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {f.value ? "Enabled" : "Disabled"}
                </span>
              </div>
            ))}
            {!settings && <p className="text-sm text-gray-400">No settings configured</p>}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Speaker className="h-4 w-4" /> Available Languages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {langsRes.data.filter((l) => l.is_enabled).map((l) => (
              <span key={l.id} className="px-2 py-1 rounded bg-gray-100 text-xs text-gray-700">{l.name} ({l.code})</span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
