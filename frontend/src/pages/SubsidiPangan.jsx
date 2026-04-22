import { useState } from 'react'
import { Target, DollarSign, Package, TrendingDown, ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'

const SUBSIDI_DATA = [
  {
    rank: 1,
    provinsi: 'Jawa Timur', komoditas: 'Cabai Merah Keriting',
    sdi: 0.75, gap: -25, kebutuhan: 45.2e9, keluarga: 180000,
    durasi: 6, urgensi: 'HIGH', dampak_harga: -18, absorb: 15,
  },
  {
    rank: 2,
    provinsi: 'DKI Jakarta', komoditas: 'Beras Medium I',
    sdi: 0.68, gap: -32, kebutuhan: 32.8e9, keluarga: 95000,
    durasi: 4, urgensi: 'MEDIUM', dampak_harga: -12, absorb: 11,
  },
  {
    rank: 3,
    provinsi: 'Bengkulu', komoditas: 'Beras Medium I',
    sdi: 0.82, gap: -18, kebutuhan: 28.5e9, keluarga: 120000,
    durasi: 5, urgensi: 'MEDIUM_LOW', dampak_harga: -9, absorb: 9.2,
  },
  {
    rank: 4,
    provinsi: 'DI Yogyakarta', komoditas: 'Minyak Goreng Curah',
    sdi: 0.79, gap: -28, kebutuhan: 22.1e9, keluarga: 85000,
    durasi: 5, urgensi: 'HIGH', dampak_harga: -15, absorb: 8,
  },
  {
    rank: 5,
    provinsi: 'Sumatera Utara', komoditas: 'Cabai Merah Keriting',
    sdi: 0.85, gap: -15, kebutuhan: 18.7e9, keluarga: 72000,
    durasi: 3, urgensi: 'MEDIUM_LOW', dampak_harga: -8, absorb: 6.5,
  },
  {
    rank: 6,
    provinsi: 'Kalimantan Timur', komoditas: 'Beras Medium I',
    sdi: 0.91, gap: -8, kebutuhan: 12.4e9, keluarga: 45000,
    durasi: 3, urgensi: 'LOW', dampak_harga: -5, absorb: 4.2,
  },
]

const URGENSI_CONFIG = {
  HIGH: { badge: '🔴 HIGH', color: '#DC2626', bgColor: 'rgba(239,68,68,0.06)' },
  MEDIUM: { badge: '🟠 MEDIUM', color: '#EA580C', bgColor: 'rgba(249,115,22,0.06)' },
  MEDIUM_LOW: { badge: '🟡 MEDIUM', color: '#B45309', bgColor: 'rgba(234,179,8,0.06)' },
  LOW: { badge: '🟢 LOW', color: '#16A34A', bgColor: 'rgba(34,197,94,0.06)' },
}

const totalBudget = SUBSIDI_DATA.reduce((s, d) => s + d.kebutuhan, 0)
const criticalCount = SUBSIDI_DATA.filter(d => d.urgensi === 'HIGH').length

export default function SubsidiPangan() {
  const [sortKey, setSortKey] = useState('rank')
  const [sortDir, setSortDir] = useState('asc')

  const sorted = [...SUBSIDI_DATA].sort((a, b) => {
    const va = a[sortKey], vb = b[sortKey]
    if (va < vb) return sortDir === 'asc' ? -1 : 1
    if (va > vb) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronsUpDown size={11} style={{ opacity: 0.4 }} />
    return sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
  }

  return (
    <div>
      <div className="page-header">
        <h2>Subsidi Pangan</h2>
        <p>Rekomendasi prioritas dan estimasi kebutuhan subsidi pangan berdasarkan analisis AI</p>
      </div>

      {/* Summary Cards */}
      <div className="metrics-grid" style={{ marginBottom: 24 }}>
        <div className="metric-card fade-in">
          <div className="metric-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
            <Target size={20} />
          </div>
          <div className="metric-label">Provinsi Prioritas</div>
          <div className="metric-value">{criticalCount} Kritis</div>
          <div className="metric-footer">{SUBSIDI_DATA.length} total provinsi teridentifikasi</div>
        </div>
        <div className="metric-card fade-in">
          <div className="metric-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
            <DollarSign size={20} />
          </div>
          <div className="metric-label">Anggaran Total</div>
          <div className="metric-value">Rp {(totalBudget / 1e9).toFixed(0)} M</div>
          <div className="metric-footer">Alokasi: 60% tetap, 40% fleksibel</div>
        </div>
        <div className="metric-card fade-in">
          <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
            <Package size={20} />
          </div>
          <div className="metric-label">Komoditas Target</div>
          <div className="metric-value">3 Jenis</div>
          <div className="metric-footer">Beras, Cabai Merah, Minyak Goreng</div>
        </div>
        <div className="metric-card fade-in">
          <div className="metric-icon" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316' }}>
            <TrendingDown size={20} />
          </div>
          <div className="metric-label">Prediksi Efektivitas</div>
          <div className="metric-value">74%</div>
          <div className="metric-footer">Estimasi penurunan harga 10-18%</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 8,
        padding: '12px 16px', marginBottom: 18, fontSize: 12, color: 'var(--text-secondary)',
        display: 'flex', gap: 20, flexWrap: 'wrap',
      }}>
        <strong>Legend:</strong>
        <span>SDI &lt;0.8 = Kritis &nbsp;|&nbsp; 0.8-0.9 = Sedang &nbsp;|&nbsp; &gt;0.9 = Stabil</span>
        <span>🔴 HIGH (Gap &gt;25%) &nbsp; 🟠 MEDIUM (15-25%) &nbsp; 🟡 MEDIUM-LOW (10-15%) &nbsp; 🟢 LOW (&lt;10%)</span>
      </div>

      {/* Subsidy Table */}
      <div className="data-table-wrapper fade-in">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              📋 Tabel Prioritas Subsidi Pangan per Provinsi
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Data: Mock AI Recommendation | April 2026
          </div>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {[
                  ['rank', 'Rank'],
                  ['provinsi', 'Provinsi'],
                  ['komoditas', 'Komoditas Utama'],
                  ['sdi', 'SDI Index'],
                  ['kebutuhan', 'Est. Kebutuhan (Rp)'],
                  ['urgensi', 'Urgensi'],
                  ['dampak_harga', 'Prediksi Dampak'],
                ].map(([key, label]) => (
                  <th key={label} onClick={() => handleSort(key)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {label} <SortIcon col={key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => {
                const cfg = URGENSI_CONFIG[row.urgensi]
                const sdiColor = row.sdi < 0.8 ? '#DC2626' : row.sdi < 0.9 ? '#D97706' : '#16A34A'
                return (
                  <tr key={row.provinsi} style={{ background: cfg.bgColor }}>
                    <td>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, background: 'var(--primary-light)',
                        color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: 12,
                      }}>
                        {row.rank}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{row.provinsi}</td>
                    <td>
                      <span style={{ fontSize: 12 }}>{row.komoditas}</span>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Gap: {row.gap}%</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: sdiColor, fontSize: 14 }}>{row.sdi.toFixed(2)}</span>
                    </td>
                    <td>
                      <div className="font-mono" style={{ fontWeight: 700 }}>Rp {(row.kebutuhan/1e9).toFixed(1)} Miliar</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {row.keluarga.toLocaleString('id-ID')} keluarga, {row.durasi} bln
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.badge}</span>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{row.durasi} bulan</div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: 13 }}>Harga ↓ {Math.abs(row.dampak_harga)}%</span>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Absorb: {row.absorb}% anggaran</div>
                    </td>
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
