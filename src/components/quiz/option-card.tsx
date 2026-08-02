import React from "react"
import { cn } from "@/lib/utils"

export interface OptionCardProps {
  id: string
  text: string
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
  // Optional props for Review Mode
  isCorrectAnswer?: boolean
  isStudentAnswer?: boolean
  showReviewState?: boolean
}

export function OptionCard({
  id,
  text,
  isSelected,
  onClick,
  disabled = false,
  isCorrectAnswer = false,
  isStudentAnswer = false,
  showReviewState = false
}: OptionCardProps) {
  
  let stateClasses = ""
  let circleClasses = ""

  if (showReviewState) {
    // Review Mode Styling
    if (isCorrectAnswer) {
      stateClasses = "bg-success/10 border-success/50 ring-1 ring-success/50"
      circleClasses = "bg-success border-success text-success-foreground"
    } else if (isStudentAnswer && !isCorrectAnswer) {
      stateClasses = "bg-destructive/10 border-destructive/50"
      circleClasses = "bg-destructive border-destructive text-destructive-foreground"
    } else {
      stateClasses = "bg-background border-border opacity-60"
      circleClasses = "border-border bg-background"
    }
  } else {
    // Active Quiz Mode Styling
    if (isSelected) {
      stateClasses = "bg-primary/5 border-primary ring-1 ring-primary"
      circleClasses = "border-primary bg-primary border-4"
    } else {
      stateClasses = "bg-background border-border hover:border-primary/50 hover:bg-surface"
      circleClasses = "border-muted-foreground/30 bg-background"
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full text-left p-5 md:p-6 rounded-2xl border transition-all duration-200 flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        stateClasses,
        disabled && !showReviewState && "opacity-50 cursor-not-allowed"
      )}
      aria-pressed={isSelected}
      id={id}
    >
      <div className={cn(
        "h-6 w-6 rounded-full border-2 shrink-0 mt-0.5 transition-colors flex items-center justify-center",
        circleClasses
      )}>
        {showReviewState && isCorrectAnswer && (
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {showReviewState && isStudentAnswer && !isCorrectAnswer && (
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>
      <span className="text-base font-medium leading-relaxed">{text}</span>
    </button>
  )
}
