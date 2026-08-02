'use client';

import React from 'react';
import { PlayCircle, Clock, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { useContinueLearningData } from '@/hooks/useProgress';

// ──────────────────────────────────────────────────────────────────────────────
// Skeleton
// ──────────────────────────────────────────────────────────────────────────────
function ContinueLearningCardSkeleton() {
  return (
    <div className="p-6 border rounded-2xl bg-surface shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center animate-pulse">
      <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-muted shrink-0" />
      <div className="flex-1 w-full space-y-3">
        <div className="h-3 w-1/3 bg-muted rounded" />
        <div className="h-5 w-2/3 bg-muted rounded" />
        <div className="h-2 w-full bg-muted rounded-full" />
        <div className="h-3 w-1/4 bg-muted rounded" />
      </div>
      <div className="h-12 w-36 bg-muted rounded-lg shrink-0" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Empty state — shown when no course is in progress
// ──────────────────────────────────────────────────────────────────────────────
function ContinueLearningEmpty() {
  return (
    <div className="p-6 border rounded-2xl bg-surface shadow-sm flex flex-col md:flex-row gap-6 items-center">
      <div className="h-16 w-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        <BookOpen className="h-8 w-8 text-primary/60" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          No active course
        </p>
        <h3 className="text-base font-bold leading-tight">
          Start your first course to begin learning
        </h3>
        <p className="text-xs text-muted-foreground">
          Browse available courses and enrol to start your career journey.
        </p>
      </div>
      <Button size="lg" className="shrink-0 w-full md:w-auto h-12" asChild>
        <Link href="/courses">Browse Courses</Link>
      </Button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main dynamic card
// ──────────────────────────────────────────────────────────────────────────────
export function DynamicContinueLearningCard() {
  const { data, isLoading, isError } = useContinueLearningData();

  if (isLoading) {
    return <ContinueLearningCardSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-4 border border-destructive/20 rounded-2xl bg-destructive/5 flex items-center gap-3 text-sm text-destructive">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span className="font-medium">Could not load continue learning. Please refresh.</span>
      </div>
    );
  }

  if (!data) {
    return <ContinueLearningEmpty />;
  }

  // Build the resume URL
  const resumeHref = data.nextLesson
    ? `/courses/${data.courseSlug}/modules/${data.moduleSlug}/lessons/${data.nextLesson.slug}`
    : data.lessonSlug
      ? `/courses/${data.courseSlug}/modules/${data.moduleSlug}/lessons/${data.lessonSlug}`
      : `/courses/${data.courseSlug}`;

  return (
    <div className="p-6 border rounded-2xl bg-surface shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
      {/* Thumbnail or icon */}
      <div
        className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden"
        aria-hidden="true"
      >
        {data.courseThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.courseThumbnail}
            alt={data.courseTitle}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <PlayCircle className="h-8 w-8 md:h-10 md:w-10 text-primary" />
        )}
      </div>

      {/* Progress info */}
      <div className="flex-1 w-full space-y-2">
        <div className="text-xs font-semibold text-primary uppercase tracking-wider">
          {data.courseTitle}
          {data.moduleTitle ? ` • ${data.moduleTitle}` : ''}
        </div>
        <h3 className="text-lg font-bold leading-tight">
          {data.nextLesson?.title ?? data.lessonTitle ?? 'Continue where you left off'}
        </h3>

        <div className="pt-2 flex items-center gap-4">
          <Progress
            value={data.completionPercentage}
            className="h-2 flex-1"
            aria-label="Course progress"
          />
          <span className="text-xs font-medium text-muted-foreground shrink-0">
            {data.completionPercentage}%
          </span>
        </div>

        <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
          <Clock className="h-3 w-3" />
          {data.lastWatchedAt
            ? `Last studied ${new Date(data.lastWatchedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}`
            : 'Ready to continue'}
        </div>
      </div>

      <Button size="lg" className="shrink-0 w-full md:w-auto h-12" asChild>
        <Link href={resumeHref}>Resume Learning</Link>
      </Button>
    </div>
  );
}
