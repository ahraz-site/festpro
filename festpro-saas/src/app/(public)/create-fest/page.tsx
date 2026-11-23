"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { createFestOrganizerAction } from "@/lib/actions/auth"
import { ArrowLeft, Loader2, Eye, EyeOff, Globe, Check, Sparkles, ShieldCheck } from "lucide-react"

export default function CreateFestPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [festName, setFestName] = useState("")
  const [festSlug, setFestSlug] = useState("")
  const [isEditingSlug, setIsEditingSlug] = useState(false)

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
        return
      }

      toast.success("Festival workspace created successfully!")
      router.push(`/dashboard/organization/${result.orgId}/festivals/${result.festivalId}`)
    } catch (err: any) {
      toast.error(err?.message || "Failed to create festival")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070E0D] text-white flex flex-col lg:flex-row selection:bg-emerald-500 selection:text-black">
      {/* LEFT BRAND PANEL */}
      <div className="lg:w-5/12 bg-[#0A1614] border-b lg:border-b-0 lg:border-r border-white/5 p-8 lg:p-14 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              F
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight text-white">
              FestPro
            </span>
          </Link>

          <div className="mt-16 lg:mt-24 max-w-md">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wider uppercase mb-4">
              <Sparkles className="h-3 w-3" /> From Entries to Results
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight">
              Keep the whole fest on the same page.
            </h2>
            <p className="mt-5 text-sm sm:text-base text-slate-400 leading-relaxed">
              Set up participants and programs, follow each stage, collect judges&apos; marks, and publish approved results in real-time.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 text-xs text-slate-500 flex items-center justify-between">
          <span>Built for school arts and cultural fests.</span>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-slate-400">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-400">Terms</Link>
            <Link href="/contact" className="hover:text-slate-400">Contact</Link>
          </div>
        </div>
      </div>

      {/* RIGHT WIZARD PANEL */}
      <div className="flex-1 bg-[#070E0D] p-6 sm:p-10 lg:p-16 flex flex-col justify-center items-center">
        <div className="w-full max-w-xl">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
            <Link href="/" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to FestPro
            </Link>
            <span className="font-semibold text-slate-300">Step {step} of 2</span>
          </div>

          {/* 2-Step Progress Bar */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create your fest
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
              Start with up to 20 participants, 2 teams, 5 programs, and 1 stage at no cost. No card required.{" "}
              <Link href="/contact" className="text-emerald-400 hover:underline font-medium">
                Chat about a larger fest.
              </Link>
            </p>
          </div>

          {/* FORM CONTAINER CARD */}
          <div className="bg-[#111F1D] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {step === 1 ? (
              /* STEP 1: FESTIVAL NAME & WEB ADDRESS */
              <form onSubmit={handleStep1Submit} className="space-y-5">
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
                    placeholder="e.g. Sahityotsav, Aroz, Arts Fest"
                    className="w-full px-4 py-3 rounded-xl bg-[#091413] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
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
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      {isEditingSlug ? "Done" : "Change"}
                    </button>
                  </div>

                  {isEditingSlug ? (
                    <div className="flex items-center rounded-xl bg-[#091413] border border-emerald-500/50 px-3">
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
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#091413] border border-white/10 text-slate-300 text-sm font-mono">
                      <span>{festSlug || "yourfest"}.festpro.ahraz.site</span>
                      <Globe className="h-4 w-4 text-emerald-400" />
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1">
                    Your public results and leaderboards will be available at this domain.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                >
                  Continue
                </button>

                <p className="text-center text-xs text-slate-400 pt-2">
                  Already have an account?{" "}
                  <Link href="/login" className="text-white hover:text-emerald-400 underline font-semibold">
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
                    You&apos;ll use this account to set up and run <span className="text-emerald-400 font-medium">{festName}</span>.
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#091413] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#091413] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-[#091413] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
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
                      placeholder="��������"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#091413] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 pr-16"
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
                <div className="bg-[#091413] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{festName}</h4>
                    <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                      {festSlug}.festpro.ahraz.site
                    </p>
                  </div>
                  <Check className="h-4 w-4 text-emerald-400" />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
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
                  <Link href="/login" className="text-white hover:text-emerald-400 underline font-semibold">
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
