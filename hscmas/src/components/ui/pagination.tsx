import Link from 'next/link'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
    currentPage: number
    totalPages: number
    basePath: string
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
    if (totalPages <= 1) return null

    // Helper to generate the URL for a page
    const getPageUrl = (pageNumber: number) => {
        return `${basePath}?page=${pageNumber}`
    }

    // Determine the range of page numbers to show
    const getPageNumbers = () => {
        const pages = []
        const maxPagesToShow = 5
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
        let endPage = startPage + maxPagesToShow - 1

        if (endPage > totalPages) {
            endPage = totalPages
            startPage = Math.max(1, endPage - maxPagesToShow + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }
        return pages
    }

    const pageNumbers = getPageNumbers()

    return (
        <div className="flex items-center justify-center gap-1 sm:gap-2">
            <Button
                variant="ghost"
                size="icon"
                disabled={currentPage <= 1}
                asChild={currentPage > 1}
                className="w-8 h-8 md:w-10 md:h-10 rounded-xl"
            >
                {currentPage > 1 ? (
                    <Link href={getPageUrl(currentPage - 1)}>
                        <ChevronLeft className="w-4 h-4" />
                        <span className="sr-only">Previous page</span>
                    </Link>
                ) : (
                    <>
                        <ChevronLeft className="w-4 h-4" />
                        <span className="sr-only">Previous page</span>
                    </>
                )}
            </Button>

            {pageNumbers[0] > 1 && (
                <>
                    <Button variant="ghost" size="icon" asChild className="w-8 h-8 md:w-10 md:h-10 rounded-xl hidden sm:flex">
                        <Link href={getPageUrl(1)}>1</Link>
                    </Button>
                    {pageNumbers[0] > 2 && (
                        <span className="px-2 text-muted-foreground hidden sm:flex">
                            <MoreHorizontal className="w-4 h-4" />
                        </span>
                    )}
                </>
            )}

            {pageNumbers.map((pageNumber) => (
                <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? "accent" : "ghost"}
                    size="icon"
                    asChild={pageNumber !== currentPage}
                    className={cn("w-8 h-8 md:w-10 md:h-10 rounded-xl", pageNumber === currentPage && "shadow-md")}
                >
                    {pageNumber === currentPage ? (
                        <span>{pageNumber}</span>
                    ) : (
                        <Link href={getPageUrl(pageNumber)}>{pageNumber}</Link>
                    )}
                </Button>
            ))}

            {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                    {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                        <span className="px-2 text-muted-foreground hidden sm:flex">
                            <MoreHorizontal className="w-4 h-4" />
                        </span>
                    )}
                    <Button variant="ghost" size="icon" asChild className="w-8 h-8 md:w-10 md:h-10 rounded-xl hidden sm:flex">
                        <Link href={getPageUrl(totalPages)}>{totalPages}</Link>
                    </Button>
                </>
            )}

            <Button
                variant="ghost"
                size="icon"
                disabled={currentPage >= totalPages}
                asChild={currentPage < totalPages}
                className="w-8 h-8 md:w-10 md:h-10 rounded-xl"
            >
                {currentPage < totalPages ? (
                    <Link href={getPageUrl(currentPage + 1)}>
                        <ChevronRight className="w-4 h-4" />
                        <span className="sr-only">Next page</span>
                    </Link>
                ) : (
                    <>
                        <ChevronRight className="w-4 h-4" />
                        <span className="sr-only">Next page</span>
                    </>
                )}
            </Button>
        </div>
    )
}
