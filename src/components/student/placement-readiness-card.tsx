import React from "react"
import { Target, CheckCircle2 } from "lucide-react"

interface PlacementModuleProgress {
  title: string
  progress: number
  isCompleted: boolean
}

interface PlacementReadinessCardProps {
  overallProgress?: number
  modules?: PlacementModuleProgress[]
}

export function PlacementReadinessCard({ overallProgress, modules }: PlacementReadinessCardProps) {
  // If there's no data (course doesn't exist yet or user not enrolled), provide dummy data for visualization
  const defaultModules = [
    { title: "Aptitude", progress: 100, isCompleted: true },
    { title: "Logical", progress: 60, isCompleted: false },
    { title: "HR Interview", progress: 40, isCompleted: false },
    { title: "Technical Interview", progress: 15, isCompleted: false },
    { title: "Group Discussion", progress: 0, isCompleted: false },
  ]
  
  const displayModules = modules && modules.length > 0 ? modules : defaultModules

  return (
    <div className="p-6 border rounded-xl bg-background shadow-sm hover:border-primary/50 transition-colors group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg tracking-tight">Placement Readiness</h3>
          </div>
          <p className="text-xs text-muted-foreground">Your progress in the Placement Prep track</p>
        </div>
        <div className="flex flex-col items-end justify-center">
          <span className="text-3xl font-black text-primary">{overallProgress !== undefined ? overallProgress : 72}%</span>
        </div>
      </div>

      <div className="space-y-3">
        {displayModules.map((mod, i) => (
          <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-surface/50">
            <span className="text-sm font-medium">{mod.title}</span>
            {mod.isCompleted ? (
              <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-md border border-success/20 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Done
              </span>
            ) : (
              <span className="text-xs font-semibold text-muted-foreground px-2 py-1 rounded-md bg-muted/50">
                {mod.progress}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
