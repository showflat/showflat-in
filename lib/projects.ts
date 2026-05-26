import { supabase } from './supabase'
import { readFileSync } from 'fs'
import { join } from 'path'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readProjectsJSON(): any[] {
  return JSON.parse(readFileSync(join(process.cwd(), 'data/projects.json'), 'utf-8'))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(p: any) {
  const [displayMin = '', displayMax = ''] = (p.display_price ?? '').split(' – ')
  return {
    id: p.slug ?? p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline ?? '',
    builder: { name: p.builder_name ?? '', slug: p.builder_slug ?? '' },
    locality: p.locality ?? '',
    microMarket: p.micro_market ?? '',
    address: p.address ?? '',
    reraId: p.rera_id ?? '',
    reraUrl: p.rera_url ?? '',
    status: p.status ?? 'new_launch',
    launchDate: p.launch_date ?? '',
    possessionDate: p.possession_date ?? '',
    projectType: p.project_type ?? '',
    totalUnits: p.total_units ?? 0,
    towers: p.towers ?? 0,
    floors: p.floors ?? 0,
    totalArea: p.total_area ?? '',
    priceRange: {
      min: p.price_min ?? 0,
      max: p.price_max ?? 0,
      displayMin,
      displayMax,
    },
    configs: p.configs ?? [],
    amenities: p.amenities ?? [],
    nearbyIT: p.nearby_it ?? [],
    nearbyPlaces: p.nearby_places ?? [],
    priceHistory: p.price_history ?? [],
    appreciation3yr: p.appreciation_3yr ?? 0,
    localityAvgPricePerSqft: p.locality_avg_price_per_sqft ?? 0,
    vsLocalityAvg: p.vs_locality_avg ?? '',
    approvedBanks: p.approved_banks ?? ['SBI', 'HDFC', 'ICICI', 'Axis Bank'],
    seoDescription: p.seo_description ?? '',
    featured: p.featured ?? false,
    showflatAvailable: p.showflat_available !== false,
    siteVisitAvailable: p.site_visit_available !== false,
    images: p.images ?? [],
    floorPlans: p.floor_plans ?? [],
    highlights: p.highlights ?? [],
    tags: p.tags ?? [],
  }
}

export async function getProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('show_on_site', true)
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return readProjectsJSON()
    }

    return data.map(mapRow)
  } catch {
    return readProjectsJSON()
  }
}

export async function getProjectBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      const projects = readProjectsJSON()
      return projects.find((p) => p.slug === slug) ?? null
    }

    return mapRow(data)
  } catch {
    const projects = readProjectsJSON()
    return projects.find((p) => p.slug === slug) ?? null
  }
}

export async function getAllSlugs(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('slug')
      .eq('show_on_site', true)

    if (error || !data || data.length === 0) {
      return readProjectsJSON().map((p) => p.slug as string)
    }

    return data.map((p) => p.slug as string)
  } catch {
    return readProjectsJSON().map((p) => p.slug as string)
  }
}
