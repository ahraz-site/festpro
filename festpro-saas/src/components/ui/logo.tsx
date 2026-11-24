"use client"

import React, { useId } from "react"

export interface WordmarkProps {
  className?: string
  height?: number
  variant?: "gradient" | "white" | "dark"
}

/**
 * Official Fespro Wordmark SVG component directly matching:
 * E:\Desktop\ahraz_design\SVG\fespro logo.svg
 * ViewBox: 0 0 1335.74 416.87 (aspect ratio ~3.204 : 1)
 */
export function FesProWordmark({
  className = "",
  height = 26,
  variant = "gradient",
}: WordmarkProps) {
  const rawId = useId()
  const gradientId = `fp-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`
  const isWhite = variant === "white" || variant === "dark"
  const width = Math.round(height * 3.2042)

  return (
    <svg
      viewBox="0 0 1335.74 416.87"
      height={height}
      width={width}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 block ${className}`}
      aria-label="FesPro"
      role="img"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="-56.04"
          y1="114.15"
          x2="1353.32"
          y2="435.85"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#2181c5" />
          <stop offset="0.51" stopColor="#663fae" />
          <stop offset="1" stopColor="#d14091" />
        </linearGradient>
      </defs>
      <g fill={isWhite ? "#FFFFFF" : `url(#${gradientId})`}>
        {/* f */}
        <path d="M208,182.55H63.63v124.62H0v-109.27c0-25.01,12.29-42.56,37.74-42.12h3.07l-.44-4.39h-2.63c-25.45,0-37.74-17.11-37.74-42.13v-54.41C0,21.94,21.5,0,54.41,0h179.04v58.36H63.63v66.26h144.37V182.55Z" />
        {/* e */}
        <path d="M301.02,208.87c1.76,25.46,21.51,45.2,54.42,45.2,22.82,0,37.74-10.09,43-25.01h65.82c-9.65,54.85-50.46,82.5-111.46,82.5-69.33,0-115.4-45.64-115.4-114.09s46.07-114.1,115.4-114.1c62.75,0,111.46,39.06,111.02,111.02v14.48H301.02ZM397.12,169.82c-2.19-21.06-18.43-36.42-43-36.42-25.89,0-43.88,17.99-50.46,36.42H397.12Z" />
        {/* s */}
        <path d="M591.08,82.94c32.47,0,57.92,3.51,81.62,12.28v55.29c-15.36-5.26-47.83-15.79-86.01-15.79-21.94,0-31.59,5.26-31.59,14.48,0,32.03,126.81,12.72,126.81,91.71,0,47.39-36.86,71.09-99.61,71.09-32.47,0-58.36-3.52-82.06-12.29v-55.73c15.36,5.7,48.27,16.24,86.45,16.24,21.94,0,31.59-7.03,31.59-15.8,0-32.03-127.25-13.17-127.25-91.71C491.03,104.88,528.33,82.94,591.08,82.94Z" />
        {/* p */}
        <path d="M843.83,311.56c-42.56,0-66.7-23.26-66.7-46.08v-4.39h-3.94v155.78h-64.07l.44-219.4c0-68.46,46.07-114.1,115.41-114.1s115.4,42.57,115.4,118.48C940.37,268.55,901.76,311.56,843.83,311.56ZM824.97,143.05c-31.6,0-51.78,21.5-51.78,54.42s17.55,54.41,52.21,54.41c31.16,0,51.34-21.5,51.34-54.41S855.68,143.05,824.97,143.05Z" />
        {/* r */}
        <path d="M1031.65,307.17h-64.07v-96.54c0-80.74,46.95-124.18,119.36-124.18v63.18c-32.92.44-55.29,18.87-55.29,52.66V307.17Z" />
        {/* o */}
        <path d="M1220.33,83.37c69.34,0,115.41,45.64,115.41,114.1s-46.07,114.09-115.41,114.09-115.4-45.64-115.4-114.09S1151,83.37,1220.33,83.37ZM1220.33,251.88c31.16,0,51.78-22.38,51.78-54.41s-20.62-54.42-51.78-54.42-51.78,21.94-51.78,54.42S1189.18,251.88,1220.33,251.88Z" />
      </g>
    </svg>
  )
}

// Backward-compatible alias
export const FestProWordmark = FesProWordmark

export interface LogoProps {
  className?: string
  variant?: "light" | "dark" | "gradient" | "white"
  height?: number
  showIcon?: boolean
  stackedMobile?: boolean
}

/**
 * Official Fespro Favicon SVG Component matching:
 * E:\Desktop\ahraz_design\SVG\fest pro logo favicon.svg
 */
export function FesProFavicon({
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
      aria-label="FesPro Favicon"
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

export const FestProFavicon = FesProFavicon

/**
 * FesPro Wordmark Logo (clean wordmark)
 */
export function FesProLogo({
  className = "",
  variant = "light",
  height = 26,
}: LogoProps) {
  const isDark = variant === "dark" || variant === "white"
  const wordmarkVariant = isDark ? "white" : "gradient"

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <FesProWordmark height={height} variant={wordmarkVariant} />
    </div>
  )
}

// Backward-compatible aliases
export const FestProLogo = FesProLogo
export const AhrazFestProLogo = FesProLogo
