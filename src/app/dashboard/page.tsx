"use client"

import React, { useState } from "react"
import { Flame, CheckCircle2, GraduationCap, Building2, Briefcase, BookOpen, Clock, X, Info } from "lucide-react"
import { CareerProgressCard } from "@/components/student/career-progress-card"
import { DynamicContinueLearningCard } from "@/components/student/dynamic-continue-learning-card"
import { RecommendedNextStepCard } from "@/components/student/recommended-next-step-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { useAuthStore } from "@/store/auth.store"
import { useDashboard } from "@/hooks/useDashboard"
import { EnrolledCourseCard } from "@/components/student/enrolled-course-card"
import { useDashboardProgress } from "@/hooks/useProgress"

import { Loader2, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: dashboardData, isLoading, isError } = useDashboard()
  const { data: enrolledCourses, isLoading: isCoursesLoading } = useDashboardProgress()

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !dashboardData) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">Failed to load your dashboard.</p>
      </div>
    )
  }

  const { progress, recentActivity } = dashboardData

  return (
    <>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName || 'Student'}!</h1>
            <p className="text-muted-foreground mt-1">Here is your career preparation command center.</p>
          </div>
          <div className="flex items-center gap-2 bg-orange-500/10 text-orange-600 px-4 py-2 rounded-full font-medium text-sm border border-orange-500/20 shadow-sm">
            <Flame className="h-4 w-4 fill-orange-600" />
            {progress.learningStreak} Day Learning Streak
          </div>
        </section>

        {/* Career Progression Metrics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-left p-4 border rounded-xl bg-background shadow-sm flex flex-col gap-1 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground font-medium text-xs uppercase tracking-wider mb-2 w-full">
              <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> Career Readiness</span>
              <Info className="h-3.5 w-3.5" />
            </div>
            <div className="text-2xl font-bold text-primary">{progress.overallProgress}%</div>
          </div>
          <div className="p-4 border rounded-xl bg-background shadow-sm flex flex-col gap-1 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground font-medium text-xs uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> Modules</span>
            </div>
            <div className="text-2xl font-bold">{progress.modulesCompleted}</div>
          </div>
          <div className="p-4 border rounded-xl bg-background shadow-sm flex flex-col gap-1 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground font-medium text-xs uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Courses</span>
            </div>
            <div className="text-2xl font-bold">{progress.coursesCompleted}</div>
          </div>
          <div className="p-4 border rounded-xl bg-background shadow-sm flex flex-col gap-1 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between text-muted-foreground font-medium text-xs uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Hours Learned</span>
            </div>
            <div className="text-2xl font-bold">{progress.hoursLearned || 0}</div>
          </div>
        </section>

        {/* Hero Progression */}
        <section>
          <CareerProgressCard 
            careerGoal={dashboardData.profile.role === "STUDENT" || dashboardData.profile.role === "Student" ? "Student Path" : dashboardData.profile.role}
            overallProgress={progress.overallProgress}
            currentModule={dashboardData.continueLearning?.moduleTitle || "Browse Courses to Begin"}
            nextModule={dashboardData.continueLearning?.nextLesson?.title || "Explore Library"}
            currentProject={progress.activeProject || "N/A"}
            estimatedCompletion={progress.estimatedCompletion || "N/A"}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            

            {/* Enrolled Courses Section */}
            {enrolledCourses && enrolledCourses.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-lg tracking-tight">My Enrolled Courses</h2>
                  <Link href="/courses" className="text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm px-1 -mx-1">
                    Browse More
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {enrolledCourses.map((course) => (
                    <EnrolledCourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <h2 className="font-bold text-lg tracking-tight">Recommended For You</h2>
              {dashboardData.recommendedCourses && dashboardData.recommendedCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dashboardData.recommendedCourses.slice(0, 4).map((course: any) => (
                    <RecommendedNextStepCard 
                      key={course.courseId}
                      title={course.title}
                      description={course.description || "Start learning this new skill."}
                      actionLabel="View Course"
                      actionHref={`/courses/${course.courseId}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 border rounded-xl bg-background shadow-sm text-center">
                  <p className="text-muted-foreground">Complete more lessons to get personalized course recommendations.</p>
                </div>
              )}
            </section>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">

            {/* Streamlined Recent Activity */}
            <section className="p-6 border rounded-xl bg-background shadow-sm">
              <h2 className="font-bold text-lg tracking-tight mb-6">Recent Activity</h2>
              <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={activity.activityId} className={`relative flex items-start gap-4 ${index !== recentActivity.length - 1 ? 'mb-6' : ''}`}>
                      <div className="h-5 w-5 rounded-full border-2 border-background bg-primary shrink-0 z-10 flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground pl-8">No recent activity found.</div>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </>
  )
}
