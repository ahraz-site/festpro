import { getKnowledgeArticles, getKnowledgeCategories } from "@/lib/actions/edms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KNOWLEDGE_STATUSES, KNOWLEDGE_ARTICLE_TYPES } from "@/config/edms"
import { BookOpen, Bookmark } from "lucide-react"

export default async function KnowledgePage() {
  const [articlesRes, catsRes] = await Promise.all([getKnowledgeArticles({ limit: 100 }), getKnowledgeCategories()])
  if ("error" in articlesRes) return <div className="text-red-500">{articlesRes.error}</div>
  if ("error" in catsRes) return <div className="text-red-500">{catsRes.error}</div>
  const { data: articles, total } = articlesRes

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Center</h1>
        <p className="text-sm text-gray-500">Articles, FAQs, policies, manuals & operational guides</p>
      </div>
      <div className="flex gap-2 flex-wrap mb-2">
        {catsRes.data.map((c) => (
          <a key={c.id} href={`/dashboard/platform/edms/knowledge?category_id=${c.id}`}
            className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600">
            {c.category_name}
          </a>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => {
          const stCfg = KNOWLEDGE_STATUSES.find((s) => s.value === a.status)
          const artCfg = KNOWLEDGE_ARTICLE_TYPES.find((at) => at.value === a.article_type)
          const cat = a as any
          return (
            <Card key={a.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${stCfg?.color ?? ""}`}>{stCfg?.label ?? a.status}</span>
                  </div>
                  <CardTitle className="text-sm font-medium leading-tight">{a.title}</CardTitle>
                </div>
                {a.is_featured && <Bookmark className="h-4 w-4 text-amber-500" />}
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {a.excerpt && <p className="text-xs text-gray-600 line-clamp-2">{a.excerpt}</p>}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {artCfg && <span>{artCfg.label}</span>}
                  {cat.knowledge_categories?.category_name && <span>&middot; {cat.knowledge_categories.category_name}</span>}
                  <span>&middot; {a.view_count} views</span>
                </div>
                {a.tags?.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {a.tags.map((t) => <span key={t} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{t}</span>)}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
        {articles.length === 0 && <p className="text-sm text-gray-400 col-span-3 py-8 text-center">No knowledge articles yet</p>}
      </div>
    </div>
  )
}
