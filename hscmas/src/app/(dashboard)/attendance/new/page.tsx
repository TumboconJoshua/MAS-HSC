'use server'

import { createMass } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Calendar, Clock, MapPin, Type, ChevronLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function NewMassPage(props: {
    searchParams: Promise<{ error?: string }>
}) {
    const searchParams = await props.searchParams;
    
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <Link href="/attendance">
                <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Attendance
                </Button>
            </Link>

            <header>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Schedule Mass</h1>
                <p className="text-muted-foreground mt-2">Plan a new liturgical service or event.</p>
            </header>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-visible">
                <CardHeader className="border-b border-border/50 pb-8">
                    <CardTitle className="text-xl">Mass Details</CardTitle>
                    <CardDescription>Enter the basic details of the mass or service.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    {searchParams.error && (
                        <div className="mb-6 flex items-center gap-3 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 animate-in fade-in zoom-in duration-300">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>Failed to schedule mass. Please try again.</p>
                        </div>
                    )}
                    <form action={createMass} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                                <Type className="w-4 h-4 text-accent" />
                                Mass Title / Name
                            </label>
                            <input
                                id="title"
                                name="title"
                                required
                                placeholder="e.g. Sunday Morning Mass"
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground/40"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="date" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-accent" />
                                    Date
                                </label>
                                <input
                                    id="date"
                                    name="date"
                                    type="date"
                                    required
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all appearance-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="start_time" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-accent" />
                                    Start Time
                                </label>
                                <input
                                    id="start_time"
                                    name="start_time"
                                    type="time"
                                    required
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all appearance-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="type" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-accent" />
                                    Mass Type
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    required
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all appearance-none cursor-pointer"
                                >
                                    <option value="regular">Regular Mass</option>
                                    <option value="high_mass">High Mass</option>
                                    <option value="special">Special Occasion</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="location" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-accent" />
                                    Location
                                </label>
                                <input
                                    id="location"
                                    name="location"
                                    placeholder="e.g. Main Chapel"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground/40"
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex items-center justify-end gap-4 border-t border-border/50">
                            <Link href="/attendance">
                                <Button variant="ghost" type="button">Cancel</Button>
                            </Link>
                            <Button variant="accent" type="submit" className="shadow-lg shadow-accent/20 px-8">
                                Schedule Mass
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
