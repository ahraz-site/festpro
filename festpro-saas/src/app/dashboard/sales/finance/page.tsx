"use client"

import React, { useState } from 'react'
import { FileText, Download, CheckCircle, Clock, XCircle, FilePlus } from 'lucide-react'
import Link from 'next/link'

const MOCK_FINANCE = [
  { id: '1', type: 'Invoice', number: 'INV-2026-4A2B', company: 'TechCorp Inc', amount: 12000, status: 'Paid', date: '2026-07-28' },
  { id: '2', type: 'Invoice', number: 'INV-2026-9C1D', company: 'GlobalEvents LLC', amount: 4500, status: 'Pending', date: '2026-07-29' },
  { id: '3', type: 'Quote', number: 'QUO-2026-X1Y2', company: 'MusicFest Org', amount: 1200, status: 'Sent', date: '2026-07-30' }
]

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('All')

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quotations & Invoices</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage financial documents for leads and customers.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">
            <FilePlus className="h-4 w-4" /> New Quote
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700 flex">
          {['All', 'Invoices', 'Quotes'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {MOCK_FINANCE.filter(f => activeTab === 'All' || f.type + 's' === activeTab).map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-white">{doc.number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{doc.company}</td>
                  <td className="px-6 py-4">{doc.date}</td>
                  <td className="px-6 py-4 font-medium">${doc.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'Paid' ? 'bg-green-100 text-green-700' :
                      doc.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {doc.status === 'Paid' ? <CheckCircle className="h-3 w-3"/> : <Clock className="h-3 w-3"/>}
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-blue-600 transition" title="Download PDF">
                      <Download className="h-4 w-4 inline-block" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
