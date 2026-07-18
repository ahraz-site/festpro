"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getVendors, createVendor, deleteVendor } from "@/lib/actions/inventory"
import type { Vendor } from "@/types/inventory"
import { Loader2, Truck, Plus, Search, Pencil, Trash2, Building2, Phone, Mail } from "lucide-react"

export default function VendorsPage() {
  const { orgId, festivalId } = useParams<{ orgId: string; festivalId: string }>()

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gst_number: "",
    pan_number: "",
    payment_terms: "",
    credit_limit: 0,
    lead_time_days: 0,
  })

  const loadVendors = async () => {
    setLoading(true)
    try {
      const res = await getVendors(festivalId)
      setVendors(res.data || [])
    } catch {
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVendors()
  }, [orgId, festivalId])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    await createVendor({ ...form, festival_id: festivalId })
    setShowForm(false)
    setForm({
      company_name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      gst_number: "",
      pan_number: "",
      payment_terms: "",
      credit_limit: 0,
      lead_time_days: 0,
    })
    loadVendors()
  }

  const handleDelete = async (vendorId: string) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      await deleteVendor(vendorId)
      loadVendors()
    }
  }

  const filtered = vendors.filter(
    (v) =>
      v.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase()) ||
      v.phone?.toLowerCase().includes(search.toLowerCase()) ||
      v.city?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Vendors</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancel" : "New Vendor"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Vendor</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Person</label>
                <Input
                  value={form.contact_person}
                  onChange={(e) => setForm({ ...form, contact_person: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="md:col-span-3">
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">City</label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <Input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Pincode</label>
                <Input
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">GST Number</label>
                <Input
                  value={form.gst_number}
                  onChange={(e) => setForm({ ...form, gst_number: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">PAN Number</label>
                <Input
                  value={form.pan_number}
                  onChange={(e) => setForm({ ...form, pan_number: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Payment Terms</label>
                <Input
                  value={form.payment_terms}
                  onChange={(e) => setForm({ ...form, payment_terms: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Credit Limit</label>
                <Input
                  type="number"
                  value={form.credit_limit}
                  onChange={(e) => setForm({ ...form, credit_limit: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Lead Time (Days)</label>
                <Input
                  type="number"
                  value={form.lead_time_days}
                  onChange={(e) => setForm({ ...form, lead_time_days: Number(e.target.value) })}
                />
              </div>
              <div className="md:col-span-3 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Vendor</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-sm">Code</th>
                  <th className="text-left p-3 font-medium text-sm">Company</th>
                  <th className="text-left p-3 font-medium text-sm">Contact</th>
                  <th className="text-left p-3 font-medium text-sm">Email</th>
                  <th className="text-left p-3 font-medium text-sm">Phone</th>
                  <th className="text-left p-3 font-medium text-sm">City</th>
                  <th className="text-left p-3 font-medium text-sm">Active</th>
                  <th className="text-left p-3 font-medium text-sm">Rating</th>
                  <th className="text-right p-3 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-muted-foreground">
                      <Building2 className="h-8 w-8 mx-auto mb-2" />
                      No vendors found
                    </td>
                  </tr>
                ) : (
                  filtered.map((vendor) => (
                    <tr key={vendor.id} className="border-b last:border-b-0 hover:bg-muted/50">
                      <td className="p-3 text-sm">{vendor.vendor_code}</td>
                      <td className="p-3 text-sm font-medium">{vendor.company_name}</td>
                      <td className="p-3 text-sm">{vendor.contact_person}</td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {vendor.email}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {vendor.phone}
                        </div>
                      </td>
                      <td className="p-3 text-sm">{vendor.city}</td>
                      <td className="p-3 text-sm">{vendor.is_active ? "Yes" : "No"}</td>
                      <td className="p-3 text-sm">{vendor.rating ?? "-"}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/dashboard/organization/${orgId}/festivals/${festivalId}/inventory/vendors/${vendor.id}`}
                          >
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(vendor.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
