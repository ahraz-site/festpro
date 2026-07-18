"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getFestivalDashboardData } from "@/lib/actions/festival"
import { FESTIVAL_STATUSES } from "@/config/festival"
import type { FestivalDashboardData } from "@/types/festival"
import {
  CalendarDays, Users, Trophy, Star, MapPin, Settings, Bell, Image,
  FileText, CreditCard, Activity, ArrowRight, LayoutGrid, Loader2
} from "lucide-react"

export default function FestivalDashboardPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [data, setData] = useState<FestivalDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const result = await getFestivalDashboardData(festivalId)
      setData(result as unknown as FestivalDashboardData)
      setLoading(false)
    }
    load()
  }, [festivalId])

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (!data) return <div className="text-center py-12 text-gray-500">Festival not found.</div>

  const statusInfo = FESTIVAL_STATUSES.find((s) => s.value === data.festival.status)
  const stats = data.statistics

  const quickLinks = [
    { label: "Days", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/days`, icon: CalendarDays, color: "text-blue-600 bg-blue-50" },
    { label: "Venues", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/venues`, icon: MapPin, color: "text-green-600 bg-green-50" },
    { label: "Stages", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/stages`, icon: LayoutGrid, color: "text-purple-600 bg-purple-50" },
    { label: "Committees", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/committees`, icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { label: "Sponsors", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/sponsors`, icon: CreditCard, color: "text-amber-600 bg-amber-50" },
    { label: "Announcements", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/announcements`, icon: Bell, color: "text-pink-600 bg-pink-50" },
    { label: "Gallery", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/gallery`, icon: Image, color: "text-teal-600 bg-teal-50" },
    { label: "Documents", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/documents`, icon: FileText, color: "text-orange-600 bg-orange-50" },
    { label: "Settings", href: `/dashboard/organization/${orgId}/festivals/${festivalId}/settings`, icon: Settings, color: "text-gray-600 bg-gray-50" },
  ]

  const statCards = [
    { label: "Participants", value: stats?.total_participants || 0, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Competitions", value: stats?.total_competitions || 0, icon: Trophy, color: "text-indigo-600 bg-indigo-50" },
    { label: "Judges", value: stats?.total_judges || 0, icon: Star, color: "text-amber-600 bg-amber-50" },
    { label: "Stages", value: stats?.total_stages || 0, icon: LayoutGrid, color: "text-purple-600 bg-purple-50" },
    { label: "Venues", value: stats?.total_venues || 0, icon: MapPin, color: "text-green-600 bg-green-50" },
    { label: "Days", value: stats?.total_days || 0, icon: CalendarDays, color: "text-teal-600 bg-teal-50" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xl font-bold">
            {data.festival.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.festival.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {statusInfo && (
                <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              )}
              {data.festival.code && (
                <span className="text-xs text-gray-500">#{data.festival.code}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/organization/${orgId}/festivals/${festivalId}/settings`}>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} mx-auto mb-2`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Festival</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${link.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{link.label}</span>
                  <ArrowRight className="h-3 w-3 text-gray-400 ml-auto" />
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Festival Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {data.festival.description && (
              <p className="text-gray-600">{data.festival.description}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {data.festival.start_date && (
                <div><span className="text-gray-500">Start:</span> <span className="font-medium">{new Date(data.festival.start_date).toLocaleDateString()}</span></div>
              )}
              {data.festival.end_date && (
                <div><span className="text-gray-500">End:</span> <span className="font-medium">{new Date(data.festival.end_date).toLocaleDateString()}</span></div>
              )}
              {data.festival.venue_name && (
                <div className="col-span-2"><span className="text-gray-500">Venue:</span> <span className="font-medium">{data.festival.venue_name}</span></div>
              )}
              {data.festival.country && (
                <div className="col-span-2"><span className="text-gray-500">Location:</span> <span className="font-medium">{[data.festival.district, data.festival.state, data.festival.country].filter(Boolean).join(", ")}</span></div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {data.announcements.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No announcements yet.</p>
            ) : (
              <div className="space-y-3">
                {data.announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ann.title}</p>
                      <p className="text-xs text-gray-500">{new Date(ann.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {data.announcements.length > 3 && (
                  <Link
                    href={`/dashboard/organization/${orgId}/festivals/${festivalId}/announcements`}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    View all announcements →
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
