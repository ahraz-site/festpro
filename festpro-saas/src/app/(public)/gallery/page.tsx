import { createAdminClient } from "@/lib/supabase/admin"
import Image from "next/image"
import { ImageIcon, Video, FolderOpen } from "lucide-react"

export default async function GalleryPage() {
  const supabase = createAdminClient()
  const { data: items } = await supabase
    .from("public_gallery")
    .select("*")
    .eq("is_published", true)
    .order("sort_order")
    .order("created_at", { ascending: false })
    .limit(50)

  const albums = items?.filter(i => i.gallery_type === "album") || []
  const photos = items?.filter(i => i.gallery_type === "photo") || []
  const videos = items?.filter(i => i.gallery_type === "video") || []

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Gallery</h1>
          <p className="text-white/80">Moments captured from our festivals.</p>
        </div>
      </section>

      <section className="py-12 max-w-7xl mx-auto px-4">
        {albums.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FolderOpen className="h-6 w-6 text-indigo-500" /> Albums
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
              {albums.map(a => (
                <div key={a.id} className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-video cursor-pointer hover:shadow-lg transition-shadow">
                  {a.thumbnail_url ? (
                    <Image src={a.thumbnail_url} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400"><FolderOpen className="h-12 w-12" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <p className="text-white font-semibold">{a.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-indigo-500" /> Photos
        </h2>
        {photos.length === 0 ? (
          <div className="p-12 rounded-xl bg-gray-50 text-center text-gray-400 mb-12">
            <ImageIcon className="h-8 w-8 mx-auto mb-2" />
            <p>No photos uploaded yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {photos.map(p => (
              <div key={p.id} className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-square cursor-pointer hover:shadow-lg transition-shadow">
                <Image src={p.media_url} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-white text-sm font-medium">{p.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {videos.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Video className="h-6 w-6 text-indigo-500" /> Videos
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map(v => (
                <div key={v.id} className="rounded-xl overflow-hidden bg-gray-100 aspect-video relative group cursor-pointer">
                  {v.thumbnail_url ? (
                    <Image src={v.thumbnail_url} alt={v.title} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400"><Video className="h-12 w-12" /></div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Video className="h-8 w-8 text-indigo-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <p className="text-white font-medium">{v.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
