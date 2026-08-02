"use client"

import React, { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Search, Save, FileText, CheckCircle2, Loader2, AlertCircle, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { X } from "lucide-react"

export default function AdminNotesPage() {
  const [search, setSearch] = useState("")
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Modal
  const [isCreatorOpen, setIsCreatorOpen] = useState(false)
  const [formFields, setFormFields] = useState({
    title: "",
    lessonId: "",
  })

  // Fetch Lessons (for the dropdown)
  const { data: lessonsData } = useQuery({
    queryKey: ['admin-lessons-minimal'],
    queryFn: async () => {
      const res = await api.get('/lessons', { params: { limit: 500 } })
      return res.data?.data || []
    }
  })

  // Fetch Notes
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-notes', search],
    queryFn: async () => {
      const params: any = { limit: 100 }
      if (search) params.search = search
      const res = await api.get('/lesson-notes', { params })
      return res.data?.data || []
    }
  })

  const notes = data || []
  
  // Set active note initially
  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      setActiveNoteId(notes[0]._id)
    }
  }, [notes, activeNoteId])

  const activeNote = notes.find((n: any) => n._id === activeNoteId)

  // Edit State
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")

  // Update edit state when active note changes
  useEffect(() => {
    if (activeNote) {
      setEditTitle(activeNote.title)
      setEditContent(activeNote.content || "")
    }
  }, [activeNote])

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post("/lesson-notes", payload)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-notes"] })
      toast.success("Note created")
      setIsCreatorOpen(false)
      setActiveNoteId(res.data?._id)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create note")
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return api.patch(`/lesson-notes/${id}`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notes"] })
      toast.success("Note saved")
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to save note")
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/lesson-notes/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notes"] })
      toast.success("Note deleted")
      setActiveNoteId(null)
    },
    onError: (err: any) => toast.error("Failed to delete note")
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formFields.title || !formFields.lessonId) {
      toast.error("Title and Lesson are required")
      return
    }
    createMutation.mutate({
      title: formFields.title,
      lessonId: formFields.lessonId,
      content: "",
    })
  }

  const handleSave = () => {
    if (activeNote) {
      updateMutation.mutate({
        id: activeNote._id,
        payload: {
          title: editTitle,
          content: editContent,
        }
      })
    }
  }

  return (
    <AdminLayout>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground mt-1">Manage reading materials attached to lessons.</p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => setIsCreatorOpen(true)}>
          <Plus className="h-4 w-4" /> Create Note
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)] min-h-[600px]">
        
        {/* Left Side: Notes List */}
        <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search notes..." 
              className="pl-9 bg-background shadow-sm h-10 rounded-xl" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {isLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : notes.length === 0 ? (
              <div className="text-center p-4 text-sm text-muted-foreground">No notes found</div>
            ) : (
              notes.map((note: any) => {
                const isActive = activeNoteId === note._id
                const wordCount = (note.content || "").split(/\s+/).filter(Boolean).length
                return (
                  <div 
                    key={note._id}
                    onClick={() => setActiveNoteId(note._id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isActive 
                        ? "bg-primary/5 border-primary shadow-sm" 
                        : "bg-background border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-bold line-clamp-1 pr-2 ${isActive ? "text-primary" : "text-foreground"}`}>
                        {note.title}
                      </h3>
                      {note.content && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mb-3 line-clamp-1 flex items-center gap-1.5">
                      <FileText className="h-3 w-3" /> {note.lessonId?.title || 'Unknown Lesson'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{wordCount} words</span>
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side: Editor Panel */}
        {activeNote ? (
          <div className="flex-1 bg-background border rounded-2xl shadow-sm flex flex-col overflow-hidden">
            
            <div className="h-16 border-b flex items-center justify-between px-6 bg-surface/50">
              <div className="flex flex-col min-w-0 pr-4 flex-1">
                <input 
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-sm font-bold truncate bg-transparent border-none outline-none focus:ring-0 p-0 w-full" 
                  placeholder="Note Title"
                />
                <span className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                  Lesson: <span className="font-bold">{activeNote.lessonId?.title || 'Unknown'}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (confirm(`Delete note "${activeNote.title}"?`)) {
                      deleteMutation.mutate(activeNote._id)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  className="gap-2 shadow-sm" 
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} 
                  Save Note
                </Button>
              </div>
            </div>

            <div className="flex-1 p-0 overflow-hidden flex flex-col">
              <textarea
                className="flex-1 w-full p-6 bg-transparent border-none outline-none resize-none text-base leading-relaxed font-mono"
                placeholder="Write your note content here (Markdown supported in actual render)..."
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              ></textarea>
            </div>

          </div>
        ) : (
          <div className="flex-1 border rounded-2xl flex flex-col items-center justify-center bg-muted/10 text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-20" />
            <p>Select a note to edit or create a new one</p>
          </div>
        )}

      </div>

      {/* Creator Modal */}
      <Dialog open={isCreatorOpen} onOpenChange={setIsCreatorOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background rounded-2xl border">
          <DialogHeader className="p-6 border-b bg-surface/50">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">Create Note</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit}>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Note Title *</label>
                <Input
                  required
                  placeholder="e.g. React Hooks Cheat Sheet"
                  value={formFields.title}
                  onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Target Lesson *</label>
                <select
                  required
                  value={formFields.lessonId}
                  onChange={(e) => setFormFields({ ...formFields, lessonId: e.target.value })}
                  className="h-10 w-full rounded-xl border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="" disabled>Select a lesson</option>
                  {lessonsData?.map((l: any) => (
                    <option key={l._id} value={l._id}>{l.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t bg-surface/50 flex justify-end gap-3 flex-wrap">
              <Button type="button" variant="outline" className="rounded-xl w-full sm:w-auto" onClick={() => setIsCreatorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="rounded-xl w-full sm:w-auto font-bold">
                Create Note
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
