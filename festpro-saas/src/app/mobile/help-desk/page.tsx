"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { MessageCircle, Plus, Loader2 } from "lucide-react"

export default function MobileHelpDesk() {
  const [tickets] = useState<any[]>([])

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-gray-900">Help Desk</h1><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />New</Button></div>
      <p className="text-sm text-gray-500">Submit and track support tickets</p>
      {tickets.length === 0 && (
        <Card><CardContent className="p-6 text-center"><MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No tickets yet. Sync to view your support tickets.</p>
        </CardContent></Card>
      )}
    </div>
  )
}
