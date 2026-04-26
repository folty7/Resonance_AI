import { useState } from "react"
import { Eye, EyeOff, Check, Trash2, ExternalLink, Key, Shield, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getStoredGeminiKey, setStoredGeminiKey } from "@/api/axios"

export default function Settings() {
    const [keyInput, setKeyInput] = useState(getStoredGeminiKey())
    const [savedKey, setSavedKey] = useState(getStoredGeminiKey())
    const [reveal, setReveal] = useState(false)
    const [savedFlash, setSavedFlash] = useState(false)

    const handleSave = () => {
        const trimmed = keyInput.trim()
        setStoredGeminiKey(trimmed)
        setSavedKey(trimmed)
        setSavedFlash(true)
        setTimeout(() => setSavedFlash(false), 2000)
    }

    const handleClear = () => {
        setStoredGeminiKey("")
        setKeyInput("")
        setSavedKey("")
    }

    const masked = savedKey ? `${savedKey.slice(0, 4)}…${savedKey.slice(-4)}` : null

    return (
        <div>
            <div className="mb-6">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40 mb-1">Settings</p>
                <h2 className="text-3xl font-medium tracking-tight">Preferences</h2>
                <p className="text-sm text-white/50 mt-1">
                    Personalize Lyra. All settings are stored locally in your browser.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Gemini API Key */}
                <div className="lg:col-span-7 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.06] p-6">
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <Key className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-xl font-medium">Gemini API key</h3>
                        {savedKey && (
                            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-emerald-400">
                                <Check className="w-3 h-3" /> Active
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-white/55 leading-relaxed mb-5">
                        Use your own free Gemini key for unlimited AI Sorts. Without a personal key, Lyra
                        falls back to the server's shared key (limited).
                    </p>

                    <p className="text-[11px] uppercase tracking-[0.15em] text-white/40 mb-2">Your key</p>
                    <div className="relative mb-2">
                        <input
                            type={reveal ? 'text' : 'password'}
                            value={keyInput}
                            onChange={e => setKeyInput(e.target.value)}
                            placeholder="AIza…"
                            spellCheck={false}
                            autoComplete="off"
                            className="w-full h-11 pl-4 pr-12 bg-white/[0.04] border border-white/[0.06] rounded-full text-sm font-mono placeholder-white/30 focus:outline-none focus:border-green-500/40 focus:ring-1 focus:ring-green-500/30"
                        />
                        <button
                            type="button"
                            onClick={() => setReveal(r => !r)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-white/[0.06] flex items-center justify-center text-white/50"
                            title={reveal ? 'Hide' : 'Show'}
                        >
                            {reveal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                    {masked && (
                        <p className="text-[11px] text-white/40 mb-4">
                            Saved key: <span className="font-mono text-white/60">{masked}</span>
                        </p>
                    )}

                    <div className="flex gap-2 mt-3">
                        <Button
                            onClick={handleSave}
                            disabled={keyInput.trim() === savedKey}
                            className="h-10 px-5 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:opacity-50 text-white text-sm font-medium border-0"
                        >
                            {savedFlash ? 'Saved!' : 'Save key'}
                        </Button>
                        {savedKey && (
                            <button
                                onClick={handleClear}
                                className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/[0.06] hover:bg-rose-500/15 hover:border-rose-400/30 hover:text-rose-200 text-white/70 text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove
                            </button>
                        )}
                    </div>

                    <div className="mt-6 pt-5 border-t border-white/[0.06]">
                        <p className="flex items-center gap-2 text-[12px] text-white/60 mb-2">
                            <Shield className="w-3.5 h-3.5 text-emerald-400" />
                            Your key never leaves your browser except as a request header to Lyra's backend, which
                            forwards it directly to Google for that one Gemini call. It's never logged or persisted server-side.
                        </p>
                    </div>
                </div>

                {/* Guide */}
                <div className="lg:col-span-5 space-y-5">
                    <div className="rounded-3xl bg-gradient-to-b from-green-500/10 to-green-600/[0.02] border border-green-400/25 p-6">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-base font-medium">How to get a Gemini key</h3>
                        </div>
                        <ol className="space-y-3 text-sm text-white/70 leading-relaxed">
                            <li className="flex gap-3">
                                <span className="shrink-0 w-6 h-6 rounded-full bg-green-500/20 border border-green-400/40 text-green-200 text-xs flex items-center justify-center font-medium">1</span>
                                <span>
                                    Open Google AI Studio:&nbsp;
                                    <a
                                        href="https://aistudio.google.com/apikey"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-green-300 hover:text-green-200 underline underline-offset-2"
                                    >
                                        aistudio.google.com/apikey <ExternalLink className="w-3 h-3" />
                                    </a>
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <span className="shrink-0 w-6 h-6 rounded-full bg-green-500/20 border border-green-400/40 text-green-200 text-xs flex items-center justify-center font-medium">2</span>
                                <span>Sign in with Google and click <strong className="text-white">Create API key</strong>. Pick any project (or let it create one).</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="shrink-0 w-6 h-6 rounded-full bg-green-500/20 border border-green-400/40 text-green-200 text-xs flex items-center justify-center font-medium">3</span>
                                <span>Copy the key (it starts with <code className="text-white/80 bg-white/[0.06] px-1.5 py-0.5 rounded text-[11px]">AIza…</code>) and paste it on the left.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="shrink-0 w-6 h-6 rounded-full bg-green-500/20 border border-green-400/40 text-green-200 text-xs flex items-center justify-center font-medium">4</span>
                                <span>Click <strong className="text-white">Save key</strong>. Lyra now uses your key for every AI Sort.</span>
                            </li>
                        </ol>
                        <p className="text-[11px] text-white/45 mt-4 pt-4 border-t border-white/[0.06]">
                            The free tier covers many sorts per day. Lyra uses <code className="text-white/70 bg-white/[0.06] px-1 rounded">gemini-2.5-flash-lite</code> by default, the cheapest model.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5">
                        <h4 className="text-sm font-medium mb-2">About data &amp; privacy</h4>
                        <ul className="space-y-1.5 text-[12px] text-white/55 leading-relaxed">
                            <li>• Your saved playlists live in browser storage, not on our servers.</li>
                            <li>• Spotify access is read-only for your library; write-only for playlists you push.</li>
                            <li>• Your API key is sent per-request as a header and never stored server-side.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
