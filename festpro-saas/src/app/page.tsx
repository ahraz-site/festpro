"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight, Sparkles, ShieldCheck, Zap, Trophy, Users, Award, Radio, Globe,
  CheckCircle2, Star, Clock, Flame, ChevronRight, Play, BarChart3, HelpCircle,
  FileText, Smartphone, QrCode, Printer, Layers, Lock, Cpu, WandSparkles,
  ChevronDown, ChevronUp, Check, Building2, Bell, RefreshCw, LayoutGrid, Image as ImageIcon
} from "lucide-react"
import { toast } from "sonner"

import { AhrazFestProLogo } from "@/components/ui/logo"

export default function LightModeFestProLandingPage() {
  const [lang, setLang] = useState<"en" | "ml">("en")
  const [activeTab, setActiveTab] = useState<"coordinators" | "teams" | "judges" | "parents">("coordinators")
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Interactive Live Demo State
  const [teamScores, setTeamScores] = useState({
    redHouse: 154,
    blueHouse: 142,
    greenHouse: 128,
  })

  const [programs, setPrograms] = useState([
    { id: 1, nameEn: "Oppana (Senior)", nameMl: "ഒപ്പന (സീനിയർ)", stageEn: "Stage 1 - Main Stage", stageMl: "സ്റ്റേജ് 1 - മെയിൻ സ്റ്റേജ്", status: "Reporting", chestNo: "102", houseEn: "Red House", houseMl: "റെഡ് ഹൗസ്" },
    { id: 2, nameEn: "Solo Song (Junior)", nameMl: "ലളിതഗാനം (ജൂനിയർ)", stageEn: "Stage 2 - Auditorium", stageMl: "സ്റ്റേജ് 2 - ഓഡിറ്റോറിയം", status: "Started", chestNo: "115", houseEn: "Blue House", houseMl: "ബ്ലൂ ഹൗസ്" },
    { id: 3, nameEn: "Group Dance (General)", nameMl: "സംഘനൃത്തം (ജനറൽ)", stageEn: "Stage 3 - Open Air", stageMl: "സ്റ്റേജ് 3 - ഓപ്പൺ എയർ", status: "Scoring", chestNo: "128", houseEn: "Green House", houseMl: "ഗ്രീൻ ഹൗസ്" },
  ])

  const handleNextAction = (id: number) => {
    setPrograms((prev) =>
      prev.map((prog) => {
        if (prog.id === id) {
          if (prog.status === "Reporting") {
            toast.success(lang === "en" ? `🟢 ${prog.nameEn} started on ${prog.stageEn}!` : `🟢 ${prog.nameMl} മത്സരം ആരംഭിച്ചു!`)
            return { ...prog, status: "Started" }
          } else if (prog.status === "Started") {
            toast.info(lang === "en" ? `📝 ${prog.nameEn} finished. Sent to Judges!` : `📝 ${prog.nameMl} പൂർത്തിയായി. ജഡ്ജുമാർക്ക് അയച്ചു!`)
            return { ...prog, status: "Scoring" }
          } else if (prog.status === "Scoring") {
            setTeamScores((s) => ({ ...s, redHouse: s.redHouse + 10 }))
            toast.success(lang === "en" ? `🎉 ${prog.nameEn} results approved! Leaderboard updated!` : `🎉 ${prog.nameMl} ഫലം തത്സമയം പബ്ലിഷ് ചെയ്തു!`)
            return { ...prog, status: "Published" }
          }
        }
        return prog
      })
    )
  }

  const isMl = lang === "ml"

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-600 selection:text-white overflow-x-hidden max-w-full ${isMl ? "font-anek" : "font-sans"}`}>
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs max-w-full overflow-hidden">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-4 max-w-full">
          <Link href="/" className="flex items-center shrink-0">
            <div className="hidden sm:block">
              <AhrazFestProLogo height={32} />
            </div>
            <div className="sm:hidden">
              <AhrazFestProLogo height={24} />
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors whitespace-nowrap">{isMl ? "പ്രവർത്തന രീതി" : "How it Works"}</a>
            <a href="#demo" className="hover:text-indigo-600 transition-colors whitespace-nowrap">{isMl ? "ലൈവ് സിമുലേറ്റർ" : "Live Demo"}</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors whitespace-nowrap">{isMl ? "ഫീച്ചറുകൾ" : "Features"}</a>
            <a href="#roles" className="hover:text-indigo-600 transition-colors whitespace-nowrap">{isMl ? "ഉപഭോക്തൃ റോളുകൾ" : "Roles"}</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors whitespace-nowrap">{isMl ? "ചോദ്യങ്ങൾ" : "FAQ"}</a>
          </nav>

          {/* Action & Language Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-full border border-slate-200">
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold rounded-full transition-all ${
                  lang === "en" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("ml")}
                className={`px-2 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold rounded-full font-anek transition-all ${
                  lang === "ml" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                മലയാളം
              </button>
            </div>

            <Link
              href="/login"
              className="hidden md:inline-flex items-center text-sm font-semibold text-slate-700 hover:text-indigo-600 px-2 py-1.5 transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 sm:px-6 py-1.5 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/20 active:scale-95 group whitespace-nowrap"
            >
              <span>{isMl ? "ആരംഭിക്കൂ" : "Create Fest"}</span>
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Clean Light Mode */}
      <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-28 overflow-hidden bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] max-w-full">
        {/* Soft Background Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-[700px] h-[300px] sm:h-[500px] bg-gradient-to-tr from-indigo-100 via-purple-100 to-pink-100 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none opacity-70" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs sm:text-sm font-bold text-indigo-700 shadow-2xs">
              <Sparkles className="h-4 w-4 text-indigo-600 animate-spin-slow" />
              <span>
                {isMl ? "കലോത്സവങ്ങൾ ഏറ്റവും വേഗത്തിലും സുഗമമായും നിയന്ത്രിക്കാം" : "THE #1 ALL-IN-ONE FESTIVAL MANAGEMENT PLATFORM"}
              </span>
            </div>

            {/* Headline */}
            <h1 className={`${isMl ? "font-anek font-bold" : "font-heading font-extrabold"} text-4xl sm:text-6xl lg:text-7xl tracking-tight text-slate-900 leading-[1.2]`}>
              {isMl ? (
                <>
                  കലോത്സവങ്ങളിലെ പരാതികളും തടസ്സങ്ങളും ഇല്ലാതെ <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                    സമ്പൂർണ്ണ ഡിജിറ്റൽ പരിഹാരം!
                  </span>
                </>
              ) : (
                <>
                  Organize Flawless Festivals with <br />
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                    100% Real-Time Speed & Zero Paperwork.
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-2xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
              {isMl
                ? "വിദ്യാർത്ഥികളുടെ എൻറോൾമെന്റ്, സ്റ്റേജ് ടൈംടേബിളുകൾ, ജഡ്ജിമാരുടെ സ്കോറിംഗ്, തത്സമയ ഫലപ്രഖ്യാപനം, ക്യുആർ ഐഡി കാർഡുകൾ എന്നിവ ഒരൊറ്റ സ്മാർട്ട് കോൺസോളിൽ."
                : "Automate registrations, stage scheduling, judge scoring, live team point leaderboards, and QR-verified E-certificates in one powerful console."}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-9 py-4 text-lg font-bold text-white transition-all shadow-xl shadow-indigo-600/25 group"
              >
                <span>{isMl ? "നിങ്ങളുടെ ഫെസ്റ്റ് തുടങ്ങൂ (സൗജന്യം)" : "Create Your Fest Free"}</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 px-8 py-4 text-lg font-bold text-slate-800 transition-all shadow-2xs"
              >
                <Play className="h-5 w-5 text-indigo-600 fill-indigo-600" />
                <span>{isMl ? "ലൈവ് പ്രിവ്യൂ സിമുലേറ്റർ" : "Try Interactive Demo"}</span>
              </a>
            </div>

            {/* Trust Metrics */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm text-slate-500 font-semibold border-t border-slate-200/80 max-w-2xl mx-auto">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{isMl ? "100% കൃത്യതയാർന്ന ഫലങ്ങൾ" : "100% Accurate Tabulation"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{isMl ? "തത്സമയ ലൈവ് ലീഡർബോർഡ്" : "Real-time Leaderboard"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{isMl ? "മൊബൈൽ അപ്ലിക്കേഷൻ റെഡി" : "Instant Mobile Access"}</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Control Room Demo (Light Theme Mock) */}
          <div id="demo" className="mt-14 max-w-5xl mx-auto rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-8 shadow-2xl shadow-slate-300/40 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-400 ml-2">festpro.live/stage-control</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isMl ? "ലൈവ് ആനിമേഷൻ കോൺസോൾ" : "Interactive Live Control Room"}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Live Programs Controls */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Radio className="h-5 w-5 text-indigo-600" />
                    <span>{isMl ? "ലൈവ് സ്റ്റേജ് മത്സരങ്ങൾ" : "Live Programs & Stage Actions"}</span>
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">Tap buttons to simulate live events</span>
                </div>

                <div className="space-y-3">
                  {programs.map((prog) => {
                    const statusStyle =
                      prog.status === "Reporting" ? "bg-amber-50 text-amber-800 border-amber-200" :
                      prog.status === "Started" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                      prog.status === "Scoring" ? "bg-purple-50 text-purple-800 border-purple-200" :
                      "bg-indigo-50 text-indigo-800 border-indigo-200"

                    return (
                      <div key={prog.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/80 transition-all">
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm text-slate-900">
                            {isMl ? prog.nameMl : prog.nameEn}
                          </p>
                          <p className="text-xs text-slate-500">
                            {isMl ? prog.stageMl : prog.stageEn} • Chest No: <span className="font-mono font-bold text-slate-800">{prog.chestNo}</span> ({isMl ? prog.houseMl : prog.houseEn})
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusStyle}`}>
                            {prog.status}
                          </span>

                          <button
                            onClick={() => handleNextAction(prog.id)}
                            disabled={prog.status === "Published"}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                              prog.status === "Published"
                                ? "bg-emerald-600 text-white cursor-default"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 cursor-pointer"
                            }`}
                          >
                            {prog.status === "Reporting" ? "Start" : prog.status === "Started" ? "Finish" : prog.status === "Scoring" ? "Publish 🚀" : "Done 🟢"}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Live Team Points Counter */}
              <div className="lg:col-span-5 bg-gradient-to-br from-indigo-50 via-purple-50 to-white p-6 rounded-2xl border border-indigo-200/80 space-y-4 shadow-inner">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Real-Time Leaderboard</span>
                    <h4 className="text-lg font-bold text-slate-900">{isMl ? "ലൈവ് പോയിന്റ് നില" : "Team Scores"}</h4>
                  </div>
                  <Trophy className="h-6 w-6 text-amber-500" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-red-200 shadow-2xs">
                    <span className="text-sm font-bold text-red-700 flex items-center gap-2">🥇 Red House</span>
                    <span className="text-xl font-black text-slate-900 font-mono">{teamScores.redHouse} pts</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-blue-200 shadow-2xs">
                    <span className="text-sm font-bold text-blue-700 flex items-center gap-2">🥈 Blue House</span>
                    <span className="text-xl font-black text-slate-900 font-mono">{teamScores.blueHouse} pts</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                    <span className="text-sm font-bold text-emerald-700 flex items-center gap-2">🥉 Green House</span>
                    <span className="text-xl font-black text-slate-900 font-mono">{teamScores.greenHouse} pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Step-by-Step Workflow ("How FestPro Works") */}
      <section id="how-it-works" className="py-20 bg-white border-t border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
              {isMl ? "4 ലളിതമായ ഘട്ടങ്ങളിൽ കലോത്സവം പൂർത്തിയാക്കാം" : "HOW FESTPRO WORKS IN 4 SIMPLE STEPS"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900">
              {isMl ? "രജിസ്ട്രേഷൻ മുതൽ ഫലപ്രഖ്യാപനം വരെയുള്ള സമ്പൂർണ്ണ പ്രവർത്തനം" : "From Setup to Final Result in 4 Easy Steps"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 hover:border-indigo-400 transition-all hover:shadow-md">
              <div className="flex justify-between items-center">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg">1</div>
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{isMl ? "1. എൻറോൾമെന്റ് & ബൾക്ക് അപ്‌ലോഡ്" : "1. Setup & Bulk Upload"}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isMl
                  ? "Excel ഷീറ്റ് വഴി ആയിരക്കണക്കിന് മത്സരാർത്ഥികളെയും ടീമുകളെയും സെക്കന്റുകൾക്കുള്ളിൽ സിസ്റ്റത്തിലേക്ക് ചേർക്കാം."
                  : "Import 1000+ students and teams from Excel in seconds. Auto-generate chest numbers and registration tags."}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 hover:border-indigo-400 transition-all hover:shadow-md">
              <div className="flex justify-between items-center">
                <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-lg">2</div>
                <LayoutGrid className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{isMl ? "2. സ്‌റ്റേജ് ടൈംടേബിൾ & ചെക്കിൻ" : "2. Scheduling & Stage Call"}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isMl
                  ? "വേദികളിലെ ടൈംടേബിളുകൾ തത്സമയം നിരീക്ഷിക്കാം. വളണ്ടിയർമാർ ക്യുആർ കോഡ് സ്കാൻ ചെയ്ത് ചെക്കിൻ നടത്തുന്നു."
                  : "Manage live stage schedules. Volunteers scan student QR ID cards for instant stage reporting."}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 hover:border-indigo-400 transition-all hover:shadow-md">
              <div className="flex justify-between items-center">
                <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-lg">3</div>
                <FileText className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{isMl ? "3. ഡിജിറ്റൽ ജഡ്ജിംഗ് & കോഡ് നമ്പറുകൾ" : "3. Judging & Code Numbers"}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isMl
                  ? "രഹസ്യ കോഡ് നമ്പറുകൾ നൽകി ജഡ്ജിമാർക്ക് മൊബൈലിൽ മാർക്കുകൾ എന്റർ ചെയ്യാം. സിസ്റ്റം ഓട്ടോമാറ്റിക് ആയി ആകെ മാർക്കുകൾ കാൽക്കുലേറ്റ് ചെയ്യും."
                  : "Secret code letters keep evaluation 100% unbiased. Judges enter scores digitally via mobile app."}
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4 hover:border-indigo-400 transition-all hover:shadow-md">
              <div className="flex justify-between items-center">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-lg">4</div>
                <Trophy className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{isMl ? "4. ലൈവ് ഫലപ്രഖ്യാപനം & സർട്ടിഫിക്കറ്റ്" : "4. Publish & E-Certificates"}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isMl
                  ? "അപ്പ്രൂവ് ചെയ്ത ഉടൻ റിസൾട്ടുകൾ ലൈവ് പോർട്ടലിൽ പ്രസിദ്ധീകരിക്കുന്നു. വിജയികൾക്ക് QR അറ്റാച്ച് ചെയ്ത സർട്ടിഫിക്കറ്റുകൾ റെഡി."
                  : "Approved results publish instantly to the public site. Generate QR-verified photo E-certificates with one click."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: 12 Deep-Dive Feature Modules Grid */}
      <section id="features" className="py-24 bg-[#F8FAFC]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
              {isMl ? "12 സമഗ്ര മോഡ്യൂളുകൾ" : "12 POWERFUL MODULES"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900">
              {isMl ? "കലോത്സവ നടത്തിപ്പിന് ആവശ്യമായ സകല ഫീച്ചറുകളും" : "Everything You Need for a Seamless Festival"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { titleEn: "Live Competition Engine", titleMl: "മത്സര ഇനങ്ങളും സബ് ഗ്രൂപ്പുകളും", descEn: "Single & Group events, age divisions, time limits, and custom evaluation criteria.", icon: Trophy },
              { titleEn: "Judges & Tabulation System", titleMl: "ഡിജിറ്റൽ ജഡ്ജ്മെന്റ് & ടാബുലേഷൻ", descEn: "Criteria-based scoring, tie-breaker rules, and secret code letter masks.", icon: Star },
              { titleEn: "Smart QR ID Cards", titleMl: "QR കോഡ് ഐഡി കാർഡുകൾ", descEn: "Generate PDF ID cards with photos & QR codes for 100% verified student reporting.", icon: QrCode },
              { titleEn: "Live Team Leaderboards", titleMl: "തത്സമയ പോയിന്റ് ലീഡർബോർഡ്", descEn: "Auto-updating House/Team points and individual championship calculations.", icon: BarChart3 },
              { titleEn: "Mobile App & Stage Desk", titleMl: "മൊബൈൽ ആപ്പ് & സ്റ്റേജ് ഡെസ്ക്", descEn: "Volunteers & stage managers check-in participants using phone camera QR scan.", icon: Smartphone },
              { titleEn: "Reports & Printouts", titleMl: "ഔദ്യോഗിക റിപ്പോർട്ടുകളും പ്രിന്റൗട്ടുകളും", descEn: "Print judge scorecards, tabulation sheets, and official result gazettes instantly.", icon: Printer },
              { titleEn: "Custom Domain & Public Portal", titleMl: "കസ്റ്റം ഡൊമെയ്ൻ & പബ്ലിക് പോർട്ടൽ", descEn: "Connect fest.yourdomain.com for audience to view live schedules & published scores.", icon: Globe },
              { titleEn: "AI Assistant & Copilot", titleMl: "AI അസിസ്റ്റന്റ് & ടൈംടേബിൾ ഓപ്റ്റിമൈസർ", descEn: "AI-powered schedule optimization and automated stage announcer scripts.", icon: WandSparkles },
              { titleEn: "Enterprise Security & Roles", titleMl: "സെക്യൂർ റോൾ അസൈൻമെന്റ്", descEn: "Granular access for Organizers, Judges, Stage Desks, and Announcers.", icon: Lock },
              { titleEn: "Poster & Certificate Templates", titleMl: "പോസ്റ്റർ & സർട്ടിഫിക്കറ്റ് ടെംപ്ലേറ്റുകൾ", descEn: "Design custom certificates with school logo, principal signature, and QR code.", icon: ImageIcon },
              { titleEn: "SMS & WhatsApp Notifications", titleMl: "SMS & വാട്ട്‌സാപ്പ് അറിയിപ്പുകൾ", descEn: "Automate stage reporting alerts directly to team managers & participants.", icon: Bell },
              { titleEn: "Sponsorship & Budget Analytics", titleMl: "സ്പോൺസർഷിപ്പ് & ബജറ്റ് ട്രാക്കിംഗ്", descEn: "Track sponsor pledges, receipt generation, and festival expense logs.", icon: Building2 },
            ].map((mod) => {
              const Icon = mod.icon
              return (
                <div key={mod.titleEn} className="bg-white p-6 rounded-2xl border border-slate-200/90 hover:border-indigo-500 shadow-2xs hover:shadow-md transition-all space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{isMl ? mod.titleMl : mod.titleEn}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{isMl ? mod.descEn : mod.descEn}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section 5: Interactive Role-Based Tabs */}
      <section id="roles" className="py-20 bg-white border-t border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
              {isMl ? "ഓരോരുത്തർക്കും ലളിതമാക്കിയ പ്ലാറ്റ്‌ഫോം" : "TAILORED FOR EVERY ROLE"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900">
              {isMl ? "നിങ്ങളുടെ ഉത്തരവാദിത്തം അനുസരിച്ച് എളുപ്പത്തിൽ ഉപയോഗിക്കാം" : "Designed for Coordinators, Judges, Staff & Audience"}
            </h2>
          </div>

          {/* Role Tabs Nav */}
          <div className="flex justify-center gap-2 flex-wrap">
            {[
              { id: "coordinators", labelEn: "Coordinators", labelMl: "കോർഡിനേറ്റർമാർ" },
              { id: "teams", labelEn: "Team Managers", labelMl: "ടീം മാനേജർമാർ" },
              { id: "judges", labelEn: "Judges", labelMl: "ജഡ്ജുമാർ" },
              { id: "parents", labelEn: "Audience & Parents", labelMl: "പ്രേക്ഷകർ & രക്ഷിതാക്കൾ" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeTab === t.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {isMl ? t.labelMl : t.labelEn}
              </button>
            ))}
          </div>

          {/* Role Content Card */}
          <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 p-8 rounded-3xl shadow-xs space-y-4">
            {activeTab === "coordinators" && (
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-slate-900">{isMl ? "കോർഡിനേറ്റർമാർക്ക് സമ്പൂർണ്ണ നിയന്ത്രണം" : "Full Control & Zero Stress for Festival Coordinators"}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {isMl
                    ? "കലോത്സവ ഷെഡ്യൂൾ തയ്യാറാക്കൽ, സ്റ്റേജ് മാനേജ്‌മെന്റ്, റിസൾട്ട് അപ്പ്രൂവൽ എന്നിവ സെക്കന്റുകൾക്കുള്ളിൽ നിയന്ത്രിക്കാം. പരാതികൾ ഇല്ലാതെ 100% സുതാര്യമായി പ്രോഗ്രാം പൂർത്തിയാക്കൂ."
                    : "Oversee all stages simultaneously, review judges' scorecards before publishing, monitor live house points, and export final result gazettes with one click."}
                </p>
              </div>
            )}
            {activeTab === "teams" && (
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-slate-900">{isMl ? "ടീം മാനേജർമാർക്ക് കൃത്യമായ വിവരങ്ങൾ" : "Real-Time Updates for Team Managers"}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {isMl
                    ? "വിദ്യാർത്ഥികൾ ഏത് സ്റ്റേജിൽ എപ്പോൾ എത്തണം എന്ന് മൊബൈലിൽ തത്സമയം കാണാം. അനാവശ്യ ഓട്ടപ്പാച്ചിലുകൾ ഒഴിവാക്കാം."
                    : "Get instant stage callout alerts, view participant schedule timelines, print QR ID tags, and track live team standing on your phone."}
                </p>
              </div>
            )}
            {activeTab === "judges" && (
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-slate-900">{isMl ? "ജഡ്ജുമാർക്ക് ലളിതമായ ഡിജിറ്റൽ സ്കോറിംഗ്" : "Unbiased & Effortless Digital Scoring for Judges"}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {isMl
                    ? "പേപ്പറും പേനയും ഇല്ലാതെ ടാബ്‌ലെറ്റിലോ ഫോണിലോ കോഡ് നമ്പറുകൾ ഉപയോഗിച്ച് സുതാര്യമായി മാർക്ക് നൽകാം."
                    : "Digital scorecards mask participant identities with secret code numbers, ensuring 100% fair and unbiased evaluation."}
                </p>
              </div>
            )}
            {activeTab === "parents" && (
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-slate-900">{isMl ? "പ്രേക്ഷകർക്കും രക്ഷിതാക്കൾക്കും മൊബൈൽ പോർട്ടൽ" : "Live Schedules & Results for Families & Audience"}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {isMl
                    ? "ഏത് വേദിയിലാണ് മത്സരം നടക്കുന്നത് എന്നും തത്സമയ പോയിന്റ് നിലയും അപ്പപ്പോൾ ഫോണിൽ കാണാം."
                    : "Share one simple web link for families to track live stage status, view published results, and follow house points."}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 6: Interactive FAQ Accordion */}
      <section id="faq" className="py-20 bg-[#F8FAFC]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
              {isMl ? "സംശയങ്ങളും മറുപടികളും" : "FREQUENTLY ASKED QUESTIONS"}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              {isMl ? "സാധാരണയായി ചോദിക്കുന്ന ചോദ്യങ്ങൾ" : "Got Questions? We Have Answers"}
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                qEn: "Is FestPro free to try?",
                qMl: "FestPro സൗജന്യമായി ട്രൈ ചെയ്യാൻ സാധിക്കുമോ?",
                aEn: "Yes! FestPro includes a permanently free evaluation plan for up to 20 participants, 2 teams, 5 programs, and 1 stage with no credit card required.",
                aMl: "അതെ! 20 മത്സരാർത്ഥികൾ, 2 ടീമുകൾ, 5 മത്സരങ്ങൾ, 1 വേദി വരെ എപ്പോഴും സൗജന്യമായി ട്രൈ ചെയ്തു നോക്കാവുന്നതാണ്."
              },
              {
                qEn: "Can we use FestPro for School Kalolsavams & Sports Meets?",
                qMl: "സ്‌കൂൾ കലോത്സവങ്ങൾക്കും സ്‌പോർട്സ് മീറ്റുകൾക്കും ഇത് ഉപയോഗിക്കാമോ?",
                aEn: "Absolutely. FestPro supports School Kalolsavams, College Fests, Madrasa Competitions, Sports Meets, and Multi-level Zone/District Fests.",
                aMl: "തീർച്ചയായും! സ്‌കൂൾ കലോത്സവം, കോളേജ് ഫെസ്റ്റ്, മദ്രസ മത്സരങ്ങൾ, സ്‌പോർട്സ് മീറ്റുകൾ എന്നിവയ്ക്ക് ഒരേപോലെ ഉപയോഗിക്കാം."
              },
              {
                qEn: "How does QR Code attendance work?",
                qMl: "QR കോഡ് അറ്റൻഡൻസ് എങ്ങനെ പ്രവർത്തിക്കുന്നു?",
                aEn: "You can print student ID cards containing unique QR codes. Volunteers scan the QR code using any smartphone camera to register stage arrival.",
                aMl: "വിദ്യാർത്ഥികളുടെ ഐഡി കാർഡിലെ ക്യുആർ കോഡ് ഫോൺ ക്യാമറ വഴി സ്കാൻ ചെയ്ത് വളണ്ടിയർമാർക്ക് സ്റ്റേജ് എന്റ്രി രേഖപ്പെടുത്താം."
              },
              {
                qEn: "Can we connect our own custom domain like fest.school.com?",
                qMl: "ഞങ്ങളുടെ സ്വന്തം ഡൊമെയ്ൻ കണക്റ്റ് ചെയ്യാമോ?",
                aEn: "Yes! FestPro supports custom domain integration. You can host your fest under your school or institution's domain name.",
                aMl: "അതെ! നിങ്ങളുടെ സ്വന്തം ഡൊമെയ്ൻ (e.g. fest.school.com) വളരെ എളുപ്പത്തിൽ കണക്റ്റ് ചെയ്യാം."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-slate-900 text-sm sm:text-base hover:bg-slate-50 transition-colors"
                >
                  <span>{isMl ? item.qMl : item.qEn}</span>
                  {openFaq === idx ? <ChevronUp className="h-4 w-4 text-indigo-600 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
                    {isMl ? item.aMl : item.aEn}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: High Conversion Action Banner */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="text-xs font-bold tracking-widest text-indigo-200 uppercase">
                {isMl ? "ഇന്നുതന്നെ ഫെസ്റ്റിവൽ ഡിജിറ്റലാക്കൂ" : "GET STARTED IN 2 MINUTES"}
              </span>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                {isMl
                  ? "നിങ്ങളുടെ അടുത്ത കലോത്സവം FestPro വഴി സ്മാർട്ടാക്കൂ!"
                  : "Start Running Your Fest Without Chaos Today."}
              </h2>

              <p className="text-indigo-100 text-base sm:text-lg">
                {isMl
                  ? "നിമിഷങ്ങൾക്കുള്ളിൽ അക്കൗണ്ട് തുടങ്ങി 20 മത്സരാർത്ഥികൾ വരെ സൗജന്യമായി പരീക്ഷിച്ചു നോക്കൂ."
                  : "Join hundreds of schools and colleges who run stress-free fests with FestPro SaaS."}
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-indigo-900 hover:bg-slate-100 transition-all shadow-xl"
                >
                  <span>{isMl ? "സൗജന്യ അക്കൗണ്ട് ഉണ്ടാക്കൂ 🚀" : "Create Free Fest Account 🚀"}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-400 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AhrazFestProLogo height={28} variant="dark" />
          </div>
          <p>© {new Date().getFullYear()} FestPro Platform Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
