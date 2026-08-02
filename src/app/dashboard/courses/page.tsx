"use client"

import React, { useState } from "react"
import { Search, PlayCircle, Clock, CheckCircle2, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import Link from "next/link"

export default function MyCoursesPage() {
  const [search, setSearch] = useState("")

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["my-courses"],
    queryFn: async () => {
      const res = await api.get("/progress/dashboard")
      return res.data?.data || res.data
    },
  })

  const courses = data || []
  
  const filteredCourses = courses.filter((c: any) => 
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
            <p className="text-muted-foreground mt-1">Manage and track your enrolled learning roadmaps.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search courses..." 
                className="pl-9 bg-background" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col rounded-2xl border bg-background shadow-sm overflow-hidden h-64">
                <Skeleton className="h-32 w-full" />
                <div className="p-6 flex-1 flex flex-col gap-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-2 w-full mt-auto" />
                </div>
              </div>
            ))
          ) : isError ? (
            <div className="col-span-full flex flex-col items-center justify-center h-64 border rounded-2xl bg-background shadow-sm">
              <RefreshCw className="h-10 w-10 text-muted-foreground animate-spin mb-4" />
              <h3 className="text-lg font-bold">Failed to load courses</h3>
              <Button onClick={() => refetch()} className="mt-4">Retry</Button>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center h-64 border rounded-2xl bg-background shadow-sm text-center p-6">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold">No courses found</h3>
              <p className="text-muted-foreground mt-2">You are not enrolled in any courses yet.</p>
              <Button asChild className="mt-6">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          ) : (
            filteredCourses.map((course: any) => (
              <div key={course.id} className="flex flex-col rounded-2xl border bg-background shadow-sm overflow-hidden hover:border-primary/50 transition-colors">
                <div className="h-32 bg-primary/5 border-b relative flex items-center justify-center overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <PlayCircle className="h-12 w-12 text-primary/40" />
                  )}
                  {course.status === "completed" && (
                    <Badge variant="secondary" className="absolute top-4 right-4 bg-success/10 text-success hover:bg-success/20 font-bold border-success/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                    </Badge>
                  )}
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-4 line-clamp-2">{course.title}</h3>
                  
                  <div className="mt-auto space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm font-medium mb-2">
                        <span>{course.progress}% Complete</span>
                        <span className="text-muted-foreground">{course.completedLessons}/{course.totalLessons}</span>
                      </div>
                      <Progress value={course.progress} className={`h-2 ${course.status === "completed" ? "[&>div]:bg-success" : ""}`} />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> 
                        Last accessed {course.lastAccessedAt ? new Date(course.lastAccessedAt).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    
                    <Button 
                      asChild
                      className="w-full mt-4 font-bold" 
                      variant={course.status === "completed" ? "outline" : "default"}
                    >
                      <Link href={`/courses/${course.slug}`}>
                        {course.status === "completed" ? "Review Course" : "Continue Learning"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </>
  )
}

function BookOpen(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}
