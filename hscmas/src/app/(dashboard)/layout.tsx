'use client'

import React, { useState, useEffect } from 'react'
import { logout } from '@/app/auth/actions'
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    ShieldCheck,
    LogOut,
    Church,
    Menu,
    X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const pathname = usePathname()

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsSidebarOpen(false)
    }, [pathname])

    // Handle escape key to close sidebar
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsSidebarOpen(false)
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [])

    return (
        <div className="flex h-screen bg-background transition-colors duration-300 overflow-hidden">
            {/* Mobile Sidebar Overlay/Backdrop */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[40] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-[50] w-72 border-r border-border bg-card flex flex-col shadow-xl transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-sm",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 flex items-center justify-between border-b border-border h-16 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                            <Church className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">MAS-HSC</h1>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Management</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 -mr-2 rounded-lg hover:bg-secondary lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
                    <NavItem href="/" icon={LayoutDashboard} label="Dashboard" active={pathname === '/'} />
                    <NavItem href="/servers" icon={Users} label="Altar Servers" active={pathname.startsWith('/servers')} />
                    <NavItem href="/attendance" icon={CalendarCheck} label="Attendance" active={pathname.startsWith('/attendance')} />
                    <NavItem href="/equipment" icon={ShieldCheck} label="Equipment" active={pathname.startsWith('/equipment')} />
                </nav>

                <div className="p-4 mt-auto border-t border-border">
                    <form action={logout}>
                        <button className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-background border border-border text-sm font-medium text-red-500 hover:bg-red-50 hover:border-red-100 dark:hover:bg-red-500 dark:hover:border-red-500 dark:hover:text-white transition-all shadow-sm active:scale-95 group">
                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Sign Out</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-lg hover:bg-secondary lg:hidden shrink-0"
                            aria-label="Open sidebar"
                        >
                            <Menu className="w-5 h-5 text-foreground" />
                        </button>
                        <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground truncate">
                            <span>Management System</span>
                            <span className="text-border shrink-0">/</span>
                            <span className="text-foreground font-medium truncate">Holy Spirit Chapel</span>
                        </div>
                        <div className="md:hidden font-bold text-sm truncate">
                            Holy Spirit Chapel
                        </div>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4 shrink-0">
                        <ThemeToggle />
                        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-[10px] font-bold text-accent shadow-sm">
                            HSC
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
                    <div className="max-w-7xl mx-auto page-enter h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

function NavItem({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active?: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98]",
                active 
                    ? "bg-accent/10 text-accent shadow-sm" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
        >
            <Icon className={cn(
                "w-5 h-5 transition-colors",
                active ? "text-accent" : "group-hover:text-accent"
            )} />
            <span>{label}</span>
        </Link>
    )
}
