"use client"

import React, { useState } from "react"
import { PublicLayout } from "@/components/layout/public-layout"
import { RoleCard } from "@/components/career/job-role/role-card"
import { EmptyState } from "@/components/career/shared/empty-state"
import { CardSkeleton } from "@/components/career/shared/skeleton-loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search, AlertCircle, RotateCcw, SlidersHorizontal } from "lucide-react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type { JobRoleListItem } from "@/types/job-role"

const CATEGORIES = [
  "All",
  "Software Development",
  "Artificial Intelligence",
  "Data Science",
  "Cloud & DevOps",
  "Cybersecurity",
  "Mobile Development",
  "UI/UX Design",
]

const EXPERIENCE_LEVELS = [
  { label: "All Levels", value: "" },
  { label: "Fresher", value: "Fresher" },
  { label: "0–2 Years", value: "0–2 Years" },
  { label: "2–5 Years", value: "2–5 Years" },
  { label: "5+ Years", value: "5+ Years" },
]

const SORT_OPTIONS = [
  { label: "Alphabetical", value: "alphabetical" },
  { label: "Newest", value: "newest" },
]

export default function JobRolesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [sortBy, setSortBy] = useState("alphabetical")
  const [page, setPage] = useState(1)
  const limit = 12

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["public-job-roles", page, searchTerm, selectedCategory, selectedLevel, sortBy],
    queryFn: async () => {
      const response = await api.get('/job-roles', {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          experienceLevel: selectedLevel || undefined,
          sortBy,
        }
      })
      return response.data
    },
    placeholderData: keepPreviousData,
  })

  const handleSearch = () => {
    setSearchTerm(searchInput)
    setPage(1)
  }

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setPage(1)
  }

  const handleReset = () => {
    setSearchTerm("")
    setSearchInput("")
    setSelectedCategory("All")
    setSelectedLevel("")
    setSortBy("alphabetical")
    setPage(1)
  }

  const jobRoles: JobRoleListItem[] = data?.data || []
  const total: number = data?.pagination?.total || data?.total || 0
  const totalPages = Math.ceil(total / limit) || 0

  return (
    <PublicLayout>
      <div className="bg-background min-h-screen">
        {/* Hero Section */}
        <section className="py-16 md:py-24 border-b bg-surface">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-6">
                Career Guidance
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Explore Tech Job Roles
              </h1>
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                Discover detailed guides for in-demand tech careers — skills, roadmaps, interview prep, and salary insights.
              </p>

              {/* Search Bar */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search roles (e.g. Data Scientist, DevOps)..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-12 h-12 text-base rounded-xl border-border/60 bg-background"
                  />
                </div>
                <Button onClick={handleSearch} className="h-12 px-7 rounded-xl font-semibold shrink-0">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Roles Grid */}
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            {/* Filters Row */}
            <div className="mb-8 space-y-4">
              {/* Category Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-secondary text-secondary-foreground border-transparent hover:border-primary/30 hover:bg-secondary/80"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Level + Sort + Count */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <select
                    value={selectedLevel}
                    onChange={(e) => { setSelectedLevel(e.target.value); setPage(1) }}
                    className="h-9 px-3 text-sm rounded-lg border bg-background text-foreground"
                  >
                    {EXPERIENCE_LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
                    className="h-9 px-3 text-sm rounded-lg border bg-background text-foreground"
                  >
                    {SORT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  {(searchTerm || selectedCategory !== "All" || selectedLevel) && (
                    <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 h-9 text-muted-foreground">
                      <RotateCcw className="h-3.5 w-3.5" /> Reset
                    </Button>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {isLoading ? "Loading..." : `${total} roles found`}
                </span>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl bg-surface/50 border-dashed">
                <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-bold mb-2">Failed to load roles</h3>
                <p className="text-muted-foreground mb-6">An error occurred while fetching job roles.</p>
                <Button onClick={() => refetch()} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Try Again
                </Button>
              </div>
            ) : jobRoles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobRoles.map((role) => (
                    <RoleCard
                      key={role._id}
                      id={role._id}
                      slug={role.slug}
                      title={role.title}
                      description={role.shortDescription}
                      category={role.category}
                      experienceLevel={role.experienceLevel}
                      salaryInfo={role.salaryInfo}
                      salaryRange={role.salaryRange}
                      skillsCount={role.requiredSkills?.length || 0}
                      companiesHiringCount={role.companiesHiring?.length || 0}
                      isFeatured={role.isFeatured}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-14 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="rounded-lg"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="icon"
                          onClick={() => setPage(pageNum)}
                          className="rounded-lg w-9 h-9 text-sm font-semibold"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    {totalPages > 5 && (
                      <span className="text-sm text-muted-foreground px-2">…{totalPages}</span>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className="rounded-lg"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="No roles found"
                message="Try adjusting your filters or search term to discover more career paths."
                onReset={handleReset}
              />
            )}
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
