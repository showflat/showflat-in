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

function fmt(n: number): string {
  if (n >= 10000000) {
    const v = n / 10000000
    return `₹${Number.isInteger(v) ? v : v.toFixed(2)} Cr`
  }
  const v = Math.round(n / 100000)
  return `₹${v} L`
}

export default function ConfigTabs({ configs }: { configs: Config[] }) {
  const [active, setActive] = useState(0)
  const c = configs[active]

  return (
    <div>
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
          <div
            key={item.label}
            className="bg-gray-50 rounded-xl p-4 border border-gray-100"
          >
            <p className="text-xs text-[#6b7280] mb-1.5 font-medium">{item.label}</p>
            <p className="font-bold text-[#111827] text-lg leading-tight">{item.value}</p>
            <p className="text-xs text-[#6b7280] mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>

      {c.note && (
        <p className="mt-3 text-sm text-[#1a56db] bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
          ✨ {c.note}
        </p>
      )}
    </div>
  )
}
