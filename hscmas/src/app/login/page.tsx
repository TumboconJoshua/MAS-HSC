import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Church, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'

export default async function LoginPage(props: {
    searchParams: Promise<{ message: string; error: string }>
}) {
    const searchParams = await props.searchParams;

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md px-4 sm:px-8 relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-accent/10 border border-accent/20 mb-6 shadow-xl shadow-accent/5">
                        <Church className="w-8 h-8 text-accent" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">MAS-HSC Management System</h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">Ministry of Altar Servers Holy Spirit Chapel</p>
                </div>

                <div className="bg-card/50 backdrop-blur-xl p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-border shadow-2xl space-y-6">
                    <form className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-semibold ml-1 text-foreground/80">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-semibold ml-1 text-foreground/80">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground/50"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                formAction={login}
                                variant="default"
                                className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20"
                            >
                                Sign In
                            </Button>
                            {/* <Button
                                formAction={signup}
                                variant="outline"
                                className="w-full h-12 rounded-xl text-base font-bold border-accent/20 text-accent hover:bg-accent/5"
                            >
                                Create Account
                            </Button> */}
                        </div>
                    </form>

                    {/* Feedback Messages */}
                    {searchParams?.error && (
                        <div className="flex items-center gap-3 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30 animate-in fade-in zoom-in duration-300">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>Invalid credentials. Please verify your email or password.</p>
                        </div>
                    )}

                    {searchParams?.message && (
                        <div className="flex items-center gap-3 p-4 text-sm text-green-700 bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-100 dark:border-green-900/30 animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <p>
                                {searchParams.message === 'check-email'
                                    ? 'Check your inbox for a confirmation link.'
                                    : searchParams.message}
                            </p>
                        </div>
                    )}

                    <div className="pt-4 text-center">
                        <p className="text-xs text-muted-foreground">
                            Copyright © 2026. All Rights Reserved. <br />
                            HSC-MAS
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
