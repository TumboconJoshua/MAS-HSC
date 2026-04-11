'use client'

import { Search, Calendar, X, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { useDebounce } from 'use-debounce'

const MONTH_NAMES = [
    { value: '1',  label: 'January' },
    { value: '2',  label: 'February' },
    { value: '3',  label: 'March' },
    { value: '4',  label: 'April' },
    { value: '5',  label: 'May' },
    { value: '6',  label: 'June' },
    { value: '7',  label: 'July' },
    { value: '8',  label: 'August' },
    { value: '9',  label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: currentYear - 2019 }, (_, i) => currentYear - i)

export function AttendanceFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    const currentSearch = searchParams.get('search') || ''
    const currentDate = searchParams.get('date') || ''
    const currentReportStartMonth = searchParams.get('reportStartMonth') || ''
    const currentReportEndMonth = searchParams.get('reportEndMonth') || ''
    const currentReportYear = searchParams.get('reportYear') || String(currentYear)

    const [searchTerm, setSearchTerm] = useState(currentSearch)
    const [debouncedSearch] = useDebounce(searchTerm, 300)

    useEffect(() => {
        const params = new URLSearchParams(searchParams)
        if (debouncedSearch) {
            params.set('search', debouncedSearch)
            params.set('page', '1')
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
            params.set('page', '1')
        } else {
            params.delete('date')
        }
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }

    const handleReportStartMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams)
        if (e.target.value) {
            params.set('reportStartMonth', e.target.value)
        } else {
            params.delete('reportStartMonth')
        }
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }

    const handleReportEndMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams)
        if (e.target.value) {
            params.set('reportEndMonth', e.target.value)
        } else {
            params.delete('reportEndMonth')
        }
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }

    const handleReportYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams)
        params.set('reportYear', e.target.value)
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }

    const clearFilters = () => {
        setSearchTerm('')
        router.push(pathname)
    }

    const hasActiveFilters = currentSearch || currentDate || currentReportStartMonth || currentReportEndMonth

    return (
        <div className="space-y-3">
            {/* Mass List Filters */}
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

                    {hasActiveFilters && (
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

            {/* Report Generation Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-accent/5 rounded-2xl border border-accent/20">
                <div className="flex items-center gap-2 shrink-0">
                    <FileDown className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-foreground/80">Generate Report:</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                        {/* Start Month Selector */}
                        <select
                            id="report-start-month-select"
                            value={currentReportStartMonth}
                            onChange={handleReportStartMonthChange}
                            className="px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all cursor-pointer appearance-none min-w-[130px]"
                        >
                            <option value="">Start Month</option>
                            {MONTH_NAMES.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>

                        <span className="text-muted-foreground text-sm font-medium">to</span>

                        {/* End Month Selector */}
                        <select
                            id="report-end-month-select"
                            value={currentReportEndMonth}
                            onChange={handleReportEndMonthChange}
                            className="px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all cursor-pointer appearance-none min-w-[130px]"
                        >
                            <option value="">End Month</option>
                            {MONTH_NAMES.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Year Selector */}
                    <select
                        id="report-year-select"
                        value={currentReportYear}
                        onChange={handleReportYearChange}
                        className="px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all cursor-pointer appearance-none min-w-[100px]"
                    >
                        {YEARS.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>

                    {/* The actual generate button is rendered server-side (passed as a slot) */}
                    {currentReportStartMonth && currentReportEndMonth ? (
                        <div id="report-generator-slot" />
                    ) : (
                        <p className="text-xs text-muted-foreground italic">
                            Select start and end months to enable report generation.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
