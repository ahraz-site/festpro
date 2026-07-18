"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { toast } from "sonner"
import { submitRegistration } from "@/lib/actions/public"
import { Loader2, Users, CheckCircle, ArrowRight } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ token: string; regNumber: string } | null>(null)
  const [form, setForm] = useState({
    registration_type: "individual", first_name: "", last_name: "", email: "", phone: "",
    date_of_birth: "", gender: "", address: "", city: "", state: "", country: "",
    institution_name: "", grade: "", team_name: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.first_name || !form.last_name || !form.email) { toast.error("Required fields missing"); return }
    setLoading(true)
    const res = await submitRegistration({ festival_id: "00000000-0000-0000-0000-000000000000", ...form })
    setLoading(false)
    if (res.error) toast.error(res.error)
    else if (res.tracking_token) setSuccess({ token: res.tracking_token, regNumber: res.registration_number || "" })
  }

  if (success) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Submitted!</h1>
      <p className="text-gray-500 mb-6">Your registration has been received.</p>
      <div className="p-6 rounded-xl bg-green-50 border border-green-200 mb-8">
        <p className="text-sm text-gray-600 mb-2">Registration Number: <span className="font-bold text-gray-900">{success.regNumber}</span></p>
        <p className="text-sm text-gray-600">Tracking Token: <span className="font-mono text-indigo-600">{success.token}</span></p>
        <p className="text-xs text-gray-400 mt-2">Save your tracking token to check status.</p>
      </div>
      <div className="flex justify-center gap-3">
        <Button onClick={() => router.push("/register/track")}>Track Status</Button>
        <Button variant="outline" onClick={() => router.push("/")}>Home</Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Online Registration</h1>
        <p className="text-gray-500 mt-2">Register for competitions as an individual or team.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 space-y-4">
          <h2 className="font-semibold text-gray-900">Registration Type</h2>
          <div className="flex gap-4">
            {["individual", "team"].map(t => (
              <label key={t} className={`flex-1 p-4 rounded-lg border-2 cursor-pointer text-center transition-all ${form.registration_type === t ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}>
                <input type="radio" name="type" value={t} checked={form.registration_type === t} onChange={e => setForm(f => ({ ...f, registration_type: e.target.value }))} className="sr-only" />
                <Users className={`h-6 w-6 mx-auto mb-1 ${form.registration_type === t ? "text-indigo-600" : "text-gray-400"}`} />
                <p className={`text-sm font-medium ${form.registration_type === t ? "text-indigo-600" : "text-gray-600"}`}>{t === "individual" ? "Individual" : "Team"}</p>
              </label>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 space-y-4">
          <h2 className="font-semibold text-gray-900">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="First Name *" required />
            <Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Last Name *" required />
            <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email *" required />
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" />
            <Input type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} placeholder="Date of Birth" />
            <Select options={[{ value: "", label: "Gender" }, { value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Other" }]} value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} />
          </div>
        </div>

        <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 space-y-4">
          <h2 className="font-semibold text-gray-900">Institution</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input value={form.institution_name} onChange={e => setForm(f => ({ ...f, institution_name: e.target.value }))} placeholder="Institution / School Name" />
            <Input value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} placeholder="Grade / Class" />
          </div>
          {form.registration_type === "team" && (
            <Input value={form.team_name} onChange={e => setForm(f => ({ ...f, team_name: e.target.value }))} placeholder="Team Name" />
          )}
        </div>

        <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 space-y-4">
          <h2 className="font-semibold text-gray-900">Address</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Address" className="md:col-span-2" />
            <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="City" />
            <Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="State" />
            <Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="Country" />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Submit Registration
        </Button>
      </form>
    </div>
  )
}
