"use client"

import React, { useState } from 'react'

import { createCrmLead, bookCrmDemo } from '@/lib/api/sales_crm'

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      // 1. Create Lead
      const lead = await createCrmLead({
        organization_name: formData.get('orgName'),
        contact_person: formData.get('contactPerson'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        plan_interested: 'Demo Request'
      })

      // 2. Book Demo
      await bookCrmDemo(
        lead.id,
        `${formData.get('expectedDate')}T${formData.get('expectedTime')}:00Z`,
        formData.get('meetingMode') as string,
        formData.get('notes') as string
      )

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
                  <input type="text" id="orgName" name="orgName" required className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label htmlFor="contactPerson" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contact Person</label>
                  <input type="text" id="contactPerson" name="contactPerson" required className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <input type="email" id="email" name="email" required className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number (WhatsApp)</label>
                  <input type="tel" id="phone" name="phone" required className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="expectedDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Preferred Date</label>
                  <input type="date" id="expectedDate" name="expectedDate" required className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label htmlFor="expectedTime" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Preferred Time</label>
                  <input type="time" id="expectedTime" name="expectedTime" required className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500" />
                </div>
                <div>
                  <label htmlFor="meetingMode" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Meeting Mode</label>
                  <select id="meetingMode" name="meetingMode" className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500">
                    <option value="Online">Online (Google Meet/Zoom)</option>
                    <option value="Offline">Offline (In-person)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Any specific requirements?</label>
                <textarea id="notes" name="notes" rows={4} className="mt-1 block w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"></textarea>
              </div>

              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
