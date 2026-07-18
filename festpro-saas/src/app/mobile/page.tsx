"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { getMobileDashboard } from "@/lib/actions/mobile-platform"
import { QrCode, ClipboardCheck, Calendar, Star, Trophy, Bell, Ambulance, Package, UtensilsCrossed, Users, FileText, Loader2, Settings } from "lucide-react"

const quickActions = [
  { label: "QR Scan", icon: QrCode, href: "/mobile/qr", color: "bg-indigo-500" },
  { label: "Attendance", icon: ClipboardCheck, href: "/mobile/attendance", color: "bg-emerald-500" },
  { label: "Schedule", icon: Calendar, href: "/mobile/schedule", color: "bg-blue-500" },
  { label: "Judging", icon: Star, href: "/mobile/judging", color: "bg-amber-500" },
  { label: "Results", icon: Trophy, href: "/mobile/results", color: "bg-purple-500" },
  { label: "Tasks", icon: FileText, href: "/mobile/tasks", color: "bg-rose-500" },
  { label: "Announcements", icon: Bell, href: "/mobile/announcements", color: "bg-pink-500" },
  { label: "Medical", icon: Ambulance, href: "/mobile/medical", color: "bg-red-500" },
  { label: "Inventory", icon: Package, href: "/mobile/inventory", color: "bg-teal-500" },
  { label: "Meal Verify", icon: UtensilsCrossed, href: "/mobile/meal-verification", color: "bg-orange-500" },
  { label: "Visitor Check-in", icon: Users, href: "/mobile/visitor-checkin", color: "bg-cyan-500" },
  { label: "Settings", icon: Settings, href: "/mobile/settings", color: "bg-gray-500" },
]

export default function MobileDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(prof)
      const { data: members } = await supabase.from("organization_members").select("organization_id").eq("user_id", user.id).limit(1)
      if (members && members.length > 0) {
        const dash = await getMobileDashboard(members[0].organization_id)
        setDashboard(dash.data)
      }
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div className="flex items-center justify-center min-h-[80vh]"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>

  return (
    <div className="p-4 max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-gray-900">{profile?.first_name ? `Hi, ${profile.first_name}` : "Dashboard"}</h1>
          <p className="text-sm text-gray-500">{profile?.role || "User"}</p></div>
        <Link href="/mobile/settings" className="p-2 rounded-full bg-gray-100"><Settings className="h-5 w-5 text-gray-600" /></Link>
      </div>
      {dashboard && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Pending Sync" value={dashboard.pending_syncs} color="text-amber-600" />
          <StatCard label="Activities" value={dashboard.today_activity} color="text-blue-600" />
          <StatCard label="Devices" value={dashboard.active_devices} color="text-indigo-600" />
        </div>
      )}
      <div><h2 className="text-sm font-semibold text-gray-700 mb-2">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`h-10 w-10 rounded-xl ${action.color} flex items-center justify-center`}><action.icon className="h-5 w-5 text-white" /></div>
              <span className="text-[11px] font-medium text-gray-600 text-center leading-tight">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card><CardContent className="p-3 text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
    </CardContent></Card>
  )
}
