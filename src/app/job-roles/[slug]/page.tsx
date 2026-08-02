"use client"

import React from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { PublicLayout } from "@/components/layout/public-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Monitor, Code, Brain, Cloud, Shield, Cpu, Smartphone,
  Palette, Network, Database, BookmarkPlus, Share2, IndianRupee,
  TrendingUp, Briefcase, BookOpen, ChevronRight,
  CheckCircle2, XCircle, GitFork, Clock, ArrowRight, Layers,
  Star, Bookmark
} from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import type { JobRoleDetail, JobRoleListItem, PopulatedCompany, PopulatedProject } from "@/types/job-role"
import { RoleCard } from "@/components/career/job-role/role-card"
import { Breadcrumb } from "@/components/shared/breadcrumb"
import { ErrorState } from "@/components/shared/error-state"
import { FeaturedBadge } from "@/components/shared/publish-badge"
import { formatSalary } from "@/lib/utils"
import { useToggleBookmark, useIsBookmarked } from "@/hooks/useBookmarks"
import { toast } from "sonner"

// Icon map by category
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Software Development": Code,
  "Artificial Intelligence": Brain,
  "Data Science": TrendingUp,
  "Cloud & DevOps": Cloud,
  "Cybersecurity": Shield,
  "Embedded Systems": Cpu,
  "Mobile Development": Smartphone,
  "UI/UX Design": Palette,
  "Networking": Network,
  "Database Administration": Database,
}

const DIFFICULTY_COLORS = {
  Beginner: "bg-success/10 text-success border-success/20",
  Intermediate: "bg-warning/10 text-warning border-warning/20",
  Advanced: "bg-destructive/10 text-destructive border-destructive/20",
}

// Quick-nav sections
const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "responsibilities", label: "Responsibilities" },
  { id: "skills", label: "Skills" },
  { id: "roadmap", label: "Learning Roadmap" },
  { id: "interview", label: "Interview Topics" },
  { id: "projects", label: "Projects" },
  { id: "companies", label: "Companies" },
  { id: "resume", label: "Resume Guide" },
]

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

export default function JobRoleDetailsPage() {
  const params = useParams()
  const slug = params?.slug as string

  const { data: role, isLoading, isError, refetch } = useQuery<JobRoleDetail>({
    queryKey: ["public-job-role", slug],
    queryFn: async () => {
      const response = await api.get(`/job-roles/${slug}`)
      return response.data?.data || response.data
    },
    enabled: !!slug,
  })

  const isBookmarked = useIsBookmarked(role?._id)
  const { mutate: toggleBookmark, isPending: isTogglingBookmark } = useToggleBookmark(role?._id || "", "role")

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied to clipboard!")
  }

  const { data: relatedRoles } = useQuery<JobRoleListItem[]>({
    queryKey: ["public-job-role-related", slug],
    queryFn: async () => {
      const response = await api.get(`/job-roles/${slug}/related`)
      return response.data?.data || response.data
    },
    enabled: !!slug && !isLoading && !isError,
  })

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="bg-background min-h-screen">
          <div className="bg-surface border-b py-12 md:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Skeleton className="h-5 w-48 mb-6" />
              <Skeleton className="h-14 w-3/4 mb-4" />
              <Skeleton className="h-6 w-full max-w-2xl" />
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex gap-12">
              <div className="flex-1 space-y-8">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-48 w-full rounded-2xl" />
              </div>
              <div className="w-80 space-y-6">
                <Skeleton className="h-48 rounded-2xl" />
                <Skeleton className="h-36 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    )
  }

  if (isError || !role) {
    return (
      <PublicLayout>
        <div className="bg-background min-h-screen flex flex-col items-center justify-center py-24 px-4">
          <ErrorState
            title="Job Role Not Found"
            message="The role you are looking for doesn't exist or may have been removed."
            onRetry={() => refetch()}
            action={{ label: "Browse All Roles", onClick: () => window.location.href = "/job-roles" }}
            className="max-w-lg w-full"
          />
        </div>
      </PublicLayout>
    )
  }

  const Icon = CATEGORY_ICONS[role.category] ?? Monitor
  const salaryDisplay = formatSalary(role.salaryInfo, role.salaryRange)

  return (
    <PublicLayout>
      <div className="bg-background min-h-screen">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="bg-surface border-b py-10 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <Breadcrumb
              className="mb-6"
              items={[
                { label: "Home", href: "/" },
                { label: "Job Roles", href: "/job-roles" },
                { label: role.title },
              ]}
            />

            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                <Icon className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="secondary">{role.category}</Badge>
                  {role.experienceLevel && (
                    <Badge variant="outline" className="bg-background">{role.experienceLevel}</Badge>
                  )}
                  <FeaturedBadge isFeatured={role.isFeatured} />
                  {role.estimatedLearningTime && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {role.estimatedLearningTime}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
                  {role.title}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  {role.shortDescription}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Body ─────────────────────────────────────────────── */}
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 relative items-start">

              {/* ── Left Column ─────────────────────────── */}
              <div className="flex-1 min-w-0 space-y-14">

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl border bg-surface flex flex-col gap-1.5 shadow-sm">
                    <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                      <IndianRupee className="h-3.5 w-3.5" /> Avg Salary
                    </span>
                    <span className="text-2xl font-bold">{salaryDisplay}</span>
                    {role.salaryInfo && (
                      <span className="text-xs text-muted-foreground">{role.salaryInfo.country} · {role.salaryInfo.currency}</span>
                    )}
                  </div>
                  <div className="p-5 rounded-2xl border bg-surface flex flex-col gap-1.5 shadow-sm">
                    <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" /> Companies Hiring
                    </span>
                    <span className="text-2xl font-bold">{role.companiesHiring?.length || 0}+</span>
                    <span className="text-xs text-muted-foreground">on Kredl</span>
                  </div>
                  <div className="p-5 rounded-2xl border bg-surface flex flex-col gap-1.5 shadow-sm">
                    <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-success" /> Career Growth
                    </span>
                    <span className="text-2xl font-bold">High Demand</span>
                    <span className="text-xs text-muted-foreground">{role.requiredSkills?.length || 0} key skills</span>
                  </div>
                </div>

                {/* Structured Salary (if available) */}
                {role.salaryInfo && (
                  <div id="salary" className="p-6 rounded-2xl border bg-surface shadow-sm">
                    <h2 className="text-xl font-bold mb-5 flex items-center gap-2"><IndianRupee className="h-5 w-5 text-primary" /> Salary Overview</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl border bg-background text-center">
                        <div className="text-xs text-muted-foreground font-semibold uppercase mb-2">Fresher</div>
                        <div className="text-xl font-bold text-success">{role.salaryInfo.fresherRange}</div>
                      </div>
                      <div className="p-4 rounded-xl border bg-primary/5 border-primary/20 text-center">
                        <div className="text-xs text-muted-foreground font-semibold uppercase mb-2">Average</div>
                        <div className="text-xl font-bold text-primary">{role.salaryInfo.averageSalary}</div>
                      </div>
                      <div className="p-4 rounded-xl border bg-background text-center">
                        <div className="text-xs text-muted-foreground font-semibold uppercase mb-2">Experienced</div>
                        <div className="text-xl font-bold">{role.salaryInfo.experiencedRange}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overview */}
                <div id="overview">
                  <h2 className="text-2xl font-bold tracking-tight mb-4">Role Overview</h2>
                  <p className="text-muted-foreground leading-relaxed text-base">{role.description}</p>
                </div>

                {/* Responsibilities */}
                {role.responsibilities && role.responsibilities.length > 0 && (
                  <div id="responsibilities">
                    <h2 className="text-2xl font-bold tracking-tight mb-5">Responsibilities</h2>
                    <ul className="space-y-3 text-muted-foreground">
                      {role.responsibilities.map((res, i) => (
                        <li key={i} className="flex items-start gap-3 bg-surface border rounded-xl p-4">
                          <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                          </div>
                          <p>{res}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skills */}
                {((role.requiredSkills?.length ?? 0) > 0 || (role.preferredSkills?.length ?? 0) > 0) && (
                  <div id="skills">
                    <h2 className="text-2xl font-bold tracking-tight mb-6">Skills</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {role.requiredSkills && role.requiredSkills.length > 0 && (
                        <div>
                          <h3 className="text-base font-bold mb-3 text-foreground">Required Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {role.requiredSkills.map((skill, i) => (
                              <Badge key={i} className="px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {role.preferredSkills && role.preferredSkills.length > 0 && (
                        <div>
                          <h3 className="text-base font-bold mb-3 text-foreground">Preferred Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {role.preferredSkills.map((skill, i) => (
                              <Badge key={i} variant="outline" className="px-3 py-1">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Learning Roadmap */}
                {role.roadmap && role.roadmap.length > 0 && (
                  <div id="roadmap">
                    <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
                      <Layers className="h-6 w-6 text-primary" /> Learning Roadmap
                    </h2>
                    <div className="relative pl-8">
                      {/* Vertical line */}
                      <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />
                      <div className="space-y-6">
                        {role.roadmap.map((step, i) => (
                          <div key={i} className="relative">
                            {/* Step circle */}
                            <div className="absolute -left-8 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground shadow-sm">
                              {i + 1}
                            </div>
                            <div className="bg-surface border rounded-xl p-5 shadow-sm">
                              <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div className="flex-1">
                                  <h3 className="font-bold text-base mb-1">{step.title}</h3>
                                  <p className="text-sm text-muted-foreground">{step.description}</p>
                                </div>
                                <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                                  <Clock className="h-3.5 w-3.5" />
                                  {step.durationWeeks}w
                                </div>
                              </div>
                              {(step.courseId || step.moduleId) && (
                                <div className="mt-3 flex gap-2 flex-wrap">
                                  {step.courseId && (
                                    <Link
                                      href={`/courses/${step.courseId.slug}`}
                                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                                    >
                                      <BookOpen className="h-3.5 w-3.5" />
                                      {step.courseId.title}
                                      <ArrowRight className="h-3 w-3" />
                                    </Link>
                                  )}
                                  {step.moduleId && (
                                    <Link
                                      href={`/courses/${step.courseId?.slug ?? "#"}/modules/${step.moduleId.slug}`}
                                      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary border px-3 py-1.5 rounded-full hover:bg-muted transition-colors"
                                    >
                                      <Layers className="h-3.5 w-3.5" />
                                      {step.moduleId.title}
                                    </Link>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Interview Topics */}
                {role.interviewTopics && Object.keys(role.interviewTopics).length > 0 && (
                  <div id="interview">
                    <h2 className="text-2xl font-bold tracking-tight mb-6">Interview Topics</h2>
                    <Accordion className="w-full" type="multiple">
                      {Object.entries(role.interviewTopics).map(([topic, items], i) => (
                        <AccordionItem value={`topic-${i}`} key={i} className="border rounded-xl mb-3 px-4 overflow-hidden">
                          <AccordionTrigger className="text-left font-bold text-base py-4 hover:no-underline">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                              {topic}
                              <Badge variant="secondary" className="ml-2 text-xs">{(items as string[]).length}</Badge>
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(items as string[]).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}

                {/* Recommended Projects */}
                {role.recommendedProjects && role.recommendedProjects.length > 0 && (
                  <div id="projects">
                    <h2 className="text-2xl font-bold tracking-tight mb-6">Recommended Projects</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {role.recommendedProjects.map((project) => {
                        const p = project as PopulatedProject
                        return (
                          <div key={p._id} className="p-5 border rounded-2xl bg-surface flex flex-col hover:border-primary/50 transition-colors shadow-sm">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-bold text-base leading-tight">{p.title}</h4>
                              <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full shrink-0 ml-2 ${DIFFICULTY_COLORS[p.difficulty as keyof typeof DIFFICULTY_COLORS] ?? ""}`}>
                                {p.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 flex-1">{p.shortDescription}</p>
                            {p.technologies && p.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {p.technologies.slice(0, 4).map((tech, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{tech}</Badge>
                                ))}
                                {p.technologies.length > 4 && (
                                  <Badge variant="outline" className="text-xs">+{p.technologies.length - 4}</Badge>
                                )}
                              </div>
                            )}
                            {p.repositoryUrl && (
                              <a
                                href={p.repositoryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground mt-auto transition-colors"
                              >
                                <GitFork className="h-3.5 w-3.5" /> View on GitHub
                              </a>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* CTA — Courses */}
                <div className="p-8 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold mb-1">Ready to become a {role.title}?</h3>
                    <p className="text-muted-foreground text-sm">
                      Explore structured courses designed to teach these exact skills.
                    </p>
                  </div>
                  <Button asChild className="shrink-0 h-11 px-6 font-semibold">
                    <Link href="/courses">
                      View Courses <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {/* Related Roles */}
                {relatedRoles && relatedRoles.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-6">Related Job Roles</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {relatedRoles.map((rel) => (
                        <RoleCard
                          key={rel._id}
                          id={rel._id}
                          slug={rel.slug}
                          title={rel.title}
                          description={rel.shortDescription}
                          category={rel.category}
                          experienceLevel={rel.experienceLevel}
                          salaryInfo={rel.salaryInfo}
                          salaryRange={rel.salaryRange}
                          skillsCount={rel.requiredSkills?.length || 0}
                          companiesHiringCount={rel.companiesHiring?.length || 0}
                          isFeatured={rel.isFeatured}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right Sidebar (sticky) ─────────────────── */}
              <div className="w-full lg:w-[340px] xl:w-[360px] shrink-0 lg:sticky lg:top-24 space-y-5">

                {/* Quick Nav */}
                <div className="rounded-2xl border bg-surface p-5 shadow-sm">
                  <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-3">Jump to Section</h3>
                  <nav className="space-y-1">
                    {SECTIONS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => scrollTo(s.id)}
                        className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-primary/10 hover:text-primary font-medium transition-colors text-muted-foreground"
                      >
                        {s.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-3">
                  <Button className="w-full h-11 font-semibold" asChild>
                    <Link href={`/jobs?role=${encodeURIComponent(role.title)}`}>
                      <Briefcase className="h-4 w-4 mr-2" /> View Open Jobs
                    </Link>
                  </Button>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => toggleBookmark()}
                      disabled={isTogglingBookmark}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`} /> 
                      {isBookmarked ? "Saved" : "Save"}
                    </Button>
                    <Button variant="secondary" className="flex-1 gap-2" onClick={handleShare}>
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                  </div>
                </div>

                {/* Preparedness */}
                <div className="rounded-2xl border bg-surface p-5 shadow-sm">
                  <h3 className="font-bold text-base mb-4">Your Preparedness</h3>
                  <div>
                    <div className="flex justify-between items-center text-sm font-medium mb-2 text-muted-foreground">
                      <span>Skills match</span>
                      <span className="text-foreground font-bold">0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Complete courses to improve your score.
                    </p>
                  </div>
                </div>

                {/* Companies Hiring */}
                {role.companiesHiring && role.companiesHiring.length > 0 && (
                  <div id="companies" className="rounded-2xl border bg-surface p-5 shadow-sm">
                    <h3 className="font-bold text-base mb-4">Companies Hiring</h3>
                    <div className="space-y-2.5">
                      {role.companiesHiring.map((company) => {
                        const c = company as PopulatedCompany
                        return (
                          <Link
                            key={c._id}
                            href={`/companies/${c.slug ?? c._id}`}
                            className="flex items-center justify-between p-3 rounded-xl border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              {c.logo ? (
                                <img src={c.logo} alt={c.name} className="h-8 w-8 object-contain rounded-lg border" />
                              ) : (
                                <div className="h-8 w-8 bg-secondary rounded-lg flex items-center justify-center text-xs font-bold text-muted-foreground border">
                                  {c.name?.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-sm leading-tight">{c.name}</p>
                                {c.eligibilityCriteria?.minimumCgpa && (
                                  <p className="text-xs text-muted-foreground">CGPA ≥ {c.eligibilityCriteria.minimumCgpa}</p>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Resume Guidance */}
                {role.resumeGuidance && (
                  <div id="resume" className="rounded-2xl border bg-surface p-5 shadow-sm">
                    <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-warning">
                      <BookOpen className="h-5 w-5" /> Resume Guidance
                    </h3>

                    {role.resumeGuidance.resumeChecklist && role.resumeGuidance.resumeChecklist.length > 0 && (
                      <>
                        <h4 className="font-semibold text-sm mb-2 text-foreground">Checklist</h4>
                        <ul className="space-y-1.5 mb-4">
                          {role.resumeGuidance.resumeChecklist.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {role.resumeGuidance.commonMistakes && role.resumeGuidance.commonMistakes.length > 0 && (
                      <>
                        <h4 className="font-semibold text-sm mb-2 text-foreground">Common Mistakes</h4>
                        <ul className="space-y-1.5">
                          {role.resumeGuidance.commonMistakes.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
