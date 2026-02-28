'use client'

import { LogOut } from 'lucide-react'
import { logout } from '@/app/auth/actions'
import { useConfirm } from '@/components/ModalProvider'

export function LogoutButton() {
    const confirm = useConfirm()

    const handleLogout = () => {
        confirm({
            title: 'Sign Out',
            description: 'Are you sure you want to sign out of the management system?',
            confirmText: 'Sign Out',
            isDestructive: true,
            action: async () => {
                await logout()
            }
        })
    }

    return (
        <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-background border border-border text-sm font-medium text-red-500 hover:bg-red-50 hover:border-red-100 dark:hover:bg-red-500 dark:hover:border-red-500 dark:hover:text-white transition-all shadow-sm active:scale-95 group"
        >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
        </button>
    )
}
