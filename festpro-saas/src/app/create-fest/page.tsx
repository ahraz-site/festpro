"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { createFestOrganizerAction, checkFestSlugAvailabilityAction } from "@/lib/actions/auth"
import { ArrowLeft, Loader2, Globe, Check, Sparkles, AlertCircle } from "lucide-react"
import { FestProLogo } from "@/components/ui/logo"

export default function CreateFestPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [festName, setFestName] = useState("")
  const [festSlug, setFestSlug] = useState("")
  const [isEditingSlug, setIsEditingSlug] = useState(false)
  const [slugStatus, setSlugStatus] = useState<{ available?: boolean; checking?: boolean; message?: string }>({})

  // Account details
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("+91 ")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFestNameChange = (val: string) => {
    setFestName(val)
    if (!isEditingSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
      setFestSlug(generated)
    }
  }

  // Debounced slug check
  useEffect(() => {
    if (!festSlug || festSlug.length < 2) {
      setSlugStatus({})
      return
    }

    const timer = setTimeout(async () => {
      setSlugStatus({ checking: true })
      try {
        const res = await checkFestSlugAvailabilityAction(festSlug)
        setSlugStatus({
          checking: false,
          available: res.available,
          message: res.available
            ? undefined
            : `"${festSlug}.festpro.ahraz.site" is already registered. If you already created it, proceed to sign in; otherwise pick a variation below.`,
        })
      } catch {
        setSlugStatus({ checking: false, available: true })
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [festSlug])

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!festName.trim()) {
      toast.error("Please enter a festival name")
      return
    }
    if (!festSlug.trim()) {
      toast.error("Please specify a festival web address")
      return
    }
    setStep(2)
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Please enter your name")
      return
    }
    if (!email.trim() || !password) {
      toast.error("Please fill in email and password")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      const result = await createFestOrganizerAction({
        fest_name: festName,
        fest_slug: festSlug,
        name,
        email,
        phone,
        password,
      })

      if (result.error) {
        toast.error(result.error)
        setLoading(false)
        if (
          result.error.toLowerCase().includes("taken") ||
          result.error.toLowerCase().includes("registered") ||
          result.error.toLowerCase().includes("step 1")
        ) {
          setStep(1)
          setIsEditingSlug(true)
        }
        return
      }

      if (result.alreadyExisted) {
        toast.success("Welcome back! Opening your festival workspace...")
      } else {
        toast.success("Festival workspace created successfully!")
      }

      router.push(`/dashboard/organization/${result.orgId}/festivals/${result.festivalId}`)
    } catch (err: any) {
      toast.error(err?.message || "Failed to create festival")
      setLoading(false)
    }
  }

  const applySlugVariation = (suffix: string) => {
    const base = festSlug.replace(/-fest|-arts|-2026$/g, "")
    setFestSlug(`${base}-${suffix}`)
    setIsEditingSlug(true)
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col lg:flex-row selection:bg-indigo-600 selection:text-white">
      {/* ── DESKTOP BRAND PANEL (hidden on mobile to prevent scrolling clutter) ── */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0E1424] border-r border-slate-800/80 p-10 lg:p-14 flex-col justify-between">
        <div>
          {/* Logo (pure wordmark) */}
          <Link href="/" className="inline-flex items-center">
            <FestProLogo height={32} variant="white" />
          </Link>

          <div className="mt-16 lg:mt-20 max-w-md">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold tracking-wider uppercase mb-4">
              <Sparkles className="h-3 w-3" /> From Entries to Results
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight">
              Keep the whole fest on the same page.
            </h2>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Set up participants and programs, follow each stage, collect judges&apos; marks, and publish approved results in real-time.
            </p>

            <div className="mt-8 space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <span>Free trial tier: up to 20 participants, 2 teams, 1 stage</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <span>Dedicated festival portal URL on your own slug</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <span>Mobile-ready for on-stage coordinators and judges</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/80 text-xs text-slate-500 flex items-center justify-between">
          <span>Built for arts and cultural fests.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-300">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300">Terms</Link>
            <Link href="/contact" className="hover:text-slate-300">Contact</Link>
          </div>
        </div>
      </div>

      {/* ── RIGHT WIZARD FORM PANEL (Immediate & responsive on mobile) ── */}
      <div className="flex-1 bg-[#0B0F19] p-4 sm:p-8 lg:p-14 flex flex-col justify-center items-center">
        {/* Mobile Header with FestPro Logo */}
        <div className="w-full max-w-xl flex items-center justify-between lg:hidden mb-4 pb-3 border-b border-slate-800/80">
          <Link href="/">
            <FestProLogo height={24} variant="white" />
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Home
          </Link>
        </div>

        <div className="w-full max-w-xl">
          {/* Top navigation row */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <Link href="/" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to FestPro
            </Link>
            <span className="font-semibold text-slate-300">Step {step} of 2</span>
          </div>

          {/* 2-Step Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>

          {/* Title Header */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create your fest
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              Start with up to 20 participants, 2 teams, 5 programs, and 1 stage at no cost. No card required.{" "}
              <Link href="/contact" className="text-indigo-400 hover:underline font-medium">
                Chat about a larger fest.
              </Link>
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-[#12182B] border border-slate-800 rounded-2xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
            {step === 1 ? (
              /* STEP 1: FESTIVAL NAME & WEB ADDRESS */
              <form onSubmit={handleStep1Submit} className="space-y-4 sm:space-y-5">
                <div>
                  <h3 className="text-base font-bold text-white">Name your fest</h3>
                  <p className="text-xs text-slate-400 mt-0.5">You can change these details later.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Fest name
                  </label>
                  <input
                    type="text"
                    required
                    value={festName}
                    onChange={(e) => handleFestNameChange(e.target.value)}
                    placeholder="e.g. Sahityotsav, Arts Fest, Kalolsavam"
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Fest web address
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsEditingSlug(!isEditingSlug)}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                    >
                      {isEditingSlug ? "Done" : "Change"}
                    </button>
                  </div>

                  {isEditingSlug ? (
                    <div className="flex items-center rounded-xl bg-[#0B0F19] border border-indigo-500/60 px-3">
                      <input
                        type="text"
                        value={festSlug}
                        onChange={(e) => setFestSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="myfest"
                        className="bg-transparent py-3 text-sm text-white placeholder-slate-500 focus:outline-none font-mono flex-1"
                      />
                      <span className="text-xs text-slate-400 font-mono">.festpro.ahraz.site</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-slate-300 text-sm font-mono">
                      <span>{festSlug || "yourfest"}.festpro.ahraz.site</span>
                      {slugStatus.checking ? (
                        <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" />
                      ) : slugStatus.available === true ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : slugStatus.available === false ? (
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                      ) : (
                        <Globe className="h-4 w-4 text-indigo-400" />
                      )}
                    </div>
                  )}

                  {slugStatus.available === false && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                      <div className="flex items-start gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <div>
                          <p>{slugStatus.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[11px] text-slate-400">Suggestions:</span>
                            <button
                              type="button"
                              onClick={() => applySlugVariation("fest")}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-mono"
                            >
                              +fest
                            </button>
                            <button
                              type="button"
                              onClick={() => applySlugVariation("arts")}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-mono"
                            >
                              +arts
                            </button>
                            <button
                              type="button"
                              onClick={() => applySlugVariation("2026")}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-mono"
                            >
                              +2026
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 mt-1">
                    Your public results and leaderboards will be available at this domain.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
                >
                  Continue
                </button>

                <p className="text-center text-xs text-slate-400 pt-2">
                  Already have an account?{" "}
                  <Link href="/login" className="text-indigo-400 hover:underline font-semibold">
                    Sign in.
                  </Link>
                </p>
              </form>
            ) : (
              /* STEP 2: ORGANIZER ACCOUNT */
              <form onSubmit={handleStep2Submit} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors mb-2"
                >
                  <ArrowLeft className="h-3 w-3" /> Fest details
                </button>

                <div>
                  <h3 className="text-base font-bold text-white">Create your organizer account</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    You&apos;ll use this account to set up and run <span className="text-indigo-400 font-semibold">{festName}</span>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Muhammed Ruhan PK"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. organizer@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    We&apos;ll use this for your sign-in and account recovery.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 70124 50418"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Include the country code.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Use 8 to 72 characters.</p>
                </div>

                {/* Summary Card */}
                <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{festName}</h4>
                    <p className="text-[11px] text-indigo-400 font-mono mt-0.5">
                      {festSlug}.festpro.ahraz.site
                    </p>
                  </div>
                  <Check className="h-4 w-4 text-emerald-400" />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating your fest...
                    </>
                  ) : (
                    "Create my fest"
                  )}
                </button>

                <p className="text-center text-xs text-slate-400 pt-2">
                  Already have an account?{" "}
                  <Link href="/login" className="text-indigo-400 hover:underline font-semibold">
                    Sign in.
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
