"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getAnnouncements, updateAnnouncementStatus, deleteAnnouncement } from "@/lib/actions/communication"
import { ANNOUNCEMENT_STATUSES, NOTIFICATION_PRIORITIES } from "@/config/communication"
import type { Announcement } from "@/types/communication"
import { Loader2, Plus, Megaphone, Pin, AlertTriangle, Calendar, Eye, Archive, Trash2, Send } from "lucide-react"

export default function AnnouncementsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")

  const load = useCallback(async () => {
    const res = await getAnnouncements(festivalId, { status: statusFilter || undefined })
    setAnnouncements(res.data || []); setLoading(false)
  }, [festivalId, statusFilter])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const pinned = announcements.filter(a => a.is_pinned && a.status === "published")
  const regular = announcements.filter(a => !a.is_pinned || a.status !== "published")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">{announcements.length} total · {pinned.length} pinned</p>
        </div>
        <Link href={`/dashboard/organization/${params.orgId}/festivals/${festivalId}/communication/announcements/create`}>
          <Button><Plus className="h-4 w-4 mr-1" /> New Announcement</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-4">
          <Select options={[{ value: "", label: "All Status" }, ...ANNOUNCEMENT_STATUSES.map(s => ({ value: s.value, label: s.label }))]} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40" />
        </CardContent>
      </Card>

      {pinned.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-500 flex items-center gap-1"><Pin className="h-4 w-4" /> Pinned</p>
          {pinned.map(a => <AnnouncementCard key={a.id} a={a} params={params} festivalId={festivalId} load={load} />)}
        </div>
      )}

      <div className="space-y-2">
        {regular.length === 0 && pinned.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-400">
            <Megaphone className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No announcements yet</p>
          </CardContent></Card>
        ) : regular.map(a => <AnnouncementCard key={a.id} a={a} params={params} festivalId={festivalId} load={load} />)}
      </div>
    </div>
  )
}

function AnnouncementCard({ a, params, festivalId, load }: { a: any; params: any; festivalId: string; load: () => void }) {
  return (
    <Card className={`${a.is_emergency ? "border-red-400 bg-red-50/30" : ""} ${a.is_pinned ? "ring-1 ring-amber-300" : ""}`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold">{a.title}</p>
              {a.is_emergency && <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Emergency</span>}
              {a.is_pinned && <Pin className="h-3 w-3 text-amber-500" />}
              <span className={`text-xs px-2 py-0.5 rounded-full ${ANNOUNCEMENT_STATUSES.find(s => s.value === a.status)?.color || ""}`}>{a.status}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${NOTIFICATION_PRIORITIES.find(p => p.value === a.priority)?.color || ""}`}>{a.priority}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{a.body}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span>Target: {a.target}</span>
              <span>{new Date(a.created_at).toLocaleString()}</span>
              {a.scheduled_at && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(a.scheduled_at).toLocaleString()}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4">
            {a.status === "draft" && (
              <Button size="sm" variant="ghost" onClick={async () => { await updateAnnouncementStatus(a.id, "published"); load() }}>
                <Send className="h-3.5 w-3.5 text-green-500" />
              </Button>
            )}
            {a.status === "published" && (
              <Button size="sm" variant="ghost" onClick={async () => { await updateAnnouncementStatus(a.id, "archived"); load() }}>
                <Archive className="h-3.5 w-3.5 text-gray-400" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={async () => { await deleteAnnouncement(a.id); load() }}>
              <Trash2 className="h-3.5 w-3.5 text-red-400" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
