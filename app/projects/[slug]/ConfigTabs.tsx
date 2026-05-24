'use client'

import { useState } from 'react'

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

interface Props {
  configs: Config[]
  waFloorPlan: string
}

function fmt(n: number): string {
  if (n >= 10000000) {
    const v = n / 10000000
    return `₹${Number.isInteger(v) ? v : v.toFixed(2)} Cr`
  }
  const v = Math.round(n / 100000)
  return `₹${v} L`
}

export default function ConfigTabs({ configs, waFloorPlan }: Props) {
  const [active, setActive] = useState(0)
  const c = configs[active]

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {configs.map((cfg, i) => (
          <button
            key={cfg.type}
            onClick={() => setActive(i)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              i === active
                ? 'bg-[#1a56db] text-white shadow-sm'
                : 'bg-gray-100 text-[#6b7280] hover:bg-gray-200'
            }`}
          >
            {cfg.type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: 'Carpet Area',
              value: `${c.carpetSqft} sqft`,
              sub: `Built-up: ${c.builtUpSqft} sqft`,
            },
            {
              label: 'Price Range',
              value: fmt(c.priceMin),
              sub: `to ${fmt(c.priceMax)}`,
            },
            {
              label: 'Units Available',
              value: `${c.unitsAvailable}`,
              sub: `of ${c.unitsTotal} total`,
            },
            {
              label: 'Floors',
              value: c.floors,
              sub: `₹${c.pricePerSqft.toLocaleString('en-IN')}/sqft`,
            },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-[#6b7280] mb-1.5 font-medium">{item.label}</p>
              <p className="font-bold text-[#111827] text-lg leading-tight">{item.value}</p>
              <p className="text-xs text-[#6b7280] mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Floor plan placeholder + CTA */}
        <div className="flex flex-col gap-3">
          <div className="flex-1 min-h-[140px] bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-dashed border-blue-200 rounded-xl flex flex-col items-center justify-center gap-2 p-4">
            <span className="text-3xl">📐</span>
            <p className="text-sm font-semibold text-[#1a56db]">Floor Plan</p>
            <p className="text-xs text-[#6b7280] text-center">{c.type} — {c.carpetSqft} sqft carpet</p>
          </div>
          <a
            href={waFloorPlan}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#1a56db] hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Download Floor Plan on WhatsApp
          </a>
        </div>
      </div>

      {c.note && (
        <p className="mt-4 text-sm text-[#1a56db] bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
          ✨ {c.note}
        </p>
      )}
    </div>
  )
}
