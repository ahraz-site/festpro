import type { FestivalStatus, FestivalVisibility, SponsorCategory, SponsorStatus, AnnouncementStatus, CommitteeRole } from "@/types/festival"

export const FESTIVAL_STATUSES: { value: FestivalStatus; label: string; color: string }[] = [
  { value: "draft", label: "Draft", color: "text-gray-600 bg-gray-100" },
  { value: "upcoming", label: "Upcoming", color: "text-blue-600 bg-blue-100" },
  { value: "registration_open", label: "Registration Open", color: "text-green-600 bg-green-100" },
  { value: "registration_closed", label: "Registration Closed", color: "text-amber-600 bg-amber-100" },
  { value: "live", label: "Live", color: "text-purple-600 bg-purple-100" },
  { value: "completed", label: "Completed", color: "text-indigo-600 bg-indigo-100" },
  { value: "archived", label: "Archived", color: "text-gray-500 bg-gray-100" },
]

export const FESTIVAL_STATUS_MAP: Record<FestivalStatus, string> = {
  draft: "Draft",
  upcoming: "Upcoming",
  registration_open: "Registration Open",
  registration_closed: "Registration Closed",
  live: "Live",
  completed: "Completed",
  archived: "Archived",
}

export const VISIBILITY_OPTIONS: { value: FestivalVisibility; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "invite_only", label: "Invite Only" },
]

export const SPONSOR_CATEGORIES: { value: SponsorCategory; label: string }[] = [
  { value: "platinum", label: "Platinum" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "bronze", label: "Bronze" },
  { value: "partner", label: "Partner" },
  { value: "media", label: "Media" },
]

export const SPONSOR_STATUSES: { value: SponsorStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "text-amber-600 bg-amber-100" },
  { value: "confirmed", label: "Confirmed", color: "text-green-600 bg-green-100" },
  { value: "expired", label: "Expired", color: "text-red-600 bg-red-100" },
]

export const ANNOUNCEMENT_STATUSES: { value: AnnouncementStatus; label: string; color: string }[] = [
  { value: "draft", label: "Draft", color: "text-gray-600 bg-gray-100" },
  { value: "scheduled", label: "Scheduled", color: "text-blue-600 bg-blue-100" },
  { value: "published", label: "Published", color: "text-green-600 bg-green-100" },
  { value: "archived", label: "Archived", color: "text-gray-500 bg-gray-100" },
]

export const COMMITTEE_ROLES: { value: CommitteeRole; label: string }[] = [
  { value: "chairman", label: "Chairman" },
  { value: "coordinator", label: "Coordinator" },
  { value: "member", label: "Member" },
  { value: "advisor", label: "Advisor" },
  { value: "secretary", label: "Secretary" },
]

export const STORAGE_BUCKETS = {
  FESTIVAL_LOGOS: "festival-logos",
  FESTIVAL_BANNERS: "festival-banners",
  FESTIVAL_GALLERY: "festival-gallery",
  FESTIVAL_DOCUMENTS: "festival-documents",
  SPONSOR_LOGOS: "sponsor-logos",
} as const

export const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
]
