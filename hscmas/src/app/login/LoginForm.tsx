'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function LoginForm() {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsPending(true)

        const formData = new FormData(event.currentTarget)
        
        try {
            const result = await login(formData)
            if (result?.error) {
                toast.error(result.error)
                setIsPending(false)
            }
        } catch (error: any) {
            if (error.message !== 'NEXT_REDIRECT') {
                toast.error('An unexpected error occurred')
                setIsPending(false)
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] uppercase tracking-widest font-bold ml-1 text-muted-foreground">
                    Email Address
                </label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors duration-300" />
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-secondary/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-300 placeholder:text-muted-foreground/30 text-sm"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="password" className="text-[10px] uppercase tracking-widest font-bold ml-1 text-muted-foreground">
                    Password
                </label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors duration-300" />
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-secondary/30 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-300 placeholder:text-muted-foreground/30 text-sm"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
                <Button
                    type="submit"
                    variant="default"
                    disabled={isPending}
                    className="w-full h-12 rounded-2xl text-sm font-bold shadow-xl shadow-accent/20 bg-accent hover:bg-accent/90 text-white transition-all active:scale-[0.98]"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Signing In...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </Button>
            </div>
        </form>
    )
}
