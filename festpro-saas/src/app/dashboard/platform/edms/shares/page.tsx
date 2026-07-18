import { getActiveShares } from "@/lib/actions/edms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SHARE_ACCESS_LEVELS } from "@/config/edms"
import { Share2 } from "lucide-react"

export default async function SharesPage() {
  const result = await getActiveShares()
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const shares = result.data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Sharing</h1>
        <p className="text-sm text-gray-500">Active shared document links</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Share2 className="h-4 w-4" /> Active Shares ({shares.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {shares.map((s) => {
              const doc = s as any
              const lvlCfg = SHARE_ACCESS_LEVELS.find((l) => l.value === s.access_level)
              return (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <Share2 className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-900 truncate">{doc.documents?.document_title ?? "Untitled"}</span>
                    <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">{lvlCfg?.label ?? s.access_level}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                    <span>Downloads: {s.download_count}{s.max_downloads ? `/${s.max_downloads}` : ""}</span>
                    {s.expires_at && <span>Expires: {new Date(s.expires_at).toLocaleDateString()}</span>}
                    <span className="font-mono text-gray-400">{s.share_token?.slice(0, 16)}...</span>
                  </div>
                </div>
              )
            })}
            {shares.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No active shares</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
