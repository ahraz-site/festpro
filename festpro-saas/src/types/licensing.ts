export type LicenseStatus = "active" | "on_hold" | "blocked" | "expired"

export interface SaasLicense {
  id: string
  license_key: string
  client_name: string
  client_phone?: string | null
  client_email?: string | null
  status: LicenseStatus
  hold_reason?: string | null
  total_amount: number
  paid_amount: number
  pending_amount: number
  max_festivals: number
  is_activated: boolean
  activated_at?: string | null
  organization_id?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface GenerateLicenseInput {
  client_name: string
  client_phone?: string
  client_email?: string
  total_amount?: number
  paid_amount?: number
  max_festivals?: number
  notes?: string
}
