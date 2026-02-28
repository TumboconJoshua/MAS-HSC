'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Modal } from './ui/modal'

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

    const confirm = useCallback((opts: ConfirmOptions) => {
        setOptions(opts)
        setIsOpen(true)
    }, [])

    const handleConfirm = async () => {
        if (!options) return
        setIsLoading(true)
        try {
            await options.action()
            setIsOpen(false)
        } catch (error) {
            console.error('Confirmation action failed:', error)
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
