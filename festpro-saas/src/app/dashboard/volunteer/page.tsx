"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ClipboardCheck, Clock, CheckCircle } from "lucide-react"

export default function VolunteerDashboard() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Volunteer Dashboard</h1><p className="text-sm text-gray-500 mt-1">Your tasks will appear here.</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-6 flex items-center gap-4"><ClipboardCheck className="h-8 w-8 text-indigo-500" /><div><p className="text-2xl font-bold">0</p><p className="text-sm text-gray-500">Today&apos;s Tasks</p></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><Clock className="h-8 w-8 text-yellow-500" /><div><p className="text-2xl font-bold">0</p><p className="text-sm text-gray-500">Pending</p></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><CheckCircle className="h-8 w-8 text-green-500" /><div><p className="text-2xl font-bold">0</p><p className="text-sm text-gray-500">Completed</p></div></CardContent></Card>
      </div>
    </div>
  )
}
