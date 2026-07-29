"use client"

import React, { useState } from 'react'
import { Receipt, CheckCircle, Upload, Download, Building2, Clock } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function InvoiceViewPage() {
  const params = useParams()
  const invoiceId = params.id as string

  const [paymentStatus, setPaymentStatus] = useState('Pending') // Pending, Submitted, Paid
  const [proof, setProof] = useState<File | null>(null)

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (proof) {
      // In a real implementation, we upload to Supabase Storage and call submitManualPayment
      setPaymentStatus('Submitted')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="p-8 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold flex items-center gap-3">
                <Receipt className="h-8 w-8 text-blue-400" /> Invoice
              </h1>
              <p className="text-slate-300 mt-2">No: {invoiceId || 'INV-2026-4A2B'}</p>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-sm text-slate-400">Total Due</p>
              <p className="text-4xl font-bold">$12,000</p>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  paymentStatus === 'Paid' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                  paymentStatus === 'Submitted' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                  'bg-red-500/20 text-red-400 border border-red-500/50'
                }`}>
                  {paymentStatus === 'Submitted' ? 'Verification Pending' : paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Billed To</h3>
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-lg">TechCorp Inc.</p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">123 Business Avenue<br/>San Francisco, CA 94107</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Invoice Details</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 text-slate-600 dark:text-slate-400">Date Issued</td>
                    <td className="py-1 font-medium text-right text-slate-900 dark:text-white">July 28, 2026</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-slate-600 dark:text-slate-400">Due Date</td>
                    <td className="py-1 font-medium text-right text-red-600">August 12, 2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Section */}
          <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
            {paymentStatus === 'Pending' ? (
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Make a Payment</h3>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Please transfer the total amount to the following bank account, then upload a screenshot of the transaction receipt.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 mb-1">Bank Name</p>
                      <p className="font-medium text-slate-900 dark:text-white">Global Commerce Bank</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 mb-1">Account Number</p>
                      <p className="font-medium text-slate-900 dark:text-white">3948-2837-1234-9999</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Upload Payment Receipt</label>
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={e => setProof(e.target.files?.[0] || null)}
                        required
                        className="block w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                      />
                    </div>
                    <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                      <Upload className="h-4 w-4" /> Submit Proof
                    </button>
                  </form>
                </div>
              </div>
            ) : paymentStatus === 'Submitted' ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-500 p-6 rounded-xl flex items-center justify-center gap-4 text-center border border-yellow-200 dark:border-yellow-800/50">
                <Clock className="h-8 w-8" />
                <div className="text-left">
                  <h4 className="font-bold text-lg">Payment Proof Submitted</h4>
                  <p className="text-sm mt-1">Our finance team is verifying your transaction. Your license will be activated shortly.</p>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-500 p-6 rounded-xl flex items-center justify-center gap-4 text-center border border-green-200 dark:border-green-800/50">
                <CheckCircle className="h-8 w-8" />
                <div className="text-left">
                  <h4 className="font-bold text-lg">Payment Verified</h4>
                  <p className="text-sm mt-1">Thank you for your business. Your Enterprise License has been successfully activated.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
