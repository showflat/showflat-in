'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfigVariant {
  carpetSqft: number
  builtUpSqft?: number
  label?: string
}

interface Config {
  type: string
  carpetSqft?: number
  builtUpSqft?: number
  priceMin?: number
  priceMax?: number
  pricePerSqft?: number
  unitsTotal?: number
  variants?: ConfigVariant[]
  note?: string
}

interface NearbyIT {
  name: string
  distanceKm: number
  commuteMin: number
}

interface NearbyPlace {
  name: string
  type: string
  distanceKm: number
}

interface ProjectForm {
  id: string
  name: string
  slug: string
  tagline: string
  builder: { name: string; slug: string }
  locality: string
  microMarket: string
  address: string
  reraId: string
  reraUrl: string
  status: string
  launchDate: string
  possessionDate: string
  projectType: string
  totalUnits: number
  towers: number
  floors: number
  totalArea: string
  priceRange: { min: number; max: number; displayMin: string; displayMax: string }
  configs: Config[]
  amenities: string[]
  nearbyIT: NearbyIT[]
  nearbyPlaces: NearbyPlace[]
  approvedBanks: string[]
  seoDescription: string
  featured: boolean
  showflatAvailable: boolean
  siteVisitAvailable: boolean
  appreciation3yr: number
  localityAvgPricePerSqft: number
  vsLocalityAvg: string
  highlights: string[]
  tags: string[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_AMENITIES = [
  'clubhouse', 'swimming_pool', 'gym', 'children_play_area', 'jogging_track',
  'yoga_deck', 'co_working_space', 'ev_charging', 'power_backup_100pct',
  'visitor_parking', 'cctv_surveillance', 'intercom', 'rainwater_harvesting',
  'solar_panels', 'amphitheatre', 'multipurpose_hall', 'squash_court',
  'tennis_court', 'badminton_court', 'library', 'mini_theatre',
  'indoor_games', 'senior_citizen_area', 'pet_park', 'rooftop_garden',
]

const AMENITY_LABELS: Record<string, string> = {
  clubhouse: 'Clubhouse', swimming_pool: 'Swimming Pool', gym: 'Gym',
  children_play_area: "Children's Play Area", jogging_track: 'Jogging Track',
  yoga_deck: 'Yoga Deck', co_working_space: 'Co-Working Space',
  ev_charging: 'EV Charging', power_backup_100pct: '100% Power Backup',
  visitor_parking: 'Visitor Parking', cctv_surveillance: 'CCTV Surveillance',
  intercom: 'Intercom', rainwater_harvesting: 'Rainwater Harvesting',
  solar_panels: 'Solar Panels', amphitheatre: 'Amphitheatre',
  multipurpose_hall: 'Multipurpose Hall', squash_court: 'Squash Court',
  tennis_court: 'Tennis Court', badminton_court: 'Badminton Court',
  library: 'Library', mini_theatre: 'Mini Theatre', indoor_games: 'Indoor Games',
  senior_citizen_area: 'Senior Citizen Area', pet_park: 'Pet Park',
  rooftop_garden: 'Rooftop Garden',
}

const ALL_BANKS = ['SBI', 'HDFC', 'ICICI', 'Axis Bank', 'Kotak Mahindra', 'Bank of Baroda', 'PNB', 'LIC HFL', 'Canara Bank', 'Union Bank']

const EMPTY_PROJECT: ProjectForm = {
  id: '', name: '', slug: '', tagline: '',
  builder: { name: '', slug: '' },
  locality: '', microMarket: '', address: '',
  reraId: '', reraUrl: 'https://maharera.mahaonline.gov.in',
  status: 'new_launch', launchDate: '', possessionDate: '',
  projectType: 'Residential Apartments',
  totalUnits: 0, towers: 1, floors: 0, totalArea: '',
  priceRange: { min: 0, max: 0, displayMin: '', displayMax: '' },
  configs: [{ type: '2BHK', carpetSqft: 0, priceMin: 0, priceMax: 0, unitsTotal: 0 }],
  amenities: [], nearbyIT: [], nearbyPlaces: [],
  approvedBanks: [],
  seoDescription: '',
  featured: false, showflatAvailable: false, siteVisitAvailable: false,
  appreciation3yr: 0, localityAvgPricePerSqft: 0, vsLocalityAvg: '',
  highlights: [''], tags: [],
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-extrabold text-[#111827] mb-5">{title}</h2>
      {children}
    </div>
  )
}

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#374151] mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent'

// ─── Main component ────────────────────────────────────────────────────────────

export default function ProjectFormPage() {
  const params = useParams()
  const id = params?.id as string
  const isNew = id === 'new'
  const router = useRouter()

  const [form, setForm] = useState<ProjectForm>(EMPTY_PROJECT)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [customAmenity, setCustomAmenity] = useState('')

  const pw = typeof window !== 'undefined' ? localStorage.getItem('admin_pw') ?? '' : ''

  useEffect(() => {
    if (isNew) return
    fetch(`/api/admin/projects/${id}`, { headers: { 'x-admin-password': pw } })
      .then((r) => r.json())
      .then((data) => {
        setForm({
          ...EMPTY_PROJECT,
          ...data,
          builder: data.builder ?? { name: '', slug: '' },
          priceRange: data.priceRange ?? { min: 0, max: 0, displayMin: '', displayMax: '' },
          configs: data.configs ?? [],
          amenities: data.amenities ?? [],
          nearbyIT: data.nearbyIT ?? [],
          nearbyPlaces: data.nearbyPlaces ?? [],
          approvedBanks: data.approvedBanks ?? [],
          highlights: data.highlights ?? [''],
          tags: data.tags ?? [],
        })
      })
      .finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  function set<K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      id: form.id || form.slug || autoSlug(form.name),
      slug: form.slug || autoSlug(form.name),
      highlights: form.highlights.filter(Boolean),
    }

    try {
      const url = isNew ? '/api/admin/projects' : `/api/admin/projects/${id}`
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error ?? 'Save failed')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        if (isNew) router.push('/admin')
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  // ── Config helpers ────────────────────────────────────────────────────────

  function addConfig() {
    set('configs', [...form.configs, { type: '', carpetSqft: 0, priceMin: 0, priceMax: 0, unitsTotal: 0 }])
  }

  function removeConfig(i: number) {
    set('configs', form.configs.filter((_, idx) => idx !== i))
  }

  function updateConfig(i: number, key: keyof Config, value: unknown) {
    const updated = form.configs.map((c, idx) =>
      idx === i ? { ...c, [key]: value } : c
    )
    set('configs', updated)
  }

  // ── NearbyIT helpers ──────────────────────────────────────────────────────

  function addNearbyIT() {
    set('nearbyIT', [...form.nearbyIT, { name: '', distanceKm: 0, commuteMin: 0 }])
  }

  function removeNearbyIT(i: number) {
    set('nearbyIT', form.nearbyIT.filter((_, idx) => idx !== i))
  }

  function updateNearbyIT(i: number, key: keyof NearbyIT, value: string | number) {
    const updated = form.nearbyIT.map((r, idx) =>
      idx === i ? { ...r, [key]: value } : r
    )
    set('nearbyIT', updated)
  }

  // ── NearbyPlaces helpers ──────────────────────────────────────────────────

  function addNearbyPlace() {
    set('nearbyPlaces', [...form.nearbyPlaces, { name: '', type: 'landmark', distanceKm: 0 }])
  }

  function removeNearbyPlace(i: number) {
    set('nearbyPlaces', form.nearbyPlaces.filter((_, idx) => idx !== i))
  }

  function updateNearbyPlace(i: number, key: keyof NearbyPlace, value: string | number) {
    const updated = form.nearbyPlaces.map((r, idx) =>
      idx === i ? { ...r, [key]: value } : r
    )
    set('nearbyPlaces', updated)
  }

  // ── Highlight helpers ─────────────────────────────────────────────────────

  function updateHighlight(i: number, val: string) {
    const h = [...form.highlights]
    h[i] = val
    set('highlights', h)
  }

  function addHighlight() {
    set('highlights', [...form.highlights, ''])
  }

  function removeHighlight(i: number) {
    set('highlights', form.highlights.filter((_, idx) => idx !== i))
  }

  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1a56db] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-14">
          <Link href="/admin" className="text-[#6b7280] hover:text-[#111827]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-extrabold text-[#111827] text-sm flex-1">
            {isNew ? 'Add New Project' : `Edit: ${form.name}`}
          </h1>
          <div className="flex items-center gap-3">
            {saved && <span className="text-xs text-green-600 font-semibold">Saved!</span>}
            {error && <span className="text-xs text-red-500">{error}</span>}
            <button
              form="project-form"
              type="submit"
              disabled={saving}
              className="bg-[#1a56db] hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
            >
              {saving ? 'Saving…' : isNew ? 'Create Project' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      <form id="project-form" onSubmit={handleSave}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* ── Basic Info ──────────────────────────────────────────────── */}
          <Section title="Basic Info">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Project Name" required>
                <input
                  className={inputCls}
                  value={form.name}
                  onChange={(e) => {
                    set('name', e.target.value)
                    if (isNew) set('slug', autoSlug(e.target.value))
                  }}
                  required
                />
              </Field>
              <Field label="Slug">
                <input
                  className={inputCls}
                  value={form.slug}
                  onChange={(e) => set('slug', e.target.value)}
                  placeholder="auto-generated from name"
                />
              </Field>
              <Field label="Tagline">
                <input className={inputCls} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
              </Field>
              <Field label="Builder Name" required>
                <input
                  className={inputCls}
                  value={form.builder.name}
                  onChange={(e) => set('builder', { ...form.builder, name: e.target.value })}
                  required
                />
              </Field>
              <Field label="Locality" required>
                <input className={inputCls} value={form.locality} onChange={(e) => set('locality', e.target.value)} required />
              </Field>
              <Field label="Micro Market">
                <input className={inputCls} value={form.microMarket} onChange={(e) => set('microMarket', e.target.value)} />
              </Field>
              <Field label="Address">
                <input className={inputCls} value={form.address} onChange={(e) => set('address', e.target.value)} />
              </Field>
              <Field label="Project Type">
                <input className={inputCls} value={form.projectType} onChange={(e) => set('projectType', e.target.value)} />
              </Field>
            </div>
          </Section>

          {/* ── Status & Dates ──────────────────────────────────────────── */}
          <Section title="Status & Dates">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Status">
                <select className={inputCls} value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="new_launch">New Launch</option>
                  <option value="under_construction">Under Construction</option>
                  <option value="ready_to_move">Ready to Move</option>
                </select>
              </Field>
              <Field label="Launch Date">
                <input type="month" className={inputCls} value={form.launchDate} onChange={(e) => set('launchDate', e.target.value)} />
              </Field>
              <Field label="Possession Date">
                <input type="month" className={inputCls} value={form.possessionDate} onChange={(e) => set('possessionDate', e.target.value)} />
              </Field>
            </div>
          </Section>

          {/* ── Pricing ─────────────────────────────────────────────────── */}
          <Section title="Pricing">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Min Price (₹)">
                <input
                  type="number"
                  className={inputCls}
                  value={form.priceRange.min || ''}
                  onChange={(e) => set('priceRange', { ...form.priceRange, min: +e.target.value })}
                />
              </Field>
              <Field label="Max Price (₹)">
                <input
                  type="number"
                  className={inputCls}
                  value={form.priceRange.max || ''}
                  onChange={(e) => set('priceRange', { ...form.priceRange, max: +e.target.value })}
                />
              </Field>
              <Field label="Display Min (e.g. 55L)">
                <input
                  className={inputCls}
                  value={form.priceRange.displayMin}
                  onChange={(e) => set('priceRange', { ...form.priceRange, displayMin: e.target.value })}
                />
              </Field>
              <Field label="Display Max (e.g. 80L)">
                <input
                  className={inputCls}
                  value={form.priceRange.displayMax}
                  onChange={(e) => set('priceRange', { ...form.priceRange, displayMax: e.target.value })}
                />
              </Field>
            </div>
          </Section>

          {/* ── Project Details ──────────────────────────────────────────── */}
          <Section title="Project Details">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Total Units">
                <input type="number" className={inputCls} value={form.totalUnits || ''} onChange={(e) => set('totalUnits', +e.target.value)} />
              </Field>
              <Field label="Towers">
                <input type="number" className={inputCls} value={form.towers || ''} onChange={(e) => set('towers', +e.target.value)} />
              </Field>
              <Field label="Floors (number)">
                <input type="number" className={inputCls} value={form.floors || ''} onChange={(e) => set('floors', +e.target.value)} />
              </Field>
              <Field label="Total Area">
                <input className={inputCls} value={form.totalArea} onChange={(e) => set('totalArea', e.target.value)} placeholder="e.g. 5.2 acres" />
              </Field>
              <Field label="RERA ID">
                <input className={inputCls} value={form.reraId} onChange={(e) => set('reraId', e.target.value)} />
              </Field>
              <Field label="RERA URL">
                <input className={inputCls} value={form.reraUrl} onChange={(e) => set('reraUrl', e.target.value)} />
              </Field>
              <Field label="Locality Avg ₹/sqft">
                <input type="number" className={inputCls} value={form.localityAvgPricePerSqft || ''} onChange={(e) => set('localityAvgPricePerSqft', +e.target.value)} />
              </Field>
              <Field label="3yr Appreciation %">
                <input type="number" step="0.1" className={inputCls} value={form.appreciation3yr || ''} onChange={(e) => set('appreciation3yr', +e.target.value)} />
              </Field>
            </div>
          </Section>

          {/* ── Configurations ──────────────────────────────────────────── */}
          <Section title="Configurations">
            <div className="space-y-4">
              {form.configs.map((cfg, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#111827]">Config {i + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeConfig(i)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Field label="Type (e.g. 2BHK)">
                      <input className={inputCls} value={cfg.type} onChange={(e) => updateConfig(i, 'type', e.target.value)} />
                    </Field>
                    <Field label="Carpet Sqft">
                      <input type="number" className={inputCls} value={cfg.carpetSqft || ''} onChange={(e) => updateConfig(i, 'carpetSqft', +e.target.value)} />
                    </Field>
                    <Field label="Built-up Sqft">
                      <input type="number" className={inputCls} value={cfg.builtUpSqft || ''} onChange={(e) => updateConfig(i, 'builtUpSqft', +e.target.value)} />
                    </Field>
                    <Field label="Units Total">
                      <input type="number" className={inputCls} value={cfg.unitsTotal || ''} onChange={(e) => updateConfig(i, 'unitsTotal', +e.target.value)} />
                    </Field>
                    <Field label="Price Min (₹)">
                      <input type="number" className={inputCls} value={cfg.priceMin || ''} onChange={(e) => updateConfig(i, 'priceMin', +e.target.value)} />
                    </Field>
                    <Field label="Price Max (₹)">
                      <input type="number" className={inputCls} value={cfg.priceMax || ''} onChange={(e) => updateConfig(i, 'priceMax', +e.target.value)} />
                    </Field>
                    <Field label="Price/sqft (₹)">
                      <input type="number" className={inputCls} value={cfg.pricePerSqft || ''} onChange={(e) => updateConfig(i, 'pricePerSqft', +e.target.value)} />
                    </Field>
                    <Field label="Note">
                      <input className={inputCls} value={cfg.note ?? ''} onChange={(e) => updateConfig(i, 'note', e.target.value)} placeholder="e.g. Limited units" />
                    </Field>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addConfig}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#1a56db] hover:text-blue-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add configuration
              </button>
            </div>
          </Section>

          {/* ── Amenities ──────────────────────────────────────────────── */}
          <Section title="Amenities">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {ALL_AMENITIES.map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.amenities.includes(key)}
                    onChange={(e) => {
                      set('amenities', e.target.checked
                        ? [...form.amenities, key]
                        : form.amenities.filter((a) => a !== key)
                      )
                    }}
                    className="rounded accent-[#1a56db]"
                  />
                  <span className="text-[#374151]">{AMENITY_LABELS[key]}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className={`${inputCls} flex-1`}
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                placeholder="Add custom amenity key (e.g. cricket_net)"
              />
              <button
                type="button"
                onClick={() => {
                  const k = customAmenity.trim()
                  if (k && !form.amenities.includes(k)) {
                    set('amenities', [...form.amenities, k])
                  }
                  setCustomAmenity('')
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-semibold rounded-xl text-[#374151]"
              >
                Add
              </button>
            </div>
            {form.amenities.filter((a) => !ALL_AMENITIES.includes(a)).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.amenities.filter((a) => !ALL_AMENITIES.includes(a)).map((a) => (
                  <span key={a} className="flex items-center gap-1 text-xs bg-blue-50 text-[#1a56db] px-2 py-0.5 rounded-full border border-blue-100">
                    {a}
                    <button type="button" onClick={() => set('amenities', form.amenities.filter((x) => x !== a))} className="ml-0.5 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}
          </Section>

          {/* ── Nearby IT Hubs ──────────────────────────────────────────── */}
          <Section title="Nearby IT Hubs">
            <div className="space-y-3">
              {form.nearbyIT.map((row, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 items-end">
                  <Field label="IT Hub Name">
                    <input className={inputCls} value={row.name} onChange={(e) => updateNearbyIT(i, 'name', e.target.value)} />
                  </Field>
                  <Field label="Distance (km)">
                    <input type="number" step="0.1" className={inputCls} value={row.distanceKm || ''} onChange={(e) => updateNearbyIT(i, 'distanceKm', +e.target.value)} />
                  </Field>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Field label="Commute (min)">
                        <input type="number" className={inputCls} value={row.commuteMin || ''} onChange={(e) => updateNearbyIT(i, 'commuteMin', +e.target.value)} />
                      </Field>
                    </div>
                    <button type="button" onClick={() => removeNearbyIT(i)} className="text-red-400 hover:text-red-600 pb-2 text-lg leading-none">×</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addNearbyIT} className="flex items-center gap-1.5 text-sm font-semibold text-[#1a56db] hover:text-blue-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add IT hub
              </button>
            </div>
          </Section>

          {/* ── Nearby Places ────────────────────────────────────────────── */}
          <Section title="Nearby Places">
            <div className="space-y-3">
              {form.nearbyPlaces.map((row, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 items-end">
                  <Field label="Place Name">
                    <input className={inputCls} value={row.name} onChange={(e) => updateNearbyPlace(i, 'name', e.target.value)} />
                  </Field>
                  <Field label="Type">
                    <select className={inputCls} value={row.type} onChange={(e) => updateNearbyPlace(i, 'type', e.target.value)}>
                      <option value="mall">Mall</option>
                      <option value="school">School</option>
                      <option value="hospital">Hospital</option>
                      <option value="landmark">Landmark</option>
                      <option value="metro">Metro</option>
                      <option value="airport">Airport</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="bank">Bank</option>
                    </select>
                  </Field>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Field label="Distance (km)">
                        <input type="number" step="0.1" className={inputCls} value={row.distanceKm || ''} onChange={(e) => updateNearbyPlace(i, 'distanceKm', +e.target.value)} />
                      </Field>
                    </div>
                    <button type="button" onClick={() => removeNearbyPlace(i)} className="text-red-400 hover:text-red-600 pb-2 text-lg leading-none">×</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addNearbyPlace} className="flex items-center gap-1.5 text-sm font-semibold text-[#1a56db] hover:text-blue-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add place
              </button>
            </div>
          </Section>

          {/* ── Approved Banks ───────────────────────────────────────────── */}
          <Section title="Approved Banks">
            <div className="flex flex-wrap gap-2">
              {ALL_BANKS.map((bank) => {
                const active = form.approvedBanks.includes(bank)
                return (
                  <button
                    key={bank}
                    type="button"
                    onClick={() =>
                      set('approvedBanks', active
                        ? form.approvedBanks.filter((b) => b !== bank)
                        : [...form.approvedBanks, bank]
                      )
                    }
                    className={`text-sm font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                      active
                        ? 'bg-[#1a56db] text-white border-[#1a56db]'
                        : 'bg-white text-[#6b7280] border-gray-200 hover:border-[#1a56db] hover:text-[#1a56db]'
                    }`}
                  >
                    {bank}
                  </button>
                )
              })}
            </div>
          </Section>

          {/* ── Highlights ──────────────────────────────────────────────── */}
          <Section title="Highlights">
            <div className="space-y-2">
              {form.highlights.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className={`${inputCls} flex-1`}
                    value={h}
                    onChange={(e) => updateHighlight(i, e.target.value)}
                    placeholder={`Highlight ${i + 1}`}
                  />
                  {form.highlights.length > 1 && (
                    <button type="button" onClick={() => removeHighlight(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addHighlight} className="flex items-center gap-1.5 text-sm font-semibold text-[#1a56db] hover:text-blue-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add highlight
              </button>
            </div>
          </Section>

          {/* ── SEO ─────────────────────────────────────────────────────── */}
          <Section title="SEO">
            <Field label="Meta Description">
              <textarea
                className={`${inputCls} h-24 resize-none`}
                value={form.seoDescription}
                onChange={(e) => set('seoDescription', e.target.value)}
                placeholder="160-char description for search engines"
              />
            </Field>
          </Section>

          {/* ── Settings ────────────────────────────────────────────────── */}
          <Section title="Settings">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(
                [
                  { key: 'featured', label: 'Featured on Homepage', desc: 'Shows in featured projects section' },
                  { key: 'showflatAvailable', label: 'Showflat Available', desc: 'Showflat is open for visits' },
                  { key: 'siteVisitAvailable', label: 'Site Visit Available', desc: 'Site visit bookings open' },
                ] as Array<{ key: keyof ProjectForm; label: string; desc: string }>
              ).map(({ key, label, desc }) => (
                <label key={key} className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={!!form[key]}
                    onChange={(e) => set(key, e.target.checked as ProjectForm[typeof key])}
                    className="mt-0.5 rounded accent-[#1a56db]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{label}</p>
                    <p className="text-xs text-[#6b7280]">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </Section>

          {/* ── Submit ──────────────────────────────────────────────────── */}
          <div className="flex justify-end gap-3 pb-8">
            <Link href="/admin" className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-[#374151] hover:bg-gray-50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#1a56db] hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              {saving ? 'Saving…' : isNew ? 'Create Project' : 'Save Changes'}
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}
