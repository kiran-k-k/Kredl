import React from 'react';
import Link from 'next/link';
import { useModuleLessons } from '@/hooks/useModuleLessons';
import { LessonCard } from './LessonCard';
import { ModuleSkeleton } from './ModuleSkeleton';
import { AlertTriangle, ArrowLeft, BookOpen, Clock } from 'lucide-react';

interface LessonListProps {
  courseSlug: string;
  moduleSlug: string;
}

export const LessonList: React.FC<LessonListProps> = ({
  courseSlug,
  moduleSlug,
}) => {
  const { data: response, isLoading, error, refetch } = useModuleLessons(
    courseSlug,
    moduleSlug,
  );

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="p-6 border border-slate-200 rounded-xl bg-white space-y-4">
          <div className="space-y-2">
            <div className="h-5 w-20 bg-slate-100 rounded-md animate-pulse" />
            <div className="h-7 w-1/2 bg-slate-100 rounded-md animate-pulse" />
            <div className="h-4 w-3/4 bg-slate-100 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Lessons list skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 w-full bg-slate-100/50 rounded-xl border border-slate-200/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-12 border border-red-100 rounded-xl bg-red-50/20">
        <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">Failed to load lessons</h3>
        <p className="text-sm text-slate-500 mb-4">
          {error instanceof Error ? error.message : 'An unexpected error occurred while loading lesson list.'}
        </p>
        <button 
          onClick={() => void refetch()}
          className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 py-1.5 px-3 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!response || !response.lessons || response.lessons.length === 0) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto px-4 py-8">
        <Link
          href={`/courses/${courseSlug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group mb-2"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to syllabus
        </Link>
        <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">No lessons available</h3>
          <p className="text-sm text-muted-foreground">
            No lessons have been added to this module yet.
          </p>
        </div>
      </div>
    );
  }

  const { module, lessons } = response;
  const totalDuration = lessons.reduce((acc, curr) => acc + (curr.duration || 0), 0);

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 py-8">
      {/* Back button link */}
      <Link
        href={`/courses/${courseSlug}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group mb-2"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to syllabus
      </Link>

      {/* Module Meta Header */}
      <div className="p-6 border border-slate-200/80 rounded-xl bg-white shadow-sm space-y-4">
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
            Module Lessons
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {module.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {module.description || 'Learn and practice core concepts in this section.'}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground pt-2 border-t border-slate-100">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {totalDuration} min total duration
          </span>
        </div>
      </div>

      {/* Lessons List Checklist */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Lessons Sequence
        </h2>
        <div className="space-y-3.5">
          {lessons.map((les) => (
            <LessonCard
              key={les.id}
              lesson={les}
              courseSlug={courseSlug}
              moduleSlug={moduleSlug}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
