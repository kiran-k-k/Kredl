import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ModuleSkeleton: React.FC = () => {
  return (
    <Card className="relative overflow-hidden border-slate-200/60 bg-white/50">
      {/* Top line skeleton */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100" />
      
      <CardHeader className="pt-6 pb-4">
        <div className="flex justify-between items-start gap-4 mb-2.5">
          <div className="space-y-2 w-2/3">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-5 w-full" />
          </div>
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
        <div className="space-y-1.5 mt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </CardHeader>

      <CardContent className="py-2 space-y-4">
        {/* Meta skeleton */}
        <div className="flex gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        {/* Progress bar skeleton */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </CardContent>

      <CardFooter className="pt-4 pb-5 flex justify-end">
        <Skeleton className="h-10 w-32 rounded-md" />
      </CardFooter>
    </Card>
  );
};
