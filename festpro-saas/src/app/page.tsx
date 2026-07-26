"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowRight, Sparkles, ShieldCheck, Zap, Trophy, Users, Award, Radio, Globe2,
  CheckCircle2, Star, Clock, Flame, ChevronRight, Play, BarChart3, HelpCircle,
  FileCheck2, Smartphone, Cpu, Check, MessageSquare, QrCode
} from "lucide-react"
import { toast } from "sonner"

export default function FestProHighConvertingLandingPage() {
  const [lang, setLang] = useState<"en" | "ml">("en")

  // Psychological Live Demo State - FestPro Live Simulator
  const [liveStageStatus, setLiveStageStatus] = useState("started")
  const [teamScores, setTeamScores] = useState({
    redHouse: 145,
    blueHouse: 138,
    greenHouse: 120,
  })

  // Simulated Live Score Updates
  const handlePublishScore = () => {
    setTeamScores((prev) => ({
      ...prev,
      redHouse: prev.redHouse + 10,
      blueHouse: prev.blueHouse + 5,
    }))
    toast.success(
      lang === "en"
        ? "⚡ Marks Approved! Live Leaderboard Updated + SMS Sent to Managers!"
        : "⚡ മാർക്കുകൾ അപ്പ്രൂവ് ചെയ്തു! ലൈവ് ലീഡർബോർഡും SMS-ഉം അപ്‌ഡേറ്റായി!"
    )
  }

  const isMl = lang === "ml"

  return (
    <div className={`min-h-screen bg-[#090D16] text-white selection:bg-indigo-500 selection:text-white ${isMl ? "font-anek" : "font-sans"}`}>
      {/* Top Header with Glassmorphism */}
      <header className="sticky top-0 z-50 bg-[#090D16]/80 backdrop-blur-xl border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-black text-xl shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              F
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                FestPro
              </span>
              <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase -mt-1">
                SaaS Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">{isMl ? "ഫീച്ചറുകൾ" : "Features"}</a>
            <a href="#live-demo" className="hover:text-white transition-colors">{isMl ? "ലൈവ് സിമുലേറ്റർ" : "Live Demo"}</a>
            <a href="#why-festpro" className="hover:text-white transition-colors">{isMl ? "എന്തുകൊണ്ട് FestPro?" : "Why FestPro?"}</a>
            <a href="#testimonials" className="hover:text-white transition-colors">{isMl ? "അഭിപ്രായങ്ങൾ" : "Reviews"}</a>
          </nav>

          {/* Action & Language Toggle */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-white/10 p-1 rounded-full border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  lang === "en" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("ml")}
                className={`px-3 py-1 text-xs font-bold rounded-full font-anek transition-all ${
                  lang === "ml" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                മലയാളം
              </button>
            </div>

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-2.5 text-sm font-bold text-white hover:opacity-95 transition-all shadow-lg shadow-indigo-500/25 active:scale-95 group"
            >
              <span>{isMl ? "സൗജന്യമായി ആരംഭിക്കൂ" : "Get Started Free"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - High Psychology Conversion */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-pink-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm font-semibold text-indigo-300 backdrop-blur-md shadow-inner">
              <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
              <span>
                {isMl ? "500+ സ്‌കൂളുകളും കോളേജുകളും ഉപയോഗിക്കുന്ന #1 കലോത്സവ സോഫ്റ്റ്‌വെയർ" : "Trusted by 500+ Schools & Colleges Across Kerala"}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
              {isMl ? (
                <>
                  കലോത്സവങ്ങളിലെ പരാതികളും വൈകലും <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                    100% ഇല്ലാതാക്കാം!
                  </span>
                </>
              ) : (
                <>
                  Eliminate 99% of Kalolsavam <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                    Chaos, Delays & Mistakes.
                  </span>
                </>
              )}
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-2xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed">
              {isMl
                ? "ലൈവ് സ്കോറിംഗ്, തത്സമയ പബ്ലിഷിംഗ്, ക്യുആർ കോഡ് പ്രിന്റിംഗ്, ഫോട്ടോ സർട്ടിഫിക്കറ്റ് — എല്ലാം ഒരൊറ്റ എന്റർപ്രൈസ് പ്ലാറ്റ്‌ഫോമിൽ."
                : "The all-in-one AI-powered SaaS suite for school kalolsavams, college fests, and sports meets. Zero paperwork. Instant result publishing."}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-9 py-4 text-lg font-bold text-white hover:scale-105 transition-all shadow-xl shadow-indigo-600/30 group"
              >
                <span>{isMl ? "ഫെസ്റ്റ് ആരംഭിക്കൂ (സൗജന്യം)" : "Create Your Fest Free"}</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#live-demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 px-8 py-4 text-lg font-bold text-white transition-all backdrop-blur-md"
              >
                <Play className="h-5 w-5 fill-white text-white" />
                <span>{isMl ? "ലൈവ് സിമുലേറ്റർ കാണുക" : "Try Interactive Demo"}</span>
              </a>
            </div>

            {/* Social Proof Mini Bar */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm text-slate-400 font-semibold border-t border-white/10 max-w-2xl mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{isMl ? "ഓട്ടോമാറ്റിക് ഗ്രേഡ് കാൽക്കുലേഷൻ" : "Automatic Grade Calculation"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{isMl ? "QR അറ്റൻഡൻസ് & ഐഡി കാർഡ്" : "QR Attendance & ID Cards"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{isMl ? "മൊബൈൽ ആപ്പ് റെഡി" : "Mobile App Sync"}</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Simulator Component (FestPro Interactive Control Desk) */}
          <div id="live-demo" className="mt-16 max-w-5xl mx-auto rounded-3xl bg-slate-900/90 border border-indigo-500/30 p-4 sm:p-8 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-3 w-3 rounded-full bg-red-500" />
                <div className="flex h-3 w-3 rounded-full bg-amber-500" />
                <div className="flex h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono font-bold text-slate-400 ml-2">festpro.live/control-center</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold animate-pulse">
                <Radio className="h-3.5 w-3.5" />
                <span>{isMl ? "ലൈവ് സിമുലേഷൻ കൺസോൾ" : "Interactive Live Console"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Live Program Manager */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <span>{isMl ? "സ്റ്റേജ് 1: മാപ്പിളപ്പാട്ട് (സീനിയർ)" : "Stage 1: Oppana (Senior Girls)"}</span>
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ON STAGE 🔴
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Chest No: <strong className="text-white">104</strong></span>
                    <span>Judges Scored: <strong className="text-emerald-400">3 / 3</strong></span>
                  </div>
                  <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl">
                    <div>
                      <p className="text-sm font-bold text-white">Aysha & Team (Red House)</p>
                      <p className="text-xs text-indigo-300">Grade A • 28/30 Marks</p>
                    </div>
                    <button
                      onClick={handlePublishScore}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      {isMl ? "റിസൾട്ട് പബ്ലിഷ് ചെയ്യുക 🚀" : "Approve & Publish Live 🚀"}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 italic">
                  💡 {isMl ? "മുകളിൽ 'റിസൾട്ട് പബ്ലിഷ് ചെയ്യുക' ക്ലിക്ക് ചെയ്ത് പോയിന്റ് നില മാറുന്നത് കാണുക!" : "Click 'Approve & Publish Live' above to see the real-time score counter update below!"}
                </p>
              </div>

              {/* Right Live Leaderboard Counter */}
              <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950/80 to-purple-950/80 p-6 rounded-2xl border border-indigo-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-indigo-200 uppercase tracking-wider">
                    {isMl ? "തത്സമയ പോയിന്റ് നില (Live Points)" : "Live Team Leaderboard"}
                  </h4>
                  <BarChart3 className="h-4 w-4 text-indigo-400" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/10">
                    <span className="text-sm font-bold text-red-300">🥇 Red House</span>
                    <span className="text-lg font-black text-white">{teamScores.redHouse} pts</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/10">
                    <span className="text-sm font-bold text-blue-300">🥈 Blue House</span>
                    <span className="text-lg font-black text-white">{teamScores.blueHouse} pts</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/10">
                    <span className="text-sm font-bold text-emerald-300">🥉 Green House</span>
                    <span className="text-lg font-black text-white">{teamScores.greenHouse} pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Why 500+ Institutions Trust FestPro (Psychological Benefits Grid) */}
      <section id="why-festpro" className="py-24 bg-[#0D1322] border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
              {isMl ? "എന്തുകൊണ്ട് FESTPRO?" : "WHY FESTPRO SAAS?"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              {isMl ? "നിങ്ങളുടെ കലോത്സവത്തിന്റെ ആകെ മാറ്റ് കൂട്ടുന്ന 6 പ്രധാന ഫീച്ചറുകൾ" : "6 Game-Changing Features Built for Modern Fests"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4 hover:border-indigo-500/50 hover:bg-white/10 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {isMl ? "തത്സമയ ലൈവ് റിസൾട്ട് പബ്ലിഷിംഗ്" : "Instant Live Result Publishing"}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isMl
                  ? "മാർക്കുകൾ ഉറപ്പുവരുത്തുന്ന അതേ സെക്കന്റിൽ വെബ്‌സൈറ്റിലും ഡിസ്‌പ്ലേ ബോർഡുകളിലും റിസൾട്ട് പബ്ലിഷ് ആവും."
                  : "Zero waiting time. Approved marks instantly update the public leaderboard, mobile app, and display screens."}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4 hover:border-purple-500/50 hover:bg-white/10 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {isMl ? "QR കോഡ് ഐഡി കാർഡ് & അറ്റൻഡൻസ്" : "Smart QR ID Cards & Attendance"}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isMl
                  ? "മത്സരാർത്ഥികൾക്ക് QR കോഡ് ഉള്ള ഐഡി കാർഡുകൾ കൊടുക്കാം. സ്റ്റേജ് എന്റ്രികളിൽ ക്യുആർ സ്കാൻ ചെയ്ത് ചെക്കിൻ നടത്താം."
                  : "Generate & print official QR ID cards. Volunteers scan QR codes at stage desks for 100% verified reporting."}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4 hover:border-pink-500/50 hover:bg-white/10 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {isMl ? "ഓട്ടോമാറ്റിക് E-സർട്ടിഫിക്കറ്റ് പ്രിന്റിംഗ്" : "One-Click E-Certificate Generator"}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isMl
                  ? "വിജയികൾക്ക് ക്യുആർ വെരിഫൈ ചെയ്ത ഫോട്ടോ പതിച്ച ഡിജിറ്റൽ സർട്ടിഫിക്കറ്റുകൾ ഒറ്റ ക്ലിക്കിൽ ജനറേറ്റ് ചെയ്യാം."
                  : "Generate high-resolution digital certificates with student photo and verification QR codes automatically."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: High Conversion Dark Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-8 sm:p-14 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-6">
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                {isMl
                  ? "ഇന്നുതന്നെ നിങ്ങളുടെ ഫെസ്റ്റിവൽ FestPro-യിലേക്ക് മാറ്റൂ!"
                  : "Ready to Transform Your Next Festival?"}
              </h2>
              <p className="text-slate-300 text-base sm:text-lg">
                {isMl
                  ? "20 മത്സരാർത്ഥികൾ വരെ എപ്പോഴും സൌജന്യമായി ഉപയോഗിക്കാം. യാതൊരു ക്രെഡിറ്റ് കാർഡും ആവശ്യമില്ല."
                  : "Start free with up to 20 participants, 2 teams, and 5 competitions. Setup takes less than 2 minutes."}
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-indigo-950 hover:bg-slate-100 transition-all shadow-xl"
                >
                  <span>{isMl ? "സൗജന്യ അക്കൗണ്ട് ഉണ്ടാക്കൂ" : "Create Free Fest Account"}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#060910] border-t border-white/10 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold">F</div>
            <span className="font-bold text-slate-300 text-sm">FestPro SaaS Suite</span>
          </div>
          <p>© {new Date().getFullYear()} FestPro Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
