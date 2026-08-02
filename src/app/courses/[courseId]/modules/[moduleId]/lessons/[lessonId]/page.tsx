"use client";

import React, { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PublicLayout } from '@/components/layout/public-layout';
import { useLessonDetails } from '@/hooks/useLessonDetails';
import { LessonSidebar } from '@/components/course/LessonSidebar';
import { YoutubePlayer } from '@/components/course/YoutubePlayer';
import { LessonTabs } from '@/components/course/LessonTabs';
import { LessonNavigation } from '@/components/course/LessonNavigation';
import { MarkCompleteButton } from '@/components/course/MarkCompleteButton';
import { ModuleCompletionOverlay } from '@/components/course/ModuleCompletionOverlay';
import { CourseCompletionOverlay } from '@/components/course/CourseCompletionOverlay';
import {
  AlertTriangle,
  Lock,
  Menu,
  X,
  Clock,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// ──────────────────────────────────────────────────────────────────────────────
// Overlay state type
// ──────────────────────────────────────────────────────────────────────────────
type OverlayState = 'none' | 'module' | 'course';

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params?.courseId as string;
  const moduleSlug = params?.moduleId as string;
  const lessonSlug = params?.lessonId as string;

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useLessonDetails(courseSlug, moduleSlug, lessonSlug);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [overlay, setOverlay] = useState<OverlayState>('none');

  // ──────────────────────────────────────────────────────────────────────────
  // Handle lesson completion — derive overlay from refreshed progress data
  // ──────────────────────────────────────────────────────────────────────────
  const handleLessonComplete = useCallback(async () => {
    // Give the invalidation time to refetch, then inspect fresh progress
    await new Promise((r) => setTimeout(r, 400));
    const fresh = await refetch();
    const progress = fresh.data?.progress;

    if (!progress) return;

    if (progress.courseProgress >= 100) {
      setOverlay('course');
    } else if (progress.moduleProgress >= 100) {
      setOverlay('module');
    }
  }, [refetch]);

  // ──────────────────────────────────────────────────────────────────────────
  // Derived error checks
  // ──────────────────────────────────────────────────────────────────────────
  const isLockedError =
    error &&
    ((error as any).status === 403 ||
      (error as any).response?.status === 403 ||
      (error as any).message?.toLowerCase().includes('lock') ||
      (error as any).response?.data?.message?.toLowerCase().includes('lock'));

  // ──────────────────────────────────────────────────────────────────────────
  // Loading state
  // ──────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <PublicLayout>
        <title>Loading Lesson...</title>
        <div className="flex min-h-screen bg-slate-50">
          <aside className="hidden md:block w-72 shrink-0 border-r border-slate-200 bg-slate-900 animate-pulse" />
          <main className="flex-1 max-w-4xl mx-auto px-4 py-8 space-y-6">
            <div className="space-y-3">
              <div className="h-6 w-1/3 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="aspect-video w-full bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-10 w-48 bg-slate-200 rounded mx-auto animate-pulse" />
            <div className="space-y-4">
              <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-32 w-full bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </main>
        </div>
      </PublicLayout>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 🔒 Locked lesson
  // ──────────────────────────────────────────────────────────────────────────
  if (isLockedError) {
    return (
      <PublicLayout>
        <title>Lesson Locked | Kredl</title>
        <div className="flex items-center justify-center min-h-[75vh] px-4">
          <Card className="max-w-md w-full p-8 text-center border border-slate-200/80 shadow-md rounded-xl space-y-6 bg-white">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-amber-500 animate-bounce">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-800">Lesson Locked</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                You must complete all previous lessons in this module sequentially to unlock
                access.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={() => router.push(`/courses/${courseSlug}`)}
                className="font-bold py-5 rounded-lg"
              >
                Go to Module Syllabus
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="font-semibold py-5 rounded-lg"
              >
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Generic error
  // ──────────────────────────────────────────────────────────────────────────
  if (error || !response) {
    return (
      <PublicLayout>
        <title>Error Loading Lesson | Kredl</title>
        <div className="flex items-center justify-center min-h-[75vh] px-4">
          <Card className="max-w-md w-full p-6 text-center border border-red-100 bg-red-50/10 rounded-xl space-y-4">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Failed to load lesson</h3>
            <p className="text-sm text-slate-500">
              {error instanceof Error
                ? error.message
                : 'An error occurred while loading this lesson page.'}
            </p>
            <Button
              onClick={() => void refetch()}
              variant="outline"
              className="text-xs font-semibold rounded-md mx-auto"
            >
              Retry
            </Button>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  const { course, module, lesson, sisterLessons, navigation, progress } = response;

  return (
    <PublicLayout>
      <title>{`${lesson.title} | ${course.title} | Kredl`}</title>
      <meta
        name="description"
        content={`Learn ${lesson.title} with curated notes, embedded video, objectives, and practical career roadmap guidance on Kredl.`}
      />

      <div className="flex min-h-screen bg-slate-50 relative">
        {/* ────────────────────────── Desktop Sidebar ────────────────────────── */}
        <aside className="hidden md:block w-72 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
          <LessonSidebar
            moduleTitle={module.title}
            moduleProgress={progress.moduleProgress}
            sisterLessons={sisterLessons}
            courseSlug={courseSlug}
            moduleSlug={moduleSlug}
          />
        </aside>

        {/* ───────────────────── Mobile slide-over drawer ─────────────────────── */}
        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex flex-col w-72 max-w-xs h-full bg-slate-900 shadow-xl z-50 animate-in slide-in-from-left duration-300">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-850"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="h-full pt-8">
                <LessonSidebar
                  moduleTitle={module.title}
                  moduleProgress={progress.moduleProgress}
                  sisterLessons={sisterLessons}
                  courseSlug={courseSlug}
                  moduleSlug={moduleSlug}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────── Main Lesson Player ──────────────────────── */}
        <main className="flex-1 w-full min-w-0 py-8 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto space-y-6">
          {/* Mobile top toolbar */}
          <div className="flex items-center justify-between md:hidden border-b border-slate-200 pb-3 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex items-center gap-1.5 font-semibold text-slate-700 bg-white border-slate-200"
            >
              <Menu className="w-4 h-4" />
              Syllabus Outline
            </Button>
            <Badge className="bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 border border-emerald-500/20 py-0.5 px-2 shadow-none font-bold">
              Progress: {progress.moduleProgress}%
            </Badge>
          </div>

          {/* Section 1 — Lesson Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-blue-550/5 text-blue-600 border border-blue-500/15 py-0.5 px-2 shadow-none font-semibold text-[10px]"
              >
                Lesson {lesson.order || 1}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-600 border border-slate-200/50 py-0.5 px-2 shadow-none font-semibold text-[10px] flex items-center gap-1"
              >
                <Clock className="w-3 h-3 text-slate-400" />
                {lesson.durationMinutes || 5} min read
              </Badge>
              <Badge
                variant="secondary"
                className="bg-purple-500/5 text-purple-600 border border-purple-500/15 py-0.5 px-2 shadow-none font-semibold text-[10px] flex items-center gap-1"
              >
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                Beginner
              </Badge>
            </div>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {lesson.title}
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                {lesson.description || 'Learn and master this core topic step by step.'}
              </p>
            </div>
          </div>

          {/* Section 2 — YouTube Player or Project View */}
          <YoutubePlayer youtubeUrl={lesson.youtubeUrl} githubUrl={lesson.githubUrl} title={lesson.title} />

          {/* Section 3 — Mark Complete */}
          <MarkCompleteButton
            courseId={response.course.id}
            lessonId={lesson.id}
            completed={progress.lessonCompleted}
            completedAt={lesson.completedAt}
            onComplete={handleLessonComplete}
          />

          {/* Section 4 — Notes / Objectives / Key Points Tabs */}
          <LessonTabs
            notes={lesson.notes}
            learningObjectives={lesson.learningObjectives}
            keyPoints={lesson.keyPoints}
          />

          {/* Section 5 — Prev / Next navigation */}
          <LessonNavigation
            navigation={navigation}
            courseSlug={courseSlug}
            moduleSlug={moduleSlug}
          />
        </main>
      </div>

      {/* ────────────────── Completion Overlays (presentational) ────────────────── */}
      {overlay === 'module' && (
        <ModuleCompletionOverlay
          moduleTitle={module.title}
          courseSlug={courseSlug}
          moduleSlug={moduleSlug}
          onClose={() => setOverlay('none')}
        />
      )}

      {overlay === 'course' && (
        <CourseCompletionOverlay
          courseTitle={course.title}
          totalLessons={sisterLessons.length}
          totalModules={1 /* module count not available at this scope */}
        />
      )}
    </PublicLayout>
  );
}
