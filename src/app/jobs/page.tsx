"use client"

import React, { Suspense } from "react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { PublicLayout } from "@/components/layout/public-layout"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Job } from "@/types/job"
import { JobCard } from "@/components/career/job/job-card"
import { FilterBar } from "@/components/career/shared/filter-bar"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, SlidersHorizontal, RefreshCw, X, Filter } from "lucide-react"
import { useAuthStore } from "@/store/auth.store"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

function JobSearchContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  // Extract filters from URL
  const searchTerm = searchParams.get("search") || ""
  const page = Number(searchParams.get("page")) || 1
  const experienceRequired = searchParams.get("experienceRequired") || ""
  const workModes = searchParams.get("workModes")?.split(",").filter(Boolean) || []
  const location = searchParams.get("location") || ""
  const companyId = searchParams.get("companyId") || ""
  const roleId = searchParams.get("roleId") || ""
  const employmentType = searchParams.get("employmentType") || ""
  const sort = searchParams.get("sort") || "newest"

  const limit = 10

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Default: reset to page 1 on any filter change unless explicitly updating page
    if (!updates.page) {
      params.delete("page")
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const resetFilters = () => {
    router.push(pathname, { scroll: false })
  }

  // Fetch Filters Options
  const { data: companiesData } = useQuery({
    queryKey: ["companies-list"],
    queryFn: async () => (await api.get("/companies", { params: { limit: 100 } })).data,
  })

  const { data: rolesData } = useQuery({
    queryKey: ["roles-list"],
    queryFn: async () => (await api.get("/job-roles", { params: { limit: 100 } })).data,
  })

  const companies = companiesData?.data || []
  const roles = rolesData?.data || []

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "public-jobs",
      { searchTerm, page, experienceRequired, workModes, companyId, roleId, employmentType, sort, location },
    ],
    queryFn: async () => {
      const res = await api.get("/public/jobs", {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
          experienceRequired: experienceRequired || undefined,
          workMode: workModes.length > 0 ? workModes.join(",") : undefined,
          location: location || undefined,
          companyId: companyId || undefined,
          roleId: roleId || undefined,
          employmentType: employmentType || undefined,
          sort: sort !== "newest" ? sort : undefined,
        },
      })
      return res.data
    },
    refetchInterval: 30000,
  })

  // Bookmarks Check
  const { data: bookmarksData } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      const res = await api.get("/bookmarks")
      return res.data
    },
    enabled: !!user,
  })

  const toggleBookmark = useMutation({
    mutationFn: (jobId: string) =>
      api.post("/bookmarks/toggle", { entityId: jobId, entityType: "job" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookmarks"] }),
  })

  const bookmarks = bookmarksData?.data ?? []
  const bookmarkedJobIds = new Set(
    bookmarks.filter((b: any) => b.type === "job").map((b: any) => b.entityId)
  )

  const jobs: Job[] = data?.data ?? []
  const total: number = data?.pagination?.total ?? 0
  const totalPages = data?.pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit))

  const hasActiveFilters = Array.from(searchParams.keys()).some(k => k !== "page" && k !== "search" && k !== "sort")

  const removeFilter = (key: string, val?: string) => {
    if (key === 'workModes' && val) {
      const newModes = workModes.filter(m => m !== val)
      updateQueryParams({ workModes: newModes.length > 0 ? newModes.join(",") : null })
    } else {
      updateQueryParams({ [key]: null })
    }
  }

  const SidebarContent = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Filters</h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground h-8 px-2 text-xs">
            Clear All
          </Button>
        )}
      </div>

      <div>
        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Company</h3>
        <select
          className="w-full h-10 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          value={companyId}
          onChange={(e) => updateQueryParams({ companyId: e.target.value })}
        >
          <option value="">All Companies</option>
          {companies.map((c: any) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Role</h3>
        <select
          className="w-full h-10 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          value={roleId}
          onChange={(e) => updateQueryParams({ roleId: e.target.value })}
        >
          <option value="">All Roles</option>
          {roles.map((r: any) => (
            <option key={r._id} value={r._id}>{r.title}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Experience
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={experienceRequired === "Fresher"}
              onChange={(e) =>
                updateQueryParams({ experienceRequired: e.target.checked ? "Fresher" : null })
              }
            />
            <span className="text-sm">Fresher (0 Years)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={experienceRequired === "1-3 Years"}
              onChange={(e) =>
                updateQueryParams({ experienceRequired: e.target.checked ? "1-3 Years" : null })
              }
            />
            <span className="text-sm">Entry Level (1-3 Years)</span>
          </label>
        </div>
      </div>

      <div className="w-full h-px bg-border"></div>

      <div>
        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Employment Type
        </h3>
        <div className="space-y-3">
          {["Full-time", "Part-time", "Internship", "Contract"].map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={employmentType === type}
                onChange={(e) =>
                  updateQueryParams({ employmentType: e.target.checked ? type : null })
                }
              />
              <span className="text-sm">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-border"></div>

      <div>
        <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Work Mode
        </h3>
        <div className="space-y-3">
          {["Remote", "On-site", "Hybrid"].map((mode) => (
            <label key={mode} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={workModes.includes(mode)}
                onChange={(e) => {
                  const newModes = e.target.checked
                    ? [...workModes, mode]
                    : workModes.filter((m) => m !== mode)
                  updateQueryParams({ workModes: newModes.length > 0 ? newModes.join(",") : null })
                }}
              />
              <span className="text-sm">{mode}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="py-12 md:py-16 border-b bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Find Your First Tech Job
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Curated opportunities for freshers and early-career engineers.
            </p>

            <FilterBar
              placeholder="Job title, keywords, or company"
              onSearch={(val) => updateQueryParams({ search: val })}
              showLocation={true}
              onLocationChange={(val) => updateQueryParams({ location: val || null })}
              defaultSearch={searchTerm}
              defaultLocation={location}
            />
          </div>
        </div>
      </section>

      {/* Jobs Layout with Sidebar Filters */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar Filters Desktop */}
            <aside className="w-full lg:w-64 shrink-0 hidden lg:block sticky top-24">
              <SidebarContent />
            </aside>

            {/* Main Feed */}
            <div className="flex-1 w-full">
              {/* Active Filter Chips */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-sm text-muted-foreground mr-1">Active Filters:</span>
                  {companyId && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {companies.find((c: any) => c._id === companyId)?.name || "Company"}
                      <button onClick={() => removeFilter('companyId')} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
                    </span>
                  )}
                  {location && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      📍 {location}
                      <button onClick={() => removeFilter('location')} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
                    </span>
                  )}
                  {roleId && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {roles.find((r: any) => r._id === roleId)?.title || "Role"}
                      <button onClick={() => removeFilter('roleId')} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
                    </span>
                  )}
                  {experienceRequired && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {experienceRequired}
                      <button onClick={() => removeFilter('experienceRequired')} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
                    </span>
                  )}
                  {employmentType && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {employmentType}
                      <button onClick={() => removeFilter('employmentType')} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
                    </span>
                  )}
                  {workModes.map(mode => (
                    <span key={mode} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {mode}
                      <button onClick={() => removeFilter('workModes', mode)} className="hover:bg-primary/20 rounded-full p-0.5"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                  <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-foreground ml-2">Clear All</button>
                </div>
              )}

              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold">Showing {total} Jobs</h2>

                {/* Mobile Filter Sheet */}
                <div className="flex items-center gap-2 lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="gap-2 rounded-xl">
                        <Filter className="h-4 w-4" /> Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                      <SheetHeader className="mb-6">
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <SidebarContent />
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Desktop Sort */}
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Sort by:</span>
                  <select 
                    value={sort}
                    onChange={(e) => updateQueryParams({ sort: e.target.value })}
                    className="bg-transparent font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="deadline">Closing Soon</option>
                    <option value="highest_salary">Highest Salary</option>
                    <option value="lowest_salary">Lowest Salary</option>
                    <option value="experience">Experience</option>
                    <option value="company">Company</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full rounded-xl" />
                  ))}
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl bg-surface">
                  <RefreshCw className="h-10 w-10 text-muted-foreground animate-spin mb-4" />
                  <h3 className="text-lg font-bold">Failed to load jobs</h3>
                  <Button onClick={() => refetch()} className="mt-4">
                    Retry
                  </Button>
                </div>
              ) : jobs.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <JobCard
                        key={job._id}
                        id={job._id}
                        companyName={job.companySnapshot?.name || job.companyId?.name || "Unknown"}
                        companyLogo={job.companySnapshot?.logo || job.companyId?.logo}
                        role={job.title}
                        location={job.location}
                        experience={job.experienceRequired}
                        salary={
                          job.salary?.min
                            ? `${job.salary.min} - ${job.salary.max} LPA`
                            : "Not Disclosed"
                        }
                        postedDate={new Date(job.createdAt).toLocaleDateString()}
                        createdAt={job.createdAt}
                        deadline={job.deadline}
                        status={job.status}
                        isRemote={job.workMode === "Remote" || job.location.toLowerCase().includes("remote")}
                        isBookmarked={bookmarkedJobIds.has(job._id)}
                        onToggleBookmark={(e) => {
                          e.preventDefault() // prevent triggering the card's link
                          if (user) {
                            toggleBookmark.mutate(job._id)
                          } else {
                            window.location.href = "/login"
                          }
                        }}
                        isTogglingBookmark={
                          toggleBookmark.isPending && toggleBookmark.variables === job._id
                        }
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                     <div className="mt-12 flex items-center justify-center gap-2">
                       <Button
                         variant="outline"
                         size="icon"
                         onClick={() => updateQueryParams({ page: String(Math.max(1, page - 1)) })}
                         disabled={page === 1}
                       >
                         <ChevronLeft className="h-4 w-4" />
                       </Button>
                       <span className="text-sm font-medium">
                         Page {page} of {totalPages}
                       </span>
                       <Button
                         variant="outline"
                         size="icon"
                         onClick={() => updateQueryParams({ page: String(Math.min(totalPages, page + 1)) })}
                         disabled={page === totalPages}
                       >
                         <ChevronRight className="h-4 w-4" />
                       </Button>
                     </div>
                   )}
                 </>
               ) : (
                 <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-2xl bg-surface/50 border-dashed">
                   <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                     <Search className="h-8 w-8 text-muted-foreground" />
                   </div>
                   <h3 className="text-xl font-bold mb-2">No jobs match your filters</h3>
                   <p className="text-muted-foreground mb-6 max-w-sm">
                     We couldn't find any opportunities matching your current search criteria.
                   </p>
                   
                   <div className="text-sm text-left bg-background p-4 rounded-xl border mb-6 inline-block">
                     <p className="font-medium mb-2">Try adjusting:</p>
                     <ul className="list-disc list-inside text-muted-foreground space-y-1">
                       <li>Removing specific company or role filters</li>
                       <li>Changing your experience requirement</li>
                       <li>Selecting more work modes</li>
                     </ul>
                   </div>
                   
                   <Button onClick={resetFilters} className="rounded-xl px-8 font-bold">
                     Clear All Filters
                   </Button>
                 </div>
               )}
             </div>
           </div>
         </div>
       </section>
     </div>
   )
 }
 
 export default function JobsPage() {
   return (
     <PublicLayout>
       <Suspense fallback={<div className="p-12 text-center text-muted-foreground animate-pulse">Loading jobs...</div>}>
         <JobSearchContent />
       </Suspense>
     </PublicLayout>
   )
 }
