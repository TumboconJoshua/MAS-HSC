'use client'

import { Search, Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { useDebounce } from 'use-debounce'

export function AttendanceFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const currentSearch = searchParams.get('search') || ''
    const currentDate = searchParams.get('date') || ''
    
    const [searchTerm, setSearchTerm] = useState(currentSearch)
    const [debouncedSearch] = useDebounce(searchTerm, 300)

    useEffect(() => {
        const params = new URLSearchParams(searchParams)
        if (debouncedSearch) {
            params.set('search', debouncedSearch)
            params.set('page', '1') // Reset to page 1 on search
        } else {
            params.delete('search')
        }
        
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }, [debouncedSearch])

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value
        const params = new URLSearchParams(searchParams)
        if (date) {
            params.set('date', date)
            params.set('page', '1') // Reset to page 1 on filter
        } else {
            params.delete('date')
        }
        
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }

    const clearFilters = () => {
        setSearchTerm('')
        router.push(pathname)
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-card rounded-2xl border border-border">
            <div className="relative w-full md:max-w-xs">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isPending ? 'text-accent animate-pulse' : 'text-muted-foreground'}`} />
                <input
                    type="text"
                    placeholder="Search masses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all shadow-sm"
                />
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent pointer-events-none" />
                    <input
                        type="date"
                        value={currentDate}
                        onChange={handleDateChange}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all appearance-none shadow-sm"
                    />
                </div>
                
                {(currentSearch || currentDate) && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="rounded-xl text-muted-foreground hover:text-red-500"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    )
}
