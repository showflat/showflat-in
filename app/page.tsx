import { readFileSync } from 'fs'
import { join } from 'path'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'ShowFlat.in — Pune New Launch Properties | Zero Brokerage',
  description:
    '6 RERA verified new launch projects in Pune. Zero brokerage. 1, 2 & 3 BHK apartments from ₹55L to ₹2Cr across 15 localities. Book a free site visit today.',
  keywords:
    'Pune new launch, Pune apartments, zero brokerage Pune, Hinjawadi flats, RERA verified Pune, showflat',
  openGraph: {
    title: "ShowFlat.in — Pune's Best New Launch Properties",
    description: 'Zero brokerage. 6 RERA verified projects. 15 localities. ₹55L to ₹2Cr.',
    type: 'website',
  },
}

const WA = 'https://wa.me/919130114411'

interface Config {
  type: string
  carpetSqft: number
  pricePerSqft: number
}
interface Project {
  id: string
  slug: string
  name: string
  builder: { name: string }
  locality: string
  possessionDate: string
  configs: Config[]
  priceRange: { min: number; max: number; displayMin: string; displayMax: string }
}
interface Locality {
  slug: string
  name: string
  microMarket: string
  pricing: { avgPricePerSqft: number; appreciation3yr: number }
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
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

function WaIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function HomePage() {
  const projects: Project[] = JSON.parse(
    readFileSync(join(process.cwd(), 'data/projects.json'), 'utf-8')
  )
  const localities: Locality[] = JSON.parse(
    readFileSync(join(process.cwd(), 'data/localities.json'), 'utf-8')
  )

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero projectCount={projects.length} localityCount={localities.length} />
      <StatsBar projectCount={projects.length} localityCount={localities.length} />
      <BudgetCategories projects={projects} />
      <FeaturedProjects projects={projects} />
      <LocalitiesStrip localities={localities} />
      <WhyShowFlat />
      <Footer />
    </div>
  )
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-baseline">
            <span className="text-2xl font-extrabold text-[#1a56db]">ShowFlat</span>
            <span className="text-2xl font-extrabold text-[#111827]">.in</span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {[
              { label: 'Properties', href: '/projects' },
              { label: 'Localities', href: '/localities' },
              { label: 'Tools', href: '/tools/emi-calculator' },
              { label: 'About', href: '/about' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-[#6b7280] hover:text-[#111827] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#16a34a] text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
          >
            <WaIcon />
            <span className="hidden sm:inline">WhatsApp us</span>
          </a>
        </div>
      </div>
    </nav>
  )
}

function Hero({ projectCount, localityCount }: { projectCount: number; localityCount: number }) {
  return (
    <section className="bg-gradient-to-br from-[#1a56db] to-[#1e3a8a] text-white py-12 px-4 sm:py-16">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
          Pune&apos;s #1 Zero Brokerage Channel Partner
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          Pune&apos;s best new launches.
          <br />
          <span className="text-green-300">Zero brokerage.</span>
        </h1>

        <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          {projectCount} RERA verified projects &middot; {localityCount} localities &middot; ₹55L to ₹2Cr
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#projects"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-[#1a56db] font-semibold px-8 py-3.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Browse projects
          </a>
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#16a34a] text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-green-700 transition-colors"
          >
            <WaIcon />
            WhatsApp us
          </a>
        </div>
      </div>
    </section>
  )
}

function StatsBar({ projectCount, localityCount }: { projectCount: number; localityCount: number }) {
  const stats = [
    { value: `${projectCount}+`, label: 'Projects' },
    { value: `${localityCount}`, label: 'Localities' },
    { value: '₹0', label: 'Brokerage' },
    { value: 'RERA', label: 'Verified' },
  ]
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`text-center ${i > 0 ? 'sm:border-l sm:border-gray-100' : ''}`}
            >
              <div className="text-3xl font-extrabold text-[#1a56db]">{s.value}</div>
              <div className="text-sm text-[#6b7280] font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BudgetCategories({ projects }: { projects: Project[] }) {
  const tiers = [
    {
      label: 'Affordable',
      budget: 'affordable',
      range: '₹50L–₹99L',
      desc: 'First home buyers & young IT professionals',
      filter: (p: Project) => p.priceRange.min < 10000000,
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      badge: 'bg-blue-100 text-blue-700',
      btn: 'bg-[#1a56db] hover:bg-blue-700 text-white',
    },
    {
      label: 'Premium',
      budget: 'premium',
      range: '₹1Cr–₹2Cr',
      desc: 'Upgrade buyers & senior professionals',
      filter: (p: Project) => p.priceRange.max >= 10000000 && p.priceRange.min < 20000000,
      border: 'border-green-200',
      bg: 'bg-green-50',
      badge: 'bg-green-100 text-green-700',
      btn: 'bg-[#16a34a] hover:bg-green-700 text-white',
    },
    {
      label: 'Luxury',
      budget: 'luxury',
      range: '₹2Cr+',
      desc: 'HNIs, NRIs & prestige addresses',
      filter: (p: Project) => p.priceRange.max >= 20000000,
      border: 'border-purple-200',
      bg: 'bg-purple-50',
      badge: 'bg-purple-100 text-purple-700',
      btn: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
  ]

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] text-center mb-2">
          Find your budget
        </h2>
        <p className="text-[#6b7280] text-center mb-10 text-sm sm:text-base">
          Curated projects for every price point in Pune
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const matching = projects.filter(tier.filter)
            const allConfigs = matching.flatMap((p) => p.configs)
            const avgPerSqft = allConfigs.length
              ? Math.round(allConfigs.reduce((s, c) => s + c.pricePerSqft, 0) / allConfigs.length)
              : 0
            const sampleNames = matching.slice(0, 3).map((p) => p.name)
            const count = matching.length

            return (
              <Link
                key={tier.label}
                href={`/projects?budget=${tier.budget}`}
                className={`rounded-2xl border-2 ${tier.border} ${tier.bg} p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tier.badge}`}>
                    {tier.label}
                  </span>
                  <span className="text-xs font-semibold text-[#6b7280]">
                    {count} project{count !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Range + desc */}
                <div className="text-2xl font-extrabold text-[#111827] mb-1">{tier.range}</div>
                <p className="text-sm text-[#6b7280] mb-5">{tier.desc}</p>

                {/* Project name list */}
                {sampleNames.length > 0 ? (
                  <ul className="space-y-2 mb-4 flex-1">
                    {sampleNames.map((name) => (
                      <li key={name} className="flex items-center gap-2 text-sm text-[#374151]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6b7280] shrink-0" />
                        <span className="truncate">{name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#6b7280] italic mb-4 flex-1">More launches coming soon</p>
                )}

                {/* Avg ₹/sqft */}
                {avgPerSqft > 0 && (
                  <p className="text-xs text-[#6b7280] mb-4">
                    Avg ₹{avgPerSqft.toLocaleString('en-IN')}/sqft
                  </p>
                )}

                {/* CTA */}
                <div className={`mt-auto flex items-center justify-center w-full text-sm font-semibold py-2.5 rounded-xl ${tier.btn} transition-colors`}>
                  Explore {count} project{count !== 1 ? 's' : ''} →
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ProjectCard({ p }: { p: Project }) {
  const waText = encodeURIComponent(
    `Hi ShowFlat! I want to book a site visit for ${p.name} in ${p.locality}.`
  )
  return (
    <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Stretched link covers entire card — sits at z-10 */}
      <Link
        href={`/projects/${p.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`View ${p.name} details`}
      />

      <div className="h-48 bg-gradient-to-b from-[#1a56db] to-[#0f2361] flex flex-col justify-between p-5">
        <div>
          <span className="text-xs font-bold bg-[#16a34a] text-white px-2.5 py-1 rounded-full">
            RERA ✓
          </span>
        </div>
        <div>
          <p className="text-blue-200 text-xs font-medium mb-1 truncate">{p.locality}, Pune</p>
          <h3 className="text-white font-extrabold text-xl leading-tight line-clamp-2 mb-3">{p.name}</h3>
          <div className="flex gap-2 flex-wrap">
            {p.configs.map((c) => (
              <span
                key={c.type}
                className="text-xs font-semibold bg-white/15 text-white/90 px-2.5 py-1 rounded-full"
              >
                {c.type}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs text-[#6b7280] mb-4">{p.builder.name}</p>

        <div className="mt-auto pt-3 border-t border-gray-100">
          <p className="text-lg font-extrabold text-[#1a56db] mb-2">
            ₹{p.priceRange.displayMin} – ₹{p.priceRange.displayMax}
          </p>
          <div className="flex gap-2 flex-wrap mb-3">
            <span className="text-xs bg-gray-100 text-[#6b7280] px-2.5 py-1 rounded-full font-medium">
              {carpetRange(p.configs)} carpet
            </span>
            <span className="text-xs bg-gray-100 text-[#6b7280] px-2.5 py-1 rounded-full font-medium">
              {formatPossession(p.possessionDate)}
            </span>
          </div>
          {/* z-20 sits above the z-10 stretched link so clicks go to WhatsApp */}
          <a
            href={`${WA}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-20 flex items-center justify-center gap-2 w-full bg-[#16a34a] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-green-700 transition-colors"
          >
            <WaIcon />
            Book site visit
          </a>
        </div>
      </div>
    </div>
  )
}

function FeaturedProjects({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] text-center mb-2">
          Featured projects
        </h2>
        <p className="text-[#6b7280] text-center mb-10 text-sm sm:text-base">
          All RERA verified &middot; Zero brokerage site visits
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  )
}

function LocalitiesStrip({ localities }: { localities: Locality[] }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-2">
            Explore Pune localities
          </h2>
          <p className="text-[#6b7280] text-sm sm:text-base">
            {localities.length} micro-markets — prices, appreciation &amp; IT connectivity at a glance
          </p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-6 px-4 sm:px-6 lg:px-8">
          {localities.map((l) => (
            <Link
              key={l.slug}
              href={`/localities/${l.slug}`}
              className="shrink-0 w-52 bg-white border border-gray-200 rounded-xl p-4 hover:border-[#1a56db] hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#6b7280] bg-gray-100 px-2 py-0.5 rounded-full font-medium truncate max-w-[7.5rem]">
                  {l.microMarket}
                </span>
                <span className="text-xs font-bold text-[#16a34a] shrink-0">
                  +{l.pricing.appreciation3yr}%
                </span>
              </div>
              <p className="font-bold text-[#111827] text-base mb-1">{l.name}</p>
              <p className="text-xs text-[#6b7280]">
                ₹{l.pricing.avgPricePerSqft.toLocaleString('en-IN')}/sqft avg
              </p>
              <p className="text-xs text-[#6b7280]">3yr appreciation</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhyShowFlat() {
  const features = [
    {
      icon: '₹0',
      title: 'Zero Brokerage',
      desc: 'You pay nothing. We earn from the builder — full transparency, no hidden charges ever.',
    },
    {
      icon: '✓',
      title: 'RERA Verified',
      desc: 'Every listing is MahaRERA registered. We share the registration number upfront, always.',
    },
    {
      icon: '🏠',
      title: 'Free Site Visit',
      desc: 'We schedule and accompany every visit. You ask questions — we make sure you get answers.',
    },
    {
      icon: '💬',
      title: 'WhatsApp Support',
      desc: 'Reach a real Pune property expert instantly. No bots. No queues. Just honest advice.',
    },
  ]
  return (
    <section className="py-16 px-4 bg-[#1a56db]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
          Why ShowFlat.in?
        </h2>
        <p className="text-blue-200 text-center mb-12 text-sm sm:text-base">
          The honest, no-pressure way to find your home in Pune
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/10 rounded-xl p-6 hover:bg-white/15 transition-colors"
            >
              <div className="text-3xl font-extrabold text-white mb-4">{f.icon}</div>
              <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-blue-100 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href={WA}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#16a34a] text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-green-700 transition-colors"
          >
            <WaIcon />
            Get started on WhatsApp — free
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const navLinks = [
    { label: 'Properties', href: '/projects' },
    { label: 'Localities', href: '/localities' },
    { label: 'Tools', href: '/tools/emi-calculator' },
    { label: 'About', href: '/about' },
  ]
  return (
    <footer className="bg-[#111827] text-gray-400 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          <div>
            <div className="flex items-baseline mb-3">
              <span className="text-xl font-extrabold text-[#1a56db]">ShowFlat</span>
              <span className="text-xl font-extrabold text-white">.in</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Pune&apos;s trusted new launch property specialists. Zero brokerage channel partner.
              Pune only.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Quick links</h4>
            <ul className="space-y-2">
              {navLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:info@showflat.in" className="hover:text-white transition-colors">
                  info@showflat.in
                </a>
              </li>
              <li>
                <a href="tel:+919130114411" className="hover:text-white transition-colors">
                  +91 91301 14411
                </a>
              </li>
              <li>
                <a
                  href={WA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors font-medium"
                >
                  <WaIcon />
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-600">
          <span>© 2025 ShowFlat.in &middot; Pune only &middot; Zero brokerage</span>
          <span>All projects are RERA registered under MahaRERA</span>
        </div>
      </div>
    </footer>
  )
}
