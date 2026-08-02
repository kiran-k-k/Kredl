import React from "react"
import { CheckCircle2, Circle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export interface WeeklyGoalProps {
  goalTitle: string
  tasksCompleted: number
  totalTasks: number
  tasks: { title: string; completed: boolean }[]
}

export function WeeklyGoalCard({
  goalTitle,
  tasksCompleted,
  totalTasks,
  tasks
}: WeeklyGoalProps) {
  const percentage = Math.round((tasksCompleted / totalTasks) * 100)

  return (
    <div className="p-6 border rounded-2xl bg-surface shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">{goalTitle}</h3>
        <div className="text-xs font-bold text-muted-foreground bg-background border px-2 py-1 rounded-md">
          {percentage}%
        </div>
      </div>
      
      <Progress value={percentage} className="h-2 mb-6" />

      <div className="space-y-3 flex-1">
        {tasks.map((task, i) => (
          <div key={i} className="flex items-start gap-3">
            {task.completed ? (
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${task.completed ? "text-muted-foreground line-through opacity-70" : "font-medium"}`}>
              {task.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
