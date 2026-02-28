'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Modal } from './ui/modal'
import { usePathname } from 'next/navigation'

interface ConfirmOptions {
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    isDestructive?: boolean
    action: () => Promise<void> | void
}

interface ModalContextType {
    confirm: (options: ConfirmOptions) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export const useConfirm = () => {
    const context = useContext(ModalContext)
    if (!context) {
        throw new Error("useConfirm must be used within ModalProvider")
    }
    return context.confirm
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [options, setOptions] = useState<ConfirmOptions | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const pathname = usePathname()

    // Auto-close modal on route change
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    const confirm = useCallback((opts: ConfirmOptions) => {
        setOptions(opts)
        setIsOpen(true)
    }, [])

    const handleConfirm = async () => {
        if (!options) return
        setIsLoading(true)
        try {
            await options.action()
            // If action completes without redirecting
            setIsOpen(false)
        } catch (error) {
            // Next.js redirects throw a specific error, catch it or ignore if needed
            // But we already handle it with the pathname effect
            console.error('Confirmation action failed:', error)
            setIsOpen(false)
        } finally {
            setIsLoading(false)
            // Optional: reset options after a delay to allow exit animation to finish smoothly
            setTimeout(() => {
                if (!isOpen) setOptions(null)
            }, 300)
        }
    }

    const handleClose = () => {
        if (!isLoading) {
            setIsOpen(false)
        }
    }

    return (
        <ModalContext.Provider value={{ confirm }}>
            {children}
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title={options?.title || ''}
                description={options?.description || ''}
                confirmText={options?.confirmText || 'Confirm'}
                cancelText={options?.cancelText || 'Cancel'}
                isDestructive={options?.isDestructive || false}
                isLoading={isLoading}
            />
        </ModalContext.Provider>
    )
}
