import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-block w-3 h-3 rounded-full bg-[#E3001B]" />
          <span className="font-semibold text-[#000054] tracking-tight">RFI Student Portfolio</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm text-gray-600 hover:text-[#000054] transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm bg-[#E3001B] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-red-50 text-[#E3001B] text-sm font-medium px-3 py-1 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-[#E3001B]" />
            Regenerative Futures Institute
          </div>
          <h1 className="text-4xl font-bold text-[#000054] tracking-tight mb-4 leading-tight">
            Your regenerative<br />learning journey
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Document your field work, track how your skills develop across the Dreyfus model,
            and see how your expertise connects with your cohort.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="bg-[#E3001B] text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Start your portfolio
            </Link>
            <Link
              href="/auth/login"
              className="text-[#000054] px-6 py-3 rounded-lg font-medium border border-gray-200 hover:border-gray-300 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Domain colour strip */}
      <div className="flex h-1.5">
        <div className="flex-1 bg-[#065F46]" />
        <div className="flex-1 bg-[#1D4ED8]" />
        <div className="flex-1 bg-[#7C3AED]" />
        <div className="flex-1 bg-[#B45309]" />
        <div className="flex-1 bg-[#000054]" />
        <div className="flex-1 bg-[#9F1239]" />
        <div className="flex-1 bg-[#0369A1]" />
        <div className="flex-1 bg-[#374151]" />
      </div>
    </main>
  );
}
