"use client"

import React from 'react'
import Link from 'next/link'
import { Check, Phone, ArrowRight, X } from 'lucide-react'

export default function PricingPage() {
  const salesPhone = "919000000000" // Replace with actual number

  const plans = [
    {
      name: "Starter",
      suitableFor: "Small Schools & Colleges",
      price: "Request Pricing",
      period: "/festival",
      features: [
        { name: "Up to 500 Participants", included: true },
        { name: "1 Festival Limit", included: true },
        { name: "Standard Support (Email)", included: true },
        { name: "Basic Certificates", included: true },
        { name: "Storage: 1GB", included: true },
        { name: "AI Features", included: false },
        { name: "White Label Availability", included: false },
        { name: "API & Webhooks", included: false },
        { name: "Custom Domain", included: false },
      ],
      whatsappText: "Hello,%0A%0AI want to request pricing for FestPro.%0A%0APlan: Starter%0AOrganization Name: %0AContact Number: %0AEmail: %0AExpected Launch Date: "
    },
    {
      name: "Professional",
      suitableFor: "Large Institutions & Districts",
      price: "Request Pricing",
      period: "/year",
      popular: true,
      features: [
        { name: "Up to 2000 Participants", included: true },
        { name: "Up to 3 Festivals", included: true },
        { name: "Priority WhatsApp Support", included: true },
        { name: "Advanced Certificates", included: true },
        { name: "Storage: 10GB", included: true },
        { name: "AI Schedule Optimizer", included: true },
        { name: "White Label Availability", included: false },
        { name: "API & Webhooks", included: false },
        { name: "Custom Domain", included: false },
      ],
      whatsappText: "Hello,%0A%0AI want to request pricing for FestPro.%0A%0APlan: Professional%0AOrganization Name: %0AContact Number: %0AEmail: %0AExpected Launch Date: "
    },
    {
      name: "Enterprise",
      suitableFor: "Universities & Global Organizers",
      price: "Custom Quote",
      period: "/year",
      features: [
        { name: "Unlimited Participants", included: true },
        { name: "Unlimited Festivals", included: true },
        { name: "24/7 Dedicated Support", included: true },
        { name: "Custom Certificates", included: true },
        { name: "Storage: Unlimited", included: true },
        { name: "Full AI Access", included: true },
        { name: "White Label Availability", included: true },
        { name: "API & Webhooks", included: true },
        { name: "Custom Domain", included: true },
      ],
      isEnterprise: true
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">
          Enterprise Pricing & Plans
        </h1>
        <p className="mt-4 text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          We offer flexible, custom-tailored solutions to fit organizations of any size. Book a live demo or contact our sales team to find the perfect plan for your next festival.
        </p>
      </div>

      <div className="mt-16 max-w-7xl mx-auto grid gap-8 lg:grid-cols-3">
        {plans.map((plan, idx) => (
          <div key={idx} className={`flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-xl border ${plan.popular ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-slate-200 dark:border-slate-700'} p-8 relative`}>
            {plan.popular && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
                Most Popular
              </div>
            )}
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
            <p className="mt-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
              {plan.suitableFor}
            </p>
            <p className="mt-6 flex items-baseline gap-x-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{plan.price}</span>
            </p>
            
            <ul className="mt-8 space-y-4 flex-1">
              {plan.features.map((feature, fIdx) => (
                <li key={fIdx} className="flex items-start">
                  {feature.included ? (
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <X className="h-5 w-5 text-slate-300 dark:text-slate-600 shrink-0" />
                  )}
                  <span className={`ml-3 text-sm ${feature.included ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500 line-through'}`}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3">
              {plan.isEnterprise ? (
                <>
                  <Link href="/demo" className="w-full flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
                    Book Live Demo <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link href="/contact" className="w-full flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    Contact Sales
                  </Link>
                </>
              ) : (
                <>
                  <a 
                    href={`https://wa.me/${salesPhone}?text=${plan.whatsappText}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-500 transition-colors"
                  >
                    <Phone className="mr-2 h-4 w-4" /> Request Pricing via WhatsApp
                  </a>
                  <Link href="/demo" className="w-full flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    Book Demo
                  </Link>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center max-w-2xl mx-auto bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-800">
        <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Already have a License Key?</h4>
        <p className="mt-2 text-slate-600 dark:text-slate-400">If you have received your official License Key from our sales team after completing the payment, you can activate your organization account now.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/activate" className="inline-flex items-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
            Activate License <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
