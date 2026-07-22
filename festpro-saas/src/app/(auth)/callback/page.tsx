"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Lock } from "lucide-react"

export default function CallbackPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"loading" | "recovery" | "error">("loading")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("recovery")
      } else if (event === "SIGNED_IN") {
        const params = new URLSearchParams(window.location.search)
        const redirectTo = params.get("redirect_to") || "/dashboard"
        router.push(redirectTo)
      } else {
        const params = new URLSearchParams(window.location.search)
        const code = params.get("code")
        if (code) {
          await supabase.auth.exchangeCodeForSession(code)
          const redirectTo = params.get("redirect_to") || "/dashboard"
          router.push(redirectTo)
        } else {
          setMode("error")
        }
      }
    })
  }, [router])

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!password || password.length < 6) {
      return toast.error("Password must be at least 6 characters")
    }
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setIsLoading(false)
    if (error) {
      return toast.error(error.message)
    }
    toast.success("Password updated! Redirecting to login...")
    setTimeout(() => router.push("/login"), 2000)
  }

  if (mode === "loading") {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 text-center">
          <p className="text-gray-500">Processing...</p>
        </CardContent>
      </Card>
    )
  }

  if (mode === "error") {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 text-center space-y-4">
          <p className="text-red-500">Invalid or expired link.</p>
          <Button onClick={() => router.push("/forgot-password")}>
            Request new reset link
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Set New Password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              icon={<Lock className="h-4 w-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" loading={isLoading}>
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
