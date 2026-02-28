import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { NewServerForm } from './NewServerForm'

export default async function NewServerPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <Link href="/servers">
                <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Servers
                </Button>
            </Link>

            <header>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Add New Server</h1>
                <p className="text-muted-foreground mt-2">Register a new member into the Ministry of Altar Servers.</p>
            </header>

            <Card className="border border-border shadow-xl bg-card overflow-visible">
                <CardHeader className="border-b border-border/50 pb-8">
                    <CardTitle className="text-xl">Personal Information</CardTitle>
                    <CardDescription>Enter the basic details of the server.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <NewServerForm />
                </CardContent>
            </Card>
        </div>
    )
}
