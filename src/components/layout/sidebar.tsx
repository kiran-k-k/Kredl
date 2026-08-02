"use client"

import React from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SIDEBAR_ITEMS, BOTTOM_SIDEBAR_ITEMS } from "@/config/navigation"
import { LogOut } from "lucide-react"
import { useAuthStore } from "@/store/auth.store"
import { Logo } from "./logo"

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center gap-2 px-6">

        <Link href="/" className="flex items-center gap-2">
          <Logo className="text-3xl" />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-3">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              {item.name}
            </Link>
          )
        })}
        
        <div className="mt-auto pt-6 pb-2 border-t flex flex-col gap-1">
          {BOTTOM_SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                {item.name}
              </Link>
            )
          })}
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
          >
            <LogOut className="h-5 w-5 text-destructive" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
