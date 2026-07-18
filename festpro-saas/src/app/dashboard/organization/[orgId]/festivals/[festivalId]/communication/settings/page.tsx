"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { NOTIFICATION_PRIORITIES, NOTIFICATION_CHANNELS } from "@/config/communication"
import { Loader2, Save, Bell, Mail, MessageSquare, Smartphone, Globe, MessageCircle } from "lucide-react"

export default function CommunicationSettingsPage() {
  const params = useParams()
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    default_channel: "in_app", default_priority: "normal",
    email_from: "", sms_from: "",
    push_enabled: false, email_enabled: true, sms_enabled: false, browser_enabled: true,
    retention_days: 90, max_daily_notifications: 100,
  })

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    setSaving(false)
    toast.success("Settings saved")
  }

  const channels = [
    { key: "in_app", label: "In-App", icon: Bell, description: "Display in notification center" },
    { key: "email", label: "Email", icon: Mail, description: "Send via email" },
    { key: "sms", label: "SMS", icon: MessageSquare, description: "Send via SMS" },
    { key: "push", label: "Push", icon: Smartphone, description: "Push to mobile devices" },
    { key: "browser", label: "Browser", icon: Globe, description: "Browser push notification" },
    { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, description: "WhatsApp message" },
  ]

  const enabledFields: Record<string, "email_enabled" | "sms_enabled" | "push_enabled" | "browser_enabled"> = {
    email: "email_enabled", sms: "sms_enabled", push: "push_enabled", browser: "browser_enabled",
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Communication Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure default channels, priorities, and delivery preferences.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Defaults</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Default Channel</label>
              <Select options={NOTIFICATION_CHANNELS.map(c => ({ value: c.value, label: c.label }))} value={settings.default_channel} onChange={e => setSettings(f => ({ ...f, default_channel: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Default Priority</label>
              <Select options={NOTIFICATION_PRIORITIES.map(p => ({ value: p.value, label: p.label }))} value={settings.default_priority} onChange={e => setSettings(f => ({ ...f, default_priority: e.target.value }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Delivery Channels</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {channels.filter(c => c.key !== "in_app").map(ch => {
            const field = enabledFields[ch.key]
            return (
              <label key={ch.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <ch.icon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{ch.label}</p>
                    <p className="text-xs text-gray-400">{ch.description}</p>
                  </div>
                </div>
                <input type="checkbox" checked={(settings as any)[field]} onChange={e => setSettings(f => ({ ...f, [field]: e.target.checked }))} />
              </label>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Delivery Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input value={settings.email_from} onChange={e => setSettings(f => ({ ...f, email_from: e.target.value }))} placeholder="Email From Address" />
          <Input value={settings.sms_from} onChange={e => setSettings(f => ({ ...f, sms_from: e.target.value }))} placeholder="SMS From Number" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Retention (days)</label>
              <input type="number" value={settings.retention_days} onChange={e => setSettings(f => ({ ...f, retention_days: parseInt(e.target.value) || 90 }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Max Daily</label>
              <input type="number" value={settings.max_daily_notifications} onChange={e => setSettings(f => ({ ...f, max_daily_notifications: parseInt(e.target.value) || 100 }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
        Save Settings
      </Button>
    </div>
  )
}
