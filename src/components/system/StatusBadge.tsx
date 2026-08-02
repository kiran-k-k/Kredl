import React from "react"
import { cn } from "@/lib/utils"

export type StatusVariant = "success" | "warning" | "destructive" | "default"

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string
  variant?: StatusVariant
}

export function StatusBadge({ status, variant, className, ...props }: StatusBadgeProps) {
  
  // Auto-map common statuses if variant is not explicitly provided
  let computedVariant: StatusVariant = variant || "default"
  
  if (!variant) {
    const s = status.toLowerCase()
    if (s.includes("active") || s.includes("placed") || s.includes("published") || s.includes("success") || s.includes("open") || s.includes("ongoing")) {
      computedVariant = "success"
    } else if (s.includes("draft") || s.includes("interviewing") || s.includes("scheduled") || s.includes("warning") || s.includes("pending")) {
      computedVariant = "warning"
    } else if (s.includes("not") || s.includes("expired") || s.includes("closed") || s.includes("destructive") || s.includes("high")) {
      computedVariant = "destructive"
    }
  }

  const variantStyles = {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    default: "bg-muted text-muted-foreground border-border",
  }

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border",
        variantStyles[computedVariant],
        className
      )}
      {...props}
    >
      {status}
    </span>
  )
}
