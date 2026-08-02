import React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Monitor, Code, Brain, Cloud, Shield, Cpu, Smartphone,
  Palette, Network, Database, TrendingUp, IndianRupee, Building, Star, Bookmark
} from "lucide-react"
import { useToggleBookmark, useIsBookmarked } from "@/hooks/useBookmarks"
import type { JobRoleListItem } from "@/types/job-role"

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Software Development": Code,
  "Artificial Intelligence": Brain,
  "Data Science": TrendingUp,
  "Cloud & DevOps": Cloud,
  "Cybersecurity": Shield,
  "Embedded Systems": Cpu,
  "Mobile Development": Smartphone,
  "UI/UX Design": Palette,
  "Networking": Network,
  "Database Administration": Database,
}

const EXPERIENCE_COLORS: Record<string, string> = {
  "Fresher": "bg-success/10 text-success border-success/20",
  "0–2 Years": "bg-primary/10 text-primary border-primary/20",
  "2–5 Years": "bg-warning/10 text-warning border-warning/20",
  "5+ Years": "bg-destructive/10 text-destructive border-destructive/20",
}

export interface RoleCardProps {
  id: string
  slug: string
  title: string
  description: string
  category?: string
  experienceLevel?: string
  salaryInfo?: { fresherRange?: string; averageSalary?: string } | null
  salaryRange?: string
  skillsCount: number
  companiesHiringCount: number
  isFeatured?: boolean
}

export function RoleCard({
  id,
  slug,
  title,
  description,
  category = "Software Development",
  experienceLevel,
  salaryInfo,
  salaryRange,
  skillsCount,
  companiesHiringCount,
  isFeatured,
}: RoleCardProps) {
  const isBookmarked = useIsBookmarked(id)
  const { mutate: toggleBookmark, isPending: isTogglingBookmark } = useToggleBookmark(id, "role")

  const Icon = CATEGORY_ICONS[category] ?? Monitor
  const salaryDisplay = salaryInfo?.fresherRange ?? salaryRange ?? "—"

  return (
    <div className="group relative flex flex-col rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5 p-6 h-full">
      {isFeatured && (
        <div className="absolute top-4 right-4">
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <Star className="h-3 w-3 fill-amber-500" /> Featured
          </span>
        </div>
      )}
      
      {!isFeatured && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={(e) => { e.preventDefault(); toggleBookmark(); }}
            disabled={isTogglingBookmark}
            className="p-1.5 hover:bg-muted rounded-full transition-colors"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
          </button>
        </div>
      )}

      {isFeatured && (
        <div className="absolute top-12 right-4 z-10">
          <button
            onClick={(e) => { e.preventDefault(); toggleBookmark(); }}
            disabled={isTogglingBookmark}
            className="p-1.5 hover:bg-muted rounded-full transition-colors"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
          </button>
        </div>
      )}

      <div className="flex items-start gap-3 mb-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <Badge variant="secondary" className="text-xs mb-1">{category}</Badge>
          {experienceLevel && (
            <div className={`inline-flex items-center text-xs font-medium border px-2 py-0.5 rounded-full ml-1.5 ${EXPERIENCE_COLORS[experienceLevel] ?? "bg-secondary text-secondary-foreground"}`}>
              {experienceLevel}
            </div>
          )}
        </div>
      </div>

      <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-5 flex-1">
        {description}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface border">
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium uppercase tracking-wide">
            <IndianRupee className="h-3.5 w-3.5" /> Salary
          </span>
          <span className="font-semibold text-sm truncate">{salaryDisplay}</span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface border">
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium uppercase tracking-wide">
            <Building className="h-3.5 w-3.5" /> Demand
          </span>
          <span className="font-semibold text-sm">{companiesHiringCount}+ Companies</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t">
        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5 text-success" />
          {skillsCount} Skills Required
        </div>
        <Button variant="ghost" size="sm" asChild className="group-hover:text-primary group-hover:bg-primary/10 font-semibold">
          <Link href={`/job-roles/${slug}`}>View Guide →</Link>
        </Button>
      </div>
    </div>
  )
}
