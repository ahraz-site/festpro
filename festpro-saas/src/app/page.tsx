"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Sparkles, ArrowRight, CheckCircle2, Trophy, Users, Award, Radio, Globe,
  ShieldCheck, Zap, Clock, ChevronRight, Play, ExternalLink, Calendar,
  LayoutDashboard, Layers, Smartphone, Check
} from "lucide-react"
import { AhrazFestProLogo } from "@/components/ui/logo"

export default function FestProLandingPage() {
  const [lang, setLang] = useState<"en" | "ml">("en")
  const isMl = lang === "ml"

  // Live Demo programs state matching Festize screenshot with FestPro branding
  const [demoPrograms, setDemoPrograms] = useState([
    {
      id: 1,
      nameEn: "Solo song",
      nameMl: "ലളിതഗാനം",
      categoryEn: "Junior",
      categoryMl: "ജൂനിയർ",
      stageEn: "Main stage",
      stageMl: "സ്റ്റേജ് 1",
      status: "Reporting",
      actionEn: "Start program",
      actionMl: "ആരംഭിക്കുക",
    },
    {
      id: 2,
      nameEn: "Group dance",
      nameMl: "സംഘനൃത്തം",
      categoryEn: "Senior",
      categoryMl: "സീനിയർ",
      stageEn: "Auditorium",
      stageMl: "ഓഡിറ്റോറിയം",
      status: "Started",
      actionEn: "Finish program",
      actionMl: "പൂർത്തിയാക്കുക",
    },
    {
      id: 3,
      nameEn: "Poetry",
      nameMl: "കവിതാരചന",
      categoryEn: "General",
      categoryMl: "ജനറൽ",
      stageEn: "Room 2",
      stageMl: "റൂം 2",
      status: "Scoring",
      actionEn: "Review",
      actionMl: "റിവ്യൂ",
    },
  ])

  const handleDemoAction = (id: number) => {
    setDemoPrograms((prev) =>
      prev.map((prog) => {
        if (prog.id === id) {
          if (prog.status === "Reporting") {
            toast.success(isMl ? `🟢 ${prog.nameMl} മത്സരം ആരംഭിച്ചു!` : `🟢 Started ${prog.nameEn} on ${prog.stageEn}!`)
            return { ...prog, status: "Started", actionEn: "Finish program", actionMl: "പൂർത്തിയാക്കുക" }
          } else if (prog.status === "Started") {
            toast.info(isMl ? `📝 ${prog.nameMl} പൂർത്തിയായി! ജഡ്ജ്മാർക്ക് മാർക്ക് നൽകാം.` : `📝 ${prog.nameEn} finished! Handed over to judges.`)
            return { ...prog, status: "Scoring", actionEn: "Review", actionMl: "റിവ്യൂ" }
          } else if (prog.status === "Scoring") {
            toast.success(isMl ? `🎉 ${prog.nameMl} റിസൾട്ട് പബ്ലിഷ് ചെയ്തു!` : `🎉 ${prog.nameEn} results approved & published!`)
            return { ...prog, status: "Published", actionEn: "Completed", actionMl: "പൂർത്തിയായി" }
          }
        }
        return prog
      })
    )
  }

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-600 selection:text-white font-sans antialiased ${isMl ? "font-anek" : ""}`}>
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <AhrazFestProLogo height={30} showIcon={true} />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
              {isMl ? "പ്രവർത്തന രീതി" : "How it Works"}
            </a>
            <a href="#demo" className="hover:text-indigo-600 transition-colors">
              {isMl ? "ലൈവ് പ്രിവ്യൂ" : "Live Demo"}
            </a>
            <a href="#domains" className="hover:text-indigo-600 transition-colors">
              {isMl ? "സ്വന്തം ഡൊമൈൻ" : "Subdomains"}
            </a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              {isMl ? "ഫീച്ചറുകൾ" : "Features"}
            </a>
            <Link href="/pricing" className="hover:text-indigo-600 transition-colors">
              {isMl ? "വിലവിവരങ്ങൾ" : "Pricing"}
            </Link>
          </nav>

          {/* Right Actions & Language Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200">
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-full transition-all ${
                  lang === "en" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("ml")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-full font-anek transition-all ${
                  lang === "ml" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                മലയാളം
              </button>
            </div>

            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 px-2.5 py-2 transition-colors"
            >
              {isMl ? "പ്രവേശിക്കുക" : "Sign in"}
            </Link>

            <Link
              href="/create-fest"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/20 active:scale-95 whitespace-nowrap"
            >
              <span>{isMl ? "ഫെസ്റ്റ് സൃഷ്ടിക്കുക" : "Create your fest"}</span>
              <span className="text-indigo-200">↗</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100">
        {/* Soft Background Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[350px] bg-gradient-to-tr from-indigo-200/50 via-purple-200/40 to-pink-100/30 rounded-full blur-[120px] pointer-events-none opacity-70" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-indigo-700 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>
                  {isMl ? "സ്കൂൾ, കോളേജ് & സെക്ടർ കലോത്സവ മാനേജ്‌മെന്റ് സോഫ്റ്റ്‌വെയർ" : "SCHOOL, ARTS & CULTURAL FESTIVAL SOFTWARE"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[58px] font-black tracking-tight text-slate-900 leading-[1.15] font-heading">
                {isMl ? (
                  <>
                    സ്പ്രെഡ്ഷീറ്റുകളും സ്കോർഷീറ്റുകളും ഇല്ലാതെ <br />
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                      ഫെസ്റ്റുകൾ കൃത്യതയോടെ നടത്താം.
                    </span>
                  </>
                ) : (
                  <>
                    Run your fest without chasing <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                      spreadsheets, score sheets, and stage updates.
                    </span>
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {isMl
                  ? "പങ്കെടുക്കുന്നവരെയും മത്സരങ്ങളെയും ക്രമീകരിക്കുക, സ്റ്റേജുകൾ തത്സമയം നിരീക്ഷിക്കുക, ജഡ്ജുമാരുടെ മാർക്കുകൾ ശേഖരിച്ച് അംഗീകരിച്ച റിസൾട്ടുകൾ നിമിഷങ്ങൾക്കകം പബ്ലിഷ് ചെയ്യുക."
                  : "Set up participants and programs, keep stages moving, collect judges' marks, and publish approved results in one place."}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/create-fest"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 px-6 sm:px-7 py-3.5 text-sm sm:text-base font-bold text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 active:scale-95 group"
                >
                  <span>{isMl ? "ഫെസ്റ്റ് ആരംഭിക്കുക" : "Create your fest"}</span>
                  <span className="text-indigo-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                </Link>

                <a
                  href="#demo"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-indigo-600 px-4 py-3.5 transition-colors"
                >
                  <span>{isMl ? "പ്രവർത്തനം എങ്ങനെയെന്ന് കാണുക" : "See what FestPro does"}</span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </a>
              </div>

              {/* Quick Trust Points */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {isMl ? "2 മിനിറ്റിൽ റെഡി" : "Ready in 2 minutes"}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {isMl ? "സ്വന്തം സബ്ഡൊമൈൻ URL" : "Custom Subdomain URL"}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {isMl ? "മൊബൈൽ ഫ്രണ്ട്‌ലി" : "Mobile Optimized"}
                </span>
              </div>
            </div>

            {/* Right Interactive Mockup (FestPro Signature Style) */}
            <div id="demo" className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 border border-slate-200/90 overflow-hidden">
                {/* Window Header */}
                <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 font-heading">FestPro Control Room</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                  </span>
                </div>

                {/* Control Room Box */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-medium block uppercase tracking-wider">
                        {isMl ? "ലൈവ് നിയന്ത്രണം" : "Control room"}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">
                        {isMl ? "നടന്നുകൊണ്ടിരിക്കുന്ന മത്സരങ്ങൾ" : "Live programs"}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {isMl ? "എല്ലാ സ്റ്റേജുകളും" : "All stages"}
                    </span>
                  </div>

                  {/* Program Rows */}
                  <div className="space-y-2.5 pt-1">
                    {/* Header Columns */}
                    <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                      <div className="col-span-4">{isMl ? "മത്സരം" : "Program"}</div>
                      <div className="col-span-3">{isMl ? "സ്റ്റേജ്" : "Stage"}</div>
                      <div className="col-span-2">{isMl ? "നില" : "Status"}</div>
                      <div className="col-span-3 text-right">{isMl ? "നടപടി" : "Next"}</div>
                    </div>

                    {/* Program Items */}
                    {demoPrograms.map((prog) => {
                      const isReporting = prog.status === "Reporting"
                      const isStarted = prog.status === "Started"
                      const isScoring = prog.status === "Scoring"
                      const isPublished = prog.status === "Published"

                      return (
                        <div
                          key={prog.id}
                          className="grid grid-cols-12 items-center p-3 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-slate-50 transition-colors gap-1 text-xs"
                        >
                          <div className="col-span-4 pr-1">
                            <span className="font-bold text-slate-900 block truncate">
                              {isMl ? prog.nameMl : prog.nameEn}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {isMl ? prog.categoryMl : prog.categoryEn}
                            </span>
                          </div>
                          <div className="col-span-3 text-slate-600 truncate text-[11px]">
                            {isMl ? prog.stageMl : prog.stageEn}
                          </div>
                          <div className="col-span-2">
                            {isReporting && (
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                {isMl ? "റിപ്പോർട്ടിംഗ്" : "Reporting"}
                              </span>
                            )}
                            {isStarted && (
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                                {isMl ? "ആരംഭിച്ചു" : "Started"}
                              </span>
                            )}
                            {isScoring && (
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                {isMl ? "മൂല്യനിർണ്ണയം" : "Scoring"}
                              </span>
                            )}
                            {isPublished && (
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {isMl ? "പബ്ലിഷ്ഡ്" : "Done"}
                              </span>
                            )}
                          </div>
                          <div className="col-span-3 text-right">
                            <button
                              onClick={() => handleDemoAction(prog.id)}
                              className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] transition-all active:scale-95 shadow-xs truncate max-w-full"
                            >
                              {isMl ? prog.actionMl : prog.actionEn}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <p className="text-center text-xs text-slate-400 pt-2 font-medium">
                    {isMl ? "ഓരോരുത്തർക്കും ചെയ്യേണ്ട കാര്യങ്ങൾ കൃത്യമായി മുന്നിൽ കാണിക്കുന്നു." : "Each person sees what they need to do next."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUBDOMAIN MULTI-TENANT HIGHLIGHT ── */}
      <section id="domains" className="py-16 bg-white border-y border-slate-200/80">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Globe className="h-3.5 w-3.5" /> {isMl ? "നിങ്ങളുടെ സ്വന്തം ഫെസ്റ്റ് വെബ്സൈറ്റ്" : "Your Own Festival Subdomain"}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
            {isMl ? "ഓരോ ഫെസ്റ്റിനും പ്രത്യേകം ബ്രാൻഡഡ് പബ്ലിക് പോർട്ടൽ" : "Every festival gets its own branded public domain"}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {isMl ? (
              <>
                നിങ്ങൾ ഫെസ്റ്റ് രജിസ്റ്റർ ചെയ്യുമ്പോൾ തന്നെ സ്വന്തമായി ഒരു വെബ് അഡ്രസ്സ് ലഭിക്കുന്നു:{" "}
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  quaf.festpro.ahraz.site
                </span>
                . പങ്കെടുക്കുന്നവർക്കും കാണികൾക്കും ലൈവ് സ്റ്റേജുകളും പോയിന്റ് നിലകളും തത്സമയം പരിശോധിക്കാം.
              </>
            ) : (
              <>
                When you create your fest, you get a dedicated public URL like{" "}
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  quaf.festpro.ahraz.site
                </span>{" "}
                where participants, judges, and spectators track live stages, published marks, and team points in real time.
              </>
            )}
          </p>
          <div className="pt-2">
            <Link
              href="/create-fest"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 active:scale-95"
            >
              <span>{isMl ? "നിങ്ങളുടെ ഫെസ്റ്റ് ഇപ്പോൾ തുടങ്ങൂ" : "Get your fest domain now"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 bg-slate-50 border-t border-slate-200/80 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AhrazFestProLogo height={24} showIcon={false} />
            <span className="text-slate-400">· Multi-Tenant Festival SaaS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/create-fest" className="hover:text-indigo-600 font-semibold">{isMl ? "ഫെസ്റ്റ് സൃഷ്ടിക്കുക" : "Create fest"}</Link>
            <Link href="/login" className="hover:text-indigo-600 font-semibold">{isMl ? "ലോഗിൻ" : "Sign in"}</Link>
            <Link href="/contact" className="hover:text-indigo-600">{isMl ? "ബന്ധപ്പെടുക" : "Contact"}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
