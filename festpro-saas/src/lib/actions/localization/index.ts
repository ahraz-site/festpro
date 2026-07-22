"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  Language, LanguagePack, TranslationKey, TranslationValue, TranslationVersion,
  TranslationHistory, TranslationImport, TranslationExport, LocaleSettings, RegionalSettings,
  CurrencyFormat, DateFormat, TimeFormat, NumberFormat, TimezoneSetting, TenantLocalization,
  UserLanguagePreference, AccessibilityProfile, AccessibilityPreference, TextToSpeechSettings,
  LocalizationDashboardData,
} from "@/types/localization"

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

async function checkSuperAdmin() {
  const user = await getAuth()
  if (!user) return { allowed: false, error: "Not authenticated" } as const
  const admin = createAdminClient()
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single()
  const allowedRoles = ["platform_owner", "platform_admin", "organization_owner", "organization_admin", "super_admin"]
  if (!profile || !allowedRoles.includes(profile.role)) return { allowed: false, error: "Not authorized" } as const
  return { allowed: true, user } as const
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getLocalizationDashboard(): Promise<{ data: LocalizationDashboardData } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const [{ count: tl }, { count: el }, { count: tp }, { count: tk }, { count: ak }, { count: pk },
      { count: ti }, { count: te }, { count: rtl }, { count: ap },
    ] = await Promise.all([
      admin.from("languages").select("*", { count: "exact", head: true }),
      admin.from("languages").select("*", { count: "exact", head: true }).eq("is_enabled", true),
      admin.from("language_packs").select("*", { count: "exact", head: true }),
      admin.from("translation_keys").select("*", { count: "exact", head: true }),
      admin.from("translation_values").select("*", { count: "exact", head: true }).eq("status", "approved"),
      admin.from("translation_values").select("*", { count: "exact", head: true }).eq("status", "draft"),
      admin.from("translation_imports").select("*", { count: "exact", head: true }),
      admin.from("translation_exports").select("*", { count: "exact", head: true }),
      admin.from("languages").select("*", { count: "exact", head: true }).eq("is_rtl", true),
      admin.from("accessibility_profiles").select("*", { count: "exact", head: true }),
    ])
    const { data: packs } = await admin.from("language_packs").select("coverage_percent").limit(100)
    const avgCov = packs?.length ? packs.reduce((s: number, p: any) => s + (p.coverage_percent ?? 0), 0) / packs.length : 0
    return {
      data: {
        total_languages: tl ?? 0, enabled_languages: el ?? 0, total_packs: tp ?? 0,
        total_keys: tk ?? 0, approved_keys: ak ?? 0, pending_keys: pk ?? 0,
        coverage_percent: Math.round(avgCov), total_imports: ti ?? 0, total_exports: te ?? 0,
        rtl_languages: rtl ?? 0, accessibility_profiles: ap ?? 0,
        average_coverage: Math.round(avgCov), missing_keys: (tk ?? 0) - (ak ?? 0),
      },
    }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// LANGUAGES
// ============================================================

export async function getLanguages(): Promise<{ data: Language[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("languages").select("*").order("sort_order")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function createLanguage(data: Partial<Language>): Promise<{ data: Language } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: lang, error } = await admin.from("languages").insert(data).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/localization")
    return { data: lang }
  } catch (e: any) { return { error: e.message } }
}

export async function updateLanguage(id: string, updates: Partial<Language>): Promise<{ data: Language } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: lang, error } = await admin.from("languages").update(updates).eq("id", id).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/localization")
    return { data: lang }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// LANGUAGE PACKS
// ============================================================

export async function getLanguagePacks(): Promise<{ data: LanguagePack[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("language_packs").select("*, languages(name, code, flag_emoji)").order("pack_name")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function createLanguagePack(data: Partial<LanguagePack>): Promise<{ data: LanguagePack } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: pack, error } = await admin.from("language_packs").insert(data).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/localization")
    return { data: pack }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// TRANSLATION KEYS & VALUES
// ============================================================

export async function getTranslationKeys(options?: { pack_id?: string; namespace?: string; limit?: number; offset?: number }): Promise<{ data: TranslationKey[]; total: number } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const limit = options?.limit ?? 50; const offset = options?.offset ?? 0
    let q = admin.from("translation_keys").select("*, translation_values(*)", { count: "exact" })
    let cq = admin.from("translation_keys").select("*", { count: "exact", head: true })
    if (options?.pack_id) { q = q.eq("pack_id", options.pack_id); cq = cq.eq("pack_id", options.pack_id) }
    if (options?.namespace) { q = q.eq("namespace", options.namespace); cq = cq.eq("namespace", options.namespace) }
    q = q.order("namespace").order("key_name").range(offset, offset + limit - 1)
    const [{ data, count }, { count: total }] = await Promise.all([q, cq])
    return { data: data ?? [], total: total ?? 0 }
  } catch (e: any) { return { error: e.message } }
}

export async function createTranslationKey(data: Partial<TranslationKey>): Promise<{ data: TranslationKey } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: key, error } = await admin.from("translation_keys").insert(data).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/localization")
    return { data: key }
  } catch (e: any) { return { error: e.message } }
}

export async function updateTranslationValue(keyId: string, languageId: string, value: string, status = "draft"): Promise<{ data: TranslationValue } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: existing } = await admin.from("translation_values").select("id").eq("key_id", keyId).eq("language_id", languageId).maybeSingle()
    let result
    if (existing) {
      const { data } = await admin.from("translation_values").update({ value, status }).eq("id", existing.id).select().single()
      result = data
    } else {
      const { data } = await admin.from("translation_values").insert({ key_id: keyId, language_id: languageId, value, status }).select().single()
      result = data
    }
    if (!result) return { error: "Failed to save translation" }
    revalidatePath("/dashboard/platform/localization")
    return { data: result }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// LOCALE & REGIONAL SETTINGS
// ============================================================

export async function getLocaleSettings(): Promise<{ data: LocaleSettings[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("locale_settings").select("*, languages!default_language_id(name, code), fallback:languages!fallback_language_id(name, code)").order("created_at", { ascending: false })
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function upsertLocaleSettings(data: Partial<LocaleSettings>): Promise<{ data: LocaleSettings } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: settings, error } = await admin.from("locale_settings").upsert(data, { onConflict: "organization_id" }).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/localization")
    return { data: settings }
  } catch (e: any) { return { error: e.message } }
}

export async function getRegionalSettings(): Promise<{ data: RegionalSettings[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("regional_settings").select("*").order("country_code")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function upsertRegionalSettings(data: Partial<RegionalSettings>): Promise<{ data: RegionalSettings } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: settings, error } = await admin.from("regional_settings").upsert(data, { onConflict: "organization_id" }).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/localization")
    return { data: settings }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// FORMATS (Currency, Date, Time, Number)
// ============================================================

export async function getCurrencyFormats(): Promise<{ data: CurrencyFormat[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("currency_formats").select("*").order("currency_code")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function getDateFormats(): Promise<{ data: DateFormat[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("date_formats").select("*").order("format_code")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function getTimeFormats(): Promise<{ data: TimeFormat[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("time_formats").select("*").order("format_code")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function getNumberFormats(): Promise<{ data: NumberFormat[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("number_formats").select("*").order("format_code")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function getTimezones(): Promise<{ data: TimezoneSetting[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("timezone_settings").select("*").order("timezone_name")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// USER LANGUAGE PREFERENCES
// ============================================================

export async function getUserLanguagePreferences(): Promise<{ data: UserLanguagePreference[] } | { error: string }> {
  try {
    const auth = await getAuth()
    if (!auth) return { error: "Not authenticated" }
    const admin = createAdminClient()
    const { data } = await admin.from("user_language_preferences").select("*, languages(name, code, native_name, flag_emoji, direction)").eq("user_id", auth.id)
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function setUserLanguagePreference(languageId: string, isPrimary = false): Promise<{ data: UserLanguagePreference } | { error: string }> {
  try {
    const auth = await getAuth()
    if (!auth) return { error: "Not authenticated" }
    const admin = createAdminClient()
    if (isPrimary) {
      await admin.from("user_language_preferences").update({ is_primary: false }).eq("user_id", auth.id)
    }
    const { data: existing } = await admin.from("user_language_preferences").select("id").eq("user_id", auth.id).eq("language_id", languageId).maybeSingle()
    let result
    if (existing) {
      const { data } = await admin.from("user_language_preferences").update({ is_primary: isPrimary }).eq("id", existing.id).select().single()
      result = data
    } else {
      const { data } = await admin.from("user_language_preferences").insert({ user_id: auth.id, language_id: languageId, is_primary: isPrimary }).select().single()
      result = data
    }
    if (!result) return { error: "Failed to set preference" }
    revalidatePath("/dashboard/platform/localization")
    return { data: result }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// ACCESSIBILITY
// ============================================================

export async function getAccessibilityProfiles(): Promise<{ data: AccessibilityProfile[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("accessibility_profiles").select("*").order("profile_name")
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function createAccessibilityProfile(data: Partial<AccessibilityProfile>): Promise<{ data: AccessibilityProfile } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data: profile, error } = await admin.from("accessibility_profiles").insert(data).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/localization")
    return { data: profile }
  } catch (e: any) { return { error: e.message } }
}

export async function getAccessibilityPreferences(): Promise<{ data: AccessibilityPreference } | { error: string }> {
  try {
    const auth = await getAuth()
    if (!auth) return { error: "Not authenticated" }
    const admin = createAdminClient()
    const { data } = await admin.from("accessibility_preferences").select("*").eq("user_id", auth.id).maybeSingle()
    return { data: data ?? null as any }
  } catch (e: any) { return { error: e.message } }
}

export async function upsertAccessibilityPreferences(data: Partial<AccessibilityPreference>): Promise<{ data: AccessibilityPreference } | { error: string }> {
  try {
    const auth = await getAuth()
    if (!auth) return { error: "Not authenticated" }
    const admin = createAdminClient()
    const { data: prefs, error } = await admin.from("accessibility_preferences").upsert({ ...data, user_id: auth.id }, { onConflict: "user_id" }).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/localization")
    return { data: prefs }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// TEXT TO SPEECH
// ============================================================

export async function getTtsSettings(): Promise<{ data: TextToSpeechSettings } | { error: string }> {
  try {
    const auth = await getAuth()
    if (!auth) return { error: "Not authenticated" }
    const admin = createAdminClient()
    const { data } = await admin.from("text_to_speech_settings").select("*").eq("user_id", auth.id).maybeSingle()
    return { data: data ?? null as any }
  } catch (e: any) { return { error: e.message } }
}

export async function upsertTtsSettings(data: Partial<TextToSpeechSettings>): Promise<{ data: TextToSpeechSettings } | { error: string }> {
  try {
    const auth = await getAuth()
    if (!auth) return { error: "Not authenticated" }
    const admin = createAdminClient()
    const { data: settings, error } = await admin.from("text_to_speech_settings").upsert({ ...data, user_id: auth.id }, { onConflict: "user_id" }).select().single()
    if (error) return { error: error.message }
    revalidatePath("/dashboard/platform/localization")
    return { data: settings }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// IMPORTS
// ============================================================

export async function getTranslationImports(): Promise<{ data: TranslationImport[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("translation_imports").select("*, languages(name, code)").order("created_at", { ascending: false }).limit(50)
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

export async function getTranslationExports(): Promise<{ data: TranslationExport[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("translation_exports").select("*, languages(name, code), language_packs(pack_name)").order("created_at", { ascending: false }).limit(50)
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}

// ============================================================
// TENANT LOCALIZATION
// ============================================================

export async function getTenantLocalizations(): Promise<{ data: TenantLocalization[] } | { error: string }> {
  try {
    const auth = await checkSuperAdmin()
    if (!auth.allowed) return { error: auth.error }
    const admin = createAdminClient()
    const { data } = await admin.from("tenant_localization").select("*, languages(name, code), organizations(name)").order("created_at", { ascending: false })
    return { data: data ?? [] }
  } catch (e: any) { return { error: e.message } }
}
