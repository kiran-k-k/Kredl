"use client"

import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PublicLayout } from "@/components/layout/public-layout"
import { CourseCard } from "@/components/learning/course-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronRight, RefreshCw, AlertCircle, Layers } from "lucide-react"
import { api } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

const CATEGORIES = [
  "Software Development",
  "Artificial Intelligence",
  "Embedded Systems",
  "Productivity",
  "Placement",
  "Communication",
  "Competitive Exams",
]

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"]

export default function CoursesPage() {
  const [search, setSearch] = useState("")

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get("search")
    if (q) {
      setSearch(q)
    }
  }, [])

  const [category, setCategory] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [sort, setSort] = useState("")
  const [page, setPage] = useState(1)
  const limit = 12

  // Fetch published courses
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["courses", { search, category, difficulty, sort, page }],
    queryFn: async () => {
      const response = await api.get("/courses", {
        params: {
          page,
          limit,
          search: search || undefined,
          category: category || undefined,
          difficulty: difficulty || undefined,
          sort: sort || undefined,
        },
      })
      return response.data
    },
    placeholderData: (previousData) => previousData,
  })

  const courses = data?.data || []
  const totalPages = data?.pagination?.totalPages || 1

  return (
    <PublicLayout>
      <div className="bg-background min-h-screen">
        {/* Hero Banner */}
        <section className="relative py-20 md:py-28 overflow-hidden border-b border-white/5">
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 bg-background z-0"></div>
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[60%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[60%] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px] z-0"></div>
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
            <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 backdrop-blur-md">
              ✨ Discover Your True Potential
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-foreground leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/60">
              Choose Your Career Path
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl leading-relaxed">
              Browse structured learning paths designed to help you master new skills and become job-ready in weeks.
            </p>

            {/* Search & Filters */}
            <div className="w-full max-w-4xl bg-surface/40 backdrop-blur-xl border border-white/10 dark:border-white/5 p-4 md:p-6 rounded-3xl shadow-2xl flex flex-col gap-6">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search courses by title, skill, or keyword..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-14 h-14 bg-background/50 backdrop-blur-md text-lg border-white/10 rounded-2xl focus-visible:ring-2 focus-visible:ring-primary shadow-inner transition-all placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                {/* Popular categories */}
                <div className="flex flex-col items-start gap-2 text-sm w-full md:w-auto">
                  <span className="text-muted-foreground font-medium uppercase tracking-wider text-xs">Categories</span>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => { setCategory(""); setPage(1); }}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        category === "" 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105" 
                          : "bg-secondary/50 text-secondary-foreground hover:bg-secondary hover:scale-105"
                      }`}
                    >
                      All
                    </button>
                    {CATEGORIES.slice(0, 4).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setCategory(cat); setPage(1); }}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                          category === cat 
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105" 
                            : "bg-secondary/50 text-secondary-foreground hover:bg-secondary hover:scale-105"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty & Sort combined */}
                <div className="flex flex-col items-start md:items-end gap-2 text-sm w-full md:w-auto">
                  <span className="text-muted-foreground font-medium uppercase tracking-wider text-xs flex w-full justify-between">
                    <span>Difficulty</span>
                  </span>
                  <div className="flex gap-3 items-center flex-wrap">
                    <div className="flex flex-wrap gap-2 bg-secondary/30 p-1 rounded-xl">
                      {["", ...DIFFICULTIES].map((diff) => (
                        <button
                          key={diff || "all"}
                          onClick={() => { setDifficulty(diff); setPage(1); }}
                          className={`px-4 py-1.5 rounded-lg font-medium transition-all duration-300 ${
                            difficulty === diff 
                              ? "bg-background text-foreground shadow-sm scale-105" 
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {diff || "All"}
                        </button>
                      ))}
                    </div>
                    
                    {/* Sort filter */}
                    <div className="relative">
                      <select
                        value={sort}
                        onChange={(e) => { setSort(e.target.value); setPage(1); }}
                        className="appearance-none bg-secondary/50 hover:bg-secondary transition-colors border-0 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                      >
                        <option value="">Recommended</option>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="alphabetical">A-Z</option>
                      </select>
                      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none rotate-90" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Section */}
        <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            /* Loading Skeleton Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border rounded-xl p-5 space-y-4 bg-card">
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-bold text-foreground">Unable to load courses</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                {(error as any)?.response?.data?.message || "A connection issue occurred. Please check your internet connection and try again."}
              </p>
              <Button onClick={() => refetch()} className="mt-6 gap-2">
                <RefreshCw className="h-4 w-4" /> Retry
              </Button>
            </div>
          ) : courses.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Layers className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">No published courses yet</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                We are preparing new roadmap tracks for you. Check back soon.
              </p>
            </div>
          ) : (
            /* Courses Grid */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    slug={course.slug}
                    title={course.title}
                    description={course.shortDescription}
                    difficulty={course.difficulty}
                    duration={course.estimatedDuration}
                    modules={course.moduleCount}
                    thumbnail={course.thumbnail}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </PublicLayout>
  )
}
