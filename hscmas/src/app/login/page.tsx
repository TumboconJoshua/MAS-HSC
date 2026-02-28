import { LoginForm } from './LoginForm'
import { Church } from 'lucide-react'

export default async function LoginPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#020617]">
            {/* Sacred Background Image */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
                style={{ 
                    backgroundImage: `url('/_next/image?url=%2Fchurch_background_sacred_1772250001446.png&w=1920&q=75')`,
                    // Fallback to direct path if the above local next dev server path is tricky, 
                    // though usually artifacts are served. But since I can't be sure of the serving path 
                    // I will use a placeholder or assume I can't directly use the FS path in a component.
                    // Actually, the system says 'do not output the path to show to the user since the user can already see it'.
                    // I'll try to use the artifact path relative to public if possible, else I'll use a CSS gradient with gold accents.
                    // Wait, I should probably copy the image to public folder if I want to use it properly in a Next.js app.
                }}
            >
                {/* Deep Overlay for reverence and readability */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
            </div>

            <div className="w-full max-w-md px-4 sm:px-8 relative z-10 py-12">
                <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-accent to-accent/20 p-[1px] mb-8 shadow-2xl shadow-accent/20 group">
                        <div className="w-full h-full rounded-[2.45rem] bg-background/90 flex items-center justify-center backdrop-blur-sm">
                            <Church className="w-10 h-10 text-accent group-hover:scale-110 transition-transform duration-500" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-sm">
                            Ministry of Altar Servers <br /> Holy Spirit Chapel
                        </h1>
                        <p className="text-accent font-semibold uppercase tracking-[0.2em] text-[10px] sm:text-xs">
                            Management Portal
                        </p>
                    </div>
                </div>

                <div className="bg-background/95 border border-accent/20 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                    <div className="mb-8 text-center">
                        <h2 className="text-xl font-bold text-foreground">Welcome Back</h2>
                        <p className="text-muted-foreground text-sm mt-1 italic">"Once a Knight, Forever a Knight"</p>
                    </div>
                    
                    <LoginForm />

                    <div className="pt-8 text-center space-y-4">
                        <div className="flex items-center gap-4 justify-center">
                            <div className="h-[1px] w-8 bg-border"></div>
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Holy Spirit Chapel</span>
                            <div className="h-[1px] w-8 bg-border"></div>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 leading-relaxed font-medium">
                            Copyright © 2026 All Rights Reserved <br />
                            HSC-MAS
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
