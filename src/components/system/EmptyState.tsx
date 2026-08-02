import React from "react"
import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  actionHref,
  className,
  ...props 
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 min-h-[300px] border border-dashed rounded-xl bg-surface/30",
        className
      )}
      {...props}
    >
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" className="shadow-sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
