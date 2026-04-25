import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
    ArrowUpRight, ArrowDownRight, ChevronDown, ChevronRight,
    RefreshCw, Disc3, Sparkles, Upload, Trash2
} from "lucide-react"
import { useTracksStore } from "@/store/useTracksStore"
import { usePlaylistsStore } from "@/store/useStore"
import { apiClient } from "@/api/axios"
import { Sparkline, GaugeChart, BarLineChart } from "@/components/dashboard/charts"

const ANALYTICS_TABS = ['Decades', 'Genres', 'Popularity']

export default function Overview() {
    const { tracks, isLoading, isRefreshing, fetchTracks, lastFetchedAt } = useTracksStore()
    const { savedPlaylists, removePlaylist, renamePlaylist } = usePlaylistsStore()

    const [analyticsTab, setAnalyticsTab] = useState('Decades')
    const [pushingIds, setPushingIds] = useState(new Set())
    const [toast, setToast] = useState("")

    const flashToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3500) }

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
        const buckets = {}
        for (const t of tracks) {
            if (!t.year) continue
            const d = Math.floor(t.year / 10) * 10
            buckets[d] = (buckets[d] || 0) + 1
        }
        return Object.keys(buckets)
            .map(k => parseInt(k, 10))
            .sort((a, b) => a - b)
            .map(d => ({ label: `${d}s`, value: buckets[d] }))
    }, [tracks])

    const genreData = useMemo(() => {
        const counts = {}
        for (const t of tracks) for (const g of (t.genres || [])) counts[g] = (counts[g] || 0) + 1
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, value]) => ({ label: name.length > 10 ? name.slice(0, 10) + '…' : name, value }))
    }, [tracks])

    const popularityData = useMemo(() => {
        const buckets = [0, 0, 0, 0, 0]
        for (const t of tracks) {
            const p = t.popularity ?? 0
            const idx = Math.min(4, Math.floor(p / 20))
            buckets[idx] += 1
        }
        return buckets.map((v, i) => ({ label: `${i * 20}-${(i + 1) * 20}`, value: v }))
    }, [tracks])

    const activeData = analyticsTab === 'Decades' ? decadeData
        : analyticsTab === 'Genres' ? genreData
        : popularityData

    const sparkA = useMemo(() => decadeData.length >= 2 ? decadeData.map(d => d.value) : [3, 5, 4, 7, 6, 9, 8, 11], [decadeData])
    const sparkB = useMemo(() => [...sparkA].reverse(), [sparkA])

    const gaugePercent = Math.min(95, 20 + Math.round((trackCount / 1000) * 60))

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

    const refreshLabel = lastFetchedAt ? `Updated ${timeAgo(lastFetchedAt)}` : 'Loading…'

    return (
        <div>
            {/* TOP STATS ROW */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
                <div className="lg:col-span-5 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40 mb-1 flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full border border-white/30 inline-block" />
                            All Tracks
                        </p>
                        <h2 className="text-3xl font-medium tracking-tight">My Library</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:block text-[11px] text-white/40 mr-1">{refreshLabel}</span>
                        <button
                            onClick={() => fetchTracks({ force: true })}
                            disabled={isLoading || isRefreshing}
                            className="h-9 px-4 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs flex items-center gap-2 hover:bg-white/[0.08] hover:border-orange-400/30 disabled:opacity-50 transition-colors"
                            title="Refetch your library from Spotify"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing…' : 'Refresh'}
                        </button>
                    </div>
                </div>
                <div className="lg:col-span-7 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40 mb-1 flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full border border-white/30 inline-block" />
                            At a glance
                        </p>
                        <h2 className="text-3xl font-medium tracking-tight">Top Picks</h2>
                    </div>
                </div>

                <StatCard className="lg:col-span-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center text-black font-bold text-sm">G</div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-white/50 leading-tight">TOP GENRE</p>
                            <p className="text-sm font-medium leading-tight truncate">{topGenre?.name || '—'}</p>
                        </div>
                    </div>
                    <div className="mt-5">
                        <p className="text-2xl font-semibold tracking-tight">{topGenre?.count ?? 0}</p>
                        <p className="text-[11px] text-white/40 mt-0.5">tracks share this genre</p>
                    </div>
                    <div className="mt-3 -mx-1">
                        <Sparkline data={sparkA} color="#22c55e" height={48} />
                    </div>
                    <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <ArrowUpRight className="w-3 h-3" /> dominant
                    </div>
                </StatCard>

                <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-6 relative overflow-hidden">
                    <p className="text-3xl font-semibold tracking-tight">{trackCount.toLocaleString() || (isLoading ? '…' : '0')}</p>
                    <div className="mt-1 inline-flex items-center gap-1.5 text-sm">
                        <span className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <ArrowUpRight className="w-3 h-3 text-orange-400" />
                        </span>
                        <span className="text-white/60 text-xs">tracks loaded</span>
                    </div>
                    <div className="mt-2">
                        <GaugeChart percent={gaugePercent} label={`${trackCount} of your saved library`} />
                    </div>
                </div>

                <StatCard className="lg:col-span-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">A</div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-white/50 leading-tight">TOP ARTIST</p>
                            <p className="text-sm font-medium leading-tight truncate">{topArtist?.name || '—'}</p>
                        </div>
                    </div>
                    <div className="mt-5 flex items-end justify-between gap-3">
                        <div>
                            <p className="text-2xl font-semibold tracking-tight">{topArtist?.count ?? 0}</p>
                            <p className="text-[11px] text-white/40 mt-0.5">tracks in your library</p>
                        </div>
                        <div className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                            <ArrowDownRight className="w-3 h-3" /> +1 fav
                        </div>
                    </div>
                    <div className="mt-3 -mx-1">
                        <Sparkline data={sparkB} color="#f43f5e" height={48} />
                    </div>
                </StatCard>
            </section>

            {/* MIDDLE ROW */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
                <div className="lg:col-span-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xl font-medium">Library Breakdown</h3>
                        <Link to="/dashboard/library" className="text-xs text-white/50 hover:text-white flex items-center gap-1">
                            See library <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {ANALYTICS_TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setAnalyticsTab(tab)}
                                className={`h-8 px-4 rounded-full text-xs transition-all ${
                                    analyticsTab === tab
                                        ? 'bg-white/[0.08] border border-white/15 text-white'
                                        : 'border border-transparent text-white/50 hover:text-white'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <BarLineChart data={activeData} color="#ea580c" />
                    <p className="mt-4 text-xs text-white/40">
                        {analyticsTab === 'Decades' && 'Distribution of tracks across release decades.'}
                        {analyticsTab === 'Genres' && 'Top 8 genres by track count, derived from artist genres.'}
                        {analyticsTab === 'Popularity' && 'Spotify popularity score (0–100) bucketed in 20-point bands.'}
                    </p>
                </div>

                <div className="lg:col-span-4 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-medium">Saved Playlists</h3>
                        <span className="text-xs text-white/50">{savedPlaylists.length} saved</span>
                    </div>

                    {savedPlaylists.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-white/40">
                            <Disc3 className="w-7 h-7 mb-2 opacity-50" />
                            <p className="text-xs">No saved playlists yet.</p>
                            <Link to="/dashboard/sort" className="text-[11px] mt-2 text-orange-400 hover:text-orange-300">Try AI Sort →</Link>
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

            {/* AI SORT CALL-TO-ACTION */}
            <section>
                <Link
                    to="/dashboard/sort"
                    className="block rounded-3xl bg-gradient-to-r from-orange-500/15 via-orange-600/10 to-amber-500/10 border border-orange-400/30 p-6 hover:border-orange-400/60 transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-medium">Sort {trackCount || 'your'} tracks with Gemini</h3>
                            <p className="text-sm text-white/60 mt-0.5">
                                Pick parameters, let AI cluster them into named playlists, then push to Spotify.
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>
            </section>

            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black/80 border border-white/10 text-white text-sm px-5 py-3 rounded-full backdrop-blur-xl shadow-lg">
                    {toast}
                </div>
            )}
        </div>
    )
}

function StatCard({ children, className = '' }) {
    return (
        <div className={`rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-5 ${className}`}>
            {children}
        </div>
    )
}

function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000)
    if (s < 60) return 'just now'
    const m = Math.floor(s / 60)
    if (m < 60) return `${m} min ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
}
