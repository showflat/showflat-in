import { readFileSync } from 'fs'
import { join } from 'path'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/app/components/Navbar'

export const metadata: Metadata = {
  title: 'Pune Localities Guide | ShowFlat.in',
  description:
    'Complete guide to 15 Pune micro-markets. Compare price per sqft, 3-year appreciation, rental yield and active new launches in Hinjawadi, Baner, Kharadi, Wagholi, and more.',
  openGraph: {
    title: 'Pune Localities Guide | ShowFlat.in',
    description: 'Compare 15 Pune localities by price, appreciation and rental yield.',
    type: 'website',
  },
}

interface LocalityCard {
  slug: string
  name: string
  microMarket: string
  pricing: {
    avgPricePerSqft: number
    appreciation3yr: number
    rentalYield: number
    avgRentFor2BHK: number
  }
  activeProjectCount: number
  tags: string[]
}

function readLocalities(): LocalityCard[] {
  return JSON.parse(readFileSync(join(process.cwd(), 'data/localities.json'), 'utf-8'))
}

function groupByMarket(localities: LocalityCard[]): Map<string, LocalityCard[]> {
  const map = new Map<string, LocalityCard[]>()
  for (const l of localities) {
    if (!map.has(l.microMarket)) map.set(l.microMarket, [])
    map.get(l.microMarket)!.push(l)
  }
  return map
}

// Order micro-markets for display
const MARKET_ORDER = ['West Pune', 'East Pune', 'Central Pune', 'South Pune', 'Central East Pune', 'West Pune / PCMC']

export default function LocalitiesPage() {
  const localities = readLocalities()
  const groups = groupByMarket(localities)

  const orderedMarkets = [
    ...MARKET_ORDER.filter((m) => groups.has(m)),
    ...[...groups.keys()].filter((m) => !MARKET_ORDER.includes(m)),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#1a56db] to-[#0f2361]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-center">
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-3">
            Pune Micro-Markets
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Localities Guide
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Compare {localities.length} Pune localities by price, appreciation, and rental yield.
            Find the right area for your budget and lifestyle.
          </p>
        </div>
      </div>

      {/* ── Summary stats bar ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap gap-6 justify-center text-center">
            {[
              {
                label: 'Localities covered',
                value: `${localities.length}`,
              },
              {
                label: 'Price range',
                value: '₹8,200 – ₹22,000/sqft',
              },
              {
                label: 'Avg 3yr appreciation',
                value: `+${(localities.reduce((s, l) => s + l.pricing.appreciation3yr, 0) / localities.length).toFixed(1)}%`,
              },
              {
                label: 'Highest yield',
                value: `${Math.max(...localities.map((l) => l.pricing.rentalYield)).toFixed(1)}%`,
              },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-lg font-extrabold text-[#111827]">{s.value}</p>
                <p className="text-xs text-[#6b7280]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Localities by micro-market ────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {orderedMarkets.map((market) => {
          const locs = groups.get(market)!
          return (
            <section key={market}>
              <div className="flex items-baseline gap-2 mb-5">
                <h2 className="text-xl font-bold text-[#111827]">{market}</h2>
                <span className="text-sm text-[#6b7280]">
                  {locs.length} {locs.length === 1 ? 'locality' : 'localities'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {locs.map((l) => (
                  <Link key={l.slug} href={`/localities/${l.slug}`} className="block group">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#1a56db]/30 transition-all h-full flex flex-col">

                      {/* Card header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#1a56db] transition-colors leading-tight">
                            {l.name}
                          </h3>
                          <p className="text-xs text-[#6b7280] mt-0.5">{l.microMarket}</p>
                        </div>
                        <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full flex-shrink-0 ml-2">
                          +{l.pricing.appreciation3yr}%
                        </span>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-2.5 mb-4">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-[#6b7280] mb-0.5">Avg ₹/sqft</p>
                          <p className="text-base font-extrabold text-[#1a56db] tabular-nums">
                            ₹{l.pricing.avgPricePerSqft.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-[#6b7280] mb-0.5">Rental yield</p>
                          <p className="text-base font-extrabold text-[#111827] tabular-nums">
                            {l.pricing.rentalYield}% p.a.
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                        <span className="text-xs text-[#6b7280]">
                          {l.activeProjectCount} active project{l.activeProjectCount !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs font-semibold text-[#1a56db] group-hover:underline">
                          Explore →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* ── Bottom CTA ───────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#1a56db] to-[#0f2361]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-2">
            Not sure which locality suits you?
          </h2>
          <p className="text-blue-200 mb-6 max-w-lg mx-auto">
            Share your budget and work location. We'll recommend the best 2–3 localities with live projects.
          </p>
          <a
            href={`https://wa.me/919130114411?text=${encodeURIComponent(
              "Hi, I'm looking for a property in Pune. Can you help me choose the right locality?"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Get locality recommendations
          </a>
        </div>
      </div>
    </div>
  )
}
