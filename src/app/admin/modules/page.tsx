"use client"

import React, { useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Search, Plus, MoreHorizontal, GripVertical, CheckCircle2, XCircle, Loader2, AlertCircle, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { X, Trash2 } from "lucide-react"

export default function AdminModulesPage() {
  const [search, setSearch] = useState("")
  const [courseId, setCourseId] = useState("")
  const [page, setPage] = useState(1)
  const limit = 100
  const queryClient = useQueryClient()

  // For Edit/Create modal
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<any | null>(null)
  
  // Form State
  const [formFields, setFormFields] = useState({
    title: "",
    description: "",
    courseId: "",
    order: 0,
    estimatedTimeMinutes: 60,
  })

  // Fetch Courses for Dropdown
  const { data: coursesData } = useQuery({
    queryKey: ['admin-courses-minimal'],
    queryFn: async () => {
      const res = await api.get('/admin/courses', { params: { limit: 100 } })
      return res.data?.data || []
    }
  })

  // Fetch Modules
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-modules', page, search, courseId],
    queryFn: async () => {
      const params: any = { page, limit }
      if (search) params.search = search
      if (courseId) params.courseId = courseId
      const res = await api.get('/modules', { params })
      return res.data?.data ? res.data : res.data
    }
  })

  const modules = data?.data || []
  const total = data?.pagination?.total || data?.total || 0
  const totalPages = Math.ceil(total / limit)

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post("/modules", payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] })
      toast.success("Module created")
      setIsEditorOpen(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create module")
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return api.patch(`/modules/${id}`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] })
      toast.success("Module updated")
      setIsEditorOpen(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update module")
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/modules/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-modules"] })
      toast.success("Module deleted")
    },
    onError: (err: any) => toast.error("Failed to delete module")
  })

  const handleCreateOpen = () => {
    setEditingModule(null)
    setFormFields({
      title: "",
      description: "",
      courseId: courseId || (coursesData?.[0]?.id || ""),
      order: (modules.length || 0) + 1,
      estimatedTimeMinutes: 60,
    })
    setIsEditorOpen(true)
  }

  const handleEditOpen = (mod: any) => {
    setEditingModule(mod)
    setFormFields({
      title: mod.title,
      description: mod.description || "",
      courseId: mod.courseId?._id || mod.courseId,
      order: mod.order,
      estimatedTimeMinutes: mod.estimatedTimeMinutes || 60,
    })
    setIsEditorOpen(true)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formFields.title || !formFields.courseId) {
      toast.error("Title and Course are required")
      return
    }

    const payload = {
      title: formFields.title,
      description: formFields.description,
      courseId: formFields.courseId,
      order: Number(formFields.order),
      estimatedTimeMinutes: Number(formFields.estimatedTimeMinutes),
      status: "published"
    }

    if (editingModule) {
      updateMutation.mutate({ id: editingModule.id || editingModule._id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <AdminLayout>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
          <p className="text-muted-foreground mt-1">Organize courses into structured learning modules.</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={handleCreateOpen}>
          <Plus className="h-4 w-4" /> Create Module
        </Button>
      </div>

      <div className="bg-background border rounded-2xl shadow-sm flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row items-center gap-4 justify-between bg-surface/50 rounded-t-2xl">
          
          {/* Course Context Selector */}
          <div className="w-full sm:max-w-xs">
            <select 
              value={courseId} 
              onChange={(e) => { setCourseId(e.target.value); setPage(1); }}
              className="h-9 w-full rounded-md border bg-background px-3 py-1 font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <option value="">All Courses</option>
              {coursesData?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search modules..." 
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
              <p>Loading modules...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-destructive">
              <AlertCircle className="h-8 w-8 mb-4" />
              <p>Failed to load modules.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-surface border-b text-muted-foreground">
                <tr>
                  <th className="w-12 p-4 text-center"></th>
                  <th className="p-4 font-semibold">Module Name</th>
                  <th className="p-4 font-semibold">Course</th>
                  <th className="p-4 font-semibold text-center">Order</th>
                  <th className="p-4 font-semibold text-center">Duration</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {modules.map((module: any) => (
                  <tr key={module.id || module._id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4 text-center">
                      <button className="text-muted-foreground/30 hover:text-foreground cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="p-4">
                      <p className="font-bold">{module.title}</p>
                      {module.description && <p className="text-xs text-muted-foreground line-clamp-1">{module.description}</p>}
                    </td>
                    <td className="p-4 text-muted-foreground">{module.courseId?.title || 'Unknown'}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center bg-muted px-2.5 py-0.5 rounded-full text-xs font-bold border">
                        {module.order}
                      </span>
                    </td>
                    <td className="p-4 text-center text-muted-foreground">
                      {module.estimatedTimeMinutes} min
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditOpen(module)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm(`Delete module "${module.title}"?`)) {
                              deleteMutation.mutate(module.id || module._id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {modules.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No modules found. Create one.
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
            <span>Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} modules</span>
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
                {editingModule ? "Edit Module" : "Create Module"}
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleFormSubmit}>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Title *</label>
                <Input
                  required
                  placeholder="e.g. Introduction to React"
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
                <label className="text-xs font-bold text-muted-foreground uppercase">Course *</label>
                <select
                  required
                  value={formFields.courseId}
                  onChange={(e) => setFormFields({ ...formFields, courseId: e.target.value })}
                  className="h-10 w-full rounded-xl border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="" disabled>Select a course</option>
                  {coursesData?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
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
                  <label className="text-xs font-bold text-muted-foreground uppercase">Est. Minutes</label>
                  <Input
                    type="number"
                    value={formFields.estimatedTimeMinutes}
                    onChange={(e) => setFormFields({ ...formFields, estimatedTimeMinutes: Number(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-surface/50 flex justify-end gap-3 flex-wrap">
              <Button type="button" variant="outline" className="rounded-xl w-full sm:w-auto" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl w-full sm:w-auto font-bold">
                {editingModule ? "Update Module" : "Create Module"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
