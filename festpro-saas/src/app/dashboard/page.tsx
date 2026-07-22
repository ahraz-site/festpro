"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getDashboardForRole } from "@/config/roles"
import type { UserRole } from "@/types"

export default function DashboardRoot() {
  const router = useRouter()

  useEffect(() => {
    async function redirect() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, organization_id")
        .eq("id", user.id)
        .single()

      if (!profile) { router.push("/login"); return }

      if (profile.organization_id) {
        router.push(`/dashboard/organization/${profile.organization_id}`)
      } else {
        const dash = getDashboardForRole(profile.role as UserRole)
        router.push(dash)
      }
    }
    redirect()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-lg font-bold animate-pulse">F</div>
        </div>
        <p className="text-sm font-medium text-gray-600">Loading your workspace...</p>
      </div>
    </div>
  )
}
