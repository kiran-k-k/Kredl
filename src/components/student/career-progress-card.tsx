import React from "react"
import { Progress } from "@/components/ui/progress"
import { Target, Trophy, Clock } from "lucide-react"

export interface CareerProgressProps {
  careerGoal: string
  overallProgress: number
  currentModule: string
  nextModule: string
  currentProject: string
  estimatedCompletion: string
}

export function CareerProgressCard({
  careerGoal,
  overallProgress,
  currentModule,
  nextModule,
  currentProject,
  estimatedCompletion
}: CareerProgressProps) {
  return (
    <div className="p-6 md:p-8 border rounded-2xl bg-background shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-8">
      {/* Background Decorator */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      
      <div className="flex-1 z-10 space-y-6">
        <div className="flex items-center gap-3 text-primary">
          <Target className="h-6 w-6" />
          <h2 className="text-xl font-bold tracking-tight">Career Goal: {careerGoal}</h2>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-sm font-medium text-muted-foreground">Overall Readiness</span>
            <span className="text-2xl font-bold">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Current Module</p>
            <p className="font-medium">{currentModule}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Up Next</p>
            <p className="font-medium text-muted-foreground">{nextModule}</p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-64 shrink-0 flex flex-col gap-4 z-10 border-t md:border-t-0 pt-6 md:pt-0 md:pl-8 md:border-l border-border/50 justify-center">
        <div className="flex gap-3">
          <Trophy className="h-5 w-5 text-warning shrink-0" />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-0.5">Active Project</p>
            <p className="font-medium text-sm leading-tight">{currentProject}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-0.5">Estimated Completion</p>
            <p className="font-medium text-sm leading-tight">{estimatedCompletion}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
