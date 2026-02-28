'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, CalendarRange, Plus, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createSchedule } from '../actions'
import { toast } from 'react-hot-toast'

interface Server {
    id: string
    first_name: string
    last_name: string
    group_name: string | null
}

export function NewScheduleForm({ servers }: { servers: Server[] }) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [weeks, setWeeks] = useState<Record<string, string[]>>({
        week_1: [],
        week_2: [],
        week_3: [],
        week_4: [],
        week_5: [],
    })

    const addServerToWeek = (week: string, serverId: string) => {
        if (!serverId || weeks[week].includes(serverId)) return
        setWeeks(prev => ({
            ...prev,
            [week]: [...prev[week], serverId]
        }))
    }

    const removeServerFromWeek = (week: string, serverId: string) => {
        setWeeks(prev => ({
            ...prev,
            [week]: prev[week].filter(id => id !== serverId)
        }))
    }

    const getServerName = (id: string) => {
        const s = servers.find(s => s.id === id)
        return s ? `${s.first_name} ${s.last_name}` : 'Unknown'
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const form = e.currentTarget
        const formData = new FormData(form)
        
        // Append week data
        Object.entries(weeks).forEach(([week, serverIds]) => {
            serverIds.forEach(id => formData.append(week, id))
        })

        const result = await createSchedule(formData)

        if (result?.error) {
            toast.error(result.error)
            setIsSubmitting(false)
        } else {
            toast.success('Schedule created successfully!')
            router.push('/schedule')
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <Link href="/schedule">
                <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Schedules
                </Button>
            </Link>

            <header>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Create Schedule</h1>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">Assign altar servers to weekly rotations for the month.</p>
            </header>

            <form onSubmit={handleSubmit}>
                <Card className="border border-border shadow-xl bg-card rounded-[2rem] overflow-hidden">
                    <CardHeader className="border-b border-border/50 px-6 md:px-8 py-6">
                        <CardTitle className="text-xl font-bold flex items-center gap-3">
                            <CalendarRange className="w-6 h-6 text-accent" />
                            Schedule Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-8">
                        {/* Title & Duration */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="title" className="text-sm font-semibold ml-1 text-foreground/80">Schedule Title</label>
                                <input
                                    id="title"
                                    name="title"
                                    required
                                    placeholder="e.g. March 2026 Schedule"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="effective_from" className="text-sm font-semibold ml-1 text-foreground/80">Effective From</label>
                                <input
                                    id="effective_from"
                                    name="effective_from"
                                    type="date"
                                    required
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="effective_to" className="text-sm font-semibold ml-1 text-foreground/80">Effective To</label>
                                <input
                                    id="effective_to"
                                    name="effective_to"
                                    type="date"
                                    required
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Weekly Assignments */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-accent">Weekly Server Assignments</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                {[1, 2, 3, 4, 5].map(weekNum => {
                                    const weekKey = `week_${weekNum}`
                                    return (
                                        <div key={weekNum} className="p-4 bg-secondary/30 rounded-2xl border border-border space-y-3">
                                            <div className="text-xs font-bold uppercase tracking-widest text-accent">
                                                Week {weekNum}
                                            </div>

                                            {/* Assigned servers */}
                                            <div className="space-y-2 min-h-[40px]">
                                                {weeks[weekKey].map(id => (
                                                    <div key={id} className="flex items-center justify-between gap-2 bg-background p-2 rounded-xl border border-border text-xs">
                                                        <span className="font-medium truncate">{getServerName(id)}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeServerFromWeek(weekKey, id)}
                                                            className="text-red-400 hover:text-red-600 shrink-0"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add server dropdown */}
                                            <select
                                                onChange={(e) => {
                                                    addServerToWeek(weekKey, e.target.value)
                                                    e.target.value = ''
                                                }}
                                                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent/50 appearance-none cursor-pointer"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>+ Add server</option>
                                                {servers
                                                    .filter(s => !weeks[weekKey].includes(s.id))
                                                    .map(s => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.first_name} {s.last_name}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                variant="accent"
                                disabled={isSubmitting}
                                className="rounded-2xl h-12 px-10 shadow-lg shadow-accent/20 font-bold"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Schedule
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
