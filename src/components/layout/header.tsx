"use client"

import React from "react"
import { Bell, Search, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { ThemeToggle } from "./theme-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Check, Info, Bookmark, LayoutDashboard, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { useUnreadNotificationsCount, useLatestNotifications, useMarkAllAsRead } from "@/hooks/useNotifications"
const formatDistanceToNow = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};
import { MobileNav } from "./mobile-nav"
import { Logo } from "./logo"

export function Header() {
  const { user } = useAuthStore()
  const { data: unreadCount = 0 } = useUnreadNotificationsCount()
  const { data: notifications = [] } = useLatestNotifications(5)
  const { mutate: markAllAsRead } = useMarkAllAsRead()
  const logout = useAuthStore((state) => state.logout)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("q") as string
    if (query) {
      router.push(`/courses?search=${encodeURIComponent(query)}`)
    } else {
      router.push(`/courses`)
    }
  }

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
      
      {/* Mobile left section */}
      <div className="flex items-center gap-2 lg:hidden">
        <MobileNav 
          isOpen={isMobileMenuOpen} 
          setIsOpen={setIsMobileMenuOpen} 
        />

        <Link href="/">
          <Logo className="text-3xl" />
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-end lg:justify-between gap-4">
        {/* Desktop Search */}
        <form onSubmit={handleSearch} className="hidden lg:flex w-full max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            name="q"
            placeholder="Search resources, courses..." 
            className="pl-9 bg-surface/50 border-border/50 h-10 w-full rounded-full transition-all focus:bg-background"
          />
        </form>
        
        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="lg:hidden flex items-center">
            {/* Mobile search button (links to courses page) */}
            <Button variant="ghost" size="icon" className="sm:hidden rounded-full h-9 w-9" asChild>
              <Link href="/courses">
                <Search className="h-5 w-5 text-muted-foreground" />
              </Link>
            </Button>
            
            {/* Tablet search input */}
            <form onSubmit={handleSearch} className="hidden sm:block relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                name="q"
                placeholder="Search..." 
                className="pl-9 bg-surface/50 border-border/50 h-9 w-full rounded-full text-sm"
              />
            </form>
          </div>
          
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
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
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

          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none rounded-full">
              <Avatar className="h-9 w-9 shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all ml-1">
                <AvatarImage src={user?.profileImage || user?.avatarUrl || "https://github.com/shadcn.png"} />
                <AvatarFallback>{user ? getInitials(user.firstName, user.lastName) : "KR"}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer flex w-full items-center" onClick={() => window.location.href = "/dashboard"}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer flex w-full items-center" onClick={() => window.location.href = "/dashboard/bookmarks"}>
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span>Bookmarks</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
