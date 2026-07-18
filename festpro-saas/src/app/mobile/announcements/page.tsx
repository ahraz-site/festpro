"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Megaphone, Loader2 } from "lucide-react"

export default function MobileAnnouncements() {
  const [announcements] = useState<any[]>([])
  const [loading] = useState(false)

  if (loading) return <div className="flex items-center justify-center min-h-[80vh]"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-gray-900">Announcements</h1><Megaphone className="h-5 w-5 text-gray-400" /></div>
      <p className="text-sm text-gray-500">Festival announcements and alerts</p>
      {announcements.length === 0 && (
        <Card><CardContent className="p-6 text-center"><Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No announcements yet.</p>
        </CardContent></Card>
      )}
      {announcements.map((a: any) => (
        <Card key={a.id} className={a.priority === "high" ? "border-red-200 bg-red-50" : ""}>
          <CardContent className="p-4"><div className="flex items-start gap-3">
            <Megaphone className={`h-5 w-5 mt-0.5 ${a.priority === "high" ? "text-red-500" : "text-indigo-500"}`} />
            <div><p className="font-semibold text-sm">{a.title}</p><p className="text-xs text-gray-600 mt-1">{a.body}</p>
              <p className="text-[10px] text-gray-400 mt-1">{new Date(a.created_at).toLocaleString()}</p></div>
          </div></CardContent>
        </Card>
      ))}
    </div>
  )
}
