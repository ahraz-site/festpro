"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getDashboardForRole } from "@/config/roles"
import type { Profile, UserRole } from "@/types"

export default function DashboardRoot() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function redirect() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (!profile) { router.push("/login"); return }

      const dash = getDashboardForRole(profile.role as UserRole)
      router.push(dash)
    }
    redirect()
  }, [router])

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Redirecting to your dashboard...</p>
    </div>
  )
}
