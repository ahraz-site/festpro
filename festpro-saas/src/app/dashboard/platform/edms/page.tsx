import Link from "next/link"
import { getEdmsDashboard } from "@/lib/actions/edms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Folder, CheckCircle, Clock, FileSignature, Archive, BookOpen, Shield, Share2, HardDrive } from "lucide-react"

export default async function EdmsDashboardPage() {
  const result = await getEdmsDashboard()
  if ("error" in result) return <div className="text-red-500">{result.error}</div>
  const d = result.data

  const cards = [
    { label: "Documents", value: d.total_documents, sub: `${d.published_documents} published`, icon: FileText, color: "text-blue-600" },
    { label: "Folders", value: d.total_folders, icon: Folder, color: "text-indigo-600" },
    { label: "Drafts", value: d.draft_documents, icon: Clock, color: "text-amber-600" },
    { label: "Pending Approvals", value: d.total_approvals_pending, icon: FileSignature, color: d.total_approvals_pending > 0 ? "text-orange-600" : "text-green-600" },
    { label: "Templates", value: d.total_templates, icon: CheckCircle, color: "text-purple-600" },
    { label: "Active Shares", value: d.total_shares_active, icon: Share2, color: "text-cyan-600" },
    { label: "Knowledge Articles", value: d.total_knowledge_articles, sub: `${d.published_articles} published`, icon: BookOpen, color: "text-green-600" },
    { label: "Archive Jobs", value: d.total_archive_jobs, icon: Archive, color: "text-gray-600" },
    { label: "Retention Rules", value: d.total_retention_rules, icon: Shield, color: "text-rose-600" },
    { label: "Storage", value: `${(d.total_storage_bytes / 1048576).toFixed(1)} MB`, icon: HardDrive, color: "text-sky-600" },
  ]

  const sections = [
    { href: "/dashboard/platform/edms/explorer", label: "Document Explorer", desc: "Browse, search & manage documents", icon: FileText },
    { href: "/dashboard/platform/edms/categories", label: "Categories & Tags", desc: "Organize documents", icon: Folder },
    { href: "/dashboard/platform/edms/approvals", label: "Approvals", desc: "Approval workflows & pending requests", icon: FileSignature },
    { href: "/dashboard/platform/edms/templates", label: "Templates", desc: "Document templates & variables", icon: CheckCircle },
    { href: "/dashboard/platform/edms/knowledge", label: "Knowledge Center", desc: "Articles, FAQs, policies & guides", icon: BookOpen },
    { href: "/dashboard/platform/edms/shares", label: "Sharing", desc: "Shared documents & links", icon: Share2 },
    { href: "/dashboard/platform/edms/retention", label: "Retention", desc: "Retention rules & policies", icon: Shield },
    { href: "/dashboard/platform/edms/archive", label: "Archive", desc: "Archive jobs & history", icon: Archive },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
        <p className="text-sm text-gray-500">Enterprise Document Management System — EDMS</p>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
