"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ChevronDown } from "lucide-react"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-bold">F</div>
            <span className="text-lg font-bold text-gray-900">FestPro</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Home</Link>
            <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Pricing</Link>
            <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Contact Sales</Link>
          </nav>
          
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Log In</Link>
            <Link href="/demo" className="text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors">Book Live Demo</Link>
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
            <Link href="/demo" className="block text-sm font-bold text-indigo-600" onClick={() => setMenuOpen(false)}>Book Live Demo</Link>
          </div>
        )}
      </header>
      
      <main>{children}</main>
      
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-white font-semibold mb-3">FestPro</p>
              <p className="text-sm">Enterprise Festival Management Platform</p>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Platform</p>
              <div className="space-y-2 text-sm">
                <Link href="/features" className="block hover:text-white">Features</Link>
                <Link href="/pricing" className="block hover:text-white">Enterprise Pricing</Link>
                <Link href="/demo" className="block hover:text-white">Book a Demo</Link>
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
