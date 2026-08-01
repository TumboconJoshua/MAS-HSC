'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, Filter } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'

export function FundFilters() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('search', term)
        } else {
            params.delete('search')
        }
        replace(`${pathname}?${params.toString()}`)
    }, 300)

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value && value !== 'all') {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search description or reference..."
                    defaultValue={searchParams.get('search')?.toString()}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background text-foreground border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all placeholder:text-muted-foreground"
                />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                
                {/* Type Filter */}
                <select
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    defaultValue={searchParams.get('type')?.toString() || 'all'}
                    className="h-10 text-xs font-medium bg-background text-foreground border border-border rounded-xl px-3 outline-none focus:ring-1 focus:ring-accent transition-colors"
                >
                    <option value="all">All Types</option>
                    <option value="income">🟢 Income</option>
                    <option value="expense">🔴 Expense</option>
                </select>

                {/* Category Filter */}
                <select
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    defaultValue={searchParams.get('category')?.toString() || 'all'}
                    className="h-10 text-xs font-medium bg-background text-foreground border border-border rounded-xl px-3 outline-none focus:ring-1 focus:ring-accent transition-colors"
                >
                    <option value="all">All Categories</option>
                    <option value="contribution">Contribution</option>
                    <option value="donation">Donation</option>
                    <option value="fundraising">Fundraising</option>
                    <option value="vessels">Vessels</option>
                    <option value="supplies">Supplies</option>
                    <option value="events">Events</option>
                    <option value="food">Food</option>
                    <option value="other">Other</option>
                </select>
            </div>
        </div>
    )
}
