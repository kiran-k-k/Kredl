import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, ArrowRight, Lock, PlayCircle, CheckCircle2 } from 'lucide-react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { CourseModule } from '@/types/course-module';
import { ModuleStatusBadge } from './ModuleStatusBadge';
import { ModuleProgress } from './ModuleProgress';

interface ModuleCardProps {
  module: CourseModule;
  courseSlug: string;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, courseSlug }) => {
  const {
    id,
    slug,
    title,
    description,
    lessonCount,
    completedLessons,
    estimatedDuration,
    progress,
    locked,
    completed,
    nextLessonId,
    lessonsCompleted,
    quizAvailable,
    quizPassed,
    quizFailed,
  } = module;

  // Compute CTA Button label and destination URL
  let ctaLabel = 'Start Learning';
  let isCtaDisabled = locked;
  let ctaUrl = '#';

  if (locked) {
    ctaLabel = 'Locked';
  } else if (completed || quizPassed) {
    ctaLabel = 'Review Module';
    isCtaDisabled = false;
    // Set ctaUrl to the first lesson, or the next lesson if applicable
    ctaUrl = `/learn/${courseSlug}/${module.lessons?.[0]?.id || module.lessons?.[0]?._id || nextLessonId}`;
  } else if (quizAvailable) {
    ctaLabel = 'Take Quiz';
    ctaUrl = `/courses/${courseSlug}/module/${id || slug}/quiz`;
  } else if (quizFailed) {
    ctaLabel = 'Retry Quiz';
    ctaUrl = `/courses/${courseSlug}/module/${id || slug}/quiz`;
  } else if (progress > 0) {
    ctaLabel = 'Continue';
  }

  if (!locked && !quizAvailable && !quizFailed && progress < 100 && nextLessonId) {
    // Navigate to lesson detail page: /learn/[courseSlug]/[lessonId]
    ctaUrl = `/learn/${courseSlug}/${nextLessonId}`;
  }

  return (
    <Card className={`relative overflow-hidden transition-all duration-500 rounded-2xl ${
      locked 
        ? 'opacity-85 border-white/5 bg-surface/30 shadow-none' 
        : 'hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 bg-surface/50 backdrop-blur-md border-white/10 dark:border-white/5'
    }`}>
      {/* Visual top indicator line */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 transition-colors ${
        locked 
          ? 'bg-slate-200' 
          : (completed || quizPassed) 
            ? 'bg-emerald-500' 
            : quizFailed
              ? 'bg-red-500'
              : quizAvailable
                ? 'bg-orange-500'
                : progress > 0 
                  ? 'bg-amber-500' 
                  : 'bg-blue-500'
      }`} />

      <CardHeader className="pt-6 pb-4">
        <div className="flex justify-between items-start gap-4 mb-2.5">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
              Module {module.order}
            </span>
            <h3 className={`text-lg font-bold tracking-tight ${locked ? 'text-slate-600' : 'text-foreground'}`}>
              {title}
            </h3>
          </div>
          <ModuleStatusBadge 
            locked={locked} 
            completed={completed} 
            progress={progress} 
            lessonsCompleted={lessonsCompleted}
            quizAvailable={quizAvailable}
            quizPassed={quizPassed}
            quizFailed={quizFailed}
          />
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {description || 'No description provided for this module.'}
        </p>
      </CardHeader>

      <CardContent className="py-2 space-y-4">
        {/* Module meta stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{estimatedDuration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>{lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}</span>
          </div>
        </div>

        {/* Module Progress Bar */}
        {!locked && (
          <ModuleProgress
            progress={progress}
            completedLessons={completedLessons?.length || 0}
            totalLessons={lessonCount}
          />
        )}

        {module.lessons && module.lessons.length > 0 && (
          <div className="pt-2 border-t mt-4">
            <Accordion type="single" className="w-full">
              <AccordionItem value="lessons" className="border-none">
                <AccordionTrigger className="py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:no-underline">
                  View Lessons ({module.lessons.length})
                </AccordionTrigger>
                <AccordionContent className="pb-0 pt-2 space-y-1">
                  {module.lessons.map((les: any, idx: number) => {
                    const isComplete = completedLessons?.includes(les.id);
                    return (
                      <div key={les.id} className="flex items-start gap-2.5 p-2 rounded-md bg-slate-50/50 border border-transparent hover:border-slate-200 transition-colors">
                        {isComplete ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : locked ? (
                          <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        ) : (
                          <PlayCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-medium leading-tight truncate text-slate-700">{les.title}</span>
                          <span className="text-[10px] text-muted-foreground">{les.durationMinutes} min</span>
                        </div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 pb-5 flex justify-end">
        {isCtaDisabled ? (
          <Button disabled variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-1.5">
            {locked ? (
              <>
                <Lock className="w-4 h-4" />
                Locked
              </>
            ) : (
              'Completed'
            )}
          </Button>
        ) : (
          <Button asChild className="w-full sm:w-auto group">
            <Link href={ctaUrl} className="flex items-center justify-center gap-1.5">
              {ctaLabel}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
