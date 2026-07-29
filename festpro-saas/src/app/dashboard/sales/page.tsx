"use client"

import React, { useEffect, useState } from 'react'
import { 
  Users, Target, DollarSign, TrendingUp, Calendar, ArrowRight,
  PieChart, Activity, Clock
} from 'lucide-react'
import Link from 'next/link'

export default function SalesDashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, we would fetch aggregate analytics here.
    setTimeout(() => setLoading(false), 500)
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sales & CRM Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage leads, demos, quotes, and customer lifecycle.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Link href="/dashboard/sales/leads" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            View Leads Board
          </Link>
          <Link href="/dashboard/sales/finance" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700">
            Quotes & Invoices
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Leads</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">1,248</p>
          <div className="flex items-center text-sm mt-2 text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+12% from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Conversion Rate</h3>
            <Target className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">18.5%</p>
          <div className="flex items-center text-sm mt-2 text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+2.4% from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly Revenue</h3>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">$84,250</p>
          <div className="flex items-center text-sm mt-2 text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+8% from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Subscriptions</h3>
            <Activity className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">342</p>
          <div className="flex items-center text-sm mt-2 text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>+15 new this month</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Links / Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sales Workflows</h3>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            <Link href="/dashboard/sales/leads" className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Leads Kanban Board</h4>
                  <p className="text-sm text-slate-500">Track inquiries and prospect progress</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </Link>
            
            <Link href="/dashboard/sales/demos" className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Demo Booking Calendar</h4>
                  <p className="text-sm text-slate-500">Manage and schedule product walkthroughs</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </Link>

            <Link href="/dashboard/sales/finance" className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Quotes & Invoicing</h4>
                  <p className="text-sm text-slate-500">Send professional proposals and track payments</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </Link>

            <Link href="/dashboard/sales/customers" className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Customer 360 View</h4>
                  <p className="text-sm text-slate-500">Full timeline and lifecycle management</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white dark:border-slate-800 bg-blue-100 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">Invoice Paid</div>
                      <time className="text-xs font-medium text-green-500">Just now</time>
                    </div>
                    <div className="text-slate-500 text-xs">TechCorp Inc. paid $4,500 for Enterprise Plan</div>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white dark:border-slate-800 bg-indigo-100 text-indigo-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">Demo Scheduled</div>
                      <time className="text-xs font-medium text-slate-500">2h ago</time>
                    </div>
                    <div className="text-slate-500 text-xs">GlobalEvents LLC scheduled a demo for tomorrow 2PM</div>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white dark:border-slate-800 bg-purple-100 text-purple-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">License Renewed</div>
                      <time className="text-xs font-medium text-slate-500">5h ago</time>
                    </div>
                    <div className="text-slate-500 text-xs">MusicFest Org renewed their annual subscription.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
