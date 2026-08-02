"use client"

import React, { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import {
  updateQuiz,
  addQuestion,
  editQuestion,
  deleteQuestion,
  reorderQuestions
} from "@/services/quiz.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  AlertCircle
} from "lucide-react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface QuestionItem {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
  order: number;
}

interface QuizItem {
  _id: string;
  title: string;
  description?: string;
  timeLimitMinutes: number;
  passingScorePercentage: number;
  totalMarks: number;
  maxAttempts: number;
  cooldownMinutes: number;
  type: string;
  targetCompanies?: string[];
  questions: QuestionItem[];
}

export default function EditQuizPage() {
  const params = useParams()
  const queryClient = useQueryClient()
  const quizId = params.id as string

  // State for metadata form
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15)
  const [passingScorePercentage, setPassingScorePercentage] = useState(70)
  const [totalMarks, setTotalMarks] = useState(10)
  const [maxAttempts, setMaxAttempts] = useState(3)
  const [cooldownHours, setCooldownHours] = useState(24)
  const [type, setType] = useState("REGULAR")
  const [targetCompanies, setTargetCompanies] = useState<string[]>([])

  // State for question form dialogs
  const [isQuestionOpen, setIsQuestionOpen] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [questionText, setQuestionText] = useState("")
  const [options, setOptions] = useState<string[]>(["", "", "", ""]) // Four options A, B, C, D
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0)
  const [explanation, setExplanation] = useState("")

  // Fetch all quizzes to locate the specific quiz object
  const { data: quizzes = [], isLoading, isError } = useQuery<QuizItem[]>({
    queryKey: ["admin-quizzes"],
    queryFn: async () => {
      const response = await api.get("/admin/quizzes")
      return response.data?.data || response.data || []
    }
  })

  // Fetch Companies
  const { data: companies = [] } = useQuery({
    queryKey: ["admin-companies-dropdown"],
    queryFn: async () => {
      const response = await api.get("/companies")
      return response.data?.data || response.data || []
    }
  })

  const quiz = quizzes.find((q: any) => (q.id || q._id) === quizId)

  // Initialize fields once loaded
  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title)
      setDescription(quiz.description || "")
      setTimeLimitMinutes(quiz.timeLimitMinutes)
      setPassingScorePercentage(quiz.passingScorePercentage)
      setTotalMarks(quiz.totalMarks)
      setMaxAttempts(quiz.maxAttempts)
      setCooldownHours(Math.round((quiz.cooldownMinutes || 1440) / 60))
      setType(quiz.type || "REGULAR")
      setTargetCompanies(quiz.targetCompanies || [])
    }
  }, [quiz])

  // Save metadata mutation
  const updateMetadataMutation = useMutation({
    mutationFn: (input: any) => updateQuiz(quizId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] })
      toast.success("Quiz settings updated successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update quiz settings")
    }
  })

  // Add question mutation
  const addQuestionMutation = useMutation({
    mutationFn: (input: any) => addQuestion(quizId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] })
      toast.success("Question added successfully")
      closeQuestionDialog()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add question")
    }
  })

  // Edit question mutation
  const editQuestionMutation = useMutation({
    mutationFn: ({ questionId, input }: { questionId: string; input: any }) =>
      editQuestion(quizId, questionId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] })
      toast.success("Question updated successfully")
      closeQuestionDialog()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to edit question")
    }
  })

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) => deleteQuestion(quizId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] })
      toast.success("Question deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete question")
    }
  })

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: (questionIds: string[]) => reorderQuestions(quizId, questionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] })
      toast.success("Questions reordered successfully")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reorder questions")
    }
  })

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    updateMetadataMutation.mutate({
      title,
      description,
      timeLimitMinutes,
      passingScorePercentage,
      totalMarks,
      maxAttempts,
      cooldownMinutes: cooldownHours * 60,
      type,
      targetCompanies,
    })
  }

  const openAddDialog = () => {
    setEditingQuestionId(null)
    setQuestionText("")
    setOptions(["", "", "", ""])
    setCorrectAnswerIndex(0)
    setExplanation("")
    setIsQuestionOpen(true)
  }

  const openEditDialog = (q: QuestionItem) => {
    setEditingQuestionId(q._id)
    setQuestionText(q.questionText)
    setOptions([...q.options])
    setCorrectAnswerIndex(q.correctAnswerIndex)
    setExplanation(q.explanation || "")
    setIsQuestionOpen(true)
  }

  const closeQuestionDialog = () => {
    setIsQuestionOpen(false)
    setEditingQuestionId(null)
  }

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault()

    if (!questionText.trim()) {
      toast.error("Question text is required")
      return
    }

    if (options.some((opt) => !opt.trim())) {
      toast.error("All 4 options must be filled")
      return
    }

    const normalizedOptions = options.map((opt) => opt.trim().toLowerCase())
    const uniqueOptions = new Set(normalizedOptions)
    if (uniqueOptions.size !== options.length) {
      toast.error("Duplicate options are not allowed")
      return
    }

    const payload = {
      questionText: questionText.trim(),
      options: options.map((o) => o.trim()),
      correctAnswerIndex,
      explanation: explanation.trim() || undefined,
    }

    if (editingQuestionId) {
      editQuestionMutation.mutate({ questionId: editingQuestionId, input: payload })
    } else {
      addQuestionMutation.mutate(payload)
    }
  }

  const handleMove = (index: number, direction: "up" | "down") => {
    if (!quiz || !quiz.questions) return

    const newQuestions = [...quiz.questions].sort((a, b) => (a.order || 0) - (b.order || 0))
    const targetIndex = direction === "up" ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newQuestions.length) return

    // Swap elements
    const temp = newQuestions[index]
    newQuestions[index] = newQuestions[targetIndex]
    newQuestions[targetIndex] = temp

    // Extract sorted IDs
    const sortedIds = newQuestions.map((q) => q._id)
    reorderMutation.mutate(sortedIds)
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p>Loading quiz settings...</p>
        </div>
      </AdminLayout>
    )
  }

  if (isError || !quiz) {
    return (
      <AdminLayout>
        <div className="p-12 text-center text-red-500 flex flex-col items-center justify-center gap-2">
          <AlertCircle className="h-8 w-8" />
          <p className="font-bold">Quiz not found</p>
          <Link href="/admin/quizzes">
            <Button size="sm" className="mt-4">Back to Quiz List</Button>
          </Link>
        </div>
      </AdminLayout>
    )
  }

  const sortedQuestions = [...(quiz.questions || [])].sort((a, b) => (a.order || 0) - (b.order || 0))

  return (
    <AdminLayout>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/quizzes">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Quiz</h1>
          <p className="text-muted-foreground mt-1">Configure quiz parameters and manage multiple choice questions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quiz Parameters Form */}
        <div className="lg:col-span-1 bg-background border rounded-2xl p-6 shadow-sm self-start">
          <h2 className="text-lg font-bold mb-4">Quiz Settings</h2>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timeLimit">Time Limit (mins)</Label>
              <Input
                id="timeLimit"
                type="number"
                min={1}
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                id="passingScore"
                type="number"
                min={1}
                max={100}
                value={passingScorePercentage}
                onChange={(e) => setPassingScorePercentage(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input
                id="totalMarks"
                type="number"
                min={1}
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maxAttempts">Max Attempts</Label>
              <Input
                id="maxAttempts"
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cooldown">Cooldown (Hours)</Label>
              <Input
                id="cooldown"
                type="number"
                min={0}
                value={cooldownHours}
                onChange={(e) => setCooldownHours(Number(e.target.value))}
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="type">Quiz Type</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="REGULAR">Regular Quiz</option>
                <option value="PRACTICE">Practice Set</option>
                <option value="MOCK_TEST">Mock Test</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Target Companies (Mock Tests)</Label>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto border rounded-md p-2 bg-background">
                {companies.map((company: any) => (
                  <label key={company.id || company._id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={targetCompanies.includes(company.id || company._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTargetCompanies([...targetCompanies, company.id || company._id])
                        } else {
                          setTargetCompanies(targetCompanies.filter(id => id !== (company.id || company._id)))
                        }
                      }}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                    {company.name}
                  </label>
                ))}
                {companies.length === 0 && <span className="text-xs text-muted-foreground p-1">No companies found.</span>}
              </div>
            </div>

            <Button type="submit" className="w-full gap-2 mt-4" disabled={updateMetadataMutation.isPending}>
              <Save className="h-4 w-4" /> Save Settings
            </Button>
          </form>
        </div>

        {/* Right Column: Question Management */}
        <div className="lg:col-span-2 bg-background border rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold">Quiz Questions</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {sortedQuestions.length === 0
                  ? "No questions added yet."
                  : `${sortedQuestions.length} multiple choice questions configured.`}
              </p>
            </div>
            <Button onClick={openAddDialog} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Question
            </Button>
          </div>

          {/* Questions List */}
          {sortedQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl bg-surface/50">
              <HelpCircle className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="font-semibold text-muted-foreground">Add Questions</p>
              <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
                At least one question is required before this quiz can be published.
              </p>
              <Button onClick={openAddDialog} size="sm">Create First Question</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedQuestions.map((q, index) => (
                <div
                  key={q._id}
                  className="p-4 border rounded-xl hover:border-primary/30 transition-colors flex gap-4 items-start"
                >
                  {/* Sorting Buttons */}
                  <div className="flex flex-col gap-1 items-center justify-center mt-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      disabled={index === 0 || reorderMutation.isPending}
                      onClick={() => handleMove(index, "up")}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-bold text-muted-foreground/75">{index + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      disabled={index === sortedQuestions.length - 1 || reorderMutation.isPending}
                      onClick={() => handleMove(index, "down")}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Question Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm leading-relaxed">{q.questionText}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = oIdx === q.correctAnswerIndex
                        return (
                          <div
                            key={oIdx}
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs border ${
                              isCorrect
                                ? "bg-green-500/5 border-green-500/20 text-green-700 font-semibold"
                                : "bg-surface border-input text-muted-foreground"
                            }`}
                          >
                            <span className="font-mono font-bold uppercase">
                              {String.fromCharCode(65 + oIdx)}:
                            </span>
                            <span className="truncate">{opt}</span>
                          </div>
                        )
                      })}
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-muted-foreground mt-3 bg-muted/50 p-2.5 rounded-lg italic">
                        <strong className="not-italic">Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>

                  {/* Edit/Delete Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary"
                      onClick={() => openEditDialog(q)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => deleteQuestionMutation.mutate(q._id)}
                      disabled={deleteQuestionMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Question Form Dialog */}
      <Dialog open={isQuestionOpen} onOpenChange={setIsQuestionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingQuestionId ? "Edit Question" : "Add Question"}</DialogTitle>
            <DialogDescription>
              Configure the question text, options, correct answer index, and explanation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveQuestion} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="qText">Question Text</Label>
              <textarea
                id="qText"
                placeholder="Enter the question text here..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {options.map((opt, oIdx) => (
                <div key={oIdx} className="space-y-1.5">
                  <Label htmlFor={`opt-${oIdx}`}>Option {String.fromCharCode(65 + oIdx)}</Label>
                  <Input
                    id={`opt-${oIdx}`}
                    placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options]
                      newOpts[oIdx] = e.target.value
                      setOptions(newOpts)
                    }}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Correct Answer Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="correctAnswer">Correct Answer</Label>
                <select
                  id="correctAnswer"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={correctAnswerIndex}
                  onChange={(e) => setCorrectAnswerIndex(Number(e.target.value))}
                >
                  {options.map((_, oIdx) => (
                    <option key={oIdx} value={oIdx}>
                      Option {String.fromCharCode(65 + oIdx)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Explanation */}
              <div className="space-y-1.5">
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Input
                  id="explanation"
                  placeholder="Explain why this option is correct"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={closeQuestionDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addQuestionMutation.isPending || editQuestionMutation.isPending}
              >
                Save Question
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
