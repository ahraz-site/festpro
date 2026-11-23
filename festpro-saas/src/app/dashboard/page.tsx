"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ensureUserProfile } from "@/lib/actions/auth"

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

      let orgId = profile?.organization_id

      if (!orgId) {
        // Check organization_members table
        const { data: mems } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .limit(1)

        if (mems && mems.length > 0 && mems[0].organization_id) {
          orgId = mems[0].organization_id
        }
      }

      if (orgId) {
        // Check for latest festival
        const { data: fest } = await supabase
          .from("festivals")
          .select("id")
          .eq("organization_id", orgId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (fest?.id) {
          router.push(`/dashboard/organization/${orgId}/festivals/${fest.id}`)
          return
        }

        router.push(`/dashboard/organization/${orgId}`)
        return
      }

      router.push("/create-fest")
    }
    redirectUser()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5]">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D382E] text-white text-base font-bold animate-pulse">
            F
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-500">Opening festival workspace...</p>
      </div>
    </div>
  )
}
