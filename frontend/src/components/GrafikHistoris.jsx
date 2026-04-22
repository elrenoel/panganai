import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { formatRupiah, formatRupiahShort, formatTanggalShort, getKomoditasColor } from '../api'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <div className="tooltip-date">{formatTanggalShort(label)}</div>
      {payload.map((p, i) => (
        <div key={i} className="tooltip-item">
          <span className="tooltip-dot" style={{ background: p.color }} />
          <span>{p.name}: {formatRupiah(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function GrafikHistoris({ data, komoditas }) {
  const color = getKomoditasColor(komoditas)

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    const grouped = {}
    data.forEach((d) => {
      if (!grouped[d.tanggal]) grouped[d.tanggal] = { nasional: [] }
      if (d.harga_nasional != null) grouped[d.tanggal].nasional.push(d.harga_nasional)
    })
    return Object.keys(grouped).sort().map((tanggal) => {
      const g = grouped[tanggal]
      const avgNasional = g.nasional.length > 0
        ? g.nasional.reduce((a, b) => a + b, 0) / g.nasional.length : null
      return { tanggal, harga_nasional: avgNasional != null ? Math.round(avgNasional) : null }
    })
  }, [data])

  if (chartData.length === 0) return <div className="skeleton skeleton-chart" />

  const values = chartData.map(d => d.harga_nasional).filter(Boolean)
  const minVal = Math.min(...values), maxVal = Math.max(...values)
  const padding = (maxVal - minVal) * 0.12 || 500
  const yMin = Math.floor((minVal - padding) / 1000) * 1000
  const yMax = Math.ceil((maxVal + padding) / 1000) * 1000

  return (
    <div className="chart-card fade-in">
      <div className="chart-card-header">
        <div className="chart-card-title">
          <span className="komoditas-dot" style={{ background: color }} />
          {komoditas}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 12, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis
            dataKey="tanggal"
            tickFormatter={formatTanggalShort}
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis
            domain={[yMin, yMax]}
            tickFormatter={formatRupiahShort}
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            width={62}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="harga_nasional"
            name="Harga Nasional"
            stroke={color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
