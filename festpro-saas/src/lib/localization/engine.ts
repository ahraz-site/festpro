import { createAdminClient } from "@/lib/supabase/admin"
import type { Language, LocaleSettings, RegionalSettings } from "@/types/localization"

type TranslationCache = Map<string, string>
const cache = new Map<string, { data: TranslationCache; expiresAt: number }>()

export async function getAvailableLanguages(enabledOnly = true): Promise<Language[]> {
  const admin = createAdminClient()
  let q = admin.from("languages").select("*").order("sort_order")
  if (enabledOnly) q = q.eq("is_enabled", true)
  const { data } = await q
  return data ?? []
}

export async function getLocaleSettings(organizationId: string): Promise<LocaleSettings | null> {
  const admin = createAdminClient()
  const { data } = await admin.from("locale_settings").select("*").eq("organization_id", organizationId).maybeSingle()
  return data
}

export async function getRegionalSettings(organizationId: string): Promise<RegionalSettings | null> {
  const admin = createAdminClient()
  const { data } = await admin.from("regional_settings").select("*").eq("organization_id", organizationId).maybeSingle()
  return data
}

export async function getPreferredLanguage(userId: string, organizationId?: string): Promise<Language> {
  const admin = createAdminClient()
  const { data: prefs } = await admin.from("user_language_preferences")
    .select("*, languages(*)").eq("user_id", userId).eq("is_primary", true).maybeSingle()
  if (prefs?.languages) return prefs.languages as unknown as Language

  if (organizationId) {
    const settings = await getLocaleSettings(organizationId)
    if (settings?.default_language_id) {
      const { data: lang } = await admin.from("languages").select("*").eq("id", settings.default_language_id).single()
      if (lang) return lang
    }
  }

  const { data: defaultLang } = await admin.from("languages").select("*").eq("is_default", true).single()
  return defaultLang ?? { id: "en", code: "en", locale: "en-US", name: "English", native_name: "English", script: "latin", direction: "ltr", plural_rule: null, is_rtl: false, is_enabled: true, is_default: true, sort_order: 0, flag_emoji: "🇺🇸", metadata: {}, created_at: "", updated_at: "" }
}

export async function loadTranslations(languageId: string, organizationId?: string, namespace?: string): Promise<Record<string, string>> {
  const cacheKey = `translations:${languageId}:${organizationId ?? "global"}:${namespace ?? "all"}`
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return Object.fromEntries(cached.data)

  const admin = createAdminClient()
  const translations: Record<string, string> = {}

  let q = admin.from("translation_values")
    .select("translation_keys!inner(key_name, namespace), value, status")
    .eq("language_id", languageId)
    .eq("status", "approved")

  if (namespace) q = q.eq("translation_keys.namespace", namespace)

  if (organizationId) {
    q = q.in("translation_keys.pack_id",
      admin.from("language_packs").select("id").eq("organization_id", organizationId) as any
    )
  }

  const { data } = await q
  if (data) {
    for (const row of data) {
      const key = row.translation_keys as any
      translations[`${key.namespace}.${key.key_name}`] = row.value
    }
  }

  const map = new Map(Object.entries(translations))
  const settings = organizationId ? await getLocaleSettings(organizationId) : null
  const ttl = (settings?.cache_ttl_seconds ?? 3600) * 1000
  cache.set(cacheKey, { data: map, expiresAt: Date.now() + ttl })

  return translations
}

export function formatCurrency(amount: number, settings: RegionalSettings): string {
  const abs = Math.abs(amount)
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: settings.currency_decimal_places,
    maximumFractionDigits: settings.currency_decimal_places,
  })
  const prefix = amount < 0 ? "-" : ""
  const symbol = settings.currency_symbol
  switch (settings.currency_format) {
    case "symbol_prefix": return `${prefix}${symbol}${formatted}`
    case "symbol_suffix": return `${prefix}${formatted}${symbol}`
    case "code_prefix": return `${prefix}${settings.currency_code} ${formatted}`
    case "code_suffix": return `${prefix}${formatted} ${settings.currency_code}`
    default: return `${prefix}${symbol}${formatted}`
  }
}

export function formatDate(date: string | Date, format: string, timezone: string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const tzDate = new Date(d.toLocaleString("en-US", { timeZone: timezone }))
  const map: Record<string, string> = {
    YYYY: tzDate.getFullYear().toString().padStart(4, "0"),
    MM: (tzDate.getMonth() + 1).toString().padStart(2, "0"),
    DD: tzDate.getDate().toString().padStart(2, "0"),
    HH: tzDate.getHours().toString().padStart(2, "0"),
    mm: tzDate.getMinutes().toString().padStart(2, "0"),
    ss: tzDate.getSeconds().toString().padStart(2, "0"),
  }
  let result = format
  for (const [key, val] of Object.entries(map)) result = result.replace(key, val)
  return result
}

export function formatNumber(value: number, groupSep: string, decimalSep: string, decimals = 2): string {
  const parts = value.toFixed(decimals).split(".")
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, groupSep)
  return parts.length > 1 ? `${intPart}${decimalSep}${parts[1]}` : intPart
}

export function getRTLScripts(): string[] {
  return ["arabic"]
}

export function isRTL(script: string): boolean {
  return getRTLScripts().includes(script)
}

export function translate(key: string, translations: Record<string, string>, params?: Record<string, string | number>): string {
  let text = translations[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }
  return text
}

export function detectBrowserLanguage(acceptLanguage: string, supportedLanguages: Language[]): Language | null {
  const codes = supportedLanguages.map((l) => l.code)
  const preferred = acceptLanguage.split(",").map((s) => s.split(";")[0].trim().split("-")[0])
  for (const code of preferred) {
    const match = supportedLanguages.find((l) => l.code === code)
    if (match) return match
  }
  return null
}

export function getAccessibilityStyles(prefs: { high_contrast: boolean; large_text: boolean; reduced_motion: boolean; font_size_multiplier: number; line_height_multiplier: number; letter_spacing_multiplier: number; color_blind_mode: string }): Record<string, string> {
  const styles: Record<string, string> = {}
  if (prefs.high_contrast) styles["--accent"] = "high-contrast"
  if (prefs.large_text) styles["font-size"] = `${1.25 * prefs.font_size_multiplier}em`
  else styles["font-size"] = `${prefs.font_size_multiplier}em`
  styles["line-height"] = String(prefs.line_height_multiplier)
  styles["letter-spacing"] = `${prefs.letter_spacing_multiplier}em`
  if (prefs.reduced_motion) styles["--reduced-motion"] = "true"
  if (prefs.color_blind_mode) styles["--color-blind"] = prefs.color_blind_mode
  return styles
}
