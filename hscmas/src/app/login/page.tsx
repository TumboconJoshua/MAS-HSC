import { LoginForm } from './LoginForm'
import { CalendarRange, Sparkles, BookOpen, Clock, ShieldCheck, Church, Users, ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
    title: 'Ministry of Altar Servers | Holy Spirit Chapel',
    description: 'Official Portal and Serving Roster for the Ministry of Altar Servers at Holy Spirit Chapel',
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
        })

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
        <div className="min-h-screen w-full bg-[#faf8f5] text-slate-900 selection:bg-amber-500/30 selection:text-amber-900 scroll-smooth relative font-sans">
            
            {/* Ambient Warm Ivory & Gold Lighting FX */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(212,175,55,0.18),rgba(250,248,245,0))] pointer-events-none z-10" />
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none z-10" />
            <div className="fixed top-1/3 left-0 w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-3xl pointer-events-none z-10" />

            {/* Sacred Background Image Overlay */}
            <div 
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105 opacity-75 pointer-events-none"
                style={{ 
                    backgroundImage: `url('/images/HSC%20MAS.jpg')`,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-white/65 via-white/50 to-[#faf8f5]/90 backdrop-blur-[1px]" />
            </div>

            {/* Sticky Navigation Header */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-amber-200/70 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    
                    {/* Brand Logo & Name */}
                    <a href="#hero" className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl p-1">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400/40 via-amber-500/20 to-transparent p-[1px] shadow-sm">
                            <div className="w-full h-full rounded-[15px] bg-white flex items-center justify-center p-1.5 border border-amber-300/80 group-hover:border-amber-500 transition-colors">
                                <img 
                                    src="/images/MINISTRY OF ALTAR SERVER - HSC.png" 
                                    alt="MAS-HSC Crest Logo" 
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform" 
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 group-hover:text-amber-700 transition-colors">
                                    MAS — HSC
                                </span>
                                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 border border-amber-300/80 text-amber-900 rounded-full">
                                    Official
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium hidden sm:block">
                                Ministry of Altar Servers • Holy Spirit Chapel
                            </p>
                        </div>
                    </a>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-1 bg-amber-50/80 border border-amber-200/80 rounded-full p-1.5 backdrop-blur-md shadow-xs">
                        <a 
                            href="#hero" 
                            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-amber-900 hover:bg-white/80 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        >
                            Home
                        </a>
                        <a 
                            href="#pillars" 
                            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-amber-900 hover:bg-white/80 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        >
                            Ministry Pillars
                        </a>
                        <a 
                            href="#schedule" 
                            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-amber-900 hover:bg-white/80 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        >
                            Serving Schedule
                        </a>
                        <a 
                            href="#login" 
                            className="px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100/70 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        >
                            Portal Sign In
                        </a>
                    </nav>

                    {/* Member Login Direct Action Button */}
                    <div className="flex items-center gap-3">
                        <a 
                            href="#login" 
                            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-md shadow-amber-600/20 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        >
                            <span>Member Login</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content Body */}
            <main className="relative z-20">
                
                {/* 1. HERO SECTION */}
                <section id="hero" className="min-h-[calc(100vh-5rem)] flex items-center justify-center relative px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 p-6 sm:p-12 rounded-[2.5rem] bg-white/50 border border-amber-200/60 backdrop-blur-md shadow-xl shadow-amber-950/5">
                        
                        {/* Sacred Crest Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-900 text-xs font-bold uppercase tracking-widest backdrop-blur-md shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                            <span>Holy Spirit Chapel</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] sm:leading-[1.15]">
                            Serving at the Altar of the Lord with{' '}
                            <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent drop-shadow-xs">
                                Reverence & Excellence
                            </span>
                        </h1>

                        {/* Motto Subtitle */}
                        <div className="space-y-2">
                            <p className="text-lg sm:text-2xl font-serif italic text-amber-800 font-medium">
                                &ldquo;Once a Knight, Forever a Knight&rdquo;
                            </p>
                            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
                                Dedicated to sacred liturgy, spiritual development, disciplined service, and vibrant fellowship among the youth of Holy Spirit Chapel.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
                            <a 
                                href="#login"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-xl shadow-amber-600/25 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[48px]"
                            >
                                <span>Sign In to Member Portal</span>
                                <ArrowRight className="w-4 h-4" />
                            </a>

                            <a 
                                href="#schedule"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-sm font-semibold text-slate-800 bg-white hover:bg-amber-50/60 border border-amber-300/80 hover:border-amber-400 shadow-sm backdrop-blur-md active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 min-h-[48px]"
                            >
                                <CalendarRange className="w-4 h-4 text-amber-700" />
                                <span>View Active Schedule</span>
                            </a>
                        </div>

                        {/* Scroll Down Indicator */}
                        <div className="pt-12 flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
                            <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-2">Explore Ministry</span>
                            <ChevronDown className="w-4 h-4 text-amber-600 animate-bounce" />
                        </div>
                    </div>
                </section>

                {/* 2. MINISTRY PILLARS SECTION */}
                <section id="pillars" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative border-t border-amber-200/60">
                    <div className="text-center space-y-3 mb-14">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/70 text-amber-900 text-xs font-bold uppercase tracking-widest">
                            <Church className="w-3.5 h-3.5 text-amber-700" />
                            <span>Core Values</span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Our Liturgical Calling & Pillars
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
                            The foundation of our ministry guides every server in faith, duty, and community.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        {/* Pillar 1 */}
                        <div className="p-6 rounded-3xl bg-white/90 border border-amber-200/80 hover:border-amber-400 backdrop-blur-xl shadow-lg shadow-amber-950/5 hover:shadow-amber-600/15 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-300/70 flex items-center justify-center text-amber-700 mb-5 group-hover:scale-110 transition-transform">
                                <Church className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Sacred Service</h3>
                            <p className="text-slate-600 text-xs leading-relaxed">
                                Assisting at Holy Mass, Eucharistic celebrations, and parish sacraments with utmost reverence, dignity, and devotion.
                            </p>
                        </div>

                        {/* Pillar 2 */}
                        <div className="p-6 rounded-3xl bg-white/90 border border-amber-200/80 hover:border-amber-400 backdrop-blur-xl shadow-lg shadow-amber-950/5 hover:shadow-amber-600/15 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-300/70 flex items-center justify-center text-amber-700 mb-5 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Liturgical Formation</h3>
                            <p className="text-slate-600 text-xs leading-relaxed">
                                Continuous training in Catholic rites, sacred vestments, sanctuary duties, and deep understanding of the Holy Eucharist.
                            </p>
                        </div>

                        {/* Pillar 3 */}
                        <div className="p-6 rounded-3xl bg-white/90 border border-amber-200/80 hover:border-amber-400 backdrop-blur-xl shadow-lg shadow-amber-950/5 hover:shadow-amber-600/15 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-300/70 flex items-center justify-center text-amber-700 mb-5 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Knights Brotherhood</h3>
                            <p className="text-slate-600 text-xs leading-relaxed">
                                Building strong camaraderie, youth leadership, responsibility, and lifelong friendships among all altar servers.
                            </p>
                        </div>

                        {/* Pillar 4 */}
                        <div className="p-6 rounded-3xl bg-white/90 border border-amber-200/80 hover:border-amber-400 backdrop-blur-xl shadow-lg shadow-amber-950/5 hover:shadow-amber-600/15 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100/80 border border-amber-300/70 flex items-center justify-center text-amber-700 mb-5 group-hover:scale-110 transition-transform">
                                <CalendarRange className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Digital Roster</h3>
                            <p className="text-slate-600 text-xs leading-relaxed">
                                Automated digital schedule management, fair week rotation, and streamlined server attendance tracking.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. ACTIVE SERVING SCHEDULE SECTION */}
                <section id="schedule" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative border-t border-amber-200/60">
                    <div className="text-center space-y-3 mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/70 text-amber-900 text-xs font-bold uppercase tracking-widest">
                            <CalendarRange className="w-3.5 h-3.5 text-amber-700" />
                            <span>Chapel Serving Roster</span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Active Serving Schedule
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
                            Check server assignments and mass rotations for the current schedule period.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        {activeSchedule ? (
                            <div className="bg-white/90 border border-amber-200/80 rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-amber-950/5 backdrop-blur-xl relative overflow-hidden">
                                {/* Accent Border Glow */}
                                <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

                                <div className="mb-8 text-center space-y-2">
                                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                                        {activeSchedule.title}
                                    </h3>
                                    <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-slate-700 text-xs font-medium shadow-xs">
                                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                                        <span>
                                            {new Date(activeSchedule.effective_from).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            {' — '}
                                            {new Date(activeSchedule.effective_to).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map(weekNum => {
                                        const weekKey = `week_${weekNum}`
                                        const scheduleData = activeSchedule.weeks as any
                                        const weekServers = scheduleData?.[weekKey] || []
                                        
                                        if (!Array.isArray(weekServers) || weekServers.length === 0) return null
                                        
                                        return (
                                            <div 
                                                key={weekNum} 
                                                className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/70 hover:border-amber-400/60 transition-colors duration-300"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-900 bg-amber-100/90 border border-amber-300/80 px-3 py-1 rounded-lg">
                                                        Week {weekNum}
                                                    </span>
                                                    <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                                                        <span>{weekServers.length} {weekServers.length === 1 ? 'Server' : 'Servers'} Assigned</span>
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2.5">
                                                    {weekServers.map((id: string, i: number) => {
                                                        const name = serverMap[id.toString()]
                                                        return (
                                                            <span 
                                                                key={i} 
                                                                className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-white text-amber-950 border border-amber-300/70 text-xs font-semibold shadow-xs hover:bg-amber-100/80 transition-all"
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

                                <div className="mt-8 pt-6 border-t border-amber-200/80 text-center">
                                    <p className="text-xs text-slate-600 italic font-serif flex items-center justify-center gap-2">
                                        <BookOpen className="w-4 h-4 text-amber-700" />
                                        <span>&ldquo;Serve the Lord with gladness&rdquo; — Psalm 100:2</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Empty State Fallback */
                            <div className="bg-white/90 border border-amber-200/80 rounded-[2.5rem] p-10 text-center space-y-4 backdrop-blur-xl shadow-xl shadow-amber-950/5">
                                <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border border-amber-300/80 flex items-center justify-center text-amber-700">
                                    <CalendarRange className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">No Active Roster Published</h3>
                                <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto">
                                    The active serving schedule is currently being prepared by ministry coordinators. Please sign in to access portal management.
                                </p>
                                <div className="pt-2">
                                    <a 
                                        href="#login" 
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/20"
                                    >
                                        <span>Go to Portal Login</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* 4. MEMBER PORTAL SIGN IN SECTION */}
                <section id="login" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative border-t border-amber-200/60">
                    <div className="max-w-md mx-auto space-y-8">
                        
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/80 border border-amber-300/70 text-amber-900 text-xs font-bold uppercase tracking-widest">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                                <span>Portal Access</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Member Sign In
                            </h2>
                            <p className="text-slate-600 text-xs sm:text-sm">
                                Enter your registered credentials to access your server dashboard.
                            </p>
                        </div>

                        {/* Login Form Container Card */}
                        <div className="bg-white/95 border border-amber-200/90 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-amber-950/10 backdrop-blur-xl relative overflow-hidden group">
                            {/* Top Accent Border Glow */}
                            <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

                            <div className="mb-6 text-center space-y-1">
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                                    Welcome Back, Knight
                                </h3>
                                <p className="text-amber-800 text-xs italic font-serif">
                                    Holy Spirit Chapel • Altar Server Portal
                                </p>
                            </div>
                            
                            <LoginForm />

                            <div className="pt-6 mt-4 text-center space-y-3 border-t border-slate-200">
                                <div className="flex items-center gap-3 justify-center">
                                    <div className="h-[1px] w-6 bg-slate-300" />
                                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">MAS — HSC</span>
                                    <div className="h-[1px] w-6 bg-slate-300" />
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium">
                                    Holy Spirit Chapel Ministry of Altar Servers
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Structured Footer */}
            <footer className="w-full bg-slate-950 border-t border-slate-800 relative z-20 py-12 px-4 sm:px-6 lg:px-8 text-slate-400 text-xs">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <img 
                            src="/images/MINISTRY OF ALTAR SERVER - HSC.png" 
                            alt="MAS Crest" 
                            className="w-8 h-8 object-contain"
                        />
                        <div>
                            <span className="font-bold text-slate-200 block text-sm">
                                Ministry of Altar Servers
                            </span>
                            <span className="text-slate-400 text-[11px]">
                                Holy Spirit Chapel
                            </span>
                        </div>
                    </div>

                    {/* Footer Nav */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-xs">
                        <a href="#hero" className="hover:text-amber-400 transition-colors">Home</a>
                        <a href="#pillars" className="hover:text-amber-400 transition-colors">Pillars</a>
                        <a href="#schedule" className="hover:text-amber-400 transition-colors">Schedule</a>
                        <a href="#login" className="hover:text-amber-400 transition-colors">Portal Login</a>
                    </div>

                    {/* Copyright */}
                    <div className="text-center md:text-right text-[11px] text-slate-400">
                        <p>Copyright © 2026 All Rights Reserved.</p>
                        <p className="text-slate-400 mt-0.5">Ministry of Altar Servers — HSC</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

