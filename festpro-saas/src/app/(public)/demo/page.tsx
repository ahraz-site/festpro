"use client"

import React, { useState } from 'react'

export default function DemoPage() {
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
      alert("Failed to request demo. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">
            Book a Live Demo
          </h1>
          <p className="mt-4 text-xl text-slate-600 dark:text-slate-300">
            See how FestPro can completely digitize your next event. Our enterprise specialists will guide you through the platform.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-50 dark:bg-green-900/30 p-8 rounded-2xl text-center border border-green-200 dark:border-green-800 shadow-sm">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">Demo Request Received!</h3>
            <p className="mt-4 text-green-600 dark:text-green-400">
              Thank you for your interest. A product expert will contact you within 24 hours to schedule your personalized demo.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="orgName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Organization Name *</label>
                  <input type="text" id="orgName" name="orgName" required className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors" />
                </div>
                <div>
                  <label htmlFor="contactPerson" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contact Person *</label>
                  <input type="text" id="contactPerson" name="contactPerson" required className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors" />
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
                  <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Country</label>
                  <input type="text" id="country" name="country" className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors" />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300">State / Region</label>
                  <input type="text" id="state" name="state" className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors" />
                </div>
                <div>
                  <label htmlFor="orgType" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Organization Type</label>
                  <select id="orgType" name="orgType" className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors">
                    <option value="">Select...</option>
                    <option value="School">School</option>
                    <option value="College">College</option>
                    <option value="University">University</option>
                    <option value="NGO">NGO / Non-profit</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="festivalType" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Festival Type</label>
                  <select id="festivalType" name="festivalType" className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors">
                    <option value="">Select...</option>
                    <option value="Arts Fest">Arts Fest / Kalotsavam</option>
                    <option value="Sports Meet">Sports Meet</option>
                    <option value="Tech Fest">Tech Fest</option>
                    <option value="Cultural Event">Cultural Event</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="participants" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Expected Participants</label>
                  <select id="participants" name="participants" className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors">
                    <option value="< 500">Less than 500</option>
                    <option value="500 - 2000">500 - 2000</option>
                    <option value="2000 - 5000">2000 - 5000</option>
                    <option value="5000+">5000+</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="launchDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Expected Launch Date</label>
                  <input type="month" id="launchDate" name="launchDate" className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors" />
                </div>
              </div>
              
              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Demo Preferences</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label htmlFor="demoDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Preferred Demo Date</label>
                    <input type="date" id="demoDate" name="demoDate" required className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors" />
                  </div>
                  <div>
                    <label htmlFor="demoTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Preferred Demo Time</label>
                    <input type="time" id="demoTime" name="demoTime" required className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors" />
                  </div>
                  <div>
                    <label htmlFor="meetingMode" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Meeting Mode</label>
                    <select id="meetingMode" name="meetingMode" className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors">
                      <option value="Google Meet">Google Meet</option>
                      <option value="Zoom">Zoom</option>
                      <option value="Microsoft Teams">Microsoft Teams</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Additional Requirements</label>
                <textarea id="requirements" name="requirements" rows={3} placeholder="Tell us about your specific needs..." className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 transition-colors"></textarea>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all">
                  {loading ? 'Submitting Request...' : 'Submit Demo Request'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
