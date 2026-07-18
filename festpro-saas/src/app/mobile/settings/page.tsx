"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { THEME_OPTIONS, FONT_SIZES } from "@/config/mobile-platform"
import { Settings, Moon, Sun, Monitor, LogOut, Smartphone, Bell, Shield, Database, Trash2, Loader2 } from "lucide-react"

export default function MobileSettings() {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [theme, setTheme] = useState("system")
  const [fontSize, setFontSize] = useState("medium")
  const [pushEnabled, setPushEnabled] = useState(true)
  const [offlineStorage, setOfflineStorage] = useState(500)

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const sections = [
    { title: "Appearance", items: [
      { icon: theme === "dark" ? Moon : theme === "light" ? Sun : Monitor, label: "Theme", value: THEME_OPTIONS.find(t => t.value === theme)?.label },
      { icon: Smartphone, label: "Font Size", value: FONT_SIZES.find(f => f.value === fontSize)?.label },
    ]},
    { title: "Notifications", items: [
      { icon: Bell, label: "Push Notifications", value: pushEnabled ? "Enabled" : "Disabled" },
    ]},
    { title: "Storage", items: [
      { icon: Database, label: "Offline Storage", value: `${offlineStorage} MB` },
    ]},
    { title: "Security", items: [
      { icon: Shield, label: "Device Status", value: "Active" },
    ]},
  ]

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-gray-900">Settings</h1><Settings className="h-5 w-5 text-gray-400" /></div>
      {sections.map((section) => (
        <div key={section.title}><h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{section.title}</h2>
          <Card><CardContent className="p-0 divide-y divide-gray-100">
            {section.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3"><item.icon className="h-4 w-4 text-gray-400" /><span className="text-sm">{item.label}</span></div>
                <span className="text-xs text-gray-500">{item.value}</span></div>
            ))}
          </CardContent></Card></div>
      ))}
      <Button variant="danger" className="w-full" onClick={handleLogout} disabled={loggingOut}>
        {loggingOut ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}Log Out
      </Button>
    </div>
  )
}
