"use client"

import React, { useState, Suspense } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { QuizHeader } from "@/components/quiz/quiz-header"
import { QuizSidebar } from "@/components/quiz/quiz-sidebar"
import { OptionCard } from "@/components/quiz/option-card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Info } from "lucide-react"

interface AnswerDetail {
  questionId: string;
  questionText: string;
  options: string[];
  selectedAnswerIndex: number;
  correctAnswerIndex: number;
  isCorrect: boolean;
  explanation?: string;
}

interface ResultData {
  score: number;
  percentage: number;
  passed: boolean;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  answers: AnswerDetail[];
}

function QuizReviewContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const courseId = params?.courseId as string
  const moduleId = params?.moduleId as string
  const attemptId = searchParams?.get("attemptId")

  // State
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Fetch Course details (for breadcrumbs)
  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data } = await api.get(`/courses/${courseId}`)
      return data
    },
    enabled: !!courseId,
  })

  // Fetch Module details (for breadcrumbs)
  const { data: modulesData } = useQuery({
    queryKey: ["course-modules", courseId],
    queryFn: async () => {
      const { data } = await api.get(`/modules?courseId=${course?.id || courseId}&limit=100`)
      return data
    },
    enabled: !!courseId,
  })

  const activeModule = modulesData?.modules?.find((m: any) => m._id === moduleId || m.slug === moduleId)

  // Fetch Quiz Result
  const { data: result, isLoading, isError } = useQuery<ResultData>({
    queryKey: ["quiz-result", attemptId],
    queryFn: async () => {
      const { data } = await api.get(`/quiz/result/${attemptId}`)
      return data
    },
    enabled: !!attemptId,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-muted-foreground text-sm font-medium">Loading review data...</p>
      </div>
    )
  }

  if (isError || !result || !result.answers || result.answers.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center bg-background px-4">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Review Available</h2>
        <p className="text-muted-foreground mb-6">Could not load the answers for this attempt.</p>
        <Button onClick={() => router.push(`/courses/${courseId}`)}>
          Back to Course
        </Button>
      </div>
    )
  }

  const currentQuestion = result.answers[currentIdx]
  const totalQuestions = result.answers.length
  const answeredQuestionNumbers = result.answers.map((_, idx) => idx + 1)
  const isCorrect = currentQuestion.isCorrect

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <QuizHeader
        courseName={course?.title || "Course"}
        moduleName={activeModule?.title || "Module"}
        quizTitle="Quiz Review"
        estimatedTime="Review Mode"
        currentQuestion={currentIdx + 1}
        totalQuestions={totalQuestions}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <QuizSidebar
            totalQuestions={totalQuestions}
            currentQuestion={currentIdx + 1}
            answeredQuestions={answeredQuestionNumbers}
            onQuestionSelect={(q) => setCurrentIdx(q - 1)}
          />
        </aside>

        {/* Mobile Sidebar (Sheet) */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64 sm:w-80">
            <QuizSidebar
              totalQuestions={totalQuestions}
              currentQuestion={currentIdx + 1}
              answeredQuestions={answeredQuestionNumbers}
              onQuestionSelect={(q) => {
                setCurrentIdx(q - 1)
                setIsMobileSidebarOpen(false)
              }}
            />
          </SheetContent>
        </Sheet>

        {/* Main Canvas */}
        <main className="flex-1 overflow-y-auto pb-32">
          <div className="max-w-3xl mx-auto p-6 md:p-12 lg:p-16">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Question {currentIdx + 1}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 leading-tight">
                  {currentQuestion.questionText}
                </h2>
              </div>

              {/* Correct/Incorrect Badge */}
              <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold mt-2 ${
                isCorrect
                  ? "bg-success/10 border-success/20 text-success"
                  : "bg-destructive/10 border-destructive/20 text-destructive"
              }`}>
                {isCorrect ? (
                  <><CheckCircle2 className="h-4 w-4" /> Correct</>
                ) : (
                  <><XCircle className="h-4 w-4" /> Incorrect</>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-10">
              {currentQuestion.options.map((option, oIdx) => (
                <OptionCard
                  key={oIdx}
                  id={String(oIdx)}
                  text={option}
                  isSelected={false} // Handled by review state flags
                  onClick={() => {}} // Read-only
                  disabled={true}
                  showReviewState={true}
                  isCorrectAnswer={currentQuestion.correctAnswerIndex === oIdx}
                  isStudentAnswer={currentQuestion.selectedAnswerIndex === oIdx}
                />
              ))}
            </div>

            {/* Explanation Block */}
            {currentQuestion.explanation && (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-primary font-bold mb-3">
                  <Info className="h-5 w-5" />
                  <h3>Explanation</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Review Footer */}
      <footer className="sticky bottom-0 z-40 bg-surface/90 backdrop-blur-md border-t p-4 md:p-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentIdx === 0}
            className="w-full sm:w-auto gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Previous
          </Button>

          <div className="flex w-full sm:w-auto flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => router.push(`/courses/${courseId}/module/${moduleId}/quiz/result?attemptId=${attemptId}`)}
              className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
            >
              Back to Result
            </Button>

            <Button
              variant="default"
              size="lg"
              onClick={handleNext}
              disabled={currentIdx === totalQuestions - 1}
              className="w-full sm:w-auto gap-2"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function QuizReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col justify-center items-center bg-background gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-muted-foreground text-sm font-medium">Loading review data...</p>
      </div>
    }>
      <QuizReviewContent />
    </Suspense>
  )
}
