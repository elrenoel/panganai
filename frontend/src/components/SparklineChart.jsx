import { LineChart, Line, ResponsiveContainer } from 'recharts'

export default function SparklineChart({ data = [], color = '#10B981' }) {
  if (!data || data.length < 2) {
    return (
      <div style={{ width: 80, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>—</span>
      </div>
    )
  }

  return (
    <div style={{ width: 80, height: 32 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.8}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
