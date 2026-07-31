"use client"

import React from "react"
import Link from "next/link"
import { CheckCircle2, ArrowRight, Activity, Users, FileText, Smartphone, Trophy, LayoutGrid, Check, Play, Settings } from "lucide-react"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Hero Section */}
      <section className="bg-indigo-900 py-20 px-4 sm:px-6 lg:px-8 text-center text-white">
        <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight">
          Enterprise-Grade Features for Flawless Festivals
        </h1>
        <p className="mt-6 text-xl text-indigo-200 max-w-2xl mx-auto">
          Discover why top universities, schools, and organizations choose FestPro to fully automate their events.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/demo" className="inline-flex items-center rounded-xl bg-white px-8 py-4 text-base font-bold text-indigo-900 hover:bg-indigo-50 transition-colors">
            Book Live Demo <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <a href="#interactive-tour" className="inline-flex items-center rounded-xl bg-indigo-800 border border-indigo-700 px-8 py-4 text-base font-bold text-white hover:bg-indigo-700 transition-colors">
            <Play className="mr-2 h-5 w-5" /> Interactive Tour
          </a>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why FestPro?</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Comparing traditional management with our automated workflow.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-red-500 mb-6 flex items-center"><XIcon className="h-6 w-6 mr-2" /> Traditional Methods</h3>
            <ul className="space-y-4 text-slate-600 dark:text-slate-400">
              <li className="flex gap-3"><span className="text-red-400 font-bold">×</span> Manual Excel sheets and data entry errors</li>
              <li className="flex gap-3"><span className="text-red-400 font-bold">×</span> Paper-based scoring that takes hours to tabulate</li>
              <li className="flex gap-3"><span className="text-red-400 font-bold">×</span> Endless printing of physical ID cards and certificates</li>
              <li className="flex gap-3"><span className="text-red-400 font-bold">×</span> Delayed results causing participant frustration</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border-2 border-indigo-500 relative">
            <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 rounded-bl-xl rounded-tr-xl text-xs font-bold uppercase tracking-wider">The FestPro Way</div>
            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 flex items-center"><CheckCircle2 className="h-6 w-6 mr-2" /> FestPro Automation</h3>
            <ul className="space-y-4 text-slate-600 dark:text-slate-400">
              <li className="flex gap-3"><Check className="h-5 w-5 text-green-500 shrink-0" /> Self-service digital enrollment and bulk imports</li>
              <li className="flex gap-3"><Check className="h-5 w-5 text-green-500 shrink-0" /> Real-time mobile scoring for judges (Zero Paperwork)</li>
              <li className="flex gap-3"><Check className="h-5 w-5 text-green-500 shrink-0" /> Automated QR Code ID Cards & E-Certificates</li>
              <li className="flex gap-3"><Check className="h-5 w-5 text-green-500 shrink-0" /> Instant Live Leaderboard and Public Result Publishing</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Customer Workflow */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">The Customer Workflow</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">How we onboard you for success.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Book a Demo", desc: "Speak with our experts to understand your unique festival requirements." },
              { step: "02", title: "Custom Quote", desc: "Receive a tailored pricing proposal and comprehensive execution plan." },
              { step: "03", title: "Onboarding", desc: "Our team sets up your account, configures your domain, and trains your staff." },
              { step: "04", title: "Go Live", desc: "Launch your festival with 24/7 priority support and real-time monitoring." }
            ].map((item, i) => (
              <div key={i} className="relative p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Industry Solutions</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Schools & Colleges", icon: Users, desc: "Manage arts fests, sports meets, and inter-house competitions effortlessly." },
            { title: "Universities", icon: LayoutGrid, desc: "Scale up for inter-collegiate fests with thousands of participants." },
            { title: "Islamic Institutions", icon: FileText, desc: "Specialized tools for managing complex literary and arts competitions." },
            { title: "Corporate Events", icon: Activity, desc: "Streamline team-building events and annual corporate sports days." },
            { title: "Government Events", icon: Trophy, desc: "Secure, reliable, and transparent system for large-scale youth festivals." },
            { title: "NGOs & Clubs", icon: Settings, desc: "Cost-effective management for community sports and cultural events." },
          ].map((sol, i) => (
            <div key={i} className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-start gap-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl shrink-0">
                <sol.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{sol.title}</h4>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{sol.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Ready to digitize your next event?</h2>
        <div className="flex justify-center gap-4">
          <Link href="/contact" className="inline-flex items-center rounded-xl bg-indigo-600 px-8 py-4 text-base font-bold text-white hover:bg-indigo-700 transition-colors">
            Contact Sales <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

function XIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
