"use client"

import React, { useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Search, Plus, Play, FileText, Loader2, AlertCircle, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { X } from "lucide-react"

export default function AdminLessonsPage() {
  const [search, setSearch] = useState("")
  const [courseId, setCourseId] = useState("")
  const [moduleId, setModuleId] = useState("")
  const [page, setPage] = useState(1)
  const limit = 100
  const queryClient = useQueryClient()

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any | null>(null)

  const [formFields, setFormFields] = useState({
    title: "",
    description: "",
    moduleId: "",
    youtubeUrl: "",
    githubUrl: "",
    durationMinutes: 5,
    order: 0,
    status: "published",
  })

  // Fetch Courses
  const { data: coursesData } = useQuery({
    queryKey: ['admin-courses-minimal'],
    queryFn: async () => {
      const res = await api.get('/admin/courses', { params: { limit: 100 } })
      return res.data?.data || []
    }
  })

  // Fetch Modules
  const { data: modulesData } = useQuery({
    queryKey: ['admin-modules-minimal', courseId],
    queryFn: async () => {
      const params: any = { limit: 100 }
      if (courseId) params.courseId = courseId
      const res = await api.get('/modules', { params })
      return res.data?.data || []
    }
  })

  // Fetch Lessons
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-lessons', page, search, courseId, moduleId],
    queryFn: async () => {
      const params: any = { page, limit }
      if (search) params.search = search
      if (moduleId) params.moduleId = moduleId
      if (courseId && !moduleId) params.courseId = courseId
      const res = await api.get('/lessons', { params })
      return res.data?.data ? res.data : res.data
    }
  })

  const lessons = data?.data || []
  const total = data?.pagination?.total || data?.total || 0
  const totalPages = Math.ceil(total / limit)

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post("/lessons", payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] })
      toast.success("Lesson created")
      setIsEditorOpen(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create lesson")
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return api.patch(`/lessons/${id}`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] })
      toast.success("Lesson updated")
      setIsEditorOpen(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update lesson")
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/lessons/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons"] })
      toast.success("Lesson deleted")
    },
    onError: (err: any) => toast.error("Failed to delete lesson")
  })

  const handleCreateOpen = () => {
    setEditingLesson(null)
    setFormFields({
      title: "",
      description: "",
      moduleId: moduleId || (modulesData?.[0]?.id || modulesData?.[0]?._id || ""),
      youtubeUrl: "",
      githubUrl: "",
      durationMinutes: 5,
      order: (lessons.length || 0) + 1,
      status: "draft",
    })
    setIsEditorOpen(true)
  }

  const handleEditOpen = (lesson: any) => {
    setEditingLesson(lesson)
    setFormFields({
      title: lesson.title,
      description: lesson.description || "",
      moduleId: lesson.moduleId?.id || lesson.moduleId?._id || lesson.moduleId,
      youtubeUrl: lesson.youtubeUrl || "",
      githubUrl: lesson.githubUrl || "",
      durationMinutes: lesson.durationMinutes || 5,
      order: lesson.order,
      status: lesson.status || "draft",
    })
    setIsEditorOpen(true)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formFields.title || !formFields.moduleId) {
      toast.error("Title and Module are required")
      return
    }

    const payload: any = {
      ...formFields,
      order: Number(formFields.order),
      durationMinutes: Number(formFields.durationMinutes)
    }
    
    if (!payload.youtubeUrl) {
      delete payload.youtubeUrl;
    }
    if (!payload.githubUrl) {
      delete payload.githubUrl;
    }

    if (editingLesson) {
      updateMutation.mutate({ id: editingLesson.id || editingLesson._id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleToggleStatus = (lesson: any) => {
    const newStatus = lesson.status === "published" ? "draft" : "published"
    updateMutation.mutate({ id: lesson.id || lesson._id, payload: { status: newStatus } })
  }

  return (
    <AdminLayout>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lessons</h1>
          <p className="text-muted-foreground mt-1">Manage video and text lessons across modules.</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={handleCreateOpen}>
          <Plus className="h-4 w-4" /> Create Lesson
        </Button>
      </div>

      <div className="bg-background border rounded-2xl shadow-sm flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row items-center gap-4 justify-between bg-surface/50 rounded-t-2xl">
          
          {/* Nested Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              value={courseId}
              onChange={(e) => { setCourseId(e.target.value); setModuleId(""); setPage(1); }}
              className="h-9 w-full sm:w-48 rounded-md border bg-background px-3 py-1 font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <option value="">All Courses</option>
              {coursesData?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <select 
              value={moduleId}
              onChange={(e) => { setModuleId(e.target.value); setPage(1); }}
              className="h-9 w-full sm:w-48 rounded-md border bg-background px-3 py-1 font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-muted-foreground"
            >
              <option value="">All Modules</option>
              {modulesData?.map((m: any) => (
                <option key={m.id || m._id} value={m.id || m._id}>{m.title}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search lessons..." 
              className="pl-9 h-9" 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
              <p>Loading lessons...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-destructive">
              <AlertCircle className="h-8 w-8 mb-4" />
              <p>Failed to load lessons.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-surface border-b text-muted-foreground">
                <tr>
                  <th className="p-4 font-semibold w-[350px]">Lesson Title</th>
                  <th className="p-4 font-semibold">Module</th>
                  <th className="p-4 font-semibold">Duration</th>
                  <th className="p-4 font-semibold">Order</th>
                  <th className="p-4 font-semibold text-center">Published</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lessons.map((lesson: any) => (
                  <tr key={lesson.id || lesson._id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                          {lesson.youtubeUrl ? (
                            <Play className="h-3.5 w-3.5 text-primary ml-0.5" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 text-primary" />
                          )}
                        </div>
                        <span className="font-bold">{lesson.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs font-medium">{lesson.moduleId?.title || 'Unknown'}</td>
                    <td className="p-4 text-muted-foreground font-mono">
                      {lesson.durationMinutes} min
                    </td>
                    <td className="p-4 font-bold text-muted-foreground">
                      {lesson.order}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleToggleStatus(lesson)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${lesson.status === 'published' ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${lesson.status === 'published' ? 'translate-x-2' : '-translate-x-2'}`} />
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditOpen(lesson)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => {
                          if(confirm(`Delete lesson "${lesson.title}"?`)) {
                            deleteMutation.mutate(lesson.id || lesson._id)
                          }
                        }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {lessons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No lessons found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination Footer */}
        {!isLoading && !isError && (
          <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground bg-surface/50 rounded-b-2xl">
            <span>Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} lessons</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">{page}</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}

      </div>

      {/* Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background rounded-2xl border">
          <DialogHeader className="p-6 border-b bg-surface/50">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                {editingLesson ? "Edit Lesson" : "Create Lesson"}
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleFormSubmit}>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Title *</label>
                <Input
                  required
                  placeholder="e.g. React Components"
                  value={formFields.title}
                  onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Description</label>
                <Input
                  placeholder="Optional description"
                  value={formFields.description}
                  onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Module *</label>
                <select
                  required
                  value={formFields.moduleId || ""}
                  onChange={(e) => setFormFields({ ...formFields, moduleId: e.target.value })}
                  className="h-10 w-full rounded-xl border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="" disabled>Select a module</option>
                  {modulesData?.map((m: any) => (
                    <option key={m.id || m._id} value={m.id || m._id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">YouTube Embed URL</label>
                <Input
                  placeholder="e.g. https://www.youtube.com/embed/XXXXX"
                  value={formFields.youtubeUrl}
                  onChange={(e) => setFormFields({ ...formFields, youtubeUrl: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">GitHub Repository URL</label>
                <Input
                  placeholder="e.g. https://github.com/owner/repo"
                  value={formFields.githubUrl}
                  onChange={(e) => setFormFields({ ...formFields, githubUrl: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Order Index *</label>
                  <Input
                    type="number"
                    required
                    value={formFields.order}
                    onChange={(e) => setFormFields({ ...formFields, order: Number(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Duration (mins) *</label>
                  <Input
                    type="number"
                    required
                    value={formFields.durationMinutes}
                    onChange={(e) => setFormFields({ ...formFields, durationMinutes: Number(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Status</label>
                <select
                  value={formFields.status}
                  onChange={(e) => setFormFields({ ...formFields, status: e.target.value })}
                  className="h-10 w-full rounded-xl border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t bg-surface/50 flex justify-end gap-3 flex-wrap">
              <Button type="button" variant="outline" className="rounded-xl w-full sm:w-auto" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl w-full sm:w-auto font-bold">
                {editingLesson ? "Update Lesson" : "Create Lesson"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
