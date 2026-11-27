"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Download } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { loginJudgeAction } from "@/lib/actions/judge-auth"
import { loginStaffAction } from "@/lib/actions/staff-auth"
import { ADMIN_EMAILS } from "@/config/admin"
import { FesProLogo, FesProFavicon } from "@/components/ui/logo"

export default function LoginPage() {
  const searchParams = useSearchParams()

  const defaultMode = searchParams.get("mode") === "organizer" ? "organizer" : "judge"
  const prefillUser = searchParams.get("username") || ""

  const [authMode, setAuthMode] = useState<"judge" | "organizer">(defaultMode)
  const [identifier, setIdentifier] = useState(prefillUser)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstallApp = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === "accepted") {
        toast.success("FesPro app installed successfully!")
      }
      setInstallPrompt(null)
    } else {
      toast.info("To install on mobile or desktop, choose 'Add to Home Screen' in your browser menu.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanId = identifier.trim()
    const cleanPass = password.trim()

    if (!cleanId || !cleanPass) {
      toast.error("Please enter your " + (authMode === "judge" ? "username" : "email") + " and password.")
      return
    }

    setIsLoading(true)
    const isEmail = cleanId.includes("@")

    // 1. FESTIVAL STAFF & JUDGE LOGIN (Username based)
    if (authMode === "judge" || !isEmail) {
      try {
        const staffRes = await loginStaffAction(cleanId, cleanPass)
        if (staffRes.success && staffRes.redirectUrl) {
          toast.success(`Welcome ${staffRes.member?.name || cleanId}!`)
          window.location.href = staffRes.redirectUrl
          return
        }

        const judgeRes = await loginJudgeAction(cleanId, cleanPass)
        if (judgeRes.success && judgeRes.redirectUrl) {
          toast.success(`Welcome Judge ${judgeRes.judge?.name || cleanId}!`)
          window.location.href = judgeRes.redirectUrl
          return
        }

        if (!isEmail) {
          toast.error(staffRes.error || judgeRes.error || "Invalid username or password. Check with your festival administrator.")
          setIsLoading(false)
          return
        }
      } catch (err: any) {
        console.warn("Staff login attempt error:", err)
      }
    }

    // 2. ORGANIZER / ADMIN LOGIN (Email based)
    try {
      const cleanEmail = cleanId.toLowerCase()
      const isMasterAdmin = ADMIN_EMAILS.includes(cleanEmail) || cleanEmail.startsWith("admin@")
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      })

      if (error) {
        toast.error(error.message || "Invalid credentials. Please verify your email and password.")
        setIsLoading(false)
        return
      }

      if (data?.user) {
        toast.success("Signed in successfully!")
        window.location.href = isMasterAdmin ? "/dashboard/admin" : "/dashboard"
        return
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] text-slate-900 font-sans">
      {/* ── LEFT BRAND SHOWCASE PANEL (FesPro Gradient Identity) ── */}
      <div className="lg:w-1/2 p-8 sm:p-14 lg:p-20 flex flex-col justify-between bg-gradient-to-br from-[#2181c5] via-[#663fae] to-[#d14091] text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/15 rounded-full blur-3xl pointer-events-none" />

        {/* FesPro Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <FesProLogo variant="white" height={30} />
          </Link>
        </div>

        {/* Center Headline */}
        <div className="my-14 lg:my-auto max-w-lg relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/90 bg-white/15 px-3 py-1 rounded-full backdrop-blur-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            FROM ENTRIES TO RESULTS
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Keep the whole fest <br className="hidden sm:inline" />
            on the same page.
          </h1>
          <p className="text-sm sm:text-base text-white/85 leading-relaxed pt-2">
            Set up participants and programs, manage live stages, collect judges&apos; marks securely, and publish instant results on your festival portal.
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/75 font-medium">
          FesPro Enterprise SaaS · Built for arts, cultural &amp; university festivals.
        </div>
      </div>

      {/* ── RIGHT LOGIN CARD (Staff/Judge Username & Organizer Login) ── */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md space-y-7">
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center justify-center mb-1">
              <FesProFavicon size={52} />
            </div>
            <div className="text-xs font-black uppercase tracking-widest text-indigo-600">
              FesPro Console Access
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {authMode === "judge"
                ? "Judges & Staff: Sign in with your assigned username & password"
                : "Organizers & Admins: Sign in with your registered email"}
            </p>
          </div>

          {/* Mode Toggle Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode("judge")
                setIdentifier("")
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === "judge"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Judge &amp; Staff Login
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("organizer")
                setIdentifier("")
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === "organizer"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Organizer Email
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {authMode === "judge" ? "Username" : "Email Address"}
              </label>
              <input
                type={authMode === "judge" ? "text" : "email"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={authMode === "judge" ? "Enter assigned username" : "you@organization.com"}
                autoCapitalize="none"
                autoCorrect="off"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Password</label>
                {authMode === "organizer" && (
                  <Link href="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#2181c5] via-[#663fae] to-[#d14091] hover:opacity-95 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm mt-2"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Sign in to FesPro</span>
              )}
            </button>
          </form>

          <div className="pt-1 text-center space-y-3">
            <button
              onClick={handleInstallApp}
              type="button"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-indigo-600" />
              <span>Install FesPro app</span>
            </button>

            <div className="text-xs text-slate-500">
              Don&apos;t have a festival yet?{" "}
              <Link href="/create-fest" className="font-bold text-indigo-600 hover:underline">
                Create your festival
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 border-t border-slate-100 pt-5">
            <Link href="/privacy" className="hover:text-slate-700 transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-700 transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-slate-700 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
