"use client"

import React from 'react'
import { Building2, Phone, Mail, Activity, Calendar, FileText, CheckCircle } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function Customer360Page() {
  const params = useParams()
  // Mock data for the specific customer timeline
  const timeline = [
    { id: '1', type: 'Lead Created', date: '2026-07-20 10:00 AM', desc: 'Inquiry via Website', icon: Activity, color: 'text-blue-500' },
    { id: '2', type: 'Demo', date: '2026-07-22 02:00 PM', desc: 'Product walk-through completed', icon: Calendar, color: 'text-indigo-500' },
    { id: '3', type: 'Quotation', date: '2026-07-23 09:30 AM', desc: 'Sent QUO-2026-X1Y2 ($12,000)', icon: FileText, color: 'text-purple-500' },
    { id: '4', type: 'Payment', date: '2026-07-28 11:15 AM', desc: 'Received Bank Transfer for INV-2026-4A2B', icon: CheckCircle, color: 'text-green-500' },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">TechCorp Inc.</h1>
                <p className="text-slate-500 flex items-center gap-4 mt-1 text-sm">
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> contact@techcorp.com</span>
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> +1 (555) 123-4567</span>
                </p>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200 dark:border-slate-700 pt-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <p className="font-semibold text-green-600">Active Customer</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Plan</p>
                <p className="font-semibold text-slate-900 dark:text-white">Enterprise</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Renewal Date</p>
                <p className="font-semibold text-slate-900 dark:text-white">2027-07-28</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Total Value</p>
                <p className="font-semibold text-slate-900 dark:text-white">$12,000</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Customer Timeline</h2>
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
          {timeline.map((event, index) => (
            <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-800 bg-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${event.color}`}>
                <event.icon className="w-5 h-5" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{event.type}</div>
                  <time className="text-xs font-medium text-slate-500">{event.date}</time>
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-sm mt-2">{event.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
