import React from "react"
import { SearchX, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface EmptyStateProps {
  title?: string
  message?: string
  onReset?: () => void
}

export function EmptyState({ 
  title = "No results found", 
  message = "Try adjusting your filters or search terms to find what you're looking for.",
  onReset
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl bg-surface/50 border-dashed px-4">
      <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <SearchX className="h-10 w-10 text-primary opacity-80" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        {message}
      </p>
      {onReset && (
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="outline" onClick={onReset} className="gap-2 h-11">
            <RotateCcw className="h-4 w-4" /> Reset Filters
          </Button>
          <Button className="h-11">Browse All</Button>
        </div>
      )}
    </div>
  )
}
