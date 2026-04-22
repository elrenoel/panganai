import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react'

// ── Mock Data ──────────────────────────────────────────────────
const generateDemandData = (days) => {
  const data = []
  const baseDate = new Date('2026-03-15')
  for (let i = 0; i < days; i++) {
    const d = new Date(baseDate)
    d.setDate(d.getDate() + i)
    const demand = 2800 + Math.sin(i * 0.3) * 200 + Math.random() * 100
    const supply = 2600 + Math.cos(i * 0.25) * 180 + Math.random() * 80
    data.push({
      tanggal: d.toISOString().slice(0, 10),
      demand: Math.round(demand),
      supply: Math.round(supply),
      gap: Math.round(demand - supply),
    })
  }
  return data
}

const REGIONAL_DATA = [
  { wilayah: 'Jakarta', demand: 450, supply: 380, efisiensi: 84.4, kategori: 'high' },
  { wilayah: 'Surabaya', demand: 320, supply: 260, efisiensi: 81.2, kategori: 'high' },
  { wilayah: 'Medan', demand: 280, supply: 220, efisiensi: 78.6, kategori: 'critical' },
  { wilayah: 'Bandung', demand: 280, supply: 265, efisiensi: 94.6, kategori: 'balanced' },
  { wilayah: 'Semarang', demand: 220, supply: 215, efisiensi: 97.7, kategori: 'balanced' },
  { wilayah: 'Yogyakarta', demand: 160, supply: 115, efisiensi: 71.8, kategori: 'critical' },
  { wilayah: 'Denpasar', demand: 140, supply: 95, efisiensi: 67.8, kategori: 'critical' },
  { wilayah: 'Palembang', demand: 150, supply: 180, efisiensi: 100, kategori: 'surplus' },
  { wilayah: 'Banjarmasin', demand: 120, supply: 140, efisiensi: 100, kategori: 'surplus' },
  { wilayah: 'Makassar', demand: 200, supply: 185, efisiensi: 92.5, kategori: 'balanced' },
]

function DemandTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const demand = payload.find(p => p.dataKey === 'demand')?.value
  const supply = payload.find(p => p.dataKey === 'supply')?.value
  const gap = demand && supply ? demand - supply : 0
  const pct = demand ? ((gap / demand) * 100).toFixed(1) : 0
  return (
    <div className="custom-tooltip">
      <div className="tooltip-date">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="tooltip-item">
          <span className="tooltip-dot" style={{ background: p.color }} />
          <span>{p.name}: {p.value.toLocaleString('id-ID')} Ton</span>
        </div>
      ))}
      <div className="tooltip-item" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 6, paddingTop: 6 }}>
        <span>Gap: {gap > 0 ? '-' : '+'}{Math.abs(gap).toLocaleString('id-ID')} Ton ({pct}%)</span>
      </div>
    </div>
  )
}

const KATEGORI_CONFIG = {
  high:     { label: '📍 High Demand', color: '#EF4444', bg: 'rgba(239,68,68,0.06)', rec: '🚚 Tambah distribusi' },
  critical: { label: '⚠️ Mismatch Kritis', color: '#F97316', bg: 'rgba(249,115,22,0.06)', rec: '🚨 Prioritas darurat' },
  balanced: { label: '⚖️ Balanced', color: '#10B981', bg: 'rgba(16,185,129,0.06)', rec: '✅ Optimal' },
  surplus:  { label: '📦 Surplus', color: '#3B82F6', bg: 'rgba(59,130,246,0.06)', rec: '📦 Optimalkan penyimpanan' },
}

export default function DemandAnalysis() {
  const [period, setPeriod] = useState('30')
  const data = useMemo(() => generateDemandData(parseInt(period)), [period])

  const totalDemand = data.reduce((s, d) => s + d.demand, 0)
  const totalSupply = data.reduce((s, d) => s + d.supply, 0)
  const avgGap = ((totalDemand - totalSupply) / totalDemand * 100).toFixed(1)
  const efisiensi = (totalSupply / totalDemand * 100).toFixed(1)

  return (
    <div>
      <div className="page-header">
        <h2>Demand Analysis</h2>
        <p>Analisis kesenjangan permintaan dan pasokan komoditas pangan per wilayah</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Demand', value: `${(totalDemand/1000).toFixed(1)}K Ton`, color: '#3B82F6' },
          { label: 'Total Supply', value: `${(totalSupply/1000).toFixed(1)}K Ton`, color: '#10B981' },
          { label: 'Gap Rata-rata', value: `${avgGap}%`, color: '#EF4444' },
          { label: 'Efisiensi', value: `${efisiensi}%`, color: '#F97316' },
        ].map((c, i) => (
          <div key={i} className="kpi-card fade-in">
            <div className="kpi-label">{c.label}</div>
            <div className="kpi-value font-mono" style={{ color: c.color, fontSize: 22 }}>{c.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Periode {period} hari</div>
          </div>
        ))}
      </div>

      {/* Period Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Clock size={14} /> Filter Periode:
        </span>
        <div className="toggle-group">
          {['7', '14', '30'].map(p => (
            <button key={p} className={`toggle-btn-item${period === p ? ' active' : ''}`} onClick={() => setPeriod(p)}>
              {p} Hari
            </button>
          ))}
        </div>
      </div>

      {/* Area Chart */}
      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div className="chart-card-header">
          <div className="chart-card-title">📊 Tren Permintaan vs Pasokan ({period} Hari)</div>
        </div>
        <ResponsiveContainer width="100%" height={330}>
          <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gDemand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gSupply" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="tanggal" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval="preserveStartEnd" minTickGap={40} />
            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={v => `${v.toLocaleString('id-ID')}T`} width={60} />
            <Tooltip content={<DemandTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="demand" name="Demand (Ton)" stroke="#3B82F6" strokeWidth={2.5} fill="url(#gDemand)" />
            <Area type="monotone" dataKey="supply" name="Supply (Ton)" stroke="#10B981" strokeWidth={2.5} fill="url(#gSupply)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Regional Table */}
      <div className="section-title" style={{ marginBottom: 14 }}>🗺️ Analisis Demand per Wilayah</div>
      <div className="data-table-wrapper fade-in">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Wilayah</th>
                <th>Demand (Ton)</th>
                <th>Supply (Ton)</th>
                <th>Gap (%)</th>
                <th>Efisiensi</th>
                <th>Kategori</th>
                <th>Rekomendasi</th>
              </tr>
            </thead>
            <tbody>
              {REGIONAL_DATA.map((r) => {
                const gap = ((r.demand - r.supply) / r.demand * 100)
                const cfg = KATEGORI_CONFIG[r.kategori]
                return (
                  <tr key={r.wilayah} style={{ background: cfg.bg }}>
                    <td style={{ fontWeight: 600 }}>{r.wilayah}</td>
                    <td className="font-mono">{r.demand.toLocaleString('id-ID')} T</td>
                    <td className="font-mono">{r.supply.toLocaleString('id-ID')} T</td>
                    <td>
                      <span style={{ color: gap > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 700, fontSize: 12 }}>
                        {gap > 0 ? '-' : '+'}{Math.abs(gap).toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          height: 6, width: 60, background: 'var(--gray-200)', borderRadius: 3, overflow: 'hidden'
                        }}>
                          <div style={{ height: '100%', width: `${r.efisiensi}%`, background: cfg.color, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{r.efisiensi}%</span>
                      </div>
                    </td>
                    <td><span style={{ fontSize: 11, fontWeight: 600, color: cfg.color }}>{cfg.label}</span></td>
                    <td style={{ fontSize: 12 }}>{cfg.rec}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
