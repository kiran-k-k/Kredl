"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminLayout } from "@/components/layout/admin-layout"
import {
  Search,
  Plus,
  Edit,
  Trash,
  Globe,
  Globe2,
  AlertTriangle,
  RefreshCw,
  BookOpen,
  Image as ImageIcon,
  CheckCircle,
  X,
  FileSpreadsheet
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

const CATEGORIES = [
  "Software Development",
  "Artificial Intelligence",
  "Embedded Systems",
  "Productivity",
  "Placement",
  "Placement Preparation",
  "Communication",
  "Competitive Exams",
  "DSA",
  "Java",
  "Web Dev",
  "System Design",
]

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"]

export default function AdminCoursesPage() {
  const queryClient = useQueryClient()
  
  // Search, Filters, and Pagination States
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [page, setPage] = useState(1)
  const limit = 8

  // Modal Dialog States
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any | null>(null)
  const [courseToDelete, setCourseToDelete] = useState<any | null>(null)

  // Form Fields State
  const [formFields, setFormFields] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    category: "Software Development",
    difficulty: "Beginner",
    thumbnail: "",
    thumbnailAlt: "",
    estimatedDuration: "",
    displayOrder: 0,
    isFeatured: false,
    isPublished: false,
    seoTitle: "",
    seoDescription: "",
  })

  const [formErrors, setFormErrors] = useState<string | null>(null)

  // Query: Get Admin Stats
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["admin-courses-stats"],
    queryFn: async () => {
      const response = await api.get("/admin/courses/stats")
      return response.data
    },
  })

  // Query: Get Course List
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-courses", { search, category, difficulty, page }],
    queryFn: async () => {
      const response = await api.get("/admin/courses", {
        params: {
          page,
          limit,
          search: search || undefined,
          category: category || undefined,
          difficulty: difficulty || undefined,
        },
      })
      return response.data
    },
  })

  const courses = data?.data || []
  const totalItems = data?.pagination?.total || 0
  const totalPages = data?.pagination?.totalPages || 1

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post("/admin/courses", payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] })
      queryClient.invalidateQueries({ queryKey: ["admin-courses-stats"] })
      setIsEditorOpen(false)
    },
    onError: (err: any) => {
      setFormErrors(err?.response?.data?.message || "Failed to create course.")
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return api.patch(`/admin/courses/${id}`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] })
      queryClient.invalidateQueries({ queryKey: ["admin-courses-stats"] })
      setIsEditorOpen(false)
    },
    onError: (err: any) => {
      setFormErrors(err?.response?.data?.message || "Failed to update course.")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/admin/courses/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] })
      queryClient.invalidateQueries({ queryKey: ["admin-courses-stats"] })
      setCourseToDelete(null)
    }
  })

  const publishMutation = useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const action = publish ? "publish" : "unpublish"
      return api.patch(`/admin/courses/${id}/${action}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] })
      queryClient.invalidateQueries({ queryKey: ["admin-courses-stats"] })
    }
  })

  // Open Editor for Creating
  const handleCreateOpen = () => {
    setEditingCourse(null)
    setFormFields({
      title: "",
      slug: "",
      shortDescription: "",
      description: "",
      category: "Software Development",
      difficulty: "Beginner",
      thumbnail: "",
      thumbnailAlt: "",
      estimatedDuration: "",
      displayOrder: 0,
      isFeatured: false,
      isPublished: false,
      seoTitle: "",
      seoDescription: "",
    })
    setFormErrors(null); console.log("Form submitted with:", formFields, editingCourse);
    setIsEditorOpen(true)
  }

  // Open Editor for Editing
  const handleEditOpen = (course: any) => {
    setEditingCourse(course)
    setFormFields({
      title: course.title,
      slug: course.slug || "",
      shortDescription: course.shortDescription || "",
      description: course.description || "",
      category: course.category || "Software Development",
      difficulty: course.difficulty || "Beginner",
      thumbnail: course.thumbnail || "",
      thumbnailAlt: course.thumbnailAlt || "",
      estimatedDuration: course.estimatedDuration || "",
      displayOrder: course.displayOrder || 0,
      isFeatured: !!course.isFeatured,
      isPublished: !!course.isPublished,
      seoTitle: course.seoTitle || "",
      seoDescription: course.seoDescription || "",
    })
    setFormErrors(null); console.log("Form submitted with:", formFields, editingCourse);
    setIsEditorOpen(true)
  }

  // Handle Form Submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors(null); console.log("Form submitted with:", formFields, editingCourse);

    console.log("Submit clicked", formFields, formErrors); console.log("Submit clicked", formFields); if (!formFields.title.trim()) {
      setFormErrors("Title is required.")
      return
    }
    if (!formFields.shortDescription.trim()) {
      setFormErrors("Short description is required.")
      return
    }
    if (!formFields.description.trim()) {
      setFormErrors("Detailed description is required.")
      return
    }
    if (!formFields.thumbnail.trim()) {
      setFormErrors("Thumbnail URL is required.")
      return
    }
    if (!formFields.estimatedDuration.trim()) {
      setFormErrors("Estimated duration is required.")
      return
    }

    const payload = {
      ...formFields,
      displayOrder: Number(formFields.displayOrder),
    }

    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and organize learning paths.</p>
        </div>
        <Button onClick={handleCreateOpen} className="gap-2 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm rounded-xl h-11 px-6">
          <Plus className="h-4 w-4" /> Create Course
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total Courses", value: isStatsLoading ? "..." : stats?.data?.total || 0, icon: BookOpen },
          { label: "Published Tracks", value: isStatsLoading ? "..." : stats?.data?.published || 0, icon: CheckCircle },
          { label: "Draft Paths", value: isStatsLoading ? "..." : stats?.data?.draft || 0, icon: FileSpreadsheet }
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl border bg-background shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Courses List Container */}
      <div className="bg-background border rounded-2xl shadow-sm flex flex-col">
        {/* Toolbar / Filters */}
        <div className="p-4 border-b flex flex-col lg:flex-row items-center gap-4 justify-between bg-surface/50 rounded-t-2xl">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 h-10 border-muted rounded-xl"
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="h-10 rounded-xl border bg-background px-3 py-1 text-sm shadow-sm w-full sm:w-auto focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
              className="h-10 rounded-xl border bg-background px-3 py-1 text-sm shadow-sm w-full sm:w-auto focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Difficulties</option>
              {DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table List View */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <RefreshCw className="h-10 w-10 text-muted-foreground animate-spin mb-4" />
              <h3 className="text-lg font-bold text-foreground">Failed to load courses</h3>
              <Button onClick={() => refetch()} className="mt-4">Retry Load</Button>
            </div>
          ) : courses.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No matching courses found. Create one to get started.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-surface border-b text-muted-foreground">
                <tr>
                  <th className="p-4 font-semibold">Course Detail</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Difficulty</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {courses.map((course: any) => (
                  <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-20 rounded-lg bg-muted flex items-center justify-center shrink-0 border overflow-hidden">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt="" className="object-cover w-full h-full" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-foreground block">{course.title}</span>
                          <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{course.shortDescription}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground font-medium">{course.category}</td>
                    <td className="p-4">
                      <Badge variant="secondary">{course.difficulty}</Badge>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        course.isPublished
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                      }`}>
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Publish/Unpublish toggle icon button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => publishMutation.mutate({ id: course.id, publish: !course.isPublished })}
                          className="h-9 w-9 text-muted-foreground hover:text-primary rounded-xl"
                          title={course.isPublished ? "Unpublish Course" : "Publish Course"}
                        >
                          {course.isPublished ? <Globe2 className="h-4.5 w-4.5" /> : <Globe className="h-4.5 w-4.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditOpen(course)}
                          className="h-9 w-9 text-muted-foreground hover:text-primary rounded-xl"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCourseToDelete(course)}
                          className="h-9 w-9 text-muted-foreground hover:text-destructive rounded-xl"
                        >
                          <Trash className="h-4.5 w-4.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground bg-surface/50 rounded-b-2xl">
            <span>Showing Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-background rounded-2xl border">
          <DialogHeader className="p-6 border-b bg-surface/50">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                {editingCourse ? "Edit Course" : "Create Course"}
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleFormSubmit}>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {formErrors && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-xl border border-destructive/20">
                  {formErrors}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="form-title">Title *</label>
                <Input
                  id="form-title"
                  placeholder="e.g. Full Stack Java Developer"
                  value={formFields.title}
                  onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                  className="rounded-xl"
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="form-slug">Custom Slug (optional)</label>
                <Input
                  id="form-slug"
                  placeholder="e.g. full-stack-java"
                  value={formFields.slug}
                  onChange={(e) => setFormFields({ ...formFields, slug: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              {/* Short Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="form-shortDesc">Short Description *</label>
                <Input
                  id="form-shortDesc"
                  placeholder="Truncated after 2-3 lines on card (max 200 chars)"
                  value={formFields.shortDescription}
                  onChange={(e) => setFormFields({ ...formFields, shortDescription: e.target.value })}
                  maxLength={200}
                  className="rounded-xl"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="form-desc">Detailed Description *</label>
                <textarea
                  id="form-desc"
                  placeholder="Provide comprehensive details about this path..."
                  value={formFields.description}
                  onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                  className="w-full min-h-[100px] p-3 text-sm rounded-xl border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              {/* Category & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="form-category">Category *</label>
                  <select
                    id="form-category"
                    value={formFields.category}
                    onChange={(e) => setFormFields({ ...formFields, category: e.target.value })}
                    className="h-10 w-full rounded-xl border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="form-difficulty">Difficulty *</label>
                  <select
                    id="form-difficulty"
                    value={formFields.difficulty}
                    onChange={(e) => setFormFields({ ...formFields, difficulty: e.target.value })}
                    className="h-10 w-full rounded-xl border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {DIFFICULTIES.map((diff) => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Thumbnail URL & Thumbnail Alt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="form-thumbnail">Thumbnail URL *</label>
                  <Input
                    id="form-thumbnail"
                    placeholder="https://res.cloudinary.com/..."
                    value={formFields.thumbnail}
                    onChange={(e) => setFormFields({ ...formFields, thumbnail: e.target.value })}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="form-alt">Thumbnail Alt Text</label>
                  <Input
                    id="form-alt"
                    placeholder="e.g. Java Java logo"
                    value={formFields.thumbnailAlt}
                    onChange={(e) => setFormFields({ ...formFields, thumbnailAlt: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Estimated Duration & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="form-duration">Estimated Duration *</label>
                  <Input
                    id="form-duration"
                    placeholder="e.g. 6 Months or 120 Hours"
                    value={formFields.estimatedDuration}
                    onChange={(e) => setFormFields({ ...formFields, estimatedDuration: e.target.value })}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="form-order">Display Order</label>
                  <Input
                    id="form-order"
                    type="number"
                    value={formFields.displayOrder}
                    onChange={(e) => setFormFields({ ...formFields, displayOrder: Number(e.target.value) })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* SEO Title & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="form-seotitle">SEO Meta Title</label>
                  <Input
                    id="form-seotitle"
                    placeholder="Page SEO Title"
                    value={formFields.seoTitle}
                    onChange={(e) => setFormFields({ ...formFields, seoTitle: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase" htmlFor="form-seodesc">SEO Meta Description</label>
                  <Input
                    id="form-seodesc"
                    placeholder="Page SEO Description"
                    value={formFields.seoDescription}
                    onChange={(e) => setFormFields({ ...formFields, seoDescription: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Featured & Published */}
              <div className="flex gap-6 items-center pt-2">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer" htmlFor="form-featured">
                  <input
                    id="form-featured"
                    type="checkbox"
                    checked={formFields.isFeatured}
                    onChange={(e) => setFormFields({ ...formFields, isFeatured: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  Featured Course
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer" htmlFor="form-published">
                  <input
                    id="form-published"
                    type="checkbox"
                    checked={formFields.isPublished}
                    onChange={(e) => setFormFields({ ...formFields, isPublished: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  Published Immediately
                </label>
              </div>
            </div>

            <div className="p-6 border-t bg-surface/50 flex justify-end gap-3 flex-wrap">
              <Button type="button" variant="outline" className="rounded-xl w-full sm:w-auto" onClick={() => setIsEditorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl w-full sm:w-auto font-bold">
                {editingCourse ? "Update Course" : "Create Course"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
        <DialogContent className="sm:max-w-md p-6 bg-background rounded-2xl border">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Delete Course</h2>
              <p className="text-muted-foreground text-sm">
                Are you sure you want to delete <span className="font-bold text-foreground">"{courseToDelete?.title}"</span>? This will perform a soft-delete and hide it from the platform.
              </p>
            </div>
            <div className="w-full pt-4 flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 w-full rounded-xl h-11" onClick={() => setCourseToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 w-full rounded-xl h-11 font-bold"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (courseToDelete) {
                    deleteMutation.mutate(courseToDelete.id)
                  }
                }}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
