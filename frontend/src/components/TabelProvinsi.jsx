import { useState, useMemo } from 'react'
import { Search, Download, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { formatRupiah, formatPct, getTrenClass } from '../api'

export default function TabelProvinsi({ data }) {
  const [sortKey, setSortKey] = useState('provinsi')
  const [sortDir, setSortDir] = useState('asc')
  const [search, setSearch] = useState('')

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    if (!data || data.length === 0) return []
    return [...data]
      .filter(r => r.provinsi.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        let va = a[sortKey], vb = b[sortKey]
        if (typeof va === 'string') va = va.toLowerCase()
        if (typeof vb === 'string') vb = vb.toLowerCase()
        if (va < vb) return sortDir === 'asc' ? -1 : 1
        if (va > vb) return sortDir === 'asc' ? 1 : -1
        return 0
      })
  }, [data, sortKey, sortDir, search])

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronsUpDown size={12} style={{ opacity: 0.4 }} />
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  const getRowClass = (pct) => {
    if (pct > 15) return 'row-naik'
    if (pct > 5) return 'row-warn'
    return ''
  }

  const handleExport = () => {
    const headers = ['Provinsi', 'Harga Sekarang', 'Prediksi 7H', 'Ubah 7H%', 'Prediksi 30H', 'Ubah 30H%', 'Tren']
    const rows = sorted.map(r => [
      r.provinsi,
      r.harga_sekarang,
      r.prediksi_7h,
      r.ubah_7_pct,
      r.prediksi_30h,
      r.ubah_30_pct,
      r.tren_30h,
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'prediksi_provinsi.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (!data || data.length === 0) return <div className="skeleton skeleton-table" />

  return (
    <div className="data-table-wrapper fade-in">
      <div className="table-toolbar">
        <div className="table-toolbar-left">
          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Cari provinsi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Cari provinsi"
            />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {sorted.length} provinsi
          </span>
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
                ['provinsi', 'Provinsi'],
                ['harga_sekarang', 'Harga Skrg (Rp)'],
                ['prediksi_7h', 'Pred 7H (Rp)'],
                ['ubah_7_pct', 'Ubah 7H'],
                ['prediksi_30h', 'Pred 30H (Rp)'],
                ['ubah_30_pct', 'Ubah 30H'],
                ['tren_30h', 'Tren'],
              ].map(([key, label]) => (
                <th key={key} onClick={() => handleSort(key)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {label} <SortIcon col={key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <tr key={row.provinsi} className={getRowClass(row.ubah_7_pct)}>
                <td style={{ fontWeight: 600 }}>{row.provinsi}</td>
                <td className="font-mono">{formatRupiah(row.harga_sekarang)}</td>
                <td className="font-mono">{formatRupiah(row.prediksi_7h)}</td>
                <td>
                  <span className={row.ubah_7_pct > 0 ? 'text-naik' : row.ubah_7_pct < 0 ? 'text-turun' : 'text-stabil'}
                    style={{ fontWeight: 700, fontSize: 12 }}>
                    {row.ubah_7_pct > 0 ? '↑' : row.ubah_7_pct < 0 ? '↓' : '→'} {formatPct(row.ubah_7_pct)}
                  </span>
                </td>
                <td className="font-mono">{formatRupiah(row.prediksi_30h)}</td>
                <td>
                  <span className={row.ubah_30_pct > 0 ? 'text-naik' : row.ubah_30_pct < 0 ? 'text-turun' : 'text-stabil'}
                    style={{ fontWeight: 700, fontSize: 12 }}>
                    {row.ubah_30_pct > 0 ? '↑' : row.ubah_30_pct < 0 ? '↓' : '→'} {formatPct(row.ubah_30_pct)}
                  </span>
                </td>
                <td>
                  <span className={`tren-badge ${getTrenClass(row.tren_30h)}`}>{row.tren_30h}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
