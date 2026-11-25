"use client"

import React, { useState, useEffect, useTransition } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  Camera,
  Newspaper,
  Share2,
  Video,
  Upload,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Plus,
  Radio,
  Image as ImageIcon,
} from "lucide-react"
import {
  getFestivalWebsiteConfigAction,
  saveFestivalWebsiteConfigAction,
} from "@/lib/actions/website-builder"
import type { FestivalWebsiteConfig, GalleryItem, NewsItem } from "@/types/website-studio"

function compressImageFile(file: File, maxDim = 1200, onLoaded: (url: string) => void) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const raw = e.target?.result as string
    if (!raw) return
    if (file.type === "image/gif" || file.type === "image/svg+xml") {
      onLoaded(raw)
      return
    }
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      let w = img.width
      let h = img.height
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w)
          w = maxDim
        } else {
          w = Math.round((w * maxDim) / h)
          h = maxDim
        }
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h)
        onLoaded(canvas.toDataURL("image/webp", 0.85))
      } else {
        onLoaded(raw)
      }
    }
    img.src = raw
  }
  reader.readAsDataURL(file)
}

export default function MediaPanelPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [config, setConfig] = useState<FestivalWebsiteConfig | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Photo form
  const [photoTitle, setPhotoTitle] = useState("")
  const [photoCategory, setPhotoCategory] = useState("Stage 1")
  const [photoDataUrl, setPhotoDataUrl] = useState("")

  // News form
  const [newsTitle, setNewsTitle] = useState("")
  const [newsBadge, setNewsBadge] = useState("Live")
  const [newsContent, setNewsContent] = useState("")

  // Live Stream URL
  const [liveStreamUrl, setLiveStreamUrl] = useState("")

  const loadData = () => {
    setLoading(true)
    getFestivalWebsiteConfigAction(festivalId)
      .then((res) => {
        if (res?.data?.config) {
          setConfig(res.data.config)
          setLiveStreamUrl(res.data.config.liveStreamUrl || "")
        }
      })
      .catch((err) => toast.error(err.message || "Failed to load website media"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (festivalId) loadData()
  }, [festivalId])

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success("Link copied to clipboard")
    setTimeout(() => setCopiedKey(null), 2500)
  }

  const handleAddPhoto = () => {
    if (!photoTitle.trim()) {
      toast.error("Please enter a photo caption/title")
      return
    }
    if (!photoDataUrl.trim()) {
      toast.error("Please choose a photo to upload")
      return
    }
    if (!config) return

    const newItem: GalleryItem = {
      id: `g_${Date.now()}`,
      title: photoTitle.trim(),
      category: photoCategory,
      url: photoDataUrl,
    }

    const updatedConfig: FestivalWebsiteConfig = {
      ...config,
      gallery: [newItem, ...(config.gallery || [])],
    }

    startTransition(async () => {
      const res = await saveFestivalWebsiteConfigAction(festivalId, updatedConfig)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Photo published live to website gallery!")
        setConfig(updatedConfig)
        setPhotoTitle("")
        setPhotoDataUrl("")
      }
    })
  }

  const handleDeletePhoto = (id: string) => {
    if (!config) return
    const updatedGallery = (config.gallery || []).filter((g) => g.id !== id)
    const updatedConfig: FestivalWebsiteConfig = { ...config, gallery: updatedGallery }

    startTransition(async () => {
      const res = await saveFestivalWebsiteConfigAction(festivalId, updatedConfig)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Photo removed from gallery")
        setConfig(updatedConfig)
      }
    })
  }

  const handlePublishNews = () => {
    if (!newsTitle.trim() || !newsContent.trim()) {
      toast.error("Please enter both title and content for the bulletin")
      return
    }
    if (!config) return

    const newItem: NewsItem = {
      id: `n_${Date.now()}`,
      title: newsTitle.trim(),
      badge: newsBadge,
      content: newsContent.trim(),
      date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    const updatedConfig: FestivalWebsiteConfig = {
      ...config,
      news: [newItem, ...(config.news || [])],
    }

    startTransition(async () => {
      const res = await saveFestivalWebsiteConfigAction(festivalId, updatedConfig)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Official bulletin broadcasted live to website!")
        setConfig(updatedConfig)
        setNewsTitle("")
        setNewsContent("")
      }
    })
  }

  const handleDeleteNews = (id: string) => {
    if (!config) return
    const updatedNews = (config.news || []).filter((n) => n.id !== id)
    const updatedConfig: FestivalWebsiteConfig = { ...config, news: updatedNews }

    startTransition(async () => {
      const res = await saveFestivalWebsiteConfigAction(festivalId, updatedConfig)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Bulletin removed")
        setConfig(updatedConfig)
      }
    })
  }

  const handleSaveLiveStream = () => {
    if (!config) return
    const updatedConfig: FestivalWebsiteConfig = {
      ...config,
      liveStreamUrl: liveStreamUrl.trim(),
    }
    startTransition(async () => {
      const res = await saveFestivalWebsiteConfigAction(festivalId, updatedConfig)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Live stream URL updated successfully")
        setConfig(updatedConfig)
      }
    })
  }

  const festivalSlug = config?.heroTitle ? config.heroTitle.toLowerCase().replace(/[^a-z0-9]/g, "") : "fest"
  const publicPortalUrl = `https://${festivalSlug}.ahraz.site`
  const publicResultsUrl = `${publicPortalUrl}#results`

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            <Camera className="h-4 w-4" />
            <span>Media, Photography &amp; Press Desk</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Media Panel
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Instant live sync: publish photography to website gallery, broadcast circulars &amp; manage live stream telecasts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
          <a
            href={`/festivals/${festivalId}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>View Live Site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Quick Share Links Kit */}
      <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
          <Share2 className="h-4 w-4" />
          <span>Press Release &amp; Social Share Links</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Public Portal URL</div>
              <div className="text-xs font-bold truncate text-slate-900 dark:text-white mt-0.5">
                {publicPortalUrl}
              </div>
            </div>
            <button
              onClick={() => handleCopy(publicPortalUrl, "portal")}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {copiedKey === "portal" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Live Results Direct Link</div>
              <div className="text-xs font-bold truncate text-slate-900 dark:text-white mt-0.5">
                {publicResultsUrl}
              </div>
            </div>
            <button
              onClick={() => handleCopy(publicResultsUrl, "results")}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {copiedKey === "results" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-bold uppercase">WhatsApp Share Summary</div>
              <div className="text-xs font-bold truncate text-slate-900 dark:text-white mt-0.5">
                Click to copy press text
              </div>
            </div>
            <button
              onClick={() =>
                handleCopy(
                  `📢 *${config?.heroTitle || "Festival 2026"} Updates*\nTrack live scores, stage schedules & instant results on the official festival portal:\n🌐 ${publicPortalUrl}`,
                  "wa"
                )
              }
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {copiedKey === "wa" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Photo Upload & Gallery */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-indigo-500" />
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Live Photo Stream
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              {config?.gallery?.length || 0} published photos
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Photo Caption / Event Title"
                value={photoTitle}
                onChange={(e) => setPhotoTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
              <select
                value={photoCategory}
                onChange={(e) => setPhotoCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Stage 1">Stage 1</option>
                <option value="Stage 2">Stage 2</option>
                <option value="Ceremony">Ceremony</option>
                <option value="Auditorium">Auditorium</option>
                <option value="Prizes">Prize Distribution</option>
                <option value="Crowd">Crowd &amp; Campus</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold text-center cursor-pointer transition-all flex items-center justify-center gap-1.5">
                <Upload className="h-4 w-4" />
                <span>{photoDataUrl ? "Change Photo File" : "Choose Photo from PC"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) compressImageFile(f, 1000, setPhotoDataUrl)
                  }}
                />
              </label>

              <button
                onClick={handleAddPhoto}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer transition-all shadow-xs"
              >
                Publish Photo
              </button>
            </div>

            {photoDataUrl && (
              <div className="h-28 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 relative">
                <img src={photoDataUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
            {(config?.gallery || []).map((g) => (
              <div
                key={g.id}
                className="group relative rounded-xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950"
              >
                <img src={g.url} alt={g.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                  <span className="text-[9px] font-bold uppercase truncate">{g.category}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold truncate line-clamp-1">{g.title}</span>
                    <button
                      onClick={() => handleDeletePhoto(g.id)}
                      className="p-1 rounded bg-rose-600/80 hover:bg-rose-600 text-white cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Bulletins & Live Broadcast */}
        <div className="space-y-6">
          {/* News & Bulletins Composer */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-emerald-500" />
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Official Bulletins &amp; News
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                {config?.news?.length || 0} notices live
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Bulletin Headline"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  className="col-span-2 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
                <select
                  value={newsBadge}
                  onChange={(e) => setNewsBadge(e.target.value)}
                  className="px-2.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Live">Live</option>
                  <option value="Schedule">Schedule</option>
                  <option value="Results">Results</option>
                  <option value="Official">Official Notice</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <textarea
                placeholder="Full bulletin message for website news tab..."
                value={newsContent}
                onChange={(e) => setNewsContent(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white resize-none"
              />

              <button
                onClick={handlePublishNews}
                disabled={isPending}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-all shadow-xs"
              >
                Broadcast Bulletin Live
              </button>
            </div>

            {/* List of News */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 pt-1">
              {(config?.news || []).map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {n.badge}
                      </span>
                      <span className="text-[10px] text-slate-400">{n.date}</span>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-white truncate">{n.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{n.content}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteNews(n.id)}
                    className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Live Stream URL Setup */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-rose-500" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Live Broadcast Link
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste your YouTube Live or RTMP embed stream URL to broadcast directly on the festival portal.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="https://www.youtube.com/embed/..."
                value={liveStreamUrl}
                onChange={(e) => setLiveStreamUrl(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono"
              />
              <button
                onClick={handleSaveLiveStream}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
