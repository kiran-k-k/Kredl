"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { QuizHeader } from "@/components/quiz/quiz-header"
import { QuizSidebar } from "@/components/quiz/quiz-sidebar"
import { QuizFooter } from "@/components/quiz/quiz-footer"
import { OptionCard } from "@/components/quiz/option-card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  AlertCircle,
  HelpCircle,
  Play,
  Award,
  Clock,
  RotateCcw,
  BookOpen
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface QuestionInfo {
  _id: string;
  questionText: string;
  options: string[];
}

interface QuizData {
  id: string;
  title: string;
  description?: string;
  timeLimitMinutes: number;
  passingScorePercentage: number;
  totalMarks: number;
  maxAttempts: number;
  cooldownMinutes: number;
  questions: QuestionInfo[];
}

export default function QuizActivePage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const courseId = params?.courseId as string
  const moduleId = params?.moduleId as string

  // State
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [isStarted, setIsStarted] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  // Fetch Course details (for breadcrumbs/names)
  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data } = await api.get(`/courses/${courseId}`)
      return data.data || data
    },
    enabled: !!courseId,
  })

  // Fetch Module details (for breadcrumbs/names)
  const { data: modulesData } = useQuery({
    queryKey: ["course-modules", courseId],
    queryFn: async () => {
      const { data } = await api.get(`/modules?courseId=${course?.id || courseId}&limit=100`)
      return data.data || data
    },
    enabled: !!courseId,
  })

  const activeModule = modulesData?.modules?.find((m: any) => m._id === moduleId || m.slug === moduleId)

  // Fetch Quiz details
  const { data: quiz, isLoading, isError, error } = useQuery<QuizData>({
    queryKey: ["quiz", moduleId],
    queryFn: async () => {
      const { data } = await api.get(`/quiz/${moduleId}`)
      return data.data
    },
    enabled: !!moduleId,
    retry: false,
  })

  // Mutations
  const startQuizMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/quiz/start", { moduleId })
      return data.data
    },
    onSuccess: (data) => {
      setAttemptId(data.attemptId)
      setIsStarted(true)
      toast.success("Quiz attempt started!")
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to start quiz attempt")
    }
  })

  const submitQuizMutation = useMutation({
    mutationFn: async () => {
      const formattedAnswers = Object.entries(answers).map(([qId, index]) => ({
        questionId: qId,
        selectedAnswerIndex: index,
      }))
      const { data } = await api.post("/quiz/submit", {
        attemptId,
        answers: formattedAnswers,
      })
      return data.data
    },
    onSuccess: (data) => {
      toast.success("Quiz submitted successfully!")
      queryClient.invalidateQueries({ queryKey: ["course-modules"] })
      queryClient.invalidateQueries({ queryKey: ["course-progress"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-continue-learning"] })
      queryClient.invalidateQueries({ queryKey: ["student-progress"] })
      queryClient.invalidateQueries({ queryKey: ["course", courseId] })
      router.push(`/courses/${courseId}/module/${moduleId}/quiz/result?attemptId=${data.attemptId}`)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to submit quiz")
    }
  })

  useEffect(() => {
    if (isStarted && quiz?.timeLimitMinutes) {
      setTimeLeft(quiz.timeLimitMinutes * 60)
    }
  }, [isStarted, quiz?.timeLimitMinutes])

  useEffect(() => {
    if (!isStarted || timeLeft === null) return

    if (timeLeft <= 0) {
      toast.info("Time is up! Submitting quiz...")
      submitQuizMutation.mutate()
      setTimeLeft(null)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [isStarted, timeLeft, submitQuizMutation])

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return ""
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-muted-foreground text-sm font-medium">Loading quiz details...</p>
      </div>
    )
  }

  if (isError || !quiz) {
    const status = (error as any)?.response?.status
    const message = (error as any)?.response?.data?.message || "Failed to load quiz"

    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4 text-center">
        <div className="p-4 bg-destructive/10 rounded-full text-destructive mb-4">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {status === 403 ? "Quiz Locked" : "Quiz Unavailable"}
        </h2>
        <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">
          {status === 403
            ? "Complete all lessons in this module first to unlock this quiz."
            : message}
        </p>
        <Button onClick={() => router.push(`/courses/${courseId}`)}>
          Back to Course
        </Button>
      </div>
    )
  }

  // Question navigation helpers
  const questions = quiz?.questions || []
  const currentQuestion = questions[currentIdx]
  const totalQuestions = questions.length

  const answeredQuestionNumbers = questions
    .map((q, idx) => (answers[q._id] !== undefined ? idx + 1 : -1))
    .filter((n) => n !== -1)

  const handleSelectOption = (optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion._id]: optionIndex }))
  }

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

  const handleSubmit = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false)
    submitQuizMutation.mutate()
  }

  // Start Screen view
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-xl w-full border rounded-3xl bg-surface p-8 md:p-10 shadow-lg text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">{quiz.title}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            {quiz.description || "Test your understanding of the topics covered in this module."}
          </p>

          <div className="grid grid-cols-2 gap-4 text-left mb-8">
            <div className="p-4 border rounded-2xl bg-background flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Time Limit</div>
                <div className="text-sm font-bold">{quiz.timeLimitMinutes} Mins</div>
              </div>
            </div>
            <div className="p-4 border rounded-2xl bg-background flex items-center gap-3">
              <Award className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Passing Score</div>
                <div className="text-sm font-bold">{quiz.passingScorePercentage}%</div>
              </div>
            </div>
            <div className="p-4 border rounded-2xl bg-background flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Max Attempts</div>
                <div className="text-sm font-bold">{quiz.maxAttempts} Attempts</div>
              </div>
            </div>
            <div className="p-4 border rounded-2xl bg-background flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Total Questions</div>
                <div className="text-sm font-bold">{totalQuestions} MCQs</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 py-6 rounded-2xl" onClick={() => router.push(`/courses/${courseId}`)}>
              Back
            </Button>
            <Button
              className="flex-1 py-6 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md"
              onClick={() => startQuizMutation.mutate()}
              disabled={startQuizMutation.isPending}
            >
              {startQuizMutation.isPending ? "Starting..." : "Start Quiz"} <Play className="ml-2 h-4 w-4 fill-current" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      {/* Header */}
      <QuizHeader
        courseName={course?.title || "Course"}
        moduleName={activeModule?.title || "Module"}
        quizTitle={quiz.title}
        estimatedTime={timeLeft !== null ? formatTime(timeLeft) : `${quiz.timeLimitMinutes} Mins`}
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
            <div className="mb-8">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Question {currentIdx + 1}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mt-2 leading-tight">
                {currentQuestion?.questionText || "No questions available in this quiz."}
              </h2>
            </div>

            <div className="space-y-4">
              {currentQuestion?.options?.map((option, oIdx) => (
                <OptionCard
                  key={oIdx}
                  id={String(oIdx)}
                  text={option}
                  isSelected={answers[currentQuestion._id] === oIdx}
                  onClick={() => handleSelectOption(oIdx)}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <QuizFooter
        isFirstQuestion={currentIdx === 0}
        isLastQuestion={currentIdx === totalQuestions - 1}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSaveAndContinue={() => toast.success("Draft answers saved!")}
        onSubmit={handleSubmit}
      />

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 text-warning mb-2">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <DialogTitle className="text-xl font-bold">Submit Quiz</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              You have answered <strong>{Object.keys(answers).length}</strong> out of <strong>{totalQuestions}</strong> questions.
              Are you sure you want to submit? You cannot modify answers after submission.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="ghost" onClick={() => setShowConfirmModal(false)}>
              Continue Quiz
            </Button>
            <Button
              variant="default"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md"
              onClick={handleConfirmSubmit}
              disabled={submitQuizMutation.isPending}
            >
              {submitQuizMutation.isPending ? "Submitting..." : "Yes, Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
