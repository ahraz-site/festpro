"use client"

import React, { useState } from 'react'
import { Calendar as CalendarIcon, Clock, MapPin, Video, User, Plus } from 'lucide-react'

const MOCK_DEMOS = [
  { id: '1', company: 'GlobalEvents LLC', contact: 'John Doe', time: '10:00 AM', mode: 'Google Meet', status: 'Scheduled' },
  { id: '2', company: 'MusicFest Org', contact: 'Jane Smith', time: '02:00 PM', mode: 'Zoom', status: 'Completed' },
  { id: '3', company: 'Foodies Group', contact: 'Mike Johnson', time: '04:30 PM', mode: 'Offline', status: 'Scheduled' }
]

export default function DemosPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Demo Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400">Schedule and manage product demonstrations.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Book Demo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold mb-4">Today's Schedule</h2>
          <div className="space-y-4">
            {MOCK_DEMOS.map(demo => (
              <div key={demo.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <div className="flex gap-4 items-start">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl text-blue-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{demo.time} - {demo.company}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {demo.contact}</span>
                      <span className="flex items-center gap-1">
                        {demo.mode === 'Offline' ? <MapPin className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                        {demo.mode}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    demo.status === 'Completed' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30' 
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                  }`}>
                    {demo.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold mb-4">Calendar Picker</h2>
          {/* Simple UI placeholder for calendar */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900 text-center text-slate-500 text-sm">
            [Calendar Widget Placeholder]
            <br/><br/>
            Select a date to view scheduled demos.
          </div>
        </div>
      </div>
    </div>
  )
}
