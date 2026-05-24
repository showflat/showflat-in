import { readFileSync } from 'fs'
import { join } from 'path'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/app/components/Navbar'
import LocalityPriceChart from './LocalityPriceChart'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricePoint {
  date: string
  pricePerSqft: number
}

interface InfraItem {
  name: string
  expectedYear: number
  impact: string
}

interface LocalityData {
  slug: string
  name: string
  microMarket: string
  district: string
  pricing: {
    avgPricePerSqft: number
    appreciation3yr: number
    rentalYield: number
    avgRentFor2BHK: number
  }
  priceHistory: PricePoint[]
  topITCompanies: string[]
  upcomingInfra: InfraItem[]
  connectivity: {
    toPuneStation: string
    toPuneAirport: string
    toMumbai: string
    nearestMetroStation: string
    busRoutes: string[]
  }
  overview: string
  investorNote: string
  activeProjectCount: number
}

interface ProjectData {
  id: string
  name: string
  slug: string
  builder: { name: string }
  locality: string
  possessionDate: string
  configs: { type: string; carpetSqft: number }[]
  priceRange: { displayMin: string; displayMax: string }
}

// ─── Data ─────────────────────────────────────────────────────────────────────

function readLocalities(): LocalityData[] {
  return JSON.parse(readFileSync(join(process.cwd(), 'data/localities.json'), 'utf-8'))
}

function readProjects(): ProjectData[] {
  return JSON.parse(readFileSync(join(process.cwd(), 'data/projects.json'), 'utf-8'))
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WA = 'https://wa.me/919130114411'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatPossession(d: string): string {
  const [year, month] = d.split('-')
  return `${MONTHS[+month - 1]} ${year}`
}

function carpetRange(configs: { carpetSqft: number }[]): string {
  const areas = configs.map((c) => c.carpetSqft)
  const min = Math.min(...areas)
  const max = Math.max(...areas)
  return min === max ? `${min} sqft` : `${min}–${max} sqft`
}

function impactBadge(impact: string): string {
  if (impact === 'high') return 'bg-green-100 text-green-700 border-green-200'
  if (impact === 'medium') return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-gray-100 text-[#6b7280] border-gray-200'
}

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ─── Static generation ────────────────────────────────────────────────────────

export function generateStaticParams() {
  return readLocalities().map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const l = readLocalities().find((x) => x.slug === slug)
  if (!l) return {}
  const desc = l.overview.length > 155 ? l.overview.slice(0, 152) + '…' : l.overview
  return {
    title: `New Projects in ${l.name} Pune | ShowFlat.in`,
    description: desc,
    openGraph: {
      title: `New Projects in ${l.name} Pune | ShowFlat.in`,
      description: l.overview.slice(0, 100),
      type: 'website',
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LocalityPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const localities = readLocalities()
  const projects = readProjects()

  const l = localities.find((x) => x.slug === slug)
  if (!l) notFound()

  const localityProjects = projects.filter((p) => p.locality === l.name)
  const otherLocalities = localities.filter((x) => x.slug !== slug)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#1a56db] to-[#0f2361]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm">
              {l.microMarket}
            </span>
            <span className="text-xs font-semibold bg-green-500 text-white px-3 py-1 rounded-full">
              +{l.pricing.appreciation3yr}% in 3 yrs
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 tracking-tight">
            {l.name}
          </h1>
          <p className="text-blue-200 text-lg">
            Avg ₹{l.pricing.avgPricePerSqft.toLocaleString('en-IN')}/sqft
            &nbsp;·&nbsp;
            {l.activeProjectCount} active projects
            &nbsp;·&nbsp;
            {l.district}
          </p>
        </div>
      </div>

      {/* ── Stats row (overlapping hero) ─────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: 'Avg ₹/sqft',
              value: `₹${l.pricing.avgPricePerSqft.toLocaleString('en-IN')}`,
              color: 'text-[#1a56db]',
            },
            {
              label: '3yr appreciation',
              value: `+${l.pricing.appreciation3yr}%`,
              color: 'text-green-600',
            },
            {
              label: 'Rental yield',
              value: `${l.pricing.rentalYield}% p.a.`,
              color: 'text-[#111827]',
            },
            {
              label: 'Avg 2BHK rent',
              value: `₹${(l.pricing.avgRentFor2BHK / 1000).toFixed(0)}k/mo`,
              color: 'text-[#111827]',
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 text-center"
            >
              <p className="text-xs text-[#6b7280] font-medium mb-1.5">{s.label}</p>
              <p className={`text-xl font-extrabold tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Price trend */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-[#111827] mb-5">Price trend in {l.name}</h2>
          <LocalityPriceChart history={l.priceHistory} />
          <p className="text-xs text-center text-[#6b7280] mt-2">Price per sqft (₹) — 3 year history</p>
        </section>

        {/* Projects */}
        {localityProjects.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-xl font-bold text-[#111827]">
                New launches in {l.name}
                <span className="ml-2 text-sm font-semibold text-[#6b7280]">
                  ({localityProjects.length})
                </span>
              </h2>
              <Link
                href="/projects"
                className="text-sm font-semibold text-[#1a56db] hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {localityProjects.map((p) => {
                const bhks = [...new Set(p.configs.map((c) => c.type))]
                const carpet = carpetRange(p.configs)
                const waText = encodeURIComponent(
                  `Hi, I'm interested in ${p.name} in ${p.locality}. Please share details.`
                )
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
                  >
                    <Link href={`/projects/${p.slug}`} className="block">
                      <div className="h-40 bg-gradient-to-br from-[#1a56db] to-[#0f2361] p-5 flex flex-col justify-between">
                        <div className="flex gap-2 flex-wrap">
                          {bhks.map((b) => (
                            <span
                              key={b}
                              className="text-xs font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-base leading-snug line-clamp-2">
                            {p.name}
                          </h3>
                          <p className="text-blue-200 text-xs mt-0.5">{p.builder.name}</p>
                        </div>
                      </div>
                    </Link>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-lg font-extrabold text-[#111827]">
                          ₹{p.priceRange.displayMin}
                        </span>
                        <span className="text-xs text-[#6b7280]">– ₹{p.priceRange.displayMax}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap mb-4">
                        <span className="text-xs bg-gray-100 text-[#6b7280] px-2 py-1 rounded-full">
                          {carpet}
                        </span>
                        <span className="text-xs bg-blue-50 text-[#1a56db] px-2 py-1 rounded-full font-medium">
                          {formatPossession(p.possessionDate)}
                        </span>
                      </div>
                      <div className="mt-auto">
                        <a
                          href={`${WA}?text=${waText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                        >
                          <WaIcon />
                          Book Free Site Visit
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* IT Hubs */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-[#111827] mb-4">Major employers nearby</h2>
          <div className="flex flex-wrap gap-2">
            {l.topITCompanies.map((company) => (
              <span
                key={company}
                className="text-sm bg-blue-50 text-[#1a56db] border border-blue-100 px-3.5 py-1.5 rounded-full font-medium"
              >
                {company}
              </span>
            ))}
          </div>
        </section>

        {/* Upcoming infra */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-[#111827] mb-5">Upcoming infrastructure</h2>
          <div className="space-y-4">
            {l.upcomingInfra.map((item) => (
              <div key={item.name} className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1a56db] mt-2 flex-shrink-0" />
                  <p className="text-sm text-[#111827] leading-snug">{item.name}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-medium text-[#6b7280]">{item.expectedYear}</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${impactBadge(item.impact)}`}
                  >
                    {item.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Connectivity */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-[#111827] mb-5">Connectivity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Pune Station', value: l.connectivity.toPuneStation, icon: '🚉' },
              { label: 'Pune Airport', value: l.connectivity.toPuneAirport, icon: '✈️' },
              { label: 'Mumbai', value: l.connectivity.toMumbai, icon: '🛣️' },
              { label: 'Nearest Metro', value: l.connectivity.nearestMetroStation, icon: '🚇' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3.5">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-xs text-[#6b7280] font-medium">{item.label}</p>
                  <p className="text-sm font-semibold text-[#111827]">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          {l.connectivity.busRoutes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-[#6b7280] mb-2">Bus routes</p>
              <div className="flex flex-wrap gap-2">
                {l.connectivity.busRoutes.map((r) => (
                  <span
                    key={r}
                    className="text-xs bg-gray-100 text-[#6b7280] px-2.5 py-1 rounded-full font-medium"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* About */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-[#111827] mb-3">About {l.name}</h2>
          <p className="text-[#374151] text-sm leading-relaxed">{l.overview}</p>
        </section>

        {/* Investor Note */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-start gap-4">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div>
              <h2 className="text-lg font-bold text-[#1a56db] mb-2">Investor note</h2>
              <p className="text-sm text-[#374151] leading-relaxed">{l.investorNote}</p>
            </div>
          </div>
          <div className="mt-5">
            <a
              href={`${WA}?text=${encodeURIComponent(
                `Hi, I'm looking for investment opportunities in ${l.name}, Pune. Can you share options?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <WaIcon />
              Explore {l.name} investments
            </a>
          </div>
        </section>

        {/* All localities */}
        <section>
          <h2 className="text-xl font-bold text-[#111827] mb-4">Explore other Pune localities</h2>
          <div className="flex flex-wrap gap-2">
            {otherLocalities.map((loc) => (
              <Link
                key={loc.slug}
                href={`/localities/${loc.slug}`}
                className="text-sm font-medium text-[#6b7280] bg-white border border-gray-200 hover:border-[#1a56db] hover:text-[#1a56db] px-4 py-2 rounded-full transition-colors"
              >
                {loc.name}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
