import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
    ChevronRight, RefreshCw, Disc3, Sparkles, Upload, Trash2,
    Music, Users, Calendar, AlertTriangle
} from "lucide-react"
import { useTracksStore } from "@/store/useTracksStore"
import { usePlaylistsStore, useStore } from "@/store/useStore"
import { apiClient } from "@/api/axios"
import { Sparkline, BarLineChart } from "@/components/dashboard/charts"
import { useNavigate } from "react-router-dom"

const ANALYTICS_TABS = ['Decades', 'Genres', 'Top Artists']

export default function Overview() {
    const navigate = useNavigate()
    const { clearAuth } = useStore()
    const {
        tracks, topArtists, topGenres, topTracks, topLoaded, needsReauth,
        isLoading, isRefreshing, fetchTracks, lastFetchedAt
    } = useTracksStore()
    const { savedPlaylists, removePlaylist, renamePlaylist } = usePlaylistsStore()

    const [analyticsTab, setAnalyticsTab] = useState('Decades')
    const [pushingIds, setPushingIds] = useState(new Set())
    const [toast, setToast] = useState("")
    const flashToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3500) }

    const trackCount = tracks.length

    const topGenre = topGenres[0] || null
    const topArtist = topArtists[0] || null

    // Library snapshot stats (replace the meaningless gauge)
    const snapshot = useMemo(() => {
        if (tracks.length === 0) return null
        const artists = new Set()
        const albums = new Set()
        let oldest = Infinity, newest = -Infinity, totalMs = 0
        for (const t of tracks) {
            if (t.artists) artists.add(t.artists.split(',')[0].trim())
            if (t.album) albums.add(t.album)
            if (t.year) {
                if (t.year < oldest) oldest = t.year
                if (t.year > newest) newest = t.year
            }
            totalMs += t.durationMs || 0
        }
        return {
            artistCount: artists.size,
            albumCount: albums.size,
            yearSpan: oldest === Infinity ? null : { from: oldest, to: newest },
            totalHours: Math.round(totalMs / 3_600_000)
        }
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
        return topGenres.slice(0, 8).map(g => ({
            label: g.name.length > 12 ? g.name.slice(0, 12) + '…' : g.name,
            value: g.count
        }))
    }, [topGenres])

    const activeData = analyticsTab === 'Decades' ? decadeData : genreData

    const sparkA = useMemo(() => decadeData.length >= 2 ? decadeData.map(d => d.value) : [3, 5, 4, 7, 6, 9, 8, 11], [decadeData])
    const sparkB = useMemo(() => [...sparkA].reverse(), [sparkA])

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

    const handleReauth = async () => {
        try { await apiClient.post('/auth/logout') } catch { /* noop */ }
        useTracksStore.getState().clear()
        clearAuth()
        navigate('/')
    }

    const refreshLabel = lastFetchedAt ? `Updated ${timeAgo(lastFetchedAt)}` : (isLoading ? 'Loading…' : '')

    return (
        <div>
            {/* Re-auth banner if user-top-read scope is missing */}
            {needsReauth && (
                <div className="mb-5 rounded-2xl bg-amber-500/10 border border-amber-400/30 p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-amber-100">Re-authorize to unlock top stats</p>
                        <p className="text-xs text-amber-100/70 mt-0.5">
                            Lyra needs the new <code className="text-[11px] bg-black/30 px-1 rounded">user-top-read</code> permission to fetch your top artists and genres.
                            Log out and back in to grant it.
                        </p>
                    </div>
                    <button
                        onClick={handleReauth}
                        className="h-9 px-4 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-50 text-xs font-medium whitespace-nowrap"
                    >
                        Re-authorize
                    </button>
                </div>
            )}

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
                            className="h-9 px-4 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs flex items-center gap-2 hover:bg-white/[0.08] hover:border-green-400/30 disabled:opacity-50 transition-colors"
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
                            From Spotify
                        </p>
                        <h2 className="text-3xl font-medium tracking-tight">Top Picks</h2>
                    </div>
                </div>

                {/* Top Genre */}
                <StatCard className="lg:col-span-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-300 to-emerald-500 flex items-center justify-center text-black font-bold text-sm">G</div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-white/50 leading-tight">TOP GENRE</p>
                            <p className="text-sm font-medium leading-tight truncate capitalize">{topGenre?.name || (topLoaded ? '—' : 'Loading…')}</p>
                        </div>
                    </div>
                    <div className="mt-5">
                        <p className="text-2xl font-semibold tracking-tight">{topGenre?.count ?? 0}</p>
                        <p className="text-[11px] text-white/40 mt-0.5">of your top 50 artists</p>
                    </div>
                    <div className="mt-3 -mx-1">
                        <Sparkline data={sparkA} color="#22c55e" height={48} />
                    </div>
                </StatCard>

                {/* Library Snapshot — replaces the meaningless gauge */}
                <div className="lg:col-span-5 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-3xl font-semibold tracking-tight">{trackCount.toLocaleString() || (isLoading ? '…' : '0')}</p>
                            <p className="text-xs text-white/50 mt-0.5">tracks in your saved library</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[11px] uppercase tracking-[0.15em] text-white/40">Snapshot</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-5">
                        <SnapshotStat
                            icon={Users}
                            value={snapshot?.artistCount?.toLocaleString() || '—'}
                            label="artists"
                            tone="green"
                        />
                        <SnapshotStat
                            icon={Disc3}
                            value={snapshot?.albumCount?.toLocaleString() || '—'}
                            label="albums"
                            tone="emerald"
                        />
                        <SnapshotStat
                            icon={Calendar}
                            value={snapshot?.yearSpan ? `${snapshot.yearSpan.to - snapshot.yearSpan.from}y` : '—'}
                            label="span"
                            tone="violet"
                        />
                    </div>
                    {snapshot?.yearSpan && (
                        <p className="text-[11px] text-white/40 mt-4">
                            Oldest <span className="text-white/70">{snapshot.yearSpan.from}</span> · newest <span className="text-white/70">{snapshot.yearSpan.to}</span>
                            {snapshot.totalHours > 0 && <> · {snapshot.totalHours.toLocaleString()} hours of music</>}
                        </p>
                    )}
                </div>

                {/* Top Artist */}
                <StatCard className="lg:col-span-4">
                    <div className="flex items-center gap-3">
                        {topArtist?.image ? (
                            <img src={topArtist.image} alt={topArtist.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">A</div>
                        )}
                        <div className="min-w-0">
                            <p className="text-[11px] text-white/50 leading-tight">TOP ARTIST</p>
                            <p className="text-sm font-medium leading-tight truncate">{topArtist?.name || (topLoaded ? '—' : 'Loading…')}</p>
                        </div>
                    </div>
                    <div className="mt-5">
                        <p className="text-2xl font-semibold tracking-tight">{topArtist?.popularity ?? 0}</p>
                        <p className="text-[11px] text-white/40 mt-0.5">global popularity score</p>
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
                    {analyticsTab === 'Top Artists' ? (
                        topArtists.length === 0 ? (
                            <div className="h-[220px] flex items-center justify-center text-xs text-white/30">
                                {topLoaded ? (needsReauth ? 'Re-authorize to load top artists.' : 'No top artists yet.') : 'Loading…'}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {topArtists.slice(0, 8).map((a, i) => (
                                    <ArtistCard key={a.id || i} artist={a} rank={i + 1} />
                                ))}
                            </div>
                        )
                    ) : (
                        <BarLineChart data={activeData} color="#16a34a" />
                    )}
                    <p className="mt-4 text-xs text-white/40">
                        {analyticsTab === 'Decades' && 'How your saved tracks distribute across release decades.'}
                        {analyticsTab === 'Genres' && 'Top genres derived from your top 50 listened artists.'}
                        {analyticsTab === 'Top Artists' && 'Your top 8 most-listened artists from Spotify.'}
                    </p>
                </div>

                {/* Top Tracks panel */}
                <div className="lg:col-span-4 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-medium">Your top tracks</h3>
                        <span className="text-xs text-white/50">from Spotify</span>
                    </div>

                    {topTracks.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-white/40">
                            <Music className="w-7 h-7 mb-2 opacity-50" />
                            <p className="text-xs">{topLoaded ? (needsReauth ? 'Re-authorize to load.' : 'No top tracks yet.') : 'Loading…'}</p>
                        </div>
                    ) : (
                        <div className="space-y-2 -mr-2 pr-2 overflow-y-auto max-h-[340px]">
                            {topTracks.slice(0, 8).map((t, i) => (
                                <div key={t.id || i} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/[0.04]">
                                    <span className="text-[11px] text-white/30 w-4 text-right tabular-nums">{i + 1}</span>
                                    {t.albumImage ? (
                                        <img src={t.albumImage} alt="" className="w-9 h-9 rounded-md object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-9 h-9 rounded-md bg-white/[0.06] flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">{t.name}</p>
                                        <p className="text-[11px] text-white/50 truncate">{t.artists}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* SAVED PLAYLISTS + AI SORT CTA */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
                <div className="lg:col-span-7 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-medium">Saved playlists</h3>
                        <span className="text-xs text-white/50">{savedPlaylists.length} saved</span>
                    </div>

                    {savedPlaylists.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-white/40">
                            <Disc3 className="w-7 h-7 mb-2 opacity-50" />
                            <p className="text-xs">No saved playlists yet.</p>
                            <Link to="/dashboard/sort" className="text-[11px] mt-2 text-green-400 hover:text-green-300">Try AI Sort →</Link>
                        </div>
                    ) : (
                        <div className="space-y-2 -mr-2 pr-2 overflow-y-auto max-h-[340px]">
                            {savedPlaylists.map((p, i) => {
                                const colors = ['from-cyan-400 to-blue-500', 'from-teal-400 to-green-500', 'from-emerald-400 to-green-600', 'from-purple-400 to-fuchsia-500']
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

                <Link
                    to="/dashboard/sort"
                    className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-green-500/15 via-green-600/10 to-emerald-500/10 border border-green-400/30 p-6 hover:border-green-400/60 transition-colors group flex flex-col justify-center"
                >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 mb-4">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-medium">Sort {trackCount || 'your'} tracks with Gemini</h3>
                    <p className="text-sm text-white/60 mt-1">
                        Pick parameters, let AI cluster them into named playlists, then push to Spotify.
                    </p>
                    <div className="mt-4 inline-flex items-center text-xs text-green-300 group-hover:text-green-200">
                        Open AI Sort <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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

function ArtistCard({ artist, rank }) {
    return (
        <div className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3 hover:bg-white/[0.05] hover:border-white/15 transition-colors">
            <div className="relative aspect-square rounded-xl overflow-hidden mb-2.5 bg-gradient-to-br from-purple-500/20 to-green-500/10">
                {artist.image ? (
                    <img src={artist.image} alt={artist.name} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white/40" />
                    </div>
                )}
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-medium text-white/90 tabular-nums">
                    #{rank}
                </span>
            </div>
            <p className="text-sm font-medium truncate">{artist.name}</p>
            {artist.genres?.length > 0 && (
                <p className="text-[11px] text-white/40 truncate capitalize mt-0.5">{artist.genres.slice(0, 2).join(' · ')}</p>
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

function SnapshotStat({ icon: Icon, value, label, tone = 'green' }) {
    const tones = {
        green: 'from-green-500/20 to-green-500/5 text-green-300',
        emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300',
        violet: 'from-violet-500/20 to-violet-500/5 text-violet-300'
    }
    return (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3">
            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${tones[tone]} flex items-center justify-center mb-2`}>
                <Icon className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-semibold tracking-tight tabular-nums">{value}</p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/40">{label}</p>
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
