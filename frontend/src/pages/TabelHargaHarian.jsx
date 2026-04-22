import { useState, useMemo } from 'react'
import { Search, Download, ChevronUp, ChevronDown, ChevronsUpDown, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import SparklineChart from '../components/SparklineChart'

// Real API augmented with mock enrichment data
const RAW_DATA = [
  {
    komoditas: 'Beras Medium I', kategori: 'Beras Premium', satuan: '/kg',
    harga: 14200, kemarin: 14150, sparkColors: '#3B82F6',
    spark: [13800, 13900, 14000, 14050, 14100, 14150, 14200].map(v => ({ v })),
    hap: 13500, hap_daerah: 'Jawa Barat',
  },
  {
    komoditas: 'Minyak Goreng Curah', kategori: 'Curah Grade A', satuan: '/liter',
    harga: 15800, kemarin: 16200, sparkColors: '#F97316',
    spark: [16500, 16400, 16200, 16000, 15900, 16200, 15800].map(v => ({ v })),
    hap: 15500, hap_daerah: 'DKI Jakarta',
  },
  {
    komoditas: 'Cabai Merah Keriting', kategori: 'Grade A Super', satuan: '/kg',
    harga: 45000, kemarin: 43800, sparkColors: '#EF4444',
    spark: [41000, 42000, 43000, 43200, 43800, 44500, 45000].map(v => ({ v })),
    hap: 42000, hap_daerah: 'Jawa Timur',
  },
  {
    komoditas: 'Telur Ayam Ras', kategori: 'Berkualitas Baik', satuan: '/kg',
    harga: 28500, kemarin: 29000, sparkColors: '#EAB308',
    spark: [29500, 29200, 29000, 28800, 28600, 29000, 28500].map(v => ({ v })),
    hap: 27000, hap_daerah: 'Jawa Tengah',
  },
  {
    komoditas: 'Bawang Merah', kategori: 'Lokal Premium', satuan: '/kg',
    harga: 32000, kemarin: 31500, sparkColors: '#8B5CF6',
    spark: [30000, 30500, 31000, 31200, 31500, 31800, 32000].map(v => ({ v })),
    hap: 30000, hap_daerah: 'Jawa Timur',
  },
  {
    komoditas: 'Gula Pasir', kategori: 'Premium Lokal', satuan: '/kg',
    harga: 17500, kemarin: 17500, sparkColors: '#6B7280',
    spark: [17200, 17300, 17350, 17400, 17450, 17500, 17500].map(v => ({ v })),
    hap: 17000, hap_daerah: 'Nasional',
  },
  {
    komoditas: 'Tepung Terigu', kategori: 'Protein Sedang', satuan: '/kg',
    harga: 12000, kemarin: 12200, sparkColors: '#10B981',
    spark: [12500, 12400, 12300, 12200, 12100, 12200, 12000].map(v => ({ v })),
    hap: 11500, hap_daerah: 'Nasional',
  },
  {
    komoditas: 'Daging Ayam Ras', kategori: 'Segar Karkas', satuan: '/kg',
    harga: 38000, kemarin: 37500, sparkColors: '#EC4899',
    spark: [36000, 36500, 37000, 37200, 37500, 37800, 38000].map(v => ({ v })),
    hap: 36000, hap_daerah: 'Jawa Timur',
  },
]

export default function TabelHargaHarian() {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('komoditas')
  const [sortDir, setSortDir] = useState('asc')
  const [expandedRow, setExpandedRow] = useState(null)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronsUpDown size={11} style={{ opacity: 0.4 }} />
    return sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
  }

  const data = useMemo(() => {
    return RAW_DATA
      .map(r => ({
        ...r,
        pct: r.kemarin ? ((r.harga - r.kemarin) / r.kemarin * 100) : 0,
      }))
      .filter(r =>
        r.komoditas.toLowerCase().includes(search.toLowerCase()) ||
        r.kategori.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const va = a[sortKey], vb = b[sortKey]
        if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
        if (va < vb) return sortDir === 'asc' ? -1 : 1
        if (va > vb) return sortDir === 'asc' ? 1 : -1
        return 0
      })
  }, [search, sortKey, sortDir])

  const getRowClass = (pct) => {
    if (pct > 2) return 'row-naik'
    if (pct < -1) return 'row-ok'
    return 'row-warn'
  }

  const handleExport = () => {
    const headers = ['Komoditas', 'Kategori', 'Satuan', 'Harga', 'Kemarin', '% Perubahan', 'HAP', 'Daerah HAP']
    const rows = data.map(r => [r.komoditas, r.kategori, r.satuan, r.harga, r.kemarin, r.pct.toFixed(2), r.hap, r.hap_daerah])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'harga_harian.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="page-header">
        <h2>Tabel Harga Harian</h2>
        <p>Data harga komoditas pangan terkini dengan perbandingan hari sebelumnya dan Harga Acuan Pemerintah (HAP)</p>
      </div>

      {/* Summary row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Naik', count: data.filter(d => d.pct > 2).length, color: 'var(--danger)', icon: TrendingUp },
          { label: 'Stabil', count: data.filter(d => d.pct >= -1 && d.pct <= 2).length, color: 'var(--warning)', icon: Minus },
          { label: 'Turun', count: data.filter(d => d.pct < -1).length, color: 'var(--success)', icon: TrendingDown },
        ].map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 14px',
          }}>
            <s.icon size={14} color={s.color} />
            <span style={{ fontWeight: 600, fontSize: 16, color: s.color }}>{s.count}</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Komoditas {s.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="data-table-wrapper fade-in">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <div className="search-wrapper">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Cari komoditas atau kategori..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{data.length} komoditas</span>
          </div>
          <div className="table-toolbar-right">
            <button
              onClick={handleExport}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', border: '1px solid var(--border)',
                borderRadius: 7, background: 'var(--bg-card)', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {[
                  ['komoditas', 'Komoditas'],
                  ['kategori', 'Kategori'],
                  ['satuan', 'Satuan'],
                  ['harga', 'Harga Hari Ini (Rp)'],
                  ['kemarin', 'Kemarin (Rp)'],
                  ['pct', '% Perubahan'],
                  [null, 'Tren 7H'],
                  ['hap', 'HAP (Rp)'],
                ].map(([key, label]) => (
                  <th key={label} onClick={() => key && handleSort(key)} style={{ cursor: key ? 'pointer' : 'default' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {label} {key && <SortIcon col={key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => {
                const isExpanded = expandedRow === i
                return (
                  <>
                    <tr
                      key={r.komoditas}
                      className={getRowClass(r.pct)}
                      onClick={() => setExpandedRow(isExpanded ? null : i)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{r.komoditas}</div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.kategori}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.satuan}</td>
                      <td className="font-mono" style={{ fontWeight: 700, fontSize: 14 }}>
                        {r.harga.toLocaleString('id-ID')}
                      </td>
                      <td className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {r.kemarin.toLocaleString('id-ID')}
                      </td>
                      <td>
                        <span style={{
                          fontWeight: 700, fontSize: 12,
                          color: r.pct > 2 ? 'var(--danger)' : r.pct < -1 ? 'var(--success)' : 'var(--warning)',
                          display: 'flex', alignItems: 'center', gap: 3,
                        }}>
                          {r.pct > 0.1 ? <TrendingUp size={12}/> : r.pct < -0.1 ? <TrendingDown size={12}/> : <Minus size={12}/>}
                          {r.pct > 0 ? '+' : ''}{r.pct.toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <SparklineChart data={r.spark} color={r.sparkColors} />
                      </td>
                      <td>
                        <div className="font-mono" style={{ fontSize: 12, fontWeight: 600 }}>
                          {r.hap.toLocaleString('id-ID')}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.hap_daerah}</div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`detail-${i}`}>
                        <td colSpan={8} style={{ background: 'rgba(59,130,246,0.03)', padding: '12px 16px' }}>
                          <div style={{ fontSize: 12, lineHeight: 1.7 }}>
                            <strong>{r.komoditas}</strong> | Kategori: {r.kategori} &nbsp;·&nbsp;
                            HAP: Rp {r.hap.toLocaleString('id-ID')}/kg ({r.hap_daerah}) &nbsp;·&nbsp;
                            Variansi vs HAP: <span style={{ color: r.harga > r.hap ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                              {r.harga > r.hap ? '+' : ''}{((r.harga - r.hap) / r.hap * 100).toFixed(1)}%
                            </span>
                            &nbsp;dari harga acuan pemerintah.
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
