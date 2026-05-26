import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-key') === process.env.ADMIN_PASSWORD
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRow(body: any, id: string) {
  return {
    id,
    slug: body.slug ?? id,
    name: body.name,
    tagline: body.tagline ?? '',
    builder_name: body.builder?.name ?? body.builder_name ?? '',
    builder_slug: body.builder?.slug ?? body.builder_slug ?? '',
    locality: body.locality ?? '',
    micro_market: body.microMarket ?? body.micro_market ?? '',
    address: body.address ?? '',
    rera_id: body.reraId ?? body.rera_id ?? '',
    rera_url: body.reraUrl ?? body.rera_url ?? '',
    status: body.status ?? 'new_launch',
    launch_date: body.launchDate ?? body.launch_date ?? '',
    possession_date: body.possessionDate ?? body.possession_date ?? '',
    project_type: body.projectType ?? body.project_type ?? '',
    total_units: body.totalUnits ?? body.total_units ?? 0,
    towers: body.towers ?? 0,
    floors: body.floors ?? 0,
    total_area: body.totalArea ?? body.total_area ?? '',
    price_min: body.priceMin ?? body.priceRange?.min ?? body.price_min ?? 0,
    price_max: body.priceMax ?? body.priceRange?.max ?? body.price_max ?? 0,
    display_price: body.displayPrice ?? `${body.priceRange?.displayMin ?? ''} – ${body.priceRange?.displayMax ?? ''}`,
    configs: body.configs ?? [],
    amenities: body.amenities ?? [],
    nearby_it: body.nearbyIT ?? body.nearby_it ?? [],
    nearby_places: body.nearbyPlaces ?? body.nearby_places ?? [],
    price_history: body.priceHistory ?? body.price_history ?? [],
    appreciation_3yr: body.appreciation3yr ?? body.appreciation_3yr ?? 0,
    locality_avg_price_per_sqft: body.localityAvgPricePerSqft ?? body.locality_avg_price_per_sqft ?? 0,
    vs_locality_avg: body.vsLocalityAvg ?? body.vs_locality_avg ?? '',
    approved_banks: body.approvedBanks ?? body.approved_banks ?? [],
    highlights: body.highlights ?? [],
    tags: body.tags ?? [],
    featured: body.featured ?? false,
    showflat_available: body.showflatAvailable ?? body.showflat_available ?? true,
    site_visit_available: body.siteVisitAvailable ?? body.site_visit_available ?? true,
    show_on_site: body.showOnSite ?? body.show_on_site ?? true,
    images: body.images ?? [],
    floor_plans: body.floorPlans ?? body.floor_plans ?? [],
    seo_description: body.seoDescription ?? body.seo_description ?? '',
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()

  const row = toRow(body, id)
  const { data, error } = await supabaseAdmin
    .from('projects')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/projects')
  revalidatePath(`/projects/${row.slug}`)
  return NextResponse.json(data)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { error } = await supabaseAdmin.from('projects').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  revalidatePath('/')
  revalidatePath('/projects')
  return NextResponse.json({ success: true })
}
