'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function LoginForm() {
    const [isPending, setIsPending] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsPending(true)

        const formData = new FormData(event.currentTarget)
        
        try {
            const result = await login(formData)
            if (result?.error) {
                toast.error(result.error, {
                    style: {
                        background: '#0f172a',
                        color: '#f8fafc',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                    },
                    iconTheme: {
                        primary: '#ef4444',
                        secondary: '#0f172a',
                    },
                })
                setIsPending(false)
            }
        } catch (error: any) {
            if (error.message !== 'NEXT_REDIRECT') {
                toast.error('An unexpected error occurred. Please try again.', {
                    style: {
                        background: '#0f172a',
                        color: '#f8fafc',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                    },
                })
                setIsPending(false)
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {/* Email Field */}
            <div className="space-y-2">
                <label 
                    htmlFor="email" 
                    className="block text-[11px] font-bold uppercase tracking-widest text-slate-700 ml-1"
                >
                    Email Address
                </label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 group-focus-within:text-amber-600 transition-colors duration-300 pointer-events-none">
                        <Mail className="w-4 h-4" />
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        required
                        disabled={isPending}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/90 border border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                    />
                </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                    <label 
                        htmlFor="password" 
                        className="block text-[11px] font-bold uppercase tracking-widest text-slate-700"
                    >
                        Password
                    </label>
                </div>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 group-focus-within:text-amber-600 transition-colors duration-300 pointer-events-none">
                        <Lock className="w-4 h-4" />
                    </div>
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••"
                        required
                        disabled={isPending}
                        className="w-full pl-11 pr-12 py-3.5 bg-white/90 border border-slate-300 rounded-2xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isPending}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-amber-600 focus:text-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded-lg transition-colors duration-200"
                    >
                        {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                        ) : (
                            <Eye className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-4">
                <Button
                    type="submit"
                    variant="default"
                    disabled={isPending}
                    className="w-full h-12 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-600/20 transition-all duration-300 active:scale-[0.99] border-none disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Authenticating...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In to Portal</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </>
                        )}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Protected Portal Access • HSC-MAS</span>
                </div>
            </div>
        </form>
    )
}

