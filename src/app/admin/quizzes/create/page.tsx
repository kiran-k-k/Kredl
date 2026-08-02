"use client"

import React, { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { useQuery, useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { getCourseModules } from "@/services/course.api"
import { createQuiz } from "@/services/quiz.api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

export default function CreateQuizPage() {
  const router = useRouter()
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [selectedModuleId, setSelectedModuleId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15)
  const [passingScorePercentage, setPassingScorePercentage] = useState(70)
  const [totalMarks, setTotalMarks] = useState(10)
  const [maxAttempts, setMaxAttempts] = useState(3)
  const [cooldownHours, setCooldownHours] = useState(24)
  const [type, setType] = useState("REGULAR")
  const [targetCompanies, setTargetCompanies] = useState<string[]>([])

  // Fetch Courses
  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses-dropdown"],
    queryFn: async () => {
      const response = await api.get("/admin/courses", { params: { limit: 100 } })
      return response.data?.data || []
    }
  })

  // Fetch Modules for selected course
  const { data: modules = [] } = useQuery({
    queryKey: ["course-modules-dropdown", selectedCourseId],
    queryFn: async () => {
      const response = await api.get("/modules", { params: { courseId: selectedCourseId, limit: 100 } })
      return response.data?.data || []
    },
    enabled: !!selectedCourseId,
  })

  // Fetch Companies
  const { data: companies = [] } = useQuery({
    queryKey: ["admin-companies-dropdown"],
    queryFn: async () => {
      const response = await api.get("/companies")
      return response.data?.data || response.data || []
    }
  })

  // Reset selected module when course changes
  useEffect(() => {
    setSelectedModuleId("")
  }, [selectedCourseId])

  // Create mutation
  const createQuizMutation = useMutation({
    mutationFn: createQuiz,
    onSuccess: (data) => {
      toast.success("Quiz metadata created successfully! Now add questions.")
      router.push(`/admin/quizzes/${data._id}/edit`)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create quiz")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedModuleId) {
      toast.error("Please select a module")
      return
    }
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }
    if (passingScorePercentage < 0 || passingScorePercentage > 100) {
      toast.error("Passing score percentage must be between 0 and 100")
      return
    }

    createQuizMutation.mutate({
      moduleId: selectedModuleId,
      title: title.trim(),
      description: description.trim() || undefined,
      timeLimitMinutes,
      passingScorePercentage,
      totalMarks,
      maxAttempts,
      cooldownMinutes: cooldownHours * 60,
      type,
      targetCompanies,
    })
  }

  return (
    <AdminLayout>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/quizzes">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Quiz</h1>
          <p className="text-muted-foreground mt-1">Setup general properties and attempt rules for the module quiz.</p>
        </div>
      </div>

      <div className="max-w-3xl bg-background border rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Course Selector */}
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <select
                id="course"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="">Select a Course</option>
                {courses.map((course: any) => (
                  <option key={course.id || course._id} value={course.id || course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Module Selector */}
            <div className="space-y-2">
              <Label htmlFor="module">Module</Label>
              <select
                id="module"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                disabled={!selectedCourseId}
              >
                <option value="">Select a Module</option>
                {modules.map((mod: any) => (
                  <option key={mod.id || mod._id} value={mod.id || mod._id}>
                    {mod.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quiz Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input
              id="title"
              placeholder="e.g. Introduction to React Fundamentals Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Provide context or instructions for this quiz (instructions, scoring information, etc.)"
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-4">
            {/* Time Limit */}
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit (Minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                min={1}
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                required
              />
            </div>

            {/* Passing Score */}
            <div className="space-y-2">
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

            {/* Total Marks */}
            <div className="space-y-2">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
            {/* Max Attempts */}
            <div className="space-y-2">
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

            {/* Cooldown Period */}
            <div className="space-y-2">
              <Label htmlFor="cooldown">Cooldown Period (Hours)</Label>
              <Input
                id="cooldown"
                type="number"
                min={0}
                value={cooldownHours}
                onChange={(e) => setCooldownHours(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
            {/* Type */}
            <div className="space-y-2">
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

            {/* Target Companies */}
            <div className="space-y-2">
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
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Link href="/admin/quizzes">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="gap-2"
              disabled={createQuizMutation.isPending}
            >
              <Save className="h-4 w-4" /> Save & Continue
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
