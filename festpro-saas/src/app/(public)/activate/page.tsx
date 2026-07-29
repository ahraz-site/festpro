"use client"

import React, { useState } from 'react'
import { Key, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ActivatePage() {
  const [licenseKey, setLicenseKey] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!licenseKey.startsWith('FP-')) {
      setStatus('error')
      setErrorMessage("Invalid License Key format. It should start with 'FP-'")
      return
    }

    setStatus('loading')

    // Simulate API call to validate and activate the license
    setTimeout(() => {
      // For now, any key starting with FP-2026 is mocked as successful for UI presentation
      if (licenseKey.includes('2026')) {
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMessage("License Key not found or already activated.")
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-20 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <ShieldCheck className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-500" />
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
            Activate Your License
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Enter the 16-character License Key provided by our sales team.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          {status === 'success' ? (
            <div className="text-center space-y-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30">
                <ShieldCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">License Activated!</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Your organization has been successfully provisioned. You can now set up your administrator account.
                </p>
              </div>
              <Link href="/register?license=verified" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                Create Organization Account
              </Link>
            </div>
          ) : (
            <form onSubmit={handleActivate} className="space-y-6">
              <div>
                <label htmlFor="licenseKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  License Key
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="licenseKey"
                    required
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                    placeholder="FP-2026-XXXX-XXXX-XXXX"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 uppercase tracking-widest font-mono text-center"
                  />
                </div>
              </div>

              {status === 'error' && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800 flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <div className="ml-3 text-sm text-red-700 dark:text-red-300">
                    {errorMessage}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Verifying...
                  </>
                ) : (
                  'Validate & Activate'
                )}
              </button>
            </form>
          )}
        </div>
        
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Need a license? <Link href="/pricing" className="text-blue-600 hover:underline">View pricing plans</Link>
        </p>
      </div>
    </div>
  )
}
