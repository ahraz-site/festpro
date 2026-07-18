"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getVisitorPasses, deactivateVisitorPass } from "@/lib/actions/help-desk"
import { VISITOR_CATEGORIES } from "@/config/help-desk"
import { Loader2, QrCode, Ban } from "lucide-react"

export default function PassesPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [passes, setPasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await getVisitorPasses(festivalId)
    if (res.data) setPasses(res.data); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  if (loading && passes.length === 0) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Visitor Passes</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {passes.map((p: any) => {
          const cat = VISITOR_CATEGORIES.find(x => x.value === p.pass_type)
          return (
            <Card key={p.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-gray-400" />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{p.is_active ? "Active" : "Inactive"}</span>
                    {p.is_used && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Used</span>}
                  </div>
                  <Button size="sm" variant="ghost" onClick={async () => { await deactivateVisitorPass(p.id); load() }}><Ban className="h-4 w-4 text-red-500" /></Button>
                </div>
                <p className="text-sm font-mono mt-2">{p.pass_number}</p>
                <p className="text-xs text-gray-500">{p.visitors?.first_name} {p.visitors?.last_name}</p>
                {cat && <span className={`text-xs px-2 py-0.5 rounded-full ${cat.color}`}>{cat.label}</span>}
                <div className="text-xs text-gray-400 mt-2">
                  <p>Issued: {new Date(p.issued_at).toLocaleDateString()}</p>
                  {p.validity_end && <p>Expires: {new Date(p.validity_end).toLocaleDateString()}</p>}
                </div>
              </CardContent>
            </Card>
          )
        })}
        {passes.length === 0 && <p className="text-center text-gray-400 py-8 col-span-3">No passes issued</p>}
      </div>
    </div>
  )
}
