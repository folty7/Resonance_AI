import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useStore } from "@/store/useStore"
import { apiClient } from "@/api/axios"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Results() {
    const navigate = useNavigate()
    const { sortedPlaylists } = useStore()

    const [exportingTo, setExportingTo] = useState(null)
    const [exportedCategories, setExportedCategories] = useState([])

    if (!sortedPlaylists) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-white/50 font-light">
                <p>No active session data. Redirecting...</p>
                {setTimeout(() => navigate('/dashboard'), 2000) && ""}
            </div>
        )
    }

    const exportSinglePlaylist = async (categoryName, tracks) => {
        setExportingTo(categoryName)
        try {
            const payload = {
                [categoryName]: tracks
            }

            const response = await apiClient.post('/playlists', payload)
            if (response.data.success) {
                setExportedCategories(prev => [...prev, categoryName])
            }
        } catch (error) {
            console.error(`Failed to export ${categoryName}`, error)
        } finally {
            setExportingTo(null)
        }
    }

    return (
        <div className="min-h-screen w-full bg-background font-sans text-foreground p-6 md:p-10 relative overflow-hidden">

            {/* Ambient Blobs */}
            <div className="fixed top-[-10%] right-[-10%] h-[700px] w-[700px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />

            <header className="mb-12 z-10 relative flex flex-col items-center text-center">
                <h1 className="text-4xl font-semibold tracking-tight text-white mb-3">
                    Your New Playlists
                </h1>
                <p className="text-blue-100/60 font-light max-w-md mx-auto">
                    Review the intelligent categorizations below. Export any playlist directly to your Spotify account.
                </p>
                <button
                    className="mt-8 text-sm text-blue-400 hover:text-blue-300 transition-colors bg-white/5 px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2"
                    onClick={() => navigate('/dashboard')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    Back to Overview
                </button>
            </header>

            <main className="z-10 relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto pb-20">
                {Object.entries(sortedPlaylists).map(([category, tracks]) => {
                    const isExporting = exportingTo === category;
                    const isExported = exportedCategories.includes(category);

                    return (
                        <div key={category} className="glass-panel rounded-3xl flex flex-col h-[450px] overflow-hidden group hover:bg-white/5 transition-all duration-500 border-white/10 hover:border-white/20">

                            {/* Card Header */}
                            <div className="flex-none p-6 pb-4 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] -mr-10 -mt-10" />

                                <h2 className="text-2xl font-semibold text-white mb-1 relative z-10">
                                    {category}
                                </h2>
                                <p className="text-sm text-blue-200/50 font-medium tracking-wide relative z-10">
                                    {tracks.length} Tracks
                                </p>
                            </div>

                            {/* Card Body - Tracks List */}
                            <div className="flex-1 overflow-hidden p-0 relative">
                                <ScrollArea className="h-full w-full px-6 py-4">
                                    <ul className="space-y-5">
                                        {tracks.map((track, idx) => (
                                            <li key={track.id || idx} className="flex flex-col group/track cursor-default">
                                                <span className="text-[15px] font-medium text-white/90 group-hover/track:text-white transition-colors truncate">
                                                    {track.name}
                                                </span>
                                                <span className="text-[13px] text-white/40 group-hover/track:text-blue-200/60 transition-colors truncate mt-0.5">
                                                    {track.artists}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </ScrollArea>
                            </div>

                            {/* Card Footer - Export Action */}
                            <div className="flex-none p-5 pt-3 border-t border-white/5 bg-black/20 backdrop-blur-md">
                                <button
                                    onClick={() => exportSinglePlaylist(category, tracks)}
                                    disabled={isExporting || isExported}
                                    className={`w-full h-12 rounded-full font-medium tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${isExported
                                            ? 'bg-white/10 text-white/50 border border-white/5 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_14px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] border border-blue-400/20'
                                        }`}
                                >
                                    {isExported && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                    {isExported ? "Synced to Spotify" : isExporting ? "Syncing..." : "Sync to Spotify"}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </main>

        </div>
    )
}
