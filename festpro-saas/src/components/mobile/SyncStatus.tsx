"use client"

import { useState, useEffect } from "react"
import { CloudSync, Loader2, AlertCircle, CheckCircle } from "lucide-react"

type SyncState = "idle" | "syncing" | "success" | "error"

export default function SyncStatus() {
  const [state, setState] = useState<SyncState>("idle")
  const [pendingCount, setPendingCount] = useState(0)

  const triggerSync = async () => {
    setState("syncing")
    try {
      const res = await fetch("/api/mobile/sync", { method: "POST" })
      if (res.ok) { setState("success"); setTimeout(() => setState("idle"), 3000) }
      else { setState("error"); setTimeout(() => setState("idle"), 5000) }
    } catch { setState("error"); setTimeout(() => setState("idle"), 5000) }
  }

  if (state === "syncing") return <button className="flex items-center gap-1 text-xs text-blue-600" disabled><Loader2 className="h-3 w-3 animate-spin" />Syncing...</button>
  if (state === "success") return <button className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="h-3 w-3" />Synced</button>
  if (state === "error") return <button className="flex items-center gap-1 text-xs text-red-600"><AlertCircle className="h-3 w-3" />Sync failed</button>
  return (
    <button onClick={triggerSync} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
      <CloudSync className="h-3 w-3" />{pendingCount > 0 ? `${pendingCount} pending` : "Sync"}
    </button>
  )
}
