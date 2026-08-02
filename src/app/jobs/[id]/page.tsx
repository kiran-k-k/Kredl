"use client"

import React, { use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Building2, MapPin, Briefcase, IndianRupee, Calendar, BookmarkPlus, Share2, ArrowRight, ExternalLink, BookmarkCheck } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Job } from "@/types/job"
import { useAuthStore } from "@/store/auth.store"
import { toast } from "sonner"

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: jobData, isLoading, isError } = useQuery({
    queryKey: ["public-job", resolvedParams.id],
    queryFn: async () => {
      const res = await api.get(`/public/jobs/${resolvedParams.id}`)
      return res.data
    },
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

  const bookmarks = bookmarksData?.data ?? []
  const isBookmarked = bookmarks.some((b: any) => b.entityId === resolvedParams.id && b.type === "job")

  const toggleBookmark = useMutation({
    mutationFn: () => api.post("/bookmarks/toggle", { entityId: resolvedParams.id, entityType: "job" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookmarks"] })
  })

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied to clipboard!")
  }

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="bg-background min-h-screen p-12">
          <Skeleton className="h-64 w-full rounded-2xl mb-12" />
          <div className="flex gap-12">
            <Skeleton className="h-96 flex-1 rounded-2xl" />
            <Skeleton className="h-96 w-[320px] rounded-2xl hidden lg:block" />
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (isError || !jobData) {
    return (
      <PublicLayout>
        <div className="bg-background min-h-screen flex items-center justify-center p-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
            <p className="text-muted-foreground mb-6">The job you are looking for does not exist or has expired.</p>
            <Button asChild><Link href="/jobs">View All Jobs</Link></Button>
          </div>
        </div>
      </PublicLayout>
    )
  }

  const job: Job = jobData?.data || jobData
  const companyName = job.companyId?.name || "Unknown Company"
  const roleName = job.roleId?.title || job.title

  return (
    <PublicLayout>
      <div className="bg-background min-h-screen">
        
        {/* Job Header / Hero */}
        <section className="bg-surface border-b py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
              
              <div className="flex gap-6 items-start lg:items-center flex-col md:flex-row w-full lg:w-auto">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-background border flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                  {job.companyId?.logo ? (
                    <img src={job.companyId.logo} alt={companyName} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary/40" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{job.employmentType}</Badge>
                    {job.workMode === 'Remote' && (
                      <Badge variant="outline" className="text-primary border-primary/20">Remote</Badge>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">
                    {job.title}
                  </h1>
                  <Link href={`/companies/${job.companyId?._id}`} className="text-lg font-medium text-muted-foreground mb-4 hover:text-primary transition-colors inline-block w-fit">
                    {companyName} <ExternalLink className="inline h-4 w-4 ml-1 mb-1" />
                  </Link>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {job.location}</div>
                    <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> {job.experienceRequired}</div>
                    {job.salary?.min && (
                      <div className="flex items-center gap-2"><IndianRupee className="h-4 w-4" /> {job.salary.min} - {job.salary.max} LPA</div>
                    )}
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Posted {new Date(job.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet Actions */}
              <div className="flex lg:hidden w-full gap-3 mt-4">
                {job.applyUrl && (
                  <Button className="flex-1 h-12 text-base" asChild>
                    <a href={job.applyUrl} target="_blank" rel="noreferrer">Quick Apply</a>
                  </Button>
                )}
                {user && (
                  <Button variant="outline" size="icon" className="h-12 w-12 shrink-0" onClick={() => toggleBookmark.mutate()} disabled={toggleBookmark.isPending}>
                    {isBookmarked ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <BookmarkPlus className="h-5 w-5" />}
                  </Button>
                )}
              </div>

            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 relative items-start">
              
              {/* Left Column - Main JD */}
              <div className="flex-1 lg:max-w-[760px] xl:max-w-[820px] prose prose-neutral dark:prose-invert max-w-none">
                
                <h2>Job Overview</h2>
                <div className="whitespace-pre-wrap">{job.jobSummary}</div>

                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <>
                    <h2>Required Skills</h2>
                    <div className="flex flex-wrap gap-2 mt-4 not-prose">
                      {job.requiredSkills.map(skill => (
                        <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">{skill}</Badge>
                      ))}
                    </div>
                  </>
                )}

                {job.eligibilityCriteria && (
                  <>
                    <h2>Eligibility Criteria</h2>
                    <ul>
                      {job.eligibilityCriteria.minimumCgpa > 0 && (
                        <li>Minimum CGPA: <strong>{job.eligibilityCriteria.minimumCgpa}</strong></li>
                      )}
                      {job.eligibilityCriteria.allowedBranches && job.eligibilityCriteria.allowedBranches.length > 0 && (
                        <li>Allowed Branches: <strong>{job.eligibilityCriteria.allowedBranches.join(", ")}</strong></li>
                      )}
                      {job.eligibilityCriteria.batchYears && job.eligibilityCriteria.batchYears.length > 0 && (
                        <li>Eligible Batches: <strong>{job.eligibilityCriteria.batchYears.join(", ")}</strong></li>
                      )}
                    </ul>
                  </>
                )}

                <hr className="my-12" />
                
                {/* Cross-linking Banners */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-12">
                  {job.companyId && (
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col">
                      <h3 className="text-xl font-bold mb-2">Company Guide</h3>
                      <p className="text-muted-foreground text-sm mb-6 flex-1">
                        Check out our detailed guide for {companyName}, including interview questions, timeline, and salary insights.
                      </p>
                      <Button asChild variant="outline" className="w-fit group bg-background">
                        <Link href={`/companies/${job.companyId._id}`}>View Company Guide <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
                      </Button>
                    </div>
                  )}
                  
                  {job.roleId && (
                    <div className="bg-surface border rounded-2xl p-6 flex flex-col">
                      <h3 className="text-xl font-bold mb-2">Job Role Guide</h3>
                      <p className="text-muted-foreground text-sm mb-6 flex-1">
                        Want to know more about what a {roleName} does and how to prepare?
                      </p>
                      <Button asChild variant="outline" className="w-fit group bg-background">
                        <Link href={`/job-roles/${job.roleId._id}`}>View Role Guide <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
                      </Button>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column - Sticky Sidebar */}
              <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 lg:sticky lg:top-24 space-y-6">
                
                <div className="rounded-2xl border bg-surface p-6 shadow-sm hidden lg:block">
                  {job.applyUrl ? (
                    <Button className="w-full h-12 text-base mb-3 font-bold" asChild>
                      <a href={job.applyUrl} target="_blank" rel="noreferrer">Apply Now</a>
                    </Button>
                  ) : (
                    <Button className="w-full h-12 text-base mb-3" disabled>Apply Unavailable</Button>
                  )}
                  
                  <div className="flex gap-3">
                    {user ? (
                      <Button variant="outline" className="flex-1 gap-2 bg-background hover:bg-muted" onClick={() => toggleBookmark.mutate()} disabled={toggleBookmark.isPending}>
                        {isBookmarked ? <><BookmarkCheck className="h-4 w-4 text-primary" /> Saved</> : <><BookmarkPlus className="h-4 w-4" /> Save</>}
                      </Button>
                    ) : (
                      <Button variant="outline" className="flex-1 gap-2 bg-background" asChild>
                        <Link href="/login"><BookmarkPlus className="h-4 w-4" /> Save</Link>
                      </Button>
                    )}
                    <Button variant="secondary" className="flex-1 gap-2" onClick={handleShare}>
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t text-sm text-muted-foreground space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Application Deadline</span>
                      <span className="font-medium text-foreground">{job.deadline ? new Date(job.deadline).toLocaleDateString() : "Rolling"}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-surface p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Job Overview</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Job Type</p>
                      <p className="font-semibold text-sm">{job.employmentType}</p>
                    </div>
                    {job.roleId && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Role Category</p>
                        <p className="font-semibold text-sm">{roleName}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Experience</p>
                      <p className="font-semibold text-sm">{job.experienceRequired}</p>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
