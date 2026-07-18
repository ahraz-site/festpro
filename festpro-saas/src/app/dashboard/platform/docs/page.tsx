"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, FileText, Shield, Server, Book, Archive, Users, Settings, LifeBuoy, GitBranch, RefreshCw, Calendar } from "lucide-react"
import Link from "next/link"

const docs = [
  { title: "System Architecture Guide", icon: Server, description: "Complete architecture overview, component diagrams, data flow", href: "#" },
  { title: "Developer Guide", icon: GitBranch, description: "Setup, coding standards, API reference, contribution workflow", href: "#" },
  { title: "Administrator Guide", icon: Settings, description: "Platform administration, user management, configuration", href: "#" },
  { title: "Deployment Manual", icon: RefreshCw, description: "Production deployment, environment setup, CI/CD pipeline", href: "#" },
  { title: "Operations Manual", icon: Book, description: "Runbook, incident response, monitoring, escalation procedures", href: "#" },
  { title: "Security Guide", icon: Shield, description: "Security policies, OWASP controls, encryption, authentication", href: "#" },
  { title: "API Documentation", icon: FileText, description: "REST API reference, webhooks, SDKs, rate limits", href: "#" },
  { title: "Disaster Recovery Guide", icon: Archive, description: "Backup procedures, restore validation, RTO/RPO targets", href: "#" },
  { title: "Backup Guide", icon: LifeBuoy, description: "Backup strategies, schedules, retention policies", href: "#" },
  { title: "Troubleshooting Guide", icon: Users, description: "Common issues, diagnostic steps, support contacts", href: "#" },
  { title: "LTS Guide", icon: Calendar, description: "LTS versioning, upgrade paths, migration guides, support matrix", href: "#" },
  { title: "Compliance Guide", icon: BookOpen, description: "SOC 2, ISO 27001, GDPR controls and evidence", href: "#" },
]

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documentation Portal</h1>
        <p className="text-sm text-gray-500 mt-1">Enterprise documentation, guides, and runbooks</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {docs.map((doc) => (
          <Link key={doc.title} href={doc.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="p-2 rounded-lg bg-indigo-50 w-fit mb-3"><doc.icon className="h-5 w-5 text-indigo-600" /></div>
                <h3 className="font-semibold text-sm text-gray-900">{doc.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
