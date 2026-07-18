"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getNotifications, markNotificationRead, markAllRead, archiveNotification } from "@/lib/actions/communication"
import { NOTIFICATION_PRIORITIES, NOTIFICATION_CHANNELS } from "@/config/communication"
import type { Notification } from "@/types/communication"
import { Loader2, Bell, CheckCheck, Archive, ArrowRight, Mail, MessageSquare, Smartphone, Globe, MessageCircle, Trash2 } from "lucide-react"

export default function NotificationsPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")

  const load = useCallback(async () => {
    const res = await getNotifications(festivalId, { status: statusFilter || undefined, priority: priorityFilter || undefined })
    setNotifications(res.data || []); setLoading(false)
  }, [festivalId, statusFilter, priorityFilter])

  useEffect(() => { load() }, [load])

  const handleMarkAllRead = async () => {
    await markAllRead(); toast.success("All marked as read"); load()
  }

  const channelIcon = (ch: string) => {
    switch (ch) {
      case "email": return <Mail className="h-4 w-4" />
      case "sms": return <MessageSquare className="h-4 w-4" />
      case "push": return <Smartphone className="h-4 w-4" />
      case "browser": return <Globe className="h-4 w-4" />
      case "whatsapp": return <MessageCircle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">{unreadCount} unread · {notifications.length} total</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead}><CheckCheck className="h-4 w-4 mr-1" /> Mark All Read</Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-4 flex gap-2">
          <Select options={[{ value: "", label: "All Status" }, { value: "unread", label: "Unread" }, { value: "archived", label: "Archived" }]} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-40" />
          <Select options={[{ value: "", label: "All Priority" }, ...NOTIFICATION_PRIORITIES.map(p => ({ value: p.value, label: p.label }))]} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="w-40" />
        </CardContent>
      </Card>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-400">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
          </CardContent></Card>
        ) : notifications.map(n => (
          <Card key={n.id} className={`${!n.is_read ? "border-l-4 border-indigo-400 bg-indigo-50/30" : ""} transition-colors`}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-full mt-0.5 ${!n.is_read ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"}`}>
                    {channelIcon(n.channel)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${!n.is_read ? "text-gray-900" : "text-gray-600"}`}>{n.title}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${NOTIFICATION_PRIORITIES.find(p => p.value === n.priority)?.color || ""}`}>{n.priority}</span>
                    </div>
                    {n.body && <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                      {n.channel && <span className="capitalize">via {n.channel.replace("_", " ")}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  {!n.is_read && (
                    <Button size="sm" variant="ghost" onClick={async () => { await markNotificationRead(n.id); load() }}>
                      <CheckCheck className="h-3.5 w-3.5 text-indigo-500" />
                    </Button>
                  )}
                  {!n.is_archived && (
                    <Button size="sm" variant="ghost" onClick={async () => { await archiveNotification(n.id); load() }}>
                      <Archive className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
