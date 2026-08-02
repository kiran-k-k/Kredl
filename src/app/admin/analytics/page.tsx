"use client"

import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { AdminLayout } from "@/components/layout/admin-layout"
import { api } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, RefreshCw, BarChart2, AlertTriangle, CheckCircle2, XCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface QuizAnalyticsRow {
  quizId: string;
  quizName: string;
  moduleName: string;
  courseName: string;
  totalAttempts: number;
  avgScore: number;
  avgPercentage: number;
  highestScore: number;
  lowestScore: number;
  passCount: number;
  failCount: number;
  passRate: number;
  failRate: number;
}

interface QuestionAnalyticsRow {
  questionId: string;
  incorrectCount: number;
  totalCount: number;
  incorrectPercentage: number;
  quizTitle: string;
  moduleTitle: string;
  questionText: string;
  correctAnswer: string;
}

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"quizzes" | "questions">("quizzes")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch Quizzes Analytics
  const { 
    data: quizzesData, 
    isLoading: isQuizzesLoading, 
    isError: isQuizzesError, 
    refetch: refetchQuizzes 
  } = useQuery<QuizAnalyticsRow[]>({
    queryKey: ["admin-analytics-quizzes"],
    queryFn: async () => {
      const response = await api.get("/admin/analytics/quizzes")
      return response.data?.data || []
    }
  })

  // Fetch Most Missed Questions
  const { 
    data: questionsData, 
    isLoading: isQuestionsLoading, 
    isError: isQuestionsError, 
    refetch: refetchQuestions 
  } = useQuery<QuestionAnalyticsRow[]>({
    queryKey: ["admin-analytics-questions"],
    queryFn: async () => {
      const response = await api.get("/admin/analytics/questions")
      return response.data?.data || []
    }
  })

  const quizzesList = quizzesData || []
  const questionsList = questionsData || []

  // Filter quizzes by search query
  const filteredQuizzes = quizzesList.filter(q => 
    q.quizName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.moduleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Filter questions by search query
  const filteredQuestions = questionsList.filter(q => 
    q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.quizTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderQuizzesTable = () => {
    if (isQuizzesLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )
    }

    if (isQuizzesError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 border border-destructive/20 rounded-xl bg-destructive/5 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <h3 className="font-bold text-foreground">Failed to Load Analytics</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">An error occurred while loading quiz analytics summary.</p>
          <Button onClick={() => void refetchQuizzes()} className="mt-4 gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      )
    }

    if (filteredQuizzes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl text-center">
          <BarChart2 className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-bold text-foreground">No Quizzes Found</h3>
          <p className="text-sm text-muted-foreground mt-1">There are no quizzes matching your search or no quizzes created.</p>
        </div>
      )
    }

    return (
      <div className="border rounded-xl overflow-hidden bg-background shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-4">Quiz Name</th>
                <th className="px-6 py-4">Course / Module</th>
                <th className="px-6 py-4 text-center">Attempts</th>
                <th className="px-6 py-4 text-center">Avg Score (%)</th>
                <th className="px-6 py-4 text-center">High / Low</th>
                <th className="px-6 py-4 text-center">Pass / Fail</th>
                <th className="px-6 py-4 text-right">Pass Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredQuizzes.map((row) => (
                <tr key={row.quizId} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground max-w-xs truncate">{row.quizName}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-medium text-muted-foreground">{row.courseName}</div>
                    <div className="text-xs text-muted-foreground/80 mt-0.5">{row.moduleName}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">{row.totalAttempts}</td>
                  <td className="px-6 py-4 text-center font-mono">
                    {row.avgScore.toFixed(1)} ({Math.round(row.avgPercentage)}%)
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-xs">
                    <span className="text-success font-semibold">{row.highestScore}</span> / <span className="text-destructive font-semibold">{row.lowestScore}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs">
                    <span className="inline-flex items-center gap-1 text-success bg-success/10 px-2 py-0.5 rounded-md font-semibold border border-success/20">
                      <CheckCircle2 className="h-3 w-3" /> {row.passCount}
                    </span>
                    <span className="inline-flex items-center gap-1 text-destructive bg-destructive/10 px-2 py-0.5 rounded-md font-semibold border border-destructive/20 ml-2">
                      <XCircle className="h-3 w-3" /> {row.failCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-success">
                    {Math.round(row.passRate)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderQuestionsTable = () => {
    if (isQuestionsLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )
    }

    if (isQuestionsError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 border border-destructive/20 rounded-xl bg-destructive/5 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <h3 className="font-bold text-foreground">Failed to Load Analytics</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">An error occurred while loading most missed questions data.</p>
          <Button onClick={() => void refetchQuestions()} className="mt-4 gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      )
    }

    if (filteredQuestions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl text-center">
          <AlertTriangle className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-bold text-foreground">No Missed Questions</h3>
          <p className="text-sm text-muted-foreground mt-1">There are no missed questions recorded or matching your filter.</p>
        </div>
      )
    }

    return (
      <div className="border rounded-xl overflow-hidden bg-background shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-4">Question</th>
                <th className="px-6 py-4">Quiz / Module</th>
                <th className="px-6 py-4 text-center">Incorrect Attempts</th>
                <th className="px-6 py-4 text-center">Incorrect (%)</th>
                <th className="px-6 py-4 text-right">Correct Answer</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredQuestions.map((row) => (
                <tr key={row.questionId} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground max-w-md">{row.questionText}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-semibold text-muted-foreground">{row.quizTitle}</div>
                    <div className="text-xs text-muted-foreground/80 mt-0.5">{row.moduleTitle}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold text-destructive">{row.incorrectCount} / {row.totalCount}</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-destructive">
                    {Math.round(row.incorrectPercentage)}%
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-success max-w-xs truncate">{row.correctAnswer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Quiz & Question Analytics</h1>
          <p className="text-muted-foreground mt-1">Analyze quiz attempt metrics and track most missed questions to improve curriculum design.</p>
        </div>

        {/* Tab Controls and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab("quizzes"); setSearchQuery(""); }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === "quizzes"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted-foreground hover:bg-muted"
              }`}
            >
              Quiz Summary
            </button>
            <button
              onClick={() => { setActiveTab("questions"); setSearchQuery(""); }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeTab === "questions"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-muted-foreground hover:bg-muted"
              }`}
            >
              Most Missed Questions
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === "quizzes" ? "Search quizzes..." : "Search questions..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-background border-muted text-sm focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Main tables rendering */}
        {activeTab === "quizzes" ? renderQuizzesTable() : renderQuestionsTable()}
      </div>
    </AdminLayout>
  )
}
