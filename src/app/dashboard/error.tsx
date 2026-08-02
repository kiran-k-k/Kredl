"use client" // Error components must be Client Components

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We encountered an error loading this section of the dashboard. Please try again.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  )
}
