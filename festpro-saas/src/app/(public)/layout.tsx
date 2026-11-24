"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { AhrazFestProLogo, FestProWordmark } from "@/components/ui/logo"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AhrazFestProLogo height={28} showIcon={true} />
          </Link>
          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Home</Link>
            <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Pricing</Link>
            <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Contact Sales</Link>
          </nav>
          
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Log In</Link>
            <Link href="/create-fest" className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 transition-all">Create Fest ↗</Link>
          </div>

          <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            <Link href="/" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/features" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Features</Link>
            <Link href="/pricing" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Pricing</Link>
            <Link href="/contact" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Contact Sales</Link>
            <hr className="my-2" />
            <Link href="/login" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Log In</Link>
            <Link href="/create-fest" className="block text-sm font-bold text-indigo-600" onClick={() => setMenuOpen(false)}>Create your fest ↗</Link>
          </div>
        )}
      </header>
      
      <main>{children}</main>
      
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-3">
                <FestProWordmark height={22} variant="white" />
              </div>
              <p className="text-sm text-gray-400">Enterprise Festival Management Platform</p>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Platform</p>
              <div className="space-y-2 text-sm">
                <Link href="/features" className="block hover:text-white">Features</Link>
                <Link href="/pricing" className="block hover:text-white">Enterprise Pricing</Link>
                <Link href="/create-fest" className="block hover:text-white">Create Fest</Link>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Resources</p>
              <div className="space-y-2 text-sm">
                <Link href="/contact" className="block hover:text-white">Help Center</Link>
                <Link href="/contact" className="block hover:text-white">Contact Support</Link>
                <Link href="/contact" className="block hover:text-white">Documentation</Link>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Company</p>
              <div className="space-y-2 text-sm">
                <Link href="/contact" className="block hover:text-white">Contact Sales</Link>
                <Link href="/contact" className="block hover:text-white">About Us</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} FestPro. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/activate" className="text-indigo-400 hover:text-indigo-300 font-medium">Activate License Key</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
