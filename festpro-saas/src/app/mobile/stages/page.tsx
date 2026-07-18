"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LayoutDashboard, Loader2 } from "lucide-react"

export default function MobileStages() {
  const [stages] = useState<any[]>([])

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-gray-900">Stage Queue</h1><LayoutDashboard className="h-5 w-5 text-gray-400" /></div>
      <p className="text-sm text-gray-500">Live stage queue and performance order</p>
      {stages.length === 0 && (
        <Card><CardContent className="p-6 text-center"><LayoutDashboard className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Sync stage data to see live queues.</p>
        </CardContent></Card>
      )}
    </div>
  )
}
