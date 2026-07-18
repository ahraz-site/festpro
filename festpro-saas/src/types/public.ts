export type SponsorTier = "platinum" | "gold" | "silver" | "bronze" | "partner" | "media"
export type NewsCategory = "news" | "blog" | "press_release" | "update" | "announcement"
export type GalleryType = "photo" | "video" | "album"
export type RegistrationStatus = "draft" | "submitted" | "confirmed" | "waiting" | "cancelled"
export type RegistrationType = "individual" | "team"
export type CacheStatus = "fresh" | "stale" | "generating"

export interface PublicHomepageSettings {
  id: string; festival_id: string; hero_title: string | null; hero_subtitle: string | null
  hero_image_url: string | null; about_title: string | null; about_body: string | null
  about_image_url: string | null; stats: any; featured_sections: any; seo_meta: any
  is_published: boolean; updated_by: string | null; created_at: string; updated_at: string
}

export interface PublicFestivalDetails {
  id: string; festival_id: string; vision: string | null; mission: string | null; history: string | null
  organizing_committee: any; venue_name: string | null; venue_address: string | null
  venue_map_url: string | null; venue_contact: string | null; faqs: any; seo_meta: any
  is_published: boolean; updated_by: string | null; created_at: string; updated_at: string
}

export interface PublicNews {
  id: string; festival_id: string; category: NewsCategory; title: string; slug: string
  excerpt: string | null; body: string | null; cover_image_url: string | null; author: string | null
  is_published: boolean; is_featured: boolean; published_at: string | null; seo_meta: any
  created_by: string | null; created_at: string; updated_at: string
}

export interface PublicGallery {
  id: string; festival_id: string; gallery_type: GalleryType; album_id: string | null
  title: string; description: string | null; media_url: string; thumbnail_url: string | null
  width: number | null; height: number | null; file_size: number | null; mime_type: string | null
  is_published: boolean; is_featured: boolean; sort_order: number
  created_by: string | null; created_at: string; updated_at: string
}

export interface PublicDownload {
  id: string; festival_id: string; category: string; title: string; description: string | null
  file_url: string; file_size: number | null; mime_type: string | null
  is_published: boolean; download_count: number; sort_order: number
  created_by: string | null; created_at: string; updated_at: string
}

export interface PublicSponsor {
  id: string; festival_id: string; sponsor_name: string; sponsor_logo_url: string | null
  website_url: string | null; tier: SponsorTier; description: string | null
  is_published: boolean; sort_order: number; created_at: string; updated_at: string
}

export interface PublicFaq {
  id: string; festival_id: string; category: string; question: string; answer: string
  sort_order: number; is_published: boolean; created_at: string; updated_at: string
}

export interface PublicContactInquiry {
  id: string; festival_id: string | null; name: string; email: string; phone: string | null
  subject: string | null; message: string; is_read: boolean; replied_at: string | null; created_at: string
}

export interface PublicRegistration {
  id: string; festival_id: string; registration_type: RegistrationType; status: RegistrationStatus
  registration_number: string | null; tracking_token: string | null
  first_name: string; last_name: string; email: string; phone: string | null
  date_of_birth: string | null; gender: string | null; address: string | null
  city: string | null; state: string | null; country: string | null; postal_code: string | null
  institution_name: string | null; grade: string | null; team_name: string | null
  team_members: any; competition_ids: string[]; special_requirements: string | null
  documents: any; payment_status: string; payment_amount: number | null
  payment_reference: string | null; registered_at: string | null; confirmed_at: string | null
  notes: string | null; created_at: string; updated_at: string
}

export interface LiveScheduleCache {
  id: string; festival_id: string; stage_id: string | null; competition_id: string | null
  session_id: string | null; cache_key: string; cache_data: any; status: CacheStatus
  generated_at: string; expires_at: string | null
}

export interface LiveResultsCache {
  id: string; festival_id: string; competition_id: string | null; cache_key: string
  cache_data: any; status: CacheStatus; generated_at: string; expires_at: string | null
}

export interface LiveStageStatus {
  id: string; festival_id: string; stage_id: string; is_live: boolean
  current_competition_id: string | null; current_session_id: string | null
  current_participant_id: string | null; queue_count: number
  stream_url: string | null; stream_platform: string | null
  started_at: string | null; updated_at: string
}

export interface PublicApiToken {
  id: string; festival_id: string; token_name: string; token_hash: string
  token_prefix: string | null; allowed_origins: string[]; rate_limit: number
  is_active: boolean; expires_at: string | null; last_used_at: string | null; created_at: string
}

export interface Module12DashboardData {
  published_news: number; gallery_items: number; downloads: number; sponsors: number
  faqs: number; contact_inquiries: number; public_registrations: number
  live_stages: number; api_tokens: number
}
