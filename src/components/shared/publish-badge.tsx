import React from "react"
import { Eye, EyeOff, Star } from "lucide-react"

interface PublishBadgeProps {
  isPublished: boolean
  className?: string
}

interface FeaturedBadgeProps {
  isFeatured: boolean
  className?: string
}

/**
 * Displays a pill badge indicating publish status.
 * Used in admin tables and forms.
 */
export function PublishBadge({ isPublished, className = "" }: PublishBadgeProps) {
  return isPublished ? (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border text-success bg-success/10 border-success/20 ${className}`}
    >
      <Eye className="h-3.5 w-3.5" /> Published
    </span>
  ) : (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border text-muted-foreground bg-secondary border-transparent ${className}`}
    >
      <EyeOff className="h-3.5 w-3.5" /> Draft
    </span>
  )
}

/**
 * Displays a pill badge indicating featured status.
 * Used in admin tables and listing cards.
 */
export function FeaturedBadge({ isFeatured, className = "" }: FeaturedBadgeProps) {
  if (!isFeatured) return null
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border text-amber-500 bg-amber-500/10 border-amber-500/20 ${className}`}
    >
      <Star className="h-3.5 w-3.5 fill-amber-500" /> Featured
    </span>
  )
}
