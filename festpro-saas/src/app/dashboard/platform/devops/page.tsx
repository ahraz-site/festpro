import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, GitBranch, Rocket, Activity, Package, Server, Container, Flag, Shield, Lock, Settings, CheckCircle, AlertTriangle } from "lucide-react"

export default function DevOpsPlatformPage() {
  const cards = [
    { label: "Environments", href: "/dashboard/platform/devops/environments", icon: Globe, status: "Healthy (Production, Staging, QA)", count: "3 Active" },
    { label: "Pipelines", href: "/dashboard/platform/devops/pipelines", icon: GitBranch, status: "CI/CD Automations", count: "12 Executed" },
    { label: "Deployments", href: "/dashboard/platform/devops/deployments", icon: Rocket, status: "Vercel / Cloud Deployments", count: "99.99% Uptime" },
    { label: "Builds", href: "/dashboard/platform/devops/builds", icon: Activity, status: "Next.js & Supabase Builds", count: "Passed" },
    { label: "Releases", href: "/dashboard/platform/devops/releases", icon: Package, status: "Release Tag v1.2.0", count: "Latest" },
    { label: "Clusters & Servers", href: "/dashboard/platform/devops/clusters", icon: Server, status: "Kubernetes & Edge Nodes", count: "Active" },
    { label: "Containers", href: "/dashboard/platform/devops/containers", icon: Container, status: "Docker Containers", count: "Running" },
    { label: "Feature Rollouts", href: "/dashboard/platform/devops/feature-rollouts", icon: Flag, status: "Feature Flags", count: "Enabled" },
    { label: "Security Scans", href: "/dashboard/platform/devops/security-scans", icon: Shield, status: "Vulnerability Scan", count: "0 Threats" },
    { label: "Secrets & Keys", href: "/dashboard/platform/devops/secrets", icon: Lock, status: "KMS & Vault Secrets", count: "Secured" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DevOps & Cloud Control Center</h1>
          <p className="text-sm text-gray-500">Monitor environment health, deployment pipelines, builds, and infrastructure status.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">Trigger Production Deployment</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Card key={c.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <c.icon className="h-5 w-5 text-indigo-600" />
                {c.label}
              </CardTitle>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {c.count}
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-4">{c.status}</p>
              <Link href={c.href}>
                <Button variant="outline" size="sm" className="w-full">Open Control</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
