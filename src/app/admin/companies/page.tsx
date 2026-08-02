"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminLayout } from "@/components/layout/admin-layout"
import {
  Search, Plus, Edit, Trash, AlertTriangle, RefreshCw,
  Building2, X, CheckCircle, Globe, Link as LinkIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"

function CompanyForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
  error,
}: {
  initial: any
  onSubmit: (data: any) => void
  onCancel: () => void
  isPending: boolean
  error: string | null
}) {
  const [fields, setFields] = useState({
    name: initial?.name ?? "",
    logo: initial?.logo ?? "",
    website: initial?.website ?? "",
    overview: initial?.overview ?? "",
    hiringProcess: (initial?.hiringProcess ?? []).join("\n"),
    interviewRounds: (initial?.interviewRounds ?? []).join("\n"),
    preparationTips: (initial?.preparationTips ?? []).join("\n"),
    salaryMin: initial?.salaryRange?.min ?? 0,
    salaryMax: initial?.salaryRange?.max ?? 0,
    salaryCurrency: initial?.salaryRange?.currency ?? "LPA",
    minimumCgpa: initial?.eligibilityCriteria?.minimumCgpa ?? 0,
    allowedBranches: (initial?.eligibilityCriteria?.allowedBranches ?? []).join(", "),
    requiredSkills: (initial?.eligibilityCriteria?.requiredSkills ?? []).join(", "),
  })

  // Dynamic FAQs
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>(
    initial?.faqs?.length ? initial.faqs : [{ question: "", answer: "" }]
  )

  const handleFaqChange = (index: number, field: "question" | "answer", value: string) => {
    const newFaqs = [...faqs]
    newFaqs[index][field] = value
    setFaqs(newFaqs)
  }

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }])
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: fields.name,
      logo: fields.logo,
      website: fields.website || undefined,
      overview: fields.overview,
      hiringProcess: fields.hiringProcess.split("\n").map((s: string) => s.trim()).filter(Boolean),
      interviewRounds: fields.interviewRounds.split("\n").map((s: string) => s.trim()).filter(Boolean),
      preparationTips: fields.preparationTips.split("\n").map((s: string) => s.trim()).filter(Boolean),
      salaryRange: {
        min: Number(fields.salaryMin),
        max: Number(fields.salaryMax),
        currency: fields.salaryCurrency,
      },
      eligibilityCriteria: {
        minimumCgpa: Number(fields.minimumCgpa),
        allowedBranches: fields.allowedBranches.split(",").map((s: string) => s.trim()).filter(Boolean),
        requiredSkills: fields.requiredSkills.split(",").map((s: string) => s.trim()).filter(Boolean),
      },
      faqs: faqs
        .filter(f => f.question.trim() && f.answer.trim())
        .map(f => ({ question: f.question, answer: f.answer }))
    })
  }

  const f = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-xl border border-destructive/20 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> {error}
          </div>
        )}
        
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b pb-2">Basic Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Company Name *</label>
              <Input required value={fields.name} onChange={f("name")} placeholder="e.g. Google" className="rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Logo URL *</label>
              <Input required type="url" value={fields.logo} onChange={f("logo")} placeholder="https://..." className="rounded-xl" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Website URL</label>
              <Input type="url" value={fields.website} onChange={f("website")} placeholder="https://..." className="rounded-xl" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Overview *</label>
              <textarea
                required
                value={fields.overview}
                onChange={f("overview")}
                rows={3}
                className="w-full p-3 text-sm rounded-xl border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Company overview..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b pb-2">Placement & Eligibility</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Salary Min</label>
              <Input type="number" value={fields.salaryMin} onChange={f("salaryMin")} className="rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Salary Max</label>
              <Input type="number" value={fields.salaryMax} onChange={f("salaryMax")} className="rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Currency</label>
              <Input value={fields.salaryCurrency} onChange={f("salaryCurrency")} className="rounded-xl" placeholder="LPA" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Min CGPA</label>
              <Input type="number" step="0.1" value={fields.minimumCgpa} onChange={f("minimumCgpa")} className="rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Allowed Branches</label>
              <Input value={fields.allowedBranches} onChange={f("allowedBranches")} placeholder="CSE, IT" className="rounded-xl" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Required Skills (comma-separated)</label>
            <Input value={fields.requiredSkills} onChange={f("requiredSkills")} placeholder="Java, Spring Boot, SQL" className="rounded-xl" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Hiring Process (one per line)</label>
              <textarea value={fields.hiringProcess} onChange={f("hiringProcess")} rows={3} className="w-full p-3 text-sm rounded-xl border bg-background" placeholder="Online Test&#10;Technical Interview" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Interview Rounds (one per line)</label>
              <textarea value={fields.interviewRounds} onChange={f("interviewRounds")} rows={3} className="w-full p-3 text-sm rounded-xl border bg-background" placeholder="Technical 1&#10;System Design&#10;HR" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b pb-2">Preparation</h3>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Preparation Tips (one per line)</label>
            <textarea value={fields.preparationTips} onChange={f("preparationTips")} rows={3} className="w-full p-3 text-sm rounded-xl border bg-background" placeholder="Focus on DSA..." />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
              FAQs
              <Button type="button" variant="ghost" size="sm" onClick={addFaq} className="h-6 text-xs text-primary"><Plus className="h-3 w-3 mr-1" /> Add FAQ</Button>
            </label>
            {faqs.map((faq, idx) => (
              <div key={idx} className="flex gap-2 items-start border p-3 rounded-xl bg-surface/30 relative group">
                <div className="flex-1 space-y-2">
                  <Input value={faq.question} onChange={(e) => handleFaqChange(idx, "question", e.target.value)} placeholder="Question" className="h-8 text-sm rounded-lg" />
                  <Input value={faq.answer} onChange={(e) => handleFaqChange(idx, "answer", e.target.value)} placeholder="Answer" className="h-8 text-sm rounded-lg" />
                </div>
                {faqs.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFaq(idx)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
      <div className="p-6 border-t bg-surface/50 flex justify-end gap-3 rounded-b-2xl">
        <Button type="button" variant="outline" className="rounded-xl" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending} className="rounded-xl font-bold">
          {isPending ? "Saving..." : initial ? "Update Company" : "Create Company"}
        </Button>
      </div>
    </form>
  )
}

export default function AdminCompaniesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [toDelete, setToDelete] = useState<any | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-companies", { search, page }],
    queryFn: async () => {
      const res = await api.get("/companies", { params: { page, limit, search: search || undefined } })
      return res.data
    },
  })

  const companies = data?.data ?? []
  const total: number = data?.pagination?.total ?? data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post("/companies", payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-companies"] }); setIsEditorOpen(false) },
    onError: (err: any) => {
      console.error("Create error full object:", err)
      console.error("Create error response data:", JSON.stringify(err?.response?.data))
      const data = err?.response?.data
      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        setFormError(data.errors.join(", "))
      } else {
        const msg = data?.message || err?.message
        setFormError(Array.isArray(msg) ? msg.join(", ") : msg ?? "Failed to create company.")
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.patch(`/companies/${id}`, payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-companies"] }); setIsEditorOpen(false) },
    onError: (err: any) => {
      console.error("Update error full object:", err)
      console.error("Update error response data:", JSON.stringify(err?.response?.data))
      const data = err?.response?.data
      if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        setFormError(data.errors.join(", "))
      } else {
        const msg = data?.message || err?.message || "Validation failed. Please check the network tab for more details."
        setFormError(Array.isArray(msg) ? msg.join(", ") : msg)
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/companies/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-companies"] }); setToDelete(null) },
  })

  const openCreate = () => { setEditing(null); setFormError(null); setIsEditorOpen(true) }
  const openEdit = (c: any) => { setEditing(c); setFormError(null); setIsEditorOpen(true) }

  const handleFormSubmit = (payload: any) => {
    setFormError(null)
    if (editing) updateMutation.mutate({ id: editing._id, payload })
    else createMutation.mutate(payload)
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground mt-1">Manage company profiles for placement preparation.</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm rounded-xl h-11 px-6">
          <Plus className="h-4 w-4" /> Add Company
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {[
          { label: "Total Companies", value: isLoading ? "..." : total, icon: Building2 },
          { label: "Listed", value: isLoading ? "..." : companies.length, icon: Globe },
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
              placeholder="Search companies..."
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
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <RefreshCw className="h-10 w-10 text-muted-foreground animate-spin mb-4" />
              <h3 className="text-lg font-bold text-foreground">Failed to load companies</h3>
              <Button onClick={() => refetch()} className="mt-4">Retry</Button>
            </div>
          ) : companies.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No companies found. Add one to get started.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-surface border-b text-muted-foreground">
                <tr>
                  <th className="p-4 font-semibold">Company</th>
                  <th className="p-4 font-semibold">Salary Range</th>
                  <th className="p-4 font-semibold">Min CGPA</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {companies.map((c: any) => (
                  <tr key={c._id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted border overflow-hidden shrink-0 flex items-center justify-center p-1">
                          {c.logo
                            ? <img src={c.logo} alt={c.name} className="object-contain w-full h-full" />
                            : <Building2 className="h-5 w-5 text-muted-foreground/50" />
                          }
                        </div>
                        <div>
                          <span className="font-bold text-foreground flex items-center gap-2">
                            {c.name}
                            {c.website && (
                              <a href={c.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                <LinkIcon className="h-3 w-3" />
                              </a>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground line-clamp-1">{c.overview}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground font-medium">
                      {c.salaryRange ? `${c.salaryRange.min}–${c.salaryRange.max} ${c.salaryRange.currency}` : "—"}
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{c.eligibilityCriteria?.minimumCgpa ?? "—"}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)}
                          className="h-9 w-9 text-muted-foreground hover:text-primary rounded-xl">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setToDelete(c)}
                          className="h-9 w-9 text-muted-foreground hover:text-destructive rounded-xl">
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
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-background rounded-2xl border">
          <DialogHeader className="p-6 border-b bg-surface/50">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">{editing ? "Edit Company Profile" : "Add New Company"}</DialogTitle>
            </div>
          </DialogHeader>
          <CompanyForm
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
              <h2 className="text-xl font-bold mb-2">Delete Company</h2>
              <p className="text-muted-foreground text-sm">
                Are you sure you want to delete <span className="font-bold text-foreground">"{toDelete?.name}"</span>?
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
