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
            <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">About</Link>
            <Link href="/live" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Live</Link>
            <Link href="/gallery" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Gallery</Link>
            <Link href="/news" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">News</Link>
            <Link href="/register" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Register</Link>
            <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Contact</Link>
          </nav>
          <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            <Link href="/" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/about" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/live" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Live</Link>
            <Link href="/gallery" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Gallery</Link>
            <Link href="/news" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>News</Link>
            <Link href="/register" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Register</Link>
            <Link href="/contact" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Contact</Link>
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
              <p className="text-white font-semibold mb-3">Quick Links</p>
              <div className="space-y-2 text-sm">
                <Link href="/live" className="block hover:text-white">Live Portal</Link>
                <Link href="/gallery" className="block hover:text-white">Gallery</Link>
                <Link href="/news" className="block hover:text-white">News</Link>
                <Link href="/register" className="block hover:text-white">Register</Link>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Resources</p>
              <div className="space-y-2 text-sm">
                <Link href="/downloads" className="block hover:text-white">Downloads</Link>
                <Link href="/faq" className="block hover:text-white">FAQ</Link>
                <Link href="/certificate" className="block hover:text-white">Certificate Verification</Link>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Contact</p>
              <div className="space-y-2 text-sm">
                <Link href="/contact" className="block hover:text-white">Get in Touch</Link>
                <Link href="/about" className="block hover:text-white">About Us</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            &copy; {new Date().getFullYear()} FestPro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
