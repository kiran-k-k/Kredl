"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { AdminLayout } from "@/components/layout/admin-layout"
import {
  Plus, Megaphone, Clock, Target, Calendar, Edit, Trash2, X, AlertTriangle, RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { PageHeader } from "@/components/system/PageHeader"
import { StatusBadge } from "@/components/system/StatusBadge"
import { IconButton } from "@/components/system/IconButton"
import { EmptyState } from "@/components/system/EmptyState"

export default function AdminAnnouncementsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const limit = 10
  
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [toDelete, setToDelete] = useState<any | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const [formFields, setFormFields] = useState({
    title: "",
    audience: "all",
    content: "",
    expiresAt: "",
  })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-announcements", { page }],
    queryFn: async () => {
      const res = await api.get("/announcements", { params: { page, limit } })
      return res.data
    },
  })

  const announcements = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post("/announcements", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] })
      setIsEditorOpen(false)
    },
    onError: (err: any) => setFormError(err?.response?.data?.message ?? "Failed to create announcement."),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => api.patch(`/announcements/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] })
      setIsEditorOpen(false)
    },
    onError: (err: any) => setFormError(err?.response?.data?.message ?? "Failed to update announcement."),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] })
      setToDelete(null)
    },
  })

  const openCreate = () => {
    setEditing(null)
    setFormError(null)
    setFormFields({
      title: "",
      audience: "all",
      content: "",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
    setIsEditorOpen(true)
  }

  const openEdit = (a: any) => {
    setEditing(a)
    setFormError(null)
    setFormFields({
      title: a.title,
      audience: a.audience,
      content: a.content,
      expiresAt: new Date(a.expiresAt).toISOString().split('T')[0],
    })
    setIsEditorOpen(true)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const payload = {
      ...formFields,
      expiresAt: new Date(formFields.expiresAt).toISOString(),
    }
    if (editing) {
      updateMutation.mutate({ id: editing._id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <AdminLayout>
      <PageHeader 
        title="Announcements" 
        description="Broadcast important updates to students."
        action={
          <Button className="gap-2 shrink-0 bg-primary rounded-xl" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Create Announcement
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl bg-background shadow-sm">
            <RefreshCw className="h-10 w-10 text-muted-foreground animate-spin mb-4" />
            <h3 className="text-lg font-bold text-foreground">Failed to load announcements</h3>
            <Button onClick={() => refetch()} className="mt-4">Retry</Button>
          </div>
        ) : announcements.length === 0 ? (
          <EmptyState 
            icon={Megaphone}
            title="No announcements"
            description="You haven't posted any announcements yet."
            actionLabel="Create your first announcement"
            onAction={openCreate}
            className="bg-background border shadow-sm"
          />
        ) : (
          announcements.map((announcement: any) => (
            <div key={announcement._id} className="bg-background border rounded-xl shadow-sm p-6 hover:border-primary/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <StatusBadge status={announcement.isActive ? 'Active' : 'Expired'} variant={announcement.isActive ? 'success' : 'default'} />
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted border text-muted-foreground uppercase">
                      <Target className="h-3 w-3" /> {announcement.audience}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{announcement.title}</h3>
                </div>
                
                <div className="flex items-center gap-1 shrink-0 self-start">
                  <IconButton aria-label="Edit Announcement" onClick={() => openEdit(announcement)}>
                    <Edit className="h-4 w-4" />
                  </IconButton>
                  <IconButton 
                    aria-label="Delete Announcement"
                    className="hover:text-destructive"
                    onClick={() => setToDelete(announcement)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                {announcement.content}
              </p>
              
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Posted: {new Date(announcement.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-background rounded-xl">
          <DialogHeader className="p-6 border-b bg-surface/50">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">{editing ? "Edit Announcement" : "Create Announcement"}</DialogTitle>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit}>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-xl border border-destructive/20">
                  {formError}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Title *</label>
                <Input required value={formFields.title} onChange={e => setFormFields({...formFields, title: e.target.value})} placeholder="Enter announcement title..." className="rounded-xl" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Target Audience *</label>
                  <select required value={formFields.audience} onChange={e => setFormFields({...formFields, audience: e.target.value})} className="h-10 w-full rounded-xl border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="all">All Students</option>
                    <option value="students">Students Only</option>
                    <option value="tpo">TPO Only</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Expires At *</label>
                  <Input type="date" required value={formFields.expiresAt} onChange={e => setFormFields({...formFields, expiresAt: e.target.value})} className="rounded-xl" />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Message *</label>
                <textarea 
                  required
                  value={formFields.content}
                  onChange={e => setFormFields({...formFields, content: e.target.value})}
                  className="w-full min-h-[150px] p-3 text-sm rounded-xl border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-y" 
                  placeholder="Write your announcement here..."
                ></textarea>
              </div>
            </div>
            
            <div className="p-6 border-t bg-surface/50 flex justify-end gap-3 flex-wrap">
              <Button type="button" variant="outline" className="rounded-xl w-full sm:w-auto" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-xl w-full sm:w-auto font-bold">
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : (editing ? "Update Announcement" : "Publish Announcement")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent className="sm:max-w-md p-6 bg-background rounded-xl">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Delete Announcement</h2>
              <p className="text-muted-foreground text-sm">
                Are you sure you want to delete "{toDelete?.title}"? This action cannot be undone.
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
