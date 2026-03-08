import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useStore } from "@/store/useStore"
import { apiClient } from "@/api/axios"

export default function Dashboard() {
    const navigate = useNavigate()
    const { setSortedPlaylists } = useStore()

    const [isProcessing, setIsProcessing] = useState(false)
    const [statusText, setStatusText] = useState("Awaiting Command")
    const [customPrompt, setCustomPrompt] = useState("")

    useEffect(() => {
        apiClient.get('/tracks').catch(() => {
            navigate('/')
        })
    }, [navigate])

    const handleLogout = async () => {
        try {
            await apiClient.post('/auth/logout')
            setSortedPlaylists(null)
            navigate('/')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const handleSmartSort = async () => {
        setIsProcessing(true)
        setStatusText("Analyzing library signatures...")

        try {
            setTimeout(() => setStatusText("Neural Net categorizing vibes..."), 2000)

            const response = await apiClient.post('/smart-sort', { customPrompt })

            if (response.data.success) {
                setStatusText("Sorting Complete.")
                setSortedPlaylists(response.data.categories)
                setTimeout(() => navigate('/results'), 800)
            }
        } catch (error) {
            console.error(error)
            setStatusText("Failed to establish connection")
            setIsProcessing(false)
        }
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-background font-sans text-foreground overflow-hidden">

            {/* Ambient Blobs */}
            <div className="absolute top-[-5%] right-[-5%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />

            <header className="mb-8 flex items-center justify-between p-6 z-10 w-full max-w-5xl mx-auto">
                <h1 className="text-xl font-medium tracking-wide text-white">
                    Overview
                </h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLogout}
                        className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                    >
                        Logout
                    </button>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full glass-panel border-white/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </span>
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-lg flex-col items-center justify-center flex-1 z-10 px-6 pb-20">

                {/* Main Central Card (Wallet style) */}
                <div className="w-full glass-panel-heavy rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden group">

                    {/* Inner Top Soft Gradient */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-400/10 to-transparent opacity-50" />

                    <div className="flex flex-col items-center text-center space-y-2 mb-8 z-10 w-full">
                        <p className="text-sm font-medium text-blue-200/60 uppercase tracking-widest">Resonance AI</p>
                        <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">Configure Sort</h2>
                        <p className="text-[15px] font-light text-white/50 px-4">
                            Describe how you want your music organized. Leave blank for AI auto-pilot.
                        </p>

                        <div className="w-full px-2 mt-6">
                            <textarea
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="E.g. Most listened, New era, old era, American-UK rap..."
                                className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none transition-all text-[15px]"
                                disabled={isProcessing}
                            />
                        </div>
                    </div>

                    <div className={`relative flex items-center justify-center w-full transition-all duration-700 z-10 ${isProcessing ? 'h-32' : 'h-16'}`}>
                        {!isProcessing ? (
                            <Button
                                onClick={handleSmartSort}
                                className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all font-medium text-[15px] border border-blue-400/30"
                            >
                                Initiate Sort Sequence
                            </Button>
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full space-y-6">
                                {/* Premium Loading Bar */}
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full w-1/2 animate-[shimmer_2s_infinite] shadow-[0_0_10px_rgba(59,130,246,0.6)]" style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
                                </div>
                                <p className="text-sm text-blue-200/80 font-light tracking-wide animate-pulse">
                                    {statusText}
                                </p>
                            </div>
                        )}
                    </div>

                </div>

            </main>
        </div>
    )
}
