import Link from "next/link"
import { getAiDashboard } from "@/lib/actions/ai"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, MessageSquare, Brain, Database, BarChart3, Layers, TrendingUp, DollarSign, Activity, AlertTriangle } from "lucide-react"

export default async function AiPlatformPage() {
  const result = await getAiDashboard()
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const d = result.data

  const cards = [
    { label: "Conversations", value: d.total_conversations, sub: `${d.active_conversations} active`, icon: MessageSquare, color: "text-blue-600" },
    { label: "Messages", value: d.total_messages.toLocaleString(), icon: Activity, color: "text-indigo-600" },
    { label: "Total Cost", value: `$${d.total_cost.toFixed(2)}`, icon: DollarSign, color: "text-green-600" },
    { label: "Avg Latency", value: `${d.avg_latency_ms}ms`, icon: TrendingUp, color: "text-amber-600" },
    { label: "Providers", value: d.total_providers, icon: Bot, color: "text-purple-600" },
    { label: "Active Agents", value: d.active_agents, icon: Brain, color: "text-cyan-600" },
    { label: "Knowledge Docs", value: d.total_knowledge_docs, sub: `${d.indexed_docs} indexed`, icon: Database, color: "text-green-600" },
    { label: "Predictions", value: d.total_predictions, icon: TrendingUp, color: "text-orange-600" },
    { label: "AI Jobs", value: d.total_jobs, sub: `${d.failed_jobs} failed`, icon: Layers, color: d.failed_jobs > 0 ? "text-red-600" : "text-gray-600" },
    { label: "Recommendations", value: d.total_recommendations, icon: BarChart3, color: "text-rose-600" },
  ]

  const sections = [
    { href: "/dashboard/platform/ai/copilot", label: "AI Copilot", desc: "Chat with AI assistants", icon: Bot },
    { href: "/dashboard/platform/ai/conversations", label: "Conversations", desc: "View chat history", icon: MessageSquare },
    { href: "/dashboard/platform/ai/knowledge", label: "Knowledge Base", desc: "Documents & search", icon: Database },
    { href: "/dashboard/platform/ai/prompts", label: "Prompt Library", desc: "Manage AI prompts", icon: Layers },
    { href: "/dashboard/platform/ai/providers", label: "AI Providers", desc: "Configure models & providers", icon: Brain },
    { href: "/dashboard/platform/ai/agents", label: "AI Agents", desc: "Configure copilot agents", icon: Bot },
    { href: "/dashboard/platform/ai/predictions", label: "Predictions", desc: "AI forecasts & insights", icon: TrendingUp },
    { href: "/dashboard/platform/ai/jobs", label: "AI Jobs", desc: "Automation job history", icon: Layers },
    { href: "/dashboard/platform/ai/cost", label: "Cost & Usage", desc: "Track token usage & costs", icon: DollarSign },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Platform</h1>
        <p className="text-sm text-gray-500">Enterprise AI Copilot, Knowledge Base, Predictions & Automation</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{c.label}</CardTitle>
                <Icon className={`h-4 w-4 ${c.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{c.value}</div>
                {c.sub && <p className="text-xs text-gray-500">{c.sub}</p>}
              </CardContent>
            </Card>
          )
        })}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.href} href={s.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <div>
                    <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
