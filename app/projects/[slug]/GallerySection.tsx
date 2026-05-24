'use client'

import { useState } from 'react'

interface Props {
  projectName: string
  waPhotos: string
}

const TABS = ['Photos', 'Floor Plans', 'Video'] as const
type Tab = (typeof TABS)[number]

const THUMBNAILS = [
  { gradient: 'from-[#1a56db] to-[#0f2361]', label: 'Exterior' },
  { gradient: 'from-[#0f2361] to-[#1a56db]', label: 'Lobby' },
  { gradient: 'from-[#1e3a5f] to-[#2563eb]', label: 'Amenities' },
  { gradient: 'from-[#2563eb] to-[#1e40af]', label: 'Floor Plan' },
]

export default function GallerySection({ projectName, waPhotos }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Photos')
  const [activeThumb, setActiveThumb] = useState(0)

  return (
    <div className="w-full">
      {/* Tab switcher */}
      <div className="flex gap-1 mb-3">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              tab === activeTab
                ? 'bg-[#1a56db] text-white'
                : 'bg-white text-[#6b7280] border border-gray-200 hover:border-[#1a56db] hover:text-[#1a56db]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="relative w-full h-72 sm:h-96 lg:h-[480px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a56db] to-[#0f2361]">
        {/* Gradient layers for visual depth */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${THUMBNAILS[activeThumb].gradient} transition-opacity duration-300`}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMCAwaDFWMUgweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvZz48L3N2Zz4=')] opacity-20" />

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-white/20 text-6xl sm:text-8xl font-black tracking-tighter select-none">
            {activeTab === 'Photos' ? '🏢' : activeTab === 'Floor Plans' ? '📐' : '▶️'}
          </div>
          <p className="text-white/40 text-sm mt-2 font-medium">
            {activeTab === 'Video' ? 'Video walkthrough coming soon' : `${projectName} — ${THUMBNAILS[activeThumb].label}`}
          </p>
        </div>

        {/* Counter */}
        <div className="absolute top-4 right-4 bg-black/40 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
          {activeThumb + 1} / {THUMBNAILS.length + 1}
        </div>

        {/* Request photos overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex items-end justify-between">
          <p className="text-white/80 text-sm font-medium">
            {activeTab === 'Video' ? 'Get video walkthrough on WhatsApp' : 'High-res photos available on request'}
          </p>
          <a
            href={waPhotos}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 ml-4 flex items-center gap-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Request Photos
          </a>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 mt-3">
        {THUMBNAILS.map((thumb, i) => (
          <button
            key={thumb.label}
            onClick={() => setActiveThumb(i)}
            className={`flex-1 h-16 sm:h-20 rounded-xl overflow-hidden transition-all ${
              i === activeThumb ? 'ring-2 ring-[#1a56db] ring-offset-1' : 'opacity-60 hover:opacity-80'
            }`}
          >
            <div className={`w-full h-full bg-gradient-to-br ${thumb.gradient} flex items-center justify-center`}>
              <span className="text-white/50 text-xs font-medium">{thumb.label}</span>
            </div>
          </button>
        ))}
        <button
          onClick={() => {}}
          className="flex-1 h-16 sm:h-20 rounded-xl overflow-hidden opacity-60 hover:opacity-80 transition-all"
        >
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <span className="text-white/80 text-xs font-bold">+3 more</span>
          </div>
        </button>
      </div>
    </div>
  )
}
