"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { 
  PlayCircle, 
  CheckCircle2, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  ExternalLink,
  BookOpen,
  FileText,
  Bookmark,
  Sparkles,
  Target,
  Code
} from "lucide-react"
import { Breadcrumbs } from "@/components/system/Breadcrumbs"

interface Module {
  id: string;
  title: string;
  slug: string;
  description: string;
  order: number;
}

interface Lesson {
  id: string;
  moduleId: string | any;
  title: string;
  slug: string;
  description?: string;
  youtubeUrl?: string;
  githubUrl?: string;
  challengeDescription?: string;
  learningObjectives?: string[];
  order: number;
}

interface LessonNote {
  id: string;
  title: string;
  content: string;
  summary: string;
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<"notes" | "objectives">("notes")
  const [expandedModules, setExpandedModules] = useState<string[]>([])

  const courseSlug = params?.courseId as string
  const activeLessonId = params?.lessonId as string

  React.useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [activeLessonId])

  // 1. Fetch Course Details (to check enrollment, course id, completedLessons)
  const { data: course, isLoading: isCourseLoading, refetch: refetchCourse } = useQuery({
    queryKey: ["course", courseSlug],
    queryFn: async () => {
      const response = await api.get(`/courses/${courseSlug}`)
      return response.data
    },
    enabled: !!courseSlug,
  })

  const courseData = course?.data || course
  const courseId = courseData?.id || courseData?._id
  const completedLessons = courseData?.completedLessons || []

  // 2. Fetch Modules
  const { data: modulesData, isLoading: isModulesLoading } = useQuery({
    queryKey: ["course-modules", courseId],
    queryFn: async () => {
      const response = await api.get(`/modules?courseId=${courseId}&limit=100`)
      return response.data
    },
    enabled: !!courseId,
  })

  // 3. Fetch Lessons
  const { data: lessonsData, isLoading: isLessonsLoading } = useQuery({
    queryKey: ["course-lessons", courseId],
    queryFn: async () => {
      const response = await api.get(`/lessons?courseId=${courseId}&limit=100`)
      return response.data
    },
    enabled: !!courseId,
  })

  // 4. Fetch Active Lesson Notes
  const { data: notesData, isLoading: isNotesLoading } = useQuery({
    queryKey: ["lesson-notes", activeLessonId],
    queryFn: async () => {
      const response = await api.get(`/lesson-notes?lessonId=${activeLessonId}`)
      return response.data
    },
    enabled: !!activeLessonId,
  })

  // 5. Complete Lesson Mutation
  const completeMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/lessons/${activeLessonId}/complete`)
    },
    onSuccess: async () => {
      await refetchCourse()
      queryClient.invalidateQueries({ queryKey: ["course", courseSlug] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-continue-learning"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-progress"] })
      
      // Check if we are at a module boundary
      const isLastInModule = nextLesson && 
        (activeLesson?.moduleId?._id || activeLesson?.moduleId?.id || activeLesson?.moduleId) !== 
        (nextLesson?.moduleId?._id || nextLesson?.moduleId?.id || nextLesson?.moduleId);

      // If at a module boundary (or end of course), go to syllabus so they can take the quiz
      if (!nextLesson || isLastInModule) {
        router.push(`/courses/${courseSlug}`);
      } else {
        router.push(`/learn/${courseSlug}/${nextLesson.id}`);
      }
    }
  })

  const extractArray = (res: any) => {
    if (!res) return []
    if (Array.isArray(res)) return res
    if (Array.isArray(res.data)) return res.data
    if (res.data && Array.isArray(res.data.data)) return res.data.data
    return []
  }

  const modules: Module[] = extractArray(modulesData)
    .map((m: any) => ({ ...m, id: m.id || m._id }))
    .sort((a: any, b: any) => a.order - b.order)
  const lessons: Lesson[] = extractArray(lessonsData)
    .map((l: any) => ({ ...l, id: l.id || l._id }))
    .sort((a: any, b: any) => a.order - b.order)
  const activeLesson = lessons.find((l: any) => l.id === activeLessonId)
  const activeNote: LessonNote | undefined = notesData?.data?.[0]

  // Initialize expanded modules state once data is loaded
  React.useEffect(() => {
    if (modules.length > 0 && expandedModules.length === 0) {
      setExpandedModules(modules.map(m => m.id))
    }
  }, [modules.length])

  // Redirect to first lesson if activeLessonId is invalid or not found
  React.useEffect(() => {
    if (lessons.length > 0 && (!activeLessonId || activeLessonId === 'undefined' || !activeLesson)) {
      const firstLesson = lessons[0];
      if (firstLesson) {
        router.replace(`/learn/${courseSlug}/${firstLesson.id}`);
      }
    }
  }, [lessons.length, activeLessonId, activeLesson, courseSlug, router]);

  // Construct Module Unlock Map
  // Module 0 is always unlocked. Module i > 0 is unlocked only if all lessons of Module i-1 are completed.
  const moduleUnlockMap: Record<string, boolean> = {}
  modules.forEach((mod, idx) => {
    if (idx === 0) {
      moduleUnlockMap[mod.id] = true
    } else {
      const prevModule = modules[idx - 1]
      const prevModuleLessons = lessons.filter((l: any) => (l.moduleId?._id || l.moduleId?.id || l.moduleId) === prevModule.id)
      const allPrevCompleted = prevModuleLessons.length > 0 && prevModuleLessons.every((l) => completedLessons.includes(l.id))
      moduleUnlockMap[mod.id] = allPrevCompleted
    }
  })

  // Calculate Navigation Pointers
  const currentIdx = lessons.findIndex((l) => l.id === activeLessonId)
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null
  const nextLesson = currentIdx !== -1 && currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null
  
  const isLastLessonOfModule = nextLesson && activeLesson ? 
    (activeLesson.moduleId?._id || activeLesson.moduleId?.id || activeLesson.moduleId) !== 
    (nextLesson.moduleId?._id || nextLesson.moduleId?.id || nextLesson.moduleId) : false;

  // Calculate Progress Percentages
  const totalLessonsCount = lessons.length
  const completedLessonsCount = lessons.filter((l) => completedLessons.includes(l.id)).length
  const progressPercent = totalLessonsCount > 0 ? (completedLessonsCount / totalLessonsCount) * 100 : 0

  const handleMarkComplete = () => {
    if (completeMutation.isPending) return
    completeMutation.mutate()
  }

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return ""
    // Ensure the URL is formatted for embedding correctly
    if (url.includes("embed/")) return url
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url
  }

  const isLoading = isCourseLoading || isModulesLoading || isLessonsLoading

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-background overflow-hidden items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-[250px] w-full rounded-xl" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar (Modules & Lessons) */}
      <aside 
        className={`${
          sidebarOpen ? "w-80" : "w-0 -translate-x-full"
        } border-r bg-background flex flex-col shrink-0 transition-all duration-300 overflow-hidden h-full z-20 absolute md:relative shadow-sm`}
      >
        <div className="p-5 border-b bg-surface/50 backdrop-blur-md flex items-center justify-between">
          <Link href={`/courses/${courseSlug}`} className="group font-bold text-base hover:text-primary transition-all flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary group-hover:bg-primary/10 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </div>
            <span className="truncate max-w-[190px]">{courseData?.title || "Course"}</span>
          </Link>
        </div>

        <div className="p-5 border-b bg-surface/30">
          <div className="flex justify-between text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            <span>Course Progress</span>
            <span className="text-primary">{completedLessonsCount}/{totalLessonsCount}</span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div 
              className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500 ease-in-out" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <Accordion 
            type="multiple" 
            value={expandedModules} 
            onValueChange={setExpandedModules} 
            className="w-full space-y-3"
          >
            {modules.map((mod, idx) => {
              const isUnlocked = moduleUnlockMap[mod.id]
              const modLessons = lessons.filter((l: any) => (l.moduleId?._id || l.moduleId?.id || l.moduleId) === mod.id)

              return (
                <AccordionItem key={mod.id} value={mod.id} className="border rounded-xl bg-surface/40 overflow-hidden shadow-sm transition-all hover:border-primary/30">
                  <AccordionTrigger className={`hover:no-underline py-3 px-4 transition-colors ${!isUnlocked ? "opacity-60 bg-muted/30" : "hover:bg-secondary/50"}`}>
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {idx + 1}
                      </div>
                      <span className="font-semibold text-sm truncate max-w-[180px]">{mod.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-1 px-2">
                    <div className="space-y-1">
                      {isUnlocked ? (
                        modLessons.map((l) => {
                          const isActive = l.id === activeLessonId
                          const isComplete = completedLessons.includes(l.id)

                          return (
                            <Link
                              key={l.id}
                              href={`/learn/${courseSlug}/${l.id}`}
                              className={`flex items-start gap-3 p-2.5 rounded-lg transition-all relative overflow-hidden group ${
                                isActive 
                                  ? "bg-primary/10 text-primary border border-primary/20" 
                                  : "hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-transparent"
                              }`}
                            >
                              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>}
                              {isComplete ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                              ) : (
                                <PlayCircle className={`h-4 w-4 shrink-0 mt-0.5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"}`} />
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className={`text-sm leading-tight line-clamp-2 ${isActive ? "font-semibold" : "font-medium"}`}>
                                  {l.title}
                                </span>
                              </div>
                            </Link>
                          )
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 p-4 mt-2 mx-2 text-center bg-muted/30 rounded-lg border border-dashed border-border/60">
                          <Lock className="h-5 w-5 text-muted-foreground/50" />
                          <span className="text-xs font-medium text-muted-foreground">Complete previous modules to unlock</span>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
        
        {/* Top Navbar */}
        <header className="h-16 border-b bg-background flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <Breadcrumbs 
                items={[
                  { label: "Courses", href: "/courses" },
                  { label: course?.title || "Syllabus", href: `/courses/${courseSlug}` },
                  { label: activeLesson?.title || "Learning" }
                ]}
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            
            <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                  {activeLesson?.title || "Loading Lesson..."}
                </h1>
                {activeLesson?.description && (
                  <p className="text-muted-foreground text-lg">
                    {activeLesson.description}
                  </p>
                )}
              </div>
              {activeLesson?.githubUrl && (
                <Button asChild variant="outline" className="gap-2 shrink-0">
                  <a href={activeLesson.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Code className="h-4 w-4" /> View Code
                  </a>
                </Button>
              )}
            </div>

            {/* Video Container or Project Container */}
            {activeLesson?.youtubeUrl ? (
              <div className="rounded-xl overflow-hidden bg-black aspect-video relative mb-6 border shadow-sm">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={getYoutubeEmbedUrl(activeLesson.youtubeUrl)}
                  title={activeLesson.title}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="absolute inset-0"
                ></iframe>
              </div>
            ) : activeLesson?.githubUrl ? (
              <div className="rounded-xl p-8 mb-6 border bg-primary/5 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Code className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Project Assignment</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  This lesson is a practical project. Clone the repository and follow the instructions in the README to complete the assignment.
                </p>
                <Button size="lg" className="gap-2" asChild>
                  <a href={activeLesson.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Code className="h-4 w-4" /> Open Project Repository
                  </a>
                </Button>
              </div>
            ) : (
              <div className="rounded-xl aspect-video mb-6 border bg-secondary/20 flex flex-col items-center justify-center text-center p-6">
                <PlayCircle className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground font-medium">No video content linked to this lesson.</p>
              </div>
            )}

            {/* Tabs Trigger */}
            <div className="flex border-b mb-6">
              <button 
                onClick={() => setActiveTab("notes")}
                className={`py-3 px-4 text-sm font-semibold border-b-2 -mb-[2px] transition-colors ${
                  activeTab === "notes"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Lesson Notes
              </button>
              <button 
                onClick={() => setActiveTab("objectives")}
                className={`py-3 px-4 text-sm font-semibold border-b-2 -mb-[2px] transition-colors ${
                  activeTab === "objectives"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Learning Objectives
              </button>
            </div>

            {/* Tab Contents */}
            <div className="min-h-[200px]">
              {activeTab === "notes" ? (
                <article className="prose prose-neutral dark:prose-invert max-w-none">
                  {isNotesLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  ) : activeNote ? (
                    <div className="whitespace-pre-line leading-relaxed">
                      {activeNote.content}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm italic py-4">
                      No custom study notes are attached to this lesson. Use the video or refer to official references.
                    </div>
                  )}
                </article>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" /> Key Learning Targets
                  </h3>
                  {activeLesson?.learningObjectives && activeLesson.learningObjectives.length > 0 ? (
                    <ul className="space-y-3">
                      {activeLesson.learningObjectives.map((objective, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-surface/50">
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{objective}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 p-3 rounded-lg border bg-surface/50">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Conceptual Mastery</p>
                          <p className="text-xs text-muted-foreground">Complete the video explanations and review architectural guidelines.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 p-3 rounded-lg border bg-surface/50">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Self-Assessment Review</p>
                          <p className="text-xs text-muted-foreground">Ensure you can articulate the key takeaways of this lesson independently.</p>
                        </div>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Challenge Yourself Section */}
            {activeLesson?.challengeDescription && (
              <div className="mt-8 rounded-xl border-2 border-primary/20 bg-primary/5 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-primary">Challenge Yourself</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {activeLesson.challengeDescription}
                </p>
              </div>
            )}

            {/* Bottom Navigation & Complete CTA */}
            <div className="mt-12 pt-8 border-t flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
              {prevLesson ? (
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto gap-2"
                  onClick={() => router.push(`/learn/${courseSlug}/${prevLesson.id}`)}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous Lesson
                </Button>
              ) : (
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2" disabled>
                  <ChevronLeft className="h-4 w-4" /> Previous Lesson
                </Button>
              )}

              <div className="flex gap-4 w-full sm:w-auto">
                <Button 
                  variant={completedLessons.includes(activeLessonId) ? "secondary" : "default"} 
                  size="lg" 
                  className="flex-1 sm:flex-none"
                  onClick={handleMarkComplete}
                  disabled={completeMutation.isPending}
                >
                  {completedLessons.includes(activeLessonId) ? "Mark Complete Again" : "Mark as Complete"}
                </Button>
                {nextLesson && !isLastLessonOfModule ? (
                  <Button 
                    size="lg" 
                    className="flex-1 sm:flex-none gap-2"
                    onClick={() => router.push(`/learn/${courseSlug}/${nextLesson.id}`)}
                  >
                    Next Lesson <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="lg" className="flex-1 sm:flex-none gap-2" asChild>
                    <Link href={`/courses/${courseSlug}`}>
                      Finish Module <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
