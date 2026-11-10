export type CompetitionUnitType = "groups" | "teams" | "houses" | "units" | "individual"

export type ClassificationType = "zones" | "categories" | "both" | "none"

export interface CompetitionUnitConfig {
  type: CompetitionUnitType
  singular: string
  plural: string
  description: string
}

export const COMPETITION_UNITS: Record<CompetitionUnitType, CompetitionUnitConfig> = {
  groups: {
    type: "groups",
    singular: "Group",
    plural: "Groups",
    description: "Best for Sahityotsav, Sector Fests, and Cultural Meets (e.g., Sub-groups).",
  },
  teams: {
    type: "teams",
    singular: "Team",
    plural: "Teams",
    description: "Best for College Competitions, Sports Fests, and External Delegations.",
  },
  houses: {
    type: "houses",
    singular: "House",
    plural: "Houses",
    description: "Best for School Kalolsavam (e.g., Ruby, Emerald, Sapphire, Topaz).",
  },
  units: {
    type: "units",
    singular: "Unit",
    plural: "Units",
    description: "Best for Madrasa, Area, or Institutional Chapter Competitions.",
  },
  individual: {
    type: "individual",
    singular: "Participant",
    plural: "Individual Only",
    description: "No team grouping; all participants compete individually directly.",
  },
}

export interface ClassificationConfig {
  type: ClassificationType
  label: string
  description: string
  defaultValues: string[]
}

export const CLASSIFICATION_OPTIONS: Record<ClassificationType, ClassificationConfig> = {
  zones: {
    type: "zones",
    label: "Zones Only",
    description: "Competitions grouped by geographical or division zones.",
    defaultValues: ["A Zone", "B Zone", "C Zone", "Mix Zone"],
  },
  categories: {
    type: "categories",
    label: "Categories Only",
    description: "Competitions grouped by age, class, or domain.",
    defaultValues: ["Kiddies", "Junior", "Senior", "General"],
  },
  both: {
    type: "both",
    label: "Both Zones & Categories",
    description: "Cross-classification matrix (e.g., Junior in Zone A).",
    defaultValues: ["Junior", "Senior", "A Zone", "B Zone"],
  },
  none: {
    type: "none",
    label: "No Classification",
    description: "Simple single-tier event with no sub-divisions.",
    defaultValues: [],
  },
}

export interface FestivalModuleDefinition {
  id: string
  name: string
  description: string
  isCore: boolean
  defaultEnabled: boolean
  category: "core" | "operations" | "media" | "support"
  href: string
}

export const FESTIVAL_MODULES: FestivalModuleDefinition[] = [
  // Core Modules (Always active)
  { id: "dashboard", name: "Dashboard", description: "Real-time festival metrics and operational summary", isCore: true, defaultEnabled: true, category: "core", href: "" },
  { id: "groups", name: "Groups / Teams", description: "Manage competing units, team leaders, and points", isCore: true, defaultEnabled: true, category: "core", href: "/teams" },
  { id: "participants", name: "Participants", description: "Participant directory, ID profiles, and enrollments", isCore: true, defaultEnabled: true, category: "core", href: "/participants" },
  { id: "programmes", name: "Programmes / Competitions", description: "Item catalog, eligibility rules, and criteria", isCore: true, defaultEnabled: true, category: "core", href: "/competitions" },
  { id: "registrations", name: "Registrations", description: "Enroll participants into individual and group items", isCore: true, defaultEnabled: true, category: "core", href: "/competitions/registrations" },
  { id: "schedule", name: "Schedule & Timetable", description: "Time slots, venues, and conflict-free timeline", isCore: true, defaultEnabled: true, category: "core", href: "/schedules" },
  { id: "stages", name: "Stages & Venues", description: "Event halls, auditoriums, and stage management", isCore: true, defaultEnabled: true, category: "core", href: "/stages" },
  { id: "judges", name: "Judges & Scoring", description: "Judge appointments, credentials, and criteria", isCore: true, defaultEnabled: true, category: "core", href: "/judging" },
  { id: "mark_entry", name: "Mark Entry", description: "Secure score tabulation and verification", isCore: true, defaultEnabled: true, category: "core", href: "/results/publish" },
  { id: "results", name: "Results & Rankings", description: "Position announcements, grades, and winners list", isCore: true, defaultEnabled: true, category: "core", href: "/results" },
  { id: "points", name: "Points & Leaderboard", description: "Real-time team standings and championship race", isCore: true, defaultEnabled: true, category: "core", href: "/results/team-points" },

  // Optional Operational Modules (Toggleable)
  { id: "live_stage", name: "Live Stage Monitoring", description: "Live display boards and real-time stage status updates", isCore: false, defaultEnabled: true, category: "operations", href: "/live" },
  { id: "green_room", name: "Green Room & Call Desk", description: "Participant call sheets, attendance desk, and call history", isCore: false, defaultEnabled: true, category: "operations", href: "/call-history" },
  { id: "attendance", name: "Attendance Tracking", description: "Entry gates, participant check-in, and duty logs", isCore: false, defaultEnabled: false, category: "operations", href: "/volunteer/attendance" },
  { id: "qr_code", name: "QR Badges & ID Cards", description: "Printable chest number badges and verification codes", isCore: false, defaultEnabled: true, category: "operations", href: "/id-cards" },
  { id: "appeals", name: "Appeals & Complaints", description: "Formal dispute management and score review board", isCore: false, defaultEnabled: false, category: "support", href: "/results/appeals" },
  { id: "certificates", name: "Certificate Studio", description: "Auto-generated participant and winner merit certificates", isCore: false, defaultEnabled: true, category: "media", href: "/results/certificates" },
  { id: "reports", name: "Exports & Print Sheets", description: "Judge sheets, score summary PDFs, and Excel exports", isCore: false, defaultEnabled: true, category: "media", href: "/documents" },
  { id: "finance", name: "Finance & Accounts", description: "Budgeting, voucher tracking, and revenue logs", isCore: false, defaultEnabled: false, category: "support", href: "/finance" },
  { id: "fund_collection", name: "Fund Collection", description: "Donations, sponsorship deals, and receipt issuance", isCore: false, defaultEnabled: false, category: "support", href: "/finance/donations" },
  { id: "food", name: "Food & Refreshments", description: "Meal passes, volunteer catering, and mess counters", isCore: false, defaultEnabled: false, category: "operations", href: "/food" },
  { id: "accommodation", name: "Accommodation", description: "Guest rooms, team dormitories, and lodging registry", isCore: false, defaultEnabled: false, category: "operations", href: "/accommodation" },
  { id: "transport", name: "Transport & Logistics", description: "Vehicle scheduling, station pickups, and shuttle routes", isCore: false, defaultEnabled: false, category: "operations", href: "/transport" },
  { id: "gallery", name: "Gallery & Posters", description: "Event photo stream and social media announcements", isCore: false, defaultEnabled: false, category: "media", href: "/gallery" },
  { id: "news", name: "News & Bulletins", description: "Official media releases and press bulletins", isCore: false, defaultEnabled: false, category: "media", href: "/announcements" },
  { id: "notifications", name: "SMS / Email Alerts", description: "Broadcast updates and result announcements via SMS/Email", isCore: false, defaultEnabled: false, category: "support", href: "/communication" },
]

export interface FestivalRulesConfig {
  max_individual_programmes: number
  max_group_participants: number
  allow_mix_zone: boolean
  block_duplicate_registration: boolean
  require_chest_numbers: boolean
  enable_grades: boolean
  points_system: "position_and_grade" | "position_only" | "grade_only"
}

export const DEFAULT_FESTIVAL_RULES: FestivalRulesConfig = {
  max_individual_programmes: 5,
  max_group_participants: 12,
  allow_mix_zone: true,
  block_duplicate_registration: true,
  require_chest_numbers: true,
  enable_grades: true,
  points_system: "position_and_grade",
}

export interface FestivalCompleteConfig {
  terminology: {
    unit: CompetitionUnitType
    classification: ClassificationType
    classificationValues: string[]
  }
  modules: Record<string, boolean>
  rules: FestivalRulesConfig
}

export const DEFAULT_FESTIVAL_CONFIG: FestivalCompleteConfig = {
  terminology: {
    unit: "groups",
    classification: "zones",
    classificationValues: ["A Zone", "B Zone", "C Zone", "Mix Zone"],
  },
  modules: {
    live_stage: true,
    green_room: true,
    attendance: false,
    qr_code: true,
    appeals: false,
    certificates: true,
    reports: true,
    finance: false,
    fund_collection: false,
    food: false,
    accommodation: false,
    transport: false,
    gallery: false,
    news: false,
    notifications: false,
  },
  rules: DEFAULT_FESTIVAL_RULES,
}
