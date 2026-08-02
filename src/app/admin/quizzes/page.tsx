"use client"

import React, { useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAdminQuizzes, deleteQuiz, publishQuiz, unpublishQuiz } from "@/services/quiz.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  Play,
  Pause
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminQuizzesPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteTargetQuiz, setDeleteTargetQuiz] = useState<{ id: string; title: string } | null>(null)

  // Fetch quizzes
  const { data: quizzes = [], isLoading, isError } = useQuery({
    queryKey: ["admin-quizzes"],
    queryFn: getAdminQuizzes,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] })
      toast.success("Quiz deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete quiz")
    }
  })

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: publishQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] })
      toast.success("Quiz published successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to publish quiz")
    }
  })

  // Unpublish mutation
  const unpublishMutation = useMutation({
    mutationFn: unpublishQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] })
      toast.success("Quiz unpublished successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to unpublish quiz")
    }
  })

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Management</h1>
          <p className="text-muted-foreground mt-1">Manage quizzes, questions, and attempt policies for course modules.</p>
        </div>
        <Link href="/admin/quizzes/create" passHref>
          <Button className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Create Quiz
          </Button>
        </Link>
      </div>

      <div className="bg-background border rounded-2xl shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row items-center gap-4 justify-between bg-surface/50 rounded-t-2xl">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List Content */}
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p>Loading quizzes...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="h-8 w-8" />
            <p className="font-bold">Error loading quizzes</p>
            <p className="text-sm">Please try refreshing the page.</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-4">
            <HelpCircle className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-semibold">No Quizzes Found</p>
            <p className="text-sm max-w-sm mx-auto">Create a quiz to get started or adjust your search parameters.</p>
            <Link href="/admin/quizzes/create">
              <Button size="sm">Create First Quiz</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface border-b text-muted-foreground">
                <tr>
                  <th className="p-4 font-semibold">Quiz Details</th>
                  <th className="p-4 font-semibold text-center">Questions</th>
                  <th className="p-4 font-semibold text-center">Time Limit</th>
                  <th className="p-4 font-semibold text-center">Passing Score</th>
                  <th className="p-4 font-semibold text-center">Attempts Allowed</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredQuizzes.map((quiz) => (
                  <tr key={quiz._id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-base text-foreground">{quiz.title}</div>
                      {quiz.description && (
                        <p className="text-muted-foreground text-xs line-clamp-1 mt-0.5">{quiz.description}</p>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center bg-muted px-2.5 py-0.5 rounded-full text-xs font-bold border">
                        {quiz.questions?.length || 0}
                      </span>
                    </td>
                    <td className="p-4 text-center text-muted-foreground">
                      {quiz.timeLimitMinutes} mins
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-semibold text-foreground">{quiz.passingScorePercentage}%</span>
                    </td>
                    <td className="p-4 text-center text-muted-foreground">
                      {quiz.maxAttempts} attempts
                    </td>
                    <td className="p-4 text-center">
                      {quiz.isPublished ? (
                        <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full text-xs font-bold border border-green-500/20">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full text-xs font-bold border border-yellow-500/20">
                          <XCircle className="h-3.5 w-3.5" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {quiz.isPublished ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Unpublish Quiz"
                            onClick={() => unpublishMutation.mutate(quiz._id)}
                            disabled={unpublishMutation.isPending}
                          >
                            <Pause className="h-4 w-4 text-yellow-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Publish Quiz"
                            onClick={() => publishMutation.mutate(quiz._id)}
                            disabled={publishMutation.isPending}
                          >
                            <Play className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Link href={`/admin/quizzes/${quiz._id}/edit`} passHref>
                          <Button variant="ghost" size="icon" title="Edit Quiz & Questions">
                            <Edit2 className="h-4 w-4 text-primary" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete Quiz"
                          onClick={() => setDeleteTargetQuiz({ id: quiz._id, title: quiz.title })}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTargetQuiz} onOpenChange={(open) => !open && setDeleteTargetQuiz(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the quiz &quot;{deleteTargetQuiz?.title}&quot;? This will delete all attempt history and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTargetQuiz(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (deleteTargetQuiz) {
                  deleteMutation.mutate(deleteTargetQuiz.id)
                  setDeleteTargetQuiz(null)
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
