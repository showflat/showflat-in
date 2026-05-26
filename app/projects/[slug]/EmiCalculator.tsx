'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'

// ─── Maths ────────────────────────────────────────────────────────────────────

function calcEMI(principal: number, annualRate: number, tenureYears: number): number {
  if (principal <= 0 || annualRate <= 0 || tenureYears <= 0) return 0
  const r = annualRate / 12 / 100
  const n = tenureYears * 12
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
}

interface AmortRow {
  year: number
  emiPaid: number
  principalPaid: number
  interestPaid: number
  balance: number
}

function buildAmortization(
  principal: number,
  annualRate: number,
  tenureYears: number,
  emi: number
): AmortRow[] {
  const r = annualRate / 12 / 100
  let balance = principal
  const rows: AmortRow[] = []

  for (let year = 1; year <= tenureYears; year++) {
    let yearEMI = 0
    let yearPrincipal = 0
    let yearInterest = 0

    for (let m = 0; m < 12 && balance > 1; m++) {
      const interest = balance * r
      const principalPaid = Math.min(emi - interest, balance)
      yearInterest += interest
      yearPrincipal += principalPaid
      yearEMI += emi
      balance = Math.max(0, balance - principalPaid)
    }

    rows.push({
      year,
      emiPaid: Math.round(yearEMI),
      principalPaid: Math.round(yearPrincipal),
      interestPaid: Math.round(yearInterest),
      balance: Math.max(0, Math.round(balance)),
    })
  }

  return rows
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function fmtL(n: number): string {
  if (n >= 10000000) {
    const v = n / 10000000
    return `₹${v % 1 === 0 ? v.toFixed(0) : v.toFixed(2).replace(/\.?0+$/, '')} Cr`
  }
  const v = n / 100000
  return `₹${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)} L`
}

function fmtShort(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`
  return `₹${(n / 1000).toFixed(0)}k`
}

// ─── Slider sub-component ─────────────────────────────────────────────────────

function Slider({
  label,
  display,
  min,
  max,
  step,
  value,
  onChange,
  minLabel,
  maxLabel,
}: {
  label: string
  display: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
  minLabel: string
  maxLabel: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs font-medium text-[#6b7280]">{label}</p>
        <p className="text-xl font-extrabold text-[#111827] tabular-nums">{display}</p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full h-1.5 rounded-full accent-[#1a56db] cursor-pointer"
      />
      <div className="flex justify-between text-xs text-[#6b7280] mt-1">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EmiCalcProps {
  propertyPrice: number
  onStateChange?: (state: { loanAmount: number; rate: number; tenure: number }) => void
  highlightTenure?: number
}

// ─── Main component ───────────────────────────────────────────────────────────

const QUICK_TENURES = [15, 20, 25, 30]

export default function EmiCalculator({ propertyPrice, onStateChange, highlightTenure }: EmiCalcProps) {
  const defaultLoan = Math.round((propertyPrice * 0.8) / 100000) * 100000

  const [loanAmount, setLoanAmount] = useState(defaultLoan)
  const [tenure, setTenure] = useState(20)
  const [rate, setRate] = useState(8.5)
  const [showAmort, setShowAmort] = useState(false)

  // Notify parent of state changes for snapshot card sync
  useEffect(() => {
    onStateChange?.({ loanAmount, rate, tenure })
  }, [loanAmount, rate, tenure]) // eslint-disable-line react-hooks/exhaustive-deps

  const emi = calcEMI(loanAmount, rate, tenure)
  const totalPayable = emi * tenure * 12
  const totalInterest = Math.max(0, totalPayable - loanAmount)

  const pieData = [
    { name: 'Principal', value: loanAmount },
    { name: 'Interest', value: Math.round(totalInterest) },
  ]

  const amortRows = showAmort ? buildAmortization(loanAmount, rate, tenure, emi) : []

  return (
    <div className="space-y-5">
      {/* ── Three sliders ─────────────────────────────────────────────── */}
      <Slider
        label="Loan Amount"
        display={fmtL(loanAmount)}
        min={1000000}
        max={30000000}
        step={100000}
        value={loanAmount}
        onChange={setLoanAmount}
        minLabel="₹10 L"
        maxLabel="₹3 Cr"
      />

      {/* Tenure slider + quick-select buttons */}
      <div>
        <Slider
          label="Loan Tenure"
          display={`${tenure} Years`}
          min={1}
          max={30}
          step={1}
          value={tenure}
          onChange={setTenure}
          minLabel="1 yr"
          maxLabel="30 yrs"
        />
        <div className="flex gap-2 mt-2">
          {QUICK_TENURES.map((t) => {
            const isActive = tenure === t
            const isHighlighted = highlightTenure === t
            return (
              <button
                key={t}
                onClick={() => setTenure(t)}
                className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors border ${
                  isActive
                    ? 'bg-[#1a56db] text-white border-[#1a56db]'
                    : isHighlighted
                    ? 'bg-blue-50 text-[#1a56db] border-[#1a56db] ring-2 ring-[#1a56db] ring-offset-1'
                    : 'bg-gray-50 text-[#6b7280] border-gray-200 hover:border-[#1a56db] hover:text-[#1a56db]'
                }`}
              >
                {t}yr
              </button>
            )
          })}
        </div>
      </div>

      <Slider
        label="Interest Rate"
        display={`${rate.toFixed(2)}% p.a.`}
        min={6.5}
        max={12}
        step={0.25}
        value={rate}
        onChange={setRate}
        minLabel="6.5%"
        maxLabel="12%"
      />

      {/* ── Monthly EMI output ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#1a56db] to-[#1e3a8a] rounded-xl p-4 text-center">
        <p className="text-blue-200 text-xs font-medium mb-1">Monthly EMI</p>
        <p className="text-3xl font-extrabold text-white tabular-nums">
          ₹{emi.toLocaleString('en-IN')}
        </p>
        <p className="text-blue-200 text-xs mt-0.5">/month</p>
      </div>

      {/* ── Summary pills ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Principal', value: fmtL(loanAmount), bg: 'bg-gray-50 border-gray-100', text: 'text-[#111827]' },
          { label: 'Interest', value: fmtL(totalInterest), bg: 'bg-orange-50 border-orange-100', text: 'text-orange-600' },
          { label: 'Total', value: fmtL(totalPayable), bg: 'bg-blue-50 border-blue-100', text: 'text-[#1a56db]' },
        ].map((pill) => (
          <div key={pill.label} className={`border rounded-xl p-2.5 text-center ${pill.bg}`}>
            <p className="text-xs text-[#6b7280] mb-1">{pill.label}</p>
            <p className={`text-sm font-bold tabular-nums ${pill.text}`}>{pill.value}</p>
          </div>
        ))}
      </div>

      {/* ── Donut chart ───────────────────────────────────────────────── */}
      <div>
        <div className="flex justify-center -mb-2">
          <PieChart width={180} height={148}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={46}
              outerRadius={64}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              dataKey="value"
            >
              <Cell fill="#1a56db" />
              <Cell fill="#f97316" />
            </Pie>
            <Tooltip
              formatter={(value) => [
                typeof value === 'number' ? fmtL(value) : String(value),
                '',
              ]}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
            />
          </PieChart>
        </div>
        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1a56db]" />
            <span className="text-xs text-[#6b7280]">Principal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-xs text-[#6b7280]">Interest</span>
          </div>
        </div>
      </div>

      {/* ── Amortization table ────────────────────────────────────────── */}
      <div>
        <button
          onClick={() => setShowAmort(!showAmort)}
          className="w-full flex items-center justify-between text-sm font-semibold text-[#1a56db] py-2.5 px-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100"
        >
          <span>View year-by-year breakdown</span>
          <span className="text-xs">{showAmort ? '▲' : '▼'}</span>
        </button>

        {showAmort && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-xs min-w-[340px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Yr', 'EMI', 'Principal', 'Interest', 'Balance'].map((col) => (
                    <th
                      key={col}
                      className="px-2.5 py-2 text-right first:text-left font-semibold text-[#6b7280] whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {amortRows.map((row, i) => (
                  <tr
                    key={row.year}
                    className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'} border-b border-gray-50 last:border-0`}
                  >
                    <td className="px-2.5 py-1.5 font-semibold text-[#111827]">{row.year}</td>
                    <td className="px-2.5 py-1.5 text-right text-[#6b7280] tabular-nums">{fmtShort(row.emiPaid)}</td>
                    <td className="px-2.5 py-1.5 text-right font-medium text-[#1a56db] tabular-nums">{fmtShort(row.principalPaid)}</td>
                    <td className="px-2.5 py-1.5 text-right text-orange-600 tabular-nums">{fmtShort(row.interestPaid)}</td>
                    <td className="px-2.5 py-1.5 text-right text-[#111827] tabular-nums">
                      {row.balance === 0 ? '—' : fmtShort(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
