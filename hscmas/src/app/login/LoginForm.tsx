'use client'

import { useState } from 'react'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react'

export function LoginForm() {
    const [isPending, setIsPending] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)
        setIsPending(true)

        try {
            const result = await login(new FormData(event.currentTarget))
            if (result?.error) setError(result.error)
        } catch (caughtError: unknown) {
            if (!(caughtError instanceof Error && caughtError.message === 'NEXT_REDIRECT')) {
                setError('An unexpected error occurred. Please try again.')
            }
        } finally {
            setIsPending(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold">
                    Email address
                </label>
                <div className="relative">
                    <Mail
                        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                        strokeWidth={1.75}
                        aria-hidden="true"
                    />
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        placeholder="name@example.com"
                        required
                        disabled={isPending}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? 'login-error' : undefined}
                        className="min-h-12 w-full rounded-xl border border-[#17202a]/20 bg-[#f7f6f2] py-3 pl-11 pr-4 text-sm text-[#17202a] outline-none transition-[border-color,box-shadow] placeholder:text-slate-500 focus:border-[#9a7717] focus:ring-2 focus:ring-[#d4af37]/25 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold">
                    Password
                </label>
                <div className="relative">
                    <Lock
                        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                        strokeWidth={1.75}
                        aria-hidden="true"
                    />
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        required
                        disabled={isPending}
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? 'login-error' : undefined}
                        className="min-h-12 w-full rounded-xl border border-[#17202a]/20 bg-[#f7f6f2] py-3 pl-11 pr-12 text-sm text-[#17202a] outline-none transition-[border-color,box-shadow] placeholder:text-slate-500 focus:border-[#9a7717] focus:ring-2 focus:ring-[#d4af37]/25 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(current => !current)}
                        disabled={isPending}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition-colors hover:text-[#85620f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37] disabled:cursor-not-allowed"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                    </button>
                </div>
            </div>

            {error && (
                <div id="login-error" role="alert" aria-live="polite" className="flex gap-3 rounded-xl border border-red-700/25 bg-red-700/10 px-4 py-3 text-sm text-red-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                </div>
            )}

            <div className="space-y-4 pt-1">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="h-12 w-full rounded-xl border-none bg-[#d4af37] text-sm font-bold text-[#111820] shadow-none transition-[background-color,transform] hover:bg-[#e0c15c] active:translate-y-px focus-visible:ring-[#d4af37] focus-visible:ring-offset-[#e8e6df] disabled:cursor-not-allowed disabled:opacity-65"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            Sign in
                            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                        </>
                    )}
                </Button>

                <p className="flex items-center justify-center gap-2 text-xs text-slate-600">
                    <ShieldCheck className="h-4 w-4 text-[#85620f]" strokeWidth={1.5} aria-hidden="true" />
                    Protected portal access - HSC-MAS
                </p>
            </div>
        </form>
    )
}
