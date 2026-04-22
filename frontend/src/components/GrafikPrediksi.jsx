import { useMemo } from 'react'
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import { formatRupiah, formatRupiahShort, formatTanggalShort } from '../api'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-tooltip">
      <div className="tooltip-date">{formatTanggalShort(label)}</div>
      {payload.map((p, i) => {
        if (p.dataKey === 'confidence') return null
        return (
          <div key={i} className="tooltip-item">
            <span className="tooltip-dot" style={{ background: p.color || p.stroke }} />
            <span>{p.name}: {formatRupiah(p.value)}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function GrafikPrediksi({ historis, prediksi, komoditas, tanggalHariIni }) {
  const chartData = useMemo(() => {
    const result = []
    if (historis && historis.length > 0) {
      historis.slice(-45).forEach((d) => {
        result.push({ tanggal: d.tanggal, aktual: d.harga, prediksi: null, batas_bawah: null, batas_atas: null, confidence: null })
      })
    }
    if (prediksi && prediksi.length > 0 && result.length > 0) {
      const last = result[result.length - 1]
      result.push({
        tanggal: prediksi[0].tanggal,
        aktual: null,
        prediksi: last.aktual || prediksi[0].prediksi,
        batas_bawah: prediksi[0].batas_bawah,
        batas_atas: prediksi[0].batas_atas,
        confidence: [prediksi[0].batas_bawah, prediksi[0].batas_atas],
      })
      prediksi.slice(1).forEach((d) => {
        result.push({
          tanggal: d.tanggal,
          aktual: null,
          prediksi: d.prediksi,
          batas_bawah: d.batas_bawah,
          batas_atas: d.batas_atas,
          confidence: [d.batas_bawah, d.batas_atas],
        })
      })
    }
    return result
  }, [historis, prediksi])

  if (chartData.length === 0) return <div className="skeleton skeleton-chart" />

  const allVals = chartData.flatMap(d => [d.aktual, d.prediksi, d.batas_bawah, d.batas_atas].filter(Boolean))
  const minVal = Math.min(...allVals), maxVal = Math.max(...allVals)
  const padding = (maxVal - minVal) * 0.12 || 500
  const yMin = Math.max(0, Math.floor((minVal - padding) / 1000) * 1000)
  const yMax = Math.ceil((maxVal + padding) / 1000) * 1000

  return (
    <div className="pred-chart-wrapper fade-in">
      <div className="chart-card-header" style={{ marginBottom: 16 }}>
        <div className="chart-card-title">
          📈 Grafik Prediksi — {komoditas}
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 16, height: 2.5, background: '#3B82F6', display: 'inline-block' }} />
            Aktual
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 16, height: 2.5, background: '#F97316', display: 'inline-block', borderTop: '2px dashed #F97316', background: 'none' }} />
            Prediksi
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={330}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 5 }}>
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
            width={68}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="confidence"
            name="Interval Kepercayaan"
            fill="#F97316"
            fillOpacity={0.07}
            stroke="none"
          />
          {tanggalHariIni && (
            <ReferenceLine
              x={tanggalHariIni}
              stroke="#6B7280"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: 'Hari ini', position: 'top', fill: '#6B7280', fontSize: 10, fontWeight: 600 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="aktual"
            name="Harga Aktual"
            stroke="#3B82F6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: '#3B82F6' }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="prediksi"
            name="Prediksi"
            stroke="#F97316"
            strokeWidth={2.5}
            strokeDasharray="6 4"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: '#F97316' }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
