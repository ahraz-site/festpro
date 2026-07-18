import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    name: "FestPro Public API",
    version: "1.0.0",
    base_url: "/api/v1",
    docs: "/api/v1/docs",
    endpoints: {
      auth: "/api/v1/auth",
      organizations: "/api/v1/organizations",
      festivals: "/api/v1/festivals",
      participants: "/api/v1/participants",
      competitions: "/api/v1/competitions",
      schedules: "/api/v1/schedules",
      judges: "/api/v1/judges",
      results: "/api/v1/results",
      certificates: "/api/v1/certificates",
      announcements: "/api/v1/announcements",
      gallery: "/api/v1/gallery",
      reports: "/api/v1/reports",
      inventory: "/api/v1/inventory",
      finance: "/api/v1/finance",
      crm: "/api/v1/crm",
      integrations: "/api/v1/integrations",
    },
  })
}
