'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface PricePoint {
  date: string
  pricePerSqft: number
}

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function shortDate(d: string): string {
  const [year, month] = d.split('-')
  return `${MONTH_SHORT[+month - 1]} '${year.slice(2)}`
}

export default function PriceChart({
  history,
  appreciation,
}: {
  history: PricePoint[]
  appreciation: number
}) {
  const data = history.map((p) => ({ date: shortDate(p.date), price: p.pricePerSqft }))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[#111827]">Price trend</h2>
        <span className="text-sm font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
          +{appreciation}% in 3 yrs
        </span>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
              width={42}
            />
            <Tooltip
              formatter={(value) => [
                typeof value === 'number'
                  ? `₹${value.toLocaleString('en-IN')}/sqft`
                  : String(value),
                'Price',
              ]}
              labelStyle={{ color: '#111827', fontWeight: 600, fontSize: 12 }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#1a56db"
              strokeWidth={2.5}
              dot={{ fill: '#1a56db', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#1a56db' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-center text-[#6b7280] mt-2">Price per sqft (₹) over time</p>
    </div>
  )
}
