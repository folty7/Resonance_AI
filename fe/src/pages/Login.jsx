import { Button } from "@/components/ui/button"

export default function Login() {
    return (
        <div className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center p-6 overflow-hidden">

            {/* Abstract Glowing Accent Orbs in Background */}
            <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

            {/* Main Glass Container */}
            <div className="z-10 flex flex-col items-center max-w-md w-full glass-panel-heavy rounded-[2.5rem] p-10 sm:p-14 text-center">

                {/* Soft Icon/Avatar Area */}
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full glass-panel shadow-lg border border-white/20">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-10 w-10 text-white/90"
                    >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                </div>

                <div className="space-y-3 mb-12 w-full">
                    <h1 className="text-4xl font-semibold tracking-tight text-white shadow-sm">
                        Resonance AI
                    </h1>
                    <p className="text-[15px] font-light leading-relaxed text-blue-100/60 mt-4 px-2">
                        Organize your audio universe. Effortlessly categorize your library with pure intelligence.
                    </p>
                </div>

                <a href="http://127.0.0.1:8080/auth/login" className="w-full">
                    <Button
                        size="lg"
                        className="w-full h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-300 font-medium tracking-wide text-[15px]"
                    >
                        Connect Spotify
                    </Button>
                </a>
            </div>
        </div>
    )
}
