import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ServerDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const supabase = await createClient()
    const { data: server } = await supabase.from('servers').select('*').eq('id', params.id).single()

    if (!server) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{server.first_name} {server.last_name}</h1>
                <div className="space-x-2">
                    <Link href={`/servers/${server.id}/edit`}>
                        <Button variant="outline">Edit Profile</Button>
                    </Link>
                    <Button variant="destructive">Archive</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <span className="text-zinc-500 block text-xs uppercase tracking-wider">Status</span>
                            <span className="capitalize font-medium">{server.status}</span>
                        </div>
                        <div>
                            <span className="text-zinc-500 block text-xs uppercase tracking-wider">Group</span>
                            <span className="font-medium">{server.group_name || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-zinc-500 block text-xs uppercase tracking-wider">Contact</span>
                            <span className="font-medium">{server.contact_number || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="text-zinc-500 block text-xs uppercase tracking-wider">Date Joined</span>
                            <span className="font-medium">{new Date(server.date_joined).toLocaleDateString()}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-zinc-500 text-sm">
                            No attendance records yet.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
