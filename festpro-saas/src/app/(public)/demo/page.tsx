"use client"

import React, { useState } from 'react'

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here we would typically call a server action to create a lead
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">
            Request a Demo
          </h1>
          <p className="mt-4 text-xl text-slate-600 dark:text-slate-300">
            See how FestPro can transform your next festival. Our sales team will get in touch with you shortly.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-50 dark:bg-green-900/30 p-8 rounded-2xl text-center border border-green-200 dark:border-green-800">
            <h3 className="text-2xl font-bold text-green-800 dark:text-green-300">Request Sent Successfully!</h3>
            <p className="mt-4 text-green-600 dark:text-green-400">
              Thank you for your interest. One of our product experts will contact you within 24 hours to schedule your personalized demo.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="orgName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Organization / School Name</label>
                  <input type="text" id="orgName" required className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label htmlFor="contactPerson" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contact Person</label>
                  <input type="text" id="contactPerson" required className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <input type="email" id="email" required className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number (WhatsApp)</label>
                  <input type="tel" id="phone" required className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500" />
                </div>
              </div>
              
              <div>
                <label htmlFor="expectedDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Expected Festival Date (Optional)</label>
                <input type="date" id="expectedDate" className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500" />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Any specific requirements?</label>
                <textarea id="notes" rows={4} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"></textarea>
              </div>

              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Submit Request
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
