import { createAdminClient } from "@/lib/supabase/admin"
import Link from "next/link"
import { Download, FileText, FileSpreadsheet, FileImage, FileArchive, ExternalLink } from "lucide-react"

const categoryIcons: Record<string, any> = {
  rules: FileText, schedule: FileText, circulars: FileText,
  forms: FileSpreadsheet, results: FileText, certificates: FileImage,
  general: FileArchive,
}

export default async function DownloadsPage() {
  const supabase = createAdminClient()
  const { data: items } = await supabase
    .from("public_downloads")
    .select("*")
    .eq("is_published", true)
    .order("sort_order")
    .order("created_at", { ascending: false })

  const grouped = (items || []).reduce((acc: Record<string, any[]>, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Downloads</h1>
          <p className="text-white/80">Rules, schedules, forms, and certificates.</p>
        </div>
      </section>

      <section className="py-12 max-w-7xl mx-auto px-4">
        {Object.keys(grouped).length === 0 ? (
          <div className="p-12 rounded-xl bg-gray-50 text-center text-gray-400">
            <Download className="h-8 w-8 mx-auto mb-2" />
            <p>No downloads available yet</p>
          </div>
        ) : Object.entries(grouped).map(([category, files]) => {
          const Icon = categoryIcons[category] || FileText
          return (
            <div key={category} className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 capitalize mb-4 flex items-center gap-2">
                <Icon className="h-5 w-5 text-indigo-500" /> {category}
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {files.map(f => (
                  <a key={f.id} href={f.file_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5 text-gray-400 group-hover:text-indigo-500" />
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-indigo-600">{f.title}</p>
                        {f.description && <p className="text-xs text-gray-500">{f.description}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {f.file_size ? `${(f.file_size / 1024).toFixed(0)} KB` : ""}
                          {f.download_count > 0 ? ` · ${f.download_count} downloads` : ""}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
