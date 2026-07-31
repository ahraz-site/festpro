"use client"

import React, { useState } from 'react'
import { Building2, CheckCircle, Smartphone, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function PaymentPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // In a real app, this would upload the file to Supabase Storage and save details to DB
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitted(true)
    } catch (error) {
      console.error(error)
      alert("Failed to submit payment details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Offline Payment & Verification
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Please complete your payment using one of the methods below and submit the transaction details.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 sm:p-12 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Payment Details Submitted!</h2>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl text-left inline-block mt-4 mb-8">
              <p className="text-slate-700 dark:text-slate-300 mb-2"><strong>What happens next?</strong></p>
              <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2">
                <li>Our billing team will verify the transaction within 2-4 hours.</li>
                <li>You will receive your <strong>Official License Key</strong> via email and WhatsApp.</li>
                <li>Use the key to activate your organization account and start your festival.</li>
              </ul>
            </div>
            <div className="flex justify-center">
              <Link href="/activate" className="inline-flex items-center rounded-xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white hover:bg-indigo-700 transition-colors">
                Go to License Activation
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Payment Details */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-indigo-500" />
                  Bank Transfer (NEFT/IMPS/RTGS)
                </h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl space-y-2 font-mono text-sm text-slate-700 dark:text-slate-300">
                  <p><span className="text-slate-500">Account Name:</span> FESTPRO SOLUTIONS PVT LTD</p>
                  <p><span className="text-slate-500">Account No:</span> 9999000011112222</p>
                  <p><span className="text-slate-500">IFSC Code:</span> HDFC0001234</p>
                  <p><span className="text-slate-500">Bank Name:</span> HDFC Bank</p>
                  <p><span className="text-slate-500">Branch:</span> Startup Hub Branch</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Smartphone className="w-5 h-5 text-indigo-500" />
                  UPI Payment (Google Pay / PhonePe)
                </h3>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl flex items-center gap-4">
                  <div className="w-24 h-24 bg-white p-2 rounded-lg border border-slate-200 shrink-0">
                    {/* Placeholder for QR Code */}
                    <div className="w-full h-full border-2 border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                      QR Code
                    </div>
                  </div>
                  <div className="font-mono text-sm text-slate-700 dark:text-slate-300">
                    <p><span className="text-slate-500">UPI ID:</span> festpro@hdfcbank</p>
                    <p className="mt-2 text-xs text-slate-500">* Scan QR or send to UPI ID directly.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 border border-blue-100 dark:border-blue-800">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Please ensure you pay the exact amount mentioned in your custom invoice sent by the sales team.
                </p>
              </div>
            </div>

            {/* Right Column - Submission Form */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Submit Payment Details</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="orgName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Organization Name *</label>
                  <input type="text" id="orgName" name="orgName" required className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Billing Email *</label>
                  <input type="email" id="email" name="email" required className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount Paid *</label>
                  <input type="text" id="amount" name="amount" required placeholder="e.g. 50000" className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div>
                  <label htmlFor="transactionId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Transaction ID / UTR Number *</label>
                  <input type="text" id="transactionId" name="transactionId" required className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div>
                  <label htmlFor="screenshot" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Payment Screenshot (Optional)</label>
                  <input type="file" id="screenshot" name="screenshot" accept="image/*,.pdf" className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-slate-700 dark:file:text-slate-300" />
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={loading} className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all">
                    {loading ? 'Submitting Details...' : 'Submit Payment Info'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
