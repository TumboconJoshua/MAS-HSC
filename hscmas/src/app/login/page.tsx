import { LoginForm } from './LoginForm'
import { Church } from 'lucide-react'

export default async function LoginPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md px-4 sm:px-8 relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-accent/10 border border-accent/20 mb-6 shadow-xl shadow-accent/5">
                        <Church className="w-8 h-8 text-accent" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">MAS-HSC Management System</h1>
                    <p className="text-muted-foreground mt-2 text-sm sm:text-base">Ministry of Altar Servers Holy Spirit Chapel</p>
                </div>

                <div className="bg-card p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-border shadow-2xl space-y-6">
                    <LoginForm />

                    <div className="pt-4 text-center">
                        <p className="text-xs text-muted-foreground">
                            Copyright © 2026. All Rights Reserved. <br />
                            HSC-MAS
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
