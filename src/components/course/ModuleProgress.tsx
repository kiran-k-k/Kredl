import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ModuleProgressProps {
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

export const ModuleProgress: React.FC<ModuleProgressProps> = ({
  progress,
  completedLessons,
  totalLessons,
}) => {
  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground font-medium">
          {completedLessons}/{totalLessons} Lessons
        </span>
        <span className="text-foreground font-bold">{Math.round(progress)}% Completed</span>
      </div>
      <Progress value={progress} className="h-2 bg-slate-100" />
    </div>
  );
};
