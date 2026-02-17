'use server'

import { createServer } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { User, Phone, Users, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

import { AlertCircle } from 'lucide-react'

export default async function NewServerPage(props: {
    searchParams: Promise<{ error?: string }>
}) {
    const searchParams = await props.searchParams;
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <Link href="/servers">
                <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Servers
                </Button>
            </Link>

            <header>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Add New Server</h1>
                <p className="text-muted-foreground mt-2">Register a new member into the Ministry of Altar Servers.</p>
            </header>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-visible">
                <CardHeader className="border-b border-border/50 pb-8">
                    <CardTitle className="text-xl">Personal Information</CardTitle>
                    <CardDescription>Enter the basic details of the server.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    {searchParams.error && (
                        <div className="mb-6 flex items-center gap-3 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 animate-in fade-in zoom-in duration-300">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>Failed to create server profile. Please try again.</p>
                        </div>
                    )}
                    <form action={createServer} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="first_name" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                                    <User className="w-4 h-4 text-accent" />
                                    First Name
                                </label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    required
                                    placeholder="e.g. Joshua"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground/40"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="last_name" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                                    <User className="w-4 h-4 text-accent" />
                                    Last Name
                                </label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    required
                                    placeholder="e.g. Tumbocon"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground/40"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="contact_number" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-accent" />
                                Contact Number
                            </label>
                            <input
                                id="contact_number"
                                name="contact_number"
                                placeholder="+63 9xx xxx xxxx"
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground/40"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="group_name" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                                <Users className="w-4 h-4 text-accent" />
                                Assignment Group
                            </label>
                            <select
                                id="group_name"
                                name="group_name"
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Select a Group</option>
                                <option value="Knights of the Altar">Knights of the Altar</option>
                                <option value="Junior Servers">Junior Servers</option>
                                <option value="Senior Servers">Senior Servers</option>
                            </select>
                        </div>

                        <div className="pt-6 flex items-center justify-end gap-4 border-t border-border/50">
                            <Link href="/servers">
                                <Button variant="ghost" type="button">Cancel</Button>
                            </Link>
                            <Button variant="accent" type="submit" className="shadow-lg shadow-accent/20 px-8">
                                Create Server Profile
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
