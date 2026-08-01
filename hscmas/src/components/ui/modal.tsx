'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from './button'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    isDestructive?: boolean
    isLoading?: boolean
}

export function Modal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDestructive = false,
    isLoading = false
}: ModalProps) {
    
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isLoading ? onClose : undefined}
                        className="fixed inset-0 z-50 bg-black/80"
                    />

                    {/* Modal Content */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 py-10 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
                            className="bg-background text-foreground border border-border shadow-2xl rounded-3xl w-full max-w-md overflow-hidden pointer-events-auto"
                        >
                            <div className="p-6 sm:p-8 text-center relative">
                                <button 
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className={`p-3.5 rounded-2xl w-fit mx-auto mb-4 ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-accent/10 text-accent'}`}>
                                    <AlertTriangle className="w-6 h-6" />
                                </div>

                                <h2 className="text-xl font-bold tracking-tight mb-2 text-foreground">{title}</h2>
                                <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                                    {description}
                                </p>

                                <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-3 mt-8">
                                    <Button 
                                        variant="outline" 
                                        className="w-full sm:w-1/2 rounded-xl"
                                        onClick={onClose}
                                        disabled={isLoading}
                                    >
                                        {cancelText}
                                    </Button>
                                    <Button 
                                        variant={isDestructive ? 'destructive' : 'accent'}
                                        className={`w-full sm:w-1/2 rounded-xl shadow-lg ${isDestructive ? 'shadow-red-500/20' : 'shadow-accent/20'}`}
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                    >
                                        {isLoading && <span className="w-4 h-4 mr-2 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                                        {isLoading ? 'Processing...' : confirmText}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
