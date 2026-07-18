"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getMenus, createMenu, updateMenuStatus, deleteMenu, getMenuItems, createMenuItem, deleteMenuItem, getKitchens } from "@/lib/actions/food-catering"
import { MENU_STATUSES, DIET_TYPES } from "@/config/food-catering"
import { Loader2, ClipboardList, Plus, Search, Trash2, CheckCircle } from "lucide-react"

export default function MenusPage() {
  const params = useParams()
  const festivalId = params.festivalId as string
  const [menus, setMenus] = useState<any[]>([])
  const [kitchens, setKitchens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [form, setForm] = useState({ kitchen_id: "", menu_name: "", menu_date: "", category_id: "", notes: "" })
  const [itemForm, setItemForm] = useState({ item_name: "", description: "", diet_type: "", is_vegetarian: false, is_vegan: false, is_halal: false, calories: "", allergens: "", instructions: "" })

  const load = useCallback(async () => {
    setLoading(true)
    const [m, k] = await Promise.all([getMenus(festivalId), getKitchens(festivalId)])
    setMenus(m.data || []); setKitchens(k.data || []); setLoading(false)
  }, [festivalId])

  useEffect(() => { load() }, [load])

  const loadItems = async (menuId: string) => {
    setSelectedMenu(menuId)
    const res = await getMenuItems(menuId)
    setMenuItems(res.data || [])
  }

  const handleCreate = async () => {
    if (!form.menu_name) return
    await createMenu({ ...form, festival_id: festivalId })
    setForm({ kitchen_id: "", menu_name: "", menu_date: "", category_id: "", notes: "" })
    setShowForm(false); load()
  }

  const handleAddItem = async () => {
    if (!itemForm.item_name || !selectedMenu) return
    await createMenuItem({ ...itemForm, menu_id: selectedMenu, calories: itemForm.calories ? Number(itemForm.calories) : null })
    setItemForm({ item_name: "", description: "", diet_type: "", is_vegetarian: false, is_vegan: false, is_halal: false, calories: "", allergens: "", instructions: "" })
    loadItems(selectedMenu)
  }

  const handleStatus = async (id: string, status: string) => { await updateMenuStatus(id, status); load() }
  const handleDelete = async (id: string) => { await deleteMenu(id); load(); if (selectedMenu === id) setSelectedMenu(null) }

  if (loading) return <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Menus</h1><p className="text-sm text-gray-500 mt-1">Create and manage menus with items and recipes.</p></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-1" /> {showForm ? "Cancel" : "New Menu"}</Button>
      </div>

      {showForm && (
        <Card><CardHeader><CardTitle>Create Menu</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">Menu Name *</label><Input value={form.menu_name} onChange={e => setForm({...form, menu_name: e.target.value})} /></div>
          <div><label className="text-sm font-medium">Kitchen</label>
            <select className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.kitchen_id} onChange={e => setForm({...form, kitchen_id: e.target.value})}>
              <option value="">Select...</option>{kitchens.map((k: any) => <option key={k.id} value={k.id}>{k.kitchen_name}</option>)}
            </select></div>
          <div><label className="text-sm font-medium">Date</label><Input type="date" value={form.menu_date} onChange={e => setForm({...form, menu_date: e.target.value})} /></div>
          <div className="md:col-span-2 flex gap-2 pt-2"><Button onClick={handleCreate}>Create</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </CardContent></Card>
      )}

      <div className="relative max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input className="pl-10" placeholder="Search menus..." value={search} onChange={e => setSearch(e.target.value)} /></div>

      <div className="grid gap-4 lg:grid-cols-2">
        {menus.filter(m => !search || m.menu_name.toLowerCase().includes(search.toLowerCase())).map((m: any) => (
          <Card key={m.id} className={selectedMenu === m.id ? "ring-2 ring-indigo-500" : ""}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between cursor-pointer" onClick={() => loadItems(m.id)}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center"><ClipboardList className="h-5 w-5 text-indigo-600" /></div>
                  <div><p className="font-semibold">{m.menu_name}</p><p className="text-xs text-gray-500">{m.kitchens?.kitchen_name || "—"} · {m.menu_date ? new Date(m.menu_date).toLocaleDateString() : "—"}</p></div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${MENU_STATUSES.find(x => x.value === m.status)?.color || ""}`}>{MENU_STATUSES.find(x => x.value === m.status)?.label || m.status}</span>
              </div>
              <div className="flex gap-1 mt-3 pt-3 border-t">
                {m.status === "draft" && <Button size="sm" variant="outline" onClick={() => handleStatus(m.id, "published")}>Publish</Button>}
                {(m.status === "draft" || m.status === "published") && <Button size="sm" variant="ghost" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
              </div>

              {selectedMenu === m.id && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <p className="text-sm font-semibold">Menu Items</p>
                  {menuItems.length === 0 && <p className="text-sm text-gray-400">No items yet.</p>}
                  {menuItems.map((mi: any) => (
                    <div key={mi.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div><p className="text-sm font-medium">{mi.item_name}</p>
                        <p className="text-xs text-gray-500">{mi.calories ? `${mi.calories} cal` : ""}{mi.diet_type ? ` · ${DIET_TYPES.find(d => d.value === mi.diet_type)?.label || mi.diet_type}` : ""}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={async () => { await deleteMenuItem(mi.id); loadItems(m.id) }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Input placeholder="Item name" value={itemForm.item_name} onChange={e => setItemForm({...itemForm, item_name: e.target.value})} />
                    <Input placeholder="Calories" type="number" value={itemForm.calories} onChange={e => setItemForm({...itemForm, calories: e.target.value})} />
                    <select className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={itemForm.diet_type} onChange={e => setItemForm({...itemForm, diet_type: e.target.value})}>
                      <option value="">No diet</option>{DIET_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                    <Button size="sm" onClick={handleAddItem}>Add Item</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
