"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, CheckCircle, Loader2 } from "lucide-react"

export default function MobileVisitorCheckin() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [checking, setChecking] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleCheckin = async () => {
    if (!name.trim()) return
    setChecking(true)
    await new Promise(r => setTimeout(r, 1000))
    setSuccess(true); setChecking(false)
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-gray-900">Visitor Check-in</h1><Users className="h-5 w-5 text-cyan-400" /></div>
      <p className="text-sm text-gray-500">Register visitors at the gate</p>
      {success ? (
        <Card className="bg-green-50 border-green-200"><CardContent className="p-6 text-center"><CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-green-800">Visitor checked in!</p>
          <Button variant="outline" className="mt-3" onClick={() => { setSuccess(false); setName(""); setPhone("") }}>Check In Another</Button>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="p-4 space-y-3">
          <Input placeholder="Full Name *" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
          <Button className="w-full" onClick={handleCheckin} disabled={checking || !name.trim()}>{checking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Check In</Button>
        </CardContent></Card>
      )}
    </div>
  )
}
