import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChevronLeft, AlertCircle } from 'lucide-react'
import { EditServerForm } from './EditServerForm'

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
                    <EditServerForm server={server} />
                </CardContent>
            </Card>
        </div>
    )
}
