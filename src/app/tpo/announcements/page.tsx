"use client"

import React, { useState } from "react"
import { TpoLayout } from "@/components/layout/tpo-layout"
import { Plus, Megaphone, Target, Calendar, Edit, Trash2, X, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { MOCK_TPO_ANNOUNCEMENTS } from "@/lib/tpo-data/announcements.mock"
import { TpoAnnouncementType } from "@/types/tpo"

export default function TpoAnnouncementsPage() {
  const [announcements] = useState<TpoAnnouncementType[]>(MOCK_TPO_ANNOUNCEMENTS)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  return (
    <TpoLayout>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1">Communicate directly with students about placements.</p>
        </div>
        <Button className="gap-2 shrink-0 bg-primary" onClick={() => setIsEditorOpen(true)}>
          <Plus className="h-4 w-4" /> Create Announcement
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {announcements.map(announcement => (
          <div key={announcement.id} className={`bg-background border rounded-2xl shadow-sm p-6 hover:border-primary/30 transition-colors relative overflow-hidden ${announcement.isPinned ? 'border-primary/50' : ''}`}>
            
            {announcement.isPinned && (
              <div className="absolute top-0 right-0">
                <div className="w-16 h-16 overflow-hidden absolute top-0 right-0">
                  <div className="bg-primary/20 text-primary w-24 h-6 absolute top-2 -right-6 rotate-45 flex items-center justify-center shadow-sm">
                    <Pin className="h-3 w-3 -rotate-45" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-muted border text-muted-foreground">
                    <Target className="h-3.5 w-3.5" /> {announcement.targetAudience}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-muted border text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" /> {announcement.datePosted}
                  </span>
                </div>
                <h3 className="text-xl font-bold pr-8">{announcement.title}</h3>
              </div>
              
              <div className="flex items-center gap-1 shrink-0 self-start z-10">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl">
              {announcement.message}
            </p>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-background">
          <DialogHeader className="p-6 border-b bg-surface/50">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">Create Announcement</DialogTitle>
              <DialogClose className="rounded-full p-2 hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </DialogClose>
            </div>
          </DialogHeader>
          
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <label className="text-sm font-bold">Title</label>
              <Input placeholder="E.g., Final Year Resume Verification..." className="h-10 font-medium" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Target Audience</label>
                <select className="h-10 w-full rounded-md border bg-background px-3 py-1 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                  <option>All Students</option>
                  <option>Final Year</option>
                  <option>Specific Branch</option>
                </select>
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer h-10 px-3 border rounded-md bg-surface/50 hover:bg-surface transition-colors">
                  <input type="checkbox" className="rounded border-muted cursor-pointer" />
                  <span className="text-sm font-bold flex items-center gap-1.5"><Pin className="h-4 w-4 text-muted-foreground" /> Pin to top</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold">Message</label>
              {/* Rich Text Editor Placeholder */}
              <div className="border rounded-md shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-primary">
                <div className="bg-surface border-b p-2 flex gap-1">
                  {['B', 'I', 'U', 'Link', 'List'].map(btn => (
                    <button key={btn} className="h-8 px-2 rounded text-xs font-bold hover:bg-muted text-muted-foreground hover:text-foreground">{btn}</button>
                  ))}
                </div>
                <textarea 
                  className="w-full min-h-[200px] p-4 text-sm focus:outline-none resize-y bg-background" 
                  placeholder="Write your announcement here. Use formatting to make it easy to read..."
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t bg-surface/50 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
            <Button>Post Announcement</Button>
          </div>
        </DialogContent>
      </Dialog>

    </TpoLayout>
  )
}
