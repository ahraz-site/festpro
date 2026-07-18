"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Ambulance, Stethoscope, Activity, Pill, AlertTriangle, Loader2 } from "lucide-react"

const medicalLinks = [
  { label: "Cases", icon: Stethoscope, href: "/mobile/medical/cases", color: "bg-red-500" },
  { label: "Patients", icon: Activity, href: "/mobile/medical/patients", color: "bg-rose-500" },
  { label: "Medications", icon: Pill, href: "/mobile/medical/medications", color: "bg-purple-500" },
  { label: "Incidents", icon: AlertTriangle, href: "/mobile/medical/incidents", color: "bg-orange-500" },
  { label: "Ambulances", icon: Ambulance, href: "/mobile/medical/ambulances", color: "bg-blue-500" },
]

export default function MobileMedical() {
  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-gray-900">Medical</h1><Ambulance className="h-5 w-5 text-red-400" /></div>
      <p className="text-sm text-gray-500">Medical desk, cases and emergency response</p>
      <div className="grid grid-cols-2 gap-3">
        {medicalLinks.map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
            <div className={`h-10 w-10 rounded-xl ${item.color} flex items-center justify-center`}><item.icon className="h-5 w-5 text-white" /></div>
            <span className="text-xs font-medium text-gray-600">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
