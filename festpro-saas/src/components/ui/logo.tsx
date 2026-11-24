"use client"

import React, { useId } from "react"

export interface WordmarkProps {
  className?: string
  height?: number
  variant?: "gradient" | "white" | "dark"
}

/**
 * Official Festpro Wordmark SVG component directly matching:
 * E:\Desktop\ahraz_design\SVG\Festpro logo.svg
 * ViewBox: 0 0 1376.73 267.2 (aspect ratio ~5.152 : 1)
 */
export function FestProWordmark({
  className = "",
  height = 26,
  variant = "gradient",
}: WordmarkProps) {
  const rawId = useId()
  const gradientId = `fp-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`
  const isWhite = variant === "white" || variant === "dark"
  const width = Math.round(height * 5.1524)

  return (
    <svg
      viewBox="0 0 1376.73 267.2"
      height={height}
      width={width}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 block ${className}`}
      aria-label="FestPro"
      role="img"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="-52.34"
          y1="99.07"
          x2="1312.08"
          y2="409.54"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#2181c5" />
          <stop offset="0.51" stopColor="#663fae" />
          <stop offset="1" stopColor="#d14091" />
        </linearGradient>
      </defs>
      <g fill={isWhite ? "#FFFFFF" : `url(#${gradientId})`}>
        {/* f */}
        <path d="M175.66,157.87H53.74v105.25H0v-92.28c0-21.12,10.38-35.94,31.87-35.57h2.59l-.37-3.71h-2.22c-21.49,0-31.87-14.45-31.87-35.58v-45.95c0-27.79,18.16-46.32,45.95-46.32h151.2v49.28H53.74v55.96h121.92V157.87Z" />
        {/* e */}
        <path d="M254.22,180.11c1.49,21.49,18.16,38.17,45.96,38.17,19.27,0,31.87-8.53,36.31-21.13h55.59c-8.15,46.33-42.62,69.68-94.13,69.68-58.55,0-97.46-38.55-97.46-96.36s38.91-96.35,97.46-96.35c53,0,94.13,32.98,93.76,93.76v12.23H254.22ZM335.38,147.12c-1.85-17.78-15.56-30.75-36.32-30.75-21.86,0-37.05,15.19-42.61,30.75H335.38Z" />
        {/* s */}
        <path d="M499.18,73.75c27.43,0,48.92,2.96,68.93,10.37v46.7c-12.97-4.45-40.39-13.34-72.63-13.34-18.53,0-26.69,4.44-26.69,12.23,0,27.05,107.1,10.74,107.1,77.45,0,40.02-31.13,60.04-84.12,60.04-27.42,0-49.29-2.97-69.3-10.38v-47.07c12.97,4.82,40.76,13.72,73.01,13.72,18.53,0,26.68-5.93,26.68-13.35,0-27.05-107.47-11.11-107.47-77.45C414.69,92.28,446.19,73.75,499.18,73.75Z" />
        {/* t */}
        <path d="M598.13,137.12V39.28h53.73v40.77h57.82v47.43h-57.82v18.16c0,43.73,13.72,64.11,57.82,64.11v53.37C630,263.12,598.13,220.13,598.13,137.12Z" />
        {/* p */}
        <path d="M872.36,165.65v-3.33h-3.7l.37,100.8h-54.11V102.65c0-62.26,46.33-102.65,117.85-102.65s117.48,40.77,117.48,104.14-44.1,103.02-106.36,103.02C902.38,207.16,872.36,190.48,872.36,165.65ZM933.51,157.5c38.54,0,63-20.38,63-53.36s-24.46-53.74-63.74-53.74-63.74,20.01-63.74,53.74C869.03,135.27,893.86,157.5,933.51,157.5Z" />
        {/* r */}
        <path d="M1119.92,263.12h-54.11v-81.53c0-68.19,39.65-104.88,100.8-104.88v53.37c-27.79.37-46.69,15.93-46.69,44.47V263.12Z" />
        {/* o */}
        <path d="M1279.27,74.12c58.55,0,97.46,38.54,97.46,96.35s-38.91,96.36-97.46,96.36-97.47-38.55-97.47-96.36S1220.71,74.12,1279.27,74.12ZM1279.27,216.42c26.31,0,43.73-18.9,43.73-45.95s-17.42-45.95-43.73-45.95-43.73,18.53-43.73,45.95S1252.96,216.42,1279.27,216.42Z" />
      </g>
    </svg>
  )
}

export interface LogoProps {
  className?: string
  variant?: "light" | "dark" | "gradient" | "white"
  height?: number
  showIcon?: boolean
  stackedMobile?: boolean
}

/**
 * Official Festpro Favicon SVG Component matching:
 * E:\Desktop\ahraz_design\SVG\fest pro logo favicon.svg
 */
export function FestProFavicon({
  size = 32,
  className = "",
}: {
  size?: number
  className?: string
}) {
  const rawId = useId()
  const gradientId = `fp-fav-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`
  return (
    <svg
      viewBox="0 0 4239.21 4239.21"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="FestPro Favicon"
      role="img"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="423.25"
          y1="4554.69"
          x2="3291.78"
          y2="436.96"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#2181c5" />
          <stop offset="0.51" stopColor="#663fae" />
          <stop offset="1" stopColor="#d14091" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gradientId})`}
        d="M4239.21,2119.6c0,1170.63-948.98,2119.61-2119.61,2119.61-192.8,0-379.6-25.75-557.15-74-242.63-65.91-467.94-173.85-667.68-315.53C353.32,3465.7,0,2833.91,0,2119.6,0,948.98,948.98,0,2119.6,0S4239.21,948.98,4239.21,2119.6Z"
      />
      <path
        fill="#FFFFFF"
        d="M3344.44,1628.37v-612.42h-1878.67c-345.36,0-571,230.22-571,575.57v570.97c0,262.49,128.92,442.08,396.02,442.08h27.63l4.57,46.02h-32.2c-267.1-4.61-396.02,179.59-396.02,442.04v757.05c199.74,141.68,425.05,249.62,667.68,315.53v-1233.74h1781.99v-607.82h-1781.99v-695.28H3344.44Z"
      />
    </svg>
  )
}

/**
 * FestPro Wordmark Logo (Without the Ahraz icon swirl, as requested)
 */
export function FestProLogo({
  className = "",
  variant = "light",
  height = 26,
}: LogoProps) {
  const isDark = variant === "dark" || variant === "white"
  const wordmarkVariant = isDark ? "white" : "gradient"

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <FestProWordmark height={height} variant={wordmarkVariant} />
    </div>
  )
}

// Backward-compatible alias that renders only the FestPro Wordmark
export const AhrazFestProLogo = FestProLogo
