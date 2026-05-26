'use client'

import { useState } from 'react'
import EmiCalculator from './EmiCalculator'

function calcEMI(principal: number, annualRate: number, tenureYears: number): number {
  if (principal <= 0 || annualRate <= 0 || tenureYears <= 0) return 0
  const r = annualRate / 12 / 100
  const n = tenureYears * 12
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
}

function fmtL(n: number): string {
  if (n >= 10000000) {
    const v = n / 10000000
    return `₹${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)} Cr`
  }
  const v = n / 100000
  return `₹${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)} L`
}

const TENURES = [
  { years: 15, label: '15-year loan' },
  { years: 20, label: '20-year loan' },
  { years: 25, label: '25-year loan' },
  { years: 30, label: '30-year loan' },
]

export default function LoanSection({ propertyPrice }: { propertyPrice: number }) {
  const defaultLoan = Math.round((propertyPrice * 0.8) / 100000) * 100000

  const [loanAmount, setLoanAmount] = useState(defaultLoan)
  const [rate, setRate] = useState(8.5)
  const [activeTenure, setActiveTenure] = useState(20)

  const downPayment = Math.max(0, propertyPrice - loanAmount)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[#111827]">Home Loan Snapshot</h2>
        <span className="text-xs font-medium text-[#6b7280] bg-gray-100 px-3 py-1.5 rounded-full">
          {rate}% p.a.
        </span>
      </div>

      {/* ── 4 scenario cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {TENURES.map(({ years, label }) => {
          const emi = calcEMI(loanAmount, rate, years)
          const isPopular = years === 20
          const isActive = activeTenure === years

          return (
            <button
              key={years}
              onClick={() => setActiveTenure(years)}
              className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                isActive
                  ? 'border-[#1a56db] bg-blue-50 shadow-md'
                  : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'
              }`}
            >
              {isPopular && (
                <span className="absolute -top-2.5 left-3 text-xs font-bold bg-[#1a56db] text-white px-2.5 py-0.5 rounded-full">
                  Most popular
                </span>
              )}

              <p className={`text-xs font-semibold mb-3 ${isActive ? 'text-[#1a56db]' : 'text-[#6b7280]'}`}>
                {label}
              </p>

              <div className="space-y-1.5 text-xs border-t border-gray-100 pt-2.5 mb-3">
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Loan amount</span>
                  <span className="font-semibold text-[#374151]">{fmtL(loanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Down payment</span>
                  <span className="font-semibold text-[#374151]">{fmtL(downPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Interest</span>
                  <span className="font-semibold text-[#374151]">{rate}% p.a.</span>
                </div>
              </div>

              <p className="text-xs text-[#6b7280] mb-0.5">Monthly EMI</p>
              <p className={`text-xl font-extrabold tabular-nums leading-tight ${isActive ? 'text-[#1a56db]' : 'text-[#111827]'}`}>
                ₹{emi.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-[#6b7280]">/month</p>
            </button>
          )
        })}
      </div>

      {/* ── Full EMI calculator (reactive) ────────────────────────────────── */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-semibold text-[#374151] mb-4">
          Adjust loan details — cards update in real time
        </p>
        <EmiCalculator
          propertyPrice={propertyPrice}
          onStateChange={({ loanAmount: l, rate: r, tenure: t }) => {
            setLoanAmount(l)
            setRate(r)
            if ([15, 20, 25, 30].includes(t)) setActiveTenure(t)
          }}
          highlightTenure={activeTenure}
        />
      </div>

      <p className="mt-4 text-xs text-[#6b7280]">
        Indicative only. Actual EMI depends on your bank&apos;s rate and processing fee.
      </p>
    </div>
  )
}
