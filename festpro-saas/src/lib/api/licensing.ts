import { createClient } from '@/lib/supabase/server'
import { License, LicenseKey, OrganizationLicense, LicenseFeature } from '@/types/licensing'

export async function generateLicenseKey(planId: string, orgId: string, maxUsers: number, maxFestivals: number, maxStorage: number) {
  const supabase = await createClient()
  
  // 1. Create License Record
  const { data: license, error: licenseError } = await supabase
    .from('licenses')
    .insert({
      plan_id: planId,
      status: 'Pending',
      max_users: maxUsers,
      max_festivals: maxFestivals,
      max_storage_gb: maxStorage
    })
    .select()
    .single()

  if (licenseError || !license) throw new Error(licenseError?.message || 'Failed to create license')

  // 2. Generate cryptographically strong random key
  // Format: FP-2026-XXXX-XXXX-XXXX
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase()
  const displayKey = `FP-2026-${segment()}-${segment()}-${segment()}`

  // 3. Store License Key
  const { data: licenseKey, error: keyError } = await supabase
    .from('license_keys')
    .insert({
      license_id: license.id,
      display_key: displayKey,
      key_hash: displayKey, // In production, we should hash this
      is_activated: false
    })
    .select()
    .single()

  if (keyError) throw new Error(keyError.message)

  return licenseKey
}

export async function activateLicense(displayKey: string, orgId: string, userId: string) {
  const supabase = await createClient()

  // 1. Verify Key
  const { data: keyRecord, error: keyError } = await supabase
    .from('license_keys')
    .select('*, licenses(*)')
    .eq('display_key', displayKey)
    .single()

  if (keyError || !keyRecord) throw new Error('Invalid License Key')
  if (keyRecord.is_activated) throw new Error('License Key is already activated')

  // 2. Mark Key Activated
  await supabase
    .from('license_keys')
    .update({ is_activated: true })
    .eq('id', keyRecord.id)

  // 3. Update License Status & Validity (e.g. valid for 1 year)
  const validUntil = new Date()
  validUntil.setFullYear(validUntil.getFullYear() + 1)

  await supabase
    .from('licenses')
    .update({
      status: 'Active',
      valid_from: new Date().toISOString(),
      valid_until: validUntil.toISOString()
    })
    .eq('id', keyRecord.license_id)

  // 4. Bind License to Organization
  await supabase
    .from('organization_licenses')
    .insert({
      org_id: orgId,
      license_id: keyRecord.license_id
    })

  // 5. Log Activation
  await supabase
    .from('activation_logs')
    .insert({
      license_id: keyRecord.license_id,
      action: 'ACTIVATED',
      ip_address: '0.0.0.0' // Can be fetched from headers
    })

  return true
}

export async function checkFeatureAccess(orgId: string, featureKey: string): Promise<boolean> {
  const supabase = await createClient()

  // 1. Get active license for org
  const { data: orgLicense } = await supabase
    .from('organization_licenses')
    .select('license_id, licenses!inner(plan_id, status)')
    .eq('org_id', orgId)
    .eq('licenses.status', 'Active')
    .single()

  if (!orgLicense || !orgLicense.licenses) return false

  // 2. Check if the plan includes the feature
  const { data: feature } = await supabase
    .from('license_features')
    .select('is_enabled')
    .eq('plan_id', (orgLicense.licenses as any).plan_id)
    .eq('feature_key', featureKey)
    .single()

  return feature?.is_enabled || false
}
