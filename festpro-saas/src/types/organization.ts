import type { UserRole } from "./index"

export type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled"
export type SubscriptionPlan = "free" | "starter" | "professional" | "enterprise"
export type ActivityAction =
  | "organization.created"
  | "organization.updated"
  | "organization.deleted"
  | "member.invited"
  | "member.joined"
  | "member.removed"
  | "member.suspended"
  | "member.reactivated"
  | "member.role_changed"
  | "member.left"
  | "profile.updated"
  | "settings.updated"
  | "login"
  | "logout"

export interface ExtendedOrganization {
  id: string
  name: string
  slug: string
  code: string | null
  logo_url: string | null
  address: string | null
  country: string | null
  state: string | null
  district: string | null
  website: string | null
  org_email: string | null
  org_phone: string | null
  timezone: string
  language: string
  brand_color: string
  theme: Record<string, any>
  subscription_plan: SubscriptionPlan
  max_users: number
  max_festivals: number
  is_active: boolean
  deleted_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  member_count?: number
  active_member_count?: number
}

export interface OrganizationSettings {
  id: string
  organization_id: string
  allow_public_registration: boolean
  require_email_verification: boolean
  default_user_role: UserRole
  logo_url: string | null
  favicon_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
  custom_css: string | null
  custom_domain: string | null
  domain_verified: boolean
  email_settings: Record<string, any>
  notification_settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: UserRole
  invited_by: string | null
  joined_at: string
  is_suspended: boolean
  profile?: {
    email: string
    first_name: string
    last_name: string
    avatar_url: string | null
    phone: string | null
  }
}

export interface Invitation {
  id: string
  organization_id: string
  email: string
  role: UserRole
  token: string
  expires_at: string
  status: InvitationStatus
  invited_by: string | null
  accepted_at: string | null
  accepted_by: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  organization_id: string | null
  user_id: string | null
  action: ActivityAction
  resource_type: string | null
  resource_id: string | null
  metadata: Record<string, any>
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user?: {
    first_name: string
    last_name: string
    email: string
  }
}

export interface Permission {
  id: string
  code: string
  name: string
  description: string | null
  module: string
}

export interface RolePermission {
  id: string
  role: UserRole
  permission_code: string
}

export interface OrganizationDashboardData {
  organization: ExtendedOrganization
  settings: OrganizationSettings
  members: OrganizationMember[]
  recentActivity: ActivityLog[]
  memberCount: number
  activeMemberCount: number
}
