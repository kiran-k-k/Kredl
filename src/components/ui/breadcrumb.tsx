"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export function Breadcrumb() {
  const pathname = usePathname()
  
  if (!pathname || pathname === "/") return null

  // Remove trailing slashes and split by '/'
  const segments = pathname.split('/').filter((segment) => segment !== '')

  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center text-sm text-muted-foreground">
      <ol className="flex items-center space-x-2">
        <li>
          <Link 
            href="/dashboard" 
            className="flex items-center hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        
        {segments.map((segment, index) => {
          // If first segment is dashboard, we already showed Home icon, but let's show "Dashboard" text instead
          if (index === 0 && segment === "dashboard") {
            return (
              <li key={segment} className="flex items-center space-x-2">
                <ChevronRight className="h-4 w-4 shrink-0" />
                <Link
                  href="/dashboard"
                  className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm capitalize font-medium text-foreground"
                  aria-current={index === segments.length - 1 ? "page" : undefined}
                >
                  Dashboard
                </Link>
              </li>
            )
          }

          const href = `/${segments.slice(0, index + 1).join('/')}`
          const isLast = index === segments.length - 1
          
          // Format segment text (e.g., job-roles -> Job Roles)
          const formattedText = segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase())

          return (
            <li key={segment} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4 shrink-0" />
              {isLast ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {formattedText}
                </span>
              ) : (
                <Link 
                  href={href}
                  className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                >
                  {formattedText}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
