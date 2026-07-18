import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import Image from "next/image"
import { Newspaper, Calendar, ArrowRight, User } from "lucide-react"

export default async function NewsPage() {
  const supabase = createAdminClient()
  const { data: newsItems } = await supabase
    .from("public_news")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(30)

  const featured = newsItems?.filter(n => n.is_featured).slice(0, 1)
  const rest = newsItems?.filter(n => !featured?.find(f => f.id === n.id)) || []

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">News & Updates</h1>
          <p className="text-white/80">Latest news, announcements, and press releases.</p>
        </div>
      </section>

      <section className="py-12 max-w-7xl mx-auto px-4">
        {featured && featured.length > 0 && (
          <Link href={`/news/${featured[0].slug}`} className="group block mb-12">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-[21/9]">
              {featured[0].cover_image_url && (
                <Image src={featured[0].cover_image_url} alt={featured[0].title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-8">
                <div className="max-w-2xl">
                  <span className="text-xs px-2 py-1 rounded bg-indigo-500 text-white mb-3 inline-block capitalize">{featured[0].category.replace("_", " ")}</span>
                  <h2 className="text-3xl font-bold text-white group-hover:text-indigo-200 transition-colors">{featured[0].title}</h2>
                  {featured[0].excerpt && <p className="text-white/70 mt-2">{featured[0].excerpt}</p>}
                  <div className="flex items-center gap-4 mt-3 text-sm text-white/60">
                    {featured[0].author && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {featured[0].author}</span>}
                    {featured[0].published_at && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(featured[0].published_at).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.length === 0 && !featured?.length ? (
            <div className="col-span-full p-12 rounded-xl bg-gray-50 text-center text-gray-400">
              <Newspaper className="h-8 w-8 mx-auto mb-2" />
              <p>No news published yet</p>
            </div>
          ) : rest.map(item => (
            <Link key={item.id} href={`/news/${item.slug}`} className="group rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-100">
                {item.cover_image_url && <Image src={item.cover_image_url} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform" />}
              </div>
              <div className="p-4">
                <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 capitalize">{item.category.replace("_", " ")}</span>
                <h3 className="font-semibold text-gray-900 mt-2 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                {item.excerpt && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.excerpt}</p>}
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                  {item.published_at && <span>{new Date(item.published_at).toLocaleDateString()}</span>}
                  {item.author && <span>· {item.author}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
