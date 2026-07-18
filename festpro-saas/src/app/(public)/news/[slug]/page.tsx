import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, User, ArrowLeft } from "lucide-react"

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createAdminClient()
  const { data: item } = await supabase.from("public_news").select("*").eq("slug", params.slug).eq("is_published", true).single()
  if (!item) notFound()

  const { data: related } = await supabase.from("public_news").select("*").eq("festival_id", item.festival_id).neq("id", item.id).eq("is_published", true).limit(3)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/news" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to News
      </Link>

      <article>
        <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 capitalize mb-4 inline-block">{item.category.replace("_", " ")}</span>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{item.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
          {item.author && <span className="flex items-center gap-1"><User className="h-4 w-4" /> {item.author}</span>}
          {item.published_at && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(item.published_at).toLocaleDateString()}</span>}
        </div>
        {item.cover_image_url && (
          <div className="relative h-96 rounded-xl overflow-hidden mb-8">
            <Image src={item.cover_image_url} alt={item.title} fill className="object-cover" />
          </div>
        )}
        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">{item.body || item.excerpt}</div>
      </article>

      {related && related.length > 0 && (
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map(r => (
              <Link key={r.id} href={`/news/${r.slug}`} className="group">
                <div className="relative h-40 rounded-lg overflow-hidden bg-gray-100 mb-3">
                  {r.cover_image_url && <Image src={r.cover_image_url} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform" />}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">{r.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{new Date(r.published_at || r.created_at).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
