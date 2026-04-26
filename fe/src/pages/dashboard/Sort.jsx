import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Sparkles, Plus, ChevronRight, Settings as SettingsIcon, Upload, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTracksStore } from "@/store/useTracksStore"
import { usePlaylistsStore } from "@/store/useStore"
import { apiClient, getStoredGeminiKey } from "@/api/axios"

const DEFAULT_PARAMS = ['genre', 'year']
const PARAM_LABELS = {
    artist: 'Artist',
    album: 'Album',
    year: 'Year / Decade',
    genre: 'Genre',
    mood: 'Mood',
    activity: 'Activity'
}
const SAMPLE_SIZES = [50, 100, 200, 500]

export default function Sort() {
    const { tracks } = useTracksStore()
    const { savedPlaylists, addManyPlaylists, removePlaylist, renamePlaylist } = usePlaylistsStore()

    const [availableParams, setAvailableParams] = useState([])
    const [selectedParams, setSelectedParams] = useState(new Set(DEFAULT_PARAMS))
    const [extra, setExtra] = useState("")
    const [sampleSize, setSampleSize] = useState(100)
    const [groups, setGroups] = useState([])
    const [isSorting, setIsSorting] = useState(false)
    const [error, setError] = useState("")
    const [pushingIds, setPushingIds] = useState(new Set())
    const [toast, setToast] = useState("")
    const flashToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3500) }
    const hasUserKey = !!getStoredGeminiKey()

    useEffect(() => {
        apiClient.get('/sort/parameters')
            .then(res => { if (res.data.success) setAvailableParams(res.data.parameters) })
            .catch(() => {})
    }, [])

    const toggleParam = (p) => setSelectedParams(prev => {
        const next = new Set(prev)
        if (next.has(p)) {
            next.delete(p)
        } else {
            if (next.size < 2) {
                next.add(p)
            } else {
                flashToast("You can only select up to 2 parameters")
            }
        }
        return next
    })

    const handleSort = async () => {
        if (selectedParams.size === 0) return setError("Pick at least one parameter.")
        if (tracks.length === 0) return setError("Your library hasn't loaded yet.")
        setIsSorting(true); setError(""); setGroups([])
        try {
            const slice = tracks.slice(0, sampleSize)
            const res = await apiClient.post('/sort', {
                tracks: slice,
                parameters: Array.from(selectedParams),
                extra: extra.trim() || undefined
            })
            if (res.data.success) setGroups(res.data.groups || [])
        } catch (err) {
            if (err.response?.data?.error === 'QUOTA_EXCEEDED') {
                setError('QUOTA_EXCEEDED')
            } else {
                setError(err.response?.data?.error || "Gemini sorting failed.")
            }
        } finally { setIsSorting(false) }
    }

    const keepGroup = (idx) => {
        const g = groups[idx]
        addManyPlaylists([{ name: g.name, description: g.description, uris: g.uris }])
        setGroups(prev => prev.filter((_, i) => i !== idx))
        flashToast(`"${g.name}" saved`)
    }
    const keepAll = () => {
        if (!groups.length) return
        addManyPlaylists(groups.map(g => ({ name: g.name, description: g.description, uris: g.uris })))
        flashToast(`${groups.length} playlist(s) saved`)
        setGroups([])
    }
    const discardAll = () => {
        if (!groups.length) return
        setGroups([])
        flashToast(`Discarded all suggestions`)
    }
    const discardGroup = (idx) => setGroups(prev => prev.filter((_, i) => i !== idx))

    const pushToSpotify = async (playlist) => {
        setPushingIds(prev => new Set(prev).add(playlist.id))
        try {
            const res = await apiClient.post('/playlists', { playlistName: playlist.name, uris: playlist.uris })
            if (res.data.success) { flashToast(`"${playlist.name}" pushed!`); removePlaylist(playlist.id) }
        } catch (err) {
            flashToast(err.response?.data?.error || "Failed to push to Spotify.")
        } finally {
            setPushingIds(prev => { const n = new Set(prev); n.delete(playlist.id); return n })
        }
    }

    const params = availableParams.length ? availableParams : Object.keys(PARAM_LABELS)

    return (
        <div>
            <div className="mb-6">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40 mb-1">AI Sort</p>
                <h2 className="text-3xl font-medium tracking-tight">Sort with Gemini</h2>
                <p className="text-sm text-white/50 mt-1">
                    Pick parameters, choose how many tracks to send, and let Gemini cluster them into named playlists.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* LEFT: Form */}
                <div className="lg:col-span-7 space-y-5">
                    <div className="rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-6">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-xl font-medium">Configure</h3>
                            <span className="ml-auto text-xs text-white/40">{tracks.length.toLocaleString()} tracks loaded</span>
                        </div>

                        <p className="text-[11px] uppercase tracking-[0.15em] text-white/40 mb-2">Parameters</p>
                        <div className="flex flex-wrap gap-2 mb-5">
                            {params.map(p => {
                                const active = selectedParams.has(p)
                                return (
                                    <button
                                        key={p}
                                        onClick={() => toggleParam(p)}
                                        className={`px-4 h-9 rounded-full text-xs font-medium border transition-all ${
                                            active
                                                ? 'bg-green-500/20 border-green-400/60 text-white'
                                                : 'bg-white/[0.03] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06]'
                                        }`}
                                    >
                                        {PARAM_LABELS[p] || p}
                                    </button>
                                )
                            })}
                        </div>

                        <p className="text-[11px] uppercase tracking-[0.15em] text-white/40 mb-2">Sample size</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {SAMPLE_SIZES.map(n => (
                                <button
                                    key={n}
                                    onClick={() => setSampleSize(n)}
                                    disabled={n > tracks.length && tracks.length > 0}
                                    className={`px-4 h-9 rounded-full text-xs font-medium border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                                        sampleSize === n
                                            ? 'bg-green-500/20 border-green-400/60 text-white'
                                            : 'bg-white/[0.03] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06]'
                                    }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        <p className="text-[11px] text-white/40 mb-5">
                            How many of your most recent saved tracks to send to Gemini. Larger = richer playlists, slower &amp; more cost.
                        </p>

                        <p className="text-[11px] uppercase tracking-[0.15em] text-white/40 mb-2">Extra hint (optional)</p>
                        <input
                            value={extra}
                            onChange={e => setExtra(e.target.value)}
                            placeholder="e.g. focus on 2020s, or split by mood"
                            className="w-full h-11 bg-white/[0.04] border border-white/[0.06] rounded-full px-5 text-sm placeholder-white/30 focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/30 mb-4"
                        />

                        <Button
                            onClick={handleSort}
                            disabled={isSorting || tracks.length === 0 || selectedParams.size === 0}
                            className="w-full h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:opacity-50 text-white font-medium border-0"
                        >
                            {isSorting ? "Asking Gemini…" : `Sort ${Math.min(sampleSize, tracks.length)} tracks with AI`}
                        </Button>

                        {error && error !== 'QUOTA_EXCEEDED' && <p className="text-rose-400 text-xs mt-3 text-center">{error}</p>}
                    </div>

                    {error === 'QUOTA_EXCEEDED' && !hasUserKey && (
                        <div className="rounded-3xl bg-rose-500/10 border border-rose-500/20 p-5">
                            <p className="text-sm font-medium text-rose-200 mb-2">API limit reached!</p>
                            <p className="text-xs text-rose-200/70 mb-4 leading-relaxed">
                                The shared default API key has exhausted its quota. To continue sorting tracks, please provide your own free Gemini API key.
                            </p>
                            <Link
                                to="/dashboard/settings"
                                className="inline-flex h-10 w-full items-center justify-center rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-sm font-medium text-rose-100 transition-colors border border-rose-500/30"
                            >
                                <SettingsIcon className="w-4 h-4 mr-2" /> Add Your API Key
                            </Link>
                        </div>
                    )}

                    {!hasUserKey && error !== 'QUOTA_EXCEEDED' && (
                        <Link
                            to="/dashboard/settings"
                            className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-green-400/30 transition-colors p-4 group"
                        >
                            <div className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                                <SettingsIcon className="w-4 h-4 text-white/60" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">Add your own Gemini API key</p>
                                <p className="text-[11px] text-white/50">Use your own free key for unlimited sorts.</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white" />
                        </Link>
                    )}
                </div>

                {/* RIGHT: Suggestions / Saved */}
                <div className="lg:col-span-5 space-y-5">
                    <div className="rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-medium">Suggestions</h3>
                            {groups.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <button onClick={keepAll} className="text-xs text-green-400 hover:text-green-300 font-medium flex items-center gap-1">
                                        <Plus className="w-3.5 h-3.5" /> Keep all
                                    </button>
                                    <button onClick={discardAll} className="text-xs text-white/50 hover:text-white/80 font-medium flex items-center gap-1">
                                        <Trash2 className="w-3.5 h-3.5" /> Discard all
                                    </button>
                                </div>
                            )}
                        </div>

                        {groups.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-white/40">
                                <Sparkles className="w-7 h-7 mb-2 opacity-50" />
                                <p className="text-xs">{isSorting ? 'Gemini is thinking…' : 'No suggestions yet.'}</p>
                                {!isSorting && <p className="text-[11px] mt-1">Configure and run AI Sort.</p>}
                            </div>
                        ) : (
                            <div className="space-y-2 overflow-y-auto -mr-2 pr-2 max-h-[480px]">
                                {groups.map((g, idx) => (
                                    <div key={idx} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <p className="text-sm font-medium">{g.name}</p>
                                            <span className="text-[11px] text-white/40 whitespace-nowrap">{g.uris.length} tracks</span>
                                        </div>
                                        <p className="text-[11px] text-white/50 mb-2.5 line-clamp-2">{g.description}</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => keepGroup(idx)} className="flex-1 h-8 rounded-full bg-green-500/90 hover:bg-green-400 text-white text-xs font-medium">Keep</button>
                                            <button onClick={() => discardGroup(idx)} className="flex-1 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-xs font-medium">Discard</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {savedPlaylists.length > 0 && (
                        <div className="rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-medium">Saved &amp; ready to push</h3>
                                <span className="text-xs text-white/40">{savedPlaylists.length}</span>
                            </div>
                            <div className="space-y-2 max-h-[280px] overflow-y-auto -mr-2 pr-2">
                                {savedPlaylists.map((p, i) => {
                                    const colors = ['from-cyan-400 to-blue-500', 'from-emerald-400 to-green-500', 'from-emerald-400 to-green-500', 'from-purple-400 to-fuchsia-500']
                                    const c = colors[i % colors.length]
                                    const isPushing = pushingIds.has(p.id)
                                    return (
                                        <div key={p.id} className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04]">
                                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c} flex-shrink-0`} />
                                            <div className="flex-1 min-w-0">
                                                <input
                                                    value={p.name}
                                                    onChange={e => renamePlaylist(p.id, e.target.value)}
                                                    className="w-full bg-transparent text-sm font-medium truncate focus:outline-none focus:bg-white/[0.04] rounded px-1"
                                                />
                                                <p className="text-[11px] text-white/40 px-1">{p.uris.length} tracks</p>
                                            </div>
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
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-white/50" />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black/80 border border-white/10 text-white text-sm px-5 py-3 rounded-full backdrop-blur-xl shadow-lg">
                    {toast}
                </div>
            )}
        </div>
    )
}
