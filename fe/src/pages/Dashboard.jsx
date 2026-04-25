import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
    LayoutGrid, Disc3, BarChart3, Sparkles, Sliders, Bot, Terminal,
    Radar, Store, UserPlus, HelpCircle, Search, Bell, Sun, Moon,
    ChevronDown, EyeOff, RefreshCw, ArrowUpRight, ArrowDownRight,
    ChevronRight, Plus, Trash2, Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore, usePlaylistsStore } from "@/store/useStore"
import { apiClient } from "@/api/axios"

const DEFAULT_PARAMS = ['genre', 'year']
const PARAM_LABELS = {
    genre: 'Genre',
    year: 'Year / Decade',
    mood: 'Mood',
    artist: 'Artist',
    popularity: 'Popularity',
    language: 'Language',
    tempo: 'Tempo'
}

const NAV_MAIN = [
    { icon: LayoutGrid, label: 'Dashboard', active: true },
    { icon: Disc3, label: 'Library' },
    { icon: BarChart3, label: 'Analytics' },
]
const NAV_AI = [
    { icon: Sparkles, label: 'AI Sort' },
    { icon: Sliders, label: 'Control Panel', chevron: true },
    { icon: Bot, label: 'Gemini Bots', chevron: true },
    { icon: Terminal, label: 'Terminal' },
    { icon: Radar, label: 'Discover' },
    { icon: Store, label: 'Marketplace' },
]
const NAV_PREFS = [
    { icon: UserPlus, label: 'Refer a Friend' },
]

// ---------- tiny SVG charts ----------
function Sparkline({ data, color = '#f97316', filled = true, width = 220, height = 60 }) {
    if (!data || data.length < 2) return null
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const stepX = width / (data.length - 1)
    const points = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 8) - 4])
    const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
    const area = `${path} L ${width} ${height} L 0 ${height} Z`
    const last = points[points.length - 1]
    const id = `spark-${color.replace('#', '')}`
    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
                <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
                <line x1="0" y1={height - 6} x2={width} y2={height - 6} />
            </defs>
            {filled && <path d={area} fill={`url(#${id})`} />}
            <line x1="0" y1={height - 4} x2={width} y2={height - 4} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 4" />
            <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={last[0]} cy={last[1]} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
        </svg>
    )
}

function GaugeChart({ percent = 75, label = '7.52% More than last week' }) {
    // 180-degree arc divided into 5 colored segments with a marker
    const segments = [
        { color: '#ea580c', from: 0, to: 0.2 },
        { color: '#f59e0b', from: 0.2, to: 0.4 },
        { color: '#fbbf24', from: 0.4, to: 0.6 },
        { color: '#a78bfa', from: 0.6, to: 0.8 },
        { color: '#22c55e', from: 0.8, to: 1 },
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
                    <path
                        key={i}
                        d={arc(s.from + 0.01, s.to - 0.01)}
                        stroke={s.color}
                        strokeWidth="22"
                        strokeLinecap="round"
                        fill="none"
                    />
                ))}
                {/* marker */}
                <circle cx={mx} cy={my} r="14" fill="white" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
                <rect x={mx - 6} y={my - 6} width="12" height="12" rx="2" fill="#ea580c" />
            </svg>
            <p className="absolute left-1/2 -translate-x-1/2 bottom-2 text-xs text-white/50 text-center w-full">
                {label}
            </p>
        </div>
    )
}

function MultiLineChart({ height = 220 }) {
    // synthetic listening-activity series — replace with real data when available
    const series = [
        { color: '#ea580c', data: [22, 28, 18, 26, 32, 38, 30, 36, 24, 30] },
        { color: '#f59e0b', data: [12, 16, 22, 18, 24, 22, 16, 14, 18, 12] },
        { color: '#a78bfa', data: [6, 10, 14, 10, 8, 6, 12, 14, 10, 6] },
        { color: '#22c55e', data: [3, 4, 6, 5, 4, 3, 5, 4, 6, 4] },
    ]
    const labels = ['22.25', '02.52', '10.22', '16.01', '14.02', '11.91', '09.65', '17.88', '03.21']
    const w = 700
    const padX = 30, padY = 18
    const innerW = w - padX * 2
    const innerH = height - padY * 2
    const max = 40
    const stepX = innerW / (series[0].data.length - 1)
    const yLines = [0, 10, 20, 30, 40]
    const toPath = (data) =>
        data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(padX + i * stepX).toFixed(1)} ${(padY + innerH - (v / max) * innerH).toFixed(1)}`).join(' ')
    return (
        <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none">
            {yLines.map(y => {
                const yy = padY + innerH - (y / max) * innerH
                return (
                    <g key={y}>
                        <line x1={padX} x2={w - padX} y1={yy} y2={yy} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 5" />
                        <text x={6} y={yy + 4} fontSize="10" fill="rgba(255,255,255,0.4)">{y}</text>
                    </g>
                )
            })}
            {labels.map((l, i) => (
                <text key={i} x={padX + i * stepX} y={height - 2} fontSize="10" fill="rgba(255,255,255,0.4)" textAnchor="middle">{l}</text>
            ))}
            {series.map((s, i) => (
                <path key={i} d={toPath(s.data)} stroke={s.color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ))}
        </svg>
    )
}

function LyraMark({ size = 32 }) {
    return (
        <div className="relative" style={{ width: size, height: size }}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 shadow-[0_0_20px_rgba(249,115,22,0.5)]" />
            <div className="absolute inset-[6px] rounded-full bg-black/40 backdrop-blur" />
            <div className="absolute inset-[10px] rounded-full bg-gradient-to-br from-orange-400 to-orange-600" />
        </div>
    )
}

// ---------- main page ----------
export default function Dashboard() {
    const navigate = useNavigate()
    const { clearAuth } = useStore()
    const { savedPlaylists, addManyPlaylists, removePlaylist, renamePlaylist } = usePlaylistsStore()

    const [tracks, setTracks] = useState([])
    const [isLoadingTracks, setIsLoadingTracks] = useState(true)
    const [availableParams, setAvailableParams] = useState([])
    const [selectedParams, setSelectedParams] = useState(new Set(DEFAULT_PARAMS))
    const [extraInstructions, setExtraInstructions] = useState("")
    const [suggestedGroups, setSuggestedGroups] = useState([])
    const [isSorting, setIsSorting] = useState(false)
    const [sortError, setSortError] = useState("")
    const [pushingIds, setPushingIds] = useState(new Set())
    const [toastMessage, setToastMessage] = useState("")
    const [chartTab, setChartTab] = useState('Decades')

    useEffect(() => {
        apiClient.get('/tracks')
            .then(res => { if (res.data.success) setTracks(res.data.data) })
            .catch(() => navigate('/'))
            .finally(() => setIsLoadingTracks(false))

        apiClient.get('/sort/parameters')
            .then(res => { if (res.data.success) setAvailableParams(res.data.parameters) })
            .catch(() => {})
    }, [navigate])

    const handleLogout = async () => {
        try {
            await apiClient.post('/auth/logout')
            clearAuth()
            navigate('/')
        } catch (error) { console.error('Logout failed:', error) }
    }

    const toggleParam = (p) => setSelectedParams(prev => {
        const next = new Set(prev)
        next.has(p) ? next.delete(p) : next.add(p)
        return next
    })

    const handleSort = async () => {
        if (selectedParams.size === 0) return setSortError("Pick at least one parameter.")
        if (tracks.length === 0) return
        setIsSorting(true); setSortError(""); setSuggestedGroups([])
        try {
            const res = await apiClient.post('/sort', {
                tracks,
                parameters: Array.from(selectedParams),
                extra: extraInstructions.trim() || undefined
            })
            if (res.data.success) setSuggestedGroups(res.data.groups || [])
        } catch (error) {
            setSortError(error.response?.data?.error || "Gemini sorting failed.")
        } finally { setIsSorting(false) }
    }

    const keepGroup = (idx) => {
        const g = suggestedGroups[idx]
        addManyPlaylists([{ name: g.name, description: g.description, uris: g.uris }])
        setSuggestedGroups(prev => prev.filter((_, i) => i !== idx))
        flashToast(`"${g.name}" saved`)
    }
    const keepAllGroups = () => {
        if (!suggestedGroups.length) return
        addManyPlaylists(suggestedGroups.map(g => ({ name: g.name, description: g.description, uris: g.uris })))
        flashToast(`${suggestedGroups.length} playlist(s) saved`)
        setSuggestedGroups([])
    }
    const discardGroup = (idx) => setSuggestedGroups(prev => prev.filter((_, i) => i !== idx))
    const pushToSpotify = async (playlist) => {
        setPushingIds(prev => new Set(prev).add(playlist.id))
        try {
            const res = await apiClient.post('/playlists', { playlistName: playlist.name, uris: playlist.uris })
            if (res.data.success) { flashToast(`"${playlist.name}" added to Spotify!`); removePlaylist(playlist.id) }
        } catch (error) {
            flashToast(error.response?.data?.error || "Failed to push to Spotify.")
        } finally {
            setPushingIds(prev => { const n = new Set(prev); n.delete(playlist.id); return n })
        }
    }
    const flashToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(""), 3500) }

    // ---------- derived stats ----------
    const trackCount = tracks.length

    const topGenre = useMemo(() => {
        const counts = {}
        for (const t of tracks) for (const g of (t.genres || [])) counts[g] = (counts[g] || 0) + 1
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
        return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : null
    }, [tracks])

    const topArtist = useMemo(() => {
        const counts = {}
        for (const t of tracks) {
            const a = (t.artists || '').split(',')[0]?.trim()
            if (a) counts[a] = (counts[a] || 0) + 1
        }
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
        return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : null
    }, [tracks])

    const decadeData = useMemo(() => {
        const years = tracks.map(t => t.year).filter(Boolean)
        if (!years.length) return [4, 6, 8, 10, 14, 18, 22, 28, 24, 30]
        const buckets = {}
        years.forEach(y => { const d = Math.floor(y / 10) * 10; buckets[d] = (buckets[d] || 0) + 1 })
        return Object.keys(buckets).sort().map(k => buckets[k])
    }, [tracks])

    const sparkA = useMemo(() => decadeData.length >= 2 ? decadeData : [3, 5, 4, 7, 6, 9, 8, 11], [decadeData])
    const sparkB = useMemo(() => [...sparkA].reverse(), [sparkA])

    const gaugePercent = Math.min(95, 20 + Math.round((trackCount / 100) * 60))

    return (
        <div className="relative min-h-screen w-full bg-[#0a0604] text-white font-sans overflow-hidden">
            {/* ambient warm glow */}
            <div className="pointer-events-none absolute -top-[10%] -right-[10%] h-[700px] w-[700px] rounded-full bg-orange-600/30 blur-[140px]" />
            <div className="pointer-events-none absolute top-[40%] -left-[15%] h-[500px] w-[500px] rounded-full bg-orange-500/15 blur-[160px]" />
            <div className="pointer-events-none absolute bottom-0 right-[10%] h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[120px]" />

            <div className="relative z-10 flex min-h-screen">
                {/* SIDEBAR */}
                <aside className="hidden lg:flex flex-col w-[260px] shrink-0 px-5 py-6 border-r border-white/[0.06]">
                    <div className="flex items-center gap-2.5 mb-10 px-2">
                        <LyraMark size={32} />
                        <span className="text-[20px] font-semibold tracking-tight">Lyra</span>
                    </div>

                    <nav className="flex flex-col gap-1">
                        {NAV_MAIN.map((item) => (
                            <NavItem key={item.label} {...item} />
                        ))}
                    </nav>

                    <p className="mt-8 mb-3 px-3 text-[11px] font-medium tracking-[0.18em] text-white/30">AI TOOLS</p>
                    <nav className="flex flex-col gap-1">
                        {NAV_AI.map((item) => <NavItem key={item.label} {...item} />)}
                    </nav>

                    <p className="mt-8 mb-3 px-3 text-[11px] font-medium tracking-[0.18em] text-white/30">PREFERENCE</p>
                    <nav className="flex flex-col gap-1">
                        {NAV_PREFS.map((item) => <NavItem key={item.label} {...item} />)}
                    </nav>

                    {/* Help center card */}
                    <div className="mt-auto pt-6">
                        <div className="relative rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.02] border border-white/[0.08] p-5 text-center overflow-hidden">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                <HelpCircle className="w-6 h-6 text-white" />
                            </div>
                            <p className="mt-6 text-sm font-medium">Help Center</p>
                            <p className="mt-1 text-[11px] text-white/40 leading-relaxed">
                                Having trouble in Lyra?<br />Please contact us
                            </p>
                            <button className="mt-4 w-full h-9 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white text-sm font-medium transition-all">
                                Contact us
                            </button>
                        </div>
                    </div>
                </aside>

                {/* MAIN */}
                <main className="flex-1 min-w-0 px-6 lg:px-8 py-6">
                    {/* TOP BAR */}
                    <header className="flex items-center gap-4 mb-7">
                        <div className="relative flex-1 max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                                placeholder="Search…"
                                className="w-full h-11 pl-11 pr-4 rounded-full bg-white/[0.04] border border-white/[0.06] text-sm placeholder-white/30 focus:outline-none focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/30 transition-all"
                            />
                        </div>

                        <div className="ml-auto flex items-center gap-3">
                            <div className="flex items-center rounded-full bg-white/[0.04] border border-white/[0.06] p-1">
                                <button className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center">
                                    <Moon className="w-4 h-4 text-white/80" />
                                </button>
                                <button className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 transition-colors">
                                    <Sun className="w-4 h-4" />
                                </button>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] transition-colors relative">
                                <Bell className="w-4 h-4 text-white/70" />
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-orange-500" />
                            </button>
                            <div className="w-px h-8 bg-white/10" />
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-1 pr-4 h-11 rounded-full bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
                                title="Click to log out"
                            >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-sm font-semibold">
                                    L
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium leading-tight">Listener</p>
                                    <p className="text-[11px] text-white/40 leading-tight">Pro Account</p>
                                </div>
                            </button>
                        </div>
                    </header>

                    {/* TOP STATS ROW */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
                        {/* Header strip */}
                        <div className="lg:col-span-5 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40 mb-1 flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full border border-white/30 inline-block" />
                                    All Tracks
                                </p>
                                <h2 className="text-3xl font-medium tracking-tight">My Library</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="h-9 px-4 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs flex items-center gap-2 hover:bg-white/[0.08]">
                                    All time <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <button className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08]">
                                    <EyeOff className="w-3.5 h-3.5 text-white/60" />
                                </button>
                                <button className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08]">
                                    <RefreshCw className="w-3.5 h-3.5 text-white/60" />
                                </button>
                            </div>
                        </div>
                        <div className="lg:col-span-7 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40 mb-1 flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full border border-white/30 inline-block" />
                                    Top Picks
                                </p>
                                <h2 className="text-3xl font-medium tracking-tight">My Top Tracks</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="h-9 px-4 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs flex items-center gap-2 hover:bg-white/[0.08]">
                                    All Genres <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <button className="h-9 px-4 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs flex items-center gap-2 hover:bg-white/[0.08]">
                                    24h <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Top genre card */}
                        <StatCard className="lg:col-span-3" tone="up">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center text-black font-bold text-sm">G</div>
                                <div>
                                    <p className="text-[11px] text-white/50 leading-tight">TOP</p>
                                    <p className="text-sm font-medium leading-tight">{topGenre?.name || 'Indie Pop'}</p>
                                </div>
                            </div>
                            <div className="mt-5">
                                <p className="text-2xl font-semibold tracking-tight">{topGenre?.count ?? 12}</p>
                                <p className="text-[11px] text-white/40 mt-0.5">{(topGenre?.count ?? 12) * 3} plays this week</p>
                            </div>
                            <div className="mt-3 -mx-1">
                                <Sparkline data={sparkA} color="#22c55e" height={48} />
                            </div>
                            <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                                <ArrowUpRight className="w-3 h-3" /> +1.5%
                            </div>
                        </StatCard>

                        {/* Big gauge card */}
                        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-6 relative overflow-hidden">
                            <p className="text-3xl font-semibold tracking-tight">{trackCount.toLocaleString() || '—'}</p>
                            <div className="mt-1 inline-flex items-center gap-1.5 text-sm">
                                <span className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                                    <ArrowUpRight className="w-3 h-3 text-orange-400" />
                                </span>
                                <span className="text-orange-400 font-medium">+{Math.round(trackCount * 0.05)}</span>
                                <span className="text-white/40">({(trackCount * 0.013).toFixed(2)})</span>
                            </div>
                            <div className="mt-2">
                                <GaugeChart percent={gaugePercent} label={`${(gaugePercent / 10).toFixed(2)}% More than last week`} />
                            </div>
                        </div>

                        {/* Top artist card */}
                        <StatCard className="lg:col-span-4" tone="down">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">A</div>
                                <div>
                                    <p className="text-[11px] text-white/50 leading-tight">ARTIST</p>
                                    <p className="text-sm font-medium leading-tight truncate max-w-[180px]">{topArtist?.name || 'Unknown'}</p>
                                </div>
                            </div>
                            <div className="mt-5 flex items-end justify-between gap-3">
                                <div>
                                    <p className="text-2xl font-semibold tracking-tight">{topArtist?.count ?? 8}</p>
                                    <p className="text-[11px] text-white/40 mt-0.5">tracks in your library</p>
                                </div>
                                <div className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                                    <ArrowDownRight className="w-3 h-3" /> -0.5%
                                </div>
                            </div>
                            <div className="mt-3 -mx-1">
                                <Sparkline data={sparkB} color="#f43f5e" height={48} />
                            </div>
                        </StatCard>
                    </section>

                    {/* MIDDLE ROW */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
                        {/* Listening activity chart */}
                        <div className="lg:col-span-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-xl font-medium">Listening Activity</h3>
                                <button className="text-xs text-white/50 hover:text-white flex items-center gap-1">
                                    See all <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                                {['Decades', 'Genres', 'Top Plays', 'New Adds', 'Discovers'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setChartTab(tab)}
                                        className={`h-8 px-4 rounded-full text-xs transition-all ${
                                            chartTab === tab
                                                ? 'bg-white/[0.08] border border-white/15 text-white'
                                                : 'border border-transparent text-white/50 hover:text-white'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <MultiLineChart />
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                                {[
                                    { color: '#ea580c', label: 'Decades', val: '29' },
                                    { color: '#f59e0b', label: 'Genres', val: '32' },
                                    { color: '#a78bfa', label: 'New Adds', val: '54' },
                                    { color: '#22c55e', label: 'Discovers', val: '06' },
                                ].map((s) => (
                                    <div key={s.label} className="rounded-full bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-[11px] text-white/70">
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                            {s.label}
                                        </span>
                                        <span className="text-[11px] font-medium">${s.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top playlists */}
                        <div className="lg:col-span-4 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-medium">Saved Playlists</h3>
                                <button className="text-xs text-white/50 hover:text-white flex items-center gap-1">
                                    {savedPlaylists.length} saved <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <button className="h-8 px-4 rounded-full bg-white/[0.06] border border-white/15 text-xs">All</button>
                                <button className="h-8 px-4 rounded-full text-xs text-white/50 hover:text-white">Recent</button>
                                <button className="h-8 px-4 rounded-full text-xs text-white/50 hover:text-white">By Size</button>
                            </div>

                            {savedPlaylists.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-white/40">
                                    <Disc3 className="w-7 h-7 mb-2 opacity-50" />
                                    <p className="text-xs">No saved playlists yet.</p>
                                    <p className="text-[11px] mt-1">Use AI Sort below.</p>
                                </div>
                            ) : (
                                <div className="space-y-2 -mr-2 pr-2 overflow-y-auto max-h-[340px]">
                                    {savedPlaylists.map((p, i) => {
                                        const colors = ['from-cyan-400 to-blue-500', 'from-yellow-400 to-orange-500', 'from-emerald-400 to-green-500', 'from-purple-400 to-fuchsia-500']
                                        const c = colors[i % colors.length]
                                        const isPushing = pushingIds.has(p.id)
                                        return (
                                            <div key={p.id} className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors">
                                                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c} flex-shrink-0`} />
                                                <div className="flex-1 min-w-0">
                                                    <input
                                                        value={p.name}
                                                        onChange={(e) => renamePlaylist(p.id, e.target.value)}
                                                        className="w-full bg-transparent text-sm font-medium truncate focus:outline-none focus:bg-white/[0.04] rounded px-1"
                                                    />
                                                    <p className="text-[11px] text-white/40 px-1">{p.uris.length} tracks</p>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => pushToSpotify(p)}
                                                        disabled={isPushing}
                                                        className="w-8 h-8 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-50 flex items-center justify-center"
                                                        title="Push to Spotify"
                                                    >
                                                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                                                    </button>
                                                    <button
                                                        onClick={() => removePlaylist(p.id)}
                                                        disabled={isPushing}
                                                        className="w-8 h-8 rounded-full hover:bg-white/[0.06] flex items-center justify-center"
                                                        title="Remove"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-white/50" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* AI SORT ROW */}
                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        <div className="lg:col-span-7 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-6">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="text-xl font-medium">Sort with Gemini</h3>
                                </div>
                                <span className="text-xs text-white/40">{isLoadingTracks ? 'loading…' : `${trackCount} tracks`}</span>
                            </div>
                            <p className="text-sm text-white/50 mb-5">
                                Pick parameters. Gemini will group your most recent tracks into smart playlists.
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {(availableParams.length ? availableParams : Object.keys(PARAM_LABELS)).map(p => {
                                    const active = selectedParams.has(p)
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => toggleParam(p)}
                                            className={`px-4 h-9 rounded-full text-xs font-medium border transition-all ${
                                                active
                                                    ? 'bg-orange-500/20 border-orange-400/60 text-white'
                                                    : 'bg-white/[0.03] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06]'
                                            }`}
                                        >
                                            {PARAM_LABELS[p] || p}
                                        </button>
                                    )
                                })}
                            </div>

                            <input
                                value={extraInstructions}
                                onChange={(e) => setExtraInstructions(e.target.value)}
                                placeholder="Optional — extra hint, e.g. 'focus on 2020s'"
                                className="w-full h-11 bg-white/[0.04] border border-white/[0.06] rounded-full px-5 text-sm placeholder-white/30 focus:outline-none focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/30 mb-3"
                            />

                            <Button
                                onClick={handleSort}
                                disabled={isSorting || tracks.length === 0 || selectedParams.size === 0}
                                className="w-full h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 disabled:opacity-50 text-white font-medium border-0"
                            >
                                {isSorting ? "Asking Gemini…" : "Sort with AI"}
                            </Button>

                            {sortError && <p className="text-rose-400 text-xs mt-3 text-center">{sortError}</p>}
                        </div>

                        {/* Suggestions panel */}
                        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-medium">Suggestions</h3>
                                {suggestedGroups.length > 0 && (
                                    <button onClick={keepAllGroups} className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1">
                                        <Plus className="w-3.5 h-3.5" /> Keep all
                                    </button>
                                )}
                            </div>

                            {suggestedGroups.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-white/40">
                                    <Sparkles className="w-7 h-7 mb-2 opacity-50" />
                                    <p className="text-xs">No suggestions yet.</p>
                                    <p className="text-[11px] mt-1">Run "Sort with AI" to generate playlists.</p>
                                </div>
                            ) : (
                                <div className="space-y-2 overflow-y-auto -mr-2 pr-2 max-h-[420px]">
                                    {suggestedGroups.map((g, idx) => (
                                        <div key={idx} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <p className="text-sm font-medium">{g.name}</p>
                                                <span className="text-[11px] text-white/40 whitespace-nowrap">{g.uris.length} tracks</span>
                                            </div>
                                            <p className="text-[11px] text-white/50 mb-2.5 line-clamp-2">{g.description}</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => keepGroup(idx)} className="flex-1 h-8 rounded-full bg-orange-500/90 hover:bg-orange-400 text-white text-xs font-medium">Keep</button>
                                                <button onClick={() => discardGroup(idx)} className="flex-1 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-xs font-medium">Discard</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>

            {toastMessage && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black/80 border border-white/10 text-white text-sm px-5 py-3 rounded-full backdrop-blur-xl shadow-lg">
                    {toastMessage}
                </div>
            )}
        </div>
    )
}

function NavItem({ icon: Icon, label, active, chevron }) {
    return (
        <button
            className={`group flex items-center gap-3 h-10 px-3 rounded-full text-sm transition-all ${
                active
                    ? 'bg-white/[0.06] border border-white/15 text-white'
                    : 'border border-transparent text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
        >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            {chevron && <ChevronDown className="w-3.5 h-3.5 text-white/40" />}
        </button>
    )
}

function StatCard({ children, className = '' }) {
    return (
        <div className={`rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-5 ${className}`}>
            {children}
        </div>
    )
}
