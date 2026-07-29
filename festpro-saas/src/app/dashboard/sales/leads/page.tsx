"use client"

import React, { useState, useEffect } from 'react'
import { Plus, MoreVertical, Search, Filter } from 'lucide-react'

// Simple mock for UI demonstration since we'd normally use a robust drag-and-drop library (e.g. dnd-kit or react-beautiful-dnd)
const COLUMNS = ['New', 'Contacted', 'Demo Scheduled', 'Quotation Sent', 'Negotiation', 'Won', 'Lost']

const MOCK_LEADS = [
  { id: '1', title: 'TechCorp - Enterprise', company: 'TechCorp Inc', status: 'New', value: 12000 },
  { id: '2', title: 'GlobalEvents - Pro', company: 'GlobalEvents LLC', status: 'Demo Scheduled', value: 4500 },
  { id: '3', title: 'MusicFest - Starter', company: 'MusicFest Org', status: 'Quotation Sent', value: 1200 },
  { id: '4', title: 'Foodies - Enterprise', company: 'Foodies Group', status: 'Negotiation', value: 15000 },
]

export default function LeadsKanbanPage() {
  const [leads, setLeads] = useState(MOCK_LEADS)

  // In a real app, we would fetch from fetchLeads() API

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leads Pipeline</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and track all incoming sales inquiries.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
            <Filter className="h-4 w-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Lead
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
        {COLUMNS.map(col => (
          <div key={col} className="w-80 shrink-0 flex flex-col bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">{col}</h3>
              <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs px-2 py-0.5 rounded-full font-medium">
                {leads.filter(l => l.status === col).length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 px-1">
              {leads.filter(l => l.status === col).map(lead => (
                <div key={lead.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm">{lead.title}</h4>
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{lead.company}</p>
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-green-600">${lead.value.toLocaleString()}</span>
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      SA
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
