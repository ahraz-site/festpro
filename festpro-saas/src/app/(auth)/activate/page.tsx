"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { KeyRound, Building, Mail, Lock, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ActivateLicensePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    licenseKey: '',
    orgName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    
    try {
      const supabase = createClient()
      
      // 1. In a real application, verify the license key against your DB via Edge Function / RPC
      // For this demo, any key starting with "FEST" works.
      if (!formData.licenseKey.toUpperCase().startsWith("FEST")) {
        throw new Error("Invalid or expired License Key.")
      }

      // 2. Sign up the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: "Organization Admin",
            role: "org_admin"
          }
        }
      })

      if (authError) throw authError

      // 3. Create Organization Profile (simulated or actual)
      // If we had the real SQL schema, we'd insert into `profiles` and `organizations` here or via trigger.
      
      router.push('/dashboard')
      
    } catch (err: any) {
      setError(err.message || "Failed to activate license.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
            F
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">FestPro</span>
        </Link>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Activate Your License
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Enter the official license key provided by our sales team.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200 dark:border-slate-700">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</span>
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleActivate}>
            <div>
              <label htmlFor="licenseKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                License Key *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="licenseKey"
                  name="licenseKey"
                  type="text"
                  required
                  value={formData.licenseKey}
                  onChange={handleChange}
                  placeholder="e.g. FEST-XXXX-XXXX-XXXX"
                  className="block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 py-3 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 font-mono uppercase"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-5 mt-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Create Admin Account</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="orgName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Organization Name *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="orgName"
                      name="orgName"
                      type="text"
                      required
                      value={formData.orgName}
                      onChange={handleChange}
                      className="block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 py-3 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Admin Email *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 py-3 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 py-3 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirm Password *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 py-3 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all items-center gap-2 mt-6"
              >
                {loading ? 'Activating License...' : 'Activate & Create Account'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have a license key? <Link href="/contact" className="font-semibold text-indigo-600 hover:text-indigo-500">Contact Sales</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
