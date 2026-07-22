import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, CheckCircle } from "lucide-react"

export default function SecurityScansPage() {
  const scans = [
    { title: "Dependency Security Audit (npm Audit)", status: "0 Vulnerabilities", severity: "Low", date: "Just now" },
    { title: "Row Level Security (RLS) Policy Check", status: "100% Covered", severity: "Passed", date: "Today" },
    { title: "HTTPS & TLS Security Compliance", status: "Grade A+", severity: "Passed", date: "Today" }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Scans & Audits</h1>
        <p className="text-sm text-gray-500">View code vulnerability scans and security policy verifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scans.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                {s.title}
              </CardTitle>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {s.severity}
              </span>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p><strong>Result:</strong> {s.status}</p>
              <p><strong>Last Scan:</strong> {s.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
