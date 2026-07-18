import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-lg fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-bold">F</div>
            <span className="text-xl font-bold text-gray-900">FestPro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2">Sign In</Link>
            <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 shadow-sm">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        <section className="py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              One Platform.<br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Unlimited Festivals.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
              The ultimate SaaS platform for managing school kalolsavams, college fests, university events, 
              madrasa competitions, sports meets, and more.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/register" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-base font-medium text-white hover:from-indigo-700 hover:to-purple-700 shadow-md">
                Start Free
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
