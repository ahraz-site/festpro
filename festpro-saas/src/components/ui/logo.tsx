import React from "react"
import { AhrazIconLogo } from "./ahraz-icon"

interface LogoProps {
  className?: string
  variant?: "light" | "dark"
  height?: number
  showIcon?: boolean
}

export function AhrazFestProLogo({ className = "", variant = "light", height = 32, showIcon = true }: LogoProps) {
  const isDark = variant === "dark"

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {showIcon && <AhrazIconLogo size={height + 6} />}
      <img
        src="/ahraz-festpro-logo.png"
        alt="ahraz festpro SaaS"
        style={{ height: `${height}px` }}
        className={`object-contain ${isDark ? "brightness-0 invert drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]" : ""}`}
      />
    </div>
  )
}
