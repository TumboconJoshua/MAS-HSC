import React from 'react'
import { Church } from 'lucide-react'

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/60 backdrop-blur-md animate-in fade-in duration-700">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-accent/20 blur-[50px] scale-150 rounded-full animate-pulse transition-transform duration-1000"></div>
        
        {/* Sacred Icon Container */}
        <div className="relative z-10 w-24 h-24 rounded-[3rem] bg-background/90 border border-accent/30 flex items-center justify-center shadow-2xl shadow-accent/20 overflow-hidden p-3">
          <img 
            src="/images/MINISTRY OF ALTAR SERVER - HSC.png" 
            alt="MAS-HSC Logo" 
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" 
          />
          
          {/* Subtle Outer Spinner */}
          <div className="absolute inset-[-6px] rounded-[3.2rem] border-2 border-transparent border-t-accent/60 border-r-accent/20 animate-spin" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-[-12px] rounded-[3.45rem] border border-accent/10"></div>
        </div>
      </div>
      
      <div className="mt-12 text-center space-y-3 z-10">
        <h2 className="text-2xl font-black tracking-tight text-foreground drop-shadow-sm">MAS-HSC</h2>
        <div className="w-48 h-[1.5px] bg-border/40 relative overflow-hidden rounded-full mx-auto">
          <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-accent to-transparent animate-shimmer"></div>
        </div>
        <p className="text-[10px] text-accent font-bold uppercase tracking-[0.3em] opacity-80">Holy Spirit Chapel</p>
      </div>
    </div>
  )
}
