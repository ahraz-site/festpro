"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, CalendarDays, Users, Settings, Activity, ArrowRight } from "lucide-react"
import type { OrganizationDashboardData } from "@/types/organization"
import { getOrganizationDashboardData } from "@/lib/actions/organization"

export default function OrganizationDashboardPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [data, setData] = useState<OrganizationDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const result = await getOrganizationDashboardData(orgId)
      setData(result as unknown as OrganizationDashboardData)
      setLoading(false)
    }
    load()
  }, [orgId])

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>
  if (!data) return <div className="text-center py-12 text-gray-500">Organization not found.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-lg font-bold"
              style={{ backgroundColor: data.organization.brand_color || "#4F46E5" }}
            >
              {data.organization.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{data.organization.name}</h1>
              <p className="text-sm text-gray-500 capitalize">{data.organization.subscription_plan} plan</p>
            </div>
          </div>
        </div>
        <Link
          href={`/dashboard/organization/${orgId}/settings`}
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">1</p>
              <p className="text-sm text-gray-500">Organization</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Festivals</p>
            </div>
          </CardContent>
        </Card>
        <Link href={`/dashboard/organization/${orgId}/members`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.memberCount}</p>
                <p className="text-sm text-gray-500">
                  Team Members ({data.activeMemberCount} active)
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href={`/dashboard/organization/${orgId}/members`}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Invite Members</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </Link>
          <Link
            href={`/dashboard/organization/${orgId}/settings`}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Org Settings</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </Link>
          <Link
            href={`/dashboard/organization/${orgId}/activity`}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Activity Log</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </Link>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {data.recentActivity.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-indigo-400 shrink-0" />
                  <span className="text-gray-600 capitalize">{log.action.replace(/\./g, " ")}</span>
                  <span className="text-gray-400 ml-auto text-xs">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
