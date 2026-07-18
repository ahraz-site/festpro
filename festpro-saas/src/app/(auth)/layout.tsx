import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="absolute top-4 left-4 z-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-bold">F</div>
          <span className="text-xl font-bold text-gray-900">FestPro</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">{children}</div>
    </div>
  )
}
