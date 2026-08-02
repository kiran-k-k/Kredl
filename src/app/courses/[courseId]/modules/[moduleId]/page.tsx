"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { PublicLayout } from '@/components/layout/public-layout';
import { LessonList } from '@/components/course/LessonList';

export default function ModuleLessonsPage() {
  const params = useParams();
  const courseSlug = params?.courseId as string;
  const moduleSlug = params?.moduleId as string;

  return (
    <PublicLayout>
      <title>Roadmap Lessons</title>
      <div className="bg-background min-h-screen">
        <LessonList courseSlug={courseSlug} moduleSlug={moduleSlug} />
      </div>
    </PublicLayout>
  );
}
