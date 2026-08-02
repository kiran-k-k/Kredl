"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { useUnreadNotificationsCount } from "@/hooks/useNotifications"
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  BarChart3, 
  Megaphone,
  LogOut,
  Search,
  Bell,
  Menu,
  Sun,
  Moon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const TPO_NAV = [
  { name: "Dashboard", href: "/tpo", icon: LayoutDashboard },
  { name: "Students", href: "/tpo/students", icon: Users },
  { name: "Placement Drives", href: "/tpo/drives", icon: Briefcase },
  { name: "Reports", href: "/tpo/reports", icon: BarChart3 },
  { name: "Announcements", href: "/tpo/announcements", icon: Megaphone },
]

export function TpoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const { user, logout } = useAuthStore()
  const { data: unreadCount = 0 } = useUnreadNotificationsCount()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const sidebarContent = (

    <div className="flex flex-col h-full bg-surface border-r border-border">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/tpo" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">K</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Kredl TPO</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {TPO_NAV.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="h-10 w-10 border shadow-sm">
            <AvatarImage src={user?.profileImage || "https://github.com/shadcn.png"} />
            <AvatarFallback>{user?.firstName?.[0] || "T"}{user?.lastName?.[0] || "P"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none">{user?.firstName || "TPO"} {user?.lastName || "Officer"}</span>
            <span className="text-xs text-muted-foreground mt-1">{user?.email || "tpo@college.edu"}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-destructive gap-3"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen bg-background flex ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Main Layout Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b bg-surface/50 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            
            {/* Mobile Menu Toggle */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden -ml-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-r-0">
                {sidebarContent}
              </SheetContent>
            </Sheet>

            {/* Global Search */}
            <div className="hidden sm:flex relative w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search students, drives, reports..." 
                className="pl-9 h-10 bg-background border-muted shadow-sm transition-all focus-visible:ring-1 focus-visible:ring-primary"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <kbd className="hidden lg:inline-flex items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">⌘</kbd>
                <kbd className="hidden lg:inline-flex items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">K</kbd>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <div className="relative">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Bell className="h-5 w-5" />
              </Button>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-surface"></span>
              )}
            </div>
            
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border shadow-sm sm:hidden">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">TP</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
