"use client"

import React, { useState } from 'react'
import { FileText, CheckCircle, XCircle, Download, Building2 } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function QuoteViewPage() {
  const params = useParams()
  const quoteId = params.id as string

  const [status, setStatus] = useState('Pending') // Pending, Accepted, Rejected

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" /> Quotation
              </h1>
              <p className="text-slate-500 mt-2">Ref: {quoteId || 'QUO-2026-X1Y2'}</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                <Download className="h-4 w-4" /> Download PDF
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Prepared For</h3>
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-lg">TechCorp Inc.</p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">123 Business Avenue<br/>San Francisco, CA 94107</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Quotation Details</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 text-slate-600 dark:text-slate-400">Date</td>
                    <td className="py-1 font-medium text-right text-slate-900 dark:text-white">July 28, 2026</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-600 dark:text-slate-400">Valid Until</td>
                    <td className="py-1 font-medium text-right text-slate-900 dark:text-white">August 15, 2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Line Items */}
          <div className="p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Products & Services</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-l-lg">Description</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 text-right">Qty</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 text-right rounded-r-lg">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="px-4 py-4 text-slate-900 dark:text-white font-medium">FestPro Enterprise License (Annual)</td>
                    <td className="px-4 py-4 text-right text-slate-600 dark:text-slate-400">1</td>
                    <td className="px-4 py-4 text-right text-slate-600 dark:text-slate-400">$10,000</td>
                    <td className="px-4 py-4 text-right font-medium text-slate-900 dark:text-white">$10,000</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 text-slate-900 dark:text-white font-medium">Priority Onboarding & Setup</td>
                    <td className="px-4 py-4 text-right text-slate-600 dark:text-slate-400">1</td>
                    <td className="px-4 py-4 text-right text-slate-600 dark:text-slate-400">$2,000</td>
                    <td className="px-4 py-4 text-right font-medium text-slate-900 dark:text-white">$2,000</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-right font-bold text-slate-900 dark:text-white text-lg">Total</td>
                    <td className="px-4 py-4 text-right font-bold text-blue-600 text-xl">$12,000</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
            {status === 'Pending' ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button 
                  onClick={() => setStatus('Rejected')}
                  className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition"
                >
                  <XCircle className="h-5 w-5" /> Decline Quote
                </button>
                <button 
                  onClick={() => setStatus('Accepted')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition"
                >
                  <CheckCircle className="h-5 w-5" /> Accept & Generate Invoice
                </button>
              </div>
            ) : status === 'Accepted' ? (
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-6 w-6" /> Quotation Accepted! Invoice is being generated...
              </div>
            ) : (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg border border-red-200 dark:border-red-800">
                <XCircle className="h-6 w-6" /> Quotation Declined. Our sales team will contact you.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
