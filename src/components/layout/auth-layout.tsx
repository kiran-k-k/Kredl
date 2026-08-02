import React from "react"
import Link from "next/link"
import { Logo } from "./logo"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background">
      {/* Left side - Auth Form Container */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[480px] xl:w-[560px] lg:px-20 xl:px-24 border-r border-border/50 bg-background z-10 relative shadow-2xl shadow-black/5">
        <div className="mx-auto w-full max-w-sm lg:w-full">
          {/* Logo */}
          <div className="mb-10">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Logo className="text-3xl" />
            </Link>
          </div>

          {/* Dynamic Content */}
          <main>
            {children}
          </main>
          
          {/* Minimal Footer */}
          <footer className="mt-12 text-sm text-muted-foreground flex items-center justify-between">
            <p>&copy; {new Date().getFullYear()} Kredl.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
          </footer>
        </div>
      </div>
      
      {/* Right side - Aspirational Visual */}
      <div className="relative hidden w-full flex-1 lg:flex flex-col justify-between overflow-hidden bg-surface">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10 p-12 xl:p-24 h-full flex flex-col justify-center max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium mb-8 bg-background self-center shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Join 10,000+ students
          </div>
          <h2 className="text-4xl xl:text-5xl font-bold tracking-tight mb-6 text-foreground leading-tight">
            Learn. Build. Prepare. <span className="text-muted-foreground">Get Hired.</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            The complete ecosystem connecting your technical education directly to top tier engineering jobs. Start your career journey with confidence.
          </p>
          
          <div className="mt-16 grid grid-cols-3 gap-8 opacity-40 grayscale pointer-events-none">
            <div className="text-xl font-bold flex items-center justify-center">Google</div>
            <div className="text-xl font-bold flex items-center justify-center">Microsoft</div>
            <div className="text-xl font-bold flex items-center justify-center">Stripe</div>
          </div>
        </div>
      </div>
    </div>
  )
}
