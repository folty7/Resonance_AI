import { useEffect, useMemo, useRef, useState } from "react"
import { Search, RefreshCw, Music, ChevronDown, X } from "lucide-react"
import { useTracksStore } from "@/store/useTracksStore"

const PAGE_SIZE = 60
const SORTS = [
    { key: 'recent', label: 'Recently added' },
    { key: 'name', label: 'Title A–Z' },
    { key: 'artist', label: 'Artist A–Z' },
    { key: 'year-desc', label: 'Year (new → old)' },
    { key: 'year-asc', label: 'Year (old → new)' },
]

export default function Library() {
    const { tracks, isLoading, isRefreshing, fetchTracks, error } = useTracksStore()
    const [query, setQuery] = useState("")
    const [sort, setSort] = useState('recent')
    const [sortOpen, setSortOpen] = useState(false)
    const sentinelRef = useRef(null)

    // Filter + sort
    const processed = useMemo(() => {
        const q = query.trim().toLowerCase()
        let list = tracks
        if (q) {
            list = list.filter(t =>
                (t.name || '').toLowerCase().includes(q) ||
                (t.artists || '').toLowerCase().includes(q) ||
                (t.album || '').toLowerCase().includes(q)
            )
        }
        const arr = [...list]
        switch (sort) {
            case 'name': arr.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break
            case 'artist': arr.sort((a, b) => (a.artists || '').localeCompare(b.artists || '')); break
            case 'year-desc': arr.sort((a, b) => (b.year || 0) - (a.year || 0)); break
            case 'year-asc': arr.sort((a, b) => (a.year || 9999) - (b.year || 9999)); break
            case 'recent':
            default: arr.sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0)); break
        }
        return arr
    }, [tracks, query, sort])

    // Reset the visible window when the filter/sort changes — the canonical
    // "derived state via set-during-render" pattern. Avoids a useEffect+setState
    // cascade. https://react.dev/reference/react/useState#storing-information-from-previous-renders
    const filterKey = `${query}|${sort}`
    const [appliedKey, setAppliedKey] = useState(filterKey)
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
    if (filterKey !== appliedKey) {
        setAppliedKey(filterKey)
        setVisibleCount(PAGE_SIZE)
    }

    // Infinite scroll: render more rows when sentinel enters viewport
    useEffect(() => {
        const el = sentinelRef.current
        if (!el) return
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setVisibleCount(c => Math.min(c + PAGE_SIZE, processed.length))
            }
        }, { rootMargin: '300px' })
        observer.observe(el)
        return () => observer.disconnect()
    }, [processed.length])

    const visible = processed.slice(0, visibleCount)
    const totalDuration = useMemo(
        () => processed.reduce((sum, t) => sum + (t.durationMs || 0), 0),
        [processed]
    )

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40 mb-1">Library</p>
                    <h2 className="text-3xl font-medium tracking-tight">Your saved tracks</h2>
                    <p className="text-sm text-white/50 mt-1">
                        {tracks.length.toLocaleString()} tracks · {processed.length !== tracks.length && `${processed.length.toLocaleString()} match · `}
                        {formatDuration(totalDuration)}
                    </p>
                </div>
                <button
                    onClick={() => fetchTracks({ force: true })}
                    disabled={isLoading || isRefreshing}
                    className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs flex items-center gap-2 hover:bg-white/[0.08] hover:border-green-400/30 disabled:opacity-50 self-start"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing…' : 'Refresh from Spotify'}
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search title, artist, album…"
                        className="w-full h-11 pl-11 pr-10 rounded-full bg-white/[0.04] border border-white/[0.06] text-sm placeholder-white/30 focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/30"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-white/[0.06] flex items-center justify-center"
                        >
                            <X className="w-3.5 h-3.5 text-white/40" />
                        </button>
                    )}
                </div>
                <div className="relative">
                    <button
                        onClick={() => setSortOpen(o => !o)}
                        className="h-11 px-4 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs flex items-center gap-2 hover:bg-white/[0.08] min-w-[180px] justify-between"
                    >
                        <span className="text-white/50">Sort:</span>
                        <span className="flex-1 text-left">{SORTS.find(s => s.key === sort)?.label}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    {sortOpen && (
                        <>
                            <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#081a0c] border border-white/10 shadow-xl z-40 overflow-hidden">
                                {SORTS.map(s => (
                                    <button
                                        key={s.key}
                                        onClick={() => { setSort(s.key); setSortOpen(false) }}
                                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-white/[0.06] transition-colors ${sort === s.key ? 'text-green-300' : 'text-white/70'}`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-4 px-4 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-400/30 text-rose-200 text-sm">{error}</div>
            )}

            {/* List */}
            {isLoading && tracks.length === 0 ? (
                <LibrarySkeleton />
            ) : processed.length === 0 ? (
                <div className="rounded-3xl bg-white/[0.03] border border-white/[0.06] p-12 text-center">
                    <Music className="w-8 h-8 mx-auto mb-3 text-white/30" />
                    <p className="text-white/60">{query ? 'No tracks match your search.' : 'Your library is empty.'}</p>
                </div>
            ) : (
                <>
                    <div className="rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.02] border border-white/[0.06] overflow-hidden">
                        {/* Header row */}
                        <div className="hidden sm:grid grid-cols-[48px_1fr_220px_80px_60px] gap-4 px-5 py-3 border-b border-white/[0.06] text-[10px] uppercase tracking-[0.15em] text-white/40">
                            <span>#</span>
                            <span>Title</span>
                            <span>Album</span>
                            <span>Year</span>
                            <span className="text-right">Time</span>
                        </div>

                        {visible.map((t, i) => (
                            <TrackRow key={t.uri || i} track={t} index={i} />
                        ))}
                    </div>

                    {/* sentinel for infinite scroll */}
                    {visibleCount < processed.length && (
                        <div ref={sentinelRef} className="h-20 flex items-center justify-center text-xs text-white/40">
                            <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                            Loading more… ({visibleCount.toLocaleString()} / {processed.length.toLocaleString()})
                        </div>
                    )}
                    {visibleCount >= processed.length && processed.length > PAGE_SIZE && (
                        <p className="text-center text-xs text-white/30 py-6">— end of library —</p>
                    )}
                </>
            )}
        </div>
    )
}

function TrackRow({ track, index }) {
    return (
        <div className="grid grid-cols-[48px_1fr_60px] sm:grid-cols-[48px_1fr_220px_80px_60px] gap-4 px-5 py-2.5 items-center hover:bg-white/[0.03] transition-colors border-b border-white/[0.03] last:border-b-0">
            <span className="text-[11px] text-white/30 tabular-nums w-6 text-right">{index + 1}</span>
            <div className="flex items-center gap-3 min-w-0">
                <AlbumArt url={track.albumImageSmall || track.albumImage} alt={track.album} />
                <div className="min-w-0">
                    <p className="text-sm text-white truncate">{track.name}</p>
                    <p className="text-[12px] text-white/50 truncate">{track.artists}</p>
                </div>
            </div>
            <p className="hidden sm:block text-xs text-white/50 truncate">{track.album}</p>
            <p className="hidden sm:block text-xs text-white/50">{track.year || '—'}</p>
            <p className="text-xs text-white/40 text-right tabular-nums">{formatDuration(track.durationMs)}</p>
        </div>
    )
}

function AlbumArt({ url, alt }) {
    if (!url) {
        return (
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-green-500/30 to-emerald-500/20 border border-white/[0.06] flex items-center justify-center shrink-0">
                <Music className="w-4 h-4 text-white/40" />
            </div>
        )
    }
    return (
        <img
            src={url}
            alt={alt || ''}
            loading="lazy"
            className="w-10 h-10 rounded-md object-cover shrink-0 bg-white/[0.04]"
        />
    )
}

function LibrarySkeleton() {
    return (
        <div className="rounded-3xl bg-white/[0.03] border border-white/[0.06] divide-y divide-white/[0.04]">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-10 h-10 rounded-md bg-white/[0.04] animate-pulse" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-1/3 rounded bg-white/[0.05] animate-pulse" />
                        <div className="h-2.5 w-1/4 rounded bg-white/[0.04] animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    )
}

function formatDuration(ms) {
    if (!ms) return '—'
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    if (h > 0) return `${h}h ${m}m`
    return `${m}:${String(s).padStart(2, '0')}`
}
