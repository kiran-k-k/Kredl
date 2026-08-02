import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Lock, CheckCircle2, Play, BookOpen, AlertCircle, HelpCircle } from 'lucide-react';

interface ModuleStatusBadgeProps {
  locked: boolean;
  completed: boolean;
  progress: number;
  lessonsCompleted?: boolean;
  quizAvailable?: boolean;
  quizPassed?: boolean;
  quizFailed?: boolean;
}

export const ModuleStatusBadge: React.FC<ModuleStatusBadgeProps> = ({
  locked,
  completed,
  progress,
  lessonsCompleted,
  quizAvailable,
  quizPassed,
  quizFailed,
}) => {
  if (locked) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1 bg-slate-100 text-slate-500 border border-slate-200 py-1 px-2.5 shadow-none">
        <Lock className="w-3.5 h-3.5" />
        <span className="text-xs font-bold">Locked</span>
      </Badge>
    );
  }

  if (completed || quizPassed) {
    return (
      <Badge className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 border border-emerald-500/20 py-1 px-2.5 shadow-none">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-xs font-bold">Completed</span>
      </Badge>
    );
  }

  if (quizFailed) {
    return (
      <Badge className="flex items-center gap-1 bg-destructive/10 hover:bg-destructive/15 text-destructive border border-destructive/20 py-1 px-2.5 shadow-none">
        <AlertCircle className="w-3.5 h-3.5 text-destructive" />
        <span className="text-xs font-bold">Quiz Failed</span>
      </Badge>
    );
  }

  if (quizAvailable) {
    return (
      <Badge className="flex items-center gap-1 bg-orange-500/10 hover:bg-orange-500/15 text-orange-600 border border-orange-500/20 py-1 px-2.5 shadow-none animate-pulse">
        <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
        <span className="text-xs font-bold">Ready for Quiz</span>
      </Badge>
    );
  }

  if (lessonsCompleted) {
    return (
      <Badge className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 border border-amber-500/20 py-1 px-2.5 shadow-none">
        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-xs font-bold">Lessons Complete</span>
      </Badge>
    );
  }

  if (progress > 0) {
    return (
      <Badge className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 border border-amber-500/20 py-1 px-2.5 shadow-none">
        <Play className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span className="text-xs font-bold">In Progress</span>
      </Badge>
    );
  }

  return (
    <Badge className="flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/15 text-blue-600 border border-blue-500/20 py-1 px-2.5 shadow-none">
      <BookOpen className="w-3.5 h-3.5 text-blue-500" />
      <span className="text-xs font-bold">Start Learning</span>
    </Badge>
  );
};
