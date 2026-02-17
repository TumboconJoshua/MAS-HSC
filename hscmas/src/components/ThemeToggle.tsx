'use client'

import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/ThemeProvider'

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full w-9 h-9 transition-all hover:bg-accent/10 hover:text-accent"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="w-[1.2rem] h-[1.2rem] transition-all" />
            ) : (
                <Sun className="w-[1.2rem] h-[1.2rem] transition-all" />
            )}
        </Button>
    )
}
