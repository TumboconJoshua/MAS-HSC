import { logout } from '@/app/auth/actions'
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    ShieldCheck,
    LogOut,
    Church
} from 'lucide-react'
import Link from 'next/link'

import { ThemeToggle } from '@/components/ThemeToggle'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-background transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-72 border-r border-border bg-card flex flex-col shadow-sm">
                <div className="p-6 flex items-center gap-3 border-b border-border">
                    <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                        <Church className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">MAS-HSC</h1>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Management</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-1">
                    <NavItem href="/" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem href="/servers" icon={Users} label="Altar Servers" />
                    <NavItem href="/attendance" icon={CalendarCheck} label="Attendance" />
                    <NavItem href="/equipment" icon={ShieldCheck} label="Equipment" />
                </nav>

                <div className="p-4 mt-auto">
                    <form action={logout}>
                        <button className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-background border border-border text-sm font-medium text-red-500 hover:bg-red-50 hover:border-red-100 dark:hover:bg-red-500 dark:hover:border-red-500 dark:hover:text-white transition-all shadow-sm active:scale-95">
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Management System</span>
                        <span className="text-border">/</span>
                        <span className="text-foreground font-medium">Holy Spirit Chapel</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-xs font-bold text-accent">
                            HSC
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 relative">
                    <div className="max-w-7xl mx-auto page-enter">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

function NavItem({ href, icon: Icon, label }: { href: string, icon: any, label: string }) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active:scale-[0.98]"
        >
            <Icon className="w-5 h-5 group-hover:text-accent transition-colors" />
            <span>{label}</span>
        </Link>
    )
}
