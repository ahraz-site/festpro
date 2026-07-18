import { createAdminClient } from "@/lib/supabase/admin"
import { Users, Target, Eye, History, MapPin, Phone, Award } from "lucide-react"

export default async function AboutPage() {
  const supabase = createAdminClient()
  const { data: festival } = await supabase.from("festivals").select("*").eq("is_public", true).order("start_date", { ascending: false }).limit(1).single()
  const { count: participantCount } = await supabase.from("participants").select("*", { count: "exact", head: true }).limit(1)
  const { count: competitionCount } = await supabase.from("competitions").select("*", { count: "exact", head: true }).limit(1)

  return (
    <div>
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About FestPro</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">Empowering festivals with enterprise-grade management technology.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="p-6 rounded-xl bg-indigo-50 border border-indigo-100">
              <Target className="h-8 w-8 text-indigo-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Mission</h3>
              <p className="text-sm text-gray-600">To provide a comprehensive, real-time festival management platform that simplifies organization and enhances participant experience.</p>
            </div>
            <div className="p-6 rounded-xl bg-purple-50 border border-purple-100">
              <Eye className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Our Vision</h3>
              <p className="text-sm text-gray-600">To be the world&apos;s leading festival operating system, connecting organizers, participants, and audiences seamlessly.</p>
            </div>
            <div className="p-6 rounded-xl bg-amber-50 border border-amber-100">
              <History className="h-8 w-8 text-amber-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Our History</h3>
              <p className="text-sm text-gray-600">Built by festival organizers for festival organizers. 25+ years of experience distilled into one powerful platform.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Festival at a Glance</h2>
              <div className="space-y-4">
                {festival && (
                  <>
                    <p className="text-gray-600">{festival.description}</p>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-4 rounded-lg bg-gray-50">
                        <Users className="h-6 w-6 text-indigo-600 mb-2" />
                        <p className="text-2xl font-bold">{participantCount || 0}+</p>
                        <p className="text-sm text-gray-500">Participants</p>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-50">
                        <Award className="h-6 w-6 text-indigo-600 mb-2" />
                        <p className="text-2xl font-bold">{competitionCount || 0}+</p>
                        <p className="text-sm text-gray-500">Competitions</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl h-80 flex items-center justify-center text-gray-400">
              <MapPin className="h-12 w-12" />
              <span className="ml-2 text-lg">{festival?.venue || "Venue information"}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
