// Run: node scripts/seed-supabase.mjs
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read .env.local manually
const envPath = join(__dirname, '..', '.env.local')
const env = readFileSync(envPath, 'utf-8')
const envMap = Object.fromEntries(
  env.split('\n')
    .filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const supabase = createClient(
  envMap.NEXT_PUBLIC_SUPABASE_URL,
  envMap.SUPABASE_SERVICE_KEY
)

const projects = JSON.parse(
  readFileSync(join(__dirname, '..', 'data', 'projects.json'), 'utf-8')
)

function mapProject(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline ?? '',
    builder_name: p.builder?.name ?? '',
    builder_slug: p.builder?.slug ?? '',
    locality: p.locality ?? '',
    micro_market: p.microMarket ?? '',
    address: p.address ?? '',
    rera_id: p.reraId ?? '',
    rera_url: p.reraUrl ?? '',
    status: p.status ?? 'new_launch',
    launch_date: p.launchDate ?? '',
    possession_date: p.possessionDate ?? '',
    project_type: p.projectType ?? '',
    total_units: p.totalUnits ?? 0,
    towers: p.towers ?? 0,
    floors: p.floors ?? 0,
    total_area: p.totalArea ?? '',
    price_min: p.priceRange?.min ?? 0,
    price_max: p.priceRange?.max ?? 0,
    display_price: `${p.priceRange?.displayMin ?? ''} – ${p.priceRange?.displayMax ?? ''}`,
    configs: p.configs ?? [],
    amenities: p.amenities ?? [],
    nearby_it: p.nearbyIT ?? [],
    nearby_places: p.nearbyPlaces ?? [],
    price_history: p.priceHistory ?? [],
    appreciation_3yr: p.appreciation3yr ?? 0,
    locality_avg_price_per_sqft: p.localityAvgPricePerSqft ?? 0,
    vs_locality_avg: p.vsLocalityAvg ?? '',
    approved_banks: p.approvedBanks ?? [],
    sample_emi: p.sampleEmi ?? null,
    highlights: p.highlights ?? [],
    tags: p.tags ?? [],
    featured: p.featured ?? false,
    showflat_available: p.showflatAvailable ?? true,
    site_visit_available: p.siteVisitAvailable ?? true,
    show_on_site: true,
    images: p.images ?? [],
    floor_plans: p.floorPlans ?? [],
    seo_description: p.seoDescription ?? '',
  }
}

const rows = projects.map(mapProject)

console.log(`Seeding ${rows.length} projects to Supabase...`)

const { data, error } = await supabase
  .from('projects')
  .upsert(rows, { onConflict: 'id' })

if (error) {
  console.error('Seed failed:', error.message)
  console.error(error)
  process.exit(1)
} else {
  console.log(`✅ Inserted/updated ${rows.length} projects successfully`)
  rows.forEach((r) => console.log(`  - ${r.name} (${r.slug})`))
}
