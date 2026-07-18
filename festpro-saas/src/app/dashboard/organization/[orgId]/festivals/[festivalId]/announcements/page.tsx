"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getAnnouncements, deleteAnnouncement } from "@/lib/actions/schedule/announcements"
import { getFestivalStages } from "@/lib/actions/festival"
import { ANNOUNCEMENT_TYPES } from "@/config/schedule"
import type { StageAnnouncement } from "@/types/schedule"
import type { FestivalStage } from "@/types/festival"
import { Plus, Trash2, Loader2, MessageSquare } from "lucide-react"

export default function AnnouncementsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [announcements, setAnnouncements] = useState<StageAnnouncement[]>([])
  const [stages, setStages] = useState<FestivalStage[]>([])
  const [loading, setLoading] = useState(true)
  const [stageFilter, setStageFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")

  useEffect(() => {
    Promise.all([
      getAnnouncements(festivalId, { stage_id: stageFilter, type: typeFilter }),
      getFestivalStages(festivalId),
    ]).then(([aRes, sRes]) => {
      setAnnouncements(aRes.data as StageAnnouncement[])
      setStages(sRes as FestivalStage[])
      setLoading(false)
    })
  }, [festivalId, stageFilter, typeFilter])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return
    const res = await deleteAnnouncement(id)
    if (res.error) toast.error(res.error); else {
      toast.success("Deleted")
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stage Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage stage announcements and scrolling messages.</p>
        </div>
        <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/announcements/create`}>
          <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Announcement</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Select options={stages.map(s => ({ value: s.id, label: s.name }))} placeholder="All Stages" value={stageFilter} onChange={e => setStageFilter(e.target.value)} />
            <Select options={ANNOUNCEMENT_TYPES} placeholder="All Types" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
      ) : announcements.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No announcements yet</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <Card key={a.id} className={`${a.is_emergency ? "border-red-300 bg-red-50" : ""} ${a.is_scrolling ? "border-amber-300" : ""}`}>
              <CardContent className="py-3 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${a.is_emergency ? "bg-red-100 text-red-600" : "bg-indigo-100 text-indigo-600"}`}>
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{a.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{a.message}</p>
                    <div className="flex gap-2 mt-1 text-xs text-gray-400">
                      <span className={`px-1.5 py-0.5 rounded ${ANNOUNCEMENT_TYPES.find(t => t.value === a.announcement_type) ? "bg-gray-100" : ""}`}>{a.announcement_type}</span>
                      {a.stage && <span>Stage: {a.stage.name}</span>}
                      {a.display_on_screen && <span className="text-blue-600">Display</span>}
                      {a.is_scrolling && <span className="text-amber-600">Scrolling</span>}
                      {a.is_emergency && <span className="text-red-600 font-medium">EMERGENCY</span>}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 shrink-0" onClick={() => handleDelete(a.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
