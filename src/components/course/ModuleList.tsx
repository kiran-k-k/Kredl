import React from 'react';
import { useCourseModules } from '@/hooks/useCourseModules';
import { ModuleCard } from './ModuleCard';
import { ModuleSkeleton } from './ModuleSkeleton';
import { ModuleEmptyState } from './ModuleEmptyState';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Award, BookOpen, AlertTriangle, ArrowLeft } from 'lucide-react';

interface ModuleListProps {
  courseIdOrSlug: string;
}

export const ModuleList: React.FC<ModuleListProps> = ({ courseIdOrSlug }) => {
  const { data: response, isLoading, error, refetch } = useCourseModules(courseIdOrSlug);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="p-6 border border-slate-200 rounded-xl bg-white space-y-4">
          <div className="space-y-2">
            <div className="h-7 w-1/3 bg-slate-100 rounded-md animate-pulse" />
            <div className="h-4 w-1/4 bg-slate-100 rounded-md animate-pulse" />
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full animate-pulse" />
        </div>

        {/* Modules List Skeleton */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ModuleSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto my-12 border border-red-100 rounded-xl bg-red-50/20">
        <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">Failed to load course modules</h3>
        <p className="text-sm text-slate-500 mb-4">
          {error instanceof Error ? error.message : 'An unexpected error occurred while loading module list.'}
        </p>
        <button 
          onClick={() => void refetch()}
          className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 py-1.5 px-3 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!response || !response.modules || response.modules.length === 0) {
    return <ModuleEmptyState />;
  }

  const { course, modules } = response;
  const isCourseCompleted = course.progress >= 100;

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
      {/* Back button link */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group mb-2"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to courses
      </Link>

      {/* Course Overall Progress Header Card */}
      <div className="relative overflow-hidden p-8 border border-white/10 dark:border-white/5 rounded-3xl bg-surface/50 backdrop-blur-xl shadow-2xl mb-12 group">
        {/* Animated background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] mix-blend-screen pointer-events-none"></div>

        <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-foreground pointer-events-none transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
          <Award className="w-48 h-48" />
        </div>

        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between relative z-10">
          <div className="space-y-3 flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {course.title}
            </h1>
            <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground">
              <span className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full border border-white/5 shadow-sm">
                <BookOpen className="w-4 h-4 text-primary" />
                {course.completedModules} of {course.totalModules} modules completed
              </span>
              {isCourseCompleted && (
                <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-sm animate-pulse">
                  <Award className="w-4 h-4" />
                  Completed
                </span>
              )}
            </div>
          </div>

          <div className="w-full md:w-80 space-y-3 bg-background/40 p-5 rounded-2xl border border-white/5 shadow-inner">
            <div className="flex justify-between text-sm font-bold items-end">
              <span className="text-muted-foreground uppercase tracking-wider text-xs">Overall Progress</span>
              <span className="text-primary text-xl leading-none">{Math.round(course.progress)}%</span>
            </div>
            <div className="relative pt-1">
              <Progress value={course.progress} className="h-3 bg-muted overflow-hidden rounded-full shadow-inner" />
              <div 
                className="absolute top-1 bottom-0 left-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full opacity-50 transform -translate-x-full animate-[shimmer_2s_infinite]"
                style={{ 
                  animationName: 'shimmer', 
                  animationDuration: '2s', 
                  animationIterationCount: 'infinite' 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modules List Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-slate-800 border-b border-slate-100 pb-2">
          Course Curriculum
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {modules.map((mod) => (
            <ModuleCard key={mod.id} module={mod} courseSlug={courseIdOrSlug} />
          ))}
        </div>
      </div>
    </div>
  );
};
