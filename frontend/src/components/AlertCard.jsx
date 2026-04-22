import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatRupiah, getKomoditasClass, getTrenClass, formatPct } from '../api'

export default function AlertCard({ alert }) {
  const { komoditas, provinsi, harga_sekarang, prediksi_30h, kenaikan_pct, tren_7h } = alert
  const komClass = getKomoditasClass(komoditas)
  const pctClass = kenaikan_pct > 10 ? 'danger' : kenaikan_pct >= 5 ? 'warning' : 'success'

  const TrendIcon = tren_7h === 'NAIK' ? TrendingUp : tren_7h === 'TURUN' ? TrendingDown : Minus
  const trendColor = tren_7h === 'NAIK' ? 'var(--danger)' : tren_7h === 'TURUN' ? 'var(--success)' : 'var(--gray-500)'

  return (
    <div className="alert-card fade-in">
      <div className="alert-card-header">
        <span className={`komoditas-badge ${komClass}`}>{komoditas}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: trendColor, fontWeight: 600 }}>
          <TrendIcon size={13} /> {tren_7h}
        </span>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{provinsi}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {formatRupiah(harga_sekarang)}
          </span>
          <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>→</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{formatRupiah(prediksi_30h)}</span>
          <span className={`pct-badge ${pctClass}`}>{formatPct(kenaikan_pct)}</span>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 11, color: 'var(--text-muted)',
        paddingTop: 8, borderTop: '1px solid var(--border)',
      }}>
        <AlertTriangle size={11} style={{ color: kenaikan_pct > 10 ? 'var(--danger)' : 'var(--warning)' }} />
        Kenaikan prediksi 30 hari ke depan
      </div>
    </div>
  )
}
