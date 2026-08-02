"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { PublicLayout } from "@/components/layout/public-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { api } from "@/lib/api"
import { ModuleList } from "@/components/course/ModuleList"
import { useToggleBookmark, useIsBookmarked } from "@/hooks/useBookmarks"
import {
  ArrowLeft,
  Clock,
  Layers,
  PlayCircle,
  AlertCircle,
  RefreshCw,
  Bookmark,
  CheckCircle2,
  Lock,
  BookOpen,
  ChevronRight
} from "lucide-react"

// Color scheme for difficulty badges
const getDifficultyBadge = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30 font-semibold"
    case "Intermediate":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold"
    case "Advanced":
      return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 font-semibold"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const slug = params?.courseId as string

  // 1. Fetch Course Details
  const { data: course, isLoading: isCourseLoading, isError: isCourseError, error: courseError, refetch: refetchCourse } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const response = await api.get(`/courses/${slug}`)
      return response.data?.data || response.data
    },
    enabled: !!slug,
  })

  const courseId = course?._id || course?.id

  const isBookmarked = useIsBookmarked(courseId)
  const { mutate: toggleBookmark, isPending: isTogglingBookmark } = useToggleBookmark(courseId || "", "course")

  // 2. Fetch Course Modules
  const { data: modulesData, isLoading: isModulesLoading } = useQuery({
    queryKey: ["course-modules", courseId],
    queryFn: async () => {
      const response = await api.get("/modules", {
        params: { courseId, limit: 100 },
      })
      return response.data?.data || []
    },
    enabled: !!courseId,
  })

  // 3. Fetch Course Lessons
  const { data: lessonsData, isLoading: isLessonsLoading } = useQuery({
    queryKey: ["course-lessons", courseId],
    queryFn: async () => {
      const response = await api.get("/lessons", {
        params: { courseId, limit: 100 },
      })
      return response.data?.data || []
    },
    enabled: !!courseId,
  })

  // Enrollment Mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/courses/${courseId}/enroll`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", slug] })
    },
  })

  const extractArray = (res: any) => {
    if (!res) return []
    if (Array.isArray(res)) return res
    if (Array.isArray(res.data)) return res.data
    if (res.data && Array.isArray(res.data.data)) return res.data.data
    return []
  }

  const modules = extractArray(modulesData)
  const lessons = extractArray(lessonsData)

  const handleEnrollOrStart = () => {
    if (!course) return
    if (course.isEnrolled) {
      // Find first lesson to continue learning
      const firstLesson = lessons[0]
      if (firstLesson) {
        router.push(`/learn/${course.slug}/${firstLesson.id || firstLesson._id}`)
      } else {
        router.push(`/learn/${course.slug}/start`)
      }
    } else {
      enrollMutation.mutate()
    }
  }

  // Loading Skeleton State
  if (isCourseLoading) {
    return (
      <PublicLayout>
        <div className="bg-background min-h-screen pb-24">
          <div className="bg-surface border-b py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-12 w-3/4 rounded-lg" />
              <Skeleton className="h-6 w-1/2 rounded-lg" />
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-60 w-full rounded-2xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-80 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  // Error State
  if (isCourseError) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-bold text-foreground">Course Details Unavailable</h3>
          <p className="text-muted-foreground max-w-md mt-2">
            {(courseError as any)?.response?.data?.message || "This roadmap might have been moved, deleted, or unpublished."}
          </p>
          <div className="flex gap-4 mt-6">
            <Button variant="outline" onClick={() => router.push("/courses")}>Return to Courses</Button>
            <Button onClick={() => refetchCourse()} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Retry
            </Button>
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (!course) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold text-foreground">Course Not Found</h3>
          <p className="text-muted-foreground max-w-md mt-2">
            We couldn't find the roadmap track you're looking for.
          </p>
          <Button onClick={() => router.push("/courses")} className="mt-6">
            Return to Courses
          </Button>
        </div>
      </PublicLayout>
    )
  }

  // If enrolled, swap overview with structured course modules page
  if (course.isEnrolled) {
    return (
      <PublicLayout>
        <title>{course.seoTitle || course.title}</title>
        <meta name="description" content={course.seoDescription || course.shortDescription} />
        <div className="bg-background min-h-screen">
          <ModuleList courseIdOrSlug={course.slug} />
        </div>
      </PublicLayout>
    )
  }

  // Custom checklist outcome array & prerequisites fallback
  const outcomes = course.learningOutcomes && course.learningOutcomes.length > 0 
    ? course.learningOutcomes 
    : [
        "Build standard backend architectures and endpoints",
        "Gain industry-relevant career learning roadmaps",
        "Prepare for coding interviews at product companies",
        "Build production-grade projects for your portfolio"
      ]

  const prerequisites = course.prerequisites && course.prerequisites.length > 0
    ? course.prerequisites
    : [
        "Basic computer literacy and internet access",
        "Commitment to learn and code consistently",
        "No prior advanced coding experience required"
      ]

  // Skills covered array helper
  const skills = course.tags && course.tags.length > 0
    ? course.tags
    : ["Engineering Principles", "Problem Solving", "Version Control", "System Architecture"]

  return (
    <PublicLayout>
      <title>{course.seoTitle || course.title}</title>
      <meta name="description" content={course.seoDescription || course.shortDescription} />

      <div className="bg-background min-h-screen pb-24">
        {/* Immersive Hero Banner Section */}
        <section className="relative bg-surface/50 border-b overflow-hidden pb-12 md:pb-20">
          <div className="absolute inset-0 z-0">
            {course.thumbnail ? (
              <>
                <div className="absolute inset-0 bg-background/90 backdrop-blur-3xl z-10"></div>
                <img src={course.thumbnail} alt="" className="w-full h-full object-cover opacity-30 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-20"></div>
              </>
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-10"></div>
            )}
          </div>
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-30 pt-10 md:pt-16">
            <button
              onClick={() => router.push("/courses")}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors mb-8 group bg-background/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to courses
            </button>

            <div className="flex flex-col lg:flex-row gap-12 items-start">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="px-3 py-1 font-semibold text-xs border-primary/30 bg-primary/10 text-primary backdrop-blur-md shadow-sm">
                    {course.category}
                  </Badge>
                  <Badge variant="outline" className={`px-3 py-1 text-xs backdrop-blur-md shadow-sm ${getDifficultyBadge(course.difficulty)}`}>
                    {course.difficulty}
                  </Badge>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] drop-shadow-sm">
                  {course.title}
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl font-medium">
                  {course.shortDescription}
                </p>

                <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground pt-4 bg-background/40 backdrop-blur-lg border border-white/5 rounded-2xl p-4 inline-flex shadow-inner">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{course.estimatedDuration}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <span>{modules.length > 0 ? modules.length : course.moduleCount || 0} Modules</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-border"></div>
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-primary" />
                    <span>{lessons.length > 0 ? lessons.length : course.lessonCount || 0} Lessons</span>
                  </div>
                </div>
              </div>

              {/* Mobile CTA Button - Hidden on Desktop */}
              <div className="w-full lg:hidden pt-6">
                <Button
                  onClick={handleEnrollOrStart}
                  disabled={enrollMutation.isPending}
                  className="w-full h-14 text-lg font-bold shadow-xl rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary"
                >
                  {enrollMutation.isPending ? "Enrolling..." : course.isEnrolled ? "Continue Learning" : "Start Learning"}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section layout */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Body */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground">Course Overview</h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
                {course.description}
              </div>
            </div>

            {/* Learning Outcomes */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-6 text-foreground">Learning Outcomes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {outcomes.map((outcome: string, i: number) => (
                  <div key={i} className="flex gap-3 items-start p-4 rounded-xl border bg-surface">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-foreground">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Badges */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground">Skills You'll Learn</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="px-4 py-1.5 text-sm font-medium rounded-full">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground">Prerequisites</h2>
              <ul className="space-y-3">
                {prerequisites.map((prereq: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span className="text-sm">{prereq}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modules Accordion */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-6 text-foreground">Course Modules</h2>
              {isModulesLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              ) : modules.length === 0 ? (
                <div className="text-muted-foreground py-6 text-sm">No modules registered for this course yet.</div>
              ) : (
                <Accordion type="multiple" className="w-full space-y-4">
                  {modules.map((mod: any, index: number) => {
                    const isLocked = index > 0 && !course.isEnrolled;
                    const modLessons = lessons.filter((les: any) => {
                      const lModId = les.moduleId?._id || les.moduleId?.id || les.moduleId;
                      const modId = mod._id || mod.id;
                      return lModId === modId;
                    });

                    return (
                      <AccordionItem
                        key={mod._id}
                        value={mod._id}
                        className={`border rounded-xl px-4 py-1 bg-surface ${isLocked ? "opacity-75" : ""}`}
                      >
                        <AccordionTrigger className="hover:no-underline py-4 w-full flex items-center justify-between">
                          <div className="flex items-center gap-4 text-left">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Module {index + 1}</span>
                            <span className="font-bold text-foreground text-base sm:text-lg block">{mod.title}</span>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 pr-4">
                            <span className="text-xs text-muted-foreground hidden sm:inline">{modLessons.length} Lessons</span>
                            {isLocked ? (
                              <Badge variant="outline" className="gap-1 text-xs border-amber-500/30 text-amber-500 bg-amber-500/5">
                                <Lock className="h-3.5 w-3.5" /> Locked
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs border-green-500/30 text-green-500 bg-green-500/5">
                                Unlocked
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pt-2">
                          <p className="text-sm text-muted-foreground mb-4">
                            {mod.description || "Learn fundamental concepts in this module."}
                          </p>

                          {isLocked && (
                            <div className="flex items-center gap-2 p-3 bg-amber-500/5 border border-amber-500/20 text-amber-600 rounded-lg text-xs font-medium mb-4">
                              <Lock className="h-4 w-4" />
                              <span>Complete previous module to unlock</span>
                            </div>
                          )}

                          {/* Lessons list */}
                          <div className="space-y-2 border-t pt-3">
                            {modLessons.length === 0 ? (
                              <div className="text-xs text-muted-foreground">No lessons in this module.</div>
                            ) : (
                              modLessons.map((les: any, lIndex: number) => {
                                const isLessonLocked = isLocked;
                                return (
                                  <div
                                    key={les._id}
                                    onClick={() => {
                                      if (!isLessonLocked) {
                                        router.push(`/learn/${course.slug}/${les._id}`)
                                      }
                                    }}
                                    className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-colors ${
                                      isLessonLocked
                                        ? "bg-muted/40 cursor-not-allowed border-muted-foreground/10 text-muted-foreground"
                                        : "hover:bg-primary/5 cursor-pointer bg-background hover:border-primary/30"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      {isLessonLocked ? (
                                        <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                                      ) : (
                                        <PlayCircle className="h-4 w-4 text-primary shrink-0" />
                                      )}
                                      <span className="font-semibold">{les.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                                      <span>Lesson {lIndex + 1}</span>
                                      <ChevronRight className="h-3.5 w-3.5" />
                                    </div>
                                  </div>
                                )
                              })
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              )}
            </div>
          </div>

          {/* Sticky Sidebar (Desktop Only) */}
          <div className="hidden lg:block relative z-40">
            <div className="sticky top-24 bg-background/60 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-3xl p-6 shadow-2xl -mt-32 space-y-6">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted relative border border-white/10 shadow-inner group">
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.thumbnailAlt || course.title}
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <Layers className="h-12 w-12 text-primary opacity-40" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleEnrollOrStart}
                  disabled={enrollMutation.isPending}
                  className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 rounded-2xl gap-2 transition-all hover:scale-[1.02] active:scale-95 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary"
                >
                  {enrollMutation.isPending ? (
                    "Processing..."
                  ) : course.isEnrolled ? (
                    <>Continue Learning</>
                  ) : (
                    <>Start Learning</>
                  )}
                </Button>

                <Button
                  onClick={() => toggleBookmark()}
                  disabled={isTogglingBookmark}
                  variant="outline"
                  className="w-full h-12 text-sm font-semibold rounded-2xl gap-2 border-white/10 hover:bg-white/5"
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  {isBookmarked ? "Saved to Bookmarks" : "Save Course"}
                </Button>

                <p className="text-xs text-center text-muted-foreground font-medium">
                  Free access for enrolled students of placement program
                </p>
              </div>

              {/* Sidebar metadata list */}
              <div className="border-t border-white/10 pt-6 space-y-4 text-sm font-medium">
                <div className="flex justify-between items-center bg-surface/50 p-2.5 rounded-lg border border-white/5">
                  <span className="text-muted-foreground flex items-center gap-2"><Layers className="h-4 w-4" /> Difficulty</span>
                  <Badge variant="outline" className={`px-2 py-0.5 border-0 ${getDifficultyBadge(course.difficulty)}`}>
                    {course.difficulty}
                  </Badge>
                </div>
                <div className="flex justify-between items-center bg-surface/50 p-2.5 rounded-lg border border-white/5">
                  <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> Duration</span>
                  <span className="text-foreground font-semibold">{course.estimatedDuration}</span>
                </div>
                <div className="flex justify-between items-center bg-surface/50 p-2.5 rounded-lg border border-white/5">
                  <span className="text-muted-foreground flex items-center gap-2"><BookOpen className="h-4 w-4" /> Category</span>
                  <span className="text-foreground font-semibold">{course.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
