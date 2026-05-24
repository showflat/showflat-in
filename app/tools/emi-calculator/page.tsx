import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/app/components/Navbar'
import EmiCalculator from '@/app/projects/[slug]/EmiCalculator'

export const metadata: Metadata = {
  title: 'Home Loan EMI Calculator | ShowFlat.in',
  description:
    'Calculate your home loan EMI for Pune properties. Adjust loan amount, tenure and interest rate. View year-by-year amortization breakdown. Zero brokerage.',
  openGraph: {
    title: 'Home Loan EMI Calculator | ShowFlat.in',
    description: 'Free EMI calculator for Pune home loans.',
    type: 'website',
  },
}

export default function EmiCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <nav className="flex items-center gap-2 text-xs text-[#6b7280] mb-4">
            <Link href="/" className="hover:text-[#1a56db] transition-colors">Home</Link>
            <span>›</span>
            <span className="text-[#111827] font-medium">EMI Calculator</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-[#111827] mb-2">Home Loan EMI Calculator</h1>
          <p className="text-[#6b7280]">
            Estimate your monthly EMI for any Pune property. Adjust loan amount, tenure, and interest rate.
          </p>
        </div>
      </div>

      {/* Calculator */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <EmiCalculator propertyPrice={7500000} />
        </div>

        {/* Guidance note */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <p className="text-sm font-semibold text-[#1a56db] mb-1">How to use this calculator</p>
          <ul className="text-sm text-[#374151] space-y-1 list-disc list-inside">
            <li>Set the loan amount to 80% of the property price (most banks lend up to 80%)</li>
            <li>Current home loan rates range from 8.5% to 9.5% p.a. for salaried applicants</li>
            <li>A 20-year tenure is the standard for new launches — reduces EMI vs shorter tenures</li>
            <li>Use the year-by-year breakdown to see how much goes to principal vs interest</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <p className="font-bold text-[#111827] mb-1">Ready to see which Pune projects fit your EMI?</p>
          <p className="text-sm text-[#6b7280] mb-4">Browse RERA verified new launches — zero brokerage.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-2 bg-[#1a56db] hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              Browse all projects →
            </Link>
            <a
              href={`https://wa.me/919130114411?text=${encodeURIComponent("Hi, I used the EMI calculator and want to find projects that fit my budget.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Get personalised advice
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
