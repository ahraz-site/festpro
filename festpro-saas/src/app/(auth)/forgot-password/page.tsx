"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Mail, ArrowLeft, Send, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { resetPassword } from "@/lib/actions/auth"

function ForgotPasswordForm() {
  const searchParams = useSearchParams()
  const isExpired = searchParams.get("error") === "expired"
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return toast.error("Please enter your email")

    setIsLoading(true)
    const result = await resetPassword({ email })

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }

    setSent(true)
    setIsLoading(false)
    toast.success("Password reset link sent to your email")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        {isExpired && !sent && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-xs font-medium text-amber-800 border border-amber-200 text-left">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Your password reset link has expired or was already used. Please enter your email below to receive a new link.</span>
          </div>
        )}
        <CardTitle className="text-2xl">{sent ? "Check Your Email" : "Reset Password"}</CardTitle>
        <CardDescription>
          {sent
            ? "We've sent a password reset link to your email. Please check your inbox."
            : "Enter your email and we'll send you a reset link"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Send className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or{" "}
              <button onClick={() => setSent(false)} className="text-indigo-600 hover:underline font-medium">
                try again
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
              {isLoading ? "Sending link..." : "Send reset link"}
            </Button>
          </form>
        )}
        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center text-sm text-indigo-600 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<Card className="w-full max-w-md p-6 text-center">Loading...</Card>}>
      <ForgotPasswordForm />
    </Suspense>
  )
}
