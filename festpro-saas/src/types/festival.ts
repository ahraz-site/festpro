export type FestivalStatus = "draft" | "upcoming" | "registration_open" | "registration_closed" | "live" | "completed" | "archived"
export type FestivalVisibility = "public" | "private" | "invite_only"
export type AnnouncementStatus = "draft" | "scheduled" | "published" | "archived"
export type SponsorCategory = "platinum" | "gold" | "silver" | "bronze" | "partner" | "media"
export type SponsorStatus = "pending" | "confirmed" | "expired"
export type CommitteeRole = "chairman" | "coordinator" | "member" | "advisor" | "secretary"
export type GalleryType = "image" | "video"

export interface Festival {
  id: string
  organization_id: string
  name: string
  short_name: string | null
  code: string | null
  description: string | null
  logo_url: string | null
  banner_url: string | null
  theme: string | null
  start_date: string | null
  end_date: string | null
  registration_start_date: string | null
  registration_end_date: string | null
  result_publish_date: string | null
  venue_name: string | null
  address: string | null
  district: string | null
  state: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  timezone: string
  status: FestivalStatus
  visibility: FestivalVisibility
  max_participants: number | null
  max_competitions: number | null
  is_featured: boolean
  is_template: boolean
  template_id: string | null
  created_by: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface FestivalSettings {
  id: string
  festival_id: string
  festival_color: string
  theme_color: string
  dark_mode: boolean
  language: string
  certificate_template: string | null
  result_template: string | null
  chest_number_format: string
  registration_prefix: string
  qr_settings: Record<string, any>
  attendance_settings: Record<string, any>
  judge_settings: Record<string, any>
  notification_settings: Record<string, any>
  custom_fields: any[]
  created_at: string
  updated_at: string
}

export interface FestivalTheme {
  id: string
  festival_id: string
  name: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  font_family: string
  header_style: string
  footer_style: string
  banner_position: string
  custom_css: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FestivalDay {
  id: string
  festival_id: string
  day_number: number
  label: string | null
  date: string | null
  opening_ceremony_at: string | null
  closing_ceremony_at: string | null
  working_hours_start: string
  working_hours_end: string
  is_holiday: boolean
  description: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface FestivalVenue {
  id: string
  festival_id: string
  name: string
  code: string | null
  description: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  capacity: number
  images: any[]
  facilities: any[]
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface FestivalStage {
  id: string
  festival_id: string
  venue_id: string | null
  name: string
  code: string | null
  description: string | null
  capacity: number
  stage_type: string | null
  equipment: any[]
  current_status: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FestivalCommittee {
  id: string
  festival_id: string
  name: string
  committee_role: CommitteeRole
  description: string | null
  members: any[]
  contact_email: string | null
  contact_phone: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface FestivalContact {
  id: string
  festival_id: string
  name: string
  role: string | null
  email: string | null
  phone: string | null
  is_primary: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface FestivalDocument {
  id: string
  festival_id: string
  title: string
  description: string | null
  file_url: string
  file_type: string | null
  file_size: number | null
  category: string
  is_downloadable: boolean
  display_order: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface FestivalAnnouncement {
  id: string
  festival_id: string
  title: string
  content: string
  status: AnnouncementStatus
  is_pinned: boolean
  priority: string
  scheduled_at: string | null
  published_at: string | null
  archived_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface FestivalSponsor {
  id: string
  festival_id: string
  name: string
  logo_url: string | null
  website: string | null
  description: string | null
  category: SponsorCategory
  amount: number | null
  status: SponsorStatus
  display_order: number
  created_at: string
  updated_at: string
}

export interface FestivalGalleryItem {
  id: string
  festival_id: string
  title: string | null
  description: string | null
  file_url: string
  thumbnail_url: string | null
  gallery_type: GalleryType
  category: string
  is_featured: boolean
  file_size: number | null
  width: number | null
  height: number | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface FestivalBanner {
  id: string
  festival_id: string
  title: string | null
  subtitle: string | null
  image_url: string
  link_url: string | null
  link_text: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FestivalStatistics {
  id: string
  festival_id: string
  total_participants: number
  total_competitions: number
  total_judges: number
  total_units: number
  total_stages: number
  total_venues: number
  total_days: number
  total_announcements: number
  total_sponsors: number
  total_documents: number
  total_gallery_items: number
  total_committees: number
  today_competitions: number
  pending_results: number
  completed_results: number
  last_calculated_at: string
  created_at: string
  updated_at: string
}

export interface FestivalDashboardData {
  festival: Festival
  settings: FestivalSettings
  statistics: FestivalStatistics
  days: FestivalDay[]
  venues: FestivalVenue[]
  stages: FestivalStage[]
  announcements: FestivalAnnouncement[]
  sponsors: FestivalSponsor[]
  recentActivity: any[]
}

export interface FestivalFormData {
  name: string
  short_name: string
  code: string
  description: string
  theme: string
  start_date: string
  end_date: string
  registration_start_date: string
  registration_end_date: string
  result_publish_date: string
  venue_name: string
  address: string
  district: string
  state: string
  country: string
  latitude: string
  longitude: string
  timezone: string
  status: FestivalStatus
  visibility: FestivalVisibility
  max_participants: string
  max_competitions: string
}
