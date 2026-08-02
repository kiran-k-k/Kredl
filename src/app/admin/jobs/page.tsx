"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminLayout } from "@/components/layout/admin-layout"
import {
  Search, Plus, Edit, Trash, AlertTriangle, RefreshCw,
  Briefcase, MapPin, Calendar, X, MoreVertical, Archive, Globe, FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { api } from "@/lib/api"

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Internship", "Contract"]
const WORK_MODES = ["Remote", "Hybrid", "On-site"]
const JOB_STATUSES = ["Draft", "Active", "Archived", "Expired"]

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "ACTIVE":
      return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-white">Active</Badge>
    case "DRAFT":
      return <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-300">Draft</Badge>
    case "ARCHIVED":
      return <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Archived</Badge>
    case "EXPIRED":
      return <Badge variant="destructive">Expired</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function JobForm({
  initial,
  companies,
  jobRoles,
  onSubmit,
  onCancel,
  isPending,
  error,
}: {
  initial: any
  companies: any[]
  jobRoles: any[]
  onSubmit: (data: any) => void
  onCancel: () => void
  isPending: boolean
  error: string | null
}) {
  const [fields, setFields] = useState({
    title: initial?.title ?? "",
    companyId: initial?.companyId?._id ?? initial?.companyId ?? "",
    roleId: initial?.roleId?._id ?? initial?.roleId ?? "",
    location: initial?.location ?? "",
    employmentType: initial?.employmentType ?? "Full-time",
    workMode: initial?.workMode ?? "On-site",
    experienceRequired: initial?.experienceRequired ?? "",
    jobSummary: initial?.jobSummary ?? "",
    requiredSkills: (initial?.requiredSkills ?? []).join(", "),
    status: initial?.status ?? "Draft",
    deadline: initial?.deadline ? new Date(initial.deadline).toISOString().split("T")[0] : "",
    applyUrl: initial?.applyUrl ?? "",
    salaryMin: initial?.salary?.min ?? 0,
    salaryMax: initial?.salary?.max ?? 0,
    salaryCurrency: initial?.salary?.currency ?? "INR",
    salaryPeriod: initial?.salary?.period ?? "LPA",
    minimumCgpa: initial?.eligibilityCriteria?.minimumCgpa ?? 0,
    allowedBranches: (initial?.eligibilityCriteria?.allowedBranches ?? []).join(", "),
    batchYears: (initial?.eligibilityCriteria?.batchYears ?? []).join(", "),
  })

  const f = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFields(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title: fields.title,
      companyId: fields.companyId,
      roleId: fields.roleId,
      location: fields.location,
      employmentType: fields.employmentType,
      workMode: fields.workMode,
      experienceRequired: fields.experienceRequired,
      jobSummary: fields.jobSummary,
      requiredSkills: fields.requiredSkills.split(",").map((s: string) => s.trim()).filter(Boolean),
      status: fields.status,
      deadline: fields.deadline || undefined,
      applyUrl: fields.applyUrl || undefined,
      salary: {
        min: Number(fields.salaryMin),
        max: Number(fields.salaryMax),
        currency: fields.salaryCurrency,
        period: fields.salaryPeriod,
      },
      eligibilityCriteria: {
        minimumCgpa: Number(fields.minimumCgpa),
        allowedBranches: fields.allowedBranches.split(",").map((s: string) => s.trim()).filter(Boolean),
        batchYears: fields.batchYears.split(",").map((s: string) => Number(s.trim())).filter(Boolean),
      },
    })
  }

  const sel = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setFields(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 space-y-4 max-h-[62vh] overflow-y-auto">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-xl border border-destructive/20">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Job Title *</label>
            <Input required value={fields.title} onChange={f("title")} placeholder="e.g. SDE-1" className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Emp. Type *</label>
              <select value={fields.employmentType} onChange={sel("employmentType")}
                className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Work Mode *</label>
              <select value={fields.workMode} onChange={sel("workMode")}
                className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                {WORK_MODES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Company *</label>
            <select required value={fields.companyId} onChange={sel("companyId")}
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Select company</option>
              {companies.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Job Role *</label>
            <select required value={fields.roleId} onChange={sel("roleId")}
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Select role</option>
              {jobRoles.map((r: any) => <option key={r._id} value={r._id}>{r.title}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Job Summary *</label>
          <Input required value={fields.jobSummary} onChange={f("jobSummary")} placeholder="Brief overview of the role" className="rounded-xl" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-muted-foreground uppercase">Required Skills (comma-sep)</label>
          <Input value={fields.requiredSkills} onChange={f("requiredSkills")} placeholder="React, Node.js, AWS" className="rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Location *</label>
            <Input required value={fields.location} onChange={f("location")} placeholder="e.g. Bangalore, Remote" className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Experience Required *</label>
            <Input required value={fields.experienceRequired} onChange={f("experienceRequired")} placeholder="e.g. 0–2 years" className="rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Status *</label>
            <select value={fields.status} onChange={sel("status")}
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              {JOB_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Deadline *</label>
            <Input required type="date" value={fields.deadline} onChange={f("deadline")} className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Apply URL</label>
            <Input value={fields.applyUrl} onChange={f("applyUrl")} placeholder="https://..." className="rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Min Salary</label>
            <Input type="number" value={fields.salaryMin} onChange={f("salaryMin")} className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Max Salary</label>
            <Input type="number" value={fields.salaryMax} onChange={f("salaryMax")} className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Currency</label>
            <Input value={fields.salaryCurrency} onChange={f("salaryCurrency")} placeholder="INR" className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Period</label>
            <select value={fields.salaryPeriod} onChange={sel("salaryPeriod")}
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              {["LPA", "Monthly", "Hourly"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Min CGPA</label>
            <Input type="number" step="0.1" value={fields.minimumCgpa} onChange={f("minimumCgpa")} className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Branches (comma-sep)</label>
            <Input value={fields.allowedBranches} onChange={f("allowedBranches")} placeholder="CSE, IT, ECE" className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Batch Years (comma-sep)</label>
            <Input value={fields.batchYears} onChange={f("batchYears")} placeholder="2025, 2026" className="rounded-xl" />
          </div>
        </div>
      </div>
      <div className="p-6 border-t bg-surface/50 flex justify-end gap-3">
        <Button type="button" variant="outline" className="rounded-xl" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending} className="rounded-xl font-bold">
          {isPending ? "Saving..." : initial ? "Update Job" : "Post Job"}
        </Button>
      </div>
    </form>
  )
}

export default function AdminJobsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [employmentType, setEmploymentType] = useState("")
  const [workMode, setWorkMode] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [toDelete, setToDelete] = useState<any | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-jobs", { search, employmentType, workMode, page }],
    queryFn: async () => {
      const res = await api.get("/jobs", {
        params: { page, limit, search: search || undefined, employmentType: employmentType || undefined, workMode: workMode || undefined }
      })
      return res.data
    },
  })

  const { data: companiesData } = useQuery({
    queryKey: ["companies-list"],
    queryFn: async () => (await api.get("/companies", { params: { limit: 200 } })).data,
  })

  const { data: rolesData } = useQuery({
    queryKey: ["job-roles-list"],
    queryFn: async () => (await api.get("/job-roles", { params: { limit: 200 } })).data,
  })

  const jobs = data?.data ?? []
  const total: number = data?.pagination?.total ?? data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const allCompanies = companiesData?.data ?? []
  const allRoles = rolesData?.data ?? []

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post("/jobs", payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-jobs"] }); setIsEditorOpen(false) },
    onError: (err: any) => setFormError(err?.response?.data?.message ?? "Failed to create job."),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.patch(`/jobs/${id}`, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-jobs"] }); setIsEditorOpen(false) },
    onError: (err: any) => setFormError(err?.response?.data?.message ?? "Failed to update job."),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/jobs/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-jobs"] }); setToDelete(null) },
  })

  const openCreate = () => { setEditing(null); setFormError(null); setIsEditorOpen(true) }
  const openEdit = (j: any) => { setEditing(j); setFormError(null); setIsEditorOpen(true) }

  const quickAction = (id: string, status: string) => {
    updateMutation.mutate({ id, payload: { status } })
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground mt-1">Manage placement and internship listings.</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm rounded-xl h-11 px-6">
          <Plus className="h-4 w-4" /> Post Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total Listings", value: isLoading ? "..." : total, icon: Briefcase },
          { label: "Active Jobs", value: isLoading ? "..." : jobs.filter((j: any) => j.status === "ACTIVE").length, icon: Globe },
          { label: "Drafts", value: isLoading ? "..." : jobs.filter((j: any) => j.status === "DRAFT").length, icon: FileText },
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

      <div className="bg-background border rounded-2xl shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row items-center gap-4 justify-between bg-surface/50 rounded-t-2xl">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 h-10 border-muted rounded-xl"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={employmentType}
              onChange={(e) => { setEmploymentType(e.target.value); setPage(1) }}
              className="h-10 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary flex-1 sm:w-auto"
            >
              <option value="">All Types</option>
              {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={workMode}
              onChange={(e) => { setWorkMode(e.target.value); setPage(1) }}
              className="h-10 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary flex-1 sm:w-auto"
            >
              <option value="">All Modes</option>
              {WORK_MODES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <RefreshCw className="h-10 w-10 text-muted-foreground animate-spin mb-4" />
              <h3 className="text-lg font-bold">Failed to load jobs</h3>
              <Button onClick={() => refetch()} className="mt-4">Retry</Button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No jobs found. Post one to get started.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-surface border-b text-muted-foreground">
                <tr>
                  <th className="p-4 font-semibold">Job</th>
                  <th className="p-4 font-semibold">Company</th>
                  <th className="p-4 font-semibold">Details</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Deadline</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {jobs.map((j: any) => (
                  <tr key={j._id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <span className="font-bold block">{j.title}</span>
                      <span className="text-xs text-muted-foreground">{j.experienceRequired}</span>
                    </td>
                    <td className="p-4 text-muted-foreground font-medium">
                      {j.companySnapshot?.name || j.companyId?.name || "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-[10px]">{j.employmentType}</Badge>
                        <Badge variant="outline" className="text-[10px]">{j.workMode}</Badge>
                      </div>
                      <span className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                        <MapPin className="h-3 w-3" /> {j.location}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={j.status} />
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {j.deadline ? new Date(j.deadline).toLocaleDateString() : "—"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(j)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus:outline-none">
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 rounded-xl">
                            {j.status !== "ACTIVE" && (
                              <DropdownMenuItem onClick={() => quickAction(j._id, "ACTIVE")} className="cursor-pointer gap-2">
                                <Globe className="h-4 w-4 text-emerald-500" /> Publish
                              </DropdownMenuItem>
                            )}
                            {j.status !== "DRAFT" && (
                              <DropdownMenuItem onClick={() => quickAction(j._id, "DRAFT")} className="cursor-pointer gap-2">
                                <FileText className="h-4 w-4 text-slate-500" /> Move to Draft
                              </DropdownMenuItem>
                            )}
                            {j.status !== "ARCHIVED" && (
                              <DropdownMenuItem onClick={() => quickAction(j._id, "ARCHIVED")} className="cursor-pointer gap-2">
                                <Archive className="h-4 w-4 text-orange-500" /> Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setToDelete(j)} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                              <Trash className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground bg-surface/50 rounded-b-2xl">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg">Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg">Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-background rounded-2xl border">
          <DialogHeader className="p-6 border-b bg-surface/50">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">{editing ? "Edit Job" : "Post Job"}</DialogTitle>
            </div>
          </DialogHeader>
          <JobForm
            initial={editing}
            companies={allCompanies}
            jobRoles={allRoles}
            onSubmit={(payload) => {
              setFormError(null)
              if (editing) updateMutation.mutate({ id: editing._id, payload })
              else createMutation.mutate(payload)
            }}
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
              <h2 className="text-xl font-bold mb-2">Delete Job</h2>
              <p className="text-muted-foreground text-sm">
                Are you sure you want to delete <span className="font-bold text-foreground">"{toDelete?.title}"</span>?
              </p>
            </div>
            <div className="w-full pt-4 flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 w-full rounded-xl h-11" onClick={() => setToDelete(null)}>Cancel</Button>
              <Button
                variant="destructive"
                className="flex-1 w-full rounded-xl h-11 font-bold"
                disabled={deleteMutation.isPending}
                onClick={() => toDelete && deleteMutation.mutate(toDelete._id)}
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
