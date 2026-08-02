"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/auth.store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from "./logo"

interface PublicLayoutProps {
  children: React.ReactNode
  className?: string
}

export function PublicLayout({ children, className }: PublicLayoutProps) {
  const { user, isAuthenticated } = useAuthStore()
  
  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U"
  }

  const navLinks = [
    { name: "Courses", href: "/courses" },
    { name: "Companies", href: "/companies" },
    { name: "Job Roles", href: "/job-roles" },
    { name: "Jobs", href: "/jobs" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/10">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 transition-opacity hover:opacity-80">
            <Logo className="text-3xl" />
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Avatar className="h-9 w-9 shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                    <AvatarImage src={user?.profileImage || user?.avatarUrl || "https://github.com/shadcn.png"} />
                    <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                  </Avatar>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Log in
                </Link>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex md:hidden">
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="-mr-2" />}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col border-l">
                <SheetHeader className="text-left pb-6 border-b">
                  <SheetTitle>
                    <Link href="/" className="inline-flex">
                      <Logo className="text-2xl" />
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-4 flex-1 overflow-y-auto px-1">
                  {navLinks.map((link) => (
                    <Link key={link.name} href={link.href} className="px-4 py-3 rounded-xl text-base font-medium hover:bg-primary/10 hover:text-primary transition-all active:scale-95">
                      {link.name}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto border-t pt-6 pb-4 flex flex-col gap-4">
                  {isAuthenticated ? (
                    <Link href="/dashboard" className="w-full">
                      <Button className="w-full gap-3 h-12 text-base rounded-xl" size="lg">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user?.profileImage || user?.avatarUrl || "https://github.com/shadcn.png"} />
                          <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                        </Avatar>
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="h-12 rounded-xl text-base" asChild>
                        <Link href="/login">Log in</Link>
                      </Button>
                      <Button className="h-12 rounded-xl text-base" asChild>
                        <Link href="/register">Get Started</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className={cn("flex-1", className)}>
        {children}
      </main>

      <footer className="border-t py-12 md:py-16 bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 transition-opacity hover:opacity-80">
              <Logo className="text-2xl text-muted-foreground" />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Learn. Build. Prepare. Get Hired. The premier career preparation ecosystem for engineers.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Platform</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/courses" className="hover:text-foreground transition-colors">Courses</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Projects</Link></li>
              <li><Link href="/companies" className="hover:text-foreground transition-colors">Companies</Link></li>
              <li><Link href="/jobs" className="hover:text-foreground transition-colors">Jobs</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Connect</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Discord</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Kredl. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
