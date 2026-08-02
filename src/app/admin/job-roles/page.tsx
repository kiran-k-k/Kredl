"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminLayout } from "@/components/layout/admin-layout"
import {
  Search, Plus, Edit, Trash, AlertTriangle, RefreshCw,
  UserCheck, X, BookOpen, Eye, EyeOff, Star, StarOff
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { api } from "@/lib/api"
import type { JobRoleListItem } from "@/types/job-role"
import { JobRoleCategory, ExperienceLevel } from "@/types/job-role"
import { PublishBadge, FeaturedBadge } from "@/components/shared/publish-badge"

// ─────────────────────────────────────────────────────────────────────────────
// FORM COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface FormFields {
  title: string
  shortDescription: string
  description: string
  category: string
  experienceLevel: string
  estimatedLearningTime: string
  isPublished: boolean
  isFeatured: boolean
  displayOrder: string
  requiredSkills: string
  preferredSkills: string
  responsibilities: string
  salaryCountry: string
  salaryCurrency: string
  salaryFresherRange: string
  salaryAverage: string
  salaryExperiencedRange: string
  roadmap: string
}

function buildInitialFields(initial?: JobRoleListItem | null): FormFields {
  const si = (initial as any)?.salaryInfo
  return {
    title: initial?.title ?? "",
    shortDescription: initial?.shortDescription ?? "",
    description: (initial as any)?.description ?? "",
    category: initial?.category ?? JobRoleCategory.SOFTWARE_DEVELOPMENT,
    experienceLevel: initial?.experienceLevel ?? ExperienceLevel.FRESHER,
    estimatedLearningTime: initial?.estimatedLearningTime ?? "",
    isPublished: initial?.isPublished ?? false,
    isFeatured: initial?.isFeatured ?? false,
    displayOrder: String(initial?.displayOrder ?? 0),
    requiredSkills: (initial?.requiredSkills ?? []).join(", "),
    preferredSkills: ((initial as any)?.preferredSkills ?? []).join(", "),
    responsibilities: ((initial as any)?.responsibilities ?? []).join("\n"),
    salaryCountry: si?.country ?? "India",
    salaryCurrency: si?.currency ?? "INR",
    salaryFresherRange: si?.fresherRange ?? "",
    salaryAverage: si?.averageSalary ?? "",
    salaryExperiencedRange: si?.experiencedRange ?? "",
    roadmap: ((initial as any)?.roadmap ?? [])
      .map((s: any) => `${s.title}|${s.description}|${s.durationWeeks}`)
      .join("\n"),
  }
}

function JobRoleForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
  error,
}: {
  initial?: JobRoleListItem | null
  onSubmit: (data: any) => void
  onCancel: () => void
  isPending: boolean
  error: string | null
}) {
  const [fields, setFields] = useState<FormFields>(buildInitialFields(initial))

  const f = (key: keyof FormFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }))

  const toggle = (key: "isPublished" | "isFeatured") => () =>
    setFields((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const roadmap = fields.roadmap
      .split("\n")
      .map((line) => {
        const [title, description, durationWeeks] = line.split("|")
        return title?.trim()
          ? { title: title.trim(), description: description?.trim() ?? "", durationWeeks: Number(durationWeeks ?? 4) }
          : null
      })
      .filter(Boolean)

    const salaryInfo = fields.salaryFresherRange
      ? {
          country: fields.salaryCountry,
          currency: fields.salaryCurrency,
          fresherRange: fields.salaryFresherRange,
          averageSalary: fields.salaryAverage,
          experiencedRange: fields.salaryExperiencedRange,
        }
      : undefined

    onSubmit({
      title: fields.title,
      shortDescription: fields.shortDescription,
      description: fields.description,
      category: fields.category,
      experienceLevel: fields.experienceLevel,
      estimatedLearningTime: fields.estimatedLearningTime || undefined,
      isPublished: fields.isPublished,
      isFeatured: fields.isFeatured,
      displayOrder: parseInt(fields.displayOrder, 10) || 0,
      requiredSkills: fields.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
      preferredSkills: fields.preferredSkills.split(",").map((s) => s.trim()).filter(Boolean),
      responsibilities: fields.responsibilities.split("\n").map((s) => s.trim()).filter(Boolean),
      salaryInfo,
      roadmap,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-xl border border-destructive/20">
            {error}
          </div>
        )}

        {/* Title & Slug Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Role Title *</label>
            <Input required value={fields.title} onChange={f("title")} placeholder="e.g. Java Backend Developer" className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Category</label>
              <select value={fields.category} onChange={f("category")} className="w-full h-10 px-3 text-sm rounded-xl border bg-background">
                {Object.values(JobRoleCategory).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Experience Level</label>
              <select value={fields.experienceLevel} onChange={f("experienceLevel")} className="w-full h-10 px-3 text-sm rounded-xl border bg-background">
                {Object.values(ExperienceLevel).map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Short Description * (shown on cards)</label>
          <textarea
            required
            value={fields.shortDescription}
            onChange={f("shortDescription")}
            rows={2}
            className="w-full p-3 text-sm rounded-xl border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Concise 1–2 line summary shown on listing cards..."
          />
        </div>

        {/* Full Description */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Full Description *</label>
          <textarea
            required
            value={fields.description}
            onChange={f("description")}
            rows={4}
            className="w-full p-3 text-sm rounded-xl border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Detailed role overview for the detail page..."
          />
        </div>

        {/* Skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Required Skills (comma-separated)</label>
            <Input value={fields.requiredSkills} onChange={f("requiredSkills")} placeholder="Java, Spring Boot, MySQL" className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Preferred Skills (comma-separated)</label>
            <Input value={fields.preferredSkills} onChange={f("preferredSkills")} placeholder="Docker, Redis, AWS" className="rounded-xl" />
          </div>
        </div>

        {/* Responsibilities */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Responsibilities (one per line)</label>
          <textarea
            value={fields.responsibilities}
            onChange={f("responsibilities")}
            rows={4}
            className="w-full p-3 text-sm rounded-xl border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Design and develop REST APIs&#10;Collaborate with frontend teams&#10;Review code and mentor juniors"
          />
        </div>

        {/* Salary Info */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase">Salary Information</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Input value={fields.salaryCountry} onChange={f("salaryCountry")} placeholder="India" className="rounded-xl" />
            <Input value={fields.salaryCurrency} onChange={f("salaryCurrency")} placeholder="INR" className="rounded-xl" />
            <Input value={fields.salaryFresherRange} onChange={f("salaryFresherRange")} placeholder="₹3L–₹6L" className="rounded-xl" />
            <Input value={fields.salaryAverage} onChange={f("salaryAverage")} placeholder="₹8L avg" className="rounded-xl" />
            <Input value={fields.salaryExperiencedRange} onChange={f("salaryExperiencedRange")} placeholder="₹12L–₹25L" className="rounded-xl" />
          </div>
          <p className="text-xs text-muted-foreground">Country · Currency · Fresher Range · Average · Experienced Range</p>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Learning Time</label>
            <Input value={fields.estimatedLearningTime} onChange={f("estimatedLearningTime")} placeholder="5 Months" className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Display Order</label>
            <Input type="number" value={fields.displayOrder} onChange={f("displayOrder")} className="rounded-xl" />
          </div>
          <div className="flex items-end gap-3 pb-0.5">
            <button
              type="button"
              onClick={toggle("isPublished")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${fields.isPublished ? "bg-success/10 text-success border-success/30" : "bg-secondary text-secondary-foreground"}`}
            >
              {fields.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {fields.isPublished ? "Published" : "Draft"}
            </button>
            <button
              type="button"
              onClick={toggle("isFeatured")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${fields.isFeatured ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : "bg-secondary text-secondary-foreground"}`}
            >
              {fields.isFeatured ? <Star className="h-4 w-4 fill-amber-500" /> : <StarOff className="h-4 w-4" />}
              {fields.isFeatured ? "Featured" : "Normal"}
            </button>
          </div>
        </div>

        {/* Roadmap */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">
            Roadmap Steps (one per line: <code className="font-mono text-xs">Title|Description|Weeks</code>)
          </label>
          <textarea
            value={fields.roadmap}
            onChange={f("roadmap")}
            rows={5}
            className="w-full p-3 text-sm rounded-xl border bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Core Java Fundamentals|Learn OOP and data structures|4&#10;Spring Boot Basics|Build REST APIs with Spring|6"
          />
        </div>
      </div>

      <div className="p-5 border-t bg-surface/50 flex justify-end gap-3">
        <Button type="button" variant="outline" className="rounded-xl" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending} className="rounded-xl font-bold">
          {isPending ? "Saving..." : initial ? "Update Role" : "Create Role"}
        </Button>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminJobRolesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editing, setEditing] = useState<JobRoleListItem | null>(null)
  const [toDelete, setToDelete] = useState<JobRoleListItem | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-job-roles", { search, page }],
    queryFn: async () => {
      const res = await api.get("/admin/job-roles", {
        params: { page, limit, search: search || undefined },
      })
      return res.data
    },
  })

  const jobRoles: JobRoleListItem[] = Array.isArray(data?.data) ? data.data : (data?.data?.data ?? [])
  const total: number = data?.pagination?.total ?? data?.total ?? data?.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post("/admin/job-roles", payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-job-roles"] }); setIsEditorOpen(false) },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg ?? "Failed to create job role.")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      api.patch(`/admin/job-roles/${id}`, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-job-roles"] }); setIsEditorOpen(false) },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg ?? "Failed to update job role.")
    },
  })

  const publishMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      api.patch(`/admin/job-roles/${id}/${published ? "publish" : "unpublish"}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-job-roles"] }),
    onError: (err: any) => alert(err?.response?.data?.message ?? "Failed to update publish status."),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/job-roles/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-job-roles"] }); setToDelete(null) },
    onError: (err: any) => alert(err?.response?.data?.message ?? "Failed to delete job role."),
  })

  const openCreate = () => { setEditing(null); setFormError(null); setIsEditorOpen(true) }
  const openEdit = (r: JobRoleListItem) => { setEditing(r); setFormError(null); setIsEditorOpen(true) }

  const handleFormSubmit = (payload: any) => {
    setFormError(null)
    if (editing) updateMutation.mutate({ id: (editing as any)._id, payload })
    else createMutation.mutate(payload)
  }

  const publishedCount = jobRoles.filter((r) => r.isPublished).length
  const featuredCount = jobRoles.filter((r) => r.isFeatured).length

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Roles</h1>
          <p className="text-muted-foreground mt-1">Define career tracks, roadmaps, skills, and guidance.</p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm rounded-xl h-11 px-6"
        >
          <Plus className="h-4 w-4" /> Add Role
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Roles", value: isLoading ? "..." : total, icon: UserCheck },
          { label: "Published", value: isLoading ? "..." : publishedCount, icon: Eye },
          { label: "Featured", value: isLoading ? "..." : featuredCount, icon: Star },
          { label: "Avg Roadmap Steps", value: isLoading ? "..." : jobRoles.length > 0 ? Math.round(jobRoles.reduce((acc, r) => acc + ((r as any).roadmap?.length ?? 0), 0) / jobRoles.length) : 0, icon: BookOpen },
        ].map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl border bg-background shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-background border rounded-2xl shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b flex items-center gap-4 bg-surface/50 rounded-t-2xl">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search job roles..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 h-10 border-muted rounded-xl"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-bold mb-2">Failed to load job roles</h3>
              <Button onClick={() => refetch()} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" /> Retry
              </Button>
            </div>
          ) : jobRoles.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No job roles found. Add one to get started.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-surface border-b text-muted-foreground">
                <tr>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Skills</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {jobRoles.map((r) => (
                  <tr key={(r as any)._id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <span className="font-bold block leading-tight">{r.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{r.shortDescription}</span>
                      {r.slug && (
                        <span className="text-xs text-muted-foreground/60 font-mono">/job-roles/{r.slug}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="text-xs">{r.category}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">{r.experienceLevel}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {(r.requiredSkills ?? []).slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                        {(r.requiredSkills ?? []).length > 3 && (
                          <Badge variant="outline" className="text-xs">+{r.requiredSkills.length - 3}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <PublishBadge isPublished={r.isPublished} />
                        <FeaturedBadge isFeatured={r.isFeatured} />
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Publish/Unpublish */}
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => publishMutation.mutate({ id: (r as any)._id, published: !r.isPublished })}
                          className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg"
                          title={r.isPublished ? "Unpublish" : "Publish"}
                        >
                          {r.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        {/* Edit */}
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => openEdit(r)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* Delete */}
                        <Button
                          variant="ghost" size="icon"
                          onClick={() => setToDelete(r)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground bg-surface/50 rounded-b-2xl">
            <span>Page {page} of {totalPages} · {total} total</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg">Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg">Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-background rounded-2xl border">
          <DialogHeader className="p-5 border-b bg-surface/50">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">
                {editing ? "Edit Job Role" : "Add Job Role"}
              </DialogTitle>
            </div>
          </DialogHeader>
          <JobRoleForm
            initial={editing}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsEditorOpen(false)}
            isPending={createMutation.isPending || updateMutation.isPending}
            error={formError}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent className="sm:max-w-md p-6 bg-background rounded-2xl border">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Delete Job Role</h2>
              <p className="text-muted-foreground text-sm">
                Are you sure you want to delete{" "}
                <span className="font-bold text-foreground">"{toDelete?.title}"</span>?
                <br />This action cannot be undone.
              </p>
            </div>
            <div className="w-full pt-4 flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 w-full rounded-xl h-11" onClick={() => setToDelete(null)}>Cancel</Button>
              <Button
                variant="destructive"
                className="flex-1 w-full rounded-xl h-11 font-bold"
                disabled={deleteMutation.isPending}
                onClick={() => toDelete && deleteMutation.mutate((toDelete as any)._id)}
              >
                {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
