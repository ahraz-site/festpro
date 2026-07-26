import Link from "next/link"
import { AhrazFestProLogo } from "@/components/ui/logo"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="absolute top-4 left-4 z-10">
        <Link href="/" className="flex items-center">
          <AhrazFestProLogo height={32} />
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">{children}</div>
    </div>
  )
}
