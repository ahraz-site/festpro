"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function MobileAttendance() {
  const [search, setSearch] = useState("")
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleManualCheck = () => {
    setScanning(true)
    setTimeout(() => {
      setResult({ success: true, message: "Attendance marked for participant" })
      setScanning(false)
    }, 1000)
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div><h1 className="text-xl font-bold text-gray-900">Attendance</h1><p className="text-sm text-gray-500">Mark participant attendance</p></div>
      <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search participant..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <Button className="w-full" onClick={handleManualCheck} disabled={scanning}>{scanning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Check In</Button>
      {result && (
        <Card className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          <CardContent className="p-4 flex items-center gap-3">
            {result.success ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
            <p className="text-sm font-medium">{result.message}</p>
          </CardContent>
        </Card>
      )}
      <Card><CardContent className="p-4"><h3 className="font-semibold text-sm mb-2">Recent Attendance</h3>
        <p className="text-xs text-gray-400">No attendance records found for today.</p>
      </CardContent></Card>
    </div>
  )
}
