"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SignupRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/create-fest")
  }, [router])

  return (
    <div className="min-h-screen bg-[#070E0D] flex items-center justify-center text-white">
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <span className="text-sm font-medium text-slate-300">Redirecting to fest setup...</span>
      </div>
    </div>
  )
}
