"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { createAdminClient } from "@/lib/supabase/admin"
import type { PublicFaq } from "@/types/public"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"

export default function FaqPage() {
  const [faqs, setFaqs] = useState<PublicFaq[]>([])
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const supabase = createAdminClient()
      const { data } = await supabase.from("public_faqs").select("*").eq("is_published", true).order("sort_order")
      setFaqs(data || [])
    })()
  }, [])

  const grouped = faqs.reduce((acc: Record<string, PublicFaq[]>, f) => {
    if (!acc[f.category]) acc[f.category] = []
    acc[f.category].push(f)
    return acc
  }, {})

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-white/80">Find answers to common questions.</p>
        </div>
      </section>

      <section className="py-12 max-w-3xl mx-auto px-4">
        {faqs.length === 0 ? (
          <div className="p-12 rounded-xl bg-gray-50 text-center text-gray-400">
            <HelpCircle className="h-8 w-8 mx-auto mb-2" />
            <p>No FAQs yet</p>
          </div>
        ) : Object.entries(grouped).map(([category, categoryFaqs]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 capitalize mb-4">{category}</h2>
            <div className="space-y-2">
              {categoryFaqs.map(f => (
                <Card key={f.id} className="cursor-pointer" onClick={() => setOpen(open === f.id ? null : f.id)}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{f.question}</p>
                      {open === f.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </div>
                    {open === f.id && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{f.answer}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
