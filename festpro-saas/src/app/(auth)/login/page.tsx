"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { ADMIN_EMAILS } from "@/config/admin"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({ email: "", password: "" })

  function validate() {
    const newErrors = { email: "", password: "" }
    if (!form.email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email address"
    if (!form.password) newErrors.password = "Password is required"
    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const cleanEmail = form.email.trim().toLowerCase()
      const isMasterAdmin =
        ADMIN_EMAILS.includes(cleanEmail) || cleanEmail.startsWith("admin@")

      const supabase = createClient()
      let { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: form.password,
      })

      // If master admin and sign-in failed (e.g. initial setup of password), attempt signup
      if (error && isMasterAdmin) {
        try {
          const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
            email: cleanEmail,
            password: form.password,
            options: {
              data: {
                first_name: cleanEmail.split("@")[0],
                role: "platform_owner",
              },
            },
          })

          if (!signUpErr && signUpData.user) {
            toast.success("Master Admin account initialized!")
            window.location.href = "/dashboard/admin"
            return
          }
        } catch (e) {
          console.warn("Auto-provision attempt:", e)
        }
      }

      if (error) {
        toast.error(error.message || "Invalid credentials. Please verify your email and password.")
        setIsLoading(false)
        return
      }

      if (!data?.user) {
        toast.error("Invalid credentials")
        setIsLoading(false)
        return
      }

      toast.success("Welcome back!")
      window.location.href = isMasterAdmin ? "/dashboard/admin" : "/dashboard"
    } catch (err: any) {
      toast.error(err?.message || "Failed to sign in")
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-slate-200/80">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</CardTitle>
        <CardDescription className="text-slate-500">Sign in to your FestPro organizer account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</Label>
              <Link href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                icon={<Lock className="h-4 w-4" />}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 shadow-md shadow-indigo-500/20" size="lg" loading={isLoading}>
            Sign In <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center flex-col gap-2.5 pt-2 border-t border-slate-100">
        <p className="text-sm text-slate-600">
          New organizer?{" "}
          <Link href="/create-fest" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
            Create your fest (Free) →
          </Link>
        </p>
        <p className="text-xs text-slate-500">
          Need an Enterprise License?{" "}
          <Link href="/contact" className="font-medium text-indigo-600 hover:text-indigo-700">
            Contact Sales
          </Link>
        </p>
        <p className="text-xs text-slate-400">
          Already have an enterprise license key?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Activate License
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
