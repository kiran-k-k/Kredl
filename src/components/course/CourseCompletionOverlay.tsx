import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, Calendar, CheckSquare, Layers, Home } from 'lucide-react';
import Link from 'next/link';

interface CourseCompletionOverlayProps {
  courseTitle: string;
  completionDate?: Date | string;
  totalLessons: number;
  totalModules: number;
}

export const CourseCompletionOverlay: React.FC<CourseCompletionOverlayProps> = ({
  courseTitle,
  completionDate,
  totalLessons,
  totalModules,
}) => {
  const formattedDate = completionDate
    ? new Date(completionDate).toLocaleDateString(undefined, {
        dateStyle: 'long',
      })
    : new Date().toLocaleDateString(undefined, { dateStyle: 'long' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 select-none animate-fade-in">
      <Card className="max-w-md w-full p-8 text-center border border-amber-200/80 shadow-2xl rounded-2xl space-y-6 bg-white animate-in zoom-in-95 duration-300">
        {/* Animated Trophy badge */}
        <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-amber-500 animate-pulse">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
            Course Completed!
          </span>
          <h2 className="text-2xl font-black text-slate-900 leading-tight">
            🎉 Congratulations!
          </h2>
          <p className="text-xs font-bold text-slate-650 px-2 leading-relaxed">
            You have fully mastered the path of <span className="text-amber-650">{courseTitle}</span>!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50/70 border border-slate-100 rounded-xl text-left">
          <div className="space-y-1">
            <span className="text-[9px] font-semibold text-slate-400 uppercase flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-350" />
              Completed
            </span>
            <p className="text-xs font-bold text-slate-800 truncate">{formattedDate}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-semibold text-slate-400 uppercase flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-slate-350" />
              Lessons
            </span>
            <p className="text-xs font-bold text-slate-800">{totalLessons} finished</p>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-semibold text-slate-400 uppercase flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-350" />
              Modules
            </span>
            <p className="text-xs font-bold text-slate-800">{totalModules} completed</p>
          </div>
        </div>

        <div className="pt-2">
          <Link href="/dashboard" className="no-underline">
            <Button className="w-full font-bold py-6 rounded-xl text-sm flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg transition-all">
              <Home className="w-4 h-4" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
