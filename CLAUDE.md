# ShowFlat.in — project brief

Site: showflat.in — Pune's trusted new launch property specialists. Zero brokerage channel partner. Pune only.

## Brand
- Primary: #1a56db (blue), Accent: #16a34a (green), Text: #111827, Muted: #6b7280
- Font: Inter (Google Fonts)
- Tone: trustworthy, modern, clean. No jargon.

## Target user
Pune IT professional, 28–40 years, budget ₹50L–₹2Cr, first or second home buyer.

## Data files
- /data/projects.json — all 6 Pune property listings
- /data/localities.json — 15 Pune micro-market data

## Rules for every page
1. Always Next.js 14 App Router with TypeScript
2. Always Tailwind CSS — mobile-first
3. Always add metadata() export for SEO
4. Every CTA links to WhatsApp: https://wa.me/919130114411
5. Use next/image for all images
6. Read data from JSON files using fs.readFileSync in server components
7. All prices in Indian Rupees ₹, all distances in km
