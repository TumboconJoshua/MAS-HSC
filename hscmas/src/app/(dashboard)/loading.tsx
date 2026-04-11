import React from 'react'
import { Church } from 'lucide-react'

export default function Loading() {
  return (
    <div className="h-full flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-500">
      <div className="relative">
        {/* Sacred Aura Effect */}
        <div className="absolute inset-0 bg-accent/20 blur-[40px] rounded-full animate-pulse"></div>
        
        {/* Centered Logo Container */}
        <div className="relative w-20 h-20 rounded-[2rem] bg-background border border-accent/20 flex items-center justify-center shadow-2xl shadow-accent/10 overflow-hidden p-2">
          <img 
            src="/images/MINISTRY OF ALTAR SERVER - HSC.png" 
            alt="MAS-HSC Logo" 
            className="w-full h-full object-contain" 
          />
          
          {/* Circular Progress Ring */}
          <div className="absolute inset-[-4px] rounded-[2.2rem] border-2 border-transparent border-t-accent/40 animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>
      </div>
      
      <div className="mt-8 text-center space-y-2">
        <h3 className="text-lg font-bold tracking-tight text-foreground/80">Loading...</h3>
        <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-semibold">Holy Spirit Chapel</p>
      </div>
      
      {/* Decorative dots */}
      <div className="flex gap-1.5 mt-6">
        <div className="w-1.5 h-1.5 rounded-full bg-accent/20 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce"></div>
      </div>
    </div>
  )
}
