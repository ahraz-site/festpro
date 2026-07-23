"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ensureUserProfile } from "@/lib/actions/auth"
import { getDashboardForRole } from "@/config/roles"
import type { UserRole } from "@/types"

export default function DashboardRoot() {
  const router = useRouter()

  useEffect(() => {
    async function redirectUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      let { data: profile } = await supabase
        .from("profiles")
        .select("role, organization_id")
        .eq("id", user.id)
        .single()

      if (!profile) {
        profile = await ensureUserProfile()
      }

      if (profile?.organization_id) {
        router.push(`/dashboard/organization/${profile.organization_id}`)
        return
      }

      // Check organization_members table
      const { data: mems } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)

      if (mems && mems.length > 0 && mems[0].organization_id) {
        router.push(`/dashboard/organization/${mems[0].organization_id}`)
        return
      }

      const dash = profile?.role ? getDashboardForRole(profile.role as UserRole) : "/dashboard/organization"
      if (dash === "/dashboard" || dash === "/dashboard/organization") {
        router.push("/dashboard/organization/create")
      } else {
        router.push(dash)
      }
    }
    redirectUser()
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
