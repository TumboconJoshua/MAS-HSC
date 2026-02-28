'use client'

import { Search, Filter, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { useDebounce } from 'use-debounce'

export function ServerFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const currentSearch = searchParams.get('search') || ''
    const currentStatus = searchParams.get('status') || ''
    
    const [searchTerm, setSearchTerm] = useState(currentSearch)
    const [debouncedSearch] = useDebounce(searchTerm, 300)

    useEffect(() => {
        const params = new URLSearchParams(searchParams)
        if (debouncedSearch) {
            params.set('search', debouncedSearch)
        } else {
            params.delete('search')
        }
        
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }, [debouncedSearch])

    const toggleActiveOnly = () => {
        const params = new URLSearchParams(searchParams)
        if (currentStatus === 'active') {
            params.delete('status')
        } else {
            params.set('status', 'active')
        }
        
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-card rounded-2xl border border-border">
            <div className="relative w-full sm:max-w-xs">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isPending ? 'text-accent animate-pulse' : 'text-muted-foreground'}`} />
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button 
                    variant={currentStatus === 'active' ? 'accent' : 'outline'} 
                    size="sm" 
                    onClick={toggleActiveOnly}
                    className="flex-1 sm:flex-none rounded-xl"
                >
                    {currentStatus === 'active' && <Check className="w-4 h-4 mr-2" />}
                    Active Only
                </Button>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none rounded-xl cursor-not-allowed opacity-50" disabled>
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                </Button>
            </div>
        </div>
    )
}
