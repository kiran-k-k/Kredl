import React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Layers, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToggleBookmark, useIsBookmarked } from "@/hooks/useBookmarks"

export interface CourseCardProps {
  id: string
  slug: string
  title: string
  description: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  modules: number
  progress?: number
  isEnrolled?: boolean
  thumbnail?: string
}

export function CourseCard({
  id,
  slug,
  title,
  description,
  difficulty,
  duration,
  modules,
  progress,
  isEnrolled,
  thumbnail = "/placeholder-course.svg",
}: CourseCardProps) {
  const isBookmarked = useIsBookmarked(id)
  const { mutate: toggleBookmark, isPending: isTogglingBookmark } = useToggleBookmark(id, "course")

  return (
    <div className="group relative flex flex-col rounded-2xl border border-white/10 dark:border-white/5 bg-background/50 backdrop-blur-xl text-card-foreground shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 overflow-hidden z-10">
      {/* Thumbnail */}
      <div className="aspect-video w-full bg-muted overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10 pointer-events-none opacity-50 group-hover:opacity-30 transition-opacity duration-300"></div>
        {thumbnail && thumbnail !== "/placeholder-course.svg" ? (
          <img src={thumbnail} alt={title} className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-50 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500">
            <BookOpen className="h-10 w-10 text-muted-foreground transform group-hover:scale-110 transition-transform duration-500" />
          </div>
        )}
        
        {/* Bookmark Button */}
        <button
          onClick={(e) => { e.preventDefault(); toggleBookmark(); }}
          disabled={isTogglingBookmark}
          className="absolute top-3 left-3 z-20 p-2 bg-background/80 hover:bg-background rounded-full shadow-sm transition-colors border border-border"
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>

        {/* Floating difficulty badge over image */}
        <div className="absolute top-3 right-3 z-20">
          <Badge 
            variant="outline" 
            className={`text-xs font-semibold px-3 py-1 shadow-md backdrop-blur-md border-0 ${
              difficulty === "Beginner" 
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                : difficulty === "Intermediate" 
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" 
                  : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
            }`}
          >
            {difficulty}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 relative z-20">
        <h3 className="font-bold text-xl tracking-tight leading-tight mb-2 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1 leading-relaxed">
          {description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-5 text-xs font-medium text-muted-foreground mb-6 bg-surface/50 p-3 rounded-xl border">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary/70" />
            {duration}
          </div>
          <div className="w-1 h-1 rounded-full bg-border"></div>
          <div className="flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-primary/70" />
            {modules} Modules
          </div>
        </div>

        {/* Progress or CTA */}
        {isEnrolled && progress !== undefined ? (
          <div className="mt-auto">
            <div className="flex justify-between items-center text-xs font-bold mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-muted overflow-hidden" />
            <Button asChild className="w-full mt-5 h-11 rounded-xl shadow-md transition-transform hover:scale-[1.02] active:scale-95" variant="default">
              <Link href={`/learn/${slug}/lesson-1`}>Continue Learning</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-auto">
            <Button asChild className="w-full h-11 rounded-xl font-semibold shadow-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-[1.02] active:scale-95">
              <Link href={`/courses/${slug}`}>View Syllabus</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
