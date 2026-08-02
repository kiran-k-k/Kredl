import React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          
          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link 
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm px-1 -mx-1"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-bold text-foreground" aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
              
              {!isLast && (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
