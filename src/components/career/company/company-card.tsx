import React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Briefcase, Bookmark } from "lucide-react"
import { useToggleBookmark, useIsBookmarked } from "@/hooks/useBookmarks"

export interface CompanyCardProps {
  id: string
  slug: string
  name: string
  logo?: string
  description: string
  industry: string
  location: string
  isHiring: boolean
  popularRoles: string[]
}

export function CompanyCard({
  id,
  slug,
  name,
  description,
  industry,
  location,
  isHiring,
  popularRoles,
  logo,
}: CompanyCardProps) {
  const isBookmarked = useIsBookmarked(id)
  const { mutate: toggleBookmark, isPending: isTogglingBookmark } = useToggleBookmark(id, "company")

  return (
    <Link 
      href={`/companies/${slug}`}
      className="group relative flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50 p-6 h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden">
            {logo ? (
              <img src={logo} alt={`${name} logo`} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{name}</h3>
            <p className="text-sm text-muted-foreground">{industry}</p>
          </div>
        </div>
        {isHiring && (
          <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20 shrink-0 mr-10">
            Hiring Now
          </Badge>
        )}
        
        <button
          onClick={(e) => { e.preventDefault(); toggleBookmark(); }}
          disabled={isTogglingBookmark}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors z-10"
        >
          <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
        {description}
      </p>

      <div className="space-y-3 mt-auto pt-4 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Briefcase className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Popular: {popularRoles.join(", ")}</span>
        </div>
      </div>
    </Link>
  )
}
