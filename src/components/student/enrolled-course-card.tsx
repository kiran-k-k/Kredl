import React from "react"
import Link from "next/link"
import { BookOpen, CheckCircle2, PlayCircle, Trophy } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import type { EnrolledCourse } from "@/services/progress.api"

interface EnrolledCourseCardProps {
  course: EnrolledCourse;
}

export function EnrolledCourseCard({ course }: EnrolledCourseCardProps) {
  const isCompleted = course.status === 'completed'
  const remainingLessons = course.totalLessons - course.completedLessons

  return (
    <div className="group relative flex flex-col p-5 bg-background border rounded-xl shadow-sm hover:shadow-md transition-all hover:border-primary/30 overflow-hidden">
      {/* Decorative gradient based on completion */}
      <div 
        className={`absolute top-0 right-0 w-32 h-32 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-opacity ${
          isCompleted ? 'bg-success/20' : 'bg-primary/10'
        }`}
      />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors line-clamp-1">
              {course.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {course.completedLessons} / {course.totalLessons} Lessons
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {isCompleted ? (
                  <span className="text-success flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Completed
                  </span>
                ) : (
                  <span>{remainingLessons} Remaining</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-auto pt-4">
          <div className="flex justify-between items-end">
            <span className="text-sm font-semibold">Course Progress</span>
            <span className={`text-xl font-black ${isCompleted ? 'text-success' : 'text-primary'}`}>
              {course.progress}%
            </span>
          </div>
          <Progress 
            value={course.progress} 
            className="h-2.5" 
            indicatorClassName={isCompleted ? "bg-success" : "bg-primary"}
          />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button asChild className="w-full flex items-center gap-2" variant={isCompleted ? "outline" : "default"}>
            <Link href={`/courses/${course.slug}`}>
              {isCompleted ? (
                <>
                  <Trophy className="h-4 w-4 text-warning" />
                  Review Course
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  Continue Learning
                </>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
