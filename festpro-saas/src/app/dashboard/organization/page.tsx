"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Plus, ArrowRight } from "lucide-react"
import type { ExtendedOrganization } from "@/types/organization"

export default function OrganizationListPage() {
  const router = useRouter()
  const [orgs, setOrgs] = useState<ExtendedOrganization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }

      const { data: memberships } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)

      if (memberships?.length) {
        const ids = memberships.map((m: { organization_id: string }) => m.organization_id)
        const { data: orgsData } = await supabase
          .from("organizations")
          .select("*")
          .in("id", ids)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })

        setOrgs(orgsData as ExtendedOrganization[] || [])

        // If user has a current org set, redirect there
        const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single()
        if (profile?.organization_id && orgsData?.some((o) => o.id === profile.organization_id)) {
          router.push(`/dashboard/organization/${profile.organization_id}`)
        }
      }

      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-sm text-gray-500 mt-1">Select an organization to manage.</p>
        </div>
        <Link href="/dashboard/organization/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </Link>
      </div>

      {orgs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <CardTitle className="mb-2">No Organizations Yet</CardTitle>
            <p className="text-sm text-gray-500 mb-6">Create your first organization to get started.</p>
            <Link href="/dashboard/organization/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {orgs.map((org) => (
            <Link key={org.id} href={`/dashboard/organization/${org.id}`}>
              <Card className="hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-white text-lg font-bold shrink-0"
                      style={{ backgroundColor: org.brand_color || "#4F46E5" }}
                    >
                      {org.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{org.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{org.subscription_plan} plan</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
