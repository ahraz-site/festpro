"use client"

import React, { useState } from 'react'

export default function ContactSalesPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      // In a real app, this would call a server action to save to Supabase
      // For now, we simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubmitted(true)
    } catch (error) {
      console.error(error)
      alert("Failed to submit inquiry. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">
            Contact Enterprise Sales
          </h1>
          <p className="mt-4 text-xl text-slate-600 dark:text-slate-300">
            Discuss customized pricing and features with our enterprise team.
          </p>
        </div>

        {submitted ? (
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-8 rounded-2xl text-center border border-indigo-200 dark:border-indigo-800 shadow-sm">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-indigo-800 dark:text-indigo-300">Inquiry Received!</h3>
            <p className="mt-4 text-indigo-600 dark:text-indigo-400">
              Thank you for contacting FestPro Sales. A representative will review your requirements and reach out to you shortly.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Company / Organization *</label>
                  <input type="text" id="company" name="company" required className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors" />
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name *</label>
                  <input type="text" id="name" name="name" required className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address *</label>
                  <input type="email" id="email" name="email" required className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number *</label>
                  <input type="tel" id="phone" name="phone" required className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors" />
                </div>
                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-700 dark:text-slate-300">WhatsApp Number</label>
                  <input type="tel" id="whatsapp" name="whatsapp" className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors" />
                </div>
                <div>
                  <label htmlFor="plan" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Plan Interested In</label>
                  <select id="plan" name="plan" className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors">
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise Custom</option>
                    <option value="Not Sure">Not Sure</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Expected Budget (₹ / $)</label>
                  <input type="text" id="budget" name="budget" placeholder="e.g. ₹50,000" className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors" />
                </div>
                <div>
                  <label htmlFor="festivalSize" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Festival Size</label>
                  <select id="festivalSize" name="festivalSize" className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors">
                    <option value="Small (< 1000)">Small (&lt; 1000 participants)</option>
                    <option value="Medium (1000 - 3000)">Medium (1000 - 3000 participants)</option>
                    <option value="Large (3000+)">Large (3000+ participants)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message / Requirements</label>
                <textarea id="message" name="message" rows={4} required placeholder="Tell us about your organization and requirements..." className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"></textarea>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all">
                  {loading ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
