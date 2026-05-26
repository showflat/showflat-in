import { notFound } from 'next/navigation'
import { getProjectBySlug, getAllSlugs, getProjects } from '@/lib/projects'
import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar, { WA, WaIcon } from '@/app/components/Navbar'
import ConfigTabs from './ConfigTabs'
import PriceChart from './PriceChart'
import EmiCalculator from './EmiCalculator'
import GallerySection from './GallerySection'
import LoanSection from './LoanSection'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Config {
  type: string
  carpetSqft: number
  builtUpSqft: number
  priceMin: number
  priceMax: number
  pricePerSqft: number
  floors: string
  note?: string
}

interface Project {
  id: string
  name: string
  slug: string
  tagline: string
  builder: { name: string; slug?: string }
  locality: string
  microMarket: string
  address: string
  reraId: string
  reraUrl: string
  possessionDate: string
  projectType: string
  configs: Config[]
  totalUnits: number
  totalArea: string
  floors: number
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

function formatPossession(d: string): string {
  const [year, month] = d.split('-')
  return `${MONTHS[+month - 1]} ${year}`
}

function fmtINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
  return `₹${Math.round(n / 100000)} L`
}

function calcEMI(principal: number, annualRate: number, tenureYears: number): number {
  const r = annualRate / 12 / 100
  const n = tenureYears * 12
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
}

// ─── Static generation ────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = await getProjectBySlug(slug)
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
  const p = await getProjectBySlug(slug) as Project | null
  if (!p) notFound()
  const allProjects = await getProjects() as Project[]

  // WhatsApp links
  const waBook = `${WA}?text=${encodeURIComponent(
    `Hi ShowFlat! I want to book a site visit for ${p.name} in ${p.locality}.`
  )}`
  const waSheet = `${WA}?text=${encodeURIComponent(
    `Hi ShowFlat! Please share the price sheet for ${p.name} in ${p.locality}.`
  )}`
  const waPhotos = `${WA}?text=${encodeURIComponent(
    `Hi ShowFlat! Please share photos and floor plans for ${p.name} in ${p.locality}.`
  )}`
  const waFloorPlan = `${WA}?text=${encodeURIComponent(
    `Hi ShowFlat! Please send me the floor plan PDF for ${p.name}.`
  )}`

  // Derived values
  const carpetMin = Math.min(...p.configs.map((c) => c.carpetSqft))
  const carpetMax = Math.max(...p.configs.map((c) => c.carpetSqft))
  const lowestPricePerSqft = Math.min(...p.configs.map((c) => c.pricePerSqft))
  const loanAmount = Math.round(p.priceRange.min * 0.8)
  const savingsMin = Math.round((p.priceRange.min * 0.02) / 100000)
  const savingsMax = Math.round((p.priceRange.max * 0.02) / 100000)
  const builderProjects = allProjects.filter(
    (pr) => pr.builder.name === p.builder.name && pr.slug !== p.slug
  )
  const similar = allProjects
    .filter((pr) => pr.microMarket === p.microMarket && pr.slug !== p.slug)
    .slice(0, 3)

  const loanScenarios = [
    { tenure: 20, label: '20-year loan', emi: calcEMI(loanAmount, 8.5, 20) },
    { tenure: 15, label: '15-year loan', emi: calcEMI(loanAmount, 8.5, 15) },
    { tenure: 25, label: '25-year loan', emi: calcEMI(loanAmount, 8.5, 25) },
  ]

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 lg:pb-12">

        {/* ── HERO GALLERY (full-width) ─────────────────────────────────── */}
        <div className="mb-6">
          <GallerySection projectName={p.name} waPhotos={waPhotos} />
        </div>

        {/* ── PROJECT HEADER (full-width) ───────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] leading-tight mb-2">
                {p.name}
              </h1>

              {/* Builder + verified badge */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="font-semibold text-[#374151]">{p.builder.name}</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Verified Builder
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-sm text-[#6b7280] mb-4">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#1a56db] shrink-0">
                  <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                </svg>
                {p.address}, {p.microMarket}, Pune
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="text-xs font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                  RERA ✓ {p.reraId}
                </span>
                <span className="text-xs font-semibold bg-blue-50 text-[#1a56db] px-3 py-1.5 rounded-full border border-blue-100">
                  New Launch
                </span>
                <span className="text-xs font-semibold bg-gray-100 text-[#6b7280] px-3 py-1.5 rounded-full">
                  {p.totalArea}
                </span>
                {p.floors && (
                  <span className="text-xs font-semibold bg-gray-100 text-[#6b7280] px-3 py-1.5 rounded-full">
                    {p.floors} floors
                  </span>
                )}
              </div>

              {/* Price */}
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-[#1a56db] leading-none">
                  ₹{p.priceRange.displayMin}
                  <span className="text-2xl sm:text-3xl text-[#6b7280] font-semibold mx-2">–</span>
                  ₹{p.priceRange.displayMax}
                </p>
                <p className="text-sm text-[#6b7280] mt-1.5">
                  Starting ₹{lowestPricePerSqft.toLocaleString('en-IN')}/sqft
                </p>
              </div>
            </div>

            {/* Share / Save (decorative) */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              <button className="flex items-center gap-1.5 text-xs font-medium text-[#6b7280] border border-gray-200 bg-white hover:border-[#1a56db] hover:text-[#1a56db] px-3 py-2 rounded-xl transition-colors">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.475l6.733-3.366A2.52 2.52 0 0113 4.5z" />
                </svg>
                Share
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium text-[#6b7280] border border-gray-200 bg-white hover:border-red-400 hover:text-red-500 px-3 py-2 rounded-xl transition-colors">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.184C4.032 12.348 2.5 10.246 2.5 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118.5 7.5c0 2.746-1.532 4.848-3.385 6.536a22.049 22.049 0 01-2.582 2.184 21.36 21.36 0 01-1.162.682l-.019.01-.005.003h-.002a.739.739 0 01-.696 0h-.002z" />
                </svg>
                Save
              </button>
            </div>
          </div>

          {/* Highlights */}
          {p.highlights.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {p.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-[#374151]">
                    <span className="text-[#16a34a] mt-0.5 shrink-0 font-bold">✓</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── QUICK FACTS BAR (full-width) ──────────────────────────────── */}
        <div className="bg-white rounded-2xl px-4 sm:px-6 py-4 shadow-sm mb-6 overflow-x-auto">
          <div className="flex items-center gap-4 sm:gap-6 min-w-max sm:min-w-0 sm:flex-wrap text-sm">
            <div className="flex items-center gap-2">
              <span>🏠</span>
              <span className="text-[#374151]"><span className="font-bold text-[#111827]">{p.totalUnits}</span> Units</span>
            </div>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-2">
              <span>📐</span>
              <span className="text-[#374151]">
                <span className="font-bold text-[#111827]">{carpetMin}–{carpetMax}</span> sqft
              </span>
            </div>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-2">
              <span>🏗️</span>
              <span className="text-[#374151]">
                <span className="font-bold text-[#111827]">{formatPossession(p.possessionDate)}</span> Possession
              </span>
            </div>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                ✅ RERA Registered
              </span>
            </div>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-2">
              <span>🏦</span>
              <span className="text-[#374151]">
                <span className="font-bold text-[#111827]">{p.approvedBanks.length}</span> Banks Approved
              </span>
            </div>
          </div>
        </div>

        {/* ── TWO-COLUMN GRID ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Configurations */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#111827] mb-5">Configurations & Floor Plans</h2>
              <ConfigTabs
                  configs={p.configs}
                  waFloorPlan={waFloorPlan}
                  projectName={p.name}
                  projectLocality={p.locality}
                  projectFloors={p.floors}
                />
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#111827] mb-5">
                Amenities{' '}
                <span className="text-sm font-normal text-[#6b7280]">({p.amenities.length})</span>
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
                      <span className="text-xs font-medium text-[#6b7280] leading-tight">{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Nearby IT hubs */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#111827] mb-5">Nearby IT hubs</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-3 font-semibold text-[#6b7280] text-xs uppercase tracking-wide">IT Park</th>
                      <th className="text-right pb-3 font-semibold text-[#6b7280] text-xs uppercase tracking-wide">Distance</th>
                      <th className="text-right pb-3 font-semibold text-[#6b7280] text-xs uppercase tracking-wide">Commute</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.nearbyIT.map((hub, i) => (
                      <tr key={hub.name} className={i < p.nearbyIT.length - 1 ? 'border-b border-gray-50' : ''}>
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

            {/* Price trend chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <PriceChart history={p.priceHistory} appreciation={p.appreciation3yr} />
            </div>

            {/* Nearby places */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#111827] mb-5">Nearby places</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {p.nearbyPlaces.map((place) => (
                  <div
                    key={place.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{PLACE_ICONS[place.type] ?? '📍'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#111827] truncate">{place.name}</p>
                        <p className="text-xs text-[#6b7280] capitalize">{place.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#6b7280] bg-white border border-gray-200 px-2.5 py-1 rounded-full shrink-0 ml-2">
                      {place.distanceKm} km
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* About the Builder */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#111827] mb-4">About the Builder</h2>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1a56db] to-[#0f2361] flex items-center justify-center shrink-0">
                  <span className="text-white font-extrabold text-lg leading-none">
                    {p.builder.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-[#111827] text-lg">{p.builder.name}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200 mt-1">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    RERA Verified Developer — Pune
                  </span>
                </div>
              </div>

              {builderProjects.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[#374151] mb-3">
                    Other projects by {p.builder.name}
                  </p>
                  <div className="space-y-2">
                    {builderProjects.map((bp) => (
                      <Link
                        key={bp.slug}
                        href={`/projects/${bp.slug}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#1a56db] hover:bg-blue-50 transition-colors group"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#111827] group-hover:text-[#1a56db] transition-colors">
                            {bp.name}
                          </p>
                          <p className="text-xs text-[#6b7280]">{bp.locality}, Pune</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-sm font-bold text-[#1a56db]">
                            ₹{bp.priceRange.displayMin}+
                          </p>
                          <p className="text-xs text-[#6b7280]">onwards</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/projects"
                    className="mt-3 inline-block text-sm font-semibold text-[#1a56db] hover:underline"
                  >
                    View all {p.builder.name} projects →
                  </Link>
                </div>
              )}
            </div>

            {/* Home Loan Snapshot */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <LoanSection propertyPrice={p.priceRange.min} />
            </div>

            {/* Why Zero Brokerage Matters */}
            <div className="bg-gradient-to-br from-[#1a56db] to-[#0f2361] rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-2">Why Zero Brokerage Matters</h2>
              <p className="text-blue-200 text-sm mb-5">
                With ShowFlat.in, you save{' '}
                <span className="text-white font-bold">
                  ₹{savingsMin}L–₹{savingsMax}L
                </span>{' '}
                in brokerage on this project.
              </p>

              <div className="space-y-3 mb-6">
                {[
                  {
                    icon: '💸',
                    title: 'Same price as going direct',
                    body: 'We are a RERA channel partner — our fee is paid by the developer, not you. You pay the same price as walking into the site office.',
                  },
                  {
                    icon: '🎯',
                    title: 'No conflict of interest',
                    body: 'Traditional brokers earn more when you buy expensive. We earn the same regardless — so our only job is to find you the right fit.',
                  },
                  {
                    icon: '🤝',
                    title: 'Dedicated support, end to end',
                    body: 'From shortlisting to paperwork, we are on WhatsApp throughout. Real people, no bots.',
                  },
                ].map((point) => (
                  <div key={point.title} className="flex gap-3 bg-white/10 rounded-xl p-4">
                    <span className="text-2xl shrink-0">{point.icon}</span>
                    <div>
                      <p className="font-bold text-white text-sm">{point.title}</p>
                      <p className="text-blue-200 text-xs mt-0.5 leading-relaxed">{point.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={waBook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3.5 rounded-xl transition-colors text-sm w-full"
              >
                <WaIcon />
                Book your free site visit now
              </a>
            </div>

            {/* About this project */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#111827] mb-4">About this project</h2>
              <p className="text-sm text-[#6b7280] leading-relaxed">{p.seoDescription}</p>
              <a
                href={p.reraUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs text-[#6b7280] hover:text-[#1a56db] transition-colors"
              >
                MahaRERA ID: {p.reraId} ↗
              </a>
            </div>
          </div>

          {/* ── RIGHT COLUMN — sticky sidebar ────────────────────────────── */}
          <div className="lg:sticky lg:top-[76px] lg:h-fit">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">

              {/* Price range */}
              <div>
                <p className="text-xs font-medium text-[#6b7280] mb-1">Price range</p>
                <p className="text-3xl font-extrabold text-[#1a56db] leading-tight">
                  ₹{p.priceRange.displayMin}
                </p>
                <p className="text-lg font-semibold text-[#6b7280]">to ₹{p.priceRange.displayMax}</p>
                <p className="text-xs text-[#6b7280] mt-1">
                  Starting ₹{lowestPricePerSqft.toLocaleString('en-IN')}/sqft
                </p>
              </div>

              {/* Possession date */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-xs text-[#6b7280]">Possession</p>
                  <p className="font-bold text-[#111827] text-base">{formatPossession(p.possessionDate)}</p>
                </div>
              </div>

              {/* EMI calculator */}
              <div>
                <h3 className="font-bold text-[#111827] mb-4 text-base">EMI calculator</h3>
                <EmiCalculator propertyPrice={p.priceRange.min} />
              </div>

              <hr className="border-gray-100" />

              {/* Approved banks */}
              <div>
                <p className="text-xs font-semibold text-[#6b7280] mb-3">Approved banks</p>
                <div className="flex flex-wrap gap-2">
                  {p.approvedBanks.map((bank) => (
                    <span key={bank} className="text-xs bg-gray-100 text-[#6b7280] px-2.5 py-1 rounded-full font-medium">
                      {bank}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA buttons */}
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
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                >
                  <div className="relative h-36 bg-gradient-to-b from-[#1a56db] to-[#0f2361] flex flex-col justify-between p-4">
                    <span className="text-xs font-bold bg-[#16a34a] text-white px-2 py-0.5 rounded-full self-start">
                      RERA ✓
                    </span>
                    <div>
                      <p className="text-blue-200 text-xs mb-0.5">{sp.locality}, Pune</p>
                      <p className="text-white font-bold text-base leading-snug line-clamp-2">{sp.name}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-[#6b7280] mb-2">{sp.builder.name}</p>
                    <p className="text-base font-extrabold text-[#1a56db]">
                      ₹{sp.priceRange.displayMin} – ₹{sp.priceRange.displayMax}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {sp.configs.map((c) => (
                        <span key={c.type} className="text-xs bg-gray-100 text-[#6b7280] px-2 py-0.5 rounded-full">
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
