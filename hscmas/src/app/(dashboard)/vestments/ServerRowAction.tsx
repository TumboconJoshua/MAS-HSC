'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ServerVestmentCheckerModal } from './ServerVestmentCheckerModal'
import { Edit3 } from 'lucide-react'

interface ServerRowProps {
    server: {
        id: string
        first_name: string
        last_name: string
        vestments?: any
    }
}

export function ServerRowAction({ server }: ServerRowProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="h-8 px-3 text-xs font-bold border-accent/30 text-accent hover:bg-accent hover:text-accent-foreground shadow-sm"
            >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                Check / Edit
            </Button>

            <ServerVestmentCheckerModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                server={server}
            />
        </>
    )
}
