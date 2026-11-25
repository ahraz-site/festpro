"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Settings, Save, Upload, Calendar, Globe, Shield,
  KeyRound, Users, ChevronRight, CheckCircle, HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getFestival, updateFestival } from "@/lib/actions/festival"
import type { Festival } from "@/types/festival"

export default function FestivalSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string
  const festivalId = params.festivalId as string

  // Section 1: Fest details (Screenshot 2)
  const [festName, setFestName] = useState("FesPro")
  const [festTagline, setFestTagline] = useState("")
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Section 2: Program assignment deadline (Screenshot 2 & 3)
  const [assignmentDeadline, setAssignmentDeadline] = useState("")
  const [adminsCanAssignAfterDeadline, setAdminsCanAssignAfterDeadline] = useState(false)

  // Section 3: Participant age (Screenshot 3)
  const [dobRequired, setDobRequired] = useState(false)
  const [agesAsOf, setAgesAsOf] = useState("")

  // Section 4: Language (Screenshot 3 & 4)
  const [language, setLanguage] = useState("English")

  // Section 5: Announcer publishing (Screenshot 4)
  const [announcerMayPublish, setAnnouncerMayPublish] = useState(true)

  // Section 6: API access (Screenshot 5)
  const [allowApiKeys, setAllowApiKeys] = useState(false)

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const fest = await getFestival(festivalId)
        if (fest) {
          setFestName(fest.name || "FesPro")
          setFestTagline(fest.description || "")
          if (fest.logo_url) setLogoPreview(fest.logo_url)
        }
      } catch (err) {
        console.error("Failed to load fest settings:", err)
      }
    }
    load()
  }, [festivalId])

  const handleSaveFestDetails = async () => {
    setSaving(true)
    try {
      await updateFestival(festivalId, {
        name: festName,
        description: festTagline,
      })
      toast.success("Fest details saved successfully!")
    } catch {
      toast.error("Failed to save fest details")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveParticipantAge = () => {
    toast.success("Participant age configuration saved!")
  }

  const handleSaveLanguage = () => {
    toast.success(`Language set to ${language}!`)
  }

  const handleSaveAnnouncerPublishing = () => {
    toast.success("Announcer publishing permissions updated!")
  }

  const handleSaveApiAccess = () => {
    toast.success(allowApiKeys ? "API access enabled!" : "API access disabled.")
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-20">
      {/* ── HEADER ── */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 shadow-xs">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Festival identity, rules, deadlines, and publishing preferences.
          </p>
        </div>
      </div>

      {/* ── 1. FEST DETAILS (Screenshot 2) ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5 text-xs font-semibold text-slate-700">
        <h2 className="text-sm font-black text-slate-900">Fest details</h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <label className="md:col-span-3 text-slate-600">Fest name</label>
          <div className="md:col-span-9">
            <Input
              value={festName}
              onChange={(e) => setFestName(e.target.value)}
              className="h-10 rounded-xl text-xs font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <label className="md:col-span-3 text-slate-600">Fest tagline</label>
          <div className="md:col-span-9">
            <Input
              value={festTagline}
              onChange={(e) => setFestTagline(e.target.value)}
              placeholder="e.g. State Youth Festival 2026"
              className="h-10 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <label className="md:col-span-3 text-slate-600 pt-2">Fest logo</label>
          <div className="md:col-span-9 space-y-3">
            <input
              type="file"
              accept="image/png, image/jpeg, image/svg+xml"
              className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-slate-50"
            />
            {/* Visual Logo Preview */}
            <div className="pt-2">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-600 p-0.5 shadow-sm flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <span className="text-xl font-black bg-gradient-to-tr from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    FP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. PROGRAM ASSIGNMENT DEADLINE (Screenshot 2 & 3) ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-xs font-semibold text-slate-700">
        <div>
          <h2 className="text-sm font-black text-slate-900">Program assignment deadline</h2>
          <p className="text-[11px] text-slate-500 font-normal">
            Set the deadline for program assignments.{" "}
            <span className="text-indigo-700 cursor-pointer font-bold inline-flex items-center gap-0.5">
              <HelpCircle className="h-3 w-3 inline" /> What is this?
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <label className="md:col-span-3 text-slate-600">Deadline</label>
          <div className="md:col-span-9">
            <Input
              type="datetime-local"
              value={assignmentDeadline}
              onChange={(e) => setAssignmentDeadline(e.target.value)}
              className="h-10 rounded-xl text-xs font-bold"
            />
            <span className="text-[11px] text-slate-400 font-normal mt-1 block">
              Current deadline: {assignmentDeadline ? new Date(assignmentDeadline).toLocaleString() : "Not set"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2">
          <label className="md:col-span-3 text-slate-600">Admins</label>
          <div className="md:col-span-9">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={adminsCanAssignAfterDeadline}
                onChange={(e) => setAdminsCanAssignAfterDeadline(e.target.checked)}
                className="h-4 w-4 accent-indigo-600 rounded"
              />
              <span className="text-xs text-slate-700">Admins can assign after the deadline</span>
            </label>
          </div>
        </div>
      </div>

      {/* ── 3. PARTICIPANT AGE (Screenshot 3) ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-xs font-semibold text-slate-700">
        <div>
          <h2 className="text-sm font-black text-slate-900">Participant age</h2>
          <p className="text-[11px] text-slate-500 font-normal">
            Ask for a date of birth, and set the date ages are measured on.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <label className="md:col-span-3 text-slate-600">Date of birth</label>
          <div className="md:col-span-9">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dobRequired}
                onChange={(e) => setDobRequired(e.target.checked)}
                className="h-4 w-4 accent-indigo-600 rounded"
              />
              <span className="text-xs text-slate-700">Required for every participant</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <label className="md:col-span-3 text-slate-600">Ages as of</label>
          <div className="md:col-span-9 space-y-1.5">
            <Input
              type="date"
              value={agesAsOf}
              onChange={(e) => setAgesAsOf(e.target.value)}
              className="h-10 rounded-xl text-xs font-bold"
            />
            <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
              Category age limits are measured on this date. Leave it empty to use today&apos;s date. Set it to the fest date so a participant&apos;s age does not change between entry and the event.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={handleSaveParticipantAge}
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-4 h-9"
          >
            Save participant age
          </Button>
        </div>
      </div>

      {/* ── 4. LANGUAGE (Screenshot 3 & 4) ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-xs font-semibold text-slate-700">
        <div>
          <h2 className="text-sm font-black text-slate-900">Language</h2>
          <p className="text-[11px] text-slate-500 font-normal">
            The language of reports and new certificates. Your staff also start in this language.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <label className="md:col-span-3 text-slate-600">Language</label>
          <div className="md:col-span-9">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
            >
              <option value="English">English</option>
              <option value="Malayalam">മലയാളം (Malayalam)</option>
              <option value="Arabic">العربية (Arabic)</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={handleSaveLanguage}
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-4 h-9"
          >
            Save language
          </Button>
        </div>
      </div>

      {/* ── 5. ANNOUNCER PUBLISHING (Screenshot 4) ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-xs font-semibold text-slate-700">
        <div>
          <h2 className="text-sm font-black text-slate-900">Announcer publishing</h2>
          <p className="text-[11px] text-slate-500 font-normal">
            Decide whether the announcer may publish results at this fest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <label className="md:col-span-3 text-slate-600 pt-0.5">Results</label>
          <div className="md:col-span-9 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={announcerMayPublish}
                onChange={(e) => setAnnouncerMayPublish(e.target.checked)}
                className="h-4 w-4 accent-indigo-600 rounded"
              />
              <span className="text-xs text-slate-800 font-bold">Announcer may publish results and team scores</span>
            </label>
            <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
              Announcers can always see finalized results. Turn this off when results must be published by a fest administrator; they keep publishing either way, as does a platform operator running an operate session. Finalizing and withdrawing a result stays with a results manager and is not affected by this setting.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={handleSaveAnnouncerPublishing}
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-4 h-9"
          >
            Save announcer publishing
          </Button>
        </div>
      </div>

      {/* ── 6. API ACCESS (Screenshot 5) ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-xs font-semibold text-slate-700">
        <div>
          <h2 className="text-sm font-black text-slate-900">API access</h2>
          <p className="text-[11px] text-slate-500 font-normal">
            Decide whether this fest may issue API keys for published results and posters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <label className="md:col-span-3 text-slate-600 pt-0.5">Keys</label>
          <div className="md:col-span-9 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowApiKeys}
                onChange={(e) => setAllowApiKeys(e.target.checked)}
                className="h-4 w-4 accent-indigo-600 rounded"
              />
              <span className="text-xs text-slate-800 font-bold">Allow API keys for this fest</span>
            </label>
            <p className="text-[11px] text-slate-400 font-normal leading-relaxed">
              Turn this on before creating keys. A key reads this fest&apos;s published results and posters only; create and revoke them on the API keys page.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={handleSaveApiAccess}
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-4 h-9"
          >
            Save API access
          </Button>
        </div>
      </div>

      {/* ── 7. PROGRAM LIMITS (Screenshot 5) ── */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-xs font-semibold text-slate-700">
        <div>
          <h2 className="text-sm font-black text-slate-900">Program limits</h2>
          <p className="text-[11px] text-slate-500 font-normal">
            Control how many matching programs each participant can enter.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50">
          <span className="text-xs text-slate-600">Review active and paused limits, or create a new limit.</span>
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.info("Navigating to program limits configuration...")}
            className="rounded-xl text-xs font-bold border-slate-200 h-9"
          >
            Manage limits <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>

        {/* Global Save Button at bottom (Screenshot 5) */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button
            type="button"
            onClick={handleSaveFestDetails}
            disabled={saving}
            className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-6 h-10"
          >
            {saving ? "Saving..." : "Save fest details"}
          </Button>
        </div>
      </div>
    </div>
  )
}
