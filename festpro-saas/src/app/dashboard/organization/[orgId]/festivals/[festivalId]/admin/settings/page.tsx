"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { getSystemSettings, updateSystemSetting, getMaintenanceMode, toggleMaintenanceMode } from "@/lib/actions/security"
import { SYSTEM_SETTING_GROUPS } from "@/config/security"
import type { SystemSetting, MaintenanceMode } from "@/types/security"
import { Loader2, Settings as SettingsIcon, Save, Wrench, WrenchOff } from "lucide-react"

export default function AdminSettingsPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [maintenance, setMaintenance] = useState<MaintenanceMode | null>(null)
  const [loading, setLoading] = useState(true)
  const [groupFilter, setGroupFilter] = useState("")
  const [editValues, setEditValues] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    const [sRes, mRes] = await Promise.all([
      getSystemSettings(groupFilter || undefined),
      getMaintenanceMode(),
    ])
    setSettings(sRes.data || []); setMaintenance(mRes.data || null); setLoading(false)
    const values: Record<string, string> = {}
    ;(sRes.data || []).forEach(s => { values[s.id] = typeof s.setting_value === "string" ? s.setting_value : JSON.stringify(s.setting_value) })
    setEditValues(values)
  }, [groupFilter])

  useEffect(() => { load() }, [load])

  const handleSave = async (setting: SystemSetting) => {
    const val = editValues[setting.id]
    let parsed: any = val
    if (val === "true") parsed = true
    else if (val === "false") parsed = false
    else if (!isNaN(Number(val))) parsed = Number(val)
    await updateSystemSetting(setting.id, parsed)
    toast.success("Saved")
  }

  const handleToggleMaintenance = async () => {
    await toggleMaintenanceMode({
      organization_id: orgId, is_active: !maintenance?.is_active,
      message: maintenance?.message || "System is under maintenance.",
    })
    toast.success(maintenance?.is_active ? "Maintenance ended" : "Maintenance mode enabled"); load()
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  const grouped = settings.reduce((acc: Record<string, SystemSetting[]>, s) => {
    if (!acc[s.setting_group]) acc[s.setting_group] = []
    acc[s.setting_group].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500 mt-1">{settings.length} settings</p>
        </div>
        <Button variant={maintenance?.is_active ? "danger" : "outline"} onClick={handleToggleMaintenance}>
          {maintenance?.is_active ? <WrenchOff className="h-4 w-4 mr-1" /> : <Wrench className="h-4 w-4 mr-1" />}
          {maintenance?.is_active ? "End Maintenance" : "Maintenance Mode"}
        </Button>
      </div>

      {maintenance?.is_active && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="pt-4 flex items-center gap-3">
            <Wrench className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">Maintenance Mode Active</p>
              <p className="text-sm text-amber-700">{maintenance.message || "System is under maintenance."}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          <Select options={[{ value: "", label: "All Groups" }, ...SYSTEM_SETTING_GROUPS.map(g => ({ value: g.value, label: g.label }))]} value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="w-44" />
        </CardContent>
      </Card>

      {Object.entries(grouped).length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">
          <SettingsIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p>No settings found</p>
        </CardContent></Card>
      ) : Object.entries(grouped).map(([group, groupSettings]) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle className="text-lg capitalize">{group} Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupSettings.map(s => (
              <div key={s.id} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-sm capitalize">{s.setting_key.replace(/_/g, " ")}</p>
                  {s.description && <p className="text-xs text-gray-400">{s.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {typeof s.setting_value === "boolean" ? (
                    <input type="checkbox" checked={editValues[s.id] === "true"} onChange={e => setEditValues(v => ({ ...v, [s.id]: String(e.target.checked) }))} />
                  ) : (
                    <Input value={editValues[s.id] || ""} onChange={e => setEditValues(v => ({ ...v, [s.id]: e.target.value }))} className="w-48" />
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleSave(s)}>
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
