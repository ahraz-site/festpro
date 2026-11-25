import React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080d14] text-white flex flex-col justify-center">
      {children}
    </div>
  )
}
