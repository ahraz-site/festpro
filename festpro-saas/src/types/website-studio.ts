export type ThemeMode = "dark" | "light"

export type PalettePresetId =
  | "royal_blue"
  | "royal_purple"
  | "emerald_green"
  | "sunset_orange"
  | "modern_minimal"
  | "vibrant_festival"
  | "custom"

export type ShapePresetId =
  | "edge"
  | "rounded"
  | "glassmorphism"
  | "retro"
  | "brutalist"
  | "minimal"

export type EntranceAnimationType =
  | "none"
  | "fade_in"
  | "fade_up"
  | "fade_down"
  | "zoom_in"
  | "slide_left"
  | "slide_right"
  | "blur_reveal"

export type HoverAnimationType = "none" | "lift" | "glow" | "scale"

export type SectionBackgroundType =
  | "inherit"
  | "solid"
  | "gradient"
  | "image"
  | "gif"
  | "slider"
  | "video"
  | "pattern"
  | "glass"

export type ShapeDividerType = "none" | "wave" | "curve" | "angle" | "triangle"

export type SectionWidgetType =
  | "hero"
  | "countdown"
  | "stats"
  | "results"
  | "schedule"
  | "leaderboard"
  | "gallery"
  | "videos"
  | "news"
  | "team"
  | "contact"
  | "heading_banner"
  | "divider"
  | "custom_html"
  // Between-Section Creative Components
  | "image_banner"
  | "gif_banner"
  | "slider_banner"
  | "video_banner"
  | "announcement_bar"
  | "promo_banner"
  | "marquee"
  | "logo_carousel"
  | "shape_divider"
  | "testimonial_slider"

export type GalleryLayoutType = "grid" | "masonry" | "metro" | "carousel"
export type GalleryAspectRatio = "original" | "1:1" | "4:3" | "16:9" | "3:4" | "9:16"
export type VideoDisplayLayout = "featured_playlist" | "grid" | "reels_vertical" | "carousel"
export type VideoPlatform = "youtube" | "youtube_shorts" | "instagram_reel" | "facebook" | "vimeo" | "mp4"

export interface ColorPalette {
  id: PalettePresetId
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  mutedText: string
  themeMode: ThemeMode
  gradientEnabled: boolean
  gradientAngle: number
}

export interface TypographyConfig {
  headingFont: string
  bodyFont: string
  malayalamFont: string
  arabicFont: string
  customFontUrl?: string
  customFontName?: string
  headingWeight: "500" | "600" | "700" | "800" | "900"
  headingSize: "compact" | "standard" | "large" | "heroic"
  lineHeight: "tight" | "normal" | "relaxed"
  letterSpacing: "tighter" | "normal" | "wide" | "wider"
  textTransform: "none" | "uppercase" | "capitalize"
}

export interface ShapeAndThemeConfig {
  stylePreset: ShapePresetId
  borderRadius: "0px" | "8px" | "16px" | "24px"
  buttonShape: "sharp" | "rounded" | "pill" | "brutal"
  cardShadow: "none" | "soft" | "elevated" | "neon" | "hard_brutal"
  containerWidth: "narrow" | "standard" | "wide" | "full"
  sectionSpacing: "compact" | "comfortable" | "spacious"
  backgroundTexture: "none" | "dots" | "grid" | "noise" | "mesh"
}

export interface MotionConfig {
  reducedMotion: boolean
  defaultEntrance: EntranceAnimationType
  defaultHover: HoverAnimationType
  duration: number
  scrollProgressBar: boolean
  parallaxHero: boolean
}

export interface SectionBackgroundConfig {
  type: SectionBackgroundType
  solidColor?: string
  gradientFrom?: string
  gradientTo?: string
  gradientAngle?: number
  imageUrl?: string // Supports static JPG/PNG/WebP and animated GIF
  videoUrl?: string // MP4 background video loop
  sliderImages?: string[] // Multiple images for background auto-slider
  sliderSpeedMs?: number
  patternType?: "none" | "dots" | "grid" | "diagonal"
  imagePosition?: "center" | "top" | "bottom"
  imageSize?: "cover" | "contain" | "auto"
  imageRepeat?: "no-repeat" | "repeat"
  attachment?: "scroll" | "fixed"
  overlayColor?: string
  overlayOpacity?: number // 0 - 100
  bgAnimation?: "none" | "zoom" | "pan" | "ken_burns"
}

export interface SectionLayoutConfig {
  widthMode: "boxed" | "full" | "custom"
  minHeight?: string // e.g. "auto", "280px", "420px", "580px"
  paddingY?: "compact" | "normal" | "spacious" | "heroic"
  borderRadius?: "inherit" | "0px" | "12px" | "24px"
  boxShadow?: "none" | "soft" | "elevated" | "neon"
  sticky?: boolean
  overflowHidden?: boolean
}

export interface SectionEffectsConfig {
  entrance: "inherit" | EntranceAnimationType
  hover: "inherit" | HoverAnimationType
  topDivider: ShapeDividerType
  bottomDivider: ShapeDividerType
  backdropBlur?: number // 0 - 24
  opacity?: number // 10 - 100
}

export interface SliderSlideItem {
  id: string
  imageUrl: string
  heading?: string
  description?: string
  ctaText?: string
  ctaUrl?: string
  overlayOpacity?: number
}

export interface BuilderSection {
  id: string
  type: SectionWidgetType
  label: string
  enabled: boolean
  visibility?: "all" | "desktop" | "mobile"
  // Legacy compatibility + Rich Elementor-style modules
  animation?: "inherit" | EntranceAnimationType
  bgOverride?: string
  background?: SectionBackgroundConfig
  layout?: SectionLayoutConfig
  effects?: SectionEffectsConfig
  settings: Record<string, any>
}

export interface HeaderConfig {
  style: "glass" | "solid" | "transparent"
  bgType?: "inherit" | "solid" | "gradient" | "image" | "gif" | "video" | "transparent"
  bgColor?: string
  gradientFrom?: string
  gradientTo?: string
  bgMediaUrl?: string
  overlayOpacity?: number
  patternType?: "none" | "dots" | "grid"
  logoPosition?: "left" | "center" | "right"
  height?: "compact" | "standard" | "tall"
  sticky: boolean
  scrollEffect?: "none" | "shrink" | "bg_change" | "hide_on_scroll"
  showLiveBadge: boolean
  showConsoleLogin: boolean
  showSocialIcons?: boolean
  ctaText?: string
  ctaUrl?: string
  tagline?: string
}

export interface GalleryItem {
  id: string
  title: string
  url: string
  category?: string
  album?: string
}

export interface VideoItem {
  id: string
  title: string
  description?: string
  platform: VideoPlatform
  url: string
  thumbnailUrl?: string
  aspectRatio?: "16:9" | "9:16" | "1:1"
  category?: string
  featured?: boolean
}

export interface NewsItem {
  id: string
  title: string
  date: string
  content: string
  badge?: string
}

export interface TeamMemberItem {
  id: string
  name: string
  role: string
  photoUrl?: string
  department?: string
}

export interface FestivalWebsiteConfig {
  heroTitle?: string
  heroSubtitle?: string
  bannerUrl?: string
  logoUrl?: string
  accentColor?: string
  themeMode?: ThemeMode
  liveStreamUrl?: string
  venueCampus?: string
  helpdeskPhone?: string
  helpdeskEmail?: string
  socialLinks?: {
    instagram?: string
    youtube?: string
    facebook?: string
    whatsapp?: string
    twitter?: string
  }
  navPages?: {
    showOverview?: boolean
    showResults?: boolean
    showSchedule?: boolean
    showLeaderboard?: boolean
    showGallery?: boolean
    showVideos?: boolean
    showNews?: boolean
  }
  gallery?: GalleryItem[]
  news?: NewsItem[]

  templateId?: string
  heroConfig?: {
    badgeText?: string
    primaryCtaText?: string
    primaryCtaTarget?: "results" | "schedule" | "leaderboard" | "gallery" | "videos" | "custom"
    primaryCtaUrl?: string
    secondaryCtaText?: string
    secondaryCtaTarget?: "results" | "schedule" | "leaderboard" | "gallery" | "videos" | "custom"
    secondaryCtaUrl?: string
    alignment?: "center" | "left"
    bgVideoUrl?: string
    overlayOpacity?: number
    countdownEnabled?: boolean
    countdownTargetDate?: string
    countdownTitle?: string
  }
  headerConfig?: HeaderConfig
  footerConfig?: {
    style?: "detailed" | "compact" | "centered"
    copyrightText?: string
  }
  globalDesign?: {
    palette: ColorPalette
    typography: TypographyConfig
    shape: ShapeAndThemeConfig
    savedCustomPalettes?: ColorPalette[]
  }
  motionStudio?: MotionConfig
  sections?: BuilderSection[]
  galleryStudio?: {
    layout: GalleryLayoutType
    aspectRatio: GalleryAspectRatio
    columnsDesktop: 2 | 3 | 4
    columnsMobile: 1 | 2
    enableLightbox: boolean
    allowDownload: boolean
    watermarkText?: string
  }
  videoStudio?: {
    layout: VideoDisplayLayout
    videos: VideoItem[]
  }
  teamMembers?: TeamMemberItem[]
  popupBuilder?: {
    enabled: boolean
    title: string
    message: string
    imageUrl?: string
    ctaText?: string
    ctaUrl?: string
  }
  seoAndAdvanced?: {
    metaTitle?: string
    metaDescription?: string
    ogImageUrl?: string
    maintenanceMode?: boolean
    maintenanceMessage?: string
    customCss?: string
    customCursor?: boolean
  }
}

export const RECOMMENDED_COLOR_PALETTES: ColorPalette[] = [
  {
    id: "royal_blue",
    name: "Royal Blue",
    primary: "#1D4ED8",
    secondary: "#60A5FA",
    accent: "#F59E0B",
    background: "#0F172A",
    surface: "#1E293B",
    text: "#FFFFFF",
    mutedText: "#94A3B8",
    themeMode: "dark",
    gradientEnabled: true,
    gradientAngle: 135,
  },
  {
    id: "royal_purple",
    name: "Royal Purple",
    primary: "#6D28D9",
    secondary: "#A78BFA",
    accent: "#FBBF24",
    background: "#18112B",
    surface: "#231942",
    text: "#FFFFFF",
    mutedText: "#C4B5FD",
    themeMode: "dark",
    gradientEnabled: true,
    gradientAngle: 135,
  },
  {
    id: "emerald_green",
    name: "Emerald Green",
    primary: "#047857",
    secondary: "#34D399",
    accent: "#FBBF24",
    background: "#10251D",
    surface: "#173529",
    text: "#FFFFFF",
    mutedText: "#A7F3D0",
    themeMode: "dark",
    gradientEnabled: true,
    gradientAngle: 120,
  },
  {
    id: "sunset_orange",
    name: "Sunset Orange",
    primary: "#EA580C",
    secondary: "#FB923C",
    accent: "#FDE68A",
    background: "#292015",
    surface: "#3B2D1F",
    text: "#FFFFFF",
    mutedText: "#FED7AA",
    themeMode: "dark",
    gradientEnabled: true,
    gradientAngle: 135,
  },
  {
    id: "modern_minimal",
    name: "Modern Minimal",
    primary: "#171717",
    secondary: "#737373",
    accent: "#2563EB",
    background: "#F5F5F5",
    surface: "#FFFFFF",
    text: "#171717",
    mutedText: "#525252",
    themeMode: "light",
    gradientEnabled: false,
    gradientAngle: 90,
  },
  {
    id: "vibrant_festival",
    name: "Vibrant Festival",
    primary: "#2563EB",
    secondary: "#7C3AED",
    accent: "#EC4899",
    background: "#090D16",
    surface: "#111827",
    text: "#FFFFFF",
    mutedText: "#9CA3AF",
    themeMode: "dark",
    gradientEnabled: true,
    gradientAngle: 135,
  },
]

export const FONT_OPTIONS = {
  heading: ["Space Grotesk", "Poppins", "Montserrat", "Playfair Display", "Bebas Neue", "Inter", "Syne", "Outfit"],
  body: ["Inter", "Plus Jakarta Sans", "DM Sans", "Roboto", "Poppins"],
  malayalam: ["Anek Malayalam", "Noto Sans Malayalam", "Manjari", "Gayathri"],
  arabic: ["Amiri", "Cairo", "Noto Naskh Arabic"],
}

export const SHAPE_PRESETS: Array<{ id: ShapePresetId; name: string; desc: string; config: ShapeAndThemeConfig }> = [
  {
    id: "rounded",
    name: "Soft Rounded",
    desc: "Smooth corners and modern elevation",
    config: {
      stylePreset: "rounded",
      borderRadius: "16px",
      buttonShape: "rounded",
      cardShadow: "soft",
      containerWidth: "standard",
      sectionSpacing: "comfortable",
      backgroundTexture: "none",
    },
  },
  {
    id: "edge",
    name: "Edge / Sharp",
    desc: "0px crisp architectural geometry",
    config: {
      stylePreset: "edge",
      borderRadius: "0px",
      buttonShape: "sharp",
      cardShadow: "none",
      containerWidth: "wide",
      sectionSpacing: "comfortable",
      backgroundTexture: "grid",
    },
  },
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    desc: "Frosted translucent cards & glow",
    config: {
      stylePreset: "glassmorphism",
      borderRadius: "24px",
      buttonShape: "pill",
      cardShadow: "neon",
      containerWidth: "standard",
      sectionSpacing: "spacious",
      backgroundTexture: "mesh",
    },
  },
  {
    id: "brutalist",
    name: "Brutalist Bold",
    desc: "High-contrast borders & hard shadows",
    config: {
      stylePreset: "brutalist",
      borderRadius: "0px",
      buttonShape: "brutal",
      cardShadow: "hard_brutal",
      containerWidth: "wide",
      sectionSpacing: "comfortable",
      backgroundTexture: "dots",
    },
  },
  {
    id: "retro",
    name: "Retro Heritage",
    desc: "Warm framed heritage styling",
    config: {
      stylePreset: "retro",
      borderRadius: "8px",
      buttonShape: "rounded",
      cardShadow: "elevated",
      containerWidth: "narrow",
      sectionSpacing: "spacious",
      backgroundTexture: "noise",
    },
  },
  {
    id: "minimal",
    name: "Quiet Minimal",
    desc: "Clean breathing room & minimal lines",
    config: {
      stylePreset: "minimal",
      borderRadius: "8px",
      buttonShape: "rounded",
      cardShadow: "none",
      containerWidth: "standard",
      sectionSpacing: "spacious",
      backgroundTexture: "none",
    },
  },
]

export const DEFAULT_SECTIONS: BuilderSection[] = [
  {
    id: "sec-hero",
    type: "hero",
    label: "Hero Showcase",
    enabled: true,
    background: {
      type: "gradient",
      overlayOpacity: 55,
      bgAnimation: "ken_burns",
      imageSize: "cover",
      imagePosition: "center",
    },
    layout: { widthMode: "full", paddingY: "heroic", minHeight: "480px" },
    effects: { entrance: "fade_up", hover: "none", topDivider: "none", bottomDivider: "wave", opacity: 100 },
    settings: { alignment: "center", showCtas: true },
  },
  {
    id: "sec-marquee",
    type: "marquee",
    label: "Live Ticker Marquee",
    enabled: true,
    background: { type: "solid", solidColor: "#1D4ED8" },
    layout: { widthMode: "full", paddingY: "compact" },
    effects: { entrance: "fade_in", hover: "none", topDivider: "none", bottomDivider: "none" },
    settings: {
      text: "🏆 LIVE SCORE UPDATES RUNNING • STAGE 1 CLASSICAL PERFORMANCES IN PROGRESS • PARTICIPANTS REPORT 30 MINS EARLY •",
      speedSeconds: 22,
    },
  },
  {
    id: "sec-countdown",
    type: "countdown",
    label: "Festival Countdown Strip",
    enabled: true,
    background: { type: "inherit" },
    layout: { widthMode: "boxed", paddingY: "normal" },
    effects: { entrance: "zoom_in", hover: "none", topDivider: "none", bottomDivider: "none" },
    settings: { title: "Grand Finale Countdown" },
  },
  {
    id: "sec-stats",
    type: "stats",
    label: "Festival Live Counters",
    enabled: true,
    background: { type: "inherit" },
    layout: { widthMode: "boxed", paddingY: "normal" },
    effects: { entrance: "fade_up", hover: "lift", topDivider: "none", bottomDivider: "none" },
    settings: {},
  },
  {
    id: "sec-slider-promo",
    type: "slider_banner",
    label: "Highlights Image Slider",
    enabled: false,
    background: { type: "inherit" },
    layout: { widthMode: "boxed", paddingY: "normal" },
    effects: { entrance: "fade_up", hover: "none", topDivider: "none", bottomDivider: "none" },
    settings: {
      autoplay: true,
      transition: "fade",
      intervalMs: 4500,
      showArrows: true,
      showDots: true,
      slides: [
        {
          id: "sl-1",
          imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
          heading: "Grand Cultural Stage Showcase",
          description: "Catch live performances across all festival stages.",
          ctaText: "View Schedules",
          ctaUrl: "#schedule",
          overlayOpacity: 50,
        },
        {
          id: "sl-2",
          imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
          heading: "Real-Time Leaderboard & Results",
          description: "Track your house points and instant results live.",
          ctaText: "Live Results",
          ctaUrl: "#results",
          overlayOpacity: 50,
        },
      ],
    },
  },
  {
    id: "sec-leaderboard",
    type: "leaderboard",
    label: "House Points Standings",
    enabled: true,
    background: { type: "inherit" },
    layout: { widthMode: "boxed", paddingY: "normal" },
    effects: { entrance: "fade_up", hover: "lift", topDivider: "none", bottomDivider: "none" },
    settings: { maxItems: 6 },
  },
  {
    id: "sec-results",
    type: "results",
    label: "Latest Published Results",
    enabled: true,
    background: { type: "inherit" },
    layout: { widthMode: "boxed", paddingY: "normal" },
    effects: { entrance: "fade_up", hover: "lift", topDivider: "none", bottomDivider: "none" },
    settings: { maxItems: 6 },
  },
  {
    id: "sec-videos",
    type: "videos",
    label: "Live Stream & Video Studio",
    enabled: true,
    background: { type: "inherit" },
    layout: { widthMode: "boxed", paddingY: "normal" },
    effects: { entrance: "fade_up", hover: "none", topDivider: "none", bottomDivider: "none" },
    settings: {},
  },
  {
    id: "sec-gallery",
    type: "gallery",
    label: "Photo Gallery Showcase",
    enabled: true,
    background: { type: "inherit" },
    layout: { widthMode: "boxed", paddingY: "normal" },
    effects: { entrance: "fade_up", hover: "scale", topDivider: "none", bottomDivider: "none" },
    settings: {},
  },
  {
    id: "sec-news",
    type: "news",
    label: "Official Bulletins & News",
    enabled: true,
    background: { type: "inherit" },
    layout: { widthMode: "boxed", paddingY: "normal" },
    effects: { entrance: "fade_up", hover: "lift", topDivider: "none", bottomDivider: "none" },
    settings: {},
  },
  {
    id: "sec-contact",
    type: "contact",
    label: "Campus Venue & Helpdesk",
    enabled: true,
    background: { type: "inherit" },
    layout: { widthMode: "boxed", paddingY: "normal" },
    effects: { entrance: "fade_up", hover: "none", topDivider: "none", bottomDivider: "none" },
    settings: {},
  },
]

export interface StudioTemplatePreset {
  id: string
  name: string
  category: string
  description: string
  previewGradient: string
  patch: Partial<FestivalWebsiteConfig>
}

export const READY_MADE_TEMPLATES: StudioTemplatePreset[] = [
  {
    id: "modern_festival",
    name: "Modern Festival",
    category: "Arts & Cultural",
    description: "Vibrant festival aesthetic with glass surfaces and wave dividers",
    previewGradient: "from-blue-600 via-violet-600 to-pink-500",
    patch: {
      templateId: "modern_festival",
      globalDesign: {
        palette: RECOMMENDED_COLOR_PALETTES[5],
        typography: {
          headingFont: "Space Grotesk",
          bodyFont: "Inter",
          malayalamFont: "Anek Malayalam",
          arabicFont: "Amiri",
          headingWeight: "900",
          headingSize: "heroic",
          lineHeight: "normal",
          letterSpacing: "tighter",
          textTransform: "none",
        },
        shape: SHAPE_PRESETS[2].config,
      },
    },
  },
  {
    id: "academic_fest",
    name: "Academic Fest",
    category: "School / University",
    description: "Clean light layout designed for high-clarity campus portals",
    previewGradient: "from-slate-800 via-blue-700 to-cyan-500",
    patch: {
      templateId: "academic_fest",
      globalDesign: {
        palette: RECOMMENDED_COLOR_PALETTES[4],
        typography: {
          headingFont: "Poppins",
          bodyFont: "Plus Jakarta Sans",
          malayalamFont: "Noto Sans Malayalam",
          arabicFont: "Cairo",
          headingWeight: "800",
          headingSize: "large",
          lineHeight: "relaxed",
          letterSpacing: "normal",
          textTransform: "none",
        },
        shape: SHAPE_PRESETS[0].config,
      },
    },
  },
  {
    id: "islamic_cultural",
    name: "Sahityotsav / Islamic Fest",
    category: "Cultural & Literature",
    description: "Emerald & Gold prestige palette with Arabic + Malayalam font harmony",
    previewGradient: "from-emerald-800 via-emerald-600 to-amber-500",
    patch: {
      templateId: "islamic_cultural",
      globalDesign: {
        palette: RECOMMENDED_COLOR_PALETTES[2],
        typography: {
          headingFont: "Playfair Display",
          bodyFont: "Anek Malayalam",
          malayalamFont: "Anek Malayalam",
          arabicFont: "Amiri",
          headingWeight: "800",
          headingSize: "heroic",
          lineHeight: "relaxed",
          letterSpacing: "normal",
          textTransform: "none",
        },
        shape: SHAPE_PRESETS[4].config,
      },
    },
  },
  {
    id: "school_kalolsavam",
    name: "School Kalolsavam",
    category: "State / District Fest",
    description: "Bold Royal Purple & Gold theme built for rapid scorecards & schedules",
    previewGradient: "from-purple-800 via-indigo-700 to-amber-400",
    patch: {
      templateId: "school_kalolsavam",
      globalDesign: {
        palette: RECOMMENDED_COLOR_PALETTES[1],
        typography: {
          headingFont: "Montserrat",
          bodyFont: "Anek Malayalam",
          malayalamFont: "Anek Malayalam",
          arabicFont: "Amiri",
          headingWeight: "900",
          headingSize: "large",
          lineHeight: "normal",
          letterSpacing: "normal",
          textTransform: "uppercase",
        },
        shape: SHAPE_PRESETS[0].config,
      },
    },
  },
  {
    id: "college_tech",
    name: "College Tech Fest",
    category: "Engineering & Tech",
    description: "Sharp 0px grid aesthetic with Royal Blue cyber tones",
    previewGradient: "from-slate-950 via-blue-800 to-indigo-500",
    patch: {
      templateId: "college_tech",
      globalDesign: {
        palette: RECOMMENDED_COLOR_PALETTES[0],
        typography: {
          headingFont: "Syne",
          bodyFont: "DM Sans",
          malayalamFont: "Anek Malayalam",
          arabicFont: "Cairo",
          headingWeight: "800",
          headingSize: "heroic",
          lineHeight: "tight",
          letterSpacing: "wider",
          textTransform: "uppercase",
        },
        shape: SHAPE_PRESETS[1].config,
      },
    },
  },
  {
    id: "literary_fest",
    name: "Literary Festival",
    category: "Books & Debate",
    description: "Warm sunset tones with editorial serif headings",
    previewGradient: "from-orange-700 via-amber-600 to-yellow-400",
    patch: {
      templateId: "literary_fest",
      globalDesign: {
        palette: RECOMMENDED_COLOR_PALETTES[3],
        typography: {
          headingFont: "Playfair Display",
          bodyFont: "Inter",
          malayalamFont: "Manjari",
          arabicFont: "Amiri",
          headingWeight: "700",
          headingSize: "large",
          lineHeight: "relaxed",
          letterSpacing: "normal",
          textTransform: "none",
        },
        shape: SHAPE_PRESETS[4].config,
      },
    },
  },
  {
    id: "youth_festival",
    name: "Youth Festival Brutal",
    category: "Campus Energy",
    description: "High-energy Brutalist blocks with Bebas Neue display",
    previewGradient: "from-fuchsia-600 via-rose-600 to-amber-500",
    patch: {
      templateId: "youth_festival",
      globalDesign: {
        palette: RECOMMENDED_COLOR_PALETTES[5],
        typography: {
          headingFont: "Bebas Neue",
          bodyFont: "Inter",
          malayalamFont: "Anek Malayalam",
          arabicFont: "Cairo",
          headingWeight: "900",
          headingSize: "heroic",
          lineHeight: "tight",
          letterSpacing: "wide",
          textTransform: "uppercase",
        },
        shape: SHAPE_PRESETS[3].config,
      },
    },
  },
  {
    id: "minimal_pro",
    name: "Minimal Professional",
    category: "Corporate / Clean",
    description: "Quiet monochrome elegance with crisp spacing",
    previewGradient: "from-neutral-800 via-neutral-600 to-neutral-400",
    patch: {
      templateId: "minimal_pro",
      globalDesign: {
        palette: RECOMMENDED_COLOR_PALETTES[4],
        typography: {
          headingFont: "Outfit",
          bodyFont: "Inter",
          malayalamFont: "Gayathri",
          arabicFont: "Noto Naskh Arabic",
          headingWeight: "700",
          headingSize: "standard",
          lineHeight: "relaxed",
          letterSpacing: "normal",
          textTransform: "none",
        },
        shape: SHAPE_PRESETS[5].config,
      },
    },
  },
  {
    id: "premium_dark",
    name: "Premium Dark",
    category: "Flagship Night",
    description: "Deep midnight slate with gold accents",
    previewGradient: "from-slate-900 via-indigo-950 to-amber-500",
    patch: {
      templateId: "premium_dark",
      globalDesign: {
        palette: RECOMMENDED_COLOR_PALETTES[0],
        typography: {
          headingFont: "Space Grotesk",
          bodyFont: "Plus Jakarta Sans",
          malayalamFont: "Anek Malayalam",
          arabicFont: "Amiri",
          headingWeight: "900",
          headingSize: "heroic",
          lineHeight: "normal",
          letterSpacing: "tighter",
          textTransform: "none",
        },
        shape: SHAPE_PRESETS[2].config,
      },
    },
  },
  {
    id: "retro_cultural",
    name: "Retro Cultural",
    category: "Vintage Arts",
    description: "Classic textured nostalgia with sunset warmth",
    previewGradient: "from-amber-800 via-orange-700 to-stone-700",
    patch: {
      templateId: "retro_cultural",
      globalDesign: {
        palette: RECOMMENDED_COLOR_PALETTES[3],
        typography: {
          headingFont: "Playfair Display",
          bodyFont: "DM Sans",
          malayalamFont: "Manjari",
          arabicFont: "Amiri",
          headingWeight: "800",
          headingSize: "large",
          lineHeight: "normal",
          letterSpacing: "normal",
          textTransform: "none",
        },
        shape: SHAPE_PRESETS[4].config,
      },
    },
  },
]

export function getDefaultWebsiteConfig(fest?: any, settings?: any): FestivalWebsiteConfig {
  const defaultPalette = RECOMMENDED_COLOR_PALETTES[5]
  return {
    templateId: "modern_festival",
    heroTitle: fest?.name || "Festival 2026",
    heroSubtitle: fest?.description || "Live competitions, stage schedules, house rankings, and instant results.",
    bannerUrl: fest?.banner_url || "",
    logoUrl: fest?.logo_url || "",
    accentColor: settings?.theme_color || defaultPalette.primary,
    themeMode: "dark",
    venueCampus: "Main Auditorium Campus",
    helpdeskPhone: "+91 98765 43210",
    helpdeskEmail: "contact@festportal.com",
    liveStreamUrl: "https://www.youtube.com/embed/live_stream",
    socialLinks: {
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      facebook: "https://facebook.com",
      whatsapp: "https://wa.me/919876543210",
      twitter: "https://x.com",
    },
    navPages: {
      showOverview: true,
      showResults: true,
      showSchedule: true,
      showLeaderboard: true,
      showGallery: true,
      showVideos: true,
      showNews: true,
    },
    heroConfig: {
      badgeText: "Official Festival Portal • Real-Time Scoring",
      primaryCtaText: "Live Results",
      primaryCtaTarget: "results",
      secondaryCtaText: "House Standings",
      secondaryCtaTarget: "leaderboard",
      alignment: "center",
      overlayOpacity: 0.65,
      countdownEnabled: true,
      countdownTitle: "Grand Finale Countdown",
      countdownTargetDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    },
    headerConfig: {
      style: "glass",
      bgType: "inherit",
      logoPosition: "left",
      height: "standard",
      sticky: true,
      scrollEffect: "none",
      showLiveBadge: true,
      showConsoleLogin: true,
      showSocialIcons: false,
      tagline: "OFFICIAL FESTIVAL PORTAL",
    },
    footerConfig: {
      style: "detailed",
      copyrightText: `© ${new Date().getFullYear()} ${fest?.name || "Festival"}. All rights reserved.`,
    },
    globalDesign: {
      palette: {
        ...defaultPalette,
        primary: settings?.theme_color || defaultPalette.primary,
      },
      typography: {
        headingFont: "Space Grotesk",
        bodyFont: "Inter",
        malayalamFont: "Anek Malayalam",
        arabicFont: "Amiri",
        headingWeight: "900",
        headingSize: "heroic",
        lineHeight: "normal",
        letterSpacing: "tighter",
        textTransform: "none",
      },
      shape: SHAPE_PRESETS[2].config,
      savedCustomPalettes: [],
    },
    motionStudio: {
      reducedMotion: false,
      defaultEntrance: "fade_up",
      defaultHover: "lift",
      duration: 0.5,
      scrollProgressBar: true,
      parallaxHero: true,
    },
    sections: DEFAULT_SECTIONS,
    galleryStudio: {
      layout: "grid",
      aspectRatio: "4:3",
      columnsDesktop: 3,
      columnsMobile: 1,
      enableLightbox: true,
      allowDownload: true,
      watermarkText: "",
    },
    videoStudio: {
      layout: "featured_playlist",
      videos: [
        {
          id: "v-1",
          title: "Main Stage Live Telecast",
          description: "Watch real-time stage programs and prize distributions",
          platform: "youtube",
          url: "https://www.youtube.com/embed/live_stream",
          aspectRatio: "16:9",
          category: "Live",
          featured: true,
        },
      ],
    },
    teamMembers: [
      { id: "tm-1", name: "Festival Convener", role: "General Convener", department: "Main Committee" },
      { id: "tm-2", name: "Program Coordinator", role: "Stage & Jury Head", department: "Program Wing" },
      { id: "tm-3", name: "Media Lead", role: "Broadcast & Publicity", department: "Media Team" },
    ],
    popupBuilder: {
      enabled: false,
      title: "Important Festival Announcement",
      message: "Participants are requested to verify chest numbers 30 minutes prior to stage time.",
      ctaText: "View Schedule",
      ctaUrl: "#schedule",
    },
    seoAndAdvanced: {
      metaTitle: fest?.name || "Festival Portal",
      metaDescription: fest?.description || "Official real-time festival portal.",
      maintenanceMode: false,
      maintenanceMessage: "The festival portal is currently undergoing a quick update. We will be right back!",
      customCss: "",
      customCursor: false,
    },
    gallery: [
      { id: "g1", title: "Inauguration Ceremony", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80", category: "Ceremony" },
      { id: "g2", title: "Classical Dance Stage", url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80", category: "Stage" },
      { id: "g3", title: "Light Music Band", url: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80", category: "Music" },
      { id: "g4", title: "Auditorium Crowd", url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80", category: "Crowd" },
    ],
    news: [
      { id: "n1", title: "Grand Inauguration Ceremony Begins at Main Stage", date: "Today, 09:00 AM", content: "The cultural fest has been officially inaugurated by dignitaries. Stage 1 programs are now live.", badge: "Live" },
      { id: "n2", title: "Stage 2 Schedule Updated for Afternoon Competitions", date: "Today, 11:30 AM", content: "Classical solo performances will commence at 02:00 PM on Stage 2.", badge: "Schedule" },
    ],
  }
}
