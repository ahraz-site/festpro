"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getVehicles, createVehicle, deleteVehicle, getVehicleCategories, createFuelLog, getVehicleMaintenance, createVehicleMaintenance, completeVehicleMaintenance } from "@/lib/actions/accommodation-transport"
import { VEHICLE_STATUSES, FUEL_TYPES, MAINTENANCE_TYPES, VEHICLE_MAINTENANCE_STATUSES } from "@/config/accommodation-transport"
import { Loader2, Truck, Plus, Search, Pencil, Trash2, Fuel, Wrench, CheckCircle } from "lucide-react"

export default function VehiclesPage() {
  const params = useParams()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string
  const [vehicles, setVehicles] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<"list" | "fuel" | "maintenance">("list")
  const [fuelVehId, setFuelVehId] = useState("")
  const [fuelQty, setFuelQty] = useState("")
  const [fuelCost, setFuelCost] = useState("")
  const [maintVehId, setMaintVehId] = useState("")
  const [maintTitle, setMaintTitle] = useState("")
  const [maintType, setMaintType] = useState("routine")
  const [maintCost, setMaintCost] = useState("")
  const [maintScheduled, setMaintScheduled] = useState("")
  const [maintenanceRecs, setMaintenanceRecs] = useState<any[]>([])

  const [form, setForm] = useState({ vehicle_number: "", registration_number: "", make: "", model: "", year: "", color: "", seating_capacity: "1", fuel_type: "diesel", ownership_type: "owned", insurance_expiry: "", fitness_expiry: "", category_id: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const [v, c] = await Promise.all([getVehicles(festivalId, statusFilter || undefined), getVehicleCategories()])
    setVehicles(v.data || []); setCategories(c.data || []); setLoading(false)
  }, [festivalId, statusFilter])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    await createVehicle({ ...form, festival_id: festivalId, year: form.year ? Number(form.year) : null, seating_capacity: Number(form.seating_capacity) })
    setForm({ vehicle_number: "", registration_number: "", make: "", model: "", year: "", color: "", seating_capacity: "1", fuel_type: "diesel", ownership_type: "owned", insurance_expiry: "", fitness_expiry: "", category_id: "" })
    setShowForm(false); load()
  }

  const handleDelete = async (id: string) => {
    await deleteVehicle(id); load()
  }

  const handleFuelLog = async () => {
    if (!fuelVehId || !fuelQty || !fuelCost) return
    await createFuelLog({ festival_id: festivalId, vehicle_id: fuelVehId, quantity_liters: Number(fuelQty), cost_per_liter: Number(fuelCost) })
    setFuelVehId(""); setFuelQty(""); setFuelCost("")
  }

  const handleMaintCreate = async () => {
    if (!maintVehId || !maintTitle) return
    await createVehicleMaintenance({ festival_id: festivalId, vehicle_id: maintVehId, title: maintTitle, maintenance_type: maintType, cost: maintCost ? Number(maintCost) : 0, scheduled_date: maintScheduled || null })
    setMaintVehId(""); setMaintTitle(""); setMaintType("routine"); setMaintCost(""); setMaintScheduled("")
    loadMaint()
  }

  const handleCompleteMaint = async (id: string) => {
    await completeVehicleMaintenance(id); loadMaint()
  }

  const loadMaint = async () => {
    const res = await getVehicleMaintenance(festivalId)
    setMaintenanceRecs(res.data || [])
  }

  const getStatusBadge = (s: string) => {
    const st = VEHICLE_STATUSES.find(x => x.value === s)
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${st?.color || "bg-gray-100 text-gray-600"}`}>{st?.label || s}</span>
  }

  const tabClass = (t: string) => `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t ? "bg-indigo-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Vehicles</h1><p className="text-sm text-gray-500 mt-1">Manage fleet vehicles, fuel logs and maintenance.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "Add Vehicle"}</Button>
      </div>

      <div className="flex gap-2">
        <button className={tabClass("list")} onClick={() => setActiveTab("list")}><Truck className="h-4 w-4 inline mr-1" /> Vehicles</button>
        <button className={tabClass("fuel")} onClick={() => setActiveTab("fuel")}><Fuel className="h-4 w-4 inline mr-1" /> Fuel Log</button>
        <button className={tabClass("maintenance")} onClick={() => { setActiveTab("maintenance"); loadMaint() }}><Wrench className="h-4 w-4 inline mr-1" /> Maintenance</button>
      </div>

      {activeTab === "list" && (
        <>
          {showForm && (
            <Card><CardHeader><CardTitle>Add Vehicle</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="text-sm font-medium">Vehicle # *</label><Input value={form.vehicle_number} onChange={e => setForm({...form, vehicle_number: e.target.value})} /></div>
              <div><label className="text-sm font-medium">Registration # *</label><Input value={form.registration_number} onChange={e => setForm({...form, registration_number: e.target.value})} /></div>
              <div><label className="text-sm font-medium">Category</label>
                <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
                  <option value="">Select...</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium">Make</label><Input value={form.make} onChange={e => setForm({...form, make: e.target.value})} /></div>
              <div><label className="text-sm font-medium">Model</label><Input value={form.model} onChange={e => setForm({...form, model: e.target.value})} /></div>
              <div><label className="text-sm font-medium">Year</label><Input type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} /></div>
              <div><label className="text-sm font-medium">Color</label><Input value={form.color} onChange={e => setForm({...form, color: e.target.value})} /></div>
              <div><label className="text-sm font-medium">Seating Capacity</label><Input type="number" value={form.seating_capacity} onChange={e => setForm({...form, seating_capacity: e.target.value})} /></div>
              <div><label className="text-sm font-medium">Fuel Type</label>
                <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.fuel_type} onChange={e => setForm({...form, fuel_type: e.target.value})}>
                  {FUEL_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium">Insurance Expiry</label><Input type="date" value={form.insurance_expiry} onChange={e => setForm({...form, insurance_expiry: e.target.value})} /></div>
              <div><label className="text-sm font-medium">Fitness Expiry</label><Input type="date" value={form.fitness_expiry} onChange={e => setForm({...form, fitness_expiry: e.target.value})} /></div>
              <div className="md:col-span-3 flex gap-2 pt-2">
                <Button onClick={handleCreate}>Add Vehicle</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent></Card>
          )}

          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} /></div>
            <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {VEHICLE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="px-4 py-3">Vehicle #</th><th className="px-4 py-3">Reg #</th><th className="px-4 py-3">Make/Model</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Capacity</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Insurance</th><th className="px-4 py-3 text-right">Actions</th>
          </tr></thead><tbody className="divide-y divide-gray-100">
            {vehicles.filter(v => !search || v.vehicle_number.toLowerCase().includes(search.toLowerCase()) || v.registration_number.toLowerCase().includes(search.toLowerCase())).map((v: any) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono">{v.vehicle_number}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{v.registration_number}</td>
                <td className="px-4 py-3 text-sm">{v.make} {v.model}</td>
                <td className="px-4 py-3 text-sm">{v.vehicle_categories?.name || "—"}</td>
                <td className="px-4 py-3 text-sm">{v.seating_capacity}</td>
                <td className="px-4 py-3">{getStatusBadge(v.status)}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{v.insurance_expiry ? new Date(v.insurance_expiry).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div></td>
              </tr>
            ))}
          </tbody></table></CardContent></Card>
        </>
      )}

      {activeTab === "fuel" && (
        <Card><CardHeader><CardTitle>Log Fuel</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-sm font-medium">Vehicle *</label>
              <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={fuelVehId} onChange={e => setFuelVehId(e.target.value)}>
                <option value="">Select vehicle...</option>
                {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.vehicle_number}</option>)}
              </select>
            </div>
            <div><label className="text-sm font-medium">Quantity (L) *</label><Input type="number" step="0.01" value={fuelQty} onChange={e => setFuelQty(e.target.value)} /></div>
            <div><label className="text-sm font-medium">Cost per Liter *</label><Input type="number" step="0.01" value={fuelCost} onChange={e => setFuelCost(e.target.value)} /></div>
          </div>
          <Button onClick={handleFuelLog}><Fuel className="h-4 w-4 mr-1" /> Log Fuel</Button>
        </CardContent></Card>
      )}

      {activeTab === "maintenance" && (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle>Schedule Maintenance</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="text-sm font-medium">Vehicle *</label>
              <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={maintVehId} onChange={e => setMaintVehId(e.target.value)}>
                <option value="">Select vehicle...</option>
                {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.vehicle_number}</option>)}
              </select>
            </div>
            <div><label className="text-sm font-medium">Title *</label><Input value={maintTitle} onChange={e => setMaintTitle(e.target.value)} /></div>
            <div><label className="text-sm font-medium">Type</label>
              <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={maintType} onChange={e => setMaintType(e.target.value)}>
                {MAINTENANCE_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div><label className="text-sm font-medium">Scheduled Date</label><Input type="date" value={maintScheduled} onChange={e => setMaintScheduled(e.target.value)} /></div>
            <div><label className="text-sm font-medium">Estimated Cost</label><Input type="number" value={maintCost} onChange={e => setMaintCost(e.target.value)} /></div>
            <div className="flex items-end"><Button onClick={handleMaintCreate}><Wrench className="h-4 w-4 mr-1" /> Schedule</Button></div>
          </CardContent></Card>

          <Card><CardContent className="p-0"><table className="w-full"><thead><tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Scheduled</th><th className="px-4 py-3">Cost</th><th className="px-4 py-3 text-right">Actions</th>
          </tr></thead><tbody className="divide-y divide-gray-100">
            {maintenanceRecs.map((m: any) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{m.vehicles?.vehicle_number || "—"}</td>
                <td className="px-4 py-3 text-sm font-medium">{m.title}</td>
                <td className="px-4 py-3 text-sm">{MAINTENANCE_TYPES.find(x => x.value === m.maintenance_type)?.label || m.maintenance_type}</td>
                <td className="px-4 py-3">{VEHICLE_MAINTENANCE_STATUSES.find(x => x.value === m.status)?.label || m.status}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{m.scheduled_date ? new Date(m.scheduled_date).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3 text-sm">${(m.cost || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  {m.status !== "completed" && <Button size="sm" variant="ghost" onClick={() => handleCompleteMaint(m.id)}><CheckCircle className="h-4 w-4 text-green-500" /></Button>}
                </td>
              </tr>
            ))}
          </tbody></table></CardContent></Card>
        </div>
      )}
    </div>
  )
}
