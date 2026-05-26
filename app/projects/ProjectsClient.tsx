'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Config {
  type: string
  carpetSqft: number
  builtUpSqft: number
  priceMin: number
  priceMax: number
  pricePerSqft: number
  unitsTotal: number
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
  possessionDate: string
  configs: Config[]
  totalUnits: number
  priceRange: { min: number; max: number; displayMin: string; displayMax: string }
  highlights: string[]
  launchDate: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WA = 'https://wa.me/919130114411'

const BUDGET_OPTIONS = [
  { label: 'All budgets', value: 'all' },
  { label: 'Under ₹75L', value: 'u75' },
  { label: '₹75L–1Cr', value: '75-100' },
  { label: '₹1Cr–1.5Cr', value: '100-150' },
  { label: '₹1.5Cr+', value: '150plus' },
]

const BHK_OPTIONS = [
  { label: 'All BHK', value: 'all' },
  { label: '1BHK', value: '1BHK' },
  { label: '2BHK', value: '2BHK' },
  { label: '3BHK', value: '3BHK' },
  { label: '3BHK+', value: '3BHK+' },
]

const POSSESSION_OPTIONS = [
  { label: 'Any time', value: 'all' },
  { label: 'Before 2026', value: 'before2026' },
  { label: '2026–2027', value: '2026-2027' },
  { label: '2027+', value: '2027plus' },
]

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Earliest Possession', value: 'possession' },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPossession(d: string): string {
  const [year, month] = d.split('-')
  return `${MONTHS[+month - 1]} ${year}`
}

function carpetRange(configs: Config[]): string {
  const areas = configs.map((c) => c.carpetSqft)
  const min = Math.min(...areas)
  const max = Math.max(...areas)
  return min === max ? `${min} sqft` : `${min}–${max} sqft`
}

function bhkTypes(configs: Config[]): string[] {
  return [...new Set(configs.map((c) => c.type))]
}

function matchesBudget(project: Project, budget: string): boolean {
  const { min, max } = project.priceRange
  if (budget === 'all') return true
  if (budget === 'u75') return min < 7500000
  if (budget === '75-100') return min < 10000000 && max >= 7500000
  if (budget === '100-150') return min < 15000000 && max >= 10000000
  if (budget === '150plus') return max >= 15000000
  return true
}

function matchesBHK(project: Project, bhk: string): boolean {
  if (bhk === 'all') return true
  if (bhk === '3BHK+') return project.configs.some((c) => c.type === '3BHK' || c.type === '4BHK' || c.type === '3.5BHK' || +c.type[0] >= 3)
  return project.configs.some((c) => c.type === bhk)
}

function matchesPossession(project: Project, possession: string): boolean {
  if (possession === 'all') return true
  const [year] = project.possessionDate.split('-').map(Number)
  if (possession === 'before2026') return year < 2026
  if (possession === '2026-2027') return year >= 2026 && year <= 2027
  if (possession === '2027plus') return year >= 2027
  return true
}

function sortProjects(projects: Project[], sort: string): Project[] {
  const copy = [...projects]
  if (sort === 'price-asc') return copy.sort((a, b) => a.priceRange.min - b.priceRange.min)
  if (sort === 'price-desc') return copy.sort((a, b) => b.priceRange.max - a.priceRange.max)
  if (sort === 'possession') return copy.sort((a, b) => a.possessionDate.localeCompare(b.possessionDate))
  return copy.sort((a, b) => b.launchDate.localeCompare(a.launchDate))
}

// ─── WA Icon ─────────────────────────────────────────────────────────────────

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const bhks = bhkTypes(project.configs)
  const carpet = carpetRange(project.configs)
  const possession = formatPossession(project.possessionDate)

  const waText = encodeURIComponent(
    `Hi, I'm interested in ${project.name} in ${project.locality}. Please share details.`
  )

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Stretched link covers entire card at z-10 */}
      <Link
        href={`/projects/${project.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`View ${project.name} details`}
      />

      {/* Cover */}
      <div className="h-44 bg-gradient-to-br from-[#1a56db] to-[#0f2361] p-5 flex flex-col justify-between">
        <div className="flex gap-2 flex-wrap">
          {bhks.map((b) => (
            <span key={b} className="text-xs font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              {b}
            </span>
          ))}
        </div>
        <div>
          <p className="text-blue-200 text-xs font-medium mb-0.5">{project.locality}</p>
          <h3 className="text-white font-bold text-lg leading-snug line-clamp-2">{project.name}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-[#6b7280] font-medium mb-3">{project.builder.name}</p>

        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-xl font-extrabold text-[#111827]">
            ₹{project.priceRange.displayMin}
          </span>
          <span className="text-sm text-[#6b7280]">–</span>
          <span className="text-sm font-semibold text-[#6b7280]">
            ₹{project.priceRange.displayMax}
          </span>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          <span className="text-xs bg-gray-100 text-[#6b7280] px-2 py-1 rounded-full">
            {carpet}
          </span>
          <span className="text-xs bg-blue-50 text-[#1a56db] px-2 py-1 rounded-full font-medium">
            Possession {possession}
          </span>
        </div>

        <div className="mt-auto">
          {/* z-20 sits above the z-10 stretched link */}
          <a
            href={`${WA}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-20 flex items-center justify-center gap-2 w-full bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            <WaIcon />
            Book Free Site Visit
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Filter Pill ──────────────────────────────────────────────────────────────

function Pill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'bg-[#1a56db] text-white shadow-sm'
          : 'bg-white text-[#6b7280] border border-gray-200 hover:border-[#1a56db] hover:text-[#1a56db]'
      }`}
    >
      {label}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

function resolveBudget(param: string | undefined): string {
  if (!param) return 'all'
  if (param === 'affordable') return 'u75'
  if (param === 'premium') return '100-150'
  if (param === 'luxury') return '150plus'
  const valid = ['all', 'u75', '75-100', '100-150', '150plus']
  return valid.includes(param) ? param : 'all'
}

export default function ProjectsClient({
  projects,
  initialBudget,
}: {
  projects: Project[]
  initialBudget?: string
}) {
  const [budget, setBudget] = useState(() => resolveBudget(initialBudget))
  const [bhk, setBhk] = useState('all')
  const [locality, setLocality] = useState('all')
  const [possession, setPossession] = useState('all')
  const [sort, setSort] = useState('newest')

  const localities = useMemo(() => {
    const all = [...new Set(projects.map((p) => p.locality))].sort()
    return [{ label: 'All localities', value: 'all' }, ...all.map((l) => ({ label: l, value: l }))]
  }, [projects])

  const filtered = useMemo(() => {
    const result = projects.filter((p) => {
      if (!matchesBudget(p, budget)) return false
      if (!matchesBHK(p, bhk)) return false
      if (locality !== 'all' && p.locality !== locality) return false
      if (!matchesPossession(p, possession)) return false
      return true
    })
    return sortProjects(result, sort)
  }, [projects, budget, bhk, locality, possession, sort])

  const activeFilterCount = [
    budget !== 'all',
    bhk !== 'all',
    locality !== 'all',
    possession !== 'all',
  ].filter(Boolean).length

  function clearAll() {
    setBudget('all')
    setBhk('all')
    setLocality('all')
    setPossession('all')
    setSort('newest')
  }

  return (
    <div>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-4 py-5 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-extrabold text-[#111827]">New Launch Projects in Pune</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            {filtered.length} project{filtered.length !== 1 ? 's' : ''} · Zero brokerage · RERA verified
          </p>
        </div>
      </div>

      {/* ── Sticky filter bar ───────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 py-3 overflow-x-auto scrollbar-hide">
            {/* Budget pills */}
            <div className="flex gap-2 flex-shrink-0">
              {BUDGET_OPTIONS.map((o) => (
                <Pill key={o.value} label={o.label} active={budget === o.value} onClick={() => setBudget(o.value)} />
              ))}
            </div>

            <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

            {/* BHK pills */}
            <div className="flex gap-2 flex-shrink-0">
              {BHK_OPTIONS.map((o) => (
                <Pill key={o.value} label={o.label} active={bhk === o.value} onClick={() => setBhk(o.value)} />
              ))}
            </div>

            <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

            {/* Locality dropdown */}
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className={`flex-shrink-0 text-sm font-medium border rounded-full px-3.5 py-1.5 outline-none cursor-pointer transition-colors ${
                locality !== 'all'
                  ? 'border-[#1a56db] text-[#1a56db] bg-blue-50'
                  : 'border-gray-200 text-[#6b7280] bg-white hover:border-[#1a56db]'
              }`}
            >
              {localities.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>

            {/* Possession pills */}
            <div className="flex gap-2 flex-shrink-0">
              {POSSESSION_OPTIONS.map((o) => (
                <Pill key={o.value} label={o.label} active={possession === o.value} onClick={() => setPossession(o.value)} />
              ))}
            </div>

            <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="flex-shrink-0 text-sm font-medium border border-gray-200 text-[#6b7280] bg-white rounded-full px-3.5 py-1.5 outline-none cursor-pointer hover:border-[#1a56db] transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Clear all */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="flex-shrink-0 flex items-center gap-1.5 text-sm font-semibold text-[#1a56db] bg-blue-50 hover:bg-blue-100 border border-blue-100 px-3.5 py-1.5 rounded-full transition-colors"
              >
                Clear
                <span className="w-4 h-4 rounded-full bg-[#1a56db] text-white text-xs flex items-center justify-center leading-none">
                  {activeFilterCount}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Results ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-[#111827] mb-2">No projects match your filters</h2>
            <p className="text-[#6b7280] text-sm mb-6 max-w-xs">
              Try adjusting your budget, BHK, or location. Or let us find the right project for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={clearAll}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#111827] hover:bg-gray-50 transition-colors"
              >
                Clear all filters
              </button>
              <a
                href={`${WA}?text=${encodeURIComponent("Hi, I'm looking for a project in Pune. Can you help me find the right one?")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold transition-colors"
              >
                <WaIcon />
                Tell us what you're looking for
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
