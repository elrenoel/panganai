import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function KpiCard({ label, value, icon: Icon, color, trend, trendText, subtitle }) {
  const isUp = trend === 'up'
  const isDown = trend === 'down'

  return (
    <div className="kpi-card fade-in">
      <div className="kpi-header">
        <div className="kpi-label">{label}</div>
        {Icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${color}18`, color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="kpi-value font-mono">{value}</div>
      {subtitle && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{subtitle}</div>
      )}
      {trendText && (
        <div className={`kpi-trend ${isUp ? 'text-naik' : isDown ? 'text-turun' : 'text-stabil'}`}>
          {isUp && <TrendingUp size={12} />}
          {isDown && <TrendingDown size={12} />}
          {!isUp && !isDown && <Minus size={12} />}
          {trendText}
        </div>
      )}
    </div>
  )
}
