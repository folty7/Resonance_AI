import lyraLogo from "@/assets/lyra-logo.png"

const LAUNCH_URL = "https://github.com/folty7/Resonance_AI"

function LyraLogo({ size = 36 }) {
    return (
        <img src={lyraLogo} alt="Lyra Logo" className="shrink-0 object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.45)]" style={{ width: size, height: size }} />
    )
}

function MiniGauge() {
    const segments = [
        { color: '#16a34a', from: 0, to: 0.2 },
        { color: '#059669', from: 0.2, to: 0.4 },
        { color: '#34d399', from: 0.4, to: 0.6 },
        { color: '#a78bfa', from: 0.6, to: 0.8 },
        { color: '#22c55e', from: 0.8, to: 1 },
    ]
    const cx = 60, cy = 56, r = 42
    const polar = (t) => {
        const angle = Math.PI - t * Math.PI
        return [cx + r * Math.cos(angle), cy - r * Math.sin(angle)]
    }
    const arc = (from, to) => {
        const [x1, y1] = polar(from); const [x2, y2] = polar(to)
        return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
    }
    const [mx, my] = polar(0.35)
    return (
        <svg viewBox="0 0 120 70" className="w-full">
            {segments.map((s, i) => (
                <path key={i} d={arc(s.from + 0.02, s.to - 0.02)} stroke={s.color} strokeWidth="9" strokeLinecap="round" fill="none" />
            ))}
            <circle cx={mx} cy={my} r="6" fill="white" />
            <rect x={mx - 2.5} y={my - 2.5} width="5" height="5" rx="1" fill="#16a34a" />
        </svg>
    )
}

function MiniSparkline({ color = '#22c55e', up = true }) {
    const data = up ? [4, 8, 6, 10, 8, 12, 11, 14] : [14, 11, 12, 8, 10, 6, 8, 4]
    const w = 120, h = 32
    const max = Math.max(...data), min = Math.min(...data), range = max - min || 1
    const stepX = w / (data.length - 1)
    const pts = data.map((v, i) => [i * stepX, h - ((v - min) / range) * (h - 6) - 3])
    const path = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
            <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
    )
}

function LaptopMockup() {
    return (
        <div className="relative mx-auto w-full max-w-5xl">
            <div className="relative rounded-t-xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-white/10 border-b-0 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 h-1.5 w-16 rounded-full bg-zinc-700" />
                <div className="rounded-md overflow-hidden aspect-[16/10] bg-[#040a06] relative">
                    <div className="absolute -top-[10%] -right-[5%] h-56 w-56 rounded-full bg-green-500/30 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-[10%] h-40 w-40 rounded-full bg-green-500/15 blur-3xl pointer-events-none" />
                    <div className="relative flex h-full text-[9px]">
                        <div className="w-[18%] border-r border-white/[0.06] p-3 flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 mb-3">
                                <LyraLogo size={14} />
                                <span className="text-white font-semibold text-[10px]">Lyra</span>
                            </div>
                            <div className="bg-white/[0.06] border border-white/15 rounded-full px-2 py-1 text-white text-[8px]">Dashboard</div>
                            <div className="text-white/50 px-2 py-1 text-[8px]">Library</div>
                            <div className="text-white/50 px-2 py-1 text-[8px]">Analytics</div>
                            <p className="mt-2 text-white/30 text-[7px] tracking-widest px-2">AI TOOLS</p>
                            <div className="text-white/50 px-2 py-1 text-[8px]">AI Sort</div>
                            <div className="text-white/50 px-2 py-1 text-[8px]">Discover</div>
                        </div>
                        <div className="flex-1 p-3">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex-1 h-5 rounded-full bg-white/[0.04] border border-white/[0.06]" />
                                <div className="h-5 w-5 rounded-full bg-white/[0.04] border border-white/[0.06]" />
                                <div className="h-5 px-2 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center gap-1">
                                    <div className="h-3 w-3 rounded-full bg-gradient-to-br from-green-400 to-green-600" />
                                    <span className="text-white/70 text-[7px]">Listener</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-12 gap-2 mb-2">
                                <div className="col-span-3 rounded-lg bg-white/[0.04] border border-white/[0.06] p-2">
                                    <p className="text-white/50 text-[7px]">TOP</p>
                                    <p className="text-white text-[9px] font-medium">Indie Pop</p>
                                    <p className="text-white text-[12px] font-semibold mt-0.5">12</p>
                                    <MiniSparkline color="#22c55e" up />
                                </div>
                                <div className="col-span-5 rounded-lg bg-white/[0.04] border border-white/[0.06] p-2">
                                    <p className="text-white text-[14px] font-semibold leading-none">$380,005</p>
                                    <p className="text-green-400 text-[7px] mt-0.5">+5 (1.30)</p>
                                    <div className="mt-1"><MiniGauge /></div>
                                </div>
                                <div className="col-span-4 rounded-lg bg-white/[0.04] border border-white/[0.06] p-2">
                                    <p className="text-white/50 text-[7px]">ARTIST</p>
                                    <p className="text-white text-[9px] font-medium">The Strokes</p>
                                    <p className="text-white text-[12px] font-semibold mt-0.5">8</p>
                                    <MiniSparkline color="#f43f5e" />
                                </div>
                            </div>
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-7 rounded-lg bg-white/[0.04] border border-white/[0.06] p-2">
                                    <p className="text-white text-[8px] font-medium mb-1">Listening Activity</p>
                                    <div className="flex gap-1 mb-1">
                                        <span className="text-[6px] px-1.5 py-0.5 rounded-full bg-white/[0.08] text-white">Decades</span>
                                        <span className="text-[6px] px-1.5 py-0.5 text-white/50">Genres</span>
                                    </div>
                                    <svg viewBox="0 0 200 50" className="w-full h-10">
                                        <path d="M0 30 L25 22 L50 28 L75 16 L100 10 L125 18 L150 22 L175 14 L200 24" stroke="#16a34a" strokeWidth="1.5" fill="none" />
                                        <path d="M0 38 L25 34 L50 32 L75 36 L100 30 L125 32 L150 38 L175 34 L200 36" stroke="#059669" strokeWidth="1.5" fill="none" />
                                        <path d="M0 42 L25 40 L50 44 L75 38 L100 42 L125 40 L150 44 L175 42 L200 40" stroke="#a78bfa" strokeWidth="1.5" fill="none" />
                                    </svg>
                                </div>
                                <div className="col-span-5 rounded-lg bg-white/[0.04] border border-white/[0.06] p-2">
                                    <p className="text-white text-[8px] font-medium mb-1.5">Saved Playlists</p>
                                    {['Sunset Drive', 'Late Night', 'Throwback'].map((n, i) => {
                                        const c = ['from-cyan-400 to-blue-500', 'from-teal-400 to-green-500', 'from-emerald-400 to-green-500'][i]
                                        return (
                                            <div key={i} className="flex items-center gap-1.5 mb-1">
                                                <div className={`h-3 w-3 rounded-full bg-gradient-to-br ${c}`} />
                                                <span className="text-white text-[7px] flex-1">{n}</span>
                                                <span className="text-white/40 text-[6px]">14</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mx-auto h-3 bg-gradient-to-b from-zinc-700 to-zinc-800 border-x border-white/10 rounded-b-xl" style={{ width: '105%', marginLeft: '-2.5%' }} />
            <div className="mx-auto h-1 bg-zinc-900 rounded-b-2xl" style={{ width: '50%' }} />
        </div>
    )
}

function MobileMockup() {
    return (
        <div className="relative mx-auto w-[240px] rounded-[2.5rem] bg-gradient-to-b from-zinc-800 to-zinc-900 border border-white/10 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 h-5 w-20 rounded-full bg-black z-10" />
            <div className="rounded-[2rem] overflow-hidden aspect-[9/19] bg-[#040a06]">
                <div className="relative h-full w-full p-4 text-[10px]">
                    <div className="absolute -top-[10%] -right-[10%] h-40 w-40 rounded-full bg-green-500/30 blur-3xl" />
                    <div className="absolute bottom-[10%] -left-[10%] h-32 w-32 rounded-full bg-green-500/15 blur-3xl" />
                    <div className="relative pt-8 mb-3 flex items-center justify-between">
                        <span className="text-white font-medium text-xs">Saved</span>
                        <span className="text-white/40 text-[9px]">3</span>
                    </div>
                    <div className="relative space-y-2">
                        {[
                            { n: "Sunset Drive", d: "Golden-hour indie", c: 14, color: 'from-cyan-400 to-blue-500' },
                            { n: "Late Night Studio", d: "Lo-fi & ambient", c: 22, color: 'from-teal-400 to-green-500' },
                            { n: "Throwback 2000s", d: "Pop anthems", c: 17, color: 'from-emerald-400 to-green-500' }
                        ].map((p, i) => (
                            <div key={i} className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-2.5">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${p.color} shrink-0`} />
                                    <div className="min-w-0">
                                        <p className="text-white text-[10px] font-medium truncate">{p.n}</p>
                                        <p className="text-white/50 text-[8px]">{p.d}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <div className="flex-1 h-5 rounded-full bg-green-500/90 text-white text-[7px] flex items-center justify-center font-medium">Push</div>
                                    <div className="flex-1 h-5 rounded-full bg-white/[0.05] border border-white/10 text-white/70 text-[7px] flex items-center justify-center">Remove</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function HeroPanelMockup() {
    return (
        <div className="relative mx-auto w-full max-w-md rounded-[1.75rem] bg-gradient-to-b from-zinc-800 to-zinc-900 border border-white/10 p-2.5 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
            <div className="rounded-[1.25rem] overflow-hidden aspect-[4/5] bg-[#040a06]">
                <div className="relative h-full w-full p-6 flex flex-col items-center justify-center text-center">
                    <div className="absolute -top-[10%] -right-[10%] h-60 w-60 rounded-full bg-green-500/35 blur-3xl" />
                    <div className="absolute -bottom-[10%] -left-[10%] h-52 w-52 rounded-full bg-green-500/20 blur-3xl" />
                    <div className="relative">
                        <LyraLogo size={64} />
                    </div>
                    <h3 className="relative text-white text-3xl font-semibold tracking-tight mt-5 bg-gradient-to-b from-white to-green-200/80 bg-clip-text text-transparent">
                        Lyra
                    </h3>
                    <p className="relative text-[11px] text-white/60 mt-2 px-4">
                        AI-curated playlists from your saved library.
                    </p>
                    <a
                        href={LAUNCH_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="relative mt-6 h-9 w-44 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white text-[11px] font-medium flex items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(34,197,94,0.4)]"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.59 14.41c-.19.3-.58.39-.88.2-2.41-1.47-5.44-1.8-9.01-.99-.34.08-.68-.14-.76-.48-.08-.34.14-.68.48-.76 3.91-.89 7.27-.51 9.96 1.14.3.19.39.58.21.89z" />
                        </svg>
                        View on GitHub
                    </a>
                    <div className="relative mt-6 w-32 opacity-90">
                        <MiniGauge />
                    </div>
                </div>
            </div>
        </div>
    )
}

const FEATURES = [
    { icon: "🎧", title: "Your full library", body: "Pulls the 100 newest saved tracks from your Spotify account automatically." },
    { icon: "🤖", title: "Gemini-powered sorting", body: "Google's Gemini AI groups your tracks into coherent, named playlists." },
    { icon: "🎛️", title: "Custom parameters", body: "Pick how to sort: genre, year, mood, artist, popularity, language, or tempo." },
    { icon: "💾", title: "Save before you commit", body: "Review Gemini's suggestions, keep what you love, discard the rest." },
    { icon: "🚀", title: "One-click to Spotify", body: "Push any saved playlist back to your Spotify library when you're ready." },
    { icon: "🔒", title: "Private by default", body: "Created playlists are private; we only read your library, nothing more." }
]

const STEPS = [
    { n: "01", title: "Connect", body: "Authorize Lyra to read your saved tracks via Spotify OAuth." },
    { n: "02", title: "Curate", body: "Choose the parameters that matter. Gemini proposes smart playlists." },
    { n: "03", title: "Push", body: "Keep the playlists you like and publish them to Spotify in one tap." }
]

const cardClass = "rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.07] hover:border-green-400/30 transition-colors"

export default function LandingGHP() {
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#040a06] font-sans text-white overflow-hidden">

            <div className="pointer-events-none absolute -top-[10%] -right-[10%] h-[800px] w-[800px] rounded-full bg-green-600/30 blur-[160px]" />
            <div className="pointer-events-none absolute top-[35%] -left-[15%] h-[600px] w-[600px] rounded-full bg-green-500/15 blur-[160px]" />
            <div className="pointer-events-none absolute bottom-[5%] right-[10%] h-[500px] w-[500px] rounded-full bg-green-500/15 blur-[140px]" />

            {/* Nav */}
            <header className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-5 w-full max-w-7xl mx-auto">
                <div className="flex items-center gap-2.5">
                    <LyraLogo size={36} />
                    <span className="text-xl font-semibold tracking-tight text-white">Lyra</span>
                </div>
                <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#how" className="hover:text-white transition-colors">How it works</a>
                    <a href="#setup" className="hover:text-white transition-colors">Setup</a>
                    <a href="#contact" className="hover:text-white transition-colors">Contact</a>
                </nav>
                <a href={LAUNCH_URL} target="_blank" rel="noreferrer">
                    <button className="h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-[13px] font-medium px-5 cursor-pointer transition-colors">
                        View on GitHub
                    </button>
                </a>
            </header>

            {/* Hero */}
            <section className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 pt-12 sm:pt-20 pb-24">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div className="flex flex-col">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-white/60 w-fit mb-6 backdrop-blur-md">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                            AI-powered · Powered by Gemini
                        </span>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.05] mb-6">
                            Your library,<br />
                            <span className="bg-gradient-to-r from-green-300 via-emerald-300 to-green-400 bg-clip-text text-transparent">
                                intelligently sorted.
                            </span>
                        </h1>
                        <p className="text-[17px] text-white/60 leading-relaxed mb-10 max-w-lg">
                            Lyra reads your 100 newest saved Spotify tracks and uses Google Gemini to
                            group them into smart playlists — by genre, year, mood, or whatever you choose.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <a href={LAUNCH_URL} target="_blank" rel="noreferrer">
                                <button className="h-13 px-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 border-0 text-white shadow-[0_8px_24px_rgba(34,197,94,0.4)] font-medium text-[15px] flex items-center gap-2.5 cursor-pointer transition-all">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                    </svg>
                                    View on GitHub
                                </button>
                            </a>
                            <a href="#features">
                                <button className="h-13 px-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white font-medium text-[15px] cursor-pointer transition-colors">
                                    See how it works
                                </button>
                            </a>
                        </div>
                        <div className="flex items-center gap-6 mt-10 text-xs text-white/40">
                            <span className="flex items-center gap-1.5">✅ Free to use</span>
                            <span className="flex items-center gap-1.5">🔒 Read-only access</span>
                            <span className="flex items-center gap-1.5">⚡ Self-hosted</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <HeroPanelMockup />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-4">What Lyra does</h2>
                    <p className="text-white/50 max-w-xl mx-auto text-[15px]">
                        Everything you need to turn a chaotic library into curated playlists.
                    </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {FEATURES.map((f, i) => (
                        <div key={i} className={`${cardClass} p-6`}>
                            <div className="text-3xl mb-3">{f.icon}</div>
                            <h3 className="text-white font-medium text-lg mb-2">{f.title}</h3>
                            <p className="text-white/55 text-[14px] leading-relaxed">{f.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Showcase */}
            <section className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-4">See it in action</h2>
                    <p className="text-white/50 max-w-xl mx-auto text-[15px]">
                        A warm, focused dashboard built mobile-first.
                    </p>
                </div>
                <div className="mb-20">
                    <LaptopMockup />
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <MobileMockup />
                    <div className="space-y-4 max-w-md">
                        <h3 className="text-3xl font-semibold text-white tracking-tight">
                            Your saved playlists, your rules.
                        </h3>
                        <p className="text-white/60 text-[15px] leading-relaxed">
                            Gemini's suggestions are just suggestions. Keep the good ones, rename them,
                            edit them, or push them to Spotify when you're ready.
                        </p>
                        <ul className="space-y-3 pt-2">
                            <li className="flex items-start gap-3 text-white/70 text-[14px]">
                                <span className="text-lg">📌</span>
                                <span>Playlists persist across sessions — saved locally until you push them.</span>
                            </li>
                            <li className="flex items-start gap-3 text-white/70 text-[14px]">
                                <span className="text-lg">✏️</span>
                                <span>Rename any playlist inline before committing to Spotify.</span>
                            </li>
                            <li className="flex items-start gap-3 text-white/70 text-[14px]">
                                <span className="text-lg">🎯</span>
                                <span>One-click push creates a private playlist in your Spotify library.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-4">How it works</h2>
                    <p className="text-white/50 max-w-xl mx-auto text-[15px]">
                        Three steps. No account to create.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-4 relative">
                    {STEPS.map((s, i) => (
                        <div key={i} className={`${cardClass} p-8 relative`}>
                            <span className="text-6xl font-semibold bg-gradient-to-b from-green-300 to-green-600 bg-clip-text text-transparent block mb-4">
                                {s.n}
                            </span>
                            <h3 className="text-white text-xl font-medium mb-2">{s.title}</h3>
                            <p className="text-white/55 text-[14px] leading-relaxed">{s.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Setup */}
            <section id="setup" className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-10 py-24">
                <div className="rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.07] p-8 sm:p-12">
                    <span className="inline-block px-3 py-1 rounded-full bg-green-500/15 border border-green-400/30 text-green-200 text-[11px] mb-4">
                        Self-hosted
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">Bring your own keys</h2>
                    <p className="text-white/60 text-[15px] leading-relaxed mb-8 max-w-2xl">
                        Lyra is self-hosted. You plug in your own credentials and the app runs entirely under your control.
                    </p>
                    <div className="space-y-4">
                        {[
                            { n: 1, t: "Create a Spotify Developer app", b: <>Visit <span className="text-green-300">developer.spotify.com/dashboard</span>, create an app, and copy the Client ID + Secret. Set the redirect URI to your deployment URL.</> },
                            { n: 2, t: "Grab a Gemini API key", b: <>Generate one at <span className="text-green-300">aistudio.google.com/apikey</span>. The free tier is plenty for personal use.</> },
                            { n: 3, t: "Clone the repo and configure", b: <>Clone <span className="text-green-300">folty7/Resonance_AI</span> and follow the setup instructions in the README.</> }
                        ].map((step) => (
                            <div key={step.n} className="rounded-2xl bg-black/30 border border-white/[0.06] p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="h-6 w-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white text-xs flex items-center justify-center font-medium">{step.n}</span>
                                    <h4 className="text-white font-medium text-[15px]">{step.t}</h4>
                                </div>
                                <p className="text-white/55 text-[13px] ml-8">{step.b}</p>
                                {step.n === 3 && (
                                    <pre className="ml-8 mt-3 text-[11px] bg-black/60 border border-white/5 rounded-lg p-3 text-white/70 overflow-x-auto">
                                        {`SPOTIFY_CLIENT_ID=•••••
SPOTIFY_CLIENT_SECRET=•••••
GEMINI_API_KEY=•••••`}
                                    </pre>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section id="contact" className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-10 py-24">
                <div className="text-center mb-10">
                    <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-4">Get in touch</h2>
                    <p className="text-white/50 max-w-xl mx-auto text-[15px]">
                        Questions, partnerships, or press? I'd love to hear from you.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <a
                        href="mailto:foland717@gmail.com"
                        className={`${cardClass} p-6 flex items-start gap-4 group`}
                    >
                        <div className="h-11 w-11 rounded-xl bg-green-500/15 border border-green-400/30 flex items-center justify-center shrink-0 text-xl">
                            ✉️
                        </div>
                        <div>
                            <h3 className="text-white font-medium text-[15px] mb-1">Email</h3>
                            <p className="text-white/60 text-[13px] group-hover:text-green-300 transition-colors">
                                foland717@gmail.com
                            </p>
                        </div>
                    </a>
                    <a
                        href="https://github.com/folty7/Resonance_AI"
                        target="_blank"
                        rel="noreferrer"
                        className={`${cardClass} p-6 flex items-start gap-4 group`}
                    >
                        <div className="h-11 w-11 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center shrink-0 text-xl">
                            🐙
                        </div>
                        <div>
                            <h3 className="text-white font-medium text-[15px] mb-1">GitHub</h3>
                            <p className="text-white/60 text-[13px] group-hover:text-green-300 transition-colors">
                                folty7/Resonance_AI
                            </p>
                        </div>
                    </a>
                </div>
                <form
                    action="mailto:foland717@gmail.com"
                    method="post"
                    encType="text/plain"
                    className={`${cardClass} p-6 sm:p-8 mt-4`}
                >
                    <h3 className="text-white font-medium text-lg mb-5">Or drop a quick message</h3>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                        <input
                            name="name"
                            type="text"
                            required
                            placeholder="Your name"
                            className="h-11 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 text-white placeholder-white/30 focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/30 text-[14px]"
                        />
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="your@email.com"
                            className="h-11 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 text-white placeholder-white/30 focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/30 text-[14px]"
                        />
                    </div>
                    <textarea
                        name="message"
                        required
                        rows={4}
                        placeholder="What's on your mind?"
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/30 text-[14px] resize-none mb-4"
                    />
                    <button
                        type="submit"
                        className="h-11 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 border-0 text-white font-medium text-[14px] px-6 cursor-pointer transition-all"
                    >
                        Send message
                    </button>
                </form>
            </section>

            {/* Final CTA */}
            <section className="relative z-10 w-full max-w-4xl mx-auto px-6 sm:px-10 py-24">
                <div className="rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] p-10 sm:p-16 text-center relative overflow-hidden">
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-60 w-[80%] bg-green-500/30 blur-3xl pointer-events-none" />
                    <div className="relative flex justify-center mb-6">
                        <LyraLogo size={64} />
                    </div>
                    <h2 className="relative text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-3">
                        Ready to curate your library?
                    </h2>
                    <p className="relative text-white/60 mb-8 text-[15px]">
                        Self-hosted, free, and fully open source.
                    </p>
                    <a href={LAUNCH_URL} target="_blank" rel="noreferrer" className="relative inline-block">
                        <button className="h-13 px-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 border-0 text-white shadow-[0_8px_24px_rgba(34,197,94,0.4)] font-medium text-[15px] flex items-center gap-2.5 cursor-pointer transition-all">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                            </svg>
                            View on GitHub
                        </button>
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 py-10 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <LyraLogo size={24} />
                    <span className="text-white/60 text-[13px]">© 2026 Lyra. All rights reserved.</span>
                </div>
                <div className="flex items-center gap-6 text-[12px] text-white/40">
                    <a href={LAUNCH_URL} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
                    <a href="#setup" className="hover:text-white transition-colors">Setup</a>
                    <a href="#contact" className="hover:text-white transition-colors">Contact</a>
                </div>
            </footer>
        </div>
    )
}
