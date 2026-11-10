"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { createFestival } from "@/lib/actions/festival"
import { TIMEZONE_OPTIONS } from "@/config/festival"
import { COUNTRIES, INDIAN_STATES, DISTRICTS_BY_STATE } from "@/config/location-data"
import {
  COMPETITION_UNITS,
  CLASSIFICATION_OPTIONS,
  FESTIVAL_MODULES,
  DEFAULT_FESTIVAL_CONFIG,
  type CompetitionUnitType,
  type ClassificationType,
} from "@/config/festival-modules"
import type { FestivalWizardData, FestivalWizardGroup } from "@/types/festival"
import {
  Loader2,
  CalendarDays,
  Users,
  Layers,
  ShieldAlert,
  Boxes,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  CheckCircle2,
  Building2,
  MapPin,
  Clock,
  Palette,
  Flag,
} from "lucide-react"

const WIZARD_STEPS = [
  { step: 1, title: "Basic Details", desc: "Dates & venue", icon: CalendarDays },
  { step: 2, title: "Structure", desc: "Groups or Teams", icon: Users },
  { step: 3, title: "Classification", desc: "Zones / Categories", icon: Layers },
  { step: 4, title: "Teams & Units", desc: "Setup initial units", icon: Flag },
  { step: 5, title: "Rules & Limits", desc: "Participant quotas", icon: ShieldAlert },
  { step: 6, title: "Modules", desc: "Enable features", icon: Boxes },
  { step: 7, title: "Review", desc: "Launch workspace", icon: Sparkles },
]

export default function CreateFestivalWizardPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.orgId as string

  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 1: Basic Info
  const [basic, setBasic] = useState({
    name: "",
    short_name: "",
    code: "",
    description: "",
    theme: "default",
    start_date: "",
    end_date: "",
    registration_start_date: "",
    registration_end_date: "",
    result_publish_date: "",
    venue_name: "",
    address: "",
    district: "",
    state: "Kerala",
    country: "India",
    latitude: "",
    longitude: "",
    timezone: "Asia/Kolkata",
    status: "draft" as const,
    visibility: "public" as const,
    max_participants: "",
    max_competitions: "",
  })

  // Step 2: Competition Unit Structure
  const [unitType, setUnitType] = useState<CompetitionUnitType>("groups")

  // Step 3: Classification
  const [classificationType, setClassificationType] = useState<ClassificationType>("zones")
  const [classificationValues, setClassificationValues] = useState<string[]>([
    "A Zone",
    "B Zone",
    "C Zone",
    "Mix Zone",
  ])
  const [newClassInput, setNewClassInput] = useState("")

  // Step 4: Initial Groups / Teams
  const [groups, setGroups] = useState<FestivalWizardGroup[]>([
    { name: "Group 1", code: "G1", color: "#4F46E5" },
    { name: "Group 2", code: "G2", color: "#10B981" },
    { name: "Group 3", code: "G3", color: "#F59E0B" },
    { name: "Group 4", code: "G4", color: "#EF4444" },
    { name: "Group 5", code: "G5", color: "#8B5CF6" },
  ])

  // Step 5: Rules & Limits
  const [rules, setRules] = useState({
    max_individual_programmes: 5,
    max_group_participants: 12,
    allow_mix_zone: true,
    block_duplicate_registration: true,
  })

  // Step 6: Modules
  const [modules, setModules] = useState<Record<string, boolean>>(DEFAULT_FESTIVAL_CONFIG.modules)

  // Handle Preset Changes when switching Unit Type
  function handleUnitChange(type: CompetitionUnitType) {
    setUnitType(type)
    if (type === "houses") {
      setGroups([
        { name: "Ruby House", code: "RUBY", color: "#EF4444" },
        { name: "Emerald House", code: "EMER", color: "#10B981" },
        { name: "Sapphire House", code: "SAPP", color: "#3B82F6" },
        { name: "Topaz House", code: "TOPZ", color: "#F59E0B" },
      ])
    } else if (type === "teams") {
      setGroups([
        { name: "Team Alpha", code: "ALP", color: "#4F46E5" },
        { name: "Team Beta", code: "BET", color: "#06B6D4" },
        { name: "Team Gamma", code: "GAM", color: "#10B981" },
        { name: "Team Delta", code: "DEL", color: "#F59E0B" },
      ])
    } else if (type === "groups") {
      setGroups([
        { name: "Group 1", code: "G1", color: "#4F46E5" },
        { name: "Group 2", code: "G2", color: "#10B981" },
        { name: "Group 3", code: "G3", color: "#F59E0B" },
        { name: "Group 4", code: "G4", color: "#EF4444" },
        { name: "Group 5", code: "G5", color: "#8B5CF6" },
      ])
    } else if (type === "units") {
      setGroups([
        { name: "Unit A", code: "UA", color: "#4F46E5" },
        { name: "Unit B", code: "UB", color: "#10B981" },
        { name: "Unit C", code: "UC", color: "#F59E0B" },
      ])
    } else {
      setGroups([])
    }
  }

  // Handle Classification change
  function handleClassificationChange(type: ClassificationType) {
    setClassificationType(type)
    setClassificationValues(CLASSIFICATION_OPTIONS[type].defaultValues)
  }

  // Add classification tag
  function addClassificationValue() {
    if (!newClassInput.trim()) return
    if (!classificationValues.includes(newClassInput.trim())) {
      setClassificationValues([...classificationValues, newClassInput.trim()])
    }
    setNewClassInput("")
  }

  // Remove classification tag
  function removeClassificationValue(idx: number) {
    setClassificationValues(classificationValues.filter((_, i) => i !== idx))
  }

  // Step 4: Add / Remove Group
  function addGroup() {
    const nextNum = groups.length + 1
    const unitLabel = COMPETITION_UNITS[unitType].singular
    setGroups([
      ...groups,
      {
        name: `${unitLabel} ${nextNum}`,
        code: `${unitLabel.slice(0, 1)}${nextNum}`,
        color: "#4F46E5",
      },
    ])
  }

  function removeGroup(idx: number) {
    setGroups(groups.filter((_, i) => i !== idx))
  }

  function updateGroup(idx: number, field: keyof FestivalWizardGroup, value: string) {
    const next = [...groups]
    next[idx] = { ...next[idx], [field]: value }
    setGroups(next)
  }

  // Toggle Module
  function toggleModule(id: string) {
    setModules((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Validation
  function validateCurrentStep(): boolean {
    if (currentStep === 1) {
      if (!basic.name.trim()) {
        toast.error("Please enter a festival name")
        return false
      }
    }
    if (currentStep === 4 && unitType !== "individual") {
      if (groups.length === 0) {
        toast.error(`Please add at least one ${COMPETITION_UNITS[unitType].singular.toLowerCase()}`)
        return false
      }
    }
    return true
  }

  function handleNext() {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 7))
    }
  }

  function handleBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // Final Submit
  async function handleFinalSubmit() {
    setSaving(true)
    const wizardPayload: FestivalWizardData = {
      ...basic,
      terminology: {
        unit: unitType,
        classification: classificationType,
        classificationValues,
      },
      groups: unitType === "individual" ? [] : groups,
      rules,
      modules,
    }

    const result = await createFestival(orgId, wizardPayload)
    setSaving(false)

    if (result.error) {
      toast.error(result.error)
    } else if (result.festivalId) {
      toast.success("Festival workspace configured and ready! 🎉")
      router.push(`/dashboard/organization/${orgId}/festivals/${result.festivalId}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            Multi-Tenant Festival Setup Wizard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Configure Your Festival</h1>
          <p className="text-sm text-indigo-200 mt-1 max-w-xl">
            Customize terminology, competition groups, zones, and enabled modules in 7 quick steps.
          </p>
        </div>
        <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-white/10 items-center justify-center border border-white/20">
          <Sparkles className="h-7 w-7 text-indigo-300" />
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[620px]">
          {WIZARD_STEPS.map((s, idx) => {
            const Icon = s.icon
            const isDone = currentStep > s.step
            const isCurrent = currentStep === s.step
            return (
              <div key={s.step} className="flex items-center flex-1 last:flex-none">
                <div
                  onClick={() => {
                    if (s.step < currentStep) setCurrentStep(s.step)
                  }}
                  className={`flex items-center gap-2 cursor-pointer ${
                    isDone
                      ? "text-emerald-700"
                      : isCurrent
                      ? "text-indigo-600 font-bold"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : isCurrent
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : s.step}
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">{s.title}</div>
                    <div className="text-[10px] text-gray-500 hidden md:block">{s.desc}</div>
                  </div>
                </div>
                {idx < WIZARD_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 transition-colors ${
                      currentStep > s.step ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <Card className="shadow-xs border-gray-200">
        <CardContent className="p-6">
          {/* STEP 1: BASIC INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-indigo-600" />
                  Step 1 — Basic Festival Information
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Enter the event title, dates, and venue location.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Festival Name *</label>
                  <Input
                    value={basic.name}
                    onChange={(e) => setBasic({ ...basic, name: e.target.value })}
                    placeholder="e.g. Irivetty Sector Sahityotsav / Crescent Arts Fest 2026"
                    className="font-semibold text-gray-900"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Short Name</label>
                    <Input
                      value={basic.short_name}
                      onChange={(e) => setBasic({ ...basic, short_name: e.target.value })}
                      placeholder="e.g. Sahityotsav '26"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Festival Code</label>
                    <Input
                      value={basic.code}
                      onChange={(e) => setBasic({ ...basic, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. FEST-2026"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Description / Theme</label>
                  <Textarea
                    value={basic.description}
                    onChange={(e) => setBasic({ ...basic, description: e.target.value })}
                    placeholder="Describe the festival, aims, or theme tagline..."
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Start Date</label>
                    <Input
                      type="date"
                      value={basic.start_date}
                      onChange={(e) => setBasic({ ...basic, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">End Date</label>
                    <Input
                      type="date"
                      value={basic.end_date}
                      onChange={(e) => setBasic({ ...basic, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Venue Name</label>
                    <Input
                      value={basic.venue_name}
                      onChange={(e) => setBasic({ ...basic, venue_name: e.target.value })}
                      placeholder="e.g. Campus Grounds / Main Auditorium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Timezone</label>
                    <Select
                      value={basic.timezone}
                      onChange={(e) => setBasic({ ...basic, timezone: e.target.value })}
                      options={TIMEZONE_OPTIONS}
                    />
                  </div>
                </div>

                {/* Country, State, District Cascading Dropdowns */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Country</label>
                    <Select
                      value={basic.country}
                      onChange={(e) => {
                        const newCountry = e.target.value
                        setBasic({
                          ...basic,
                          country: newCountry,
                          state: newCountry === "India" ? "Kerala" : "",
                          district: "",
                        })
                      }}
                      options={COUNTRIES}
                      placeholder="Select Country"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">State</label>
                    {basic.country === "India" ? (
                      <Select
                        value={basic.state}
                        onChange={(e) => {
                          const newState = e.target.value
                          setBasic({ ...basic, state: newState, district: "" })
                        }}
                        options={INDIAN_STATES}
                        placeholder="Select State"
                      />
                    ) : (
                      <Input
                        value={basic.state}
                        onChange={(e) => setBasic({ ...basic, state: e.target.value })}
                        placeholder="State / Province"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">District</label>
                    {DISTRICTS_BY_STATE[basic.state] ? (
                      <Select
                        value={basic.district}
                        onChange={(e) => setBasic({ ...basic, district: e.target.value })}
                        options={DISTRICTS_BY_STATE[basic.state]}
                        placeholder="Select District"
                      />
                    ) : (
                      <Input
                        value={basic.district}
                        onChange={(e) => setBasic({ ...basic, district: e.target.value })}
                        placeholder="District / City"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: COMPETITION STRUCTURE & TERMINOLOGY */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Step 2 — Competition Unit & Terminology
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  How will participants compete? Choose the terminology that matches your organization.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(COMPETITION_UNITS) as CompetitionUnitType[]).map((key) => {
                  const unit = COMPETITION_UNITS[key]
                  const isSelected = unitType === key
                  return (
                    <div
                      key={key}
                      onClick={() => handleUnitChange(key)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/70 shadow-xs"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                          isSelected ? "border-indigo-600 bg-indigo-600" : "border-gray-300"
                        }`}
                      >
                        {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-gray-900">{unit.plural}</span>
                          <span className="text-[10px] font-mono uppercase bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {unit.singular}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{unit.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                <span>
                  The entire interface, sidebar, badges, and points tables will dynamically display{" "}
                  <strong>&quot;{COMPETITION_UNITS[unitType].plural}&quot;</strong> for this festival.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: CLASSIFICATION (ZONES / CATEGORIES) */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-600" />
                  Step 3 — Competition Classification
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Classify programmes by Zones, Categories, or run a single-tier open festival.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(CLASSIFICATION_OPTIONS) as ClassificationType[]).map((key) => {
                  const opt = CLASSIFICATION_OPTIONS[key]
                  const isSelected = classificationType === key
                  return (
                    <div
                      key={key}
                      onClick={() => handleClassificationChange(key)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/70 shadow-xs"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                          isSelected ? "border-indigo-600 bg-indigo-600" : "border-gray-300"
                        }`}
                      >
                        {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-gray-900">{opt.label}</div>
                        <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Tag Editor for Classification Values */}
              {classificationType !== "none" && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Configured {classificationType === "zones" ? "Zones" : "Categories"}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Add custom tags or remove defaults
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {classificationValues.map((val, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 text-gray-800 text-xs font-bold rounded-lg shadow-2xs"
                      >
                        <span>{val}</span>
                        <button
                          type="button"
                          onClick={() => removeClassificationValue(idx)}
                          className="text-gray-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newClassInput}
                      onChange={(e) => setNewClassInput(e.target.value)}
                      placeholder={`Add new ${classificationType === "zones" ? "Zone" : "Category"} (e.g. High School)`}
                      className="text-sm bg-white"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addClassificationValue()
                        }
                      }}
                    />
                    <Button type="button" onClick={addClassificationValue} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: INITIAL GROUPS / TEAMS SETUP */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Flag className="h-5 w-5 text-indigo-600" />
                    Step 4 — Setup {COMPETITION_UNITS[unitType].plural}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Define the initial {COMPETITION_UNITS[unitType].plural.toLowerCase()} competing for the championship.
                  </p>
                </div>
                {unitType !== "individual" && (
                  <Button type="button" onClick={addGroup} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Add {COMPETITION_UNITS[unitType].singular}
                  </Button>
                )}
              </div>

              {unitType === "individual" ? (
                <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                  <Users className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="font-bold text-sm text-gray-800">Individual Competitions Selected</p>
                  <p className="text-xs text-gray-500 mt-1">
                    No team groupings required. Participants will compete independently.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.map((group, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={group.color}
                          onChange={(e) => updateGroup(idx, "color", e.target.value)}
                          className="h-8 w-8 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                          title="Choose Brand Color"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={group.name}
                          onChange={(e) => updateGroup(idx, "name", e.target.value)}
                          placeholder={`${COMPETITION_UNITS[unitType].singular} Name`}
                          className="bg-white text-sm font-semibold"
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          value={group.code}
                          onChange={(e) => updateGroup(idx, "code", e.target.value.toUpperCase())}
                          placeholder="Code"
                          className="bg-white text-sm font-mono uppercase text-center"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGroup(idx)}
                        className="p-2 text-gray-400 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: RULES & LIMITS */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-indigo-600" />
                  Step 5 — Participation Rules & Quotas
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure limits enforced during candidate registration.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-gray-800 block">
                    Max Individual Programmes Per Student
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={rules.max_individual_programmes}
                    onChange={(e) =>
                      setRules({ ...rules, max_individual_programmes: Number(e.target.value) || 1 })
                    }
                    className="bg-white font-bold text-indigo-700"
                  />
                  <p className="text-[11px] text-gray-500">
                    Standard for QUAF / Sahityotsav is 5 items. Can be customized for your event.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-gray-800 block">
                    Max Participants Per Group Item
                  </label>
                  <Input
                    type="number"
                    min={2}
                    max={50}
                    value={rules.max_group_participants}
                    onChange={(e) =>
                      setRules({ ...rules, max_group_participants: Number(e.target.value) || 2 })
                    }
                    className="bg-white font-bold text-indigo-700"
                  />
                  <p className="text-[11px] text-gray-500">
                    Upper cap for group choir, skit, or team items.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-gray-900 block">
                      Allow Mix Zone Exceptions
                    </span>
                    <span className="text-xs text-gray-500">
                      Mix Zone items are open across multiple participant levels.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={rules.allow_mix_zone}
                    onChange={(e) => setRules({ ...rules, allow_mix_zone: e.target.checked })}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-gray-900 block">
                      Strict Duplicate Registration Prevention
                    </span>
                    <span className="text-xs text-gray-500">
                      Blocks the same candidate from registering multiple times for one programme.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={rules.block_duplicate_registration}
                    onChange={(e) =>
                      setRules({ ...rules, block_duplicate_registration: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: MODULE SELECTION */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Boxes className="h-5 w-5 text-indigo-600" />
                  Step 6 — Module Configuration
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Only enable the modules your festival needs. Disabled modules won&apos;t clutter your navigation or dashboard.
                </p>
              </div>

              {/* Core Modules Info */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>11 Core Modules</strong> (Dashboard, {COMPETITION_UNITS[unitType].plural}, Participants, Programmes, Registrations, Schedule, Stages, Judges, Mark Entry, Results, Points) are always active.
                </span>
              </div>

              {/* Optional Modules Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {FESTIVAL_MODULES.filter((m) => !m.isCore).map((mod) => {
                  const isEnabled = Boolean(modules[mod.id])
                  return (
                    <div
                      key={mod.id}
                      onClick={() => toggleModule(mod.id)}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isEnabled
                          ? "border-indigo-600 bg-indigo-50/60 shadow-2xs"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-gray-900">{mod.name}</div>
                        <p className="text-xs text-gray-500 mt-0.5">{mod.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => {}} // handled by parent onClick
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5 shrink-0"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW & LAUNCH */}
          {currentStep === 7 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  Step 7 — Review & Launch Workspace
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Confirm your festival architecture before generating your isolated tenant workspace.
                </p>
              </div>

              <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      Festival Name
                    </span>
                    <div className="text-xl font-black text-gray-900">{basic.name}</div>
                  </div>
                  <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {basic.timezone}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Unit Type:</span>
                    <p className="font-bold text-gray-800">{COMPETITION_UNITS[unitType].plural}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Classification:</span>
                    <p className="font-bold text-gray-800">
                      {CLASSIFICATION_OPTIONS[classificationType].label}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Initial Units:</span>
                    <p className="font-bold text-gray-800">
                      {unitType === "individual" ? "Individual" : `${groups.length} ${COMPETITION_UNITS[unitType].plural}`}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Individual Quota:</span>
                    <p className="font-bold text-gray-800">
                      Max {rules.max_individual_programmes} items
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block mb-2">
                    Enabled Optional Modules
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(modules)
                      .filter(([_, enabled]) => enabled)
                      .map(([key]) => {
                        const def = FESTIVAL_MODULES.find((m) => m.id === key)
                        return (
                          <span
                            key={key}
                            className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-md"
                          >
                            {def?.name || key}
                          </span>
                        )
                      })}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Ready to deploy your isolated festival workspace
                </p>
                <p className="mt-1 text-emerald-800">
                  Clicking below will create the database records, set up your initial {COMPETITION_UNITS[unitType].plural.toLowerCase()}, and launch your customized festival dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || saving}
              className="flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>

            {currentStep < 7 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinalSubmit}
                disabled={saving}
                className="flex items-center gap-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 shadow-md"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Launching Workspace...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Create Festival Workspace</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
