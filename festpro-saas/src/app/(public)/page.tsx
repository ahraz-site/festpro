import Link from "next/link"
import { ArrowRight, Calendar, Trophy, Users, Music, Download, Image, Newspaper, Award, Search, CheckCircle } from "lucide-react"

export default function PublicHomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Welcome to FestPro
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              The ultimate enterprise festival management platform. Live results, schedules, and more.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/live" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                <Trophy className="h-5 w-5" /> Live Portal
              </Link>
              <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm">
                <Users className="h-5 w-5" /> Register Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Participants", value: "5,000+", icon: Users },
              { label: "Competitions", value: "200+", icon: Trophy },
              { label: "Events", value: "50+", icon: Calendar },
              { label: "Years", value: "25+", icon: Award },
            ].map(s => (
              <div key={s.label} className="text-center">
                <s.icon className="h-8 w-8 mx-auto mb-3 text-indigo-600" />
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Live Results", description: "Real-time competition results and leaderboards.", icon: Trophy, href: "/live" },
              { title: "Media Gallery", description: "Photos and videos from all events.", icon: Image, href: "/gallery" },
              { title: "Latest News", description: "Stay updated with announcements and press releases.", icon: Newspaper, href: "/news" },
              { title: "Downloads", description: "Rules, schedules, forms, and certificates.", icon: Download, href: "/downloads" },
              { title: "Registration", description: "Online registration for individuals and teams.", icon: Users, href: "/register" },
              { title: "Certificate Verification", description: "Verify certificates with QR code.", icon: CheckCircle, href: "/verify" },
            ].map(f => (
              <Link key={f.title} href={f.href} className="group p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all">
                <f.icon className="h-10 w-10 text-indigo-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{f.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{f.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience the Festival?</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">Explore live results, browse the gallery, or register for competitions.</p>
          <div className="flex justify-center gap-4">
            <Link href="/live" className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              <Trophy className="h-5 w-5 inline mr-2" />Live Portal
            </Link>
            <Link href="/register" className="px-6 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm">
              <Users className="h-5 w-5 inline mr-2" /> Register Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
