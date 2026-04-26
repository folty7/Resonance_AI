export function Sparkline({ data, color = '#f97316', filled = true, height = 60 }) {
    if (!data || data.length < 2) return null
    const width = 220
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const stepX = width / (data.length - 1)
    const points = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 8) - 4])
    const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
    const area = `${path} L ${width} ${height} L 0 ${height} Z`
    const last = points[points.length - 1]
    const id = `spark-${color.replace('#', '')}-${data.length}`
    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
                <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            {filled && <path d={area} fill={`url(#${id})`} />}
            <line x1="0" y1={height - 4} x2={width} y2={height - 4} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 4" />
            <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={last[0]} cy={last[1]} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
        </svg>
    )
}

export function GaugeChart({ percent = 75, label = '' }) {
    const segments = [
        { color: '#16a34a', from: 0, to: 0.2 },
        { color: '#059669', from: 0.2, to: 0.4 },
        { color: '#34d399', from: 0.4, to: 0.6 },
        { color: '#a78bfa', from: 0.6, to: 0.8 },
        { color: '#4ade80', from: 0.8, to: 1 },
    ]
    const cx = 150, cy = 140, r = 110
    const polar = (t) => {
        const angle = Math.PI - t * Math.PI
        return [cx + r * Math.cos(angle), cy - r * Math.sin(angle)]
    }
    const arc = (from, to) => {
        const [x1, y1] = polar(from)
        const [x2, y2] = polar(to)
        const large = to - from > 0.5 ? 1 : 0
        return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
    }
    const pct = Math.max(0.02, Math.min(0.98, percent / 100))
    const [mx, my] = polar(pct)
    return (
        <div className="relative w-full">
            <svg viewBox="0 0 300 180" className="w-full">
                {segments.map((s, i) => (
                    <path key={i} d={arc(s.from + 0.01, s.to - 0.01)} stroke={s.color} strokeWidth="22" strokeLinecap="round" fill="none" />
                ))}
                <circle cx={mx} cy={my} r="14" fill="white" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
                <rect x={mx - 6} y={my - 6} width="12" height="12" rx="2" fill="#16a34a" />
            </svg>
            {label && (
                <p className="absolute left-1/2 -translate-x-1/2 bottom-2 text-xs text-white/50 text-center w-full">
                    {label}
                </p>
            )}
        </div>
    )
}

/**
 * Single-series area+line chart with x labels and a y axis.
 * data: [{ label, value }]
 */
export function BarLineChart({ data, color = '#16a34a', height = 220 }) {
    if (!data || data.length === 0) {
        return <div className="h-[220px] flex items-center justify-center text-xs text-white/30">No data yet.</div>
    }
    const w = 700
    const padX = 40, padY = 18
    const innerW = w - padX * 2
    const innerH = height - padY * 2
    const max = Math.max(...data.map(d => d.value), 1)
    const stepX = data.length > 1 ? innerW / (data.length - 1) : 0
    const yLines = 4
    const points = data.map((d, i) => [
        padX + (data.length === 1 ? innerW / 2 : i * stepX),
        padY + innerH - (d.value / max) * innerH
    ])
    const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
    const area = `${path} L ${points[points.length - 1][0]} ${padY + innerH} L ${points[0][0]} ${padY + innerH} Z`
    const id = `barline-${color.replace('#', '')}`

    return (
        <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none">
            <defs>
                <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            {Array.from({ length: yLines + 1 }).map((_, i) => {
                const v = (max / yLines) * i
                const yy = padY + innerH - (v / max) * innerH
                return (
                    <g key={i}>
                        <line x1={padX} x2={w - padX} y1={yy} y2={yy} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 5" />
                        <text x={6} y={yy + 4} fontSize="10" fill="rgba(255,255,255,0.4)">{Math.round(v)}</text>
                    </g>
                )
            })}
            {data.map((d, i) => {
                const x = padX + (data.length === 1 ? innerW / 2 : i * stepX)
                return <text key={i} x={x} y={height - 2} fontSize="10" fill="rgba(255,255,255,0.4)" textAnchor="middle">{d.label}</text>
            })}
            <path d={area} fill={`url(#${id})`} />
            <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {points.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="3" fill={color} stroke="white" strokeWidth="1.5" />
            ))}
        </svg>
    )
}
