'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfigVariant {
  carpetSqft: number | string
  builtUpSqft: number | string
  priceLakhs: number | string
  label: string
}

interface Config {
  type: string
  variants: ConfigVariant[]
}

interface NearbyIT { name: string; distanceKm: number | string; commuteMin: number | string }
interface NearbyPlace { name: string; type: string; distanceKm: number | string }

interface FormState {
  name: string
  slug: string
  tagline: string
  builderName: string
  builderSlug: string
  locality: string
  microMarket: string
  address: string
  reraId: string
  status: string
  displayPrice: string
  priceMinLakhs: string
  priceMaxLakhs: string
  totalUnits: string
  floors: string
  towers: string
  possessionDate: string
  totalArea: string
  configs: Config[]
  amenities: string[]
  nearbyIT: NearbyIT[]
  nearbyPlaces: NearbyPlace[]
  approvedBanks: string[]
  seoDescription: string
  featured: boolean
  showOnSite: boolean
  siteVisitAvailable: boolean
  showflatAvailable: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AMENITY_LIST = [
  { key: 'clubhouse', label: 'Clubhouse' },
  { key: 'swimming_pool', label: 'Swimming Pool' },
  { key: 'gym', label: 'Gym' },
  { key: 'children_play_area', label: "Children's Play Area" },
  { key: 'jogging_track', label: 'Jogging Track' },
  { key: 'yoga_deck', label: 'Yoga Deck' },
  { key: 'co_working_space', label: 'Co-Working Space' },
  { key: 'ev_charging', label: 'EV Charging' },
  { key: 'power_backup', label: 'Power Backup' },
  { key: 'cctv', label: 'CCTV' },
  { key: 'rainwater_harvesting', label: 'Rainwater Harvesting' },
  { key: 'solar_panels', label: 'Solar Panels' },
  { key: 'smart_home', label: 'Smart Home' },
  { key: 'amphitheatre', label: 'Amphitheatre' },
  { key: 'pet_park', label: 'Pet Park' },
  { key: 'badminton_court', label: 'Badminton Court' },
  { key: 'squash_court', label: 'Squash Court' },
  { key: 'indoor_games', label: 'Indoor Games' },
  { key: 'covered_parking', label: 'Covered Parking' },
  { key: 'intercom', label: 'Intercom' },
  { key: 'concierge', label: 'Concierge' },
  { key: 'landscape_garden', label: 'Landscape Garden' },
  { key: 'rooftop_lounge', label: 'Rooftop Lounge' },
  { key: 'library', label: 'Library' },
]

const BANK_LIST = [
  'SBI', 'HDFC', 'ICICI', 'Axis Bank', 'Kotak Mahindra',
  'Bank of Baroda', 'PNB Housing', 'LIC Housing Finance',
]

const MICRO_MARKETS = ['West Pune', 'East Pune', 'South Pune', 'Central East Pune', 'North Pune']

const PLACE_TYPES = ['school', 'hospital', 'mall', 'metro', 'highway', 'restaurant', 'park', 'landmark']

const EMPTY_FORM: FormState = {
  name: '', slug: '', tagline: '',
  builderName: '', builderSlug: '',
  locality: '', microMarket: 'West Pune', address: '',
  reraId: '', status: 'new_launch',
  displayPrice: '', priceMinLakhs: '', priceMaxLakhs: '',
  totalUnits: '', floors: '', towers: '', possessionDate: '', totalArea: '',
  configs: [{ type: '2BHK', variants: [{ carpetSqft: '', builtUpSqft: '', priceLakhs: '', label: '' }] }],
  amenities: [], nearbyIT: [], nearbyPlaces: [],
  approvedBanks: [],
  seoDescription: '',
  featured: false, showOnSite: true, siteVisitAvailable: true, showflatAvailable: false,
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function autoSlug(name: string, locality: string) {
  const base = `${name} ${locality}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return base
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-sm font-extrabold text-[#111827] uppercase tracking-wide mb-5">{title}</h2>
      {children}
    </div>
  )
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-[#374151] mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}

const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent bg-white'

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  projectId?: string
}

export default function ProjectForm({ projectId }: Props) {
  const isNew = !projectId
  const router = useRouter()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [customAmenity, setCustomAmenity] = useState('')
  const [seoLen, setSeoLen] = useState(0)

  const pw = typeof window !== 'undefined' ? localStorage.getItem('admin_pw') ?? '' : ''

  // Load existing project for edit
  useEffect(() => {
    if (isNew) return
    fetch(`/api/admin/projects/${projectId}`, { headers: { 'x-admin-key': pw } })
      .then((r) => r.json())
      .then((raw) => {
        const [pmin, pmax] = [
          raw.price_min ? String(Math.round(raw.price_min / 100000)) : '',
          raw.price_max ? String(Math.round(raw.price_max / 100000)) : '',
        ]

        // Convert flat configs to variants format
        const configs: Config[] = (raw.configs ?? []).map((c: Record<string, unknown>) => {
          if (c.variants && Array.isArray(c.variants) && c.variants.length > 0) {
            return {
              type: String(c.type ?? ''),
              variants: (c.variants as Record<string, unknown>[]).map((v) => ({
                carpetSqft: v.carpetSqft ?? '',
                builtUpSqft: v.builtUpSqft ?? '',
                priceLakhs: v.priceMin ? Math.round(Number(v.priceMin) / 100000) : '',
                label: v.label ?? '',
              })),
            }
          }
          return {
            type: String(c.type ?? ''),
            variants: [{
              carpetSqft: c.carpetSqft ?? '',
              builtUpSqft: c.builtUpSqft ?? '',
              priceLakhs: c.priceMin ? Math.round(Number(c.priceMin) / 100000) : '',
              label: '',
            }],
          }
        })

        setForm({
          name: raw.name ?? '',
          slug: raw.slug ?? '',
          tagline: raw.tagline ?? '',
          builderName: raw.builder_name ?? '',
          builderSlug: raw.builder_slug ?? '',
          locality: raw.locality ?? '',
          microMarket: raw.micro_market ?? 'West Pune',
          address: raw.address ?? '',
          reraId: raw.rera_id ?? '',
          status: raw.status ?? 'new_launch',
          displayPrice: raw.display_price ?? '',
          priceMinLakhs: pmin,
          priceMaxLakhs: pmax,
          totalUnits: String(raw.total_units ?? ''),
          floors: String(raw.floors ?? ''),
          towers: String(raw.towers ?? ''),
          possessionDate: raw.possession_date ?? '',
          totalArea: raw.total_area ?? '',
          configs: configs.length > 0 ? configs : EMPTY_FORM.configs,
          amenities: raw.amenities ?? [],
          nearbyIT: (raw.nearby_it ?? []).map((r: Record<string, unknown>) => ({
            name: String(r.name ?? ''),
            distanceKm: r.distanceKm ?? '',
            commuteMin: r.commuteMin ?? '',
          })),
          nearbyPlaces: (raw.nearby_places ?? []).map((r: Record<string, unknown>) => ({
            name: String(r.name ?? ''),
            type: String(r.type ?? 'landmark'),
            distanceKm: r.distanceKm ?? '',
          })),
          approvedBanks: raw.approved_banks ?? [],
          seoDescription: raw.seo_description ?? '',
          featured: raw.featured ?? false,
          showOnSite: raw.show_on_site ?? true,
          siteVisitAvailable: raw.site_visit_available ?? true,
          showflatAvailable: raw.showflat_available ?? false,
        })
        setSeoLen((raw.seo_description ?? '').length)
      })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.slug || !form.locality) {
      setError('Name, slug, and locality are required')
      return
    }
    setSaving(true)
    setError('')

    const pMin = form.priceMinLakhs ? Number(form.priceMinLakhs) * 100000 : 0
    const pMax = form.priceMaxLakhs ? Number(form.priceMaxLakhs) * 100000 : 0

    const payload = {
      slug: form.slug,
      name: form.name,
      tagline: form.tagline,
      builder_name: form.builderName,
      builder_slug: form.builderSlug || form.builderName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      locality: form.locality,
      micro_market: form.microMarket,
      address: form.address,
      rera_id: form.reraId,
      status: form.status,
      display_price: form.displayPrice,
      price_min: pMin,
      price_max: pMax,
      total_units: Number(form.totalUnits) || 0,
      floors: Number(form.floors) || 0,
      towers: Number(form.towers) || 0,
      possession_date: form.possessionDate,
      total_area: form.totalArea,
      configs: form.configs.map((c) => ({
        type: c.type,
        variants: c.variants.map((v) => ({
          carpetSqft: Number(v.carpetSqft) || 0,
          builtUpSqft: Number(v.builtUpSqft) || 0,
          priceMin: v.priceLakhs ? Number(v.priceLakhs) * 100000 : null,
          label: v.label,
        })),
      })),
      amenities: form.amenities,
      nearby_it: form.nearbyIT.map((r) => ({
        name: r.name,
        distanceKm: Number(r.distanceKm) || 0,
        commuteMin: Number(r.commuteMin) || 0,
      })),
      nearby_places: form.nearbyPlaces.map((r) => ({
        name: r.name,
        type: r.type,
        distanceKm: Number(r.distanceKm) || 0,
      })),
      approved_banks: form.approvedBanks,
      seo_description: form.seoDescription,
      featured: form.featured,
      show_on_site: form.showOnSite,
      site_visit_available: form.siteVisitAvailable,
      showflat_available: form.showflatAvailable,
    }

    try {
      const url = isNew ? '/api/admin/projects' : `/api/admin/projects/${projectId}`
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-key': pw },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!res.ok) { setError(result.error ?? 'Save failed'); return }
      router.push('/admin')
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  // ── Config helpers ────────────────────────────────────────────────────────

  function addConfig() {
    set('configs', [...form.configs, {
      type: '',
      variants: [{ carpetSqft: '', builtUpSqft: '', priceLakhs: '', label: '' }],
    }])
  }

  function removeConfig(i: number) {
    set('configs', form.configs.filter((_, idx) => idx !== i))
  }

  function updateConfigType(i: number, val: string) {
    const updated = form.configs.map((c, idx) => idx === i ? { ...c, type: val } : c)
    set('configs', updated)
  }

  function addVariant(ci: number) {
    const updated = form.configs.map((c, i) =>
      i === ci ? { ...c, variants: [...c.variants, { carpetSqft: '', builtUpSqft: '', priceLakhs: '', label: '' }] } : c
    )
    set('configs', updated)
  }

  function removeVariant(ci: number, vi: number) {
    const updated = form.configs.map((c, i) =>
      i === ci ? { ...c, variants: c.variants.filter((_, idx) => idx !== vi) } : c
    )
    set('configs', updated)
  }

  function updateVariant(ci: number, vi: number, key: keyof ConfigVariant, val: string) {
    const updated = form.configs.map((c, i) =>
      i === ci
        ? { ...c, variants: c.variants.map((v, j) => j === vi ? { ...v, [key]: val } : v) }
        : c
    )
    set('configs', updated)
  }

  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-[#1a56db] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <form id="pf" onSubmit={handleSave} className="space-y-6">

      {/* ── 1. Basic Info ──────────────────────────────────────────────────── */}
      <Section title="Basic Info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label required>Project Name</Label>
            <input className={inp} value={form.name}
              onChange={(e) => {
                set('name', e.target.value)
                if (isNew) set('slug', autoSlug(e.target.value, form.locality))
              }}
              required
            />
          </div>

          <div>
            <Label>Slug (URL)</Label>
            <input className={inp} value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="auto-generated" required
            />
            {form.slug && (
              <p className="text-xs text-[#6b7280] mt-1">/projects/{form.slug}</p>
            )}
          </div>

          <div>
            <Label required>Builder Name</Label>
            <input className={inp} value={form.builderName}
              onChange={(e) => set('builderName', e.target.value)} required
            />
          </div>

          <div>
            <Label required>Locality</Label>
            <input className={inp} value={form.locality}
              onChange={(e) => {
                set('locality', e.target.value)
                if (isNew) set('slug', autoSlug(form.name, e.target.value))
              }}
              required
            />
          </div>

          <div>
            <Label>Micro Market</Label>
            <select className={inp} value={form.microMarket}
              onChange={(e) => set('microMarket', e.target.value)}>
              {MICRO_MARKETS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <Label>Status</Label>
            <select className={inp} value={form.status}
              onChange={(e) => set('status', e.target.value)}>
              <option value="new_launch">New Launch</option>
              <option value="under_construction">Under Construction</option>
              <option value="ready_to_move">Ready to Move</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <Label>Tagline</Label>
            <input className={inp} value={form.tagline}
              onChange={(e) => set('tagline', e.target.value)}
              placeholder="Short compelling description"
            />
          </div>

          <div>
            <Label>Address</Label>
            <input className={inp} value={form.address}
              onChange={(e) => set('address', e.target.value)}
            />
          </div>

          <div>
            <Label>RERA ID</Label>
            <input className={inp} value={form.reraId}
              onChange={(e) => set('reraId', e.target.value)}
              placeholder="P52100XXXXXX"
            />
          </div>

          <div>
            <Label>Total Area</Label>
            <input className={inp} value={form.totalArea}
              onChange={(e) => set('totalArea', e.target.value)}
              placeholder="e.g. 5.2 acres"
            />
          </div>
        </div>
      </Section>

      {/* ── 2. Pricing ─────────────────────────────────────────────────────── */}
      <Section title="Pricing">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Display Price</Label>
            <input className={inp} value={form.displayPrice}
              onChange={(e) => set('displayPrice', e.target.value)}
              placeholder="₹74L – ₹1.2Cr"
            />
          </div>
          <div>
            <Label>Min Price (in Lakhs)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6b7280]">₹</span>
              <input type="number" className={`${inp} pl-7`} value={form.priceMinLakhs}
                onChange={(e) => set('priceMinLakhs', e.target.value)}
                placeholder="74"
              />
            </div>
            {form.priceMinLakhs && (
              <p className="text-xs text-[#6b7280] mt-1">= ₹{(Number(form.priceMinLakhs) * 100000).toLocaleString('en-IN')}</p>
            )}
          </div>
          <div>
            <Label>Max Price (in Lakhs)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6b7280]">₹</span>
              <input type="number" className={`${inp} pl-7`} value={form.priceMaxLakhs}
                onChange={(e) => set('priceMaxLakhs', e.target.value)}
                placeholder="120"
              />
            </div>
            {form.priceMaxLakhs && (
              <p className="text-xs text-[#6b7280] mt-1">= ₹{(Number(form.priceMaxLakhs) * 100000).toLocaleString('en-IN')}</p>
            )}
          </div>
        </div>
      </Section>

      {/* ── 3. Project Details ──────────────────────────────────────────────── */}
      <Section title="Project Details">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <Label>Total Units</Label>
            <input type="number" className={inp} value={form.totalUnits}
              onChange={(e) => set('totalUnits', e.target.value)}
            />
          </div>
          <div>
            <Label>Total Floors</Label>
            <input type="number" className={inp} value={form.floors}
              onChange={(e) => set('floors', e.target.value)}
            />
          </div>
          <div>
            <Label>Towers</Label>
            <input type="number" className={inp} value={form.towers}
              onChange={(e) => set('towers', e.target.value)}
            />
          </div>
          <div>
            <Label>Possession Date</Label>
            <input className={inp} value={form.possessionDate}
              onChange={(e) => set('possessionDate', e.target.value)}
              placeholder="December 2027"
            />
          </div>
        </div>
      </Section>

      {/* ── 4. Configurations ──────────────────────────────────────────────── */}
      <Section title="BHK Configurations">
        <div className="space-y-4">
          {form.configs.map((cfg, ci) => (
            <div key={ci} className="border border-gray-100 rounded-xl overflow-hidden">
              {/* Config header */}
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-gray-100">
                <input
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#111827] w-28 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
                  value={cfg.type}
                  onChange={(e) => updateConfigType(ci, e.target.value)}
                  placeholder="e.g. 2BHK"
                />
                <span className="text-xs text-[#6b7280] flex-1">{cfg.variants.length} variant{cfg.variants.length !== 1 ? 's' : ''}</span>
                <button
                  type="button"
                  onClick={() => removeConfig(ci)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Delete config
                </button>
              </div>

              {/* Variants table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead className="bg-white border-b border-gray-50">
                    <tr>
                      {['Carpet sqft', 'Built-up sqft', 'Price (₹ Lakhs)', 'Label', ''].map((h) => (
                        <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-[#6b7280]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cfg.variants.map((v, vi) => (
                      <tr key={vi} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-2">
                          <input type="number" className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a56db]"
                            value={v.carpetSqft}
                            onChange={(e) => updateVariant(ci, vi, 'carpetSqft', e.target.value)}
                            placeholder="640"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a56db]"
                            value={v.builtUpSqft}
                            onChange={(e) => updateVariant(ci, vi, 'builtUpSqft', e.target.value)}
                            placeholder="810"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="relative w-28">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[#6b7280]">₹</span>
                            <input type="number" className="w-full border border-gray-200 rounded-lg pl-5 pr-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a56db]"
                              value={v.priceLakhs}
                              onChange={(e) => updateVariant(ci, vi, 'priceLakhs', e.target.value)}
                              placeholder="74"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <input className="w-28 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a56db]"
                            value={v.label}
                            onChange={(e) => updateVariant(ci, vi, 'label', e.target.value)}
                            placeholder="Type A"
                          />
                        </td>
                        <td className="px-3 py-2">
                          {cfg.variants.length > 1 && (
                            <button type="button" onClick={() => removeVariant(ci, vi)}
                              className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5">
                <button type="button" onClick={() => addVariant(ci)}
                  className="text-xs font-semibold text-[#1a56db] hover:text-blue-700">
                  + Add variant
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addConfig}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#1a56db] hover:text-blue-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add BHK type
          </button>
        </div>
      </Section>

      {/* ── 5. Amenities ───────────────────────────────────────────────────── */}
      <Section title="Amenities">
        <div className="flex flex-wrap gap-2 mb-4">
          {AMENITY_LIST.map(({ key, label }) => {
            const on = form.amenities.includes(key)
            return (
              <button
                key={key}
                type="button"
                onClick={() => set('amenities', on
                  ? form.amenities.filter((a) => a !== key)
                  : [...form.amenities, key]
                )}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  on
                    ? 'bg-[#1a56db] text-white border-[#1a56db]'
                    : 'bg-white text-[#6b7280] border-gray-200 hover:border-[#1a56db] hover:text-[#1a56db]'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          <input className={`${inp} flex-1`} value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            placeholder="Custom amenity (e.g. cricket_net)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const k = customAmenity.trim().replace(/\s+/g, '_')
                if (k && !form.amenities.includes(k)) set('amenities', [...form.amenities, k])
                setCustomAmenity('')
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const k = customAmenity.trim().replace(/\s+/g, '_')
              if (k && !form.amenities.includes(k)) set('amenities', [...form.amenities, k])
              setCustomAmenity('')
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-semibold rounded-xl text-[#374151]"
          >
            Add
          </button>
        </div>
        {form.amenities.filter((a) => !AMENITY_LIST.find((x) => x.key === a)).map((a) => (
          <span key={a} className="mt-2 inline-flex items-center gap-1 text-xs bg-blue-50 text-[#1a56db] px-2 py-0.5 rounded-full border border-blue-100 mr-1.5">
            {a}
            <button type="button" onClick={() => set('amenities', form.amenities.filter((x) => x !== a))}>×</button>
          </span>
        ))}
      </Section>

      {/* ── 6. Nearby IT Hubs ──────────────────────────────────────────────── */}
      <Section title="Nearby IT Hubs">
        <div className="space-y-3">
          {form.nearbyIT.map((row, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 items-end">
              <div>
                <Label>IT Hub Name</Label>
                <input className={inp} value={row.name}
                  onChange={(e) => {
                    const updated = form.nearbyIT.map((r, idx) => idx === i ? { ...r, name: e.target.value } : r)
                    set('nearbyIT', updated)
                  }}
                />
              </div>
              <div>
                <Label>Distance (km)</Label>
                <input type="number" step="0.1" className={inp} value={row.distanceKm}
                  onChange={(e) => {
                    const updated = form.nearbyIT.map((r, idx) => idx === i ? { ...r, distanceKm: e.target.value } : r)
                    set('nearbyIT', updated)
                  }}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label>Commute (min)</Label>
                  <input type="number" className={inp} value={row.commuteMin}
                    onChange={(e) => {
                      const updated = form.nearbyIT.map((r, idx) => idx === i ? { ...r, commuteMin: e.target.value } : r)
                      set('nearbyIT', updated)
                    }}
                  />
                </div>
                <button type="button" onClick={() => set('nearbyIT', form.nearbyIT.filter((_, idx) => idx !== i))}
                  className="text-red-400 hover:text-red-600 pb-2 text-lg">×</button>
              </div>
            </div>
          ))}
          <button type="button"
            onClick={() => set('nearbyIT', [...form.nearbyIT, { name: '', distanceKm: '', commuteMin: '' }])}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#1a56db] hover:text-blue-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add IT hub
          </button>
        </div>
      </Section>

      {/* ── 7. Nearby Places ────────────────────────────────────────────────── */}
      <Section title="Nearby Places">
        <div className="space-y-3">
          {form.nearbyPlaces.map((row, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 items-end">
              <div>
                <Label>Place Name</Label>
                <input className={inp} value={row.name}
                  onChange={(e) => {
                    const updated = form.nearbyPlaces.map((r, idx) => idx === i ? { ...r, name: e.target.value } : r)
                    set('nearbyPlaces', updated)
                  }}
                />
              </div>
              <div>
                <Label>Type</Label>
                <select className={inp} value={row.type}
                  onChange={(e) => {
                    const updated = form.nearbyPlaces.map((r, idx) => idx === i ? { ...r, type: e.target.value } : r)
                    set('nearbyPlaces', updated)
                  }}>
                  {PLACE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label>Distance (km)</Label>
                  <input type="number" step="0.1" className={inp} value={row.distanceKm}
                    onChange={(e) => {
                      const updated = form.nearbyPlaces.map((r, idx) => idx === i ? { ...r, distanceKm: e.target.value } : r)
                      set('nearbyPlaces', updated)
                    }}
                  />
                </div>
                <button type="button" onClick={() => set('nearbyPlaces', form.nearbyPlaces.filter((_, idx) => idx !== i))}
                  className="text-red-400 hover:text-red-600 pb-2 text-lg">×</button>
              </div>
            </div>
          ))}
          <button type="button"
            onClick={() => set('nearbyPlaces', [...form.nearbyPlaces, { name: '', type: 'school', distanceKm: '' }])}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#1a56db] hover:text-blue-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add place
          </button>
        </div>
      </Section>

      {/* ── 8. Approved Banks ──────────────────────────────────────────────── */}
      <Section title="Approved Banks">
        <div className="flex flex-wrap gap-2">
          {BANK_LIST.map((bank) => {
            const on = form.approvedBanks.includes(bank)
            return (
              <button
                key={bank}
                type="button"
                onClick={() => set('approvedBanks', on
                  ? form.approvedBanks.filter((b) => b !== bank)
                  : [...form.approvedBanks, bank]
                )}
                className={`text-sm font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  on
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

      {/* ── 9. SEO ─────────────────────────────────────────────────────────── */}
      <Section title="SEO">
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <Label>Meta Description</Label>
            <span className={`text-xs ${seoLen > 160 ? 'text-red-500' : 'text-[#6b7280]'}`}>
              {seoLen}/160
            </span>
          </div>
          <textarea
            className={`${inp} h-24 resize-none`}
            value={form.seoDescription}
            onChange={(e) => { set('seoDescription', e.target.value); setSeoLen(e.target.value.length) }}
            placeholder="160-char description for search engines"
          />
        </div>
      </Section>

      {/* ── 10. Settings ───────────────────────────────────────────────────── */}
      <Section title="Settings">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(
            [
              { key: 'featured', label: 'Featured', desc: 'Show in featured section' },
              { key: 'showOnSite', label: 'Show on Website', desc: 'Visible to public' },
              { key: 'siteVisitAvailable', label: 'Site Visit', desc: 'Site visits open' },
              { key: 'showflatAvailable', label: 'ShowFlat Open', desc: 'Showflat available' },
            ] as Array<{ key: keyof FormState; label: string; desc: string }>
          ).map(({ key, label, desc }) => (
            <label key={key} className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={!!form[key]}
                onChange={(e) => set(key, e.target.checked as FormState[typeof key])}
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

      {/* ── Error + Submit ──────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pb-8">
        <button type="button" onClick={() => router.push('/admin')}
          className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-[#374151] hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-[#1a56db] hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          {saving ? 'Saving…' : isNew ? 'Create Project' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
