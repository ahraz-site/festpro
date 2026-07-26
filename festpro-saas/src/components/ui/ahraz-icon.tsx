import React from "react"

interface AhrazIconProps {
  className?: string
  size?: number
}

export function AhrazIconLogo({ className = "", size = 32 }: AhrazIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 686.14 686.14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="ahraz-festpro-brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <g>
        <path
          fill="url(#ahraz-festpro-brand-gradient)"
          d="M8.6,498.84C-24.48,473.8,139.57,36.33,355.74,43.07c232,7.23,387.48,521.88,302.57,590.07-40.21,32.3-157.29-17.12-212.89-97.78-83.95-121.79,2.74-270.58-49.48-303.4C312.86,179.76,41.31,523.6,8.6,498.84Z"
        />
        <circle
          fill="url(#ahraz-festpro-brand-gradient)"
          cx="256.27"
          cy="506.58"
          r="136.56"
        />
      </g>
    </svg>
  )
}
