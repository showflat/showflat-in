import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/app/components/Navbar'

export const metadata: Metadata = {
  title: 'About ShowFlat.in — Pune Zero Brokerage Property Specialists',
  description:
    'ShowFlat.in is Pune\'s trusted zero brokerage channel partner. We help IT professionals and home buyers find RERA verified new launch apartments with no brokerage, ever.',
  openGraph: {
    title: 'About ShowFlat.in',
    description: 'Zero brokerage. RERA verified. Pune only.',
    type: 'website',
  },
}

const WA = 'https://wa.me/919130114411'

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a56db] to-[#0f2361]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            About ShowFlat.in
          </h1>
          <p className="text-blue-200 text-lg max-w-xl mx-auto">
            Pune&apos;s trusted zero brokerage channel partner for new launch properties.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">

        {/* Mission */}
        <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold text-[#111827] mb-4">Our mission</h2>
          <p className="text-[#374151] leading-relaxed mb-4">
            Buying a home in Pune shouldn&apos;t cost you a brokerage. ShowFlat.in was founded on one simple principle: every buyer deserves access to the best new launch projects in Pune without paying a single rupee in commission.
          </p>
          <p className="text-[#374151] leading-relaxed">
            We are a RERA channel partner who earns directly from developers — not from you. That means you get the same price as walking into the developer&apos;s site office, but with expert guidance, honest advice, and dedicated WhatsApp support throughout your journey.
          </p>
        </section>

        {/* How it works */}
        <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold text-[#111827] mb-6">How it works</h2>
          <div className="space-y-5">
            {[
              {
                step: '01',
                title: 'Browse & shortlist',
                desc: 'Explore all RERA verified new launches across 15 Pune localities. Filter by budget, BHK, and possession date.',
              },
              {
                step: '02',
                title: 'WhatsApp us',
                desc: 'Message us on WhatsApp with your shortlist. We\'ll answer every question honestly — including the ones the developer won\'t.',
              },
              {
                step: '03',
                title: 'Free site visit',
                desc: 'We arrange and accompany your site visit at zero cost. No pressure. You\'re in charge.',
              },
              {
                step: '04',
                title: 'Book at developer price',
                desc: 'When you\'re ready, we process your booking at the same price as going direct. Zero brokerage. Always.',
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="text-2xl font-extrabold text-[#1a56db] opacity-30 w-8 flex-shrink-0 leading-none mt-0.5">
                  {s.step}
                </div>
                <div>
                  <p className="font-bold text-[#111827] mb-1">{s.title}</p>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why zero brokerage */}
        <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold text-[#111827] mb-4">Why zero brokerage?</h2>
          <p className="text-[#374151] leading-relaxed mb-4">
            In Pune&apos;s new launch market, channel partners are paid a sourcing fee directly by the developer — typically 1–2% of the transaction value. This fee is baked into the developer&apos;s marketing budget and does not come from the buyer&apos;s pocket.
          </p>
          <p className="text-[#374151] leading-relaxed">
            Traditional brokers sometimes charge buyers an additional commission on top of this, creating a conflict of interest. We don&apos;t. Our entire income comes from the developer, and we disclose that upfront. The result: you get better guidance, because our incentive is to find you the right project — not the most expensive one.
          </p>
        </section>

        {/* Coverage */}
        <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold text-[#111827] mb-4">What we cover</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              '6+ live projects',
              '15 localities',
              '₹55L to ₹2Cr+',
              'RERA verified',
              'MahaRERA channel partner',
              'Pune only',
            ].map((item) => (
              <div
                key={item}
                className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm font-semibold text-[#1a56db] text-center"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-gradient-to-br from-[#1a56db] to-[#0f2361] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Talk to a property expert</h2>
          <p className="text-blue-200 mb-6">
            Real people. No bots. Honest advice about every project we list.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`${WA}?text=${encodeURIComponent("Hi ShowFlat! I'd like to know more about your services.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <WaIcon />
              WhatsApp us now
            </a>
            <a
              href="mailto:info@showflat.in"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              info@showflat.in
            </a>
          </div>
        </section>

        {/* Quick nav */}
        <section>
          <p className="text-sm font-semibold text-[#6b7280] mb-3">Explore</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Browse all projects', href: '/projects' },
              { label: 'Localities guide', href: '/localities' },
              { label: 'EMI calculator', href: '/tools/emi-calculator' },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium bg-white border border-gray-200 hover:border-[#1a56db] hover:text-[#1a56db] text-[#6b7280] px-4 py-2 rounded-full transition-colors"
              >
                {l.label} →
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
