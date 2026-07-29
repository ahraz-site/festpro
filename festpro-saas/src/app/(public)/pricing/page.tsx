"use client"

import React from 'react'
import Link from 'next/link'
import { Check, Phone, ArrowRight } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "₹9,999",
      period: "/festival",
      description: "Perfect for small schools and colleges with basic requirements.",
      features: ["Up to 500 Participants", "1 Festival", "Standard Support", "Basic Certificates", "No AI Features", "No White Label"],
      whatsappText: "Hello,%0A%0AI want to purchase FestPro.%0A%0APlan: Starter%0AOrganization Name: %0AContact Number: %0AEmail: %0AExpected Launch Date: "
    },
    {
      name: "Professional",
      price: "₹24,999",
      period: "/festival",
      description: "Ideal for large institutions running multiple events simultaneously.",
      features: ["Up to 2000 Participants", "3 Festivals", "Priority WhatsApp Support", "Advanced Certificates", "AI Schedule Optimizer", "No White Label"],
      whatsappText: "Hello,%0A%0AI want to purchase FestPro.%0A%0APlan: Professional%0AOrganization Name: %0AContact Number: %0AEmail: %0AExpected Launch Date: "
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "/year",
      description: "For universities and global organizers needing full control.",
      features: ["Unlimited Participants", "Unlimited Festivals", "24/7 Dedicated Support", "White Label Domain", "Full AI Access", "API & Webhooks"],
      isEnterprise: true
    }
  ]

  const salesPhone = "919000000000" // Replace with actual number

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-4 text-xl text-slate-600 dark:text-slate-300">
          Choose the right plan for your festival. Pay manually via UPI or Bank Transfer and activate instantly.
        </p>
      </div>

      <div className="mt-16 max-w-7xl mx-auto grid gap-8 lg:grid-cols-3">
        {plans.map((plan, idx) => (
          <div key={idx} className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400">{plan.description}</p>
            <p className="mt-6 flex items-baseline gap-x-2">
              <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{plan.price}</span>
              <span className="text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">{plan.period}</span>
            </p>
            <ul className="mt-8 space-y-4 flex-1">
              {plan.features.map((feature, fIdx) => (
                <li key={fIdx} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="ml-3 text-slate-600 dark:text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {plan.isEnterprise ? (
                <div className="flex flex-col gap-3">
                  <Link href="/demo" className="w-full flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
                    Request Demo <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <a href={`https://wa.me/${salesPhone}?text=Hello,%20I%20want%20to%20enquire%20about%20the%20Enterprise%20plan.`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    Enterprise Inquiry
                  </a>
                </div>
              ) : (
                <a 
                  href={`https://wa.me/${salesPhone}?text=${plan.whatsappText}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-500 transition-colors"
                >
                  <Phone className="mr-2 h-4 w-4" /> Buy via WhatsApp
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center max-w-2xl mx-auto">
        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Already purchased?</h4>
        <p className="mt-2 text-slate-600 dark:text-slate-400">If you have received your License Key from our sales team, you can activate your organization account now.</p>
        <Link href="/activate" className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          Activate License Key <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
