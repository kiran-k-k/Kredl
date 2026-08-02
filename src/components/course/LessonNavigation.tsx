import React from 'react';
import Link from 'next/link';
import { LessonNavigation as NavigationType } from '@/types/lesson';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';

interface LessonNavigationProps {
  navigation: NavigationType;
  courseSlug: string;
  moduleSlug: string;
}

export const LessonNavigation: React.FC<LessonNavigationProps> = ({
  navigation,
  courseSlug,
  moduleSlug,
}) => {
  const { previous, next, isLastLesson } = navigation;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-slate-200/80">
      {/* Previous Lesson CTA */}
      {previous ? (
        <Link
          href={`/courses/${courseSlug}/modules/${moduleSlug}/lessons/${previous.slug}`}
          className="flex-1 flex flex-col items-start p-3 border border-slate-200 hover:border-slate-300 rounded-lg hover:bg-slate-50 transition-all select-none no-underline text-left"
        >
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-1">
            <ArrowLeft className="w-3 h-3" />
            Previous Lesson
          </span>
          <span className="text-xs font-bold text-slate-800 line-clamp-1">
            {previous.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1 p-3 border border-dashed border-slate-100 rounded-lg opacity-40 select-none cursor-not-allowed text-left">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-1">
            <ArrowLeft className="w-3 h-3" />
            Previous Lesson
          </span>
          <span className="text-xs font-bold text-slate-400">
            First lesson of module
          </span>
        </div>
      )}

      {/* Next Lesson or Complete Module CTA */}
      {next ? (
        <Link
          href={`/courses/${courseSlug}/modules/${moduleSlug}/lessons/${next.slug}`}
          className="flex-1 flex flex-col items-end p-3 border border-slate-200 hover:border-slate-300 rounded-lg hover:bg-slate-50 transition-all select-none no-underline text-right"
        >
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-1">
            Next Lesson
            <ArrowRight className="w-3 h-3" />
          </span>
          <span className="text-xs font-bold text-slate-800 line-clamp-1">
            {next.title}
          </span>
        </Link>
      ) : isLastLesson ? (
        <Link
          href={`/courses/${courseSlug}`}
          className="flex-1 flex flex-col items-end p-3 border border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50/40 hover:border-emerald-300 rounded-lg transition-all select-none no-underline text-right"
        >
          <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1.5 mb-1">
            Complete Module
            <BookOpen className="w-3 h-3 text-emerald-500" />
          </span>
          <span className="text-xs font-bold text-emerald-800">
            Back to Syllabus List
          </span>
        </Link>
      ) : (
        <div className="flex-1 p-3 border border-dashed border-slate-100 rounded-lg opacity-40 select-none cursor-not-allowed text-right">
          <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-1">
            Next Lesson
            <ArrowRight className="w-3 h-3" />
          </span>
          <span className="text-xs font-bold text-slate-400">
            No next lesson
          </span>
        </div>
      )}
    </div>
  );
};
