import React from 'react';
import Link from 'next/link';
import { SidebarLesson } from '@/types/lesson';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Lock, Play, Clock, ArrowLeft } from 'lucide-react';

interface LessonSidebarProps {
  moduleTitle: string;
  moduleProgress: number;
  sisterLessons: SidebarLesson[];
  courseSlug: string;
  moduleSlug: string;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  moduleTitle,
  moduleProgress,
  sisterLessons,
  courseSlug,
  moduleSlug,
}) => {
  return (
    <div className="w-full flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800">
      {/* Top Header: Navigation Back */}
      <div className="p-4 border-b border-slate-800 shrink-0">
        <Link
          href={`/courses/${courseSlug}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors group mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Course Syllabus
        </Link>
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
          Current Module
        </span>
        <h2 className="text-base font-bold text-slate-100 mt-1 leading-snug line-clamp-2">
          {moduleTitle}
        </h2>
      </div>

      {/* Progress Area */}
      <div className="p-4 bg-slate-950/30 border-b border-slate-800 shrink-0 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-400">Module Completion</span>
          <span className="text-emerald-400 font-bold">{moduleProgress}%</span>
        </div>
        <Progress value={moduleProgress} className="h-1.5 bg-slate-800 [&>div]:bg-emerald-500" />
      </div>

      {/* Lesson List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {sisterLessons.map((les) => {
          const { id, title, slug, duration, order, completed, locked, current } = les;
          const destination = `/courses/${courseSlug}/modules/${moduleSlug}/lessons/${slug}`;

          const lessonCard = (
            <div
              className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-200 select-none ${
                current
                  ? 'bg-primary/10 border-primary/40 text-primary-foreground shadow-sm'
                  : locked
                    ? 'opacity-50 border-transparent cursor-not-allowed'
                    : 'bg-transparent border-transparent hover:bg-slate-800/40 text-slate-300 hover:text-slate-100 cursor-pointer'
              }`}
            >
              {/* Icon marker */}
              <div className="mt-0.5 shrink-0">
                {locked ? (
                  <Lock className="w-3.5 h-3.5 text-slate-600" />
                ) : completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Play className={`w-3.5 h-3.5 ${current ? 'text-primary' : 'text-slate-500'}`} />
                )}
              </div>

              {/* Title & Info */}
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-bold leading-tight">
                  {order}. {title}
                </p>
                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Clock className="w-3 h-3 text-slate-600" />
                  {duration} min
                </span>
              </div>
            </div>
          );

          if (locked) {
            return (
              <div key={id} aria-disabled="true">
                {lessonCard}
              </div>
            );
          }

          return (
            <Link key={id} href={destination} className="block no-underline focus:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900 rounded-lg">
              {lessonCard}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
