export const TRANSLATION_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-600" },
  { value: "pending_review", label: "Pending Review", color: "bg-amber-100 text-amber-700" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  { value: "deprecated", label: "Deprecated", color: "bg-gray-100 text-gray-500" },
] as const

export const SUPPORTED_LANGUAGES = [
  { code: "en", locale: "en-US", name: "English", native_name: "English", script: "latin", direction: "ltr", rtl: false },
  { code: "ml", locale: "ml-IN", name: "Malayalam", native_name: "മലയാളം", script: "malayalam", direction: "ltr", rtl: false },
  { code: "ar", locale: "ar-SA", name: "Arabic", native_name: "العربية", script: "arabic", direction: "rtl", rtl: true },
  { code: "hi", locale: "hi-IN", name: "Hindi", native_name: "हिन्दी", script: "devanagari", direction: "ltr", rtl: false },
  { code: "ta", locale: "ta-IN", name: "Tamil", native_name: "தமிழ்", script: "tamil", direction: "ltr", rtl: false },
  { code: "kn", locale: "kn-IN", name: "Kannada", native_name: "ಕನ್ನಡ", script: "kannada", direction: "ltr", rtl: false },
  { code: "te", locale: "te-IN", name: "Telugu", native_name: "తెలుగు", script: "telugu", direction: "ltr", rtl: false },
  { code: "ur", locale: "ur-PK", name: "Urdu", native_name: "اردو", script: "arabic", direction: "rtl", rtl: true },
  { code: "fr", locale: "fr-FR", name: "French", native_name: "Français", script: "latin", direction: "ltr", rtl: false },
  { code: "de", locale: "de-DE", name: "German", native_name: "Deutsch", script: "latin", direction: "ltr", rtl: false },
  { code: "es", locale: "es-ES", name: "Spanish", native_name: "Español", script: "latin", direction: "ltr", rtl: false },
] as const

export const TRANSLATION_NAMESPACES = [
  "default", "common", "auth", "dashboard", "festival", "competition", "participant",
  "judge", "volunteer", "sponsor", "finance", "inventory", "medical", "notification",
  "email", "sms", "report", "certificate", "announcement", "settings", "help",
] as const

export const ACCESSIBILITY_LEVELS = [
  { value: "wcag_a", label: "WCAG A", color: "bg-yellow-100 text-yellow-700" },
  { value: "wcag_aa", label: "WCAG AA", color: "bg-green-100 text-green-700" },
  { value: "wcag_aaa", label: "WCAG AAA", color: "bg-blue-100 text-blue-700" },
  { value: "custom", label: "Custom", color: "bg-purple-100 text-purple-700" },
] as const

export const MEASUREMENT_SYSTEMS = [
  { value: "metric", label: "Metric" },
  { value: "imperial", label: "Imperial" },
  { value: "us_customary", label: "US Customary" },
  { value: "both", label: "Both" },
] as const

export const DEFAULT_COUNTRIES = [
  { code: "US", name: "United States", currency: "USD", symbol: "$", timezone: "America/New_York" },
  { code: "IN", name: "India", currency: "INR", symbol: "₹", timezone: "Asia/Kolkata" },
  { code: "AE", name: "UAE", currency: "AED", symbol: "د.إ", timezone: "Asia/Dubai" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", symbol: "﷼", timezone: "Asia/Riyadh" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£", timezone: "Europe/London" },
  { code: "FR", name: "France", currency: "EUR", symbol: "€", timezone: "Europe/Paris" },
  { code: "DE", name: "Germany", currency: "EUR", symbol: "€", timezone: "Europe/Berlin" },
  { code: "ES", name: "Spain", currency: "EUR", symbol: "€", timezone: "Europe/Madrid" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$", timezone: "Australia/Sydney" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥", timezone: "Asia/Tokyo" },
] as const

export const IMPORT_EXPORT_FORMATS = [
  { value: "json", label: "JSON" },
  { value: "csv", label: "CSV" },
  { value: "xliff", label: "XLIFF" },
  { value: "yaml", label: "YAML" },
  { value: "po", label: "PO" },
] as const

export const COLOR_BLIND_MODES = [
  { value: "", label: "None" },
  { value: "protanopia", label: "Protanopia (Red-blind)" },
  { value: "deuteranopia", label: "Deuteranopia (Green-blind)" },
  { value: "tritanopia", label: "Tritanopia (Blue-blind)" },
  { value: "achromatopsia", label: "Achromatopsia (Total)" },
] as const
