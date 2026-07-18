export type UserRole =
  | "platform_owner"
  | "platform_admin"
  | "organization_owner"
  | "organization_admin"
  | "festival_director"
  | "division_coordinator"
  | "sector_coordinator"
  | "unit_coordinator"
  | "judge"
  | "volunteer"
  | "media"
  | "reception"
  | "finance"
  | "participant"
  | "public_user"

export interface Profile {
  id: string
  user_id: string
  email: string
  first_name: string
  last_name: string
  avatar_url: string | null
  phone: string | null
  role: UserRole
  organization_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Organization {
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
  subscription_plan: string
  max_users: number
  max_festivals: number
  is_active: boolean
  deleted_at: string | null
  created_by: string | null
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

export type AuthPage = "login" | "register" | "forgot-password" | "verify"
