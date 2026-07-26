import React from "react"
import Image from "next/image"

interface LogoProps {
  className?: string
  variant?: "light" | "dark"
  height?: number
}

export function AhrazFestProLogo({ className = "", variant = "light", height = 36 }: LogoProps) {
  const isDark = variant === "dark"

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Option 1: Official Uploaded Logo Image */}
      <img
        src="/ahraz-festpro-logo.png"
        alt="ahraz festpro SaaS"
        style={{ height: `${height}px` }}
        className={`object-contain ${isDark ? "brightness-0 invert drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]" : ""}`}
      />
    </div>
  )
}
