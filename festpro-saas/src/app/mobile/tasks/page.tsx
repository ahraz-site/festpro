"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckSquare, Plus, Loader2, CheckCircle, Circle } from "lucide-react"

export default function MobileTasks() {
  const [tasks] = useState<any[]>([])
  const [loading] = useState(false)

  if (loading) return <div className="flex items-center justify-center min-h-[80vh]"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-gray-900">Tasks</h1><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />New</Button></div>
      <p className="text-sm text-gray-500">Your assigned tasks and to-dos</p>
      {tasks.length === 0 && (
        <Card><CardContent className="p-6 text-center"><CheckSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No tasks assigned yet. Sync your tasks to view them here.</p>
        </CardContent></Card>
      )}
      {tasks.map((t: any) => (
        <Card key={t.id}><CardContent className="p-4 flex items-start gap-3">
          {t.completed ? <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" /> : <Circle className="h-5 w-5 text-gray-300 mt-0.5 shrink-0" />}
          <div className="flex-1 min-w-0"><p className={`text-sm font-medium ${t.completed ? "line-through text-gray-400" : ""}`}>{t.title}</p>
            {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
            <p className="text-[10px] text-gray-400 mt-1">{t.priority || "Normal"} · {t.due_date ? new Date(t.due_date).toLocaleDateString() : "No due date"}</p></div>
        </CardContent></Card>
      ))}
    </div>
  )
}
