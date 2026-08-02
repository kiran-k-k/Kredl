"use client"

import React, { Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { CheckCircle2, XCircle, Clock, BookOpen, ArrowRight, RotateCcw, Info, Award, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { OptionCard } from "@/components/quiz/option-card"

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
  attemptId: string;
  score: number;
  percentage: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  attemptNumber: number;
  quizVersion: number;
  startedAt: string;
  completedAt: string;
  answers: AnswerDetail[];
}

function QuizResultContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const courseId = params?.courseId as string
  const moduleId = params?.moduleId as string
  const attemptId = searchParams?.get("attemptId")

  // 1. Fetch Course details (for header/names)
  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data } = await api.get(`/courses/${courseId}`)
      return data.data || data
    },
    enabled: !!courseId,
  })

  // 2. Fetch Modules (for finding next module & names)
  const { data: modulesData } = useQuery({
    queryKey: ["course-modules", courseId],
    queryFn: async () => {
      const { data } = await api.get(`/modules?courseId=${course?.id || courseId}&limit=100`)
      return data.data || data
    },
    enabled: !!courseId,
  })

  // 3. Fetch Quiz Result Detail
  const { data: result, isLoading, isError } = useQuery<ResultData>({
    queryKey: ["quiz-result", attemptId],
    queryFn: async () => {
      const { data } = await api.get(`/quiz/result/${attemptId}`)
      return data.data || data
    },
    enabled: !!attemptId,
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-muted-foreground text-sm font-medium">Loading quiz results...</p>
      </div>
    )
  }

  if (isError || !result) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-center px-4">
        <XCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Result Not Found</h2>
        <p className="text-muted-foreground mb-6">Could not load the results for this attempt.</p>
        <Button asChild>
          <Link href={`/courses/${courseId}`}>Back to Course</Link>
        </Button>
      </div>
    )
  }

  const activeModule = modulesData?.modules?.find((m: any) => m._id === moduleId || m.slug === moduleId)
  const allModulesList = modulesData?.modules || []
  const currentModIdx = allModulesList.findIndex((m: any) => m._id === moduleId || m.slug === moduleId)
  
  const nextModule = currentModIdx !== -1 && currentModIdx < allModulesList.length - 1 
    ? allModulesList[currentModIdx + 1] 
    : null

  const isPassing = result.passed

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-8 px-4">
      {/* Header Info */}
      <div className="text-center space-y-3">
        <div className="text-xs uppercase tracking-widest text-primary font-bold">{course?.title || "Course"} &bull; {activeModule?.title || "Module"}</div>
        <h1 className="text-4xl font-extrabold tracking-tight">Quiz Results</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {isPassing
            ? "Congratulations! You have passed the quiz and cleared the requirements for this module."
            : "You did not achieve the required passing score this time. Review the questions and try again."}
        </p>
      </div>

      {/* Score and Stats Panel */}
      <div className="bg-background border shadow-md rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none ${isPassing ? 'bg-success/10' : 'bg-warning/10'}`}></div>

        {/* Circular score display */}
        <div className="relative flex items-center justify-center">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle cx="96" cy="96" r="88" className="stroke-muted" strokeWidth="12" fill="none" />
            <circle
              cx="96"
              cy="96"
              r="88"
              className={isPassing ? "stroke-success" : "stroke-warning"}
              strokeWidth="12"
              fill="none"
              strokeDasharray="552.92"
              strokeDashoffset={552.92 - (552.92 * result.percentage) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold">{result.percentage}%</span>
            <span className={`text-sm font-bold uppercase tracking-widest mt-1.5 ${isPassing ? 'text-success' : 'text-warning'}`}>
              {isPassing ? 'Passed' : 'Failed'}
            </span>
          </div>
        </div>

        {/* Stats list */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-full md:w-auto">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-xs font-bold uppercase tracking-wider">Correct</span>
            </div>
            <span className="text-2xl font-black text-foreground">{result.correctAnswers}</span>
          </div>

          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-bold uppercase tracking-wider">Wrong</span>
            </div>
            <span className="text-2xl font-black text-foreground">{result.wrongAnswers}</span>
          </div>

          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Total</span>
            </div>
            <span className="text-2xl font-black text-foreground">{result.totalQuestions}</span>
          </div>

          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Award className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Attempts</span>
            </div>
            <span className="text-2xl font-black text-foreground">{result.attemptNumber}</span>
          </div>

          <div className="col-span-2 border-t pt-4 flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium">Completed on {new Date(result.completedAt).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-b pb-8">
        {isPassing ? (
          <>
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 h-14 px-8 text-base rounded-2xl" asChild>
              <Link href={`/courses/${courseId}`}>
                Back to Course
              </Link>
            </Button>
            {nextModule && (
              <Button size="lg" className="w-full sm:w-auto gap-2 h-14 px-8 text-base rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md" asChild>
                <Link href={`/courses/${courseId}/module/${nextModule._id}`}>
                  Continue to Next Module <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            )}
          </>
        ) : (
          <>
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 h-14 px-8 text-base rounded-2xl" asChild>
              <Link href={`/courses/${courseId}`}>
                Back to Module
              </Link>
            </Button>
            <Button size="lg" className="w-full sm:w-auto gap-2 h-14 px-8 text-base rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md" asChild>
              <Link href={`/courses/${courseId}/module/${moduleId}/quiz`}>
                <RotateCcw className="h-5 w-5" /> Retry Quiz
              </Link>
            </Button>
          </>
        )}
      </div>

      {/* Question Review Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold tracking-tight">Question Review</h2>
        <div className="space-y-8">
          {result.answers.map((answer, index) => (
            <div key={answer.questionId} className="border rounded-3xl p-6 bg-background space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">Question {index + 1}</span>
                  <h3 className="text-lg font-bold text-foreground mt-1">{answer.questionText}</h3>
                </div>
                <span className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${
                  answer.isCorrect 
                    ? "bg-success/10 border-success/20 text-success" 
                    : "bg-destructive/10 border-destructive/20 text-destructive"
                }`}>
                  {answer.isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>

              {/* Options mapping */}
              <div className="space-y-3">
                {answer.options.map((option, oIdx) => (
                  <OptionCard
                    key={oIdx}
                    id={`${answer.questionId}-${oIdx}`}
                    text={option}
                    isSelected={false}
                    onClick={() => {}}
                    disabled={true}
                    showReviewState={true}
                    isCorrectAnswer={answer.correctAnswerIndex === oIdx}
                    isStudentAnswer={answer.selectedAnswerIndex === oIdx}
                  />
                ))}
              </div>

              {/* Explanation block */}
              {answer.explanation && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-primary mb-1">Explanation</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{answer.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function QuizResultPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm font-medium">Loading quiz results...</p>
        </div>
      }>
        <QuizResultContent />
      </Suspense>
    </DashboardLayout>
  )
}
