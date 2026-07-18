"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, ClipboardCheck, Calendar, QrCode, Star, Trophy, CheckSquare, Settings, Wifi, WifiOff, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const bottomNav = [
  { label: "Home", icon: Home, href: "/mobile" },
  { label: "Attendance", icon: ClipboardCheck, href: "/mobile/attendance" },
  { label: "Schedule", icon: Calendar, href: "/mobile/schedule" },
  { label: "QR Scan", icon: QrCode, href: "/mobile/qr" },
  { label: "More", icon: CheckSquare, href: "/mobile/tasks" },
]

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading")

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const onl = () => setIsOnline(true)
    const offl = () => setIsOnline(false)
    window.addEventListener("online", onl)
    window.addEventListener("offline", offl)
    return () => { window.removeEventListener("online", onl); window.removeEventListener("offline", offl) }
  }, [])

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAuthState("unauthenticated"); router.push("/login") }
      else setAuthState("authenticated")
    }
    check()
  }, [router])

  if (authState === "loading") return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
  if (authState === "unauthenticated") return null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isOnline && <div className="sticky top-0 z-50 bg-amber-500 text-white text-xs text-center py-1.5 px-4 flex items-center justify-center gap-2"><WifiOff className="h-3 w-3" /> You are offline — changes will sync when connected</div>}
      {isOnline && <div className="sticky top-0 z-50 bg-indigo-600 text-white text-xs text-center py-1.5 px-4 flex items-center justify-center gap-1"><Wifi className="h-3 w-3" /> FestPro Mobile</div>}
      <main className="flex-1 pb-20 overflow-y-auto">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {bottomNav.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}>
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
