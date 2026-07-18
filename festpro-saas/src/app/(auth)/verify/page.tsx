"use client"

import { Suspense, useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newOtp = [...otp]
    data.split("").forEach((char, i) => { if (i < 6) newOtp[i] = char })
    setOtp(newOtp)
    inputRefs.current[Math.min(data.length, 5)]?.focus()
  }

  async function handleVerify() {
    const code = otp.join("")
    if (code.length !== 6) { toast.error("Please enter the complete 6-digit code"); return }
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "signup" })
    if (error) { toast.error(error.message); setIsLoading(false); return }
    toast.success("Email verified successfully!")
    router.push("/login")
  }

  async function handleResend() {
    if (countdown > 0) return
    const supabase = createClient()
    const { error } = await supabase.auth.resend({ type: "signup", email })
    if (error) toast.error(error.message)
    else { toast.success("Verification code resent"); setCountdown(60) }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>Enter the 6-digit code sent to {email || "your email"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className="flex h-14 w-12 items-center justify-center rounded-lg border border-gray-300 bg-white text-center text-xl font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          ))}
        </div>
        <Button className="w-full" size="lg" onClick={handleVerify} loading={isLoading}>Verify Email</Button>
        <p className="text-center text-sm text-gray-500">
          Didn't receive the code?{" "}
          <button onClick={handleResend} disabled={countdown > 0}
            className="font-medium text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed">
            Resend {countdown > 0 ? `(${countdown}s)` : ""}
          </button>
        </p>
      </CardContent>
    </Card>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<Card className="w-full max-w-md"><CardContent className="p-6 text-center text-gray-500">Loading...</CardContent></Card>}>
      <VerifyForm />
    </Suspense>
  )
}
