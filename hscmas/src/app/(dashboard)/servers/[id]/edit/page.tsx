import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { User, Phone, Users, ChevronLeft, AlertCircle, ShieldCheck, Camera, Plus } from 'lucide-react'
import { updateServer } from '../../actions'

export default async function EditServerPage(props: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ error?: string }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const supabase = await createClient()

    // Fetch server data
    const { data: server } = await supabase
        .from('servers')
        .select('*')
        .eq('id', params.id)
        .single()

    if (!server) {
        notFound()
    }

    const updateServerWithId = updateServer.bind(null, params.id)

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            <Link href={`/servers/${params.id}`}>
                <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Profile
                </Button>
            </Link>

            <header>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Edit Server Profile</h1>
                <p className="text-muted-foreground mt-2">Update information for {server.first_name} {server.last_name}.</p>
            </header>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-visible">
                <CardHeader className="border-b border-border/50 pb-8">
                    <CardTitle className="text-xl">Profile Details</CardTitle>
                    <CardDescription>Modify the server's basic information and status.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    {searchParams.error && (
                        <div className="mb-6 flex items-center gap-3 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>Failed to update server profile. Please try again.</p>
                        </div>
                    )}
                    <form action={updateServerWithId} className="space-y-8">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-[2rem] bg-secondary flex items-center justify-center border-2 border-dashed border-border group-hover:border-accent/50 transition-colors overflow-hidden">
                                    {server.avatar_url ? (
                                        <img src={server.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="w-8 h-8 text-muted-foreground group-hover:text-accent transition-colors" />
                                    )}
                                </div>
                                <label 
                                    htmlFor="avatar" 
                                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    <input type="file" id="avatar" name="avatar" accept="image/*" className="hidden" />
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
                                    defaultValue={server.first_name}
                                    placeholder="e.g. Joshua"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
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
                                    defaultValue={server.last_name}
                                    placeholder="e.g. Tumbocon"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
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
                                    defaultValue={server.contact_number}
                                    placeholder="+63 9xx xxx xxxx"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="status" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-accent" />
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    defaultValue={server.status}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all appearance-none cursor-pointer"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="group_name" className="text-sm font-semibold ml-1 text-foreground/80 flex items-center gap-2">
                                <Users className="w-4 h-4 text-accent" />
                                Assignment Group
                            </label>
                            <select
                                id="group_name"
                                name="group_name"
                                defaultValue={server.group_name}
                                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Select a Group</option>
                                <option value="Knights of the Altar">Knights of the Altar</option>
                                <option value="Junior Servers">Junior Servers</option>
                                <option value="Senior Servers">Senior Servers</option>
                            </select>
                        </div>

                        <div className="pt-6 flex items-center justify-end gap-4 border-t border-border/50">
                            <Link href={`/servers/${params.id}`}>
                                <Button variant="ghost" type="button">Cancel</Button>
                            </Link>
                            <Button variant="accent" type="submit" className="shadow-lg shadow-accent/20 px-8">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
