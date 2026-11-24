"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ensureUserProfile } from "@/lib/actions/auth"
import { getOrCreateOrganizationFestivalAction } from "@/lib/actions/festival"
import { FestProFavicon } from "@/components/ui/logo"

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
        // Check for latest festival or auto-ensure one
        const { data: fest } = await supabase
          .from("festivals")
          .select("id")
          .eq("organization_id", orgId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (fest?.id) {
          router.replace(`/dashboard/organization/${orgId}/festivals/${fest.id}`)
          return
        }

        // Auto-ensure starter festival
        const res = await getOrCreateOrganizationFestivalAction(orgId)
        if (res.success && res.festival?.id) {
          router.replace(`/dashboard/organization/${orgId}/festivals/${res.festival.id}`)
          return
        }

        router.replace(`/dashboard/organization/${orgId}`)
        return
      }

      router.replace("/create-fest")
    }
    redirectUser()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="animate-pulse">
            <FestProFavicon size={48} className="shadow-lg rounded-full" />
          </div>
        </div>
        <p className="text-xs font-bold text-slate-600 tracking-wide uppercase animate-pulse">
          Opening festival workspace...
        </p>
      </div>
    </div>
  )
}
