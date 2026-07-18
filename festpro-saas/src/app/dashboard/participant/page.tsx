"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Trophy, CalendarDays, FileText } from "lucide-react"

export default function ParticipantDashboard() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1><p className="text-sm text-gray-500 mt-1">Your registrations and schedule will appear here.</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-6 flex items-center gap-4"><Trophy className="h-8 w-8 text-yellow-500" /><div><p className="text-2xl font-bold">0</p><p className="text-sm text-gray-500">Registered</p></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><CalendarDays className="h-8 w-8 text-blue-500" /><div><p className="text-2xl font-bold">0</p><p className="text-sm text-gray-500">Upcoming</p></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><FileText className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">0</p><p className="text-sm text-gray-500">Certificates</p></div></CardContent></Card>
      </div>
    </div>
  )
}
