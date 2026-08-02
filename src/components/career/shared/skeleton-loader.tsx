import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function CardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border bg-card p-6 h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      <div className="space-y-2 mb-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="mt-auto pt-4 border-t space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="w-full">
      <div className="h-64 md:h-80 w-full bg-surface border-b mb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <Skeleton className="h-12 w-3/4 max-w-md mb-4" />
          <Skeleton className="h-6 w-full max-w-xl mb-8" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-full max-w-md rounded-xl" />
            <Skeleton className="h-12 w-24 rounded-xl" />
          </div>
        </div>
      </div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}
