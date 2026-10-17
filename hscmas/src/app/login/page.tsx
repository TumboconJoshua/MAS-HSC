import Image from 'next/image'
import { LoginForm } from './LoginForm'
import { ArrowRight, BookOpen, CalendarDays, Church, Clock3, ShieldCheck, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
    title: 'Ministry of Altar Servers | Holy Spirit Chapel',
    description: 'Official Portal and Serving Roster for the Ministry of Altar Servers at Holy Spirit Chapel',
}

type ScheduleWeeks = Record<string, string[]>

const pillars = [
    {
        title: 'Sacred service',
        description: 'Assist at the altar with attention, dignity, and prayerful discipline.',
        icon: Church,
    },
    {
        title: 'Liturgical formation',
        description: 'Learn the rites, vestments, and responsibilities entrusted to every server.',
        icon: BookOpen,
    },
    {
        title: 'Brotherhood',
        description: 'Grow in accountability, leadership, and fellowship with the ministry.',
        icon: Users,
    },
    {
        title: 'Faithful stewardship',
        description: 'Honor each assignment and help the chapel serve with order and care.',
        icon: ShieldCheck,
    },
]

function readScheduleWeeks(value: unknown): ScheduleWeeks {
    let parsed = value

    if (typeof value === 'string') {
        try {
            parsed = JSON.parse(value)
        } catch {
            return {}
        }
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    return Object.fromEntries(
        Object.entries(parsed).filter((entry): entry is [string, string[]] => (
            Array.isArray(entry[1]) && entry[1].every(id => typeof id === 'string')
        )),
    )
}

export default async function LoginPage() {
    const supabase = await createClient()
    const { data: activeSchedule } = await supabase
        .from('server_schedules')
        .select('*')
        .eq('is_active', true)
        .maybeSingle()

    const scheduleWeeks = readScheduleWeeks(activeSchedule?.weeks)
    const assignedIds = Object.values(scheduleWeeks).flat()
    const serverMap: Record<string, string> = {}

    if (assignedIds.length > 0) {
        const { data: assignedServers } = await supabase
            .from('servers')
            .select('id, first_name, last_name')
            .in('id', assignedIds)

        assignedServers?.forEach(server => {
            serverMap[server.id] = `${server.first_name} ${server.last_name}`
        })
    }

    const scheduledWeeks = [1, 2, 3, 4, 5]
        .map(weekNumber => ({
            weekNumber,
            servers: scheduleWeeks[`week_${weekNumber}`] || [],
        }))
        .filter(week => week.servers.length > 0)

    return (
        <div className="min-h-[100dvh] overflow-x-hidden bg-[#f1f0eb] text-[#17202a] selection:bg-[#d4af37]/35 [color-scheme:light]">
            <header className="sticky top-0 z-30 border-b border-[#17202a]/10 bg-[#f1f0eb]/92 backdrop-blur-xl">
                <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <a
                        href="#hero"
                        className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
                    >
                        <Image
                            src="/images/MINISTRY OF ALTAR SERVER - HSC.png"
                            alt="MAS-HSC crest"
                            width={44}
                            height={44}
                            className="h-11 w-11 object-contain"
                            priority
                        />
                        <div className="leading-tight">
                            <span className="block text-sm font-bold tracking-tight">MAS-HSC</span>
                            <span className="hidden text-[11px] text-slate-600 sm:block">
                                Holy Spirit Chapel
                            </span>
                        </div>
                    </a>

                    <nav aria-label="Primary navigation" className="hidden items-center gap-7 text-sm text-slate-600 md:flex">
                        <a className="transition-colors hover:text-[#85620f] focus-visible:text-[#85620f] focus-visible:underline focus-visible:underline-offset-4" href="#hero">Home</a>
                        <a className="transition-colors hover:text-[#85620f] focus-visible:text-[#85620f] focus-visible:underline focus-visible:underline-offset-4" href="#schedule">Schedule</a>
                        <a className="transition-colors hover:text-[#85620f] focus-visible:text-[#85620f] focus-visible:underline focus-visible:underline-offset-4" href="#pillars">Our service</a>
                    </nav>

                    <a
                        href="#login"
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#d4af37] px-4 text-sm font-bold text-[#111820] transition-transform active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1f0eb]"
                    >
                        Sign in
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                </div>
            </header>

            <main>
                <section id="hero" className="grid min-h-[calc(100dvh-72px)] lg:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
                    <div className="relative min-h-[360px] overflow-hidden bg-[#e8e6df] sm:min-h-[500px] lg:min-h-[calc(100dvh-72px)]">
                        <Image
                            src="/images/HSC MAS.jpg"
                            alt=""
                            fill
                            aria-hidden="true"
                            sizes="(min-width: 1024px) 60vw, 100vw"
                            className="scale-110 object-cover object-center opacity-30 blur-2xl saturate-75"
                        />
                        <Image
                            src="/images/HSC MAS.jpg"
                            alt="Altar servers of Holy Spirit Chapel"
                            fill
                            priority
                            sizes="(min-width: 1024px) 60vw, 100vw"
                            className="object-contain object-center"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(241,240,235,0.62)_0%,rgba(241,240,235,0.08)_32%,rgba(8,12,16,0.30)_55%,rgba(8,12,16,0.92)_100%)]" />
                        <div className="absolute inset-x-0 bottom-0 p-6 text-[#f6f2e8] motion-safe:animate-fade-in sm:p-10 lg:p-14">
                            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#e3c760]">
                                Holy Spirit Chapel
                            </p>
                            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                                Called to serve. Formed in reverence.
                            </h1>
                            <p className="mt-5 max-w-lg text-sm leading-6 text-slate-200 sm:text-base">
                                The official ministry portal for service, formation, attendance, and the active altar roster.
                            </p>
                            <p className="mt-8 border-l border-[#d4af37] pl-4 text-sm italic text-[#e8ddba]">
                                Once a Knight, Forever a Knight
                            </p>
                        </div>
                    </div>

                    <div id="login" className="flex scroll-mt-[72px] items-center border-l border-[#17202a]/10 bg-[#e8e6df] px-5 py-14 sm:px-10 lg:px-12">
                        <div className="mx-auto w-full max-w-md motion-safe:animate-fade-in">
                            <div className="mb-9 border-t-2 border-[#d4af37] pt-7">
                                <p className="text-sm font-semibold text-[#85620f]">Member portal</p>
                                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">Enter with purpose.</h2>
                                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
                                    Sign in with your registered ministry account to continue to the dashboard.
                                </p>
                            </div>
                            <LoginForm />
                        </div>
                    </div>
                </section>

                <section id="schedule" className="scroll-mt-[72px] border-t border-[#17202a]/10 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
                        <div>
                            <CalendarDays className="h-8 w-8 text-[#9a7717]" strokeWidth={1.5} aria-hidden="true" />
                            <h2 className="mt-6 max-w-sm text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">
                                The active serving roster
                            </h2>
                            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
                                Review the current assignments before each scheduled week of service.
                            </p>
                        </div>

                        {activeSchedule ? (
                            <div className="border-t border-[#17202a]">
                                <div className="grid gap-4 border-b border-[#17202a]/15 py-6 sm:grid-cols-[1fr_auto] sm:items-end">
                                    <div>
                                        <h3 className="text-xl font-semibold sm:text-2xl">{activeSchedule.title}</h3>
                                        <p className="mt-1 text-sm text-slate-600">Official ministry assignment</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Clock3 className="h-4 w-4 text-[#9a7717]" strokeWidth={1.5} aria-hidden="true" />
                                        <time dateTime={activeSchedule.effective_from}>
                                            {new Date(`${activeSchedule.effective_from}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </time>
                                        <span aria-hidden="true">to</span>
                                        <time dateTime={activeSchedule.effective_to}>
                                            {new Date(`${activeSchedule.effective_to}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </time>
                                    </div>
                                </div>

                                {scheduledWeeks.length > 0 ? (
                                    <div>
                                        {scheduledWeeks.map(week => (
                                            <div key={week.weekNumber} className="grid gap-3 border-b border-[#17202a]/15 py-6 sm:grid-cols-[130px_1fr]">
                                                <div className="text-sm font-semibold text-[#85620f]">
                                                    Week {week.weekNumber}
                                                </div>
                                                <ul className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                                                    {week.servers.map(serverId => (
                                                        <li key={serverId} className="text-slate-700">
                                                            {serverMap[serverId] || 'Server'}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="border-b border-[#17202a]/15 py-8 text-sm text-slate-600">
                                        This schedule does not have published assignments yet.
                                    </p>
                                )}

                                <p className="mt-6 text-sm italic text-slate-600">
                                    &ldquo;Serve the Lord with gladness.&rdquo; Psalm 100:2
                                </p>
                            </div>
                        ) : (
                            <div className="border-t border-[#17202a] py-8">
                                <h3 className="text-2xl font-semibold">No active roster published</h3>
                                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                                    Ministry coordinators are preparing the next serving schedule. Members can sign in for portal access.
                                </p>
                                <a href="#login" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#85620f] hover:text-[#6f5410]">
                                    Sign in
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </a>
                            </div>
                        )}
                    </div>
                </section>

                <section id="pillars" className="scroll-mt-[72px] border-t border-[#17202a]/10 bg-[#e8e6df] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-24">
                        <div>
                            <p className="max-w-md text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl">
                                Service begins before the first bell.
                            </p>
                            <p className="mt-5 max-w-md text-sm leading-6 text-slate-600">
                                Every assignment is part of a larger formation in prayer, discipline, brotherhood, and responsibility.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2">
                            {pillars.map(({ title, description, icon: Icon }, index) => (
                                <article
                                    key={title}
                                    className={`border-b border-[#17202a]/15 py-7 last:border-b-0 sm:px-7 ${index >= 2 ? 'sm:border-b-0' : ''} ${index % 2 === 1 ? 'sm:border-l' : ''}`}
                                >
                                    <Icon className="h-6 w-6 text-[#9a7717]" strokeWidth={1.5} aria-hidden="true" />
                                    <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                                    <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">{description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-[#17202a]/10 px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col gap-7 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/images/MINISTRY OF ALTAR SERVER - HSC.png"
                            alt=""
                            width={36}
                            height={36}
                            className="h-9 w-9 object-contain"
                        />
                        <div>
                            <p className="font-semibold text-[#17202a]">Ministry of Altar Servers</p>
                            <p className="text-xs">Holy Spirit Chapel</p>
                        </div>
                    </div>
                    <nav aria-label="Footer navigation" className="flex flex-wrap gap-5">
                        <a className="hover:text-[#85620f]" href="#hero">Home</a>
                        <a className="hover:text-[#85620f]" href="#schedule">Schedule</a>
                        <a className="hover:text-[#85620f]" href="#login">Sign in</a>
                    </nav>
                    <p className="text-xs">Copyright © 2026. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}
