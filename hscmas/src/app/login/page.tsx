import { LoginForm } from './LoginForm'
import { Church, CalendarRange } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

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
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#020617]">
            {/* Sacred Background Image */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
                style={{ 
                    backgroundImage: `url('/_next/image?url=%2Fchurch_background_sacred_1772250001446.png&w=1920&q=75')`,
                }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
            </div>

            <div className="w-full max-w-5xl px-4 sm:px-8 relative z-10 py-12">
                <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-accent to-accent/20 p-[1px] mb-8 shadow-2xl shadow-accent/20 group">
                        <div className="w-full h-full rounded-[2.45rem] bg-background/90 flex items-center justify-center backdrop-blur-sm overflow-hidden p-2">
                            <img 
                                src="/images/MINISTRY OF ALTAR SERVER - HSC.png" 
                                alt="MAS-HSC Logo" 
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
                            Ministry of Altar Servers <br /> Holy Spirit Chapel
                        </h1>
                        <p className="text-accent font-semibold uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                            Management Portal
                        </p>
                    </div>
                </div>

                <div className={`grid gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 ${activeSchedule ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-md mx-auto'}`}>
                    {/* Login Card */}
                    <div className="bg-background/95 border border-accent/20 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl h-fit">
                        <div className="mb-8 text-center">
                            <h2 className="text-xl font-bold text-foreground">Welcome Back</h2>
                            <p className="text-muted-foreground text-sm mt-1 italic">"Once a Knight, Forever a Knight"</p>
                        </div>
                        
                        <LoginForm />

                        <div className="pt-8 text-center space-y-4">
                            <div className="flex items-center gap-4 justify-center">
                                <div className="h-[1px] w-8 bg-border"></div>
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Holy Spirit Chapel</span>
                                <div className="h-[1px] w-8 bg-border"></div>
                            </div>
                            <p className="text-[10px] text-muted-foreground/60 leading-relaxed font-medium">
                                Copyright © 2026 All Rights Reserved <br />
                                HSC-MAS
                            </p>
                        </div>
                    </div>

                    {/* Active Schedule Display */}
                    {activeSchedule && (
                        <div className="bg-background/95 border border-accent/20 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl">
                            <div className="mb-6 text-center">
                                <div className="inline-flex items-center justify-center gap-2 mb-2">
                                    <CalendarRange className="w-5 h-5 text-accent" />
                                    <h2 className="text-lg font-bold text-foreground">{activeSchedule.title}</h2>
                                </div>
                                <p className="text-muted-foreground text-xs font-medium">
                                    {new Date(activeSchedule.effective_from).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    {' — '}
                                    {new Date(activeSchedule.effective_to).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(weekNum => {
                                    const weekKey = `week_${weekNum}`
                                    const scheduleData = activeSchedule.weeks as any
                                    const weekServers = scheduleData?.[weekKey] || []
                                    
                                    if (!Array.isArray(weekServers) || weekServers.length === 0) return null
                                    
                                    return (
                                        <div key={weekNum} className="p-4 bg-foreground/5 rounded-2xl border border-border/30">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">
                                                Week {weekNum}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {weekServers.map((id: string, i: number) => {
                                                    const name = serverMap[id.toString()]
                                                    return (
                                                        <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-xl bg-accent/10 text-accent border border-accent/20 text-xs font-bold">
                                                            {name || 'Server'}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <p className="text-center text-[10px] text-muted-foreground/60 mt-6 italic font-medium">
                                "Serve the Lord with gladness" — Psalm 100:2
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

