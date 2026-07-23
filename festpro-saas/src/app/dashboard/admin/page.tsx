"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, CalendarDays, Activity } from "lucide-react"
import type { Profile } from "@/types"

export default function AdminDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      let { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (!data) {
        const { ensureUserProfile } = await import("@/lib/actions/auth")
        data = await ensureUserProfile()
      }
      if (data) {
        setProfile(data)
      } else {
        setProfile({
          id: user.id,
          email: user.email || "",
          first_name: user.user_metadata?.first_name || "Admin",
          last_name: user.user_metadata?.last_name || "",
          role: "platform_owner",
          organization_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
      }
    }
    load()
  }, [])

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-bold animate-pulse">F</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {profile.first_name}! Here&apos;s the platform overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Building2 className="h-6 w-6" /></div>
            <div><p className="text-2xl font-bold text-gray-900">0</p><p className="text-sm text-gray-500">Organizations</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600"><CalendarDays className="h-6 w-6" /></div>
            <div><p className="text-2xl font-bold text-gray-900">0</p><p className="text-sm text-gray-500">Active Festivals</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><Users className="h-6 w-6" /></div>
            <div><p className="text-2xl font-bold text-gray-900">1</p><p className="text-sm text-gray-500">Total Users</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Activity className="h-6 w-6" /></div>
            <div><p className="text-2xl font-bold text-gray-900">0</p><p className="text-sm text-gray-500">Active Now</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Getting Started</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-600">Your platform is ready. Create organizations and festivals to get started.</p>
        </CardContent>
      </Card>
    </div>
  )
}
