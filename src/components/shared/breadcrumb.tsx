import React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Reusable breadcrumb navigation bar.
 *
 * Usage:
 * ```tsx
 * <Breadcrumb items={[
 *   { label: "Home", href: "/" },
 *   { label: "Job Roles", href: "/job-roles" },
 *   { label: "Java Developer" },  // no href = current page (not linked)
 * ]} />
 * ```
 */
export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="h-4 w-4 shrink-0" />}
            {isLast || !item.href ? (
              <span
                className={isLast ? "text-foreground font-medium truncate" : ""}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
