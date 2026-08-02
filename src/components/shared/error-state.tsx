import React from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  title?: string
  message?: string
  /** Called when the user clicks "Try Again". If omitted, retry button is hidden. */
  onRetry?: () => void
  /** Optional extra action button */
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * Reusable error state card for data-fetching failures.
 *
 * Usage:
 * ```tsx
 * <ErrorState
 *   title="Failed to load job roles"
 *   message="An error occurred while fetching data."
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  action,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 text-center border rounded-2xl bg-surface/50 border-dashed ${className}`}
    >
      <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mb-5">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm text-sm">{message}</p>
      <div className="flex items-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Try Again
          </Button>
        )}
        {action && (
          <Button onClick={action.onClick} variant="default">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}
