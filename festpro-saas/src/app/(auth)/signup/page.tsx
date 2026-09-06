"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, Eye, EyeOff, Building2, ArrowRight, KeyRound } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { signUp } from "@/lib/actions/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    license_key: "",
    organization_name: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  })
  const [errors, setErrors] = useState({
    license_key: "",
    organization_name: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  })

  function validate() {
    const newErrors = {
      license_key: "",
      organization_name: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
    }
    if (!form.license_key.trim()) newErrors.license_key = "Access Code / License Key is required"
    if (!form.first_name.trim()) newErrors.first_name = "First name is required"
    if (!form.last_name.trim()) newErrors.last_name = "Last name is required"
    if (!form.email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email address"
    if (!form.password) newErrors.password = "Password is required"
    else if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (form.password !== form.confirm_password) newErrors.confirm_password = "Passwords do not match"
    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    const result = await signUp({
      license_key: form.license_key.trim(),
      organization_name: form.organization_name.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      password: form.password,
    })

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }

    toast.success("Account created successfully! Redirecting to sign in...")
    router.push("/login")
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Your Account</CardTitle>
        <CardDescription>Activate your festival management access</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Access Code / License Key */}
          <div className="space-y-2 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl">
            <div className="flex items-center justify-between">
              <Label htmlFor="license_key" className="text-indigo-950 font-semibold flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <KeyRound className="h-4 w-4 text-indigo-600" />
                Access Code / License Key
              </Label>
              <span className="text-[11px] bg-indigo-200/70 text-indigo-900 font-semibold px-2 py-0.5 rounded-full">
                Required
              </span>
            </div>
            <Input
              id="license_key"
              placeholder="e.g. FP-2026-AB12-CD34"
              className="bg-white font-mono uppercase tracking-widest text-sm font-bold text-gray-800"
              value={form.license_key}
              onChange={(e) => setForm({ ...form, license_key: e.target.value.toUpperCase() })}
              error={errors.license_key}
            />
            <p className="text-[11px] text-indigo-700">
              Only organizations with a valid Access Code issued by administration can create an account.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization_name">Organization / College Name</Label>
            <Input
              id="organization_name"
              placeholder="e.g. MES College Arts Club"
              icon={<Building2 className="h-4 w-4" />}
              value={form.organization_name}
              onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                placeholder="John"
                icon={<User className="h-4 w-4" />}
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                error={errors.first_name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                placeholder="Doe"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                error={errors.last_name}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                icon={<Lock className="h-4 w-4" />}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={errors.password}
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
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="Repeat your password"
              icon={<Lock className="h-4 w-4" />}
              value={form.confirm_password}
              onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
              error={errors.confirm_password}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" loading={isLoading}>
            Create Account <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">Sign in</Link>
        </p>
      </CardFooter>
    </Card>
  )
}
