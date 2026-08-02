import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock, PlayCircle, Clock, ChevronRight } from 'lucide-react';
import { ModuleLesson } from '@/types/lesson';

interface LessonCardProps {
  lesson: ModuleLesson;
  courseSlug: string;
  moduleSlug: string;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  courseSlug,
  moduleSlug,
}) => {
  const { id, title, slug, duration, order, completed, locked } = lesson;

  const formattedDuration = `${duration} min`;
  const destinationUrl = `/courses/${courseSlug}/modules/${moduleSlug}/lessons/${slug}`;

  // Helper to render completion/lock badge
  const renderStatus = () => {
    if (locked) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-slate-100 text-slate-500 border border-slate-200/60 py-0.5 px-2">
          <Lock className="w-3 h-3" />
          <span className="text-[10px] font-semibold">Locked</span>
        </Badge>
      );
    }
    if (completed) {
      return (
        <Badge className="flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 border border-emerald-500/20 py-0.5 px-2 shadow-none">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-semibold">Completed</span>
        </Badge>
      );
    }
    return (
      <Badge className="flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/15 text-blue-600 border border-blue-500/20 py-0.5 px-2 shadow-none">
        <PlayCircle className="w-3 h-3 text-blue-500" />
        <span className="text-[10px] font-semibold">Start</span>
      </Badge>
    );
  };

  const cardContent = (
    <Card className={`flex items-center justify-between p-4 border border-slate-200/80 transition-all duration-300 ${
      locked 
        ? 'opacity-65 bg-slate-50/50 border-slate-200/50 cursor-not-allowed shadow-none' 
        : 'hover:shadow-md hover:border-slate-300 hover:bg-slate-50/20 cursor-pointer bg-white'
    }`}>
      <div className="flex items-center gap-4 min-w-0">
        {/* Left Side: Number Badge */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
          locked 
            ? 'bg-slate-100 text-slate-400 border-slate-200/50' 
            : completed 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
              : 'bg-primary/5 text-primary border-primary/10'
        }`}>
          {order}
        </div>

        {/* Center: Title & Duration */}
        <div className="space-y-1 min-w-0">
          <h4 className={`text-sm sm:text-base font-bold tracking-tight truncate ${
            locked ? 'text-slate-500' : 'text-slate-800'
          }`}>
            {title}
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDuration}</span>
          </div>
        </div>
      </div>

      {/* Right Side: Status Badge & Chevron */}
      <div className="flex items-center gap-3 shrink-0">
        {renderStatus()}
        {!locked && <ChevronRight className="w-4 h-4 text-slate-400" />}
      </div>
    </Card>
  );

  if (locked) {
    return <div className="select-none">{cardContent}</div>;
  }

  return (
    <Link href={destinationUrl} className="block no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl">
      {cardContent}
    </Link>
  );
};
