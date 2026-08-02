import React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface IconButtonProps extends ButtonProps {
  "aria-label": string // Enforce aria-label for accessibility
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        // Minimum 44x44 tap target for mobile accessibility, fallback to h-10 w-10 for desktop consistency
        className={cn("h-11 w-11 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground shrink-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none", className)}
        {...props}
      />
    )
  }
)
IconButton.displayName = "IconButton"
