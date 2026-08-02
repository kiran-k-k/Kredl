"use client"

import React from "react"
import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Building2, Globe, MapPin, BookmarkPlus, Bookmark, Share2, Briefcase, CheckCircle2, AlertCircle, Calendar } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { useToggleBookmark, useIsBookmarked } from "@/hooks/useBookmarks"
import { toast } from "sonner"

export default function CompanyDetailsPage() {
  const params = useParams()
  const id = params.id as string

  const { data: company, isLoading, isError } = useQuery({
    queryKey: ["public-company", id],
    queryFn: async () => {
      const response = await api.get(`/companies/${id}`)
      return response.data?.data || response.data
    },
    enabled: !!id
  })

  const isBookmarked = useIsBookmarked(company?._id)
  const { mutate: toggleBookmark, isPending: isTogglingBookmark } = useToggleBookmark(company?._id || "", "company")

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied to clipboard!")
  }

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="bg-background min-h-screen pt-24 pb-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="flex gap-12">
              <div className="flex-1 space-y-8"><Skeleton className="h-96 w-full rounded-2xl" /></div>
              <div className="w-80 space-y-6"><Skeleton className="h-64 w-full rounded-2xl" /></div>
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (isError || !company) {
    return (
      <PublicLayout>
        <div className="bg-background min-h-screen pt-24 pb-12 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Company Not Found</h1>
            <p className="text-muted-foreground">The company you are looking for does not exist.</p>
            <Button asChild><Link href="/companies">Back to Companies</Link></Button>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="bg-background min-h-screen">
        {/* Hero Section */}
        <section className="bg-surface border-b py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl bg-background border flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-12 w-12 sm:h-16 sm:w-16 text-primary/40" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  {(company.jobOpenings?.length > 0) && (
                    <Badge variant="secondary" className="bg-success/10 text-success hover:bg-success/20">Hiring Now</Badge>
                  )}
                  {company.industry && <Badge variant="outline">{company.industry}</Badge>}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  {company.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground mb-4">
                  {company.headquarters && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {company.headquarters}</div>}
                  {company.website && <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="hover:underline">{company.website}</a></div>}
                </div>
              </div>
              <div className="flex w-full lg:w-auto flex-row lg:flex-col gap-3 shrink-0 mt-6 lg:mt-0">
                <Button className="flex-1 lg:w-full h-11" variant="default" asChild>
                  <Link href={`/jobs?company=${company.slug}`}>View Open Jobs</Link>
                </Button>
                <Button className="flex-1 lg:w-full h-11 gap-2" variant="outline">
                  <BookmarkPlus className="h-4 w-4" /> Save Company
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 relative items-start">
              
              {/* Left Column */}
              <div className="flex-1 lg:max-w-[760px] xl:max-w-[820px]">
                
                {/* Overview */}
                {company.overview && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold tracking-tight mb-4">Company Overview</h2>
                    <div className="prose prose-neutral dark:prose-invert text-muted-foreground max-w-none">
                      <p>{company.overview}</p>
                    </div>
                  </div>
                )}

                {/* Hiring Process (Timeline) */}
                {company.hiringProcess && company.hiringProcess.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold tracking-tight mb-6">Hiring Process</h2>
                    <div className="space-y-2">
                      {company.hiringProcess.map((step: string, index: number) => (
                        <div key={index} className="flex items-stretch gap-6 relative">
                          {/* Step line for all but last item */}
                          {index !== company.hiringProcess.length - 1 && (
                            <div className="absolute left-[1.125rem] top-10 bottom-[-0.5rem] w-px bg-border -translate-x-1/2"></div>
                          )}
                          <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold z-10 relative mt-1">
                            {index + 1}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="p-5 rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                              <h3 className="font-bold text-base md:text-lg text-foreground">{step}</h3>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preparation Tips */}
                {company.preparationTips && company.preparationTips.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold tracking-tight mb-6">Preparation Tips</h2>
                    <div className="p-6 rounded-2xl border bg-primary/5 text-primary-foreground border-primary/10">
                      <ul className="space-y-4">
                        {company.preparationTips.map((tip: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-foreground">
                            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                              {i + 1}
                            </div>
                            <span className="leading-relaxed">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* FAQs / Interview Questions */}
                {company.faqs && company.faqs.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold tracking-tight mb-6">Frequently Asked Interview Questions</h2>
                    <Accordion type="single" className="w-full">
                      {company.faqs.map((faq: any, index: number) => (
                        <AccordionItem key={faq._id || index} value={`q${index}`}>
                          <AccordionTrigger className="text-left font-medium text-base">{faq.question}</AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}

              </div>

              {/* Right Column - Sticky Sidebar */}
              <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 lg:sticky lg:top-24 space-y-6">
                
                {company.salaryRange && (
                  <div className="rounded-2xl border bg-surface p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Quick Facts</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Estimated Salary</p>
                        <p className="font-semibold">
                          ₹{company.salaryRange.min}{company.salaryRange.max ? ` - ₹${company.salaryRange.max}` : '+'} {company.salaryRange.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {company.eligibilityCriteria && (
                  <div className="rounded-2xl border bg-surface p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Eligibility</h3>
                    <div className="space-y-4">
                      {company.eligibilityCriteria.minimumCgpa > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Minimum CGPA</p>
                          <p className="font-semibold">{company.eligibilityCriteria.minimumCgpa} / 10</p>
                        </div>
                      )}
                      {company.eligibilityCriteria.allowedBranches?.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase mb-2">Allowed Branches</p>
                          <div className="flex flex-wrap gap-2">
                            {company.eligibilityCriteria.allowedBranches.map((branch: string, i: number) => (
                              <Badge key={i} variant="secondary" className="bg-background">{branch}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {company.eligibilityCriteria.requiredSkills?.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase mb-2">Required Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {company.eligibilityCriteria.requiredSkills.map((skill: string, i: number) => (
                              <Badge key={i} variant="outline" className="bg-background border-border/50">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {company.jobRoles && company.jobRoles.length > 0 && (
                  <div className="rounded-2xl border bg-surface p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Related Job Roles</h3>
                    <div className="space-y-3">
                      {company.jobRoles.map((role: any) => (
                        <Link key={role._id} href={`/job-roles/${role.slug || role._id}`} className="block p-3 rounded-lg border bg-background hover:border-primary/50 transition-colors">
                          <p className="font-semibold text-sm">{role.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">View Guide</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {company.jobOpenings && company.jobOpenings.length > 0 && (
                  <div className="rounded-2xl border bg-surface p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Related Open Jobs ({company.jobOpenings.length})</h3>
                    <div className="space-y-4">
                      {company.jobOpenings.slice(0, 3).map((job: any) => (
                        <Link key={job._id} href={`/jobs/${job._id}`} className="block group">
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">{job.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Briefcase className="h-3 w-3" /> {job.location || 'Remote'}
                          </p>
                        </Link>
                      ))}
                      {company.jobOpenings.length > 3 && (
                        <Button variant="outline" className="w-full text-xs h-9 mt-2" asChild>
                          <Link href={`/jobs?company=${company.slug}`}>View all jobs</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 rounded-full bg-background/50 backdrop-blur"
                    onClick={() => toggleBookmark()}
                    disabled={isTogglingBookmark}
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
                    {isBookmarked ? "Saved" : "Save"}
                  </Button>
                  <Button variant="secondary" className="flex-1 gap-2" onClick={handleShare}>
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>
                
              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
