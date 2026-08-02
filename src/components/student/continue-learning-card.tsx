import React from "react"
import { PlayCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export interface ContinueLearningProps {
  courseName: string
  moduleName: string
  lessonName: string
  progress: number
  estimatedRemaining: string
  actionHref: string
}

export function ContinueLearningCard({
  courseName,
  moduleName,
  lessonName,
  progress,
  estimatedRemaining,
  actionHref
}: ContinueLearningProps) {
  return (
    <div className="p-6 border rounded-2xl bg-surface shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
      <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <PlayCircle className="h-8 w-8 md:h-10 md:w-10 text-primary" />
      </div>
      
      <div className="flex-1 w-full space-y-2">
        <div className="text-xs font-semibold text-primary uppercase tracking-wider">{courseName} • {moduleName}</div>
        <h3 className="text-lg font-bold leading-tight">{lessonName}</h3>
        
        <div className="pt-2 flex items-center gap-4">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-xs font-medium text-muted-foreground shrink-0">{progress}%</span>
        </div>
        
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
          <Clock className="h-3 w-3" /> {estimatedRemaining} left in this module
        </div>
      </div>
      
      <Button size="lg" className="shrink-0 w-full md:w-auto h-12" asChild>
        <Link href={actionHref}>Resume Learning</Link>
      </Button>
    </div>
  )
}
