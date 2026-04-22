import { useState } from 'react'
import {
  FileSpreadsheet, FileText, Map, FileBarChart,
  CheckCircle, Clock, AlertTriangle, Download, Server,
  Database, Cpu, Globe, Bot, ChevronDown, ChevronUp,
} from 'lucide-react'

const EXPORT_CARDS = [
  {
    icon: FileSpreadsheet,
    title: 'Harga Harian',
    format: '.xlsx',
    size: '~2.4 MB',
    lastGen: '14 Apr 2026, 00:30',
    includes: 'Semua provinsi, 7 hari tren harga',
    color: '#10B981',
    auto: true,
    versions: ['13 Apr 2026', '12 Apr 2026', '11 Apr 2026 (arsip)'],
  },
  {
    icon: FileText,
    title: 'Prediksi Harga',
    format: '.csv',
    size: '~0.8 MB',
    lastGen: '14 Apr 2026, 00:30',
    includes: 'Harga aktual + prediksi, confidence score',
    color: '#3B82F6',
    auto: true,
    versions: ['13 Apr 2026', '12 Apr 2026', '11 Apr 2026 (arsip)'],
  },
  {
    icon: Map,
    title: 'Data Geospasial',
    format: '.geojson',
    size: '~1.8 MB',
    lastGen: '14 Apr 2026, 00:30',
    includes: 'Batas provinsi, harga, demand-supply',
    color: '#F97316',
    auto: true,
    versions: ['13 Apr 2026', '12 Apr 2026', '11 Apr 2026 (arsip)'],
  },
  {
    icon: FileBarChart,
    title: 'Laporan Bulanan',
    format: '.pdf',
    size: '~5.2 MB',
    lastGen: '01 Apr 2026, 00:00',
    includes: 'Ringkasan + chart + rekomendasi kebijakan',
    color: '#8B5CF6',
    auto: false,
    period: 'April 2026',
    versions: ['Mar 2026', 'Feb 2026', 'Jan 2026'],
  },
]

const HEALTH_DATA = [
  {
    icon: Cpu, name: 'ETL Data Ingestion', status: 'online',
    metrics: ['99.8% uptime', '450 records/min', 'Latency: 3.2 sec'],
    lastCheck: '10:31 WIB',
  },
  {
    icon: Bot, name: 'AI Model (LSTM + Prophet)', status: 'online',
    metrics: ['Last train: 13 Apr 18:00', 'Model v2.3.1 (24M records)', 'Akurasi: 85.3% (7D) | 72.1% (30D)'],
    lastCheck: '10:31 WIB',
  },
  {
    icon: Globe, name: 'REST API Endpoint', status: 'online',
    metrics: ['99.9% uptime', 'Response: 145ms', '234 req/sec (maks 500)'],
    lastCheck: '10:31 WIB',
  },
  {
    icon: Database, name: 'Database (Lokal CSV)', status: 'online',
    metrics: ['Storage: Normal', 'Query avg 89ms', 'Backup: 14 Apr 04:00'],
    lastCheck: '10:31 WIB',
  },
  {
    icon: Bot, name: 'OpenAI API Integration', status: 'online',
    metrics: ['Response: 2.1 sec', 'Rate limit: 350/min (85% utilized)', 'Cost: $45.20 YTD'],
    lastCheck: '10:31 WIB',
  },
]

const SCHEDULES = [
  { label: 'Laporan Harian', time: 'Setiap hari pukul 00:30 WIB', status: 'AKTIF', next: '15 Apr 00:30' },
  { label: 'Laporan Mingguan', time: 'Setiap Senin pukul 08:00 WIB', status: 'AKTIF', next: '20 Apr 08:00' },
  { label: 'Laporan Bulanan', time: 'Tgl 1 tiap bulan pukul 00:00 WIB', status: 'AKTIF', next: '01 Mei 00:00' },
]

export default function LaporanEkspor() {
  const [loadingCard, setLoadingCard] = useState(null)
  const [expandedCard, setExpandedCard] = useState(null)

  const handleDownload = (idx, title) => {
    setLoadingCard(idx)
    setTimeout(() => {
      setLoadingCard(null)
      alert(`✅ ${title} berhasil diunduh (simulasi)`)
    }, 1800)
  }

  return (
    <div>
      <div className="page-header">
        <h2>Laporan & Ekspor</h2>
        <p>Unduh data, laporan otomatis, dan pantau kesehatan sistem pipeline AI</p>
      </div>

      {/* Export Cards */}
      <div className="section-title" style={{ marginBottom: 14 }}>📥 Unduh Data & Laporan</div>
      <div className="export-grid" style={{ marginBottom: 28 }}>
        {EXPORT_CARDS.map((card, idx) => (
          <div key={idx} className="export-card fade-in">
            <div className="export-card-icon" style={{ background: `${card.color}15`, color: card.color }}>
              <card.icon size={22} />
            </div>
            <div className="export-card-title">{card.title}</div>
            <div className="export-card-meta">
              <div>Format: <b>{card.format}</b> &nbsp;·&nbsp; {card.size}</div>
              <div style={{ marginTop: 4 }}>Dibuat: {card.lastGen}</div>
              {card.period && <div>Periode: <b>{card.period}</b></div>}
              <div style={{ marginTop: 4, fontSize: 11 }}>{card.includes}</div>
              <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                {card.auto
                  ? <><CheckCircle size={11} color="#16A34A" /> <span style={{ color: '#16A34A', fontSize: 10, fontWeight: 600 }}>Auto-generated harian</span></>
                  : <><Clock size={11} color="#B45309" /> <span style={{ color: '#B45309', fontSize: 10, fontWeight: 600 }}>1x per bulan</span></>
                }
              </div>
            </div>

            <button
              className="export-btn"
              onClick={() => handleDownload(idx, card.title)}
              disabled={loadingCard === idx}
              style={{ background: loadingCard === idx ? 'var(--gray-400)' : card.color }}
            >
              {loadingCard === idx ? (
                <><span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Mengunduh...</>
              ) : (
                <><Download size={14} /> Unduh {card.format}</>
              )}
            </button>

            {/* Versions */}
            <button
              onClick={() => setExpandedCard(expandedCard === idx ? null : idx)}
              style={{
                marginTop: 8, width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4,
                justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {expandedCard === idx ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              Versi sebelumnya
            </button>
            {expandedCard === idx && (
              <div style={{ marginTop: 6, background: 'var(--gray-50)', borderRadius: 6, padding: '8px 10px' }}>
                {card.versions.map((v, i) => (
                  <div key={i} style={{
                    fontSize: 11, color: 'var(--text-secondary)', padding: '3px 0',
                    borderBottom: i < card.versions.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span>• {v}</span>
                    <button style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)',
                      fontSize: 10, fontWeight: 600, fontFamily: 'Inter, system-ui, sans-serif',
                    }}>
                      Unduh
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Scheduled Reports */}
      <div className="section-title" style={{ marginBottom: 14 }}>🔄 Jadwal Laporan Otomatis</div>
      <div className="health-panel" style={{ marginBottom: 24 }}>
        {SCHEDULES.map((s, i) => (
          <div key={i} className="health-item">
            <div className="health-item-header">
              <div className="health-status-dot online" />
              <div className="health-item-title">{s.label}</div>
              <span className="badge badge-success" style={{ marginLeft: 8 }}>{s.status}</span>
            </div>
            <div className="health-item-meta">
              {s.time} &nbsp;·&nbsp; <strong>Next Run:</strong> {s.next} &nbsp;·&nbsp; Last: SUKSES
            </div>
          </div>
        ))}
      </div>

      {/* System Health */}
      <div className="section-title" style={{ marginBottom: 14 }}>📡 Status Sistem & Pipeline Data</div>
      <div className="health-panel" style={{ marginBottom: 24 }}>
        {HEALTH_DATA.map((h, i) => (
          <div key={i} className="health-item">
            <div className="health-item-header">
              <div className="health-status-dot online" />
              <h.icon size={14} color="var(--text-secondary)" />
              <div className="health-item-title">{h.name}</div>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>
                Last check: {h.lastCheck}
              </span>
            </div>
            <div className="health-item-meta">
              {h.metrics.map((m, j) => (
                <span key={j}>{m}{j < h.metrics.length - 1 ? ' · ' : ''}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div style={{
        background: '#FFFBEB', border: '1px solid #FCD34D', borderLeft: '4px solid #F97316',
        borderRadius: 10, padding: '14px 16px', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontWeight: 700, fontSize: 13 }}>
          <AlertTriangle size={16} color="#D97706" /> Alerts & Notifikasi
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.7, color: '#92400E' }}>
          <div>⚠️ <strong>Warning:</strong> Storage database mendekati 50% — auto-purge akan dijalankan 20 Apr 02:00 untuk data &gt;180 hari.</div>
          <div style={{ marginTop: 4 }}>📌 <strong>Info:</strong> Maintenance window terjadwal 18 Apr 22:00–23:00 (1 jam downtime expected).</div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
