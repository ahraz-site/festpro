"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { submitContactInquiry } from "@/lib/actions/public"
import { Loader2, Send, Mail, Phone, MapPin, CheckCircle } from "lucide-react"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) { toast.error("Required fields missing"); return }
    setLoading(true)
    const res = await submitContactInquiry(form)
    setLoading(false)
    if (res.error) toast.error(res.error)
    else setSent(true)
  }

  if (sent) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Message Sent!</h1>
      <p className="text-gray-500">We&apos;ll get back to you as soon as possible.</p>
    </div>
  )

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-white/80">Have a question? We&apos;d love to hear from you.</p>
        </div>
      </section>

      <section className="py-12 max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your Name *" required />
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Your Email *" required />
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone Number" />
              <Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Subject" />
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Your Message *" required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[120px]" />
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Send Message
              </Button>
            </form>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-indigo-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">info@festpro.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-indigo-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-indigo-600 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">Address</p>
                  <p className="text-sm text-gray-500">123 Festival Street<br />Event City, EC 12345</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
