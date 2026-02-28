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
        <form onSubmit={handleSubmit} className="space-y-5">
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
                        className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground/50"
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
                        className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground/50"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
                <Button
                    type="submit"
                    variant="default"
                    disabled={isPending}
                    className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20"
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
