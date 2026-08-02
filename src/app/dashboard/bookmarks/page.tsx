"use client"

import React, { useState } from "react"
import { Search, Building2, Briefcase, BookOpen, Trash2, PlayCircle, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function BookmarksPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")

  const { data: bookmarks = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const res = await api.get("/bookmarks")
      return res.data?.data || res.data || []
    }
  })

  const removeBookmark = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/bookmarks/${id}`)
    },
    onSuccess: () => {
      toast.success("Bookmark removed")
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
    }
  })

  const safeBookmarks = Array.isArray(bookmarks) ? bookmarks : []
  const filteredBookmarks = safeBookmarks.filter((b: any) => 
    b.title?.toLowerCase().includes(search.toLowerCase())
  )

  const getIcon = (type: string) => {
    switch (type) {
      case "company": return <Building2 className="h-5 w-5 text-blue-500" />
      case "job": return <Briefcase className="h-5 w-5 text-green-500" />
      case "course": return <PlayCircle className="h-5 w-5 text-purple-500" />
      case "role": return <BookOpen className="h-5 w-5 text-orange-500" />
      default: return <BookOpen className="h-5 w-5" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case "company": return "bg-blue-500/10"
      case "job": return "bg-green-500/10"
      case "course": return "bg-purple-500/10"
      case "role": return "bg-orange-500/10"
      default: return "bg-primary/10"
    }
  }

  const renderBookmarkList = (type: string) => {
    const list = type === "all" 
      ? filteredBookmarks 
      : filteredBookmarks.filter((b: any) => b.type === type)

    if (isLoading) {
      return (
        <div className="p-12 flex justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }

    if (isError) {
      return (
        <div className="p-12 text-center text-muted-foreground">
          <p>Failed to load bookmarks.</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>Try Again</Button>
        </div>
      )
    }

    if (list.length === 0) {
      return (
        <div className="p-12 text-center text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No {type !== "all" ? type : ""} bookmarks found.</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((bookmark: any) => (
          <div 
            key={bookmark.id} 
            className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors"
          >
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 ${getBgColor(bookmark.type)}`}>
              {getIcon(bookmark.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-bold truncate">{bookmark.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{bookmark.subtitle}</p>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => removeBookmark.mutate(bookmark.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookmarks</h1>
          <p className="text-muted-foreground mt-1">Saved courses, jobs, and companies for quick access.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search bookmarks..." 
            className="pl-9 bg-background" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6 w-full flex flex-wrap justify-start h-auto bg-transparent p-0 gap-2">
          <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background">All Saved</TabsTrigger>
          <TabsTrigger value="course" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background">Courses</TabsTrigger>
          <TabsTrigger value="job" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background">Jobs</TabsTrigger>
          <TabsTrigger value="company" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background">Companies</TabsTrigger>
          <TabsTrigger value="role" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background">Roles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {renderBookmarkList("all")}
        </TabsContent>
        <TabsContent value="course">
          {renderBookmarkList("course")}
        </TabsContent>
        <TabsContent value="job">
          {renderBookmarkList("job")}
        </TabsContent>
        <TabsContent value="company">
          {renderBookmarkList("company")}
        </TabsContent>
        <TabsContent value="role">
          {renderBookmarkList("role")}
        </TabsContent>
      </Tabs>
    </div>
  )
}
