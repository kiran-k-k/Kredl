"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { useUnreadNotificationsCount, useLatestNotifications, useMarkAllAsRead } from "@/hooks/useNotifications"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const formatDistanceToNow = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};
import { 
  LayoutDashboard, 
  Users, 
  Library, 
  FolderTree, 
  PlaySquare, 
  FileText,
  Building2,
  Briefcase,
  UserCheck,
  Megaphone,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  Sun,
  Moon,
  MessageSquare,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/layout/theme-toggle"

const ADMIN_NAV = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Courses", href: "/admin/courses", icon: Library },
  { name: "Modules", href: "/admin/modules", icon: FolderTree },
  { name: "Lessons", href: "/admin/lessons", icon: PlaySquare },
  { name: "Quizzes", href: "/admin/quizzes", icon: FileText },
  { name: "Quiz Analytics", href: "/admin/analytics", icon: FileText },
  { name: "Notes", href: "/admin/notes", icon: FileText },
  { name: "Companies", href: "/admin/companies", icon: Building2 },
  { name: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { name: "Job Roles", href: "/admin/job-roles", icon: UserCheck },
  { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const { data: unreadCount = 0 } = useUnreadNotificationsCount()
  const { data: notifications = [] } = useLatestNotifications(5)
  const { mutate: markAllAsRead } = useMarkAllAsRead()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface border-r">
      <div className="h-16 flex items-center px-6 border-b shrink-0">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            K
          </div>
          <span className="font-bold text-xl tracking-tight">Kredl Admin</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {ADMIN_NAV.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-background border shadow-sm">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImage || "https://github.com/shadcn.png"} />
            <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-bold truncate">{user?.firstName} {user?.lastName}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-background selection:bg-primary/20">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 fixed inset-y-0 z-20">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        
        {/* Top Navigation */}
        <header className="h-16 sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b flex items-center justify-between px-4 md:px-8">
          
          <div className="flex items-center gap-4 flex-1">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            {/* Global Search */}
            <div className="hidden sm:flex relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search anything... (Cmd+K)" 
                className="pl-9 bg-background border-muted h-9 text-sm focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger className="relative shrink-0 rounded-full h-9 w-9 inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background"></span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Notifications</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {unreadCount > 0 ? `You have ${unreadCount} unread messages` : 'No unread messages'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notification: any) => (
                        <div key={notification.id}>
                          <DropdownMenuItem className="cursor-pointer flex items-start gap-3 p-3">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notification.isRead ? 'bg-slate-100' : 'bg-primary/10'}`}>
                              <Info className={`h-4 w-4 ${notification.isRead ? 'text-slate-500' : 'text-primary'}`} />
                            </div>
                            <div className="flex flex-col space-y-1">
                              <p className={`text-sm leading-none ${notification.isRead ? 'font-normal text-muted-foreground' : 'font-medium'}`}>{notification.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt))}
                              </p>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </div>
                      ))
                    )}
                  </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="w-full justify-center text-center text-sm font-medium text-primary cursor-pointer"
                  onClick={() => {
                    if (unreadCount > 0) {
                      markAllAsRead()
                    }
                  }}
                >
                  Mark all as read
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Avatar className="h-8 w-8 ml-2 cursor-pointer border sm:hidden">
              <AvatarImage src={user?.profileImage || "https://github.com/shadcn.png"} />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
