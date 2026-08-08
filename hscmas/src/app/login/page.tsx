import { LoginForm } from './LoginForm'
import { CalendarRange, Sparkles, BookOpen, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
    title: 'Login | Ministry of Altar Servers - Holy Spirit Chapel',
    description: 'Management Portal for the Ministry of Altar Servers at Holy Spirit Chapel',
}

export default async function LoginPage() {
    const supabase = await createClient()

    // 1. Fetch active schedule (using maybeSingle to avoid errors)
    const { data: activeSchedule } = await supabase
        .from('server_schedules')
        .select('*')
        .eq('is_active', true)
        .maybeSingle()

    // 2. Fetch all servers for display if we have an active schedule
    let serverMap: Record<string, string> = {}
    if (activeSchedule) {
        const { data: allServers } = await supabase
            .from('servers')
            .select('id, first_name, last_name')
        
        allServers?.forEach(s => {
            serverMap[s.id] = `${s.first_name} ${s.last_name}`
        });

        // Ensure weeks is an object (in case it comes back as string)
        if (typeof activeSchedule.weeks === 'string') {
            try {
                activeSchedule.weeks = JSON.parse(activeSchedule.weeks)
            } catch (e) {
                console.error("Failed to parse weeks:", e)
            }
        }
    }

    return (
        <main className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#020617] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
            {/* Ambient Lighting FX */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(212,175,55,0.18),rgba(2,6,23,0))] pointer-events-none z-0" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-600/5 rounded-full blur-3xl pointer-events-none z-0" />

            {/* Sacred Background Image Overlay */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105 opacity-35"
                style={{ 
                    backgroundImage: `url('/_next/image?url=%2Fchurch_background_sacred_1772250001446.png&w=1920&q=75')`,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/90 via-[#020617]/75 to-[#020617]/95 backdrop-blur-[2px]" />
            </div>

            <div className="w-full max-w-5xl px-4 sm:px-8 relative z-10 py-10 sm:py-16">
                {/* Header / Crest Branding */}
                <div className="text-center mb-10 sm:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-[2.5rem] bg-gradient-to-br from-amber-400/40 via-amber-500/20 to-amber-600/10 p-[1.5px] mb-6 shadow-2xl shadow-amber-500/20 group backdrop-blur-md">
                        <div className="w-full h-full rounded-[2.4rem] bg-slate-950/80 flex items-center justify-center backdrop-blur-sm overflow-hidden p-3 border border-amber-500/30 group-hover:border-amber-400/60 transition-colors duration-500">
                            <img 
                                src="/images/MINISTRY OF ALTAR SERVER - HSC.png" 
                                alt="MAS-HSC Crest Logo" 
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2 max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Management Portal</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-100 drop-shadow-sm leading-tight">
                            Ministry of Altar Servers
                        </h1>
                        <p className="text-sm sm:text-base text-slate-400 font-medium">
                            Holy Spirit Chapel
                        </p>
                    </div>
                </div>

                {/* Main Content Layout Grid */}
                <div className={`grid gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 ${activeSchedule ? 'grid-cols-1 lg:grid-cols-2 items-start' : 'grid-cols-1 max-w-md mx-auto'}`}>
                    
                    {/* Card 1: Login Form Container */}
                    <section aria-labelledby="login-heading" className="bg-slate-900/80 border border-amber-500/20 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-black/80 backdrop-blur-xl relative overflow-hidden group">
                        {/* Top Subtle Accent Border Glow */}
                        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

                        <div className="mb-8 text-center space-y-1">
                            <h2 id="login-heading" className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="text-amber-400/90 text-xs sm:text-sm italic font-serif">
                                &ldquo;Once a Knight, Forever a Knight&rdquo;
                            </p>
                        </div>
                        
                        <LoginForm />

                        <div className="pt-8 mt-2 text-center space-y-4 border-t border-slate-800/80">
                            <div className="flex items-center gap-4 justify-center">
                                <div className="h-[1px] w-8 bg-slate-800"></div>
                                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Holy Spirit Chapel</span>
                                <div className="h-[1px] w-8 bg-slate-800"></div>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                Copyright © 2026 All Rights Reserved <br />
                                Ministry of Altar Servers — HSC
                            </p>
                        </div>
                    </section>

                    {/* Card 2: Active Serving Schedule Display */}
                    {activeSchedule && (
                        <section aria-labelledby="schedule-heading" className="bg-slate-900/80 border border-amber-500/20 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-black/80 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
                            {/* Top Subtle Accent Border Glow */}
                            <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

                            <div>
                                <div className="mb-6 text-center">
                                    <div className="inline-flex items-center justify-center gap-2 mb-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                        <CalendarRange className="w-4 h-4 text-amber-400" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Active Serving Schedule</span>
                                    </div>
                                    <h2 id="schedule-heading" className="text-lg sm:text-xl font-bold text-slate-100">
                                        {activeSchedule.title}
                                    </h2>
                                    <p className="text-slate-400 text-xs font-medium mt-1 flex items-center justify-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span>
                                            {new Date(activeSchedule.effective_from).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            {' — '}
                                            {new Date(activeSchedule.effective_to).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </p>
                                </div>

                                <div className="space-y-3.5">
                                    {[1, 2, 3, 4, 5].map(weekNum => {
                                        const weekKey = `week_${weekNum}`
                                        const scheduleData = activeSchedule.weeks as any
                                        const weekServers = scheduleData?.[weekKey] || []
                                        
                                        if (!Array.isArray(weekServers) || weekServers.length === 0) return null
                                        
                                        return (
                                            <div 
                                                key={weekNum} 
                                                className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-amber-500/30 transition-colors duration-300"
                                            >
                                                <div className="flex items-center justify-between mb-2.5">
                                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-md">
                                                        Week {weekNum}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {weekServers.length} {weekServers.length === 1 ? 'Server' : 'Servers'} Assigned
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {weekServers.map((id: string, i: number) => {
                                                        const name = serverMap[id.toString()]
                                                        return (
                                                            <span 
                                                                key={i} 
                                                                className="inline-flex items-center px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/25 text-xs font-semibold hover:bg-amber-500/20 hover:border-amber-400/40 transition-all duration-200"
                                                            >
                                                                {name || 'Server'}
                                                            </span>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t border-slate-800/80 text-center">
                                <p className="text-[11px] text-slate-400 italic font-serif flex items-center justify-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-amber-400/80" />
                                    <span>&ldquo;Serve the Lord with gladness&rdquo; — Psalm 100:2</span>
                                </p>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </main>
    )
}
