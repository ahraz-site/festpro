"use client"

import React from 'react'
import { ShieldCheck, AlertCircle, ArrowUpCircle } from 'lucide-react'

export default function SubscriptionPage() {
  const currentPlan = {
    name: 'Professional',
    status: 'Active',
    expiry: '2027-07-29',
    users: { current: 1500, limit: 2000 },
    festivals: { current: 2, limit: 3 },
    storage: { current: 1.2, limit: 5 } // in GB
  }

  const percentage = (current: number, max: number) => Math.min(100, Math.round((current / max) * 100))

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subscription & Billing</h1>
        <p className="text-slate-500 dark:text-slate-400">View your active license, resource usage, and upgrade options.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{currentPlan.name} Plan</h2>
              <p className="text-slate-500 dark:text-slate-400">
                License valid until <span className="font-semibold text-slate-700 dark:text-slate-300">{currentPlan.expiry}</span>
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            {currentPlan.status}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Usage Metrics */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Participants</h4>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-slate-900 dark:text-white">{currentPlan.users.current}</span>
              <span className="text-slate-500 dark:text-slate-400">{currentPlan.users.limit}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${percentage(currentPlan.users.current, currentPlan.users.limit)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Active Festivals</h4>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-slate-900 dark:text-white">{currentPlan.festivals.current}</span>
              <span className="text-slate-500 dark:text-slate-400">{currentPlan.festivals.limit}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${percentage(currentPlan.festivals.current, currentPlan.festivals.limit)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Storage (GB)</h4>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold text-slate-900 dark:text-white">{currentPlan.storage.current}</span>
              <span className="text-slate-500 dark:text-slate-400">{currentPlan.storage.limit}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${percentage(currentPlan.storage.current, currentPlan.storage.limit)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center text-slate-600 dark:text-slate-400">
            <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
            <span className="text-sm">Approaching participant limit. Consider upgrading.</span>
          </div>
          <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            <ArrowUpCircle className="h-4 w-4 mr-2" /> Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  )
}
