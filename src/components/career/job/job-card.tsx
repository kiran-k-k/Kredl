import React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Briefcase, IndianRupee, Clock, Building2, BookmarkPlus, Bookmark } from "lucide-react"
import { useToggleBookmark, useIsBookmarked } from "@/hooks/useBookmarks"

export interface JobCardProps {
  id: string
  companyName: string
  companyLogo?: string
  role: string
  location: string
  experience: string
  salary: string
  postedDate: string
  isRemote: boolean
  isBookmarked?: boolean
  onToggleBookmark?: (e: React.MouseEvent) => void
  isTogglingBookmark?: boolean
  createdAt?: string
  deadline?: string
  status?: string
}

export function JobCard({
  id,
  companyName,
  companyLogo,
  role,
  location,
  experience,
  salary,
  postedDate,
  isRemote,
  isBookmarked = false,
  onToggleBookmark,
  isTogglingBookmark = false,
  createdAt,
  deadline,
  status,
}: JobCardProps) {
  const hookIsBookmarked = useIsBookmarked(id)
  const { mutate: toggleBookmark, isPending: hookIsTogglingBookmark } = useToggleBookmark(id, "job")

  // Use props if provided, otherwise fallback to internal hook state
  const finalIsBookmarked = isBookmarked || hookIsBookmarked
  const finalIsToggling = isTogglingBookmark || hookIsTogglingBookmark
  const handleToggle = onToggleBookmark || ((e: React.MouseEvent) => { e.preventDefault(); toggleBookmark(); })

  const now = new Date()
  const createdDate = createdAt ? new Date(createdAt) : null
  const deadlineDate = deadline ? new Date(deadline) : null
  
  const isNew = createdDate && (now.getTime() - createdDate.getTime()) < 48 * 60 * 60 * 1000
  const isClosingSoon = deadlineDate && (deadlineDate.getTime() - now.getTime()) < 3 * 24 * 60 * 60 * 1000 && deadlineDate.getTime() > now.getTime()
  const isExpired = Boolean(status === 'Expired' || (deadlineDate && deadlineDate.getTime() < now.getTime()))

  return (
    <div className={`relative group flex flex-col sm:flex-row gap-6 rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50 p-6 ${isExpired ? 'opacity-70 grayscale-[0.5]' : ''}`}>
      
      {/* Logo */}
      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-surface flex items-center justify-center shrink-0 border overflow-hidden">
        {companyLogo ? (
          <img src={companyLogo} alt={companyName} className="w-full h-full object-cover" />
        ) : (
          <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50" />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <div>
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
              <Link href={`/jobs/${id}`} className="focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                {role}
              </Link>
            </h3>
            <p className="text-sm font-medium text-foreground">{companyName}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex items-center gap-2">
              {isExpired && (
                <Badge variant="destructive" className="shrink-0">
                  Expired
                </Badge>
              )}
              {isNew && !isExpired && (
                <Badge className="bg-blue-500 hover:bg-blue-600 shrink-0">
                  NEW
                </Badge>
              )}
              {isClosingSoon && !isExpired && (
                <Badge variant="destructive" className="shrink-0">
                  Closing Soon
                </Badge>
              )}
              {isRemote && (
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 shrink-0 hidden sm:inline-flex">
                  Remote
                </Badge>
              )}
            </div>
            {isRemote && (
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 shrink-0 sm:hidden">
                Remote
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mt-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {location}
          </div>
          <div className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4" /> {experience}
          </div>
          <div className="flex items-center gap-1.5">
            <IndianRupee className="h-4 w-4" /> {salary}
          </div>
        </div>
      </div>

      {/* Actions & Meta */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 sm:pl-6 sm:border-l">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" /> {postedDate}
        </span>
        <div className="flex items-center gap-2 w-full sm:w-auto relative z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="shrink-0 h-10 w-10 text-muted-foreground"
            onClick={handleToggle}
            disabled={finalIsToggling}
          >
            {finalIsBookmarked ? <Bookmark className="h-4 w-4 fill-primary text-primary" /> : <Bookmark className="h-4 w-4" />}
          </Button>
          <Button className="flex-1 sm:w-24 h-10" asChild disabled={isExpired}>
            <Link href={`/jobs/${id}`}>{isExpired ? "View" : "Apply"}</Link>
          </Button>
        </div>
      </div>

    </div>
  )
}
