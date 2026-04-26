import { useEffect } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import {
    LayoutGrid, Disc3, Sparkles, Settings as SettingsIcon,
    HelpCircle, Search, LogOut
} from "lucide-react"
import { useStore } from "@/store/useStore"
import { useTracksStore } from "@/store/useTracksStore"
import { apiClient } from "@/api/axios"

export function LyraMark({ size = 32 }) {
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 to-green-700 shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
            <div className="absolute inset-[18%] rounded-full bg-black/40 backdrop-blur" />
            <div className="absolute inset-[30%] rounded-full bg-gradient-to-br from-green-400 to-green-600" />
        </div>
    )
}

const NAV = [
    { to: "/dashboard", icon: LayoutGrid, label: "Dashboard", end: true },
    { to: "/dashboard/library", icon: Disc3, label: "Library" },
    { to: "/dashboard/sort", icon: Sparkles, label: "AI Sort" },
]

const NAV_PREFS = [
    { to: "/dashboard/settings", icon: SettingsIcon, label: "Settings" },
]

export default function DashboardLayout() {
    const navigate = useNavigate()
    const { clearAuth } = useStore()
    const { fetchTracks, error: tracksError } = useTracksStore()

    // Load library once when the dashboard mounts
    useEffect(() => {
        fetchTracks().then(result => {
            if (result && !result.ok && result.status === 401) navigate('/')
        })
    }, [fetchTracks, navigate])

    const handleLogout = async () => {
        try {
            await apiClient.post('/auth/logout')
            useTracksStore.getState().clear()
            clearAuth()
            navigate('/')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <div className="relative min-h-screen w-full bg-[#040a06] text-white font-sans overflow-hidden">
            {/* ambient warm glow */}
            <div className="pointer-events-none absolute -top-[10%] -right-[10%] h-[700px] w-[700px] rounded-full bg-green-600/30 blur-[140px]" />
            <div className="pointer-events-none absolute top-[40%] -left-[15%] h-[500px] w-[500px] rounded-full bg-green-500/15 blur-[160px]" />
            <div className="pointer-events-none absolute bottom-0 right-[10%] h-[400px] w-[400px] rounded-full bg-green-500/10 blur-[120px]" />

            <div className="relative z-10 flex min-h-screen">
                {/* SIDEBAR */}
                <aside className="hidden lg:flex flex-col w-[260px] shrink-0 px-5 py-6 border-r border-white/[0.06]">
                    <div className="flex items-center gap-2.5 mb-10 px-2">
                        <LyraMark size={32} />
                        <span className="text-[20px] font-semibold tracking-tight">Lyra</span>
                    </div>

                    <nav className="flex flex-col gap-1">
                        {NAV.map(item => <SidebarLink key={item.to} {...item} />)}
                    </nav>

                    <p className="mt-8 mb-3 px-3 text-[11px] font-medium tracking-[0.18em] text-white/30">PREFERENCE</p>
                    <nav className="flex flex-col gap-1">
                        {NAV_PREFS.map(item => <SidebarLink key={item.to} {...item} />)}
                    </nav>

                    <div className="mt-auto pt-6">
                        <div className="relative rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.02] border border-white/[0.08] p-5 text-center overflow-hidden">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                                <HelpCircle className="w-6 h-6 text-white" />
                            </div>
                            <p className="mt-6 text-sm font-medium">Help Center</p>
                            <p className="mt-1 text-[11px] text-white/40 leading-relaxed">
                                Having trouble in Lyra?<br />Please contact us
                            </p>
                            <button className="mt-4 w-full h-9 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white text-sm font-medium transition-all">
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
                                className="w-full h-11 pl-11 pr-4 rounded-full bg-white/[0.04] border border-white/[0.06] text-sm placeholder-white/30 focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/30 transition-all"
                            />
                        </div>

                        <div className="ml-auto flex items-center gap-3">
                            <div className="flex items-center gap-3 px-1 pr-4 h-11 rounded-full bg-white/[0.04] border border-white/[0.06]">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-sm font-semibold">L</div>
                                <div className="text-left">
                                    <p className="text-sm font-medium leading-tight">Listener</p>
                                    <p className="text-[11px] text-white/40 leading-tight">Pro Account</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-11 h-11 rounded-full bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-green-400/30 transition-colors flex items-center justify-center"
                                title="Log out"
                            >
                                <LogOut className="w-4 h-4 text-white/70" />
                            </button>
                        </div>
                    </header>

                    {tracksError && (
                        <div className="mb-4 px-4 py-2.5 rounded-2xl bg-rose-500/10 border border-rose-400/30 text-rose-200 text-sm">
                            {tracksError}
                        </div>
                    )}

                    <Outlet />
                </main>
            </div>
        </div>
    )
}

function SidebarLink({ to, icon: Icon, label, end }) {
    return (
        <NavLink
            to={to}
            end={end}
            className={({ isActive }) =>
                `group flex items-center gap-3 h-10 px-3 rounded-full text-sm transition-all ${isActive
                    ? 'bg-white/[0.06] border border-white/15 text-white'
                    : 'border border-transparent text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`
            }
        >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">{label}</span>
        </NavLink>
    )
}
