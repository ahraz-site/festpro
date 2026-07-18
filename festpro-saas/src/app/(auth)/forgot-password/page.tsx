"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { resetPassword } from "@/lib/actions/auth"

export default function ForgotPasswordPage() {
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                icon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              Send Reset Link
            </Button>
          </form>
        )}
      </CardContent>
      <div className="pb-6 text-center">
        <Link href="/login" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    </Card>
  )
}
