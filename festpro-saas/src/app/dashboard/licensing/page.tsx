"use client"

import React, { useState } from 'react'
import { Key, Settings, ShieldCheck, Activity, Copy, CheckCircle2 } from 'lucide-react'

const mockLicenses = [
  { id: '1', org: 'Techfest IIT', key: 'FP-2026-AB7X-K92P-QW81', plan: 'Enterprise', status: 'Active', expiry: '2027-07-29' },
  { id: '2', org: 'SpringFest NIT', key: 'FP-2026-ZY9M-L34N-PL01', plan: 'Professional', status: 'Pending', expiry: 'N/A' },
]

export default function LicensingDashboard() {
  const [activeTab, setActiveTab] = useState('licenses')
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">License Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Generate license keys, manage subscriptions, and configure feature flags.</p>
        </div>
        <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Key className="h-4 w-4 mr-2" /> Generate License Key
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'licenses', name: 'Licenses & Keys', icon: ShieldCheck },
          { id: 'plans', name: 'Subscription Plans', icon: Settings },
          { id: 'logs', name: 'Activation Logs', icon: Activity },
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
        
        {activeTab === 'licenses' && (
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                  <th className="p-4 font-medium">Organization</th>
                  <th className="p-4 font-medium">License Key</th>
                  <th className="p-4 font-medium">Plan</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Expiry</th>
                  <th className="p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-200 dark:divide-slate-700">
                {mockLicenses.map(license => (
                  <tr key={license.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="p-4 font-medium text-slate-900 dark:text-white">{license.org}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-800 dark:text-slate-300 font-mono text-xs">
                          {license.key}
                        </code>
                        <button onClick={() => copyToClipboard(license.key)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                          {copied === license.key ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{license.plan}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${license.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : ''}
                        ${license.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : ''}
                      `}>
                        {license.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{license.expiry}</td>
                    <td className="p-4">
                      <button className="text-blue-600 dark:text-blue-400 hover:underline">Revoke</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <Settings className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Subscription Plans & Feature Flags</h3>
            <p>Manage pricing tiers and toggle features (White Label, AI, API) per plan.</p>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <Activity className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Activation Logs</h3>
            <p>Audit trail of all license activations, IP addresses, and device info.</p>
          </div>
        )}

      </div>
    </div>
  )
}
