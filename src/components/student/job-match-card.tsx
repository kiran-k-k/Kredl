import React from "react"
import { Building2, MapPin, IndianRupee, BookmarkPlus, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export interface JobMatchProps {
  id: string
  company: string
  role: string
  matchPercentage: number
  location: string
  salary?: string
}

export function JobMatchCard({
  id,
  company,
  role,
  matchPercentage,
  location,
  salary
}: JobMatchProps) {
  return (
    <div className="p-5 border rounded-xl bg-background shadow-sm group hover:border-primary/50 transition-colors flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="h-10 w-10 rounded-lg bg-surface border flex items-center justify-center">
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="bg-success/10 text-success text-xs font-bold px-2 py-1 rounded-full border border-success/20">
          {matchPercentage}% Match
        </div>
      </div>
      
      <div className="mb-4 flex-1">
        <h3 className="font-bold leading-tight line-clamp-1 mb-1 group-hover:text-primary transition-colors">{role}</h3>
        <p className="text-sm text-muted-foreground">{company}</p>
      </div>

      <div className="space-y-2 text-xs font-medium text-muted-foreground mb-4">
        <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {location}</div>
        {salary && <div className="flex items-center gap-2"><IndianRupee className="h-3.5 w-3.5" /> {salary}</div>}
      </div>

      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border/50">
        <Button variant="default" className="flex-1 h-9 text-xs gap-1" asChild>
          <Link href={`/jobs/${id}`}>View Job <ArrowUpRight className="h-3 w-3" /></Link>
        </Button>
        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground">
          <BookmarkPlus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
