"use client"

import { useState, useEffect, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  Globe, Save, Eye, Sparkles, Smartphone, Monitor,
  MessageSquare, Share2,
  Trophy, Clock, Award, Image as ImageIcon, Video, Newspaper,
  Plus, Trash2, ExternalLink, RefreshCw, Layers, Check, Palette,
  MapPin, Phone, Mail
} from "lucide-react"
import {
  getFestivalWebsiteConfigAction,
  saveFestivalWebsiteConfigAction,
  type FestivalWebsiteConfig
} from "@/lib/actions/website-builder"

export default function FestivalWebsiteBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<
    "branding" | "navigation" | "social" | "stream" | "gallery" | "news" | "preview"
  >("branding")
  const [devicePreview, setDevicePreview] = useState<"desktop" | "mobile">("desktop")

  const [festivalData, setFestivalData] = useState<any>(null)
  const [config, setConfig] = useState<FestivalWebsiteConfig>({
    heroTitle: "",
    heroSubtitle: "",
    bannerUrl: "",
    logoUrl: "",
    accentColor: "#4F46E5",
    themeMode: "dark",
    venueCampus: "Main Auditorium Campus",
    helpdeskPhone: "+91 98765 43210",
    helpdeskEmail: "contact@festportal.com",
    liveStreamUrl: "https://www.youtube.com/embed/live_stream",
    socialLinks: {
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      facebook: "https://facebook.com",
      whatsapp: "https://wa.me/919876543210",
      twitter: "https://x.com",
    },
    navPages: {
      showOverview: true,
      showResults: true,
      showSchedule: true,
      showLeaderboard: true,
      showGallery: true,
      showVideos: true,
      showNews: true,
    },
    gallery: [
      { id: "g1", title: "Inauguration Ceremony", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80", category: "Ceremony" },
      { id: "g2", title: "Classical Dance Stage", url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80", category: "Stage" },
      { id: "g3", title: "Light Music Band", url: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80", category: "Music" },
      { id: "g4", title: "Auditorium Crowd", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80", category: "Crowd" },
    ],
    news: [
      { id: "n1", title: "Grand Inauguration Ceremony Begins at Main Stage", date: "Today, 09:00 AM", content: "The cultural fest has been officially inaugurated by the dignitaries. Stage 1 programs are now live.", badge: "Live" },
      { id: "n2", title: "Stage 2 Schedule Updated for Afternoon Competitions", date: "Today, 11:30 AM", content: "Classical solo performances will commence at 02:00 PM on Stage 2. All participants are requested to report 30 minutes prior.", badge: "Schedule" },
    ],
  })

  // New gallery item form
  const [newPhotoTitle, setNewPhotoTitle] = useState("")
  const [newPhotoUrl, setNewPhotoUrl] = useState("")
  const [newPhotoCategory, setNewPhotoCategory] = useState("General")

  // New news item form
  const [newNewsTitle, setNewNewsTitle] = useState("")
  const [newNewsContent, setNewNewsContent] = useState("")
  const [newNewsBadge, setNewNewsBadge] = useState("Live")

  useEffect(() => {
    if (festivalId) {
      getFestivalWebsiteConfigAction(festivalId)
        .then((res) => {
          if (res.data) {
            setFestivalData(res.data.festival)
            if (res.data.config) {
              setConfig((prev) => ({ ...prev, ...res.data.config }))
            }
          }
        })
        .finally(() => setLoading(false))
    }
  }, [festivalId])

  const festivalSlug =
    festivalData?.short_name?.toLowerCase() ||
    festivalData?.code?.toLowerCase() ||
    (festivalData?.name ? festivalData.name.toLowerCase().replace(/[^a-z0-9]/g, "") : "fest")
  const publicWebsiteUrl = `https://${festivalSlug}.ahraz.site`

  const handleSave = () => {
    startTransition(async () => {
      const res = await saveFestivalWebsiteConfigAction(festivalId, config)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(res.message || "Website configuration saved successfully!")
      }
    })
  }

  const handleAddPhoto = () => {
    if (!newPhotoUrl) {
      toast.error("Please enter an image URL")
      return
    }
    const newItems = [
      ...(config.gallery || []),
      {
        id: `photo-${Date.now()}`,
        title: newPhotoTitle || "Festival Moment",
        url: newPhotoUrl,
        category: newPhotoCategory,
      },
    ]
    setConfig({ ...config, gallery: newItems })
    setNewPhotoTitle("")
    setNewPhotoUrl("")
    toast.success("Photo added to festival gallery")
  }

  const handleRemovePhoto = (id: string) => {
    setConfig({
      ...config,
      gallery: (config.gallery || []).filter((g) => g.id !== id),
    })
    toast.info("Photo removed")
  }

  const handleAddNews = () => {
    if (!newNewsTitle || !newNewsContent) {
      toast.error("Please enter a title and content")
      return
    }
    const newNews = [
      {
        id: `news-${Date.now()}`,
        title: newNewsTitle,
        content: newNewsContent,
        date: "Just now",
        badge: newNewsBadge,
      },
      ...(config.news || []),
    ]
    setConfig({ ...config, news: newNews })
    setNewNewsTitle("")
    setNewNewsContent("")
    toast.success("News bulletin published")
  }

  const handleRemoveNews = (id: string) => {
    setConfig({
      ...config,
      news: (config.news || []).filter((n) => n.id !== id),
    })
    toast.info("Bulletin removed")
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
        <p className="text-xs font-bold uppercase tracking-wider">Loading Website Builder...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* ── TOP ACTION BAR ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Website Builder &amp; Live Customizer
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize your white-labeled festival website, header navigation, social links &amp; footer.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <a
            href={publicWebsiteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs"
          >
            <span>Visit Live Site</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
          </a>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isPending ? "Publishing..." : "Save & Publish Website"}</span>
          </button>
        </div>
      </div>

      {/* ── BUILDER TABS ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: "branding", label: "Branding & Hero", icon: Sparkles },
          { id: "navigation", label: "Header Pages", icon: Layers },
          { id: "social", label: "Social Media & Footer", icon: Share2 },
          { id: "stream", label: "Videos & Live Stream", icon: Video },
          { id: "gallery", label: "Photo Gallery", icon: ImageIcon },
          { id: "news", label: "News & Bulletins", icon: Newspaper },
          { id: "preview", label: "Live Preview", icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── TAB 1: BRANDING & HERO ── */}
      {activeTab === "branding" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Website Identity &amp; Title</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Festival Title (Hero Heading)</label>
              <input
                type="text"
                value={config.heroTitle || ""}
                onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                placeholder="e.g. Optimuz Cultural Fest 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tagline / Subtitle</label>
              <textarea
                rows={3}
                value={config.heroSubtitle || ""}
                onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                placeholder="Track live scores, stage schedules, house points..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Campus / Venue Location</label>
              <input
                type="text"
                value={config.venueCampus || ""}
                onChange={(e) => setConfig({ ...config, venueCampus: e.target.value })}
                placeholder="e.g. Main Auditorium Campus, Central Ground"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Logo &amp; Accent Styling</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Logo Image URL</label>
              <input
                type="text"
                value={config.logoUrl || ""}
                onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                placeholder="https://.../logo.png"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
              {config.logoUrl && (
                <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <img src={config.logoUrl} alt="Logo Preview" className="h-10 w-10 rounded-lg object-contain" />
                  <span className="text-[11px] text-slate-500 font-medium truncate">Logo Preview</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Theme Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.accentColor || "#4F46E5"}
                  onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                  className="h-10 w-14 rounded-xl border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={config.accentColor || "#4F46E5"}
                  onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Direct Festival Domain</h4>
                <p className="text-[11px] text-slate-400">{publicWebsiteUrl}</p>
              </div>
              <a
                href={publicWebsiteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Preview ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: HEADER NAVIGATION PAGES ── */}
      {activeTab === "navigation" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Header Navigation Pages
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose which pages appear on your festival website navbar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: "showResults", label: "Live Results Page", icon: Trophy, desc: "Participant results & grades" },
              { key: "showSchedule", label: "Stage Schedules Page", icon: Clock, desc: "Timetable & call sheets" },
              { key: "showLeaderboard", label: "House Standings Page", icon: Award, desc: "Championship team points" },
              { key: "showGallery", label: "Photo Gallery Page", icon: ImageIcon, desc: "Festival photos & highlights" },
              { key: "showVideos", label: "Videos & Live Stream", icon: Video, desc: "Live YouTube / video player" },
              { key: "showNews", label: "News & Bulletins", icon: Newspaper, desc: "Official press updates" },
            ].map((item) => {
              const isEnabled = (config.navPages as any)?.[item.key] !== false
              const Icon = item.icon
              return (
                <div
                  key={item.key}
                  onClick={() => {
                    setConfig({
                      ...config,
                      navPages: {
                        ...config.navPages,
                        [item.key]: !isEnabled,
                      },
                    })
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    isEnabled
                      ? "border-indigo-600 bg-indigo-50/40"
                      : "border-slate-200 bg-white opacity-60 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isEnabled ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{item.label}</h4>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          isEnabled ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: SOCIAL MEDIA & FOOTER ── */}
      {activeTab === "social" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Social Media Icons &amp; Links
            </h3>
            <p className="text-xs text-slate-500">
              These icons appear prominently in your festival website footer.
            </p>

            {/* Instagram */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 fill-pink-600" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                Instagram Profile Link
              </label>
              <input
                type="text"
                value={config.socialLinks?.instagram || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    socialLinks: { ...config.socialLinks, instagram: e.target.value },
                  })
                }
                placeholder="https://instagram.com/yourfestival"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* YouTube */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 fill-red-600" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                YouTube Channel Link
              </label>
              <input
                type="text"
                value={config.socialLinks?.youtube || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    socialLinks: { ...config.socialLinks, youtube: e.target.value },
                  })
                }
                placeholder="https://youtube.com/@yourfestival"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp Helpline Link
              </label>
              <input
                type="text"
                value={config.socialLinks?.whatsapp || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    socialLinks: { ...config.socialLinks, whatsapp: e.target.value },
                  })
                }
                placeholder="https://wa.me/919876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* Facebook */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 fill-blue-600" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z"/></svg>
                Facebook Page Link
              </label>
              <input
                type="text"
                value={config.socialLinks?.facebook || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    socialLinks: { ...config.socialLinks, facebook: e.target.value },
                  })
                }
                placeholder="https://facebook.com/yourfestival"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* Twitter / X */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 fill-slate-900" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Twitter / X Profile Link
              </label>
              <input
                type="text"
                value={config.socialLinks?.twitter || ""}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    socialLinks: { ...config.socialLinks, twitter: e.target.value },
                  })
                }
                placeholder="https://x.com/yourfestival"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Contact &amp; Helpdesk Information
            </h3>
            <p className="text-xs text-slate-500">
              Displayed in the footer for participants, parents, and audience inquiries.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-indigo-600" /> Helpdesk Phone Number
              </label>
              <input
                type="text"
                value={config.helpdeskPhone || ""}
                onChange={(e) => setConfig({ ...config, helpdeskPhone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-purple-600" /> Official Email
              </label>
              <input
                type="text"
                value={config.helpdeskEmail || ""}
                onChange={(e) => setConfig({ ...config, helpdeskEmail: e.target.value })}
                placeholder="info@yourfestival.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-6 space-y-2">
              <h4 className="text-xs font-bold text-slate-800">Footer White-Label Guarantee</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Your public festival website at <span className="font-mono text-indigo-600">{publicWebsiteUrl}</span> contains no FesPro headers or generic footers. All copyright and branding belongs to your festival.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: VIDEOS & LIVE STREAM ── */}
      {activeTab === "stream" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Live Stream &amp; Stage Broadcast</h3>
            <p className="text-xs text-slate-500 mt-0.5">Embed your YouTube Live or video stream for remote viewers.</p>
          </div>

          <div className="space-y-1.5 max-w-xl">
            <label className="text-xs font-bold text-slate-700">YouTube Embed or Stream URL</label>
            <input
              type="text"
              value={config.liveStreamUrl || ""}
              onChange={(e) => setConfig({ ...config, liveStreamUrl: e.target.value })}
              placeholder="https://www.youtube.com/embed/live_stream?channel=..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
            />
          </div>

          {config.liveStreamUrl && (
            <div className="pt-4 max-w-2xl">
              <span className="text-xs font-bold text-slate-700 block mb-2">Live Player Preview</span>
              <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-200 shadow-md">
                <iframe src={config.liveStreamUrl} className="w-full h-full border-0" title="Stream Preview" allowFullScreen />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: PHOTO GALLERY ── */}
      {activeTab === "gallery" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Photo Gallery Manager</h3>
            <p className="text-xs text-slate-500 mt-0.5">Upload photos of performances, dignitary visits, and award ceremonies.</p>
          </div>

          {/* Add Photo Form */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="text"
              placeholder="Photo Title (e.g. Classical Dance)"
              value={newPhotoTitle}
              onChange={(e) => setNewPhotoTitle(e.target.value)}
              className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-900"
            />
            <input
              type="text"
              placeholder="Image URL (https://...)"
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-900"
            />
            <input
              type="text"
              placeholder="Category (e.g. Stage 1)"
              value={newPhotoCategory}
              onChange={(e) => setNewPhotoCategory(e.target.value)}
              className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-900"
            />
            <button
              onClick={handleAddPhoto}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Photo
            </button>
          </div>

          {/* Current Gallery List */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(config.gallery || []).map((item) => (
              <div key={item.id} className="group relative rounded-xl overflow-hidden aspect-[4/3] border border-slate-200 shadow-2xs">
                <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                  <span className="text-[10px] font-bold uppercase">{item.category}</span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate">{item.title}</span>
                    <button onClick={() => handleRemovePhoto(item.id)} className="p-1 rounded bg-red-600 hover:bg-red-700 text-white">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 6: NEWS & BULLETINS ── */}
      {activeTab === "news" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Official News &amp; Bulletins</h3>
            <p className="text-xs text-slate-500 mt-0.5">Publish live bulletins, schedule changes, and notices to participants.</p>
          </div>

          {/* Add News Form */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Bulletin Title"
                value={newNewsTitle}
                onChange={(e) => setNewNewsTitle(e.target.value)}
                className="sm:col-span-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-900"
              />
              <select
                value={newNewsBadge}
                onChange={(e) => setNewNewsBadge(e.target.value)}
                className="px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-900 font-bold"
              >
                <option value="Live">Live Update</option>
                <option value="Schedule">Schedule Change</option>
                <option value="Important">Important Notice</option>
                <option value="Results">Results Alert</option>
              </select>
            </div>
            <textarea
              rows={2}
              placeholder="Bulletin Content / Circular Details..."
              value={newNewsContent}
              onChange={(e) => setNewNewsContent(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-900"
            />
            <button
              onClick={handleAddNews}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Publish Bulletin
            </button>
          </div>

          {/* Current Bulletins List */}
          <div className="space-y-3">
            {(config.news || []).map((item) => (
              <div key={item.id} className="p-4 bg-white rounded-xl border border-slate-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {item.badge}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{item.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600">{item.content}</p>
                </div>
                <button onClick={() => handleRemoveNews(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 7: LIVE PREVIEW ── */}
      {activeTab === "preview" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Simulated Live Website Preview</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live simulation of your public website at {publicWebsiteUrl}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDevicePreview("desktop")}
                className={`p-2 rounded-lg ${devicePreview === "desktop" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
                title="Desktop View"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDevicePreview("mobile")}
                className={`p-2 rounded-lg ${devicePreview === "mobile" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
                title="Mobile View"
              >
                <Smartphone className="h-4 w-4" />
              </button>
              <a
                href={publicWebsiteUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100"
              >
                Open in New Tab ↗
              </a>
            </div>
          </div>

          <div className={`mx-auto transition-all ${devicePreview === "mobile" ? "max-w-sm" : "w-full"}`}>
            <div className="aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden border border-slate-300 shadow-xl">
              <iframe src={publicWebsiteUrl} className="w-full h-full border-0" title="Live Website Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
