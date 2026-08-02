"use client"

import React from "react"
import { TpoLayout } from "@/components/layout/tpo-layout"
import { Users, UserCheck, Percent, Briefcase, ArrowUpRight, Megaphone, Target, ArrowRight, AlertCircle, RefreshCw, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTpoDashboard } from "@/hooks/useTpoDashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function TpoDashboardPage() {
  const { data, isLoading, isError, refetch } = useTpoDashboard()
  
  const STATS = [
    { label: "Total Students", value: data?.stats?.totalStudents?.toLocaleString() || "0", icon: Users, trend: "+12%", trendUp: true, key: "totalStudents" },
    { label: "Students Placed", value: data?.stats?.placedStudents?.toLocaleString() || "0", icon: UserCheck, trend: "+5%", trendUp: true, key: "placedStudents" },
    { label: "Placement Rate", value: data?.stats?.placementRate || "0%", icon: Percent, trend: "+2.1%", trendUp: true, key: "placementRate" },
    { label: "Active Drives", value: data?.stats?.activeDrives?.toLocaleString() || "0", icon: Briefcase, trend: "-2", trendUp: false, key: "activeDrives" },
  ]

  return (
    <TpoLayout>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TPO Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of placement activities and student metrics.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" className="gap-2">
            <Megaphone className="h-4 w-4" /> Add Announcement
          </Button>
          <Button className="gap-2 bg-primary">
            <Briefcase className="h-4 w-4" /> Create Drive
          </Button>
        </div>
      </div>

      {isError && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center justify-between mb-8 border border-destructive/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">Failed to load dashboard data. Some information may be unavailable.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-destructive/20 hover:bg-destructive/20 text-destructive">
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat, i) => (
          <div key={i} className="bg-background border rounded-2xl p-6 shadow-sm hover:border-primary/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                stat.trendUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              }`}>
                {stat.trend} <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
            <div>
              {isLoading ? (
                <Skeleton className="h-9 w-20 mb-1" />
              ) : (
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
              )}
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Charts Placeholder */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-background border rounded-2xl p-6 shadow-sm h-[420px] flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-lg font-bold">Placement Trends</h2>
              <select className="text-sm border-none bg-transparent font-medium focus:ring-0 cursor-pointer text-muted-foreground" disabled>
                <option>This Year (2026)</option>
              </select>
            </div>
            
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[2px]">
              <div className="bg-background border shadow-lg rounded-xl p-6 text-center max-w-sm mx-auto">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">Insufficient Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Placement trend visualizations require more historical data to generate meaningful insights. Check back later when more drives have completed.
                </p>
                <Button variant="outline" className="w-full">View Raw Reports</Button>
              </div>
            </div>

            {/* Muted background chart for visual context */}
            <div className="h-[300px] w-full flex items-end justify-between gap-2 px-2 border-b border-l border-muted pt-4 pb-0 relative opacity-20 filter grayscale">
              <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] text-muted-foreground -ml-6 py-2">
                <span>100%</span>
                <span>50%</span>
                <span>0%</span>
              </div>
              {[40, 60, 55, 75, 80, 85, 90, 88, 92, 95, 96, 98].map((height, i) => (
                <div key={i} className="w-full bg-primary/20 rounded-t-sm" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="space-y-8">
          <div className="bg-background border rounded-2xl p-6 shadow-sm h-[420px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Recent Activity</h2>
              <Button variant="ghost" size="sm" className="text-primary h-auto p-0 hover:bg-transparent">View All</Button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="space-y-2 flex-1 pt-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : data?.recentActivity && data.recentActivity.length > 0 ? (
                <div className="relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border space-y-6">
                  {data.recentActivity.map((activity) => {
                    let Icon = Target
                    let colorClass = "bg-primary text-primary-foreground"
                    if (activity.type === "drive") { Icon = Briefcase; colorClass = "bg-warning text-warning-foreground" }
                    if (activity.type === "student") { Icon = UserCheck; colorClass = "bg-success text-success-foreground" }
                    if (activity.type === "announcement") { Icon = Megaphone; colorClass = "bg-destructive text-destructive-foreground" }

                    return (
                      <div key={activity.id} className="relative flex items-start gap-4">
                        <div className={`h-8 w-8 rounded-full border-2 border-background flex items-center justify-center shrink-0 z-10 shadow-sm ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col mt-1">
                          <span className="text-sm font-bold leading-none mb-1">{activity.title}</span>
                          <span className="text-xs text-muted-foreground mb-1">{activity.description}</span>
                          <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">{activity.timestamp}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Target className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">No recent activity found.</p>
                </div>
              )}
            </div>

            <Button variant="outline" className="w-full mt-4 gap-2 group shrink-0">
              View Activity Log <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
      
    </TpoLayout>
  )
}
