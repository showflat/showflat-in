'use client'

import { useState } from 'react'

interface ConfigVariant {
  carpetSqft: number
  builtUpSqft?: number
  priceMin?: number | null
  label?: string
}

interface Config {
  type: string
  // Legacy flat fields (current 6-project data)
  carpetSqft?: number
  builtUpSqft?: number
  priceMin?: number
  // New variants array (future data)
  variants?: ConfigVariant[]
  note?: string
}

interface Props {
  configs: Config[]
  waFloorPlan: string
  projectName: string
  projectLocality: string
  projectFloors?: number
}

function fmtPrice(n: number): string {
  if (n >= 10000000) {
    const v = n / 10000000
    return `₹${Number.isInteger(v) ? v : v.toFixed(2)} Cr`
  }
  return `₹${Math.round(n / 100000)} L`
}

export default function ConfigTabs({
  configs,
  waFloorPlan,
  projectName,
  projectLocality,
  projectFloors,
}: Props) {
  const [active, setActive] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalCarpet, setModalCarpet] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedConfig, setSelectedConfig] = useState('')

  const c = configs[active]

  // Build display rows from variants array if present, else fall back to flat fields
  const rows: ConfigVariant[] =
    c.variants && c.variants.length > 0
      ? c.variants
      : c.carpetSqft
      ? [{ carpetSqft: c.carpetSqft, builtUpSqft: c.builtUpSqft, priceMin: c.priceMin }]
      : []

  function openModal(carpet: number) {
    setModalCarpet(carpet)
    setSelectedConfig(c.type)
    setModalOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const carpetStr = modalCarpet ? `${modalCarpet}sqft ` : ''
    const text = encodeURIComponent(
      `Hi ShowFlat! I want pricing for ${selectedConfig} ${carpetStr}in ${projectName}, ${projectLocality}. My name is ${name}, phone ${phone}.`
    )
    window.open(`https://wa.me/919130114411?text=${text}`, '_blank')
    setModalOpen(false)
    setName('')
    setPhone('')
  }

  return (
    <>
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

      {/* Floors badge */}
      {projectFloors && projectFloors > 0 && (
        <p className="text-xs font-semibold text-[#6b7280] mb-4">
          🏢 G+{projectFloors} floors
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Variants table */}
        <div>
          {rows.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#6b7280]">
                      Carpet Area
                    </th>
                    {rows.some((r) => r.builtUpSqft) && (
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#6b7280]">
                        Built-up
                      </th>
                    )}
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#6b7280]">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-[#111827]">
                        {row.carpetSqft} sqft
                      </td>
                      {rows.some((r) => r.builtUpSqft) && (
                        <td className="px-4 py-3 text-[#6b7280]">
                          {row.builtUpSqft ? `${row.builtUpSqft} sqft` : '—'}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        {row.priceMin && row.priceMin > 0 ? (
                          <span className="font-semibold text-[#1a56db]">
                            {fmtPrice(row.priceMin)}
                          </span>
                        ) : (
                          <button
                            onClick={() => openModal(row.carpetSqft)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a56db] border border-[#1a56db] px-2.5 py-1 rounded-full hover:bg-blue-50 transition-colors"
                          >
                            Contact for pricing →
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-5 text-center">
              <p className="text-sm text-[#6b7280] mb-3">
                Configuration details available on request
              </p>
              <button
                onClick={() => openModal(0)}
                className="inline-flex items-center gap-1.5 border-2 border-[#1a56db] text-[#1a56db] text-xs font-bold px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors"
              >
                Contact for exact pricing →
              </button>
            </div>
          )}

          {c.note && (
            <p className="mt-3 text-sm text-[#1a56db] bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
              ✨ {c.note}
            </p>
          )}
        </div>

        {/* Floor plan placeholder + CTA */}
        <div className="flex flex-col gap-3">
          <div className="flex-1 min-h-[140px] bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-dashed border-blue-200 rounded-xl flex flex-col items-center justify-center gap-2 p-4">
            <span className="text-3xl">📐</span>
            <p className="text-sm font-semibold text-[#1a56db]">Floor Plan</p>
            <p className="text-xs text-[#6b7280] text-center">
              {c.type} — {rows[0]?.carpetSqft ? `from ${rows[0].carpetSqft} sqft` : 'carpet area'}
            </p>
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

      {/* ── Pricing modal ──────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#111827]">
                  Get exact pricing for {projectName}
                </h3>
                <p className="text-sm text-[#6b7280] mt-1">
                  We'll send the full cost sheet on WhatsApp within 2 minutes
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-[#6b7280] hover:text-[#111827] ml-4 shrink-0 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  Your name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  Phone number
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-[#6b7280]">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    pattern="[6-9][0-9]{9}"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  Configuration interested in
                </label>
                <select
                  value={selectedConfig}
                  onChange={(e) => setSelectedConfig(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#1a56db] focus:border-transparent"
                >
                  {configs.map((cfg) => {
                    const cfgRows =
                      cfg.variants && cfg.variants.length > 0
                        ? cfg.variants
                        : cfg.carpetSqft
                        ? [{ carpetSqft: cfg.carpetSqft }]
                        : []
                    return cfgRows.map((r, i) => (
                      <option key={`${cfg.type}-${i}`} value={`${cfg.type} ${r.carpetSqft}sqft`}>
                        {cfg.type} — {r.carpetSqft} sqft carpet
                      </option>
                    ))
                  })}
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Send me the price sheet
              </button>

              <p className="text-center text-xs text-[#6b7280]">
                📲 You'll receive price sheet, floor plan and payment plan on WhatsApp
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
