"use client"

import { useEffect, useState } from "react"
import { Wifi, WifiOff, CloudSync } from "lucide-react"

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showSync, setShowSync] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const onl = () => { setIsOnline(true); setShowSync(true); setTimeout(() => setShowSync(false), 3000) }
    const offl = () => setIsOnline(false)
    window.addEventListener("online", onl); window.addEventListener("offline", offl)
    return () => { window.removeEventListener("online", onl); window.removeEventListener("offline", offl) }
  }, [])

  if (!isOnline) return <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full"><WifiOff className="h-3 w-3" />Offline</div>
  if (showSync) return <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full"><CloudSync className="h-3 w-3" />Synced</div>
  return <div className="flex items-center gap-1.5 text-xs text-green-600"><Wifi className="h-3 w-3" /></div>
}
