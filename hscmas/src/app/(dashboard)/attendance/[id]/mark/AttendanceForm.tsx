'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, XCircle, Clock, AlertCircle, Loader2, ShieldCheck } from 'lucide-react'
import { recordAttendance } from '../../actions'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Server {
    id: string
    first_name: string
    last_name: string
    group_name: string | null
}

interface AttendanceFormProps {
    massId: string
    servers: Server[]
    existingAttendance: { server_id: string; status: string }[]
}

type AttendanceStatus = 'service' | 'present' | 'absent' | 'late' | 'excused'

export function AttendanceForm({ massId, servers, existingAttendance }: AttendanceFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(() => {
        const initial: Record<string, AttendanceStatus> = {}
        // Pre-fill with existing or default to 'absent' (or nothing?)
        // Let's default to nothing so user has to mark them, or maybe 'absent' is safer for an admin system
        servers.forEach(server => {
            const existing = existingAttendance.find(a => a.server_id === server.id)
            initial[server.id] = (existing?.status as AttendanceStatus) || 'absent'
        })
        return initial
    })

    const toggleStatus = (serverId: string, status: AttendanceStatus) => {
        setAttendance(prev => ({
            ...prev,
            [serverId]: status
        }))
    }

    const markAll = (status: AttendanceStatus) => {
        const updated = { ...attendance }
        servers.forEach(server => {
            updated[server.id] = status
        })
        setAttendance(updated)
    }

    const handleSave = async () => {
        setIsSubmitting(true)
        const data = Object.entries(attendance).map(([serverId, status]) => ({
            server_id: serverId,
            status: status
        }))

        const result = await recordAttendance(massId, data)
        
        if (result.success) {
            router.push('/attendance')
            router.refresh()
        } else {
            alert('Failed to save attendance. Please try again.')
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 bg-secondary/20 p-4 rounded-2xl border border-border/50">
                <span className="text-sm font-semibold text-muted-foreground mr-2">Quick Actions:</span>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => markAll('service')}
                    className="rounded-xl border-accent/20 text-accent hover:bg-accent hover:text-white"
                >
                    Mark All Service
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => markAll('present')}
                    className="rounded-xl border-green-500/20 text-green-600 hover:bg-green-500 hover:text-white"
                >
                    Mark All Present
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => markAll('absent')}
                    className="rounded-xl border-red-500/20 text-red-600 hover:bg-red-500 hover:text-white"
                >
                    Mark All Absent
                </Button>
            </div>

            <Card className="border-none shadow-xl bg-card/40 backdrop-blur-md overflow-hidden">
                <CardContent className="p-0">
                    <div className="divide-y divide-border/20">
                        {servers.map((server) => (
                            <div key={server.id} className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-secondary/30 transition-colors group gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold text-accent border border-border shrink-0">
                                        {server.first_name[0]}{server.last_name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base">{server.first_name} {server.last_name}</h4>
                                        <p className="text-xs text-muted-foreground">{server.group_name || 'Altar Server'}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 bg-background/50 p-1 rounded-xl border border-border/50 self-start sm:self-center">
                                    <StatusButton 
                                        active={attendance[server.id] === 'service'} 
                                        onClick={() => toggleStatus(server.id, 'service')}
                                        color="purple"
                                        icon={ShieldCheck}
                                        label="Service"
                                    />
                                    <StatusButton 
                                        active={attendance[server.id] === 'present'} 
                                        onClick={() => toggleStatus(server.id, 'present')}
                                        color="green"
                                        icon={CheckCircle2}
                                        label="Present"
                                    />
                                    <StatusButton 
                                        active={attendance[server.id] === 'late'} 
                                        onClick={() => toggleStatus(server.id, 'late')}
                                        color="yellow"
                                        icon={Clock}
                                        label="Late"
                                    />
                                    <StatusButton 
                                        active={attendance[server.id] === 'excused'} 
                                        onClick={() => toggleStatus(server.id, 'excused')}
                                        color="blue"
                                        icon={AlertCircle}
                                        label="Excused"
                                    />
                                    <StatusButton 
                                        active={attendance[server.id] === 'absent'} 
                                        onClick={() => toggleStatus(server.id, 'absent')}
                                        color="red"
                                        icon={XCircle}
                                        label="Absent"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4">
                <Button variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
                    Discard Changes
                </Button>
                <Button 
                    variant="accent" 
                    className="px-10 shadow-lg shadow-accent/20 h-12 rounded-xl font-bold"
                    onClick={handleSave}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Attendance'
                    )}
                </Button>
            </div>
        </div>
    )
}

function StatusButton({ active, onClick, color, icon: Icon, label }: any) {
    const colors: any = {
        purple: active ? 'bg-indigo-500 text-white border-indigo-500' : 'text-indigo-600 hover:bg-indigo-50',
        green: active ? 'bg-green-500 text-white border-green-500' : 'text-green-600 hover:bg-green-50',
        red: active ? 'bg-red-500 text-white border-red-500' : 'text-red-600 hover:bg-red-50',
        yellow: active ? 'bg-yellow-500 text-white border-yellow-500' : 'text-yellow-600 hover:bg-yellow-50',
        blue: active ? 'bg-blue-500 text-white border-blue-500' : 'text-blue-600 hover:bg-blue-50',
    }

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-transparent",
                colors[color]
            )}
        >
            <Icon className="w-3.5 h-3.5" />
            <span className={cn("hidden md:inline", active ? "inline" : "hidden")}>{label}</span>
        </button>
    )
}
