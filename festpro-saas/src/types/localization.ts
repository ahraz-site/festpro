export type TranslationStatus = "draft" | "pending_review" | "approved" | "rejected" | "deprecated"
export type TranslationImportFormat = "json" | "csv" | "xliff" | "yaml" | "po"
export type TranslationExportFormat = "json" | "csv" | "xliff" | "yaml" | "po"
export type LocaleCalendar = "gregorian" | "islamic" | "hijri" | "indian" | "buddhist" | "japanese" | "custom"
export type MeasurementSystem = "metric" | "imperial" | "us_customary" | "both"
export type AccessibilityLevel = "wcag_a" | "wcag_aa" | "wcag_aaa" | "custom"
export type TextToSpeechVoice = "male" | "female" | "neutral" | "custom"
export type LanguageScript = "latin" | "arabic" | "devanagari" | "malayalam" | "tamil" | "kannada" | "telugu" | "gurmukhi" | "custom"

export interface Language {
  id: string; code: string; locale: string; name: string; native_name: string
  script: LanguageScript; direction: string; plural_rule: string | null
  is_rtl: boolean; is_enabled: boolean; is_default: boolean; sort_order: number
  flag_emoji: string | null; metadata: any; created_at: string; updated_at: string
}

export interface LanguagePack {
  id: string; language_id: string; organization_id: string | null; pack_name: string
  pack_version: string; is_active: boolean; base_pack_id: string | null
  total_keys: number; translated_keys: number; coverage_percent: number
  created_by: string | null; created_at: string; updated_at: string
}

export interface TranslationKey {
  id: string; pack_id: string; key_name: string; namespace: string; context: string | null
  description: string | null; max_length: number | null; is_plural: boolean
  plural_forms: string[]; variables: string[]; tags: string[]
  is_active: boolean; created_by: string | null; created_at: string; updated_at: string
}

export interface TranslationValue {
  id: string; key_id: string; language_id: string; value: string; plural_values: any
  status: TranslationStatus; reviewed_by: string | null; reviewed_at: string | null
  notes: string | null; created_by: string | null; created_at: string; updated_at: string
}

export interface TranslationVersion {
  id: string; value_id: string; previous_value: string; new_value: string
  status: TranslationStatus; change_reason: string | null; created_by: string | null; created_at: string
}

export interface TranslationHistory {
  id: string; key_id: string | null; value_id: string | null; language_id: string | null
  action: string; old_value: string; new_value: string; changed_by: string | null
  metadata: any; created_at: string
}

export interface TranslationImport {
  id: string; organization_id: string | null; language_id: string; import_format: TranslationImportFormat
  file_name: string; file_size_bytes: number | null; total_keys: number; imported_keys: number
  skipped_keys: number; failed_keys: number; status: string; error_log: string | null
  created_by: string | null; created_at: string
}

export interface TranslationExport {
  id: string; organization_id: string | null; language_id: string; pack_id: string | null
  export_format: TranslationExportFormat; key_count: number; file_url: string | null
  file_size_bytes: number | null; status: string; created_by: string | null; created_at: string
}

export interface LocaleSettings {
  id: string; organization_id: string; default_language_id: string | null
  fallback_language_id: string | null; supported_language_ids: string[]
  enable_browser_detection: boolean; enable_user_override: boolean
  cache_ttl_seconds: number; created_at: string; updated_at: string
}

export interface RegionalSettings {
  id: string; organization_id: string; country_code: string; currency_code: string
  currency_symbol: string; currency_decimal_places: number; currency_format: string
  timezone: string; date_format: string; time_format: string; datetime_format: string
  first_day_of_week: number; calendar: LocaleCalendar; measurement_system: MeasurementSystem
  number_group_separator: string; number_decimal_separator: string; phone_prefix: string | null
  postal_code_format: string | null; created_at: string; updated_at: string
}

export interface CurrencyFormat {
  id: string; currency_code: string; currency_name: string; currency_symbol: string
  decimal_places: number; format_pattern: string; is_active: boolean; created_at: string
}

export interface DateFormat {
  id: string; format_code: string; format_pattern: string; display_name: string
  example: string | null; is_active: boolean; created_at: string
}

export interface TimeFormat {
  id: string; format_code: string; format_pattern: string; display_name: string
  example: string | null; is_24hour: boolean; is_active: boolean; created_at: string
}

export interface NumberFormat {
  id: string; format_code: string; group_separator: string; decimal_separator: string
  display_name: string; example: string | null; is_active: boolean; created_at: string
}

export interface TimezoneSetting {
  id: string; timezone_name: string; display_name: string; utc_offset: string
  iana_name: string | null; is_active: boolean; created_at: string
}

export interface TenantLocalization {
  id: string; organization_id: string; language_id: string | null; locale_id: string | null
  regional_id: string | null; is_active: boolean; config: any; created_at: string; updated_at: string
}

export interface UserLanguagePreference {
  id: string; user_id: string; language_id: string; is_primary: boolean
  enable_rtl: boolean | null; enable_translitteration: boolean
  created_at: string; updated_at: string
}

export interface AccessibilityProfile {
  id: string; profile_name: string; organization_id: string | null
  level: AccessibilityLevel; is_default: boolean; is_active: boolean
  guidelines: any; created_at: string; updated_at: string
}

export interface AccessibilityPreference {
  id: string; user_id: string; profile_id: string | null; high_contrast: boolean
  large_text: boolean; reduced_motion: boolean; focus_visible: boolean
  screen_reader_optimized: boolean; color_blind_mode: string
  font_size_multiplier: number; line_height_multiplier: number
  letter_spacing_multiplier: number; custom_css: string | null
  created_at: string; updated_at: string
}

export interface TextToSpeechSettings {
  id: string; user_id: string; language_id: string | null; voice: TextToSpeechVoice
  speed: number; pitch: number; volume: number; auto_read_announcements: boolean
  auto_read_reports: boolean; auto_read_results: boolean; auto_read_navigation: boolean
  created_at: string; updated_at: string
}

export interface LocalizationDashboardData {
  total_languages: number; enabled_languages: number; total_packs: number
  total_keys: number; approved_keys: number; pending_keys: number
  coverage_percent: number; total_imports: number; total_exports: number
  rtl_languages: number; accessibility_profiles: number
  average_coverage: number; missing_keys: number
}
