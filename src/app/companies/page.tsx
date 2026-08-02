"use client"

import React, { useState } from "react"
import { PublicLayout } from "@/components/layout/public-layout"
import { CompanyCard } from "@/components/career/company/company-card"
import { FilterBar } from "@/components/career/shared/filter-bar"
import { EmptyState } from "@/components/career/shared/empty-state"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const limit = 12

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-companies", page, searchTerm, activeFilters],
    queryFn: async () => {
      const response = await api.get('/companies', {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
          activelyHiring: activeFilters.includes("Actively Hiring") ? "true" : undefined,
          topSalary: activeFilters.includes("Top Salary (> 10 LPA)") ? "true" : undefined,
          skills: activeFilters.filter(f => ["Java", "Python", "React"].includes(f)).join(",") || undefined,
        }
      })
      return response.data
    },
    placeholderData: keepPreviousData
  })

  const companies = data?.data || []
  const total = data?.pagination?.total || data?.total || 0
  const totalPages = Math.ceil(total / limit)

  return (
    <PublicLayout>
      <div className="bg-background min-h-screen">
        {/* Hero Section */}
        <section className="py-16 md:py-24 border-b bg-surface">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                Discover Top Companies
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Explore companies hiring fresh graduates. Research their work culture, interview processes, and open roles to prepare effectively.
              </p>
              
              <FilterBar 
                placeholder="Search by company name or overview..."
                onSearch={(val) => { setSearchTerm(val); setPage(1); }}
                onFilterToggle={(label) => {
                  setActiveFilters(prev => 
                    prev.includes(label) 
                      ? prev.filter(f => f !== label) 
                      : [...prev, label]
                  )
                  setPage(1)
                }}
                filters={[
                  { label: "Actively Hiring", active: activeFilters.includes("Actively Hiring") },
                  { label: "Top Salary (> 10 LPA)", active: activeFilters.includes("Top Salary (> 10 LPA)") },
                  { label: "Java", active: activeFilters.includes("Java") },
                  { label: "Python", active: activeFilters.includes("Python") },
                  { label: "React", active: activeFilters.includes("React") }
                ]}
              />
            </div>
          </div>
        </section>

        {/* Companies Grid */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">All Companies</h2>
              <span className="text-sm text-muted-foreground">Showing {total} companies</span>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12 text-destructive">Failed to load companies.</div>
            ) : companies.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {companies.map((company: any) => (
                    <CompanyCard 
                      key={company._id} 
                      id={company._id}
                      slug={company.slug}
                      name={company.name}
                      description={company.overview || "No overview provided."}
                      industry="Technology"
                      location={company.headquarters || "Global"}
                      isHiring={company.jobOpenings?.length > 0}
                      popularRoles={company.jobRoles?.map((r: any) => r.title) || []}
                      logo={company.logo}
                    />
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">Page {page} of {totalPages}</span>
                    <Button 
                      variant="outline" 
                      size="icon"
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState 
                title="No companies found"
                message="Try adjusting your filters to discover more companies hiring freshers."
                onReset={() => { setSearchTerm(""); setPage(1); }}
              />
            )}

          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
