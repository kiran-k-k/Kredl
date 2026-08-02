import React from "react"
import { cn } from "@/lib/utils"

export interface QuizSidebarProps {
  totalQuestions: number
  currentQuestion: number
  answeredQuestions: number[]
  onQuestionSelect: (index: number) => void
}

export function QuizSidebar({
  totalQuestions,
  currentQuestion,
  answeredQuestions,
  onQuestionSelect
}: QuizSidebarProps) {
  
  const questionArray = Array.from({ length: totalQuestions }, (_, i) => i + 1)

  return (
    <div className="w-full flex flex-col h-full bg-surface border-r overflow-y-auto">
      <div className="p-6 border-b sticky top-0 bg-surface z-10">
        <h2 className="font-bold tracking-tight mb-2">Question Navigator</h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Answered</span>
          <span className="font-bold text-success">{answeredQuestions.length}/{totalQuestions}</span>
        </div>
      </div>
      
      <div className="p-6 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 gap-3">
        {questionArray.map((q) => {
          const isCurrent = currentQuestion === q
          const isAnswered = answeredQuestions.includes(q)
          
          return (
            <button
              key={q}
              onClick={() => onQuestionSelect(q)}
              className={cn(
                "h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isCurrent 
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-surface" 
                  : isAnswered
                    ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                    : "bg-background text-muted-foreground border border-border hover:border-muted-foreground/30 hover:text-foreground"
              )}
              aria-label={`Question ${q} ${isCurrent ? "(Current)" : isAnswered ? "(Answered)" : "(Unanswered)"}`}
              aria-current={isCurrent ? "step" : undefined}
            >
              {q}
            </button>
          )
        })}
      </div>
      
      <div className="mt-auto p-6 text-xs text-muted-foreground space-y-2 border-t bg-background/50">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-primary/10 border border-primary/20"></div>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-background border border-border"></div>
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-primary ring-2 ring-primary ring-offset-1"></div>
          <span>Current</span>
        </div>
      </div>
    </div>
  )
}
