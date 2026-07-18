"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { searchHelpDesk } from "@/lib/actions/help-desk"
import { Loader2, Search as SearchIcon, Ticket, Users, Search as SearchL, Package } from "lucide-react"

export default function SearchPage() {
  const params = useParams()
  const router = useRouter()
  const festivalId = params.festivalId as string
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    const res = await searchHelpDesk(festivalId, query)
    setResults(res); setLoading(false)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Global Search</h1>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input className="pl-10 text-lg py-6" placeholder="Search tickets, visitors, lost & found items..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} />
        </div>
        <Button onClick={handleSearch} disabled={loading} className="px-8">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}</Button>
      </div>

      {results && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Ticket className="h-4 w-4" /> Tickets ({results.tickets.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {results.tickets.map((t: any) => (
                <div key={t.ticket_number} className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/dashboard/organization/${params.orgId}/festivals/${festivalId}/help-desk/tickets/${t.id}`)}>
                  <p className="text-sm font-mono text-gray-400">{t.ticket_number}</p>
                  <p className="text-sm font-medium">{t.subject}</p>
                  <span className="text-xs text-gray-500">{t.status}</span>
                </div>
              ))}
              {results.tickets.length === 0 && <p className="text-sm text-gray-400">No tickets found</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-4 w-4" /> Visitors ({results.visitors.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {results.visitors.map((v: any) => (
                <div key={v.id} className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/dashboard/organization/${params.orgId}/festivals/${festivalId}/help-desk/visitors/${v.id}`)}>
                  <p className="text-sm font-medium">{v.first_name} {v.last_name}</p>
                  <p className="text-xs text-gray-500">{v.email || v.phone} · {v.visitor_category}</p>
                </div>
              ))}
              {results.visitors.length === 0 && <p className="text-sm text-gray-400">No visitors found</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><SearchL className="h-4 w-4" /> Lost Items ({results.lost_items.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {results.lost_items.map((i: any) => (
                <div key={i.id} className="p-2 rounded-lg hover:bg-gray-50">
                  <p className="text-sm font-medium">{i.item_name}</p>
                  <p className="text-xs text-gray-500">{i.category} · {i.status}</p>
                </div>
              ))}
              {results.lost_items.length === 0 && <p className="text-sm text-gray-400">No lost items found</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Package className="h-4 w-4" /> Found Items ({results.found_items.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {results.found_items.map((i: any) => (
                <div key={i.id} className="p-2 rounded-lg hover:bg-gray-50">
                  <p className="text-sm font-medium">{i.item_name}</p>
                  <p className="text-xs text-gray-500">{i.category} · {i.status}</p>
                </div>
              ))}
              {results.found_items.length === 0 && <p className="text-sm text-gray-400">No found items</p>}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
