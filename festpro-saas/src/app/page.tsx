"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Sparkles, ArrowRight, CheckCircle2, Trophy, Users, Award, Radio, Globe,
  ShieldCheck, Zap, Clock, ChevronRight, Play, ExternalLink
} from "lucide-react"

export default function FestizeStyleLandingPage() {
  // Live Demo programs state matching Festize screenshot
  const [demoPrograms, setDemoPrograms] = useState([
    {
      id: 1,
      name: "Solo song",
      category: "Junior",
      stage: "Main stage",
      status: "Reporting",
      action: "Start program",
    },
    {
      id: 2,
      name: "Group dance",
      category: "Senior",
      stage: "Auditorium",
      status: "Started",
      action: "Finish program",
    },
    {
      id: 3,
      name: "Poetry",
      category: "General",
      stage: "Room 2",
      status: "Scoring",
      action: "Review",
    },
  ])

  const handleDemoAction = (id: number) => {
    setDemoPrograms((prev) =>
      prev.map((prog) => {
        if (prog.id === id) {
          if (prog.status === "Reporting") {
            toast.success(`?? Started ${prog.name} on ${prog.stage}!`)
            return { ...prog, status: "Started", action: "Finish program" }
          } else if (prog.status === "Started") {
            toast.info(`?? ${prog.name} completed! Marks handed over to judges.`)
            return { ...prog, status: "Scoring", action: "Review" }
          } else if (prog.status === "Scoring") {
            toast.success(`?? ${prog.name} results reviewed & published to public domain!`)
            return { ...prog, status: "Published", action: "Completed" }
          }
        }
        return prog
      })
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 selection:bg-emerald-500 selection:text-white font-sans antialiased">
      {/* -- HEADER -- */}
      <header className="sticky top-0 z-50 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#0D382E] flex items-center justify-center font-black text-white text-lg shadow-sm">
              F
            </div>
            <span className="font-heading font-extrabold text-2xl tracking-tight text-[#0D382E]">
              FestPro
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-[#0D382E] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#0D382E] transition-colors">Pricing</a>
            <a href="#for-schools" className="hover:text-[#0D382E] transition-colors">For schools</a>
            <a href="#multi-level" className="hover:text-[#0D382E] transition-colors">Multi-level fests</a>
            <a href="#about" className="hover:text-[#0D382E] transition-colors">About</a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-[#0D382E] px-3 py-2 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/create-fest"
              className="inline-flex items-center justify-center rounded-full bg-[#0D382E] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#154a3e] transition-all shadow-sm active:scale-95"
            >
              Create your fest
            </Link>
          </div>
        </div>
      </header>

      {/* -- HERO SECTION -- */}
      <section className="pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block text-xs sm:text-sm font-bold text-emerald-800 tracking-wide">
                School arts and cultural fest software
              </span>

              <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-black tracking-tight text-slate-900 leading-[1.1] font-heading">
                Run your fest without chasing spreadsheets, score sheets, and stage updates.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
                Set up participants and programs, keep stages moving, collect judges&apos; marks, and publish approved results in one place.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/create-fest"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0D382E] px-6 py-3.5 text-base font-bold text-white hover:bg-[#154a3e] transition-all shadow-md active:scale-95 group"
                >
                  <span>Create your fest</span>
                  <span className="text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">?</span>
                </Link>

                <Link
                  href="#how-it-works"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-[#0D382E] px-4 py-3.5 transition-colors"
                >
                  <span>See what FestPro does</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Interactive Mockup (Matches Screenshot 1) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-stone-300/40 border border-stone-200/80 overflow-hidden">
                {/* Window Top Bar */}
                <div className="bg-stone-50 px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">FestPro</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                  </span>
                </div>

                {/* Control Room Box */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Control room</span>
                      <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Live programs</h3>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 text-slate-600 border border-stone-200">
                      All stages
                    </span>
                  </div>

                  {/* Program Rows Table */}
                  <div className="space-y-3 pt-2">
                    {/* Header Columns */}
                    <div className="grid grid-cols-12 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                      <div className="col-span-4">Program</div>
                      <div className="col-span-3">Stage</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-3 text-right">Next</div>
                    </div>

                    {/* Program Cards */}
                    {demoPrograms.map((prog) => {
                      const isReporting = prog.status === "Reporting"
                      const isStarted = prog.status === "Started"
                      const isScoring = prog.status === "Scoring"
                      const isPublished = prog.status === "Published"

                      return (
                        <div
                          key={prog.id}
                          className="grid grid-cols-12 items-center p-3 rounded-xl bg-stone-50/70 border border-stone-200/60 hover:bg-stone-50 transition-colors gap-1 text-xs"
                        >
                          <div className="col-span-4 pr-1">
                            <span className="font-bold text-slate-900 block truncate">{prog.name}</span>
                            <span className="text-[10px] text-slate-400">{prog.category}</span>
                          </div>
                          <div className="col-span-3 text-slate-600 truncate text-[11px]">
                            {prog.stage}
                          </div>
                          <div className="col-span-2">
                            {isReporting && (
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Reporting
                              </span>
                            )}
                            {isStarted && (
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Started
                              </span>
                            )}
                            {isScoring && (
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                                Scoring
                              </span>
                            )}
                            {isPublished && (
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                Done
                              </span>
                            )}
                          </div>
                          <div className="col-span-3 text-right">
                            <button
                              onClick={() => handleDemoAction(prog.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#0D382E] hover:bg-[#154a3e] text-white font-bold text-[11px] transition-all active:scale-95 truncate max-w-full"
                            >
                              {prog.action}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <p className="text-center text-xs text-slate-400 pt-2 font-medium">
                    Each person sees what they need to do next.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- SUBDOMAIN MULTI-TENANT HIGHLIGHT -- */}
      <section className="py-16 bg-white border-y border-stone-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <Globe className="h-3.5 w-3.5" /> Your Own Fest Domain
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
            Every festival gets its own branded public domain
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            When you create your fest, you get a dedicated public URL like{" "}
            <span className="font-mono font-bold text-[#0D382E] bg-stone-100 px-2 py-0.5 rounded">
              quaf.festpro.ahraz.site
            </span>{" "}
            where participants, judges, and audiences check live stages, published results, and team leaderboards in real time.
          </p>
          <div className="pt-2">
            <Link
              href="/create-fest"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0D382E] px-6 py-3 text-sm font-bold text-white hover:bg-[#154a3e] shadow-sm"
            >
              Get your fest domain now ?
            </Link>
          </div>
        </div>
      </section>

      {/* -- FOOTER -- */}
      <footer className="py-8 bg-[#FAF9F5] border-t border-stone-200/60 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-[#0D382E] text-white flex items-center justify-center font-bold text-[10px]">
              F
            </div>
            <span className="font-bold text-slate-700">FestPro</span>
            <span>� Multi-Tenant Festival Management SaaS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/create-fest" className="hover:text-slate-900 font-semibold">Create your fest</Link>
            <Link href="/login" className="hover:text-slate-900 font-semibold">Sign in</Link>
            <Link href="/contact" className="hover:text-slate-900">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
