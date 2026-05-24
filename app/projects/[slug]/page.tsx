import { readFileSync } from 'fs'
import { join } from 'path'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar, { WA, WaIcon } from '@/app/components/Navbar'
import ConfigTabs from './ConfigTabs'
import PriceChart from './PriceChart'
import EmiCalculator from './EmiCalculator'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Config {
  type: string
  carpetSqft: number
  builtUpSqft: number
  priceMin: number
  priceMax: number
  pricePerSqft: number
  unitsTotal: number
  unitsAvailable: number
  floors: string
  note?: string
}

interface Project {
  id: string
  name: string
  slug: string
  tagline: string
  builder: { name: string }
  locality: string
  microMarket: string
  address: string
  reraId: string
  reraUrl: string
  possessionDate: string
  projectType: string
  configs: Config[]
  totalUnits: number
  unitsSold: number
  totalArea: string
  priceRange: { min: number; max: number; displayMin: string; displayMax: string }
  amenities: string[]
  nearbyIT: { name: string; distanceKm: number; commuteMin: number }[]
  nearbyPlaces: { name: string; type: string; distanceKm: number }[]
  priceHistory: { date: string; pricePerSqft: number }[]
  appreciation3yr: number
  approvedBanks: string[]
  highlights: string[]
  seoDescription: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AMENITIES: Record<string, [string, string]> = {
  clubhouse: ['🏛️', 'Clubhouse'],
  swimming_pool: ['🏊', 'Swimming Pool'],
  gym: ['🏋️', 'Gym'],
  children_play_area: ['🛝', "Children's Play"],
  jogging_track: ['🏃', 'Jogging Track'],
  yoga_deck: ['🧘', 'Yoga Deck'],
  co_working_space: ['💻', 'Co-Working'],
  ev_charging: ['⚡', 'EV Charging'],
  power_backup_100pct: ['🔋', 'Power Backup'],
  visitor_parking: ['🅿️', 'Visitor Parking'],
  cctv_surveillance: ['📹', 'CCTV'],
  intercom: ['📞', 'Intercom'],
  rainwater_harvesting: ['💧', 'Rainwater Harvesting'],
  solar_panels: ['☀️', 'Solar Panels'],
  amphitheatre: ['🎭', 'Amphitheatre'],
  badminton_court: ['🏸', 'Badminton'],
  indoor_games: ['🎮', 'Indoor Games'],
  senior_citizen_area: ['🪑', 'Senior Citizen Area'],
  covered_parking: ['🚗', 'Covered Parking'],
  landscape_garden: ['🌳', 'Garden'],
  meditation_zone: ['🧘', 'Meditation Zone'],
  cycle_track: ['🚴', 'Cycle Track'],
  tennis_court: ['🎾', 'Tennis Court'],
  smart_home_features: ['📱', 'Smart Home'],
  party_lawn: ['🎉', 'Party Lawn'],
  squash_court: ['🏓', 'Squash Court'],
  organic_garden: ['🌱', 'Organic Garden'],
  rooftop_lounge: ['🌆', 'Rooftop Lounge'],
  concierge: ['🛎️', 'Concierge'],
  retail_shops_ground: ['🛍️', 'Retail Shops'],
  meditation_room: ['🧘', 'Meditation Room'],
}

const PLACE_ICONS: Record<string, string> = {
  mall: '🛍️',
  school: '🏫',
  hospital: '🏥',
  landmark: '📍',
  market: '🛒',
  township: '🏘️',
  university: '🎓',
  supermarket: '🛒',
  highway: '🛣️',
  neighbourhood: '🏘️',
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readProjects(): Project[] {
  return JSON.parse(readFileSync(join(process.cwd(), 'data/projects.json'), 'utf-8'))
}

function formatPossession(d: string): string {
  const [year, month] = d.split('-')
  return `${MONTHS[+month - 1]} ${year}`
}

// ─── Static generation ────────────────────────────────────────────────────────

export function generateStaticParams() {
  return readProjects().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = readProjects().find((pr) => pr.slug === slug)
  if (!p) return { title: 'Project Not Found | ShowFlat.in' }
  return {
    title: `${p.name} by ${p.builder.name} in ${p.locality} Pune | ShowFlat.in`,
    description: p.seoDescription,
    openGraph: {
      title: `${p.name} in ${p.locality}, Pune`,
      description: p.seoDescription,
      type: 'website',
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const allProjects = readProjects()
  const p = allProjects.find((pr) => pr.slug === slug)
  if (!p) notFound()

  const waBook = `${WA}?text=${encodeURIComponent(
    `Hi ShowFlat! I want to book a site visit for ${p.name} in ${p.locality}.`
  )}`
  const waSheet = `${WA}?text=${encodeURIComponent(
    `Hi ShowFlat! Please share the price sheet for ${p.name} in ${p.locality}.`
  )}`

  const unitsPct = Math.round((p.unitsSold / p.totalUnits) * 100)

  const similar = allProjects
    .filter((pr) => pr.microMarket === p.microMarket && pr.slug !== p.slug)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs text-[#6b7280]">
          <Link href="/" className="hover:text-[#1a56db] transition-colors">Home</Link>
          <span>›</span>
          <Link href="/projects" className="hover:text-[#1a56db] transition-colors">Projects</Link>
          <span>›</span>
          <span className="text-[#111827] font-medium truncate">{p.name}</span>
        </nav>
      </div>

      {/* Main content — mobile single col, desktop two col */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Hero cover */}
            <div className="relative h-72 sm:h-80 bg-gradient-to-b from-[#1a56db] to-[#0f2361] rounded-2xl overflow-hidden flex flex-col justify-between p-6 sm:p-8">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold bg-[#16a34a] text-white px-3 py-1.5 rounded-full">
                  RERA ✓
                </span>
                <span className="text-xs font-medium bg-white/10 text-white/80 px-3 py-1.5 rounded-full">
                  {p.projectType}
                </span>
              </div>
              <div>
                <p className="text-blue-200 text-sm mb-2">
                  {p.locality}, {p.microMarket}, Pune
                </p>
                <h1 className="text-white text-3xl sm:text-4xl font-extrabold leading-tight mb-2">
                  {p.name}
                </h1>
                <p className="text-blue-100 text-sm leading-relaxed">{p.tagline}</p>
              </div>
            </div>

            {/* 2. Project header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs font-semibold bg-blue-50 text-[#1a56db] px-3 py-1 rounded-full border border-blue-100">
                  {p.microMarket}
                </span>
                <span className="text-xs font-semibold bg-gray-100 text-[#6b7280] px-3 py-1 rounded-full">
                  {p.locality}
                </span>
                <span className="text-xs font-semibold bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">
                  New Launch
                </span>
                <span className="text-xs font-semibold bg-gray-100 text-[#6b7280] px-3 py-1 rounded-full">
                  {p.totalArea}
                </span>
              </div>

              <p className="font-bold text-[#111827] text-lg mb-1">{p.builder.name}</p>
              <p className="text-sm text-[#6b7280] mb-1">{p.address}</p>
              <a
                href={p.reraUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#6b7280] hover:text-[#1a56db] transition-colors"
              >
                MahaRERA ID: {p.reraId} ↗
              </a>

              {p.highlights.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-[#111827]">
                      <span className="text-[#16a34a] mt-0.5 shrink-0 font-bold">✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 3. Configuration tabs */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#111827] mb-5">Configurations</h2>
              <ConfigTabs configs={p.configs} />
            </div>

            {/* 4. Amenities */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#111827] mb-5">
                Amenities{' '}
                <span className="text-sm font-normal text-[#6b7280]">
                  ({p.amenities.length})
                </span>
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {p.amenities.map((key) => {
                  const [icon, label] = AMENITIES[key] ?? ['•', key.replace(/_/g, ' ')]
                  return (
                    <div
                      key={key}
                      className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100 text-center"
                    >
                      <span className="text-2xl leading-none">{icon}</span>
                      <span className="text-xs font-medium text-[#6b7280] leading-tight">
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 5. Nearby IT hubs */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#111827] mb-5">Nearby IT hubs</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-3 font-semibold text-[#6b7280] text-xs uppercase tracking-wide">
                        IT Park
                      </th>
                      <th className="text-right pb-3 font-semibold text-[#6b7280] text-xs uppercase tracking-wide">
                        Distance
                      </th>
                      <th className="text-right pb-3 font-semibold text-[#6b7280] text-xs uppercase tracking-wide">
                        Commute
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.nearbyIT.map((hub, i) => (
                      <tr
                        key={hub.name}
                        className={i < p.nearbyIT.length - 1 ? 'border-b border-gray-50' : ''}
                      >
                        <td className="py-3 font-medium text-[#111827]">{hub.name}</td>
                        <td className="py-3 text-right text-[#6b7280]">{hub.distanceKm} km</td>
                        <td className="py-3 text-right">
                          <span className="bg-blue-50 text-[#1a56db] text-xs font-semibold px-2.5 py-1 rounded-full">
                            {hub.commuteMin} min
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6. Price trend chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <PriceChart history={p.priceHistory} appreciation={p.appreciation3yr} />
            </div>

            {/* 7. Nearby places */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#111827] mb-5">Nearby places</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {p.nearbyPlaces.map((place) => (
                  <div
                    key={place.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">
                        {PLACE_ICONS[place.type] ?? '📍'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#111827] truncate">
                          {place.name}
                        </p>
                        <p className="text-xs text-[#6b7280] capitalize">
                          {place.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#6b7280] bg-white border border-gray-200 px-2.5 py-1 rounded-full shrink-0 ml-2">
                      {place.distanceKm} km
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. About */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#111827] mb-4">About this project</h2>
              <p className="text-sm text-[#6b7280] leading-relaxed">{p.seoDescription}</p>
            </div>
          </div>

          {/* ── RIGHT COLUMN — sticky sidebar ───────────────────────────── */}
          <div className="lg:sticky lg:top-[76px] lg:h-fit">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">

              {/* 1. Price range */}
              <div>
                <p className="text-xs font-medium text-[#6b7280] mb-1">Price range</p>
                <p className="text-3xl font-extrabold text-[#1a56db] leading-tight">
                  ₹{p.priceRange.displayMin}
                </p>
                <p className="text-lg font-semibold text-[#6b7280]">
                  to ₹{p.priceRange.displayMax}
                </p>
              </div>

              {/* 2. Units sold progress bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#6b7280]">
                    {p.unitsSold} of {p.totalUnits} units sold
                  </span>
                  <span className="font-bold text-[#111827]">{unitsPct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1a56db] rounded-full"
                    style={{ width: `${unitsPct}%` }}
                  />
                </div>
                <p className="text-xs text-[#6b7280] mt-1.5">
                  {p.totalUnits - p.unitsSold} units remaining
                </p>
              </div>

              {/* 3. Possession date */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-xs text-[#6b7280]">Possession</p>
                  <p className="font-bold text-[#111827] text-base">
                    {formatPossession(p.possessionDate)}
                  </p>
                </div>
              </div>

              {/* 4. EMI calculator */}
              <div>
                <h3 className="font-bold text-[#111827] mb-4 text-base">EMI calculator</h3>
                <EmiCalculator propertyPrice={p.priceRange.min} />
              </div>

              <hr className="border-gray-100" />

              {/* 5. Approved banks */}
              <div>
                <p className="text-xs font-semibold text-[#6b7280] mb-3">Approved banks</p>
                <div className="flex flex-wrap gap-2">
                  {p.approvedBanks.map((bank) => (
                    <span
                      key={bank}
                      className="text-xs bg-gray-100 text-[#6b7280] px-2.5 py-1 rounded-full font-medium"
                    >
                      {bank}
                    </span>
                  ))}
                </div>
              </div>

              {/* 6 & 7. CTA buttons */}
              <div className="space-y-3">
                <a
                  href={waBook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#16a34a] text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-colors text-sm"
                >
                  <WaIcon />
                  Book free site visit
                </a>
                <a
                  href={waSheet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full border-2 border-[#16a34a] text-[#16a34a] font-semibold py-3 rounded-xl hover:bg-green-50 transition-colors text-sm"
                >
                  <WaIcon />
                  Get price sheet on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Similar projects ──────────────────────────────────────────── */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-[#111827] mb-6">
              Similar projects in {p.microMarket}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((sp) => (
                <Link
                  key={sp.id}
                  href={`/projects/${sp.slug}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col"
                >
                  <div className="relative h-36 bg-gradient-to-b from-[#1a56db] to-[#0f2361] flex flex-col justify-between p-4">
                    <span className="text-xs font-bold bg-[#16a34a] text-white px-2 py-0.5 rounded-full self-start">
                      RERA ✓
                    </span>
                    <div>
                      <p className="text-blue-200 text-xs mb-0.5">{sp.locality}, Pune</p>
                      <p className="text-white font-bold text-base leading-snug line-clamp-2">
                        {sp.name}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-[#6b7280] mb-2">{sp.builder.name}</p>
                    <p className="text-base font-extrabold text-[#1a56db]">
                      ₹{sp.priceRange.displayMin} – ₹{sp.priceRange.displayMax}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {sp.configs.map((c) => (
                        <span
                          key={c.type}
                          className="text-xs bg-gray-100 text-[#6b7280] px-2 py-0.5 rounded-full"
                        >
                          {c.type}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 lg:hidden z-40 shadow-lg">
        <a
          href={waBook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#16a34a] text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-colors text-sm"
        >
          <WaIcon />
          Book free site visit — zero brokerage
        </a>
      </div>
    </div>
  )
}
