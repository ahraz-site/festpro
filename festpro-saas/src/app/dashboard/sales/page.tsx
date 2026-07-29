"use client"

import React, { useState } from 'react'
import { FileText, Users, CreditCard, Filter, Plus } from 'lucide-react'

// Mock Data for UI presentation
const mockLeads = [
  { id: '1', org: 'Techfest IIT', contact: 'Rahul S', status: 'New Lead', date: '2026-07-29', plan: 'Enterprise' },
  { id: '2', org: 'SpringFest NIT', contact: 'Aman K', status: 'Demo Scheduled', date: '2026-07-28', plan: 'Professional' },
  { id: '3', org: 'Zephyr CMS', contact: 'Priya M', status: 'Negotiation', date: '2026-07-27', plan: 'Enterprise' },
]

export default function SalesDashboard() {
  const [activeTab, setActiveTab] = useState('leads')

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sales & CRM</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage leads, demos, quotations, and manual payments.</p>
        </div>
        <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Add Lead
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'leads', name: 'Leads & Demos', icon: Users },
          { id: 'quotations', name: 'Quotations & Invoices', icon: FileText },
          { id: 'payments', name: 'Payment Verifications', icon: CreditCard },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-3 border-b-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        {activeTab === 'leads' && (
          <div>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Recent Leads</h3>
              <button className="flex items-center text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
                  <th className="p-4 font-medium">Organization</th>
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium">Plan Interested</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-200 dark:divide-slate-700">
                {mockLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">{lead.org}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{lead.contact}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{lead.plan}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${lead.status === 'New Lead' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                        ${lead.status === 'Demo Scheduled' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : ''}
                        ${lead.status === 'Negotiation' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : ''}
                      `}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{lead.date}</td>
                    <td className="p-4">
                      <button className="text-blue-600 dark:text-blue-400 hover:underline">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <CreditCard className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Manual Payment Verifications</h3>
            <p>Uploaded payment screenshots (UPI, Bank Transfer) will appear here for admin approval.</p>
          </div>
        )}

        {activeTab === 'quotations' && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Quotations & Invoices</h3>
            <p>Generate and send official PDF invoices to clients before activation.</p>
          </div>
        )}

      </div>
    </div>
  )
}
