import type { UserRole } from "@/types"

export const ROLES: UserRole[] = [
  "platform_owner",
  "platform_admin",
  "organization_owner",
  "organization_admin",
  "festival_director",
  "division_coordinator",
  "sector_coordinator",
  "unit_coordinator",
  "judge",
  "volunteer",
  "media",
  "reception",
  "finance",
  "participant",
  "public_user",
]

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  platform_owner: 100,
  platform_admin: 90,
  organization_owner: 80,
  organization_admin: 70,
  festival_director: 60,
  division_coordinator: 55,
  sector_coordinator: 50,
  unit_coordinator: 45,
  judge: 40,
  finance: 35,
  media: 30,
  reception: 25,
  volunteer: 20,
  participant: 10,
  public_user: 0,
}

export const ROLE_LABELS: Record<UserRole, string> = {
  platform_owner: "Platform Owner",
  platform_admin: "Platform Admin",
  organization_owner: "Organization Owner",
  organization_admin: "Organization Admin",
  festival_director: "Festival Director",
  division_coordinator: "Division Coordinator",
  sector_coordinator: "Sector Coordinator",
  unit_coordinator: "Unit Coordinator",
  judge: "Judge",
  volunteer: "Volunteer",
  media: "Media Team",
  reception: "Reception",
  finance: "Finance Manager",
  participant: "Participant",
  public_user: "Public User",
}

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  platform_owner: "/dashboard/admin",
  platform_admin: "/dashboard/admin",
  organization_owner: "/dashboard/organization",
  organization_admin: "/dashboard/organization",
  festival_director: "/dashboard/festival",
  division_coordinator: "/dashboard/festival",
  sector_coordinator: "/dashboard/festival",
  unit_coordinator: "/dashboard/participants",
  judge: "/dashboard/judge",
  volunteer: "/dashboard/volunteer",
  media: "/dashboard/media",
  reception: "/dashboard/reception",
  finance: "/dashboard/finance",
  participant: "/dashboard/participant",
  public_user: "/",
}

export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  "/dashboard/admin": ["platform_owner", "platform_admin"],
  "/dashboard/organization": ["organization_owner", "organization_admin"],
  "/dashboard/festival": ["organization_owner", "organization_admin", "festival_director", "division_coordinator", "sector_coordinator"],
  "/dashboard/judge": ["judge"],
  "/dashboard/volunteer": ["volunteer"],
  "/dashboard/media": ["media"],
  "/dashboard/reception": ["reception"],
  "/dashboard/finance": ["finance"],
  "/dashboard/participant": ["participant", "unit_coordinator"],
  "/profile": [...ROLES.filter((r) => r !== "public_user")],
}

// Festival detail routes are nested under /dashboard/organization/[orgId]/festivals/...
// which is already covered by the /dashboard/organization route permissions.

export function getDashboardForRole(role: UserRole): string {
  return ROLE_DASHBOARDS[role] || "/dashboard/participant"
}

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  const matchedPrefix = Object.keys(ROUTE_PERMISSIONS).find((prefix) =>
    pathname === prefix || pathname.startsWith(prefix + "/")
  )
  if (!matchedPrefix) return true
  return ROUTE_PERMISSIONS[matchedPrefix].includes(role)
}
