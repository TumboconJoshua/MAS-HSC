'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createServer } from '../actions'
import { Button } from '@/components/ui/button'
import { User, Phone, Users, Camera, Plus, Loader2, Shield } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export function NewServerForm() {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsPending(true)

        const formData = new FormData(event.currentTarget)
        
        try {
            const result = await createServer(formData)
            if (result?.error) {
                toast.error(result.error)
                setIsPending(false)
            } else {
                toast.success('Server profile created successfully!')
                router.push('/servers')
                router.refresh()
            }
        } catch (error: any) {
            toast.error('An unexpected error occurred')
            setIsPending(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4 py-4">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-[2rem] bg-secondary flex items-center justify-center border-2 border-dashed border-border group-hover:border-accent/50 transition-colors overflow-hidden">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <Camera className="w-8 h-8 text-muted-foreground group-hover:text-accent transition-colors" />
                        )}
                    </div>
                    <label 
                        htmlFor="avatar" 
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <input 
                            type="file" 
                            id="avatar" 
                            name="avatar" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
                <div className="text-center">
                    <p className="text-sm font-bold">Profile Picture</p>
                    <p className="text-xs text-muted-foreground">Click the plus icon to upload</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="first_name" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                        <User className="w-4 h-4 text-accent" />
                        First Name
                    </label>
                    <input
                        id="first_name"
                        name="first_name"
                        required
                        placeholder="e.g. Joshua"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground/40"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="last_name" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                        <User className="w-4 h-4 text-accent" />
                        Last Name
                    </label>
                    <input
                        id="last_name"
                        name="last_name"
                        required
                        placeholder="e.g. Tumbocon"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground/40"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label htmlFor="sex" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        Sex
                    </label>
                    <select
                        id="sex"
                        name="sex"
                        required
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all appearance-none cursor-pointer text-sm"
                    >
                        <option value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label htmlFor="birthday" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                        <Plus className="w-4 h-4 rotate-45 text-accent" />
                        Birthday
                    </label>
                    <input
                        id="birthday"
                        name="birthday"
                        type="date"
                        required
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="date_joined" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-accent" />
                        Member Since
                    </label>
                    <input
                        id="date_joined"
                        name="date_joined"
                        type="date"
                        required
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="contact_number" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-accent" />
                        Contact Number
                    </label>
                    <input
                        id="contact_number"
                        name="contact_number"
                        placeholder="+63 9xx xxx xxxx"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all placeholder:text-muted-foreground/40"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="group_name" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        Assignment Group
                    </label>
                    <select
                        id="group_name"
                        name="group_name"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all appearance-none cursor-pointer text-sm"
                    >
                        <option value="">Select a Group</option>
                        <option value="Knights of the Altar">Knights of the Altar</option>
                        <option value="Junior Servers">Junior Servers</option>
                        <option value="Senior Servers">Senior Servers</option>
                        <option value="Observer">Observer</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="officer_role" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-accent" />
                        Officer Role (Optional)
                    </label>
                    <select
                        id="officer_role"
                        name="officer_role"
                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all appearance-none cursor-pointer text-sm"
                    >
                        <option value="">No Officer Role</option>
                        <option value="Adviser">Adviser</option>
                        <option value="Co-Adviser">Co-Adviser</option>
                        <option value="Coordinator">Coordinator</option>
                        <option value="President">President</option>
                        <option value="Trainer/OIC">Trainer/OIC</option>
                        <option value="Secretary">Secretary</option>
                        <option value="Treasurer">Treasurer</option>
                    </select>
                </div>
            </div>

            <div className="pt-6 flex items-center justify-end gap-4 border-t border-border/50">
                <Link href="/servers">
                    <Button variant="ghost" type="button" disabled={isPending}>Cancel</Button>
                </Link>
                <Button variant="accent" type="submit" disabled={isPending} className="shadow-lg shadow-accent/20 px-8">
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        'Create Server Profile'
                    )}
                </Button>
            </div>
        </form>
    )
}
