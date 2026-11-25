"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Download, Sparkles, Shield, User, Mail, Lock } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { loginJudgeAction } from "@/lib/actions/judge-auth"
import { ADMIN_EMAILS } from "@/config/admin"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const defaultMode = searchParams.get("mode") === "organizer" ? "organizer" : "judge"
  const prefillUser = searchParams.get("username") || ""

  const [authMode, setAuthMode] = useState<"judge" | "organizer">(defaultMode)
  const [identifier, setIdentifier] = useState(prefillUser) // username or email
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
        toast.success("App installed successfully!")
      }
      setInstallPrompt(null)
    } else {
      toast.info("To install on mobile or desktop, tap 'Add to Home Screen' from browser menu.")
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

    // ────────────────────────────────────────────
    // 1. JUDGE LOGIN (Username based, as in Quaf / Festize)
    // ────────────────────────────────────────────
    if (authMode === "judge" || !isEmail) {
      try {
        const judgeRes = await loginJudgeAction(cleanId, cleanPass)
        if (judgeRes.success && judgeRes.redirectUrl) {
          toast.success(`Welcome Judge ${judgeRes.judge?.name || cleanId}! Loading score console...`)
          window.location.href = judgeRes.redirectUrl
          return
        }

        // If judge login failed but user entered an email, try organizer login below
        if (!isEmail) {
          toast.error(judgeRes.error || "Invalid judge username or password. Check with your festival desk.")
          setIsLoading(false)
          return
        }
      } catch (err: any) {
        console.warn("Judge login attempt error:", err)
      }
    }

    // ────────────────────────────────────────────
    // 2. ORGANIZER / ADMIN LOGIN (Email based)
    // ────────────────────────────────────────────
    try {
      const cleanEmail = cleanId.toLowerCase()
      const isMasterAdmin = ADMIN_EMAILS.includes(cleanEmail) || cleanEmail.startsWith("admin@")
      const supabase = createClient()

      let { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      })

      // Auto-provision master admin on first signin
      if (error && isMasterAdmin) {
        try {
          const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
            email: cleanEmail,
            password: cleanPass,
            options: {
              data: {
                first_name: cleanEmail.split("@")[0],
                role: "platform_owner",
              },
            },
          })
          if (!signUpErr && signUpData.user) {
            toast.success("Master Admin initialized!")
            window.location.href = "/dashboard/admin"
            return
          }
        } catch (e) {
          console.warn("Auto-provision notice:", e)
        }
      }

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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#080d14] text-slate-100">
      {/* ── LEFT HERO BANNER (Exact Festize / Quaf layout) ── */}
      <div className="lg:w-1/2 p-8 sm:p-14 lg:p-20 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-gradient-to-br from-[#0c131d] via-[#091018] to-[#060a0f] relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg">F</span>
            </div>
            <span className="text-xl font-black tracking-tight text-white">FestPro</span>
          </Link>
        </div>

        {/* Center Headline */}
        <div className="my-16 lg:my-auto max-w-lg relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            FROM ENTRIES TO RESULTS
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Keep the whole fest <br className="hidden sm:inline" />
            on the same page.
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed pt-2">
            Set up participants and programs, follow each stage, collect judges&apos; marks, and publish approved results.
          </p>
        </div>

        {/* Left Footer */}
        <div className="relative z-10 text-xs text-slate-500 font-medium">
          Built for school arts, cultural &amp; university fests.
        </div>
      </div>

      {/* ── RIGHT LOGIN CARD (Judges Username & Organizer Login) ── */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Welcome */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-pink-500 to-rose-400 shadow-xl shadow-fuchsia-500/20 mb-2">
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" opacity="0.3" />
                <path d="M12 6a4 4 0 0 0-4 4c0 3 4 8 4 8s4-5 4-8a4 4 0 0 0-4-4z" />
              </svg>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-400">FestPro Portal</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Welcome back</h2>
            <p className="text-xs text-slate-400">
              {authMode === "judge"
                ? "Judges: Enter your assigned username & password to open scoring console"
                : "Organizers & Admins: Sign in with your registered email"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                {authMode === "judge" ? "Username" : "Email"}
              </label>
              <div className="relative">
                <input
                  type={authMode === "judge" ? "text" : "email"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={authMode === "judge" ? "e.g. judge1, judge_stage1" : "you@example.com"}
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                  className="w-full bg-[#111927] border border-slate-700/80 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Password</label>
                {authMode === "organizer" && (
                  <Link href="/forgot-password" className="text-xs text-emerald-400 hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full bg-[#111927] border border-slate-700/80 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Sign in Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm mt-2"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Quick Switch Mode & Install App */}
          <div className="pt-2 space-y-4 text-center">
            {/* Install App button */}
            <button
              onClick={handleInstallApp}
              type="button"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Install app</span>
            </button>

            {/* Toggle Mode Link */}
            <div className="text-xs text-slate-400">
              {authMode === "judge" ? (
                <>
                  Organizing this fest?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("organizer")
                      setIdentifier("")
                    }}
                    className="font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    Sign in with email
                  </button>
                </>
              ) : (
                <>
                  Are you a stage judge?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("judge")
                      setIdentifier("")
                    }}
                    className="font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    Sign in with username
                  </button>
                </>
              )}
            </div>

            {/* Demo judge hint */}
            <div className="pt-2">
              <div className="inline-block bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-400">
                💡 <span className="font-semibold text-slate-300">Stage Judge Login:</span> Username: <span className="text-emerald-400 font-mono">judge1</span> • Password: <span className="text-emerald-400 font-mono">123</span>
              </div>
            </div>
          </div>

          {/* Footer links */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 border-t border-slate-800/80 pt-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
            <span>•</span>
            <span className="text-slate-400">മലയാളം</span>
          </div>
        </div>
      </div>
    </div>
  )
}
